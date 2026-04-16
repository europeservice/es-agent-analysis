-- ============================================
-- 004: RLS політики для нових таблиць
-- ============================================

-- Увімкнути RLS
ALTER TABLE contacts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancy_arrivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitrix_sync_log ENABLE ROW LEVEL SECURITY;

-- ─── CONTACTS ───
CREATE POLICY "contacts_select" ON contacts
  FOR SELECT TO authenticated USING (get_user_role() IS NOT NULL);

CREATE POLICY "contacts_insert" ON contacts
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('director','admin','financier','manager'));

CREATE POLICY "contacts_update" ON contacts
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('director','admin','financier','manager'));

CREATE POLICY "contacts_delete" ON contacts
  FOR DELETE TO authenticated
  USING (get_user_role() = 'director');

-- ─── DEALS ───
CREATE POLICY "deals_select" ON deals
  FOR SELECT TO authenticated USING (get_user_role() IS NOT NULL);

CREATE POLICY "deals_insert" ON deals
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IS NOT NULL);

CREATE POLICY "deals_update" ON deals
  FOR UPDATE TO authenticated
  USING (get_user_role() IS NOT NULL);

CREATE POLICY "deals_delete" ON deals
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('director','admin'));

-- ─── PAYMENTS (тільки director + financier) ───
CREATE POLICY "payments_select" ON payments
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('director','financier'));

CREATE POLICY "payments_insert" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('director','financier'));

CREATE POLICY "payments_update" ON payments
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('director','financier'));

CREATE POLICY "payments_delete" ON payments
  FOR DELETE TO authenticated
  USING (get_user_role() = 'director');

-- ─── VACANCIES ───
CREATE POLICY "vacancies_select" ON vacancies
  FOR SELECT TO authenticated USING (get_user_role() IS NOT NULL);

CREATE POLICY "vacancies_insert" ON vacancies
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('director','admin'));

CREATE POLICY "vacancies_update" ON vacancies
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('director','admin'));

CREATE POLICY "vacancies_delete" ON vacancies
  FOR DELETE TO authenticated
  USING (get_user_role() = 'director');

CREATE POLICY "vacancy_arrivals_select" ON vacancy_arrivals
  FOR SELECT TO authenticated USING (get_user_role() IS NOT NULL);

CREATE POLICY "vacancy_arrivals_write" ON vacancy_arrivals
  FOR ALL TO authenticated
  USING (get_user_role() IN ('director','admin'))
  WITH CHECK (get_user_role() IN ('director','admin'));

-- ─── BRANCHES, PARTNERS, PIPELINES, STAGES (довідники) ───
-- Всі читають
CREATE POLICY "branches_select"  ON branches        FOR SELECT TO authenticated USING (true);
CREATE POLICY "partners_select"  ON partners        FOR SELECT TO authenticated USING (true);
CREATE POLICY "pipelines_select" ON pipelines       FOR SELECT TO authenticated USING (true);
CREATE POLICY "stages_select"    ON pipeline_stages FOR SELECT TO authenticated USING (true);

-- director + admin пишуть
CREATE POLICY "branches_write"   ON branches        FOR ALL TO authenticated
  USING (get_user_role() IN ('director','admin'))
  WITH CHECK (get_user_role() IN ('director','admin'));

CREATE POLICY "partners_write"   ON partners        FOR ALL TO authenticated
  USING (get_user_role() IN ('director','admin'))
  WITH CHECK (get_user_role() IN ('director','admin'));

CREATE POLICY "pipelines_write"  ON pipelines       FOR ALL TO authenticated
  USING (get_user_role() = 'director')
  WITH CHECK (get_user_role() = 'director');

CREATE POLICY "stages_write"     ON pipeline_stages FOR ALL TO authenticated
  USING (get_user_role() = 'director')
  WITH CHECK (get_user_role() = 'director');

-- ─── AUDIT LOG (read-only для authenticated) ───
CREATE POLICY "audit_select" ON audit_log
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('director','admin','financier'));

-- INSERT тільки через service_role (trigger або Edge Function)
-- (authenticated не може писати напряму)

-- ─── BITRIX SYNC LOG (тільки service_role) ───
-- authenticated не має доступу — тільки backend
