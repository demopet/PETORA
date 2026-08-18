-- ============================================
-- POS & BILLING FUNCTIONS
-- ============================================
-- This migration creates atomic RPC functions for
-- POS checkout, payment recording, invoice cancellation,
-- and daily sales reporting.
-- ============================================

-- ============================================
-- HELPER: Generate atomic invoice number
-- ============================================
CREATE OR REPLACE FUNCTION fn_generate_invoice_number(p_date DATE)
RETURNS TEXT AS $$
DECLARE
  v_date_str TEXT;
  v_seq INTEGER;
  v_invoice_number TEXT;
BEGIN
  v_date_str := TO_CHAR(p_date, 'YYYYMMDD');

  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 12) AS INTEGER)), 0) + 1
  INTO v_seq
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || v_date_str || '-%';

  v_invoice_number := 'INV-' || v_date_str || '-' || LPAD(v_seq::TEXT, 4, '0');

  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER: Calculate loyalty points
-- ============================================
CREATE OR REPLACE FUNCTION fn_calculate_loyalty_points(p_amount DECIMAL(12,2))
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(p_amount / 10000);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- HELPER: Get promotion discount
-- ============================================
CREATE OR REPLACE FUNCTION fn_get_promotion_discount(
  p_promotion_id UUID,
  p_subtotal DECIMAL(12,2)
)
RETURNS DECIMAL(12,2) AS $$
DECLARE
  v_promotion RECORD;
  v_discount DECIMAL(12,2) := 0;
BEGIN
  SELECT * INTO v_promotion FROM promotions WHERE id = p_promotion_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROMOTION_NOT_FOUND' USING ERRCODE = '22000';
  END IF;

  IF v_promotion.status != 'ACTIVE' THEN
    RAISE EXCEPTION 'PROMOTION_INVALID: Promotion is not active' USING ERRCODE = '22000';
  END IF;

  IF CURRENT_DATE < v_promotion.start_date THEN
    RAISE EXCEPTION 'PROMOTION_INVALID: Promotion has not started' USING ERRCODE = '22000';
  END IF;

  IF CURRENT_DATE > v_promotion.end_date THEN
    RAISE EXCEPTION 'PROMOTION_INVALID: Promotion has expired' USING ERRCODE = '22000';
  END IF;

  IF v_promotion.max_usage IS NOT NULL AND v_promotion.current_usage >= v_promotion.max_usage THEN
    RAISE EXCEPTION 'PROMOTION_INVALID: Promotion usage limit reached' USING ERRCODE = '22000';
  END IF;

  IF p_subtotal < v_promotion.min_purchase THEN
    RAISE EXCEPTION 'PROMOTION_INVALID: Minimum purchase not met' USING ERRCODE = '22000';
  END IF;

  IF v_promotion.promotion_type = 'PERCENTAGE' THEN
    v_discount := p_subtotal * (v_promotion.discount_value / 100);
  ELSIF v_promotion.promotion_type = 'FIXED' THEN
    v_discount := v_promotion.discount_value;
  ELSE
    v_discount := v_promotion.discount_value;
  END IF;

  RETURN LEAST(v_discount, p_subtotal);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- CREATE INVOICE (Atomic POS Checkout)
