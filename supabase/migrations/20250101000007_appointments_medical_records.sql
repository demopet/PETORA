-- ============================================
-- APPOINTMENTS & MEDICAL RECORDS RPC FUNCTIONS
-- ============================================
-- Atomic queue_number and record_number generation
-- SECURITY DEFINER functions with explicit caller_id
-- ============================================

-- ============================================
-- HELPER TABLE: medical_record_counters
-- ============================================
CREATE TABLE IF NOT EXISTS medical_record_counters (
  date DATE PRIMARY KEY,
  counter INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- HELPER: fn_generate_queue_number
-- ============================================
CREATE OR REPLACE FUNCTION fn_generate_queue_number(
  p_appointment_date DATE
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_queue_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(queue_number), 0) + 1 INTO v_queue_number
  FROM appointments
  WHERE appointment_date = p_appointment_date;

  RETURN v_queue_number;
END;
$$;

-- ============================================
-- HELPER: fn_generate_record_number
-- ============================================
CREATE OR REPLACE FUNCTION fn_generate_record_number(
  p_date DATE
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_counter INTEGER;
  v_date_str TEXT;
BEGIN
  v_date_str := TO_CHAR(p_date, 'YYYYMMDD');

  INSERT INTO medical_record_counters (date, counter)
  VALUES (p_date, 1)
  ON CONFLICT (date)
  DO UPDATE SET counter = medical_record_counters.counter + 1
  RETURNING counter INTO v_counter;

  RETURN 'MR-' || v_date_str || '-' || LPAD(v_counter::TEXT, 4, '0');
END;
$$;

-- ============================================
-- APPOINTMENT: fn_create_appointment
-- ============================================
CREATE OR REPLACE FUNCTION fn_create_appointment(
  p_caller_id UUID,
  p_customer_id UUID,
  p_pet_id UUID,
  p_doctor_id UUID DEFAULT NULL,
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_complaint TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_is_from_portal BOOLEAN DEFAULT FALSE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_appointment_id UUID;
  v_queue_number INTEGER;
  v_customer RECORD;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'CUSTOMER') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF p_appointment_date < CURRENT_DATE AND NOT p_is_from_portal THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: appointment date cannot be in the past' USING ERRCODE = '22000';
  END IF;

  SELECT * INTO v_customer FROM customers WHERE id = p_customer_id AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: customer not found' USING ERRCODE = '22000';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pets WHERE id = p_pet_id AND customer_id = p_customer_id AND is_active = TRUE) THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: pet does not belong to customer' USING ERRCODE = '22000';
  END IF;

  IF p_doctor_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_doctor_id AND role = 'DOKTER' AND is_active = TRUE) THEN
      RAISE EXCEPTION 'VALIDATION_ERROR: doctor not found' USING ERRCODE = '22000';
    END IF;
  END IF;

  v_queue_number := fn_generate_queue_number(p_appointment_date);

  INSERT INTO appointments (
    customer_id, pet_id, doctor_id,
    appointment_date, appointment_time,
    queue_number, status, complaint, notes,
    is_from_portal, is_active
  )
  VALUES (
    p_customer_id, p_pet_id, p_doctor_id,
    p_appointment_date, p_appointment_time,
    v_queue_number, 'WAITING', p_complaint, p_notes,
    p_is_from_portal, TRUE
  )
  RETURNING id INTO v_appointment_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_caller_id, 'CREATE_APPOINTMENT', 'appointments', v_appointment_id,
          jsonb_build_object(
            'customer_id', p_customer_id,
            'pet_id', p_pet_id,
            'doctor_id', p_doctor_id,
            'appointment_date', p_appointment_date,
            'appointment_time', p_appointment_time,
            'queue_number', v_queue_number,
            'status', 'WAITING',
            'is_from_portal', p_is_from_portal
          ));

  RETURN jsonb_build_object('id', v_appointment_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- APPOINTMENT: fn_update_appointment_status
-- ============================================
CREATE OR REPLACE FUNCTION fn_update_appointment_status(
  p_caller_id UUID,
  p_appointment_id UUID,
  p_new_status appointment_status
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_appointment RECORD;
  v_old_status appointment_status;
  v_has_medical_record BOOLEAN;
  v_prompt_create BOOLEAN := FALSE;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'DOKTER') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_appointment FROM appointments WHERE id = p_appointment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: appointment not found' USING ERRCODE = '22000';
  END IF;

  v_old_status := v_appointment.status;

  IF v_old_status = 'DONE' AND p_new_status != 'DONE' THEN
    RAISE EXCEPTION 'INVALID_STATE_TRANSITION: cannot transition from DONE' USING ERRCODE = '22000';
  END IF;

  IF v_old_status = 'CANCELLED' AND p_new_status != 'CANCELLED' THEN
    RAISE EXCEPTION 'INVALID_STATE_TRANSITION: cannot transition from CANCELLED' USING ERRCODE = '22000';
  END IF;

  IF v_old_status = 'WAITING' AND p_new_status NOT IN ('IN_PROGRESS', 'CANCELLED') THEN
    RAISE EXCEPTION 'INVALID_STATE_TRANSITION: WAITING can only transition to IN_PROGRESS or CANCELLED' USING ERRCODE = '22000';
  END IF;

  IF v_old_status = 'IN_PROGRESS' AND p_new_status NOT IN ('DONE', 'CANCELLED') THEN
    RAISE EXCEPTION 'INVALID_STATE_TRANSITION: IN_PROGRESS can only transition to DONE or CANCELLED' USING ERRCODE = '22000';
  END IF;

  IF v_caller_role = 'DOKTER' AND v_appointment.doctor_id != p_caller_id THEN
    RAISE EXCEPTION 'FORBIDDEN: not your appointment' USING ERRCODE = '42501';
  END IF;

  IF p_new_status = 'IN_PROGRESS' AND v_caller_role = 'DOKTER' AND v_appointment.doctor_id != p_caller_id THEN
    RAISE EXCEPTION 'FORBIDDEN: only assigned doctor can start appointment' USING ERRCODE = '42501';
  END IF;

  UPDATE appointments
  SET status = p_new_status, updated_at = NOW()
  WHERE id = p_appointment_id;

  IF p_new_status = 'DONE' THEN
    SELECT EXISTS (
      SELECT 1 FROM medical_records
      WHERE appointment_id = p_appointment_id AND deleted_at IS NULL
    ) INTO v_has_medical_record;

    IF NOT v_has_medical_record THEN
      v_prompt_create := TRUE;
    END IF;
  END IF;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'UPDATE_APPOINTMENT_STATUS', 'appointments', p_appointment_id,
          jsonb_build_object('status', v_old_status),
          jsonb_build_object('status', p_new_status));

  RETURN jsonb_build_object('id', p_appointment_id, 'prompt_create_medical_record', v_prompt_create);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- APPOINTMENT: fn_cancel_appointment
