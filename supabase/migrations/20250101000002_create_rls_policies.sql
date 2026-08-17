-- ============================================
-- HELPER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM users WHERE id = p_user_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_owner(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(p_user_id) = 'OWNER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(p_user_id) IN ('OWNER', 'ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USERS TABLE RLS
-- ============================================
CREATE POLICY "Users can view all users" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Owner can create staff" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) = 'OWNER'
    AND role IN ('ADMIN', 'DOKTER', 'KASIR')
  );

CREATE POLICY "Owner or Admin can create customer" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('OWNER', 'ADMIN')
    AND role = 'CUSTOMER'
  );

CREATE POLICY "Users can update self" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Owner can update any user" ON users
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) = 'OWNER');

CREATE POLICY "Admin can update customers" ON users
  FOR UPDATE TO authenticated
  USING (
    get_user_role(auth.uid()) = 'ADMIN'
    AND role = 'CUSTOMER'
  );

CREATE POLICY "Owner can delete users" ON users
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) = 'OWNER');
