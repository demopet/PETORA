-- ============================================
-- LOYALTY, PROMOTIONS, EXPENSES & REPORTS RPC
-- ============================================
-- This migration creates atomic RPC functions for
-- loyalty program, promotions management, expenses
-- management, and financial reports.
-- ============================================

-- ============================================
-- LOYALTY FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION fn_earn_loyalty_points(
  p_customer_id UUID,
  p_invoice_id UUID,
  p_total_amount DECIMAL(12,2),
  p_caller_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_member_id UUID;
  v_tier_id UUID;
  v_point_multiplier DECIMAL(3,2) := 1.0;
  v_base_points INTEGER;
  v_final_points INTEGER;
  v_transaction_id UUID;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT id, tier_id INTO v_member_id, v_tier_id
  FROM loyalty_members
  WHERE customer_id = p_customer_id;

  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'LOYALTY_MEMBER_NOT_FOUND' USING ERRCODE = '22000';
  END IF;

  IF v_tier_id IS NOT NULL THEN
    SELECT point_multiplier INTO v_point_multiplier
    FROM loyalty_tiers
    WHERE id = v_tier_id;
  END IF;

  v_base_points := FLOOR(p_total_amount / 10000);
  v_final_points := FLOOR(v_base_points * v_point_multiplier);

  IF v_final_points <= 0 THEN
    RETURN jsonb_build_object(
      'member_id', v_member_id,
      'points', 0,
      'transaction_id', NULL
    );
  END IF;

  UPDATE loyalty_members
  SET total_points = total_points + v_final_points,
      available_points = available_points + v_final_points,
      total_spending = total_spending + p_total_amount,
      updated_at = NOW()
  WHERE id = v_member_id;

  INSERT INTO loyalty_transactions (member_id, transaction_type, points, invoice_id, description)
  VALUES (v_member_id, 'EARN', v_final_points, p_invoice_id, 'Earned from invoice')
  RETURNING id INTO v_transaction_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (
    p_caller_id, 'EARN_LOYALTY_POINTS', 'loyalty_transactions', v_transaction_id,
    jsonb_build_object(
      'member_id', v_member_id,
      'points', v_final_points,
      'invoice_id', p_invoice_id,
      'total_amount', p_total_amount
    )
  );

  PERFORM fn_check_tier_upgrade(v_member_id, p_caller_id);

  RETURN jsonb_build_object(
    'member_id', v_member_id,
    'points', v_final_points,
    'transaction_id', v_transaction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_redeem_loyalty_points(
  p_customer_id UUID,
  p_points_to_redeem INTEGER,
  p_invoice_id UUID DEFAULT NULL,
  p_caller_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_member_id UUID;
  v_available_points INTEGER;
  v_discount_value DECIMAL(12,2);
  v_transaction_id UUID;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF p_points_to_redeem <= 0 THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Points to redeem must be positive' USING ERRCODE = '22000';
  END IF;

  SELECT id, available_points INTO v_member_id, v_available_points
  FROM loyalty_members
  WHERE customer_id = p_customer_id;

  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'LOYALTY_MEMBER_NOT_FOUND' USING ERRCODE = '22000';
  END IF;

  IF v_available_points < p_points_to_redeem THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS' USING ERRCODE = '22000';
  END IF;

  v_discount_value := p_points_to_redeem * 100;

  UPDATE loyalty_members
  SET available_points = available_points - p_points_to_redeem,
      total_points = total_points - p_points_to_redeem,
      updated_at = NOW()
  WHERE id = v_member_id;

  INSERT INTO loyalty_transactions (member_id, transaction_type, points, invoice_id, description)
  VALUES (v_member_id, 'REDEEM', -p_points_to_redeem, p_invoice_id, 'Redeemed points')
  RETURNING id INTO v_transaction_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (
    p_caller_id, 'REDEEM_LOYALTY_POINTS', 'loyalty_transactions', v_transaction_id,
    jsonb_build_object(
      'member_id', v_member_id,
      'points', -p_points_to_redeem,
      'invoice_id', p_invoice_id,
      'discount_value', v_discount_value
    )
  );

  RETURN jsonb_build_object(
    'transaction', jsonb_build_object(
      'id', v_transaction_id,
      'member_id', v_member_id,
      'transaction_type', 'REDEEM',
      'points', -p_points_to_redeem,
      'invoice_id', p_invoice_id
    ),
    'discount_value', v_discount_value
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_reverse_loyalty_points(
  p_transaction_id UUID,
  p_caller_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_transaction RECORD;
  v_member_id UUID;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_transaction FROM loyalty_transactions WHERE id = p_transaction_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: transaction not found' USING ERRCODE = '22000';
  END IF;

  IF v_transaction.transaction_type != 'EARN' THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Can only reverse EARN transactions' USING ERRCODE = '22000';
  END IF;

  v_member_id := v_transaction.member_id;

  UPDATE loyalty_members
  SET total_points = total_points - v_transaction.points,
      available_points = available_points - v_transaction.points,
      total_spending = total_spending - 0,
      updated_at = NOW()
  WHERE id = v_member_id;

  INSERT INTO loyalty_transactions (member_id, transaction_type, points, invoice_id, description)
  VALUES (v_member_id, 'ADJUST', -v_transaction.points, v_transaction.invoice_id, 'Reversed points');

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    p_caller_id, 'REVERSE_LOYALTY_POINTS', 'loyalty_transactions', p_transaction_id,
    jsonb_build_object('points', v_transaction.points),
    jsonb_build_object('reversed', true)
  );

  RETURN jsonb_build_object('reversed', true, 'transaction_id', p_transaction_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_check_tier_upgrade(
  p_member_id UUID,
  p_caller_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_member RECORD;
  v_current_tier_id UUID;
  v_qualified_tier_id UUID;
  v_tier loyalty_tiers%ROWTYPE;
  v_upgraded BOOLEAN := FALSE;
  v_new_tier_name loyalty_tier;
BEGIN
  SELECT * INTO v_member FROM loyalty_members WHERE id = p_member_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('upgraded', FALSE);
  END IF;

  v_current_tier_id := v_member.tier_id;

  FOR v_tier IN
    SELECT * FROM loyalty_tiers ORDER BY min_points ASC
  LOOP
    IF v_member.total_points >= v_tier.min_points OR v_member.total_spending >= v_tier.min_spending THEN
      v_qualified_tier_id := v_tier.id;
      v_new_tier_name := v_tier.tier_name;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  IF v_qualified_tier_id IS NOT NULL AND v_qualified_tier_id != v_current_tier_id THEN
    UPDATE loyalty_members
    SET tier_id = v_qualified_tier_id,
        updated_at = NOW()
    WHERE id = p_member_id;

    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES (
      (SELECT customer_id FROM loyalty_members WHERE id = p_member_id),
      'Tier Upgraded!',
      'Congratulations! You have been upgraded to ' || v_new_tier_name,
      'LOYALTY_TIER_UPGRADE',
      jsonb_build_object('new_tier', v_new_tier_name, 'member_id', p_member_id)
    );

    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (
      p_caller_id, 'CHECK_TIER_UPGRADE', 'loyalty_members', p_member_id,
      jsonb_build_object('tier_id', v_current_tier_id),
      jsonb_build_object('tier_id', v_qualified_tier_id, 'tier_name', v_new_tier_name)
    );

    v_upgraded := TRUE;
  END IF;

  RETURN jsonb_build_object('upgraded', v_upgraded, 'new_tier', v_new_tier_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- PROMOTION FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION fn_create_promotion(
  p_caller_id UUID,
  p_code VARCHAR(50) DEFAULT NULL,
  p_name VARCHAR(200),
  p_description TEXT DEFAULT NULL,
  p_promotion_type promotion_type,
  p_discount_value DECIMAL(12,2),
  p_min_purchase DECIMAL(12,2) DEFAULT 0,
  p_max_usage INTEGER DEFAULT NULL,
  p_start_date DATE,
  p_end_date DATE,
  p_applicable_products UUID[] DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_promotion_id UUID;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF p_code IS NOT NULL AND EXISTS (SELECT 1 FROM promotions WHERE code = p_code) THEN
    RAISE EXCEPTION 'CONFLICT: promotion code already exists' USING ERRCODE = '23505';
  END IF;

  INSERT INTO promotions (
    code, name, description, promotion_type, discount_value,
    min_purchase, max_usage, start_date, end_date, applicable_products, status
  ) VALUES (
    p_code, p_name, p_description, p_promotion_type, p_discount_value,
    p_min_purchase, p_max_usage, p_start_date, p_end_date, p_applicable_products, 'ACTIVE'
  ) RETURNING id INTO v_promotion_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (
    p_caller_id, 'CREATE_PROMOTION', 'promotions', v_promotion_id,
    jsonb_build_object(
      'code', p_code, 'name', p_name, 'promotion_type', p_promotion_type,
      'discount_value', p_discount_value, 'min_purchase', p_min_purchase,
      'start_date', p_start_date, 'end_date', p_end_date
    )
  );

  RETURN jsonb_build_object('id', v_promotion_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_update_promotion(
  p_caller_id UUID,
  p_promotion_id UUID,
  p_name VARCHAR(200) DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_discount_value DECIMAL(12,2) DEFAULT NULL,
  p_min_purchase DECIMAL(12,2) DEFAULT NULL,
  p_max_usage INTEGER DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_applicable_products UUID[] DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_old_values JSONB;
  v_new_values JSONB;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM promotions WHERE id = p_promotion_id) THEN
    RAISE EXCEPTION 'PROMO_NOT_FOUND' USING ERRCODE = '22000';
  END IF;

  SELECT jsonb_build_object(
    'name', name, 'description', description, 'discount_value', discount_value,
    'min_purchase', min_purchase, 'max_usage', max_usage,
    'start_date', start_date, 'end_date', end_date, 'applicable_products', applicable_products
  ) INTO v_old_values FROM promotions WHERE id = p_promotion_id;

  UPDATE promotions
  SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    discount_value = COALESCE(p_discount_value, discount_value),
    min_purchase = COALESCE(p_min_purchase, min_purchase),
    max_usage = COALESCE(p_max_usage, max_usage),
    start_date = COALESCE(p_start_date, start_date),
    end_date = COALESCE(p_end_date, end_date),
    applicable_products = COALESCE(p_applicable_products, applicable_products),
    updated_at = NOW()
  WHERE id = p_promotion_id;

  SELECT jsonb_build_object(
    'name', name, 'description', description, 'discount_value', discount_value,
    'min_purchase', min_purchase, 'max_usage', max_usage,
    'start_date', start_date, 'end_date', end_date, 'applicable_products', applicable_products
  ) INTO v_new_values FROM promotions WHERE id = p_promotion_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    p_caller_id, 'UPDATE_PROMOTION', 'promotions', p_promotion_id,
    v_old_values, v_new_values
  );

  RETURN jsonb_build_object('id', p_promotion_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_cancel_promotion(
  p_caller_id UUID,
  p_promotion_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_old_values JSONB;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM promotions WHERE id = p_promotion_id) THEN
    RAISE EXCEPTION 'PROMO_NOT_FOUND' USING ERRCODE = '22000';
  END IF;

  SELECT jsonb_build_object(
    'status', status, 'updated_at', updated_at
  ) INTO v_old_values FROM promotions WHERE id = p_promotion_id;

  UPDATE promotions
  SET status = 'CANCELLED', updated_at = NOW()
  WHERE id = p_promotion_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    p_caller_id, 'CANCEL_PROMOTION', 'promotions', p_promotion_id,
    v_old_values, jsonb_build_object('status', 'CANCELLED')
  );

  RETURN jsonb_build_object('id', p_promotion_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_validate_promo_code(
  p_code VARCHAR(50),
  p_subtotal DECIMAL(12,2),
  p_customer_id UUID DEFAULT NULL,
  p_items JSONB DEFAULT NULL,
  p_caller_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_promotion RECORD;
  v_discount_amount DECIMAL(12,2) := 0;
  v_applicable BOOLEAN := TRUE;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN', 'KASIR', 'CUSTOMER') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_promotion FROM promotions WHERE code = p_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROMO_NOT_FOUND' USING ERRCODE = '22000';
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

  IF v_promotion.applicable_products IS NOT NULL AND jsonb_array_length(v_promotion.applicable_products) > 0 THEN
    IF p_items IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(p_items) AS item
        WHERE (item->>'product_id')::UUID = ANY(v_promotion.applicable_products)
      ) THEN
        RAISE EXCEPTION 'PROMOTION_INVALID: No applicable products in cart' USING ERRCODE = '22000';
      END IF;
    END IF;
  END IF;

  IF v_promotion.promotion_type = 'PERCENTAGE' THEN
    v_discount_amount := p_subtotal * (v_promotion.discount_value / 100);
  ELSIF v_promotion.promotion_type = 'FIXED' THEN
    v_discount_amount := v_promotion.discount_value;
  ELSE
    v_discount_amount := v_promotion.discount_value;
  END IF;

  v_discount_amount := LEAST(v_discount_amount, p_subtotal);

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (
    p_caller_id, 'VALIDATE_PROMO_CODE', 'promotions', v_promotion.id,
    jsonb_build_object(
      'code', p_code, 'subtotal', p_subtotal,
      'discount_amount', v_discount_amount, 'valid', TRUE
    )
  );

  RETURN jsonb_build_object(
    'valid', TRUE,
    'promotion', jsonb_build_object(
      'id', v_promotion.id,
      'code', v_promotion.code,
      'name', v_promotion.name,
      'promotion_type', v_promotion.promotion_type,
      'discount_value', v_promotion.discount_value
    ),
    'discount_amount', v_discount_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- EXPENSE FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION fn_create_expense(
  p_caller_id UUID,
  p_expense_date DATE,
  p_category_id UUID,
  p_amount DECIMAL(12,2),
  p_description TEXT DEFAULT NULL,
  p_receipt_url TEXT DEFAULT NULL,
  p_is_recurring BOOLEAN DEFAULT FALSE,
  p_recurring_day INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_expense_id UUID;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF p_expense_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Expense date cannot be in the future' USING ERRCODE = '22000';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Amount must be positive' USING ERRCODE = '22000';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM expense_categories WHERE id = p_category_id AND is_active = TRUE) THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Invalid expense category' USING ERRCODE = '22000';
  END IF;

  INSERT INTO expenses (
    expense_date, category_id, amount, description, receipt_url,
    status, is_recurring, recurring_day, created_by
  ) VALUES (
    p_expense_date, p_category_id, p_amount, p_description, p_receipt_url,
    'PENDING', p_is_recurring, p_recurring_day, p_caller_id
  ) RETURNING id INTO v_expense_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
  VALUES (
    p_caller_id, 'CREATE_EXPENSE', 'expenses', v_expense_id,
    jsonb_build_object(
      'expense_date', p_expense_date, 'category_id', p_category_id,
      'amount', p_amount, 'description', p_description,
      'is_recurring', p_is_recurring, 'recurring_day', p_recurring_day
    )
  );

  RETURN jsonb_build_object('id', v_expense_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_update_expense(
  p_caller_id UUID,
  p_expense_id UUID,
  p_status expense_status DEFAULT NULL,
  p_amount DECIMAL(12,2) DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_old_values JSONB;
  v_new_values JSONB;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM expenses WHERE id = p_expense_id) THEN
    RAISE EXCEPTION 'NOT_FOUND: expense not found' USING ERRCODE = '22000';
  END IF;

  SELECT jsonb_build_object(
    'status', status, 'amount', amount, 'description', description
  ) INTO v_old_values FROM expenses WHERE id = p_expense_id;

  UPDATE expenses
  SET
    status = COALESCE(p_status, status),
    amount = COALESCE(p_amount, amount),
    description = COALESCE(p_description, description),
    updated_at = NOW()
  WHERE id = p_expense_id;

  SELECT jsonb_build_object(
    'status', status, 'amount', amount, 'description', description
  ) INTO v_new_values FROM expenses WHERE id = p_expense_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    p_caller_id, 'UPDATE_EXPENSE', 'expenses', p_expense_id,
    v_old_values, v_new_values
  );

  RETURN jsonb_build_object('id', p_expense_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_approve_expense(
  p_caller_id UUID,
  p_expense_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_old_status expense_status;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role != 'OWNER' THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT status INTO v_old_status FROM expenses WHERE id = p_expense_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: expense not found' USING ERRCODE = '22000';
  END IF;

  IF v_old_status != 'PENDING' THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Can only approve PENDING expenses' USING ERRCODE = '22000';
  END IF;

  UPDATE expenses
  SET status = 'APPROVED', approved_by = p_caller_id, updated_at = NOW()
  WHERE id = p_expense_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    p_caller_id, 'APPROVE_EXPENSE', 'expenses', p_expense_id,
    jsonb_build_object('status', v_old_status),
    jsonb_build_object('status', 'APPROVED')
  );

  RETURN jsonb_build_object('id', p_expense_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_reject_expense(
  p_caller_id UUID,
  p_expense_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_old_status expense_status;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role != 'OWNER' THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT status INTO v_old_status FROM expenses WHERE id = p_expense_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: expense not found' USING ERRCODE = '22000';
  END IF;

  IF v_old_status != 'PENDING' THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Can only reject PENDING expenses' USING ERRCODE = '22000';
  END IF;

  UPDATE expenses
  SET status = 'REJECTED', updated_at = NOW()
  WHERE id = p_expense_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    p_caller_id, 'REJECT_EXPENSE', 'expenses', p_expense_id,
    jsonb_build_object('status', v_old_status),
    jsonb_build_object('status', 'REJECTED')
  );

  RETURN jsonb_build_object('id', p_expense_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_reverse_expense(
  p_caller_id UUID,
  p_expense_id UUID,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_old_status expense_status;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role != 'OWNER' THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT status INTO v_old_status FROM expenses WHERE id = p_expense_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: expense not found' USING ERRCODE = '22000';
  END IF;

  IF v_old_status != 'APPROVED' THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Can only reverse APPROVED expenses' USING ERRCODE = '22000';
  END IF;

  UPDATE expenses
  SET status = 'REVERSED', updated_at = NOW()
  WHERE id = p_expense_id;

  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    p_caller_id, 'REVERSE_EXPENSE', 'expenses', p_expense_id,
    jsonb_build_object('status', v_old_status),
    jsonb_build_object('status', 'REVERSED', 'reason', p_reason)
  );

  RETURN jsonb_build_object('id', p_expense_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- REPORT FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION fn_get_revenue_report(
  p_start_date DATE,
  p_end_date DATE,
  p_group_by TEXT,
  p_caller_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_result JSONB;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF p_group_by NOT IN ('day', 'week', 'month') THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: group_by must be day, week, or month' USING ERRCODE = '22000';
  END IF;

  IF p_group_by = 'day' THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'period', TO_CHAR(created_at, 'YYYY-MM-DD'),
        'invoice_type', invoice_type,
        'total_revenue', SUM(total_amount),
        'transaction_count', COUNT(*)
      )
    ) INTO v_result
    FROM invoices
    WHERE status = 'PAID'
      AND created_at >= p_start_date
      AND created_at < p_end_date + INTERVAL '1 day'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD'), invoice_type
    ORDER BY period;
  ELSIF p_group_by = 'week' THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'period', 'W' || TO_CHAR(created_at, 'IW') || '-' || TO_CHAR(created_at, 'YYYY'),
        'invoice_type', invoice_type,
        'total_revenue', SUM(total_amount),
        'transaction_count', COUNT(*)
      )
    ) INTO v_result
    FROM invoices
    WHERE status = 'PAID'
      AND created_at >= p_start_date
      AND created_at < p_end_date + INTERVAL '1 day'
    GROUP BY TO_CHAR(created_at, 'IW'), TO_CHAR(created_at, 'YYYY'), invoice_type
    ORDER BY period;
  ELSIF p_group_by = 'month' THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'period', TO_CHAR(created_at, 'YYYY-MM'),
        'invoice_type', invoice_type,
        'total_revenue', SUM(total_amount),
        'transaction_count', COUNT(*)
      )
    ) INTO v_result
    FROM invoices
    WHERE status = 'PAID'
      AND created_at >= p_start_date
      AND created_at < p_end_date + INTERVAL '1 day'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM'), invoice_type
    ORDER BY period;
  END IF;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_get_profit_loss_report(
  p_start_date DATE,
  p_end_date DATE,
  p_caller_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_revenue DECIMAL(12,2) := 0;
  v_cogs DECIMAL(12,2) := 0;
  v_expenses DECIMAL(12,2) := 0;
  v_net_profit DECIMAL(12,2) := 0;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(SUM(total_amount), 0) INTO v_revenue
  FROM invoices
  WHERE status = 'PAID'
    AND created_at >= p_start_date
    AND created_at < p_end_date + INTERVAL '1 day';

  SELECT COALESCE(SUM(quantity * unit_price), 0) INTO v_cogs
  FROM invoice_items
  WHERE item_type = 'PRODUCT'
    AND invoice_id IN (
      SELECT id FROM invoices
      WHERE status = 'PAID'
        AND created_at >= p_start_date
        AND created_at < p_end_date + INTERVAL '1 day'
    );

  SELECT COALESCE(SUM(amount), 0) INTO v_expenses
  FROM expenses
  WHERE status = 'APPROVED'
    AND expense_date >= p_start_date
    AND expense_date <= p_end_date;

  v_net_profit := v_revenue - v_cogs - v_expenses;

  RETURN jsonb_build_object(
    'revenue', v_revenue,
    'cogs', v_cogs,
    'expenses', v_expenses,
    'net_profit', v_net_profit,
    'start_date', p_start_date,
    'end_date', p_end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fn_get_inventory_valuation_report(
  p_as_of_date DATE,
  p_caller_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_caller_role user_role;
  v_total_value DECIMAL(12,2) := 0;
  v_items JSONB;
BEGIN
  SELECT get_user_role(p_caller_id) INTO v_caller_role;
  IF v_caller_role NOT IN ('OWNER', 'ADMIN') THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(SUM(stock_quantity * purchase_price), 0) INTO v_total_value
  FROM products
  WHERE is_active = TRUE
    AND stock_quantity > 0;

  SELECT jsonb_agg(
    jsonb_build_object(
      'product_id', id,
      'product_name', name,
      'sku', sku,
      'stock_quantity', stock_quantity,
      'purchase_price', purchase_price,
      'total_value', stock_quantity * purchase_price
    )
  ) INTO v_items
  FROM products
  WHERE is_active = TRUE
    AND stock_quantity > 0
  ORDER BY name;

  RETURN jsonb_build_object(
    'total_value', v_total_value,
    'as_of_date', p_as_of_date,
    'items', COALESCE(v_items, '[]'::JSONB)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
