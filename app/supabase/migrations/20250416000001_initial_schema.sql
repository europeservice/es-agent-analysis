-- ============================================
-- 001: Початкова схема (копія з crm/)
-- candidates + user_roles + RLS
-- ============================================

CREATE TABLE IF NOT EXISTS candidates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch            text,
  responsible       text,
  payment_type      text,
  registration_date date,
  first_name        text NOT NULL,
  last_name         text NOT NULL,
  phone             text,
  age               integer,
  candidate_country text,
  vacancy_country   text,
  project_name      text,
  partner_number    text,
  arrival_date      date,
  transport         text,
  synchronizer      text,
  status_adm        text DEFAULT 'Новий',
  quality_submission boolean DEFAULT false,
  payment_amount    numeric(10,2),
  payment_status    text DEFAULT 'Не виплачено',
  bitrix_deal_id    text UNIQUE,
  -- Розширені поля від webhook
  group_id          text,
  payment_fee       numeric(10,2),
  comments          jsonb DEFAULT '[]',
  personal_details  jsonb DEFAULT '{}',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status_adm);
CREATE INDEX IF NOT EXISTS idx_candidates_branch ON candidates(branch);
CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_candidates_registration ON candidates(registration_date);
CREATE INDEX IF NOT EXISTS idx_candidates_bitrix ON candidates(bitrix_deal_id);

-- user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role    text NOT NULL CHECK (role IN ('head_admin', 'financier', 'admin')),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

-- get_user_role function
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;

-- update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'candidates_select') THEN
    CREATE POLICY "candidates_select" ON candidates FOR SELECT TO authenticated USING (get_user_role() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'candidates_insert') THEN
    CREATE POLICY "candidates_insert" ON candidates FOR INSERT TO authenticated WITH CHECK (get_user_role() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'candidates_update') THEN
    CREATE POLICY "candidates_update" ON candidates FOR UPDATE TO authenticated USING (get_user_role() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'candidates_delete') THEN
    CREATE POLICY "candidates_delete" ON candidates FOR DELETE TO authenticated USING (get_user_role() IN ('head_admin','director'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'user_roles_select') THEN
    CREATE POLICY "user_roles_select" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;
