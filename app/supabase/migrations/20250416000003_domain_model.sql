-- ============================================
-- 003: Нова доменна модель
-- branches, partners, contacts, pipelines,
-- pipeline_stages, deals, payments,
-- vacancies, vacancy_arrivals,
-- audit_log, bitrix_sync_log
-- ============================================

-- ─────────────── ДОВІДНИКИ ───────────────

CREATE TABLE IF NOT EXISTS branches (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  code       text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

INSERT INTO branches (name, code) VALUES
  ('ЦО Київ', 'kyiv'),
  ('Одеса', 'odesa'),
  ('Рівне', 'rivne'),
  ('Житомир', 'zhytomyr'),
  ('Звягель', 'zvyahel')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS partners (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number     text UNIQUE NOT NULL,
  name       text NOT NULL,
  country    text,
  city       text,
  created_at timestamptz DEFAULT now()
);

-- ─────────────── КОНТАКТИ ───────────────

CREATE TABLE IF NOT EXISTS contacts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Основні
  first_name        text NOT NULL,
  last_name         text NOT NULL,
  phone             text,
  viber             text,
  telegram          text,
  foreign_phone     text,
  email             text,
  age               integer,
  birthdate         date,
  candidate_country text,
  -- Паспорт
  passport_type     text,
  passport_number   text,
  passport_series   text,
  passport_valid_from date,
  passport_valid_to date,
  passport_biometric boolean,
  birth_place       text,
  birth_last_name_en text,
  -- Адреса
  addr_country      text,
  addr_region       text,
  addr_city         text,
  addr_street       text,
  addr_building     text,
  addr_apartment    text,
  addr_zip          text,
  -- Розміри
  size_shirt        text,
  size_pants        text,
  size_shoes        text,
  height            integer,
  -- Додатково
  civil_status      text,
  pesel             text,
  father_name_en    text,
  mother_name_en    text,
  -- Екстрений контакт
  emergency_name    text,
  emergency_phone   text,
  -- Інтеграція
  bitrix_contact_id text UNIQUE,
  -- Довільні поля (для майбутнього розширення)
  extra             jsonb DEFAULT '{}',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_name  ON contacts(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_contacts_bitrix ON contacts(bitrix_contact_id);

CREATE OR REPLACE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────── ВОРОНКИ ───────────────

CREATE TABLE IF NOT EXISTS pipelines (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  type       text NOT NULL, -- employment | reserve | visa | other
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES pipelines ON DELETE CASCADE,
  name        text NOT NULL,
  order_pos   integer NOT NULL,
  is_success  boolean DEFAULT false,
  is_failure  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- Початкові воронки (відповідно до ТЗ розділ 05)
INSERT INTO pipelines (id, name, type) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Працевлаштування', 'employment'),
  ('00000000-0000-0000-0000-000000000002', 'Резерв', 'reserve'),
  ('00000000-0000-0000-0000-000000000003', 'Підготовка документів / Віза', 'visa')
ON CONFLICT DO NOTHING;

INSERT INTO pipeline_stages (pipeline_id, name, order_pos, is_success, is_failure) VALUES
  -- Працевлаштування
  ('00000000-0000-0000-0000-000000000001', 'Внесення даних',        1, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Подано на реєстрацію',  2, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Зареєстровано Adm',     3, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Підтверджено партнером',4, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Готовий до виїзду',     5, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Доїхав',                6, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Приступив до роботи',   7, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Відпрацював',           8, true,  false),
  ('00000000-0000-0000-0000-000000000001', 'Провалена',             9, false, true),
  ('00000000-0000-0000-0000-000000000001', 'Відмовився',           10, false, true),
  ('00000000-0000-0000-0000-000000000001', 'Не поїхав',            11, false, true),
  ('00000000-0000-0000-0000-000000000001', 'Не доїхав',            12, false, true),
  ('00000000-0000-0000-0000-000000000001', 'Не приступив',         13, false, true),
  ('00000000-0000-0000-0000-000000000001', 'Не відпрацював',       14, false, true),
  ('00000000-0000-0000-0000-000000000001', 'Резерв',               15, false, false),
  -- Резерв
  ('00000000-0000-0000-0000-000000000002', 'Внесення даних',        1, false, false),
  ('00000000-0000-0000-0000-000000000002', 'В резерві',             2, false, false),
  ('00000000-0000-0000-0000-000000000002', 'В резерві (без оплати)',3, false, false),
  ('00000000-0000-0000-0000-000000000002', 'Працевлаштувати',       4, true,  false),
  ('00000000-0000-0000-0000-000000000002', 'Відмовився',            5, false, true)
ON CONFLICT DO NOTHING;

-- ─────────────── УГОДИ ───────────────

CREATE TABLE IF NOT EXISTS deals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id         uuid REFERENCES contacts ON DELETE SET NULL,
  pipeline_id        uuid REFERENCES pipelines,
  stage_id           uuid REFERENCES pipeline_stages,
  branch_id          uuid REFERENCES branches,
  assigned_to        uuid REFERENCES auth.users,
  partner_id         uuid REFERENCES partners,
  group_id           text,
  payment_type       text,
  registration_date  date,
  arrival_date       date,
  transport          text,
  vacancy_country    text,
  project_name       text,
  synchronizer       text,
  quality_submission boolean,
  status_adm         text DEFAULT 'Новий',
  bitrix_deal_id     text UNIQUE,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_contact    ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage      ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_branch     ON deals(branch_id);
CREATE INDEX IF NOT EXISTS idx_deals_status     ON deals(status_adm);
CREATE INDEX IF NOT EXISTS idx_deals_bitrix     ON deals(bitrix_deal_id);
CREATE INDEX IF NOT EXISTS idx_deals_reg_date   ON deals(registration_date);

CREATE OR REPLACE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────── ФІНАНСИ ───────────────

CREATE TABLE IF NOT EXISTS payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id             uuid NOT NULL REFERENCES deals ON DELETE CASCADE,
  amount              numeric(10,2),
  fee                 numeric(10,2),
  status              text DEFAULT 'Не виплачено',
  service_type        text,
  payment_requisites  text,
  payment_date        date,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_deal ON payments(deal_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE OR REPLACE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────── ВАКАНСІЇ ───────────────

CREATE TABLE IF NOT EXISTS vacancies (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  company          text,
  city             text,
  nearest_city     text,
  country          text NOT NULL,
  partner_id       uuid REFERENCES partners,
  gender           text, -- male | female | any | couples
  hours_per_day    integer,
  monthly_salary   numeric(10,2),
  hourly_rate      numeric(10,2),
  max_age          integer,
  housing          boolean DEFAULT false,
  student_allowed  boolean DEFAULT false,
  status           text DEFAULT 'Активна', -- Активна | Заповнюється | Закрита
  stage_position   integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vacancies_country ON vacancies(country);
CREATE INDEX IF NOT EXISTS idx_vacancies_status  ON vacancies(status);

CREATE TABLE IF NOT EXISTS vacancy_arrivals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id    uuid NOT NULL REFERENCES vacancies ON DELETE CASCADE,
  arrival_date  date NOT NULL,
  slots_male    integer DEFAULT 0,
  slots_female  integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE OR REPLACE TRIGGER vacancies_updated_at
  BEFORE UPDATE ON vacancies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────── АУДИТ ───────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users ON DELETE SET NULL,
  table_name  text NOT NULL,
  record_id   uuid NOT NULL,
  action      text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_table   ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_user    ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

CREATE TABLE IF NOT EXISTS bitrix_sync_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    text,
  bitrix_id     text,
  status        text CHECK (status IN ('success','error','skipped')),
  error_message text,
  payload       jsonb,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bx_sync_created ON bitrix_sync_log(created_at);
CREATE INDEX IF NOT EXISTS idx_bx_sync_status  ON bitrix_sync_log(status);
