-- ============================================
-- COMPLETE RLS POLICIES
-- ============================================
-- This migration enables Row Level Security on all tables
-- and creates comprehensive policies for each table.
-- Depends on: 000001 (tables), 000002 (helper functions), 000003 (auth functions)
-- ============================================

-- ============================================
-- USERS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_authenticated" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "users_insert_owner_staff" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) = 'OWNER'
    AND role IN ('ADMIN', 'DOKTER', 'KASIR')
  );

CREATE POLICY "users_insert_owner_admin_customer" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('OWNER', 'ADMIN')
    AND role = 'CUSTOMER'
  );

CREATE POLICY "users_update_self" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_owner" ON users
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) = 'OWNER');

CREATE POLICY "users_update_admin_customer" ON users
  FOR UPDATE TO authenticated
  USING (
    get_user_role(auth.uid()) = 'ADMIN'
    AND role = 'CUSTOMER'
  );

CREATE POLICY "users_delete_owner" ON users
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) = 'OWNER');

-- ============================================
-- CUSTOMERS
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select_staff" ON customers
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR'));

CREATE POLICY "customers_select_own" ON customers
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "customers_insert_staff" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "customers_update_staff" ON customers
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "customers_update_own" ON customers
  FOR UPDATE TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "customers_delete_staff" ON customers
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PETS
-- ============================================
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets_select_staff" ON pets
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR'));

CREATE POLICY "pets_select_own" ON pets
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "pets_insert_staff" ON pets
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "pets_update_staff" ON pets
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "pets_delete_staff" ON pets
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PET WEIGHT LOGS
-- ============================================
ALTER TABLE pet_weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_weight_logs_select_staff" ON pet_weight_logs
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR'));

CREATE POLICY "pet_weight_logs_select_own" ON pet_weight_logs
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND pet_id IN (
      SELECT id FROM pets WHERE customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "pet_weight_logs_insert_staff" ON pet_weight_logs
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER'));

CREATE POLICY "pet_weight_logs_delete_staff" ON pet_weight_logs
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PET VACCINES
-- ============================================
ALTER TABLE pet_vaccines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_vaccines_select_staff" ON pet_vaccines
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR'));

CREATE POLICY "pet_vaccines_select_own" ON pet_vaccines
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND pet_id IN (
      SELECT id FROM pets WHERE customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "pet_vaccines_insert_staff" ON pet_vaccines
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER'));

CREATE POLICY "pet_vaccines_update_staff" ON pet_vaccines
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER'));

CREATE POLICY "pet_vaccines_delete_staff" ON pet_vaccines
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PET DISEASES
-- ============================================
ALTER TABLE pet_diseases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_diseases_select_staff" ON pet_diseases
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR'));

CREATE POLICY "pet_diseases_select_own" ON pet_diseases
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND pet_id IN (
      SELECT id FROM pets WHERE customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "pet_diseases_insert_staff" ON pet_diseases
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER'));

CREATE POLICY "pet_diseases_delete_staff" ON pet_diseases
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PET ALLERGIES
-- ============================================
ALTER TABLE pet_allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_allergies_select_staff" ON pet_allergies
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR'));

CREATE POLICY "pet_allergies_select_own" ON pet_allergies
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND pet_id IN (
      SELECT id FROM pets WHERE customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "pet_allergies_insert_staff" ON pet_allergies
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER'));

CREATE POLICY "pet_allergies_delete_staff" ON pet_allergies
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- APPOINTMENTS
-- ============================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select_staff" ON appointments
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER', 'KASIR'));

CREATE POLICY "appointments_select_own" ON appointments
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "appointments_insert_staff" ON appointments
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "appointments_insert_own" ON appointments
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "appointments_update_staff" ON appointments
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER'));

CREATE POLICY "appointments_delete_staff" ON appointments
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- MEDICAL RECORDS
-- ============================================
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medical_records_select_staff" ON medical_records
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'DOKTER'));

CREATE POLICY "medical_records_select_own" ON medical_records
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND appointment_id IN (
      SELECT id FROM appointments
      WHERE customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "medical_records_insert_doctor" ON medical_records
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'DOKTER');

CREATE POLICY "medical_records_update_creator" ON medical_records
  FOR UPDATE TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('OWNER', 'ADMIN')
    OR doctor_id = auth.uid()
  );

CREATE POLICY "medical_records_delete_staff" ON medical_records
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PROCEDURES
-- ============================================
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "procedures_select_authenticated" ON procedures
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "procedures_insert_staff" ON procedures
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "procedures_update_staff" ON procedures
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "procedures_delete_staff" ON procedures
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- ROOMS (Pet Hotel)
-- ============================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select_staff" ON rooms
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "rooms_select_customer" ON rooms
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = 'CUSTOMER');

