'use strict';

/**
 * Netlify Function: bx-webhook
 * Receives Bitrix24 automation trigger when a deal moves to stage C3:1
 * ("Подано на реєстрацію") and imports it into Supabase.
 *
 * Bitrix24 robot URL:
 *   https://europeserviceukraine.com.ua/.netlify/functions/bx-webhook?deal_id={=Document:ID}
 *
 * Required Netlify env vars:
 *   SUPABASE_SERVICE_KEY  — service_role key from Supabase → Project Settings → API
 *   (SUPABASE_URL is hardcoded below but can be overridden as env var)
 */

const BX_WEBHOOK  = 'https://europeservice.org.ua/rest/1/z3f1myjhkqgy42hc/';
const SB_URL      = process.env.SUPABASE_URL || 'https://yqiymimvwrrshtkeuhcy.supabase.co';
const SB_KEY      = process.env.SUPABASE_SERVICE_KEY ||
                    // fallback to anon key if service key not set (works if RLS allows inserts)
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaXltaW12d3Jyc2h0a2V1aGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjExMDQsImV4cCI6MjA5MTI5NzEwNH0.n_xLo1-r0KZyhQprbjrPQ_P4DCi_DESHjiLIxoQ1X_w';

// ── Bitrix24 enum maps (same as crm-preview.html) ─────────────────────────
const BX_CAND_COUNTRY = {'2221':'Україна','2222':'Чехія','2223':'Польща','2430':'Румунія','2591':'Литва','2835':'Словаччина','2836':'Нідерланди','2837':'Угорщина','2838':'Німеччина','2839':'інше'};
const BX_VAC_COUNTRY  = {'2805':'Польща','2806':'Чехія','2807':'Литва','2808':'Румунія','2809':'Німеччина','2810':'Угорщина','2811':'Словаччина','2812':'Нідерланди','2813':'Греція','2814':'Англія','4609':'Іспанія','4904':'Латвія','4978':'Франція','5000':'Італія','5248':'Хорватія'};
const BX_TRANSPORT    = {'2572':'Самостійно','2573':'Перевізник партнера','2574':'Перевізник ES','4882':'Рейсовий автобус'};
const BX_PAYMENT_TYPE = {'2792':'Платно','2793':'Кауція','2794':'Безкоштовно','2845':'Оплата по приїзду','2846':'Оплата з зп'};
const BX_REQUISITES   = {'4500':'ФОП Литвин','2789':'ФОП Курасов','2716':'ФОП Лисун','2712':'Оплата на сайті','4887':'Картка Котов ПУМБ','4886':'Картка Лисун Райфайзен','2847':'Польські реквізити','2231':'готівка','2833':'Карта директора','2230':'ТОВ "Європа Сервіс Україна"','2229':'Котов Монобанк','2227':'ФОП Котов А.П.','2228':'Котов ПриватБанк','5246':'ФОП Тестов'};

// ── Bitrix24 API ──────────────────────────────────────────────────────────
async function bxGet(method, params = {}) {
  const url = new URL(`${BX_WEBHOOK}${method}.json`);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) v.forEach((vi, i) => url.searchParams.append(`${k}[${i}]`, vi));
    else url.searchParams.set(k, String(v));
  }
  const r = await fetch(url.toString());
  const json = await r.json();
  if (json.error) throw new Error(json.error_description || json.error);
  return json.result;
}

