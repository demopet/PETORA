-- ============================================
-- AUTH FUNCTIONS
-- ============================================

-- ============================================
-- HELPER FUNCTIONS (idempotent re-creation)
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_owner(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT get_user_role(p_user_id) = 'OWNER';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT get_user_role(p_user_id) IN ('OWNER', 'ADMIN');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- LOCKOUT & LOGIN STATE MANAGEMENT
-- ============================================

-- Check lockout status for a username
CREATE OR REPLACE FUNCTION fn_check_lockout(p_username TEXT)
RETURNS TABLE(
  user_id UUID,
  is_locked BOOLEAN,
  locked_until TIMESTAMPTZ,
  failed_attempts INTEGER,
  is_active BOOLEAN,
  pin_hash TEXT
) AS $$
  SELECT id,
    (locked_until IS NOT NULL AND locked_until > NOW()),
    locked_until,
    failed_login_attempts,
    is_active,
    pin_hash
  FROM users
  WHERE username = p_username;
$$ LANGUAGE sql SECURITY DEFINER;

-- Record a failed login attempt
CREATE OR REPLACE FUNCTION fn_record_failed_login(p_user_id UUID)
RETURNS VOID AS $$
  UPDATE users
  SET failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE
        WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
        ELSE locked_until
      END,
      updated_at = NOW()
  WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Record a successful login
CREATE OR REPLACE FUNCTION fn_record_successful_login(p_user_id UUID)
RETURNS VOID AS $$
  UPDATE users
  SET failed_login_attempts = 0,
      locked_until = NULL,
      last_login_at = NOW(),
      updated_at = NOW()
  WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- USER MANAGEMENT (called by Edge Functions)
-- ============================================

-- Create a new user (Edge Function handles PIN hashing)
CREATE OR REPLACE FUNCTION fn_auth_create_user(
  p_username TEXT,
  p_pin_hash TEXT,
  p_role user_role,
  p_full_name TEXT,
  p_customer_id UUID DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
    RAISE EXCEPTION 'USERNAME_ALREADY_EXISTS' USING ERRCODE = '23505';
  END IF;

  IF p_role = 'OWNER' THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  INSERT INTO users (username, pin_hash, role, full_name, customer_id, created_by, is_active, failed_login_attempts)
  VALUES (p_username, p_pin_hash, p_role, p_full_name, p_customer_id, p_created_by, TRUE, 0)
  RETURNING id INTO v_user_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_created_by, 'CREATE_USER', 'users', v_user_id,
          jsonb_build_object('username', p_username, 'role', p_role, 'created_by', p_created_by));

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Change own PIN
CREATE OR REPLACE FUNCTION fn_auth_change_pin(
  p_user_id UUID,
  p_new_pin_hash TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET pin_hash = p_new_pin_hash,
      updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
  VALUES (p_user_id, 'CHANGE_PIN', 'users', p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset another user's PIN (admin/owner only)
CREATE OR REPLACE FUNCTION fn_auth_reset_pin(
  p_caller_id UUID,
  p_target_user_id UUID,
  p_new_pin_hash TEXT
)
RETURNS VOID AS $$
DECLARE
  v_caller_role user_role;
  v_target_role user_role;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;
  SELECT role INTO v_target_role FROM users WHERE id = p_target_user_id;

  IF v_target_role IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR') AND v_caller_role != 'OWNER' THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF v_target_role = 'CUSTOMER' AND v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF p_caller_id = p_target_user_id THEN
    RAISE EXCEPTION 'BAD_REQUEST' USING ERRCODE = '22000';
  END IF;

  UPDATE users
  SET pin_hash = p_new_pin_hash,
      failed_login_attempts = 0,
      locked_until = NULL,
      updated_at = NOW()
  WHERE id = p_target_user_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_caller_id, 'RESET_PIN', 'users', p_target_user_id,
          jsonb_build_object('reset_by', p_caller_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deactivate a user (admin/owner only)
CREATE OR REPLACE FUNCTION fn_auth_deactivate_user(
  p_caller_id UUID,
  p_target_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_caller_role user_role;
  v_target_role user_role;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;
  SELECT role INTO v_target_role FROM users WHERE id = p_target_user_id;

  IF v_target_role IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR') AND v_caller_role != 'OWNER' THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF v_target_role = 'CUSTOMER' AND v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  UPDATE users
  SET is_active = FALSE,
      updated_at = NOW()
  WHERE id = p_target_user_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
  VALUES (p_caller_id, 'DEACTIVATE_USER', 'users', p_target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