CREATE POLICY "rooms_insert_staff" ON rooms
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "rooms_update_staff" ON rooms
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "rooms_delete_staff" ON rooms
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PET HOTEL BOOKINGS
-- ============================================
ALTER TABLE pet_hotel_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_hotel_bookings_select_staff" ON pet_hotel_bookings
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "pet_hotel_bookings_select_own" ON pet_hotel_bookings
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "pet_hotel_bookings_insert_staff" ON pet_hotel_bookings
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "pet_hotel_bookings_insert_own" ON pet_hotel_bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "pet_hotel_bookings_update_staff" ON pet_hotel_bookings
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "pet_hotel_bookings_delete_staff" ON pet_hotel_bookings
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PET HOTEL LOGS
-- ============================================
ALTER TABLE pet_hotel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pet_hotel_logs_select_staff" ON pet_hotel_logs
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "pet_hotel_logs_select_own" ON pet_hotel_logs
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND booking_id IN (
      SELECT id FROM pet_hotel_bookings
      WHERE customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "pet_hotel_logs_insert_staff" ON pet_hotel_logs
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "pet_hotel_logs_delete_staff" ON pet_hotel_logs
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- GROOMING SERVICES
-- ============================================
ALTER TABLE grooming_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grooming_services_select_authenticated" ON grooming_services
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "grooming_services_insert_staff" ON grooming_services
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "grooming_services_update_staff" ON grooming_services
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "grooming_services_delete_staff" ON grooming_services
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- GROOMING BOOKINGS
-- ============================================
ALTER TABLE grooming_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grooming_bookings_select_staff" ON grooming_bookings
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "grooming_bookings_select_own" ON grooming_bookings
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "grooming_bookings_insert_staff" ON grooming_bookings
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "grooming_bookings_insert_own" ON grooming_bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "grooming_bookings_update_staff" ON grooming_bookings
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "grooming_bookings_delete_staff" ON grooming_bookings
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- GROOMING RECORDS
-- ============================================
ALTER TABLE grooming_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grooming_records_select_staff" ON grooming_records
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "grooming_records_select_own" ON grooming_records
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND booking_id IN (
      SELECT id FROM grooming_bookings
      WHERE customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "grooming_records_insert_staff" ON grooming_records
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "grooming_records_delete_staff" ON grooming_records
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- CATEGORIES
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_authenticated" ON categories
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "categories_insert_staff" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "categories_update_staff" ON categories
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "categories_delete_staff" ON categories
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- SUPPLIERS
-- ============================================
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_select_staff" ON suppliers
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "suppliers_insert_staff" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "suppliers_update_staff" ON suppliers
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "suppliers_delete_staff" ON suppliers
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PRODUCTS
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_authenticated" ON products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "products_insert_staff" ON products
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "products_update_staff" ON products
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "products_delete_staff" ON products
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_variants_select_authenticated" ON product_variants
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "product_variants_insert_staff" ON product_variants
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "product_variants_update_staff" ON product_variants
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "product_variants_delete_staff" ON product_variants
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PRODUCT BUNDLES
-- ============================================
ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_bundles_select_authenticated" ON product_bundles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "product_bundles_insert_staff" ON product_bundles
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "product_bundles_update_staff" ON product_bundles
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "product_bundles_delete_staff" ON product_bundles
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PRODUCT BUNDLE ITEMS
-- ============================================
ALTER TABLE product_bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_bundle_items_select_authenticated" ON product_bundle_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "product_bundle_items_insert_staff" ON product_bundle_items
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "product_bundle_items_update_staff" ON product_bundle_items
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "product_bundle_items_delete_staff" ON product_bundle_items
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- STOCK MOVEMENTS
-- ============================================
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_movements_select_staff" ON stock_movements
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "stock_movements_insert_staff" ON stock_movements
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PURCHASE ORDERS
-- ============================================
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchase_orders_select_staff" ON purchase_orders
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "purchase_orders_insert_staff" ON purchase_orders
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "purchase_orders_update_staff" ON purchase_orders
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "purchase_orders_delete_staff" ON purchase_orders
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PURCHASE ORDER ITEMS
-- ============================================
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchase_order_items_select_staff" ON purchase_order_items
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "purchase_order_items_insert_staff" ON purchase_order_items
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "purchase_order_items_update_staff" ON purchase_order_items
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "purchase_order_items_delete_staff" ON purchase_order_items
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- INVOICES
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_staff" ON invoices
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "invoices_select_own" ON invoices
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "invoices_insert_staff" ON invoices
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "invoices_update_staff" ON invoices
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

-- ============================================
-- INVOICE ITEMS
-- ============================================
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_items_select_staff" ON invoice_items
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "invoice_items_select_own" ON invoice_items
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND invoice_id IN (
      SELECT id FROM invoices
      WHERE customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "invoice_items_insert_staff" ON invoice_items
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "invoice_items_delete_staff" ON invoice_items
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PAYMENTS
-- ============================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_staff" ON payments
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "payments_select_own" ON payments
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND invoice_id IN (
      SELECT id FROM invoices
      WHERE customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "payments_insert_staff" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

-- ============================================
-- CASH SHIFTS
-- ============================================
ALTER TABLE cash_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cash_shifts_select_staff" ON cash_shifts
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "cash_shifts_select_own" ON cash_shifts
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'KASIR'
    AND kasir_id = auth.uid()
  );

CREATE POLICY "cash_shifts_insert_kasir" ON cash_shifts
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR')
  );

CREATE POLICY "cash_shifts_update_staff" ON cash_shifts
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

-- ============================================
-- LOYALTY TIERS
-- ============================================
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loyalty_tiers_select_authenticated" ON loyalty_tiers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "loyalty_tiers_insert_staff" ON loyalty_tiers
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "loyalty_tiers_update_staff" ON loyalty_tiers
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "loyalty_tiers_delete_staff" ON loyalty_tiers
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- LOYALTY MEMBERS
-- ============================================
ALTER TABLE loyalty_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loyalty_members_select_staff" ON loyalty_members
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "loyalty_members_select_own" ON loyalty_members
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "loyalty_members_insert_staff" ON loyalty_members
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "loyalty_members_update_staff" ON loyalty_members
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- LOYALTY TRANSACTIONS
-- ============================================
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loyalty_transactions_select_staff" ON loyalty_transactions
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "loyalty_transactions_select_own" ON loyalty_transactions
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND member_id IN (
      SELECT id FROM loyalty_members
      WHERE customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "loyalty_transactions_insert_staff" ON loyalty_transactions
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

-- ============================================
-- PROMOTIONS
-- ============================================
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotions_select_authenticated" ON promotions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "promotions_insert_staff" ON promotions
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "promotions_update_staff" ON promotions
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "promotions_delete_staff" ON promotions
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- PROMOTION USAGE
-- ============================================
ALTER TABLE promotion_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotion_usage_select_staff" ON promotion_usage
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

CREATE POLICY "promotion_usage_select_own" ON promotion_usage
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "promotion_usage_insert_staff" ON promotion_usage
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN', 'KASIR'));

-- ============================================
-- EXPENSE CATEGORIES
-- ============================================
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expense_categories_select_staff" ON expense_categories
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "expense_categories_insert_staff" ON expense_categories
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "expense_categories_update_staff" ON expense_categories
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "expense_categories_delete_staff" ON expense_categories
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- EXPENSES
-- ============================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select_staff" ON expenses
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "expenses_insert_staff" ON expenses
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "expenses_update_staff" ON expenses
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "expenses_delete_staff" ON expenses
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- CUSTOMER FEEDBACK
-- ============================================
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_feedback_select_staff" ON customer_feedback
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "customer_feedback_select_own" ON customer_feedback
  FOR SELECT TO authenticated
  USING (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "customer_feedback_insert_own" ON customer_feedback
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) = 'CUSTOMER'
    AND customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "customer_feedback_delete_staff" ON customer_feedback
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

-- ============================================
-- AUDIT LOGS
-- ============================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_staff" ON audit_logs
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) IN ('OWNER', 'ADMIN'));

CREATE POLICY "audit_logs_insert_system" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================
-- NOTIFICATIONS
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
