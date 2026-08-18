-- ============================================
-- PET HOTEL & GROOMING RPC FUNCTIONS
-- ============================================
-- Atomic booking number generation and business logic
-- SECURITY DEFINER functions with explicit caller_id
-- ============================================

-- ============================================
-- HELPER TABLE: sequence_counters
-- ============================================
CREATE TABLE IF NOT EXISTS sequence_counters (
  prefix VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (prefix, date)
);

-- ============================================
-- HELPER: fn_generate_booking_number
-- ============================================
CREATE OR REPLACE FUNCTION fn_generate_booking_number(
  p_prefix VARCHAR(10),
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

  INSERT INTO sequence_counters (prefix, date, current_value)
  VALUES (p_prefix, p_date, 1)
  ON CONFLICT (prefix, date)
  DO UPDATE SET current_value = sequence_counters.current_value + 1
  RETURNING current_value INTO v_counter;

  RETURN p_prefix || '-' || v_date_str || '-' || LPAD(v_counter::TEXT, 4, '0');
END;
$$;

-- ============================================
-- HELPER: fn_create_invoice
-- ============================================
CREATE OR REPLACE FUNCTION fn_create_invoice(
  p_caller_id UUID,
  p_customer_id UUID,
  p_invoice_type invoice_type,
  p_subtotal DECIMAL(12,2),
  p_description TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_date_str TEXT;
  v_counter INTEGER;
BEGIN
  v_date_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  INSERT INTO sequence_counters (prefix, date, current_value)
  VALUES ('INV', CURRENT_DATE, 1)
  ON CONFLICT (prefix, date)
  DO UPDATE SET current_value = sequence_counters.current_value + 1
  RETURNING current_value INTO v_counter;

  v_invoice_number := 'INV-' || v_date_str || '-' || LPAD(v_counter::TEXT, 4, '0');

  INSERT INTO invoices (
    invoice_number, invoice_type, customer_id,
    subtotal, discount_amount, tax_amount, total_amount,
    status, notes, created_by
  )
  VALUES (
    v_invoice_number, p_invoice_type, p_customer_id,
    p_subtotal, 0, 0, p_subtotal,
    'UNPAID', p_description, p_caller_id
  )
  RETURNING id INTO v_invoice_id;

  RETURN v_invoice_id;
END;
$$;

-- ============================================
-- PET HOTEL: fn_create_pet_hotel_booking
-- ============================================
CREATE OR REPLACE FUNCTION fn_create_pet_hotel_booking(
  p_caller_id UUID,
  p_pet_id UUID,
  p_customer_id UUID,
  p_room_id UUID DEFAULT NULL,
  p_check_in_date DATE,
  p_check_out_date DATE,
  p_price_per_night DECIMAL(12,2) DEFAULT NULL,
  p_special_notes TEXT DEFAULT NULL,
  p_is_from_portal BOOLEAN DEFAULT FALSE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_booking_id UUID;
  v_booking_number TEXT;
  v_room RECORD;
  v_pet RECORD;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR', 'CUSTOMER') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id AND is_active = TRUE AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: pet not found' USING ERRCODE = '22000';
  END IF;

  IF v_pet.customer_id != p_customer_id THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: pet does not belong to customer' USING ERRCODE = '22000';
  END IF;

  IF p_check_out_date <= p_check_in_date THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: check-out date must be after check-in date' USING ERRCODE = '22000';
  END IF;

  IF p_room_id IS NOT NULL THEN
    SELECT * INTO v_room FROM rooms WHERE id = p_room_id AND is_active = TRUE AND deleted_at IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'NOT_FOUND: room not found' USING ERRCODE = '22000';
    END IF;

    IF v_room.status != 'AVAILABLE' THEN
      RAISE EXCEPTION 'ROOM_NOT_AVAILABLE: room is not available' USING ERRCODE = '22000';
    END IF;

    IF EXISTS (
      SELECT 1 FROM pet_hotel_bookings
      WHERE room_id = p_room_id
        AND status IN ('BOOKED', 'CHECKED_IN')
        AND check_in_date <= p_check_out_date
        AND check_out_date >= p_check_in_date
        AND deleted_at IS NULL
    ) THEN
      RAISE EXCEPTION 'ROOM_NOT_AVAILABLE: room is already booked for these dates' USING ERRCODE = '22000';
    END IF;
  END IF;

  IF p_price_per_night IS NULL AND p_room_id IS NOT NULL THEN
    SELECT price_per_night INTO p_price_per_night FROM rooms WHERE id = p_room_id;
  ELSIF p_price_per_night IS NULL THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: price_per_night is required when no room is selected' USING ERRCODE = '22000';
  END IF;

  v_booking_number := fn_generate_booking_number('BK', p_check_in_date);

  INSERT INTO pet_hotel_bookings (
    booking_number, pet_id, customer_id, room_id,
    check_in_date, check_out_date,
    price_per_night, total_price, status,
    special_notes, is_from_portal
  )
  VALUES (
    v_booking_number, p_pet_id, p_customer_id, p_room_id,
    p_check_in_date, p_check_out_date,
    p_price_per_night, 0, 'BOOKED',
    p_special_notes, p_is_from_portal
  )
  RETURNING id INTO v_booking_id;

  IF p_room_id IS NOT NULL THEN
    UPDATE rooms SET status = 'RESERVED', updated_at = NOW() WHERE id = p_room_id;
  END IF;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_caller_id, 'CREATE_PET_HOTEL_BOOKING', 'pet_hotel_bookings', v_booking_id,
          jsonb_build_object(
            'booking_number', v_booking_number,
            'pet_id', p_pet_id,
            'customer_id', p_customer_id,
            'room_id', p_room_id,
            'check_in_date', p_check_in_date,
            'check_out_date', p_check_out_date,
            'price_per_night', p_price_per_night,
            'status', 'BOOKED'
          ));

  RETURN jsonb_build_object('id', v_booking_id, 'booking_number', v_booking_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PET HOTEL: fn_check_in_booking
-- ============================================
CREATE OR REPLACE FUNCTION fn_check_in_booking(
  p_caller_id UUID,
  p_booking_id UUID,
  p_actual_room_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_booking RECORD;
  v_old_room_id UUID;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_booking FROM pet_hotel_bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: booking not found' USING ERRCODE = '22000';
  END IF;

  IF v_booking.status != 'BOOKED' THEN
    RAISE EXCEPTION 'BOOKING_NOT_ACTIVE: booking must be in BOOKED status' USING ERRCODE = '22000';
  END IF;

  v_old_room_id := v_booking.room_id;

  IF p_actual_room_id IS NOT NULL THEN
    IF v_old_room_id IS NOT NULL THEN
      UPDATE rooms SET status = 'AVAILABLE', updated_at = NOW() WHERE id = v_old_room_id;
    END IF;

    UPDATE rooms SET status = 'OCCUPIED', updated_at = NOW() WHERE id = p_actual_room_id;

    UPDATE pet_hotel_bookings SET room_id = p_actual_room_id WHERE id = p_booking_id;
  ELSIF v_old_room_id IS NOT NULL THEN
    UPDATE rooms SET status = 'OCCUPIED', updated_at = NOW() WHERE id = v_old_room_id;
  END IF;

  UPDATE pet_hotel_bookings
  SET status = 'CHECKED_IN', actual_check_in_at = NOW(), updated_at = NOW()
  WHERE id = p_booking_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'CHECK_IN_BOOKING', 'pet_hotel_bookings', p_booking_id,
          jsonb_build_object('status', 'BOOKED', 'room_id', v_old_room_id),
          jsonb_build_object('status', 'CHECKED_IN', 'room_id', COALESCE(p_actual_room_id, v_old_room_id)));

  RETURN jsonb_build_object('id', p_booking_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PET HOTEL: fn_check_out_booking
-- ============================================
CREATE OR REPLACE FUNCTION fn_check_out_booking(
  p_caller_id UUID,
  p_booking_id UUID,
  p_actual_check_out_date DATE DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_booking RECORD;
  v_actual_nights INTEGER;
  v_total_price DECIMAL(12,2);
  v_invoice_id UUID;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_booking FROM pet_hotel_bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: booking not found' USING ERRCODE = '22000';
  END IF;

  IF v_booking.status != 'CHECKED_IN' THEN
    RAISE EXCEPTION 'BOOKING_NOT_ACTIVE: booking must be in CHECKED_IN status' USING ERRCODE = '22000';
  END IF;

  IF p_actual_check_out_date IS NOT NULL THEN
    IF p_actual_check_out_date < v_booking.check_in_date THEN
      RAISE EXCEPTION 'VALIDATION_ERROR: actual check-out date cannot be before check-in date' USING ERRCODE = '22000';
    END IF;
    v_actual_nights := CEIL(EXTRACT(EPOCH FROM (p_actual_check_out_date::timestamp - v_booking.check_in_date::timestamp)) / 86400);
  ELSE
    v_actual_nights := CEIL(EXTRACT(EPOCH FROM (NOW() - v_booking.actual_check_in_at)) / 86400);
  END IF;

  IF v_actual_nights < 1 THEN
    v_actual_nights := 1;
  END IF;

  v_total_price := v_actual_nights * v_booking.price_per_night;

  IF v_booking.room_id IS NOT NULL THEN
    UPDATE rooms SET status = 'AVAILABLE', cleanliness = 'DIRTY', updated_at = NOW() WHERE id = v_booking.room_id;
  END IF;

  UPDATE pet_hotel_bookings
  SET status = 'CHECKED_OUT',
      actual_check_out_at = COALESCE(p_actual_check_out_date::timestamp, NOW()),
      total_price = v_total_price,
      updated_at = NOW()
  WHERE id = p_booking_id;

  v_invoice_id := fn_create_invoice(
    p_caller_id,
    v_booking.customer_id,
    'PET_HOTEL',
    v_total_price,
    'Pet Hotel Stay - ' || v_booking.booking_number
  );

  INSERT INTO invoice_items (
    invoice_id, item_type, pet_hotel_booking_id, description, quantity, unit_price, total_price
  )
  VALUES (
    v_invoice_id, 'PET_HOTEL', p_booking_id,
    'Pet Hotel Stay - ' || v_booking.booking_number || ' (' || v_actual_nights || ' nights)',
    1, v_booking.price_per_night, v_total_price
  );

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'CHECK_OUT_BOOKING', 'pet_hotel_bookings', p_booking_id,
          jsonb_build_object('status', 'CHECKED_IN', 'total_price', v_booking.total_price),
          jsonb_build_object('status', 'CHECKED_OUT', 'actual_check_out_at', COALESCE(p_actual_check_out_date::timestamp, NOW()), 'total_price', v_total_price));

  RETURN jsonb_build_object('id', p_booking_id, 'total_price', v_total_price, 'invoice_id', v_invoice_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PET HOTEL: fn_add_pet_hotel_log
-- ============================================
CREATE OR REPLACE FUNCTION fn_add_pet_hotel_log(
  p_caller_id UUID,
  p_booking_id UUID,
  p_log_type pet_hotel_log_type,
  p_description TEXT DEFAULT NULL,
  p_photo_urls TEXT[] DEFAULT '{}'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_booking RECORD;
  v_log_id UUID;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_booking FROM pet_hotel_bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: booking not found' USING ERRCODE = '22000';
  END IF;

  IF v_booking.status != 'CHECKED_IN' THEN
    RAISE EXCEPTION 'BOOKING_NOT_ACTIVE: booking must be in CHECKED_IN status to add logs' USING ERRCODE = '22000';
  END IF;

  INSERT INTO pet_hotel_logs (booking_id, log_type, description, photo_urls, logged_at)
  VALUES (p_booking_id, p_log_type, p_description, p_photo_urls, NOW())
  RETURNING id INTO v_log_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_caller_id, 'ADD_PET_HOTEL_LOG', 'pet_hotel_logs', v_log_id,
          jsonb_build_object('booking_id', p_booking_id, 'log_type', p_log_type));

  RETURN jsonb_build_object('id', v_log_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GROOMING: fn_create_grooming_booking
-- ============================================
CREATE OR REPLACE FUNCTION fn_create_grooming_booking(
  p_caller_id UUID,
  p_pet_id UUID,
  p_customer_id UUID,
  p_groomer_id UUID DEFAULT NULL,
  p_service_id UUID,
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_notes TEXT DEFAULT NULL,
  p_is_from_portal BOOLEAN DEFAULT FALSE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_booking_id UUID;
  v_booking_number TEXT;
  v_service RECORD;
  v_pet RECORD;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR', 'CUSTOMER') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_pet FROM pets WHERE id = p_pet_id AND is_active = TRUE AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: pet not found' USING ERRCODE = '22000';
  END IF;

  IF v_pet.customer_id != p_customer_id THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: pet does not belong to customer' USING ERRCODE = '22000';
  END IF;

  SELECT * INTO v_service FROM grooming_services WHERE id = p_service_id AND is_active = TRUE AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: grooming service not found or inactive' USING ERRCODE = '22000';
  END IF;

  IF p_groomer_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_groomer_id AND role = 'DOKTER' AND is_active = TRUE) THEN
      RAISE EXCEPTION 'VALIDATION_ERROR: groomer not found' USING ERRCODE = '22000';
    END IF;
  END IF;

  v_booking_number := fn_generate_booking_number('GR', p_appointment_date);

  INSERT INTO grooming_bookings (
    booking_number, pet_id, customer_id, groomer_id, service_id,
    appointment_date, appointment_time, status, total_price, notes, is_from_portal
  )
  VALUES (
    v_booking_number, p_pet_id, p_customer_id, p_groomer_id, p_service_id,
    p_appointment_date, p_appointment_time, 'BOOKED', v_service.base_price, p_notes, p_is_from_portal
  )
  RETURNING id INTO v_booking_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (p_caller_id, 'CREATE_GROOMING_BOOKING', 'grooming_bookings', v_booking_id,
          jsonb_build_object(
            'booking_number', v_booking_number,
            'pet_id', p_pet_id,
            'customer_id', p_customer_id,
            'groomer_id', p_groomer_id,
            'service_id', p_service_id,
            'appointment_date', p_appointment_date,
            'appointment_time', p_appointment_time,
            'status', 'BOOKED',
            'total_price', v_service.base_price
          ));

  RETURN jsonb_build_object('id', v_booking_id, 'booking_number', v_booking_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GROOMING: fn_start_grooming
-- ============================================
CREATE OR REPLACE FUNCTION fn_start_grooming(
  p_caller_id UUID,
  p_booking_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_booking RECORD;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_booking FROM grooming_bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: booking not found' USING ERRCODE = '22000';
  END IF;

  IF v_booking.status != 'BOOKED' THEN
    RAISE EXCEPTION 'BOOKING_NOT_ACTIVE: booking must be in BOOKED status' USING ERRCODE = '22000';
  END IF;

  IF v_caller_role = 'DOKTER' AND v_booking.groomer_id != p_caller_id THEN
    RAISE EXCEPTION 'FORBIDDEN: not your grooming booking' USING ERRCODE = '42501';
  END IF;

  UPDATE grooming_bookings
  SET status = 'IN_PROGRESS', updated_at = NOW()
  WHERE id = p_booking_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'START_GROOMING', 'grooming_bookings', p_booking_id,
          jsonb_build_object('status', 'BOOKED'),
          jsonb_build_object('status', 'IN_PROGRESS'));

  RETURN jsonb_build_object('id', p_booking_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GROOMING: fn_finish_grooming
-- ============================================
CREATE OR REPLACE FUNCTION fn_finish_grooming(
  p_caller_id UUID,
  p_booking_id UUID,
  p_skin_condition TEXT DEFAULT NULL,
  p_flea_tick_found BOOLEAN DEFAULT FALSE,
  p_recommendations TEXT DEFAULT NULL,
  p_before_photo_url TEXT DEFAULT NULL,
  p_after_photo_url TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_booking RECORD;
  v_record_id UUID;
  v_invoice_id UUID;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_booking FROM grooming_bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: booking not found' USING ERRCODE = '22000';
  END IF;

  IF v_booking.status != 'IN_PROGRESS' THEN
    RAISE EXCEPTION 'BOOKING_NOT_ACTIVE: booking must be in IN_PROGRESS status' USING ERRCODE = '22000';
  END IF;

  IF v_caller_role = 'DOKTER' AND v_booking.groomer_id != p_caller_id THEN
    RAISE EXCEPTION 'FORBIDDEN: not your grooming booking' USING ERRCODE = '42501';
  END IF;

  INSERT INTO grooming_records (
    booking_id, skin_condition, flea_tick_found, recommendations, before_photo_url, after_photo_url
  )
  VALUES (p_booking_id, p_skin_condition, p_flea_tick_found, p_recommendations, p_before_photo_url, p_after_photo_url)
  RETURNING id INTO v_record_id;

  UPDATE grooming_bookings
  SET status = 'DONE', updated_at = NOW()
  WHERE id = p_booking_id;

  v_invoice_id := fn_create_invoice(
    p_caller_id,
    v_booking.customer_id,
    'GROOMING',
    v_booking.total_price,
    'Grooming Service - ' || v_booking.booking_number
  );

  INSERT INTO invoice_items (
    invoice_id, item_type, grooming_booking_id, description, quantity, unit_price, total_price
  )
  VALUES (
    v_invoice_id, 'GROOMING', p_booking_id,
    'Grooming Service - ' || v_booking.booking_number,
    1, v_booking.total_price, v_booking.total_price
  );

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'FINISH_GROOMING', 'grooming_bookings', p_booking_id,
          jsonb_build_object('status', 'IN_PROGRESS'),
          jsonb_build_object('status', 'DONE', 'record_id', v_record_id));

  RETURN jsonb_build_object('id', p_booking_id, 'record_id', v_record_id, 'invoice_id', v_invoice_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PET HOTEL: fn_cancel_pet_hotel_booking
-- ============================================
CREATE OR REPLACE FUNCTION fn_cancel_pet_hotel_booking(
  p_caller_id UUID,
  p_booking_id UUID,
  p_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_booking RECORD;
  v_old_status pet_hotel_booking_status;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR', 'CUSTOMER') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_booking FROM pet_hotel_bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: booking not found' USING ERRCODE = '22000';
  END IF;

  v_old_status := v_booking.status;

  IF v_old_status = 'CHECKED_OUT' OR v_old_status = 'CANCELLED' THEN
    RAISE EXCEPTION 'INVALID_STATE_TRANSITION: cannot cancel booking in final state' USING ERRCODE = '22000';
  END IF;

  IF v_caller_role = 'CUSTOMER' THEN
    IF v_booking.customer_id != (SELECT customer_id FROM users WHERE id = p_caller_id) THEN
      RAISE EXCEPTION 'FORBIDDEN: not your booking' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF v_old_status = 'BOOKED' AND v_booking.room_id IS NOT NULL THEN
    UPDATE rooms SET status = 'AVAILABLE', updated_at = NOW() WHERE id = v_booking.room_id;
  END IF;

  UPDATE pet_hotel_bookings
  SET status = 'CANCELLED', updated_at = NOW()
  WHERE id = p_booking_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'CANCEL_PET_HOTEL_BOOKING', 'pet_hotel_bookings', p_booking_id,
          jsonb_build_object('status', v_old_status),
          jsonb_build_object('status', 'CANCELLED', 'reason', p_reason));

  RETURN jsonb_build_object('id', p_booking_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GROOMING: fn_cancel_grooming
-- ============================================
CREATE OR REPLACE FUNCTION fn_cancel_grooming(
  p_caller_id UUID,
  p_booking_id UUID,
  p_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_booking RECORD;
  v_old_status grooming_booking_status;
BEGIN
  SELECT role INTO v_caller_role FROM users WHERE id = p_caller_id;

  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR', 'CUSTOMER') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_booking FROM grooming_bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: booking not found' USING ERRCODE = '22000';
  END IF;

  v_old_status := v_booking.status;

  IF v_old_status = 'DONE' OR v_old_status = 'CANCELLED' THEN
    RAISE EXCEPTION 'INVALID_STATE_TRANSITION: cannot cancel booking in final state' USING ERRCODE = '22000';
  END IF;

  IF v_caller_role = 'CUSTOMER' THEN
    IF v_booking.customer_id != (SELECT customer_id FROM users WHERE id = p_caller_id) THEN
      RAISE EXCEPTION 'FORBIDDEN: not your booking' USING ERRCODE = '42501';
    END IF;
  END IF;

  UPDATE grooming_bookings
  SET status = 'CANCELLED', notes = COALESCE(grooming_bookings.notes || E'\n' || p_reason, p_reason), updated_at = NOW()
  WHERE id = p_booking_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (p_caller_id, 'CANCEL_GROOMING', 'grooming_bookings', p_booking_id,
          jsonb_build_object('status', v_old_status),
          jsonb_build_object('status', 'CANCELLED', 'reason', p_reason));

  RETURN jsonb_build_object('id', p_booking_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