-- ============================================
CREATE OR REPLACE FUNCTION fn_create_invoice(
  p_caller_id UUID,
  p_invoice_type invoice_type,
  p_customer_id UUID DEFAULT NULL,
  p_items JSONB DEFAULT '[]',
  p_discount_amount DECIMAL(12,2) DEFAULT 0,
  p_tax_amount DECIMAL(12,2) DEFAULT 0,
  p_promotion_id UUID DEFAULT NULL,
  p_loyalty_points_to_redeem INTEGER DEFAULT 0,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_subtotal DECIMAL(12,2) := 0;
  v_total_amount DECIMAL(12,2);
  v_promotion_discount DECIMAL(12,2) := 0;
  v_loyalty_discount DECIMAL(12,2) := 0;
  v_points_earned INTEGER := 0;
  v_item JSONB;
  v_item_subtotal DECIMAL(12,2);
  v_stock_quantity INTEGER;
  v_loyalty_member_id UUID;
  v_loyalty_available_points INTEGER;
  v_loyalty_tier_id UUID;
  v_point_multiplier DECIMAL(3,2) := 1.0;
  v_invoice_items JSONB := '[]'::JSONB;
  v_invoice_item JSONB;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: At least one item is required' USING ERRCODE = '22000';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF (v_item->>'quantity')::INTEGER <= 0 THEN
      RAISE EXCEPTION 'VALIDATION_ERROR: Quantity must be positive for item: ' || v_item->>'description' USING ERRCODE = '22000';
    END IF;
    IF (v_item->>'unit_price')::DECIMAL(12,2) < 0 THEN
      RAISE EXCEPTION 'VALIDATION_ERROR: Unit price cannot be negative for item: ' || v_item->>'description' USING ERRCODE = '22000';
    END IF;
    IF v_item->>'item_type' NOT IN ('PRODUCT', 'SERVICE', 'PROCEDURE') THEN
      RAISE EXCEPTION 'VALIDATION_ERROR: Invalid item_type: ' || v_item->>'item_type' USING ERRCODE = '22000';
    END IF;
    v_item_subtotal := (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::DECIMAL(12,2);
    v_subtotal := v_subtotal + v_item_subtotal;
  END LOOP;

  IF p_promotion_id IS NOT NULL THEN
    v_promotion_discount := fn_get_promotion_discount(p_promotion_id, v_subtotal);
  END IF;

  IF p_loyalty_points_to_redeem > 0 THEN
    IF p_customer_id IS NULL THEN
      RAISE EXCEPTION 'VALIDATION_ERROR: Cannot redeem loyalty points without customer' USING ERRCODE = '22000';
    END IF;

    SELECT id, available_points INTO v_loyalty_member_id, v_loyalty_available_points
    FROM loyalty_members
    WHERE customer_id = p_customer_id;

    IF v_loyalty_member_id IS NULL THEN
      RAISE EXCEPTION 'NO_LOYALTY_ACCOUNT: Customer has no loyalty account' USING ERRCODE = '22000';
    END IF;

    IF v_loyalty_available_points < p_loyalty_points_to_redeem THEN
      RAISE EXCEPTION 'INSUFFICIENT_LOYALTY_POINTS: Not enough loyalty points' USING ERRCODE = '22000';
    END IF;

    v_loyalty_discount := p_loyalty_points_to_redeem * 100;
  END IF;

  v_total_amount := v_subtotal - p_discount_amount - v_promotion_discount - v_loyalty_discount + p_tax_amount;
  IF v_total_amount < 0 THEN
    v_total_amount := 0;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF v_item->>'item_type' = 'PRODUCT' THEN
      IF v_item->>'product_id' IS NULL THEN
        RAISE EXCEPTION 'VALIDATION_ERROR: PRODUCT item must have product_id' USING ERRCODE = '22000';
      END IF;

      SELECT stock_quantity INTO v_stock_quantity
      FROM products
      WHERE id = (v_item->>'product_id')::UUID
      FOR UPDATE;

      IF v_stock_quantity < (v_item->>'quantity')::INTEGER THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: Not enough stock for product' USING ERRCODE = '22000';
      END IF;
    END IF;
  END LOOP;

  v_invoice_number := fn_generate_invoice_number(CURRENT_DATE);

  INSERT INTO invoices (
    invoice_number, invoice_type, customer_id, subtotal, discount_amount,
    tax_amount, total_amount, paid_amount, status, promotion_id,
    loyalty_points_earned, loyalty_points_redeemed, notes, created_by
  ) VALUES (
    v_invoice_number, p_invoice_type, p_customer_id, v_subtotal, p_discount_amount,
    p_tax_amount, v_total_amount, 0, 'UNPAID', p_promotion_id,
    0, p_loyalty_points_to_redeem, p_notes, p_caller_id
  ) RETURNING id INTO v_invoice_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO invoice_items (
      invoice_id, item_type, product_id, procedure_id, pet_hotel_booking_id,
      grooming_booking_id, description, quantity, unit_price, total_price
    ) VALUES (
      v_invoice_id,
      v_item->>'item_type',
      CASE WHEN v_item->>'product_id' IS NOT NULL THEN (v_item->>'product_id')::UUID ELSE NULL END,
      CASE WHEN v_item->>'procedure_id' IS NOT NULL THEN (v_item->>'procedure_id')::UUID ELSE NULL END,
      CASE WHEN v_item->>'pet_hotel_booking_id' IS NOT NULL THEN (v_item->>'pet_hotel_booking_id')::UUID ELSE NULL END,
      CASE WHEN v_item->>'grooming_booking_id' IS NOT NULL THEN (v_item->>'grooming_booking_id')::UUID ELSE NULL END,
      v_item->>'description',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::DECIMAL(12,2),
      (v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::DECIMAL(12,2)
    ) RETURNING jsonb_build_object(
      'id', id,
      'invoice_id', invoice_id,
      'item_type', item_type,
      'product_id', product_id,
      'procedure_id', procedure_id,
      'pet_hotel_booking_id', pet_hotel_booking_id,
      'grooming_booking_id', grooming_booking_id,
      'description', description,
      'quantity', quantity,
      'unit_price', unit_price,
      'total_price', total_price,
      'created_at', created_at
    ) INTO v_invoice_item;

    v_invoice_items := v_invoice_items || v_invoice_item;
  END LOOP;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF v_item->>'item_type' = 'PRODUCT' THEN
      UPDATE products
      SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER,
          updated_at = NOW()
      WHERE id = (v_item->>'product_id')::UUID;

      INSERT INTO stock_movements (
        product_id, movement_type, quantity, reference_type, reference_id, notes, created_by
      ) VALUES (
        (v_item->>'product_id')::UUID, 'OUT', (v_item->>'quantity')::INTEGER,
        'invoice', v_invoice_id, 'POS checkout', p_caller_id
      );
    END IF;
  END LOOP;

  IF p_promotion_id IS NOT NULL THEN
    UPDATE promotions
    SET current_usage = current_usage + 1,
        updated_at = NOW()
    WHERE id = p_promotion_id;

    INSERT INTO promotion_usage (promotion_id, invoice_id, customer_id, discount_applied)
    VALUES (p_promotion_id, v_invoice_id, p_customer_id, v_promotion_discount);
  END IF;

  IF p_loyalty_points_to_redeem > 0 THEN
    INSERT INTO loyalty_transactions (
      member_id, transaction_type, points, invoice_id, description
    ) VALUES (
      v_loyalty_member_id, 'REDEEM', -p_loyalty_points_to_redeem, v_invoice_id,
      'Redeemed points for invoice ' || v_invoice_number
    );

    UPDATE loyalty_members
    SET available_points = available_points - p_loyalty_points_to_redeem,
        total_points = total_points - p_loyalty_points_to_redeem,
        updated_at = NOW()
    WHERE id = v_loyalty_member_id;
  END IF;

  IF p_customer_id IS NOT NULL THEN
    SELECT id, tier_id INTO v_loyalty_member_id, v_loyalty_tier_id
    FROM loyalty_members
    WHERE customer_id = p_customer_id;

    IF v_loyalty_member_id IS NOT NULL AND v_loyalty_tier_id IS NOT NULL THEN
      SELECT point_multiplier INTO v_point_multiplier FROM loyalty_tiers WHERE id = v_loyalty_tier_id;
    END IF;

    IF v_loyalty_member_id IS NOT NULL THEN
      v_points_earned := fn_calculate_loyalty_points(v_total_amount) * v_point_multiplier;

      INSERT INTO loyalty_transactions (
        member_id, transaction_type, points, invoice_id, description
      ) VALUES (
        v_loyalty_member_id, 'EARN', v_points_earned, v_invoice_id,
        'Earned from invoice ' || v_invoice_number
      );

      UPDATE loyalty_members
      SET total_points = total_points + v_points_earned,
          available_points = available_points + v_points_earned,
          total_spending = total_spending + v_total_amount,
          updated_at = NOW()
      WHERE id = v_loyalty_member_id;
    END IF;
  END IF;

  UPDATE invoices
  SET loyalty_points_earned = v_points_earned,
      updated_at = NOW()
  WHERE id = v_invoice_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (
    p_caller_id, 'CREATE_INVOICE', 'invoices', v_invoice_id,
    jsonb_build_object(
      'invoice_number', v_invoice_number,
      'invoice_type', p_invoice_type,
      'customer_id', p_customer_id,
      'subtotal', v_subtotal,
      'discount_amount', p_discount_amount,
      'tax_amount', p_tax_amount,
      'total_amount', v_total_amount,
      'promotion_id', p_promotion_id,
      'loyalty_points_redeemed', p_loyalty_points_to_redeem,
      'loyalty_points_earned', v_points_earned,
      'items_count', jsonb_array_length(p_items)
    )
  );

  RETURN jsonb_build_object(
    'id', v_invoice_id,
    'invoice_number', v_invoice_number,
    'invoice_type', p_invoice_type,
    'customer_id', p_customer_id,
    'subtotal', v_subtotal,
    'discount_amount', p_discount_amount,
    'tax_amount', p_tax_amount,
    'total_amount', v_total_amount,
    'paid_amount', 0,
    'status', 'UNPAID',
    'promotion_id', p_promotion_id,
    'loyalty_points_earned', v_points_earned,
    'loyalty_points_redeemed', p_loyalty_points_to_redeem,
    'notes', p_notes,
    'created_by', p_caller_id,
    'created_at', NOW(),
    'updated_at', NOW(),
    'items', v_invoice_items
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RECORD PAYMENT
-- ============================================
CREATE OR REPLACE FUNCTION fn_record_payment(
  p_caller_id UUID,
  p_invoice_id UUID,
  p_payment_method payment_method,
  p_amount DECIMAL(12,2),
  p_reference_number TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_invoice RECORD;
  v_new_paid_amount DECIMAL(12,2);
  v_new_status invoice_status;
  v_payment_id UUID;
  v_points_earned INTEGER := 0;
  v_loyalty_member_id UUID;
  v_loyalty_tier_id UUID;
  v_point_multiplier DECIMAL(3,2) := 1.0;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Payment amount must be positive' USING ERRCODE = '22000';
  END IF;

  SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVOICE_NOT_FOUND' USING ERRCODE = '22000';
  END IF;

  IF v_invoice.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'INVOICE_CANCELLED: Cannot record payment for cancelled invoice' USING ERRCODE = '22000';
  END IF;

  IF v_invoice.status = 'PAID' THEN
    RAISE EXCEPTION 'INVOICE_ALREADY_PAID: Invoice is already fully paid' USING ERRCODE = '22000';
  END IF;

  v_new_paid_amount := v_invoice.paid_amount + p_amount;

  INSERT INTO payments (
    invoice_id, payment_method, amount, reference_number, notes, created_by
  ) VALUES (
    p_invoice_id, p_payment_method, p_amount, p_reference_number, p_notes, p_caller_id
  ) RETURNING id INTO v_payment_id;

  IF v_new_paid_amount >= v_invoice.total_amount THEN
    v_new_status := 'PAID';
  ELSIF v_new_paid_amount > 0 THEN
    v_new_status := 'PARTIAL_PAYMENT';
  ELSE
    v_new_status := 'UNPAID';
  END IF;

  UPDATE invoices
  SET paid_amount = v_new_paid_amount,
      status = v_new_status,
      updated_at = NOW()
  WHERE id = p_invoice_id;

  IF v_new_status = 'PAID' AND v_invoice.loyalty_points_earned = 0 AND v_invoice.customer_id IS NOT NULL THEN
    SELECT id, tier_id INTO v_loyalty_member_id, v_loyalty_tier_id
    FROM loyalty_members
    WHERE customer_id = v_invoice.customer_id;

    IF v_loyalty_member_id IS NOT NULL AND v_loyalty_tier_id IS NOT NULL THEN
      SELECT point_multiplier INTO v_point_multiplier FROM loyalty_tiers WHERE id = v_loyalty_tier_id;
    END IF;

    IF v_loyalty_member_id IS NOT NULL THEN
      v_points_earned := fn_calculate_loyalty_points(v_invoice.total_amount) * v_point_multiplier;

      INSERT INTO loyalty_transactions (
        member_id, transaction_type, points, invoice_id, description
      ) VALUES (
        v_loyalty_member_id, 'EARN', v_points_earned, p_invoice_id,
        'Earned from invoice ' || v_invoice.invoice_number
      );

      UPDATE loyalty_members
      SET total_points = total_points + v_points_earned,
          available_points = available_points + v_points_earned,
          total_spending = total_spending + v_invoice.total_amount,
          updated_at = NOW()
      WHERE id = v_loyalty_member_id;

      UPDATE invoices
      SET loyalty_points_earned = v_points_earned,
          updated_at = NOW()
      WHERE id = p_invoice_id;
    END IF;
  END IF;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    p_caller_id, 'RECORD_PAYMENT', 'invoices', p_invoice_id,
    jsonb_build_object('paid_amount', v_invoice.paid_amount, 'status', v_invoice.status),
    jsonb_build_object('paid_amount', v_new_paid_amount, 'status', v_new_status, 'payment_id', v_payment_id)
  );

  RETURN jsonb_build_object(
    'payment', jsonb_build_object(
      'id', v_payment_id,
      'invoice_id', p_invoice_id,
      'payment_method', p_payment_method,
      'amount', p_amount,
      'reference_number', p_reference_number,
      'notes', p_notes,
      'created_by', p_caller_id,
      'created_at', NOW()
    ),
    'invoice', jsonb_build_object(
      'id', v_invoice.id,
      'invoice_number', v_invoice.invoice_number,
      'paid_amount', v_new_paid_amount,
      'status', v_new_status,
      'loyalty_points_earned', v_invoice.loyalty_points_earned + v_points_earned
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CANCEL INVOICE
-- ============================================
CREATE OR REPLACE FUNCTION fn_cancel_invoice(
  p_caller_id UUID,
  p_invoice_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_invoice RECORD;
  v_item RECORD;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVOICE_NOT_FOUND' USING ERRCODE = '22000';
  END IF;

  IF v_invoice.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'ALREADY_CANCELLED: Invoice is already cancelled' USING ERRCODE = '22000';
  END IF;

  UPDATE invoices
  SET status = 'CANCELLED',
      notes = COALESCE(notes, '') || COALESCE(' | Cancelled: ' || p_reason, ''),
      updated_at = NOW()
  WHERE id = p_invoice_id;

  FOR v_item IN SELECT * FROM invoice_items WHERE invoice_id = p_invoice_id
  LOOP
    IF v_item.item_type = 'PRODUCT' AND v_item.product_id IS NOT NULL THEN
      UPDATE products
      SET stock_quantity = stock_quantity + v_item.quantity,
          updated_at = NOW()
      WHERE id = v_item.product_id;

      INSERT INTO stock_movements (
        product_id, movement_type, quantity, reference_type, reference_id, notes, created_by
      ) VALUES (
        v_item.product_id, 'RETURN', v_item.quantity,
        'invoice', p_invoice_id, 'Invoice cancellation', p_caller_id
      );
    END IF;
  END LOOP;

  IF v_invoice.loyalty_points_redeemed > 0 THEN
    INSERT INTO loyalty_transactions (
      member_id, transaction_type, points, invoice_id, description
    ) VALUES (
      (SELECT id FROM loyalty_members WHERE customer_id = v_invoice.customer_id),
      'ADJUST', v_invoice.loyalty_points_redeemed, p_invoice_id,
      'Reversed redeemed points for cancelled invoice ' || v_invoice.invoice_number
    );

    UPDATE loyalty_members
    SET available_points = available_points + v_invoice.loyalty_points_redeemed,
        total_points = total_points + v_invoice.loyalty_points_redeemed,
        updated_at = NOW()
    WHERE customer_id = v_invoice.customer_id;
  END IF;

  IF v_invoice.promotion_id IS NOT NULL THEN
    UPDATE promotions
    SET current_usage = current_usage - 1,
        updated_at = NOW()
    WHERE id = v_invoice.promotion_id;

    DELETE FROM promotion_usage WHERE invoice_id = p_invoice_id;
  END IF;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    p_caller_id, 'CANCEL_INVOICE', 'invoices', p_invoice_id,
    jsonb_build_object('status', v_invoice.status),
    jsonb_build_object('status', 'CANCELLED', 'reason', p_reason)
  );

  RETURN jsonb_build_object(
    'id', v_invoice.id,
    'invoice_number', v_invoice.invoice_number,
    'status', 'CANCELLED',
    'updated_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET DAILY SALES
-- ============================================
CREATE OR REPLACE FUNCTION fn_get_daily_sales(
  p_caller_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_result JSONB;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'date', p_date,
    'total_sales', COALESCE(SUM(total_amount), 0),
    'total_transactions', COUNT(*),
    'total_items', COALESCE((
      SELECT SUM(quantity)
      FROM invoice_items
      WHERE invoice_id IN (
        SELECT id FROM invoices WHERE DATE(created_at) = p_date AND status != 'CANCELLED'
      )
    ), 0)
  ) INTO v_result
  FROM invoices
  WHERE DATE(created_at) = p_date
    AND status != 'CANCELLED';

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT EXECUTE TO authenticated
-- ============================================
GRANT EXECUTE ON FUNCTION fn_generate_invoice_number(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_calculate_loyalty_points(DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_get_promotion_discount(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_create_invoice(UUID, invoice_type, UUID, JSONB, DECIMAL, DECIMAL, UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_record_payment(UUID, UUID, payment_method, DECIMAL, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_cancel_invoice(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_get_daily_sales(UUID, DATE) TO authenticated;