async function bxPost(method, body = {}) {
  const r = await fetch(`${BX_WEBHOOK}${method}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await r.json();
  if (json.error) throw new Error(json.error_description || json.error);
  return json.result;
}

// ── Supabase REST (no SDK needed — native fetch) ──────────────────────────
function sbHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    'apikey': SB_KEY,
    'Authorization': `Bearer ${SB_KEY}`,
    ...extra,
  };
}

async function sbGet(path) {
  const r = await fetch(`${SB_URL}/rest/v1${path}`, { headers: sbHeaders() });
  const data = await r.json();
  if (r.status >= 300) throw new Error(JSON.stringify(data));
  return data;
}

async function sbInsert(table, row) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: sbHeaders({ 'Prefer': 'return=representation' }),
    body: JSON.stringify(row),
  });
  const data = await r.json();
  if (r.status >= 300) throw new Error(JSON.stringify(data));
  return Array.isArray(data) ? data[0] : data;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function calcAge(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age > 0 ? age : null;
}

async function fetchProductData(dealId) {
  try {
    const rows = await bxGet('crm.deal.productrows.get', { id: dealId });
    const serviceType = (rows || []).map(p => p.PRODUCT_NAME).filter(Boolean).join(', ');
    const amount = (rows || []).reduce((s, p) => s + (parseFloat(p.PRICE) || 0) * (parseFloat(p.QUANTITY) || 1), 0);
    return { service_type: serviceType, fee: amount || null };
  } catch (e) {
    console.warn('productrows fetch failed:', e.message);
    return { service_type: '', fee: null };
  }
}

async function fetchUser(userId) {
  try {
    const users = await bxGet('user.get', { 'ID[0]': userId });
    return (users || [])[0] || null;
  } catch (e) {
    console.warn('user fetch failed:', e.message);
    return null;
  }
}

async function fetchPartnerMap() {
  const map = {};
  try {
    const fields = await bxPost('crm.deal.userfield.list', { FILTER: { FIELD_NAME: 'UF_CRM_1621259911012' } });
    const field = (fields || [])[0];
    if (field && field.LIST) field.LIST.forEach(item => { map[String(item.ID)] = item.VALUE; });
  } catch (e) {
    console.warn('partnerMap fetch failed:', e.message);
  }
  return map;
}

async function isAlreadyImported(dealId) {
  try {
    const rows = await sbGet(`/candidates?select=id&personal_details->>bitrix_deal_id=eq.${dealId}&limit=1`);
    return Array.isArray(rows) && rows.length > 0;
  } catch { return false; }
}

async function getNextGroupNum() {
  try {
    const rows = await sbGet('/candidates?select=group_id&group_id=like.G*');
    let max = 0;
    (rows || []).forEach(r => {
      if (r.group_id && /^G\d+$/.test(r.group_id)) {
        const n = parseInt(r.group_id.slice(1));
        if (n > max) max = n;
      }
    });
    return max + 1;
  } catch { return 1; }
}

function buildRow({ contact = {}, deal, groupId, user, partnerMap, productData }) {
  const phones = contact.PHONE || [];
  const phone = phones[0] ? phones[0].VALUE : '';
  const pd = {};

  if (contact.UF_CRM_1583932297515) pd.passport_number     = contact.UF_CRM_1583932297515;
  if (contact.UF_CRM_1583932420)    pd.addr_full           = contact.UF_CRM_1583932420;
  if (contact.UF_CRM_1590062088244) pd.father_name_en      = contact.UF_CRM_1590062088244;
  if (contact.UF_CRM_1590062099682) pd.mother_name_en      = contact.UF_CRM_1590062099682;
  if (contact.UF_CRM_1590065082012) pd.passport_valid_from = contact.UF_CRM_1590065082012;
  if (contact.UF_CRM_1590065106016) pd.passport_valid_to   = contact.UF_CRM_1590065106016;
  if (contact.UF_CRM_1590065233017) pd.birth_place         = contact.UF_CRM_1590065233017;
  if (contact.UF_CRM_1590065684648) pd.size_shoes          = contact.UF_CRM_1590065684648;
  if (contact.UF_CRM_1590066021772) pd.addr_zip            = contact.UF_CRM_1590066021772;
  if (contact.UF_CRM_1590067284878) pd.height              = contact.UF_CRM_1590067284878;
  if (contact.UF_CRM_1598516665856) pd.foreign_phone       = contact.UF_CRM_1598516665856;
  if (contact.UF_CRM_62B5BEA041BC6) pd.birth_last_name_en  = contact.UF_CRM_62B5BEA041BC6;
  pd.bitrix_deal_id    = deal.ID;
  pd.bitrix_contact_id = contact.ID;

  pd.responsible_phone  = user ? (user.WORK_PHONE || user.PERSONAL_PHONE || '') : '';
  pd.service_type       = productData.service_type || '';
  pd.payment_requisites = BX_REQUISITES[String(deal.UF_CRM_1599226724392)] || '';

  const paymentFee = productData.fee != null
    ? productData.fee
    : (deal.UF_CRM_5E68F54E6A529 ? parseFloat(deal.UF_CRM_5E68F54E6A529) : null);

  return {
    group_id:          groupId || null,
    branch:            (user && user.WORK_POSITION) || null,
    responsible:       user ? `${user.NAME || ''} ${user.LAST_NAME || ''}`.trim() || null : null,
    payment_type:      BX_PAYMENT_TYPE[String(deal.UF_CRM_1648455313042)] || null,
    payment_fee:       paymentFee,
    registration_date: deal.BEGINDATE ? deal.BEGINDATE.split('T')[0] : null,
    first_name:        contact.NAME      || '',
    last_name:         contact.LAST_NAME || '',
    phone:             phone || null,
    age:               calcAge(contact.BIRTHDATE),
    candidate_country: BX_CAND_COUNTRY[String(deal.UF_CRM_1599049456837)] || null,
    vacancy_country:   BX_VAC_COUNTRY[String(deal.UF_CRM_1652443508655)]  || null,
    project_name:      (deal.UF_CRM_5E0E157BC1687 || '').trim() || null,
    partner_number:    partnerMap[String(deal.UF_CRM_1621259911012)] || null,
    arrival_date:      deal.UF_CRM_1583938977868 ? deal.UF_CRM_1583938977868.split('T')[0] : null,
    transport:         BX_TRANSPORT[String(deal.UF_CRM_1622814641187)] || null,
    status_adm:        'Подано на реєстрацію',
    quality_submission: false,
    payment_amount:    null,
    payment_status:    'Не виплачено',
    comments:          [],
    personal_details:  pd,
  };
}

// ── Main handler ──────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const respond = (code, body) => ({
    statusCode: code,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  try {
    // ── 1. Extract deal_id from request ──────────────────────────────────
    let dealId = (event.queryStringParameters || {}).deal_id;

    if (!dealId && event.body) {
      const ct = (event.headers['content-type'] || '').toLowerCase();
      if (ct.includes('application/json')) {
        const json = JSON.parse(event.body);
        dealId = String(json.deal_id || json['data[FIELDS][ID]'] || '');
      } else {
        const p = new URLSearchParams(event.body);
        dealId = p.get('deal_id') || p.get('data[FIELDS][ID]');
      }
    }

    if (!dealId) return respond(400, { error: 'missing deal_id' });

    // ── 2. Fetch deal and verify stage ───────────────────────────────────
    const deal = await bxGet('crm.deal.get', { id: dealId });
    if (!deal) return respond(404, { error: 'deal not found' });

    // Log all UF_ fields to help discover field IDs (e.g. "Назва вакансії")
    const ufFields = Object.entries(deal)
      .filter(([k, v]) => k.startsWith('UF_') && v)
      .map(([k, v]) => `${k}=${v}`);
    console.log(`[bx-webhook] deal ${dealId} UF fields:`, ufFields.join(' | '));

    if (deal.STAGE_ID !== 'C3:1') {
      return respond(200, { skipped: true, reason: `stage is ${deal.STAGE_ID}, expected C3:1` });
    }

    // ── 3. Duplicate check ───────────────────────────────────────────────
    if (await isAlreadyImported(dealId)) {
      return respond(200, { skipped: true, reason: 'already imported' });
    }

    // ── 4. Fetch all supporting data in parallel ─────────────────────────
    const [contactLinks, productData, user, partnerMap, nextGNum] = await Promise.all([
      bxGet('crm.deal.contact.items.get', { id: dealId }),
      fetchProductData(dealId),
      fetchUser(deal.ASSIGNED_BY_ID),
      fetchPartnerMap(),
      getNextGroupNum(),
    ]);

    const contacts = contactLinks || [];
    const groupId = contacts.length > 1 ? `G${nextGNum}` : null;
    const inserted = [];

    // ── 5. Import contacts ───────────────────────────────────────────────
    if (!contacts.length) {
      const row = buildRow({ deal, groupId: null, user, partnerMap, productData });
      row.first_name = deal.TITLE || '';
      const saved = await sbInsert('candidates', row);
      inserted.push(saved.id);
    } else {
      for (const link of contacts) {
        const contact = await bxGet('crm.contact.get', { id: link.CONTACT_ID });
        const row = buildRow({ contact, deal, groupId, user, partnerMap, productData });
        const saved = await sbInsert('candidates', row);
        inserted.push(saved.id);
      }
    }

    console.log(`[bx-webhook] deal ${dealId} → ${inserted.length} candidates inserted`, inserted);
    return respond(200, { success: true, deal_id: dealId, inserted: inserted.length, ids: inserted });

  } catch (e) {
    console.error('[bx-webhook] error:', e.message, e.stack);
    return respond(500, { error: e.message });
  }
};
