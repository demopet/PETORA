-- ============================================
-- AUTH LOGIN / LOGOUT & PIN HASHING
-- ============================================

CREATE OR REPLACE FUNCTION fn_hash_pin(p_pin TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(p_pin, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_auth_login(p_username TEXT, p_pin TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
  v_session_token TEXT;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  SELECT id, username, pin_hash, role, full_name, customer_id, failed_login_attempts, locked_until, is_active, last_login_at, created_at, updated_at, created_by
  INTO v_user
  FROM users
  WHERE username = p_username;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_CREDENTIALS' USING ERRCODE = '28P01';
  END IF;

  IF v_user.locked_until IS NOT NULL AND v_user.locked_until > v_now THEN
    RAISE EXCEPTION 'ACCOUNT_LOCKED|locked_until:%', to_char(v_user.locked_until AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') USING ERRCODE = '42501';
  END IF;

  IF NOT v_user.is_active THEN
    RAISE EXCEPTION 'ACCOUNT_INACTIVE' USING ERRCODE = '42501';
  END IF;

  IF crypt(p_pin, v_user.pin_hash) != v_user.pin_hash THEN
    UPDATE users
    SET failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE WHEN failed_login_attempts + 1 >= 5 THEN v_now + INTERVAL '15 minutes' ELSE locked_until END,
        updated_at = v_now
    WHERE id = v_user.id;

    RAISE EXCEPTION 'INVALID_CREDENTIALS' USING ERRCODE = '28P01';
  END IF;

  UPDATE users
  SET failed_login_attempts = 0,
      locked_until = NULL,
      last_login_at = v_now,
      current_session_token = v_session_token,
      updated_at = v_now
  WHERE id = v_user.id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (v_user.id, 'LOGIN', 'users', v_user.id,
          jsonb_build_object('username', v_user.username, 'role', v_user.role, 'login_at', v_now, 'session_token', v_session_token));

  RETURN jsonb_build_object(
    'user', jsonb_build_object(
      'id', v_user.id,
      'username', v_user.username,
      'role', v_user.role,
      'full_name', v_user.full_name,
      'customer_id', v_user.customer_id,
      'created_by', v_user.created_by,
      'failed_login_attempts', 0,
      'locked_until', NULL,
      'is_active', v_user.is_active,
      'last_login_at', v_now,
      'created_at', v_user.created_at,
      'updated_at', v_now
    ),
    'session_token', v_session_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_auth_logout(p_session_token TEXT)
RETURNS VOID AS $$
BEGIN
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_auth_create_user(
  p_username TEXT,
  p_pin TEXT,
  p_role user_role,
  p_full_name TEXT,
  p_customer_id UUID DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_pin_hash TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
    RAISE EXCEPTION 'USERNAME_ALREADY_EXISTS' USING ERRCODE = '23505';
  END IF;

  IF p_role = 'OWNER' THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  v_pin_hash := fn_hash_pin(p_pin);

  INSERT INTO users (username, pin_hash, role, full_name, customer_id, created_by, is_active, failed_login_attempts)
  VALUES (p_username, v_pin_hash, p_role, p_full_name, p_customer_id, p_created_by, TRUE, 0)
  RETURNING id INTO v_user_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_created_by, 'CREATE_USER', 'users', v_user_id,
          jsonb_build_object('username', p_username, 'role', p_role, 'created_by', p_created_by));

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_auth_change_pin(
  p_user_id UUID,
  p_old_pin TEXT,
  p_new_pin TEXT
)
RETURNS VOID AS $$
DECLARE
  v_user RECORD;
  v_pin_hash TEXT;
BEGIN
  SELECT id, pin_hash INTO v_user FROM users WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_CREDENTIALS' USING ERRCODE = '28P01';
  END IF;

  IF crypt(p_old_pin, v_user.pin_hash) != v_user.pin_hash THEN
    RAISE EXCEPTION 'INVALID_OLD_PIN' USING ERRCODE = '28P01';
  END IF;

  v_pin_hash := fn_hash_pin(p_new_pin);

  UPDATE users
  SET pin_hash = v_pin_hash,
      updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
  VALUES (p_user_id, 'CHANGE_PIN', 'users', p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_auth_reset_pin(
  p_caller_id UUID,
  p_target_user_id UUID,
  p_new_pin TEXT
)
RETURNS VOID AS $$
DECLARE
  v_caller_role user_role;
  v_target_role user_role;
  v_pin_hash TEXT;
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

  v_pin_hash := fn_hash_pin(p_new_pin);

  UPDATE users
  SET pin_hash = v_pin_hash,
      failed_login_attempts = 0,
      locked_until = NULL,
      updated_at = NOW()
  WHERE id = p_target_user_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_caller_id, 'RESET_PIN', 'users', p_target_user_id,
          jsonb_build_object('reset_by', p_caller_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
