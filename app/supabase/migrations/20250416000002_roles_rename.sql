-- ============================================
-- 002: Перейменувати head_admin → director
-- Додати роль manager
-- ============================================

-- Крок 1: Видалити старий constraint
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Крок 2: Додати новий constraint з усіма ролями
ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('director', 'financier', 'admin', 'manager'));

-- Крок 3: Перейменувати існуючі записи
UPDATE user_roles SET role = 'director' WHERE role = 'head_admin';

-- Крок 4: Оновити функцію get_user_role (без змін логіки, але для ясності)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;

-- Крок 5: Оновити RLS policy для candidates_delete
DROP POLICY IF EXISTS "candidates_delete" ON candidates;
CREATE POLICY "candidates_delete" ON candidates
  FOR DELETE TO authenticated
  USING (get_user_role() = 'director');
