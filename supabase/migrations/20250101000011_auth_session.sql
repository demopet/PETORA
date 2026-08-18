-- ============================================
-- AUTH SESSION MANAGEMENT
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS current_session_token TEXT;

CREATE OR REPLACE FUNCTION fn_auth_validate_session(p_session_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT id, username, role, full_name, customer_id, created_by,
         failed_login_attempts, locked_until, is_active,
         last_login_at, created_at, updated_at
  INTO v_user
  FROM users
  WHERE current_session_token = p_session_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('user', NULL);
  END IF;

  IF NOT v_user.is_active THEN
    RETURN jsonb_build_object('user', NULL);
  END IF;

  RETURN jsonb_build_object(
    'user', jsonb_build_object(
      'id', v_user.id,
      'username', v_user.username,
      'role', v_user.role,
      'full_name', v_user.full_name,
      'customer_id', v_user.customer_id,
      'created_by', v_user.created_by,
      'failed_login_attempts', v_user.failed_login_attempts,
      'locked_until', v_user.locked_until,
      'is_active', v_user.is_active,
      'last_login_at', v_user.last_login_at,
      'created_at', v_user.created_at,
      'updated_at', v_user.updated_at
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_auth_logout(p_session_token TEXT)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM audit_logs
  WHERE action = 'LOGIN'
    AND new_values->>'session_token' = p_session_token
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    UPDATE users SET current_session_token = NULL WHERE id = v_user_id;

    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (v_user_id, 'LOGOUT', 'users', v_user_id,
            jsonb_build_object('session_token', p_session_token, 'logout_at', NOW()));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
