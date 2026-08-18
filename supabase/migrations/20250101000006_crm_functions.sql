-- ============================================
-- CRM RPC FUNCTIONS
-- ============================================
-- These functions provide controlled access to
-- customers and pets tables via RPC.
-- Uses SECURITY DEFINER with explicit caller_id
-- since custom PIN auth does not set auth.uid().
-- ============================================

-- ============================================
-- CUSTOMER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION fn_create_customer(
  p_caller_id UUID,
  p_name VARCHAR(100),
  p_phone VARCHAR(20) DEFAULT NULL,
  p_email VARCHAR(100) DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_emergency_contact VARCHAR(100) DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_is_guest BOOLEAN DEFAULT FALSE,
  p_tags customer_tag[] DEFAULT '{}',
  p_create_account BOOLEAN DEFAULT FALSE,
  p_username VARCHAR(50) DEFAULT NULL,
  p_pin TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_customer_id UUID;
  v_caller_role user_role;
  v_user_id UUID;
  v_pin_hash TEXT;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF p_create_account THEN
    IF p_username IS NULL OR p_pin IS NULL THEN
      RAISE EXCEPTION 'VALIDATION_ERROR: username and pin required when creating account' USING ERRCODE = '22000';
    END IF;

    IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
      RAISE EXCEPTION 'CONFLICT: username already exists' USING ERRCODE = '23505';
    END IF;
  END IF;

  INSERT INTO customers (name, phone, email, address, emergency_contact, photo_url, notes, is_guest, tags, is_active)
  VALUES (p_name, p_phone, p_email, p_address, p_emergency_contact, p_photo_url, p_notes, p_is_guest, p_tags, TRUE)
  RETURNING id INTO v_customer_id;

  IF p_create_account THEN
    v_pin_hash := fn_hash_pin(p_pin);

    INSERT INTO users (username, pin_hash, role, full_name, customer_id, created_by, is_active, failed_login_attempts)
    VALUES (p_username, v_pin_hash, 'CUSTOMER', p_name, v_customer_id, p_caller_id, TRUE, 0)
    RETURNING id INTO v_user_id;

    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (p_caller_id, 'CREATE_USER', 'users', v_user_id,
            jsonb_build_object('username', p_username, 'role', 'CUSTOMER', 'customer_id', v_customer_id));
  END IF;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_caller_id, 'CREATE_CUSTOMER', 'customers', v_customer_id,
          jsonb_build_object('name', p_name, 'phone', p_phone, 'email', p_email, 'is_guest', p_is_guest));

  RETURN jsonb_build_object('id', v_customer_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_update_customer(
  p_caller_id UUID,
  p_customer_id UUID,
  p_name VARCHAR(100) DEFAULT NULL,
  p_phone VARCHAR(20) DEFAULT NULL,
  p_email VARCHAR(100) DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_emergency_contact VARCHAR(100) DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_is_guest BOOLEAN DEFAULT NULL,
  p_tags customer_tag[] DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_old_values JSONB;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_customer_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'NOT_FOUND: customer not found' USING ERRCODE = '22000';
  END IF;

  SELECT jsonb_build_object(
    'name', name, 'phone', phone, 'email', email,
    'address', address, 'emergency_contact', emergency_contact,
    'photo_url', photo_url, 'notes', notes,
    'is_guest', is_guest, 'tags', tags
  ) INTO v_old_values FROM customers WHERE id = p_customer_id;

  UPDATE customers
  SET
    name = COALESCE(p_name, name),
    phone = COALESCE(p_phone, phone),
    email = COALESCE(p_email, email),
    address = COALESCE(p_address, address),
    emergency_contact = COALESCE(p_emergency_contact, emergency_contact),
    photo_url = COALESCE(p_photo_url, photo_url),
    notes = COALESCE(p_notes, notes),
    is_guest = COALESCE(p_is_guest, is_guest),
    tags = COALESCE(p_tags, tags),
    updated_at = NOW()
  WHERE id = p_customer_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'UPDATE_CUSTOMER', 'customers', p_customer_id, v_old_values,
          jsonb_build_object('name', p_name, 'phone', p_phone, 'email', p_email,
                             'address', p_address, 'emergency_contact', p_emergency_contact,
                             'photo_url', p_photo_url, 'notes', p_notes,
                             'is_guest', p_is_guest, 'tags', p_tags));

  RETURN jsonb_build_object('id', p_customer_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_delete_customer(
  p_caller_id UUID,
  p_customer_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_caller_role user_role;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_customer_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'NOT_FOUND: customer not found' USING ERRCODE = '22000';
  END IF;

  UPDATE customers
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_customer_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
  VALUES (p_caller_id, 'DELETE_CUSTOMER', 'customers', p_customer_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_convert_guest(
  p_caller_id UUID,
  p_customer_id UUID,
  p_username VARCHAR(50) DEFAULT NULL,
  p_pin TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_customer RECORD;
  v_user_id UUID;
  v_pin_hash TEXT;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_customer FROM customers WHERE id = p_customer_id AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: customer not found' USING ERRCODE = '22000';
  END IF;

  IF NOT v_customer.is_guest THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: customer is already registered' USING ERRCODE = '22000';
  END IF;

  IF p_username IS NOT NULL AND p_pin IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
      RAISE EXCEPTION 'CONFLICT: username already exists' USING ERRCODE = '23505';
    END IF;

    v_pin_hash := fn_hash_pin(p_pin);

    INSERT INTO users (username, pin_hash, role, full_name, customer_id, created_by, is_active, failed_login_attempts)
    VALUES (p_username, v_pin_hash, 'CUSTOMER', v_customer.name, p_customer_id, p_caller_id, TRUE, 0)
    RETURNING id INTO v_user_id;

    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (p_caller_id, 'CREATE_USER', 'users', v_user_id,
            jsonb_build_object('username', p_username, 'role', 'CUSTOMER', 'customer_id', p_customer_id));
  END IF;

  UPDATE customers
  SET is_guest = FALSE, updated_at = NOW()
  WHERE id = p_customer_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'CONVERT_GUEST', 'customers', p_customer_id,
          jsonb_build_object('is_guest', TRUE),
          jsonb_build_object('is_guest', FALSE));

  RETURN jsonb_build_object('id', p_customer_id, 'is_guest', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- PET FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION fn_create_pet(
  p_caller_id UUID,
  p_customer_id UUID,
  p_name VARCHAR(100),
  p_species VARCHAR(50),
  p_breed VARCHAR(50) DEFAULT NULL,
  p_birth_date DATE DEFAULT NULL,
  p_gender VARCHAR(10) DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_microchip_number VARCHAR(50) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_pet_id UUID;
  v_caller_role user_role;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_customer_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: customer not found' USING ERRCODE = '22000';
  END IF;

  INSERT INTO pets (customer_id, name, species, breed, birth_date, gender, photo_url, microchip_number, is_active)
  VALUES (p_customer_id, p_name, p_species, p_breed, p_birth_date, p_gender, p_photo_url, p_microchip_number, TRUE)
  RETURNING id INTO v_pet_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_caller_id, 'CREATE_PET', 'pets', v_pet_id,
          jsonb_build_object('name', p_name, 'species', p_species, 'customer_id', p_customer_id));

  RETURN jsonb_build_object('id', v_pet_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_update_pet(
  p_caller_id UUID,
  p_pet_id UUID,
  p_name VARCHAR(100) DEFAULT NULL,
  p_species VARCHAR(50) DEFAULT NULL,
  p_breed VARCHAR(50) DEFAULT NULL,
  p_birth_date DATE DEFAULT NULL,
  p_gender VARCHAR(10) DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_microchip_number VARCHAR(50) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_old_values JSONB;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pets WHERE id = p_pet_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'NOT_FOUND: pet not found' USING ERRCODE = '22000';
  END IF;

  SELECT jsonb_build_object(
    'name', name, 'species', species, 'breed', breed,
    'birth_date', birth_date, 'gender', gender,
    'photo_url', photo_url, 'microchip_number', microchip_number
  ) INTO v_old_values FROM pets WHERE id = p_pet_id;

  UPDATE pets
  SET
    name = COALESCE(p_name, name),
    species = COALESCE(p_species, species),
    breed = COALESCE(p_breed, breed),
    birth_date = COALESCE(p_birth_date, birth_date),
    gender = COALESCE(p_gender, gender),
    photo_url = COALESCE(p_photo_url, photo_url),
    microchip_number = COALESCE(p_microchip_number, microchip_number),
    updated_at = NOW()
  WHERE id = p_pet_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'UPDATE_PET', 'pets', p_pet_id, v_old_values,
          jsonb_build_object('name', p_name, 'species', p_species, 'breed', p_breed,
                             'birth_date', p_birth_date, 'gender', p_gender,
                             'photo_url', p_photo_url, 'microchip_number', p_microchip_number));

  RETURN jsonb_build_object('id', p_pet_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_delete_pet(
  p_caller_id UUID,
  p_pet_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_caller_role user_role;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pets WHERE id = p_pet_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'NOT_FOUND: pet not found' USING ERRCODE = '22000';
  END IF;

  UPDATE pets
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_pet_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
  VALUES (p_caller_id, 'DELETE_PET', 'pets', p_pet_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