-- ============================================
CREATE OR REPLACE FUNCTION fn_cancel_appointment(
  p_caller_id UUID,
  p_appointment_id UUID,
  p_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_appointment RECORD;
  v_old_status appointment_status;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'DOKTER', 'CUSTOMER') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_appointment FROM appointments WHERE id = p_appointment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: appointment not found' USING ERRCODE = '22000';
  END IF;

  v_old_status := v_appointment.status;

  IF v_old_status = 'DONE' OR v_old_status = 'CANCELLED' THEN
    RAISE EXCEPTION 'INVALID_STATE_TRANSITION: cannot cancel appointment in final state' USING ERRCODE = '22000';
  END IF;

  IF v_caller_role = 'CUSTOMER' THEN
    IF v_appointment.customer_id != (SELECT customer_id FROM users WHERE id = p_caller_id) THEN
      RAISE EXCEPTION 'FORBIDDEN: not your appointment' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF v_caller_role = 'DOKTER' AND v_appointment.doctor_id != p_caller_id THEN
    RAISE EXCEPTION 'FORBIDDEN: not your appointment' USING ERRCODE = '42501';
  END IF;

  UPDATE appointments
  SET status = 'CANCELLED', notes = COALESCE(appointments.notes || E'\n' || p_reason, p_reason), updated_at = NOW()
  WHERE id = p_appointment_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'CANCEL_APPOINTMENT', 'appointments', p_appointment_id,
          jsonb_build_object('status', v_old_status),
          jsonb_build_object('status', 'CANCELLED', 'reason', p_reason));

  RETURN jsonb_build_object('id', p_appointment_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MEDICAL RECORD: fn_create_medical_record
-- ============================================
CREATE OR REPLACE FUNCTION fn_create_medical_record(
  p_caller_id UUID,
  p_appointment_id UUID,
  p_chief_complaint TEXT DEFAULT NULL,
  p_history TEXT DEFAULT NULL,
  p_physical_exam TEXT DEFAULT NULL,
  p_weight_kg DECIMAL(5,2) DEFAULT NULL,
  p_temperature_c DECIMAL(4,1) DEFAULT NULL,
  p_heart_rate_bpm INTEGER DEFAULT NULL,
  p_respiratory_rate_bpm INTEGER DEFAULT NULL,
  p_diagnosis TEXT DEFAULT NULL,
  p_treatment TEXT DEFAULT NULL,
  p_prescription TEXT DEFAULT NULL,
  p_lab_results TEXT DEFAULT NULL,
  p_additional_notes TEXT DEFAULT NULL,
  p_attachments TEXT[] DEFAULT '{}'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_appointment RECORD;
  v_medical_record_id UUID;
  v_record_number TEXT;
  v_existing_record_id UUID;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('DOKTER', 'OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_appointment FROM appointments WHERE id = p_appointment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: appointment not found' USING ERRCODE = '22000';
  END IF;

  IF v_appointment.status != 'IN_PROGRESS' AND v_caller_role = 'DOKTER' THEN
    RAISE EXCEPTION 'APPOINTMENT_NOT_IN_PROGRESS: appointment must be IN_PROGRESS' USING ERRCODE = '22000';
  END IF;

  SELECT id INTO v_existing_record_id
  FROM medical_records
  WHERE appointment_id = p_appointment_id AND deleted_at IS NULL
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION 'MEDICAL_RECORD_ALREADY_EXISTS' USING ERRCODE = '23505';
  END IF;

  IF v_caller_role = 'DOKTER' AND v_appointment.doctor_id != p_caller_id THEN
    RAISE EXCEPTION 'FORBIDDEN: not assigned doctor for this appointment' USING ERRCODE = '42501';
  END IF;

  v_record_number := fn_generate_record_number(v_appointment.appointment_date);

  INSERT INTO medical_records (
    record_number, appointment_id, doctor_id,
    chief_complaint, history, physical_exam,
    weight_kg, temperature_c, heart_rate_bpm, respiratory_rate_bpm,
    diagnosis, treatment, prescription, lab_results, additional_notes,
    attachments, status
  )
  VALUES (
    v_record_number, p_appointment_id, p_caller_id,
    p_chief_complaint, p_history, p_physical_exam,
    p_weight_kg, p_temperature_c, p_heart_rate_bpm, p_respiratory_rate_bpm,
    p_diagnosis, p_treatment, p_prescription, p_lab_results, p_additional_notes,
    p_attachments, 'OPEN'
  )
  RETURNING id INTO v_medical_record_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_caller_id, 'CREATE_MEDICAL_RECORD', 'medical_records', v_medical_record_id,
          jsonb_build_object(
            'record_number', v_record_number,
            'appointment_id', p_appointment_id,
            'chief_complaint', p_chief_complaint,
            'diagnosis', p_diagnosis
          ));

  RETURN jsonb_build_object('id', v_medical_record_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MEDICAL RECORD: fn_update_medical_record
-- ============================================
CREATE OR REPLACE FUNCTION fn_update_medical_record(
  p_caller_id UUID,
  p_medical_record_id UUID,
  p_chief_complaint TEXT DEFAULT NULL,
  p_history TEXT DEFAULT NULL,
  p_physical_exam TEXT DEFAULT NULL,
  p_weight_kg DECIMAL(5,2) DEFAULT NULL,
  p_temperature_c DECIMAL(4,1) DEFAULT NULL,
  p_heart_rate_bpm INTEGER DEFAULT NULL,
  p_respiratory_rate_bpm INTEGER DEFAULT NULL,
  p_diagnosis TEXT DEFAULT NULL,
  p_treatment TEXT DEFAULT NULL,
  p_prescription TEXT DEFAULT NULL,
  p_lab_results TEXT DEFAULT NULL,
  p_additional_notes TEXT DEFAULT NULL,
  p_attachments TEXT[] DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_record RECORD;
  v_old_values JSONB;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('DOKTER', 'OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_record FROM medical_records WHERE id = p_medical_record_id AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: medical record not found' USING ERRCODE = '22000';
  END IF;

  IF v_caller_role = 'DOKTER' AND v_record.doctor_id != p_caller_id THEN
    RAISE EXCEPTION 'FORBIDDEN: not the creator of this record' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'chief_complaint', v_record.chief_complaint,
    'history', v_record.history,
    'physical_exam', v_record.physical_exam,
    'weight_kg', v_record.weight_kg,
    'temperature_c', v_record.temperature_c,
    'heart_rate_bpm', v_record.heart_rate_bpm,
    'respiratory_rate_bpm', v_record.respiratory_rate_bpm,
    'diagnosis', v_record.diagnosis,
    'treatment', v_record.treatment,
    'prescription', v_record.prescription,
    'lab_results', v_record.lab_results,
    'additional_notes', v_record.additional_notes,
    'attachments', v_record.attachments
  ) INTO v_old_values;

  UPDATE medical_records
  SET
    chief_complaint = COALESCE(p_chief_complaint, chief_complaint),
    history = COALESCE(p_history, history),
    physical_exam = COALESCE(p_physical_exam, physical_exam),
    weight_kg = COALESCE(p_weight_kg, weight_kg),
    temperature_c = COALESCE(p_temperature_c, temperature_c),
    heart_rate_bpm = COALESCE(p_heart_rate_bpm, heart_rate_bpm),
    respiratory_rate_bpm = COALESCE(p_respiratory_rate_bpm, respiratory_rate_bpm),
    diagnosis = COALESCE(p_diagnosis, diagnosis),
    treatment = COALESCE(p_treatment, treatment),
    prescription = COALESCE(p_prescription, prescription),
    lab_results = COALESCE(p_lab_results, lab_results),
    additional_notes = COALESCE(p_additional_notes, additional_notes),
    attachments = COALESCE(p_attachments, attachments),
    updated_at = NOW()
  WHERE id = p_medical_record_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'UPDATE_MEDICAL_RECORD', 'medical_records', p_medical_record_id,
          v_old_values,
          jsonb_build_object(
            'chief_complaint', p_chief_complaint,
            'history', p_history,
            'physical_exam', p_physical_exam,
            'weight_kg', p_weight_kg,
            'temperature_c', p_temperature_c,
            'heart_rate_bpm', p_heart_rate_bpm,
            'respiratory_rate_bpm', p_respiratory_rate_bpm,
            'diagnosis', p_diagnosis,
            'treatment', p_treatment,
            'prescription', p_prescription,
            'lab_results', p_lab_results,
            'additional_notes', p_additional_notes,
            'attachments', p_attachments
          ));

  RETURN jsonb_build_object('id', p_medical_record_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MEDICAL RECORD: fn_delete_medical_record
-- ============================================
CREATE OR REPLACE FUNCTION fn_delete_medical_record(
  p_caller_id UUID,
  p_medical_record_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_record RECORD;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_record FROM medical_records WHERE id = p_medical_record_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: medical record not found' USING ERRCODE = '22000';
  END IF;

  UPDATE medical_records
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_medical_record_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
  VALUES (p_caller_id, 'DELETE_MEDICAL_RECORD', 'medical_records', p_medical_record_id);

  RETURN jsonb_build_object('id', p_medical_record_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
