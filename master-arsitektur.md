# Technical Architecture Contract — Baseline Final
## Petora — Sistem Manajemen Terpadu Petshop & Petcare
### Dokumen Baseline Final | 18 Agustus 2026

---

## Daftar Isi
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Arsitektur Sistem End-to-End](#2-arsitektur-sistem-end-to-end)
3. [Database Schema (Supabase/PostgreSQL)](#3-database-schema-supabasepostgresql)
4. [TypeScript Types & Interfaces](#4-typescript-types--interfaces)
5. [Zod Validation Schemas](#5-zod-validation-schemas)
6. [Service Layer Contracts](#6-service-layer-contracts)
7. [React Query Hooks Contracts](#7-react-query-hooks-contracts)
8. [Component Props Contracts](#8-component-props-contracts)
9. [Row Level Security (RLS) Policies](#9-row-level-security-rls-policies)
10. [State Management Contracts](#10-state-management-contracts)
11. [Utility Functions Contracts](#11-utility-functions-contracts)
12. [Error Handling Contracts](#12-error-handling-contracts)
13. [File Structure Contracts](#13-file-structure-contracts)
14. [Environment Variables](#14-environment-variables)
15. [API Response Envelope](#15-api-response-envelope)
16. [Naming Conventions](#16-naming-conventions)
17. [Migration Strategy](#17-migration-strategy)
18. [Supabase Edge Functions](#18-supabase-edge-functions)
19. [Realtime Subscriptions](#19-realtime-subscriptions)
20. [Storage & File Upload](#20-storage--file-upload)

---

## 1. Ringkasan Eksekutif

Dokumen ini mendefinisikan **kontrak arsitektur teknis baseline final** untuk seluruh sistem **Petora** — sistem manajemen terpadu Petshop & Petcare berbasis React + Vite + TypeScript + Supabase yang di-deploy ke Vercel.

Dokumen ini menjadi **acuan tunggal** bagi developer untuk:
- Membangun database schema di Supabase
- Menulis TypeScript types/interfaces yang konsisten
- Membuat Zod validation schemas untuk runtime validation
- Implementasi service layer (Supabase client wrapper)
- Membuat React Query hooks untuk data fetching
- Mendefinisikan component props yang type-safe
- Menulis RLS policies untuk otorisasi level database
- Mengatur state management (Zustand + React Query)
- Implementasi utility functions yang reusable
- Menangani error secara konsisten di seluruh aplikasi
- Mengatur file structure yang modular
- Mengelola environment variables
- Mendefinisikan API response envelope
- Menetapkan naming conventions
- Merencanakan migration strategy
- Membuat Supabase Edge Functions untuk logika kompleks
- Mengatur realtime subscriptions
- Mengelola file upload ke Supabase Storage

### Prinsip Arsitektur
| Prinsip | Penjelasan |
|---|---|
| **Type-safe** | TypeScript strict mode, Zod untuk runtime validation |
| **Contract-first** | Define interfaces & schemas dulu, implementasi mengikuti |
| **Modular** | Setiap modul memiliki kontrak sendiri, minim coupling |
| **Testable** | Kontrak memudahkan mocking & testing |
| **Documented** | JSDoc untuk setiap interface & function |
| **Secure by default** | RLS policies di level database, validasi di setiap layer |
| **Scalable** | Desain siap untuk multi-cabang di masa depan |
| **Maintainable** | Konvensi naming & struktur yang konsisten |

---

## 2. Arsitektur Sistem End-to-End

### 2.1 Arsitektur High-Level

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React SPA (Vite + TypeScript)                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │  │
│  │  │ Staff      │  │ Customer   │  │ Shared Components  │  │  │
│  │  │ Dashboard  │  │ Portal     │  │ (shadcn/ui)        │  │  │
│  │  │ /app/*     │  │ /portal/*  │  │ /components/*      │  │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘  │  │
│  │         │                │                │                │  │
│  │         └────────────────┼────────────────┘                │  │
│  │                          ▼                                 │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │        React Query + Supabase JS Client              │  │  │
│  │  │  (Caching, Refetching, Optimistic Updates)           │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Platform                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ PostgreSQL   │  │ Auth         │  │ Storage              │  │
│  │ (Database)   │  │ (Sessions)   │  │ (File Uploads)       │  │
│  │ + RLS        │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Realtime     │  │ Edge         │  │ Functions            │  │
│  │ (WebSocket)  │  │ Functions    │  │ (Business Logic)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ WhatsApp     │  │ Payment      │  │ Email                │  │
│  │ Gateway      │  │ Gateway      │  │ Service              │  │
│  │ (Fonnte)     │  │ (Midtrans)   │  │ (Resend)             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Presentation (React Components)                        │
│ - UI Components (shadcn/ui + custom)                            │
│ - Feature Components (modular per domain)                       │
│ - Page Components (routing)                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: Data Fetching (React Query Hooks)                      │
│ - useQuery (GET operations)                                     │
│ - useMutation (POST/PUT/DELETE operations)                      │
│ - Query keys management                                         │
│ - Optimistic updates                                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: Service Layer (Supabase Client Wrappers)               │
│ - Domain-specific services (CustomerService, ProductService)    │
│ - Business logic orchestration                                  │
│ - Data transformation                                           │
│ - Error handling                                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: Validation (Zod Schemas)                               │
│ - Input validation (create/update schemas)                      │
│ - Output validation (response schemas)                          │
│ - Type inference                                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 5: Database (Supabase PostgreSQL + RLS)                   │
│ - Tables & relationships                                        │
│ - Row Level Security policies                                   │
│ - Indexes for performance                                       │
│ - Triggers for automation                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Data Flow

```
User Action
    │
    ▼
Component (UI)
    │
    ▼
React Query Hook (useMutation)
    │
    ▼
Service Layer (validate + transform)
    │
    ▼
Zod Schema (runtime validation)
    │
    ▼
Supabase Client (RPC/Insert/Update/Delete)
    │
    ▼
Supabase Edge Function (optional, complex logic)
    │
    ▼
PostgreSQL (with RLS enforcement)
    │
    ▼
Response → React Query Cache → Component Re-render
```

---

## 3. Database Schema (Supabase/PostgreSQL)

### 3.1 Naming Conventions

| Aspek | Konvensi | Contoh |
|---|---|---|
| Tabel | `snake_case`, plural | `customers`, `medical_records` |
| Kolom | `snake_case` | `created_at`, `customer_id` |
| Primary Key | `id UUID DEFAULT gen_random_uuid()` | — |
| Foreign Key | `<table_singular>_id` | `customer_id`, `pet_id` |
| Timestamp | `created_at`, `updated_at`, `deleted_at` | — |
| Enum | `snake_case` | `appointment_status` |
| Index | `idx_<table>_<column>` | `idx_customers_phone` |
| Unique | `uniq_<table>_<column>` | `uniq_users_username` |
| Function | `fn_<action>_<entity>` | `fn_calculate_loyalty_points` |
| Trigger | `trg_<table>_<action>` | `trg_users_before_insert` |

### 3.2 Complete Schema

```sql
-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN', 'DOKTER', 'KASIR', 'CUSTOMER');
CREATE TYPE appointment_status AS ENUM ('WAITING', 'IN_PROGRESS', 'DONE', 'CANCELLED');
CREATE TYPE medical_record_status AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE room_status AS ENUM ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE');
CREATE TYPE room_cleanliness AS ENUM ('CLEAN', 'DIRTY', 'UNDER_CLEANING');
CREATE TYPE pet_hotel_booking_status AS ENUM ('BOOKED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');
CREATE TYPE grooming_booking_status AS ENUM ('BOOKED', 'IN_PROGRESS', 'DONE', 'CANCELLED');
CREATE TYPE product_status AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE stock_movement_type AS ENUM ('IN', 'OUT', 'RETURN', 'ADJUSTMENT', 'DAMAGED', 'EXPIRED', 'OPNAME');
CREATE TYPE invoice_type AS ENUM ('POS', 'CLINICAL', 'PET_HOTEL', 'GROOMING', 'MIXED');
CREATE TYPE invoice_status AS ENUM ('UNPAID', 'PARTIAL_PAYMENT', 'PAID', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'QRIS', 'TRANSFER', 'E_WALLET', 'CREDIT_CARD', 'MIXED');
CREATE TYPE purchase_order_status AS ENUM ('DRAFT', 'SENT', 'PARTIAL_RECEIVED', 'RECEIVED', 'CANCELLED');
CREATE TYPE loyalty_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');
CREATE TYPE loyalty_transaction_type AS ENUM ('EARN', 'REDEEM', 'EXPIRE', 'ADJUST');
CREATE TYPE promotion_type AS ENUM ('PERCENTAGE', 'FIXED', 'BUNDLE', 'HAPPY_HOUR', 'BIRTHDAY');
CREATE TYPE promotion_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE expense_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVERSED');
CREATE TYPE feedback_rating AS ENUM ('1', '2', '3', '4', '5');
CREATE TYPE pet_hotel_log_type AS ENUM ('FEEDING', 'MEDICINE', 'NOTE');
CREATE TYPE customer_tag AS ENUM ('VIP', 'REGULAR', 'NEW', 'BLACKLIST');

-- ============================================
-- USERS & AUTH
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  role user_role NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_customer_id ON users(customer_id);
CREATE INDEX idx_users_created_by ON users(created_by);

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  emergency_contact VARCHAR(100),
  photo_url TEXT,
  notes TEXT,
  is_guest BOOLEAN DEFAULT FALSE,
  tags customer_tag[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_is_guest ON customers(is_guest);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- ============================================
-- PETS
-- ============================================
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL,
  breed VARCHAR(50),
  birth_date DATE,
  gender VARCHAR(10),
  photo_url TEXT,
  microchip_number VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_pets_customer_id ON pets(customer_id);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_is_active ON pets(is_active);

-- ============================================
-- PET WEIGHT LOGS
-- ============================================
CREATE TABLE pet_weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pet_weight_logs_pet_id ON pet_weight_logs(pet_id);
CREATE INDEX idx_pet_weight_logs_recorded_at ON pet_weight_logs(recorded_at);

-- ============================================
-- PET VACCINES
-- ============================================
CREATE TABLE pet_vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(100) NOT NULL,
  vaccination_date DATE NOT NULL,
  due_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pet_vaccines_pet_id ON pet_vaccines(pet_id);
CREATE INDEX idx_pet_vaccines_due_date ON pet_vaccines(due_date);
CREATE INDEX idx_pet_vaccines_is_active ON pet_vaccines(is_active);

-- ============================================
-- PET DISEASES & ALLERGIES
-- ============================================
CREATE TABLE pet_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  disease_name VARCHAR(100) NOT NULL,
  diagnosed_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pet_allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  allergen VARCHAR(100) NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  pet_id UUID NOT NULL REFERENCES pets(id),
  doctor_id UUID REFERENCES users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  queue_number INTEGER,
  status appointment_status DEFAULT 'WAITING',
  complaint TEXT,
  notes TEXT,
  is_from_portal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================
-- MEDICAL RECORDS
-- ============================================
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number VARCHAR(20) UNIQUE NOT NULL,
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  doctor_id UUID NOT NULL REFERENCES users(id),
  chief_complaint TEXT,
  history TEXT,
  physical_exam TEXT,
  weight_kg DECIMAL(5,2),
  temperature_c DECIMAL(4,1),
  heart_rate_bpm INTEGER,
  respiratory_rate_bpm INTEGER,
  diagnosis TEXT,
  treatment TEXT,
  prescription TEXT,
  lab_results TEXT,
  additional_notes TEXT,
  attachments TEXT[],
  status medical_record_status DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_medical_records_appointment_id ON medical_records(appointment_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_status ON medical_records(status);

-- ============================================
-- PROCEDURES (Master Data)
-- ============================================
CREATE TABLE procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- PET HOTEL ROOMS
-- ============================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  room_number VARCHAR(20),
  room_type VARCHAR(20) NOT NULL,
  price_per_night DECIMAL(12,2) NOT NULL,
  capacity INTEGER DEFAULT 1,
  status room_status DEFAULT 'AVAILABLE',
  cleanliness room_cleanliness DEFAULT 'CLEAN',
  maintenance_status BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- PET HOTEL BOOKINGS
-- ============================================
CREATE TABLE pet_hotel_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  pet_id UUID NOT NULL REFERENCES pets(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  room_id UUID REFERENCES rooms(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  actual_check_in_at TIMESTAMPTZ,
  actual_check_out_at TIMESTAMPTZ,
  price_per_night DECIMAL(12,2),
  total_price DECIMAL(12,2),
  status pet_hotel_booking_status DEFAULT 'BOOKED',
  special_notes TEXT,
  is_from_portal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pet_hotel_bookings_pet_id ON pet_hotel_bookings(pet_id);
CREATE INDEX idx_pet_hotel_bookings_room_id ON pet_hotel_bookings(room_id);
CREATE INDEX idx_pet_hotel_bookings_status ON pet_hotel_bookings(status);

-- ============================================
-- PET HOTEL LOGS
-- ============================================
CREATE TABLE pet_hotel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES pet_hotel_bookings(id) ON DELETE CASCADE,
  log_type pet_hotel_log_type NOT NULL,
  description TEXT,
  photo_urls TEXT[],
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pet_hotel_logs_booking_id ON pet_hotel_logs(booking_id);

-- ============================================
-- GROOMING SERVICES
-- ============================================
CREATE TABLE grooming_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_price DECIMAL(12,2) NOT NULL,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- GROOMING BOOKINGS
-- ============================================
CREATE TABLE grooming_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  pet_id UUID NOT NULL REFERENCES pets(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  groomer_id UUID REFERENCES users(id),
  service_id UUID NOT NULL REFERENCES grooming_services(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status grooming_booking_status DEFAULT 'BOOKED',
  total_price DECIMAL(12,2),
  notes TEXT,
  is_from_portal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grooming_bookings_pet_id ON grooming_bookings(pet_id);
CREATE INDEX idx_grooming_bookings_groomer_id ON grooming_bookings(groomer_id);
CREATE INDEX idx_grooming_bookings_status ON grooming_bookings(status);

-- ============================================
-- GROOMING RECORDS
-- ============================================
CREATE TABLE grooming_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES grooming_bookings(id),
  skin_condition TEXT,
  flea_tick_found BOOLEAN DEFAULT FALSE,
  recommendations TEXT,
  before_photo_url TEXT,
  after_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS & INVENTORY
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  notes TEXT,
  lead_time_days INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category_id UUID REFERENCES categories(id),
  supplier_id UUID REFERENCES suppliers(id),
  barcode VARCHAR(100),
  description TEXT,
  purchase_price DECIMAL(12,2) NOT NULL,
  selling_price DECIMAL(12,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  stock_minimum INTEGER DEFAULT 0,
  stock_maximum INTEGER DEFAULT 0,
  photo_url TEXT,
  expiry_date DATE,
  status product_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_stock_quantity ON products(stock_quantity);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name VARCHAR(100) NOT NULL,
  variant_value VARCHAR(100) NOT NULL,
  price_adjustment DECIMAL(12,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  bundle_price DECIMAL(12,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1
);

-- ============================================
-- STOCK MOVEMENTS
-- ============================================
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  movement_type stock_movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);

-- ============================================
-- PURCHASE ORDERS
-- ============================================
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(20) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  order_date DATE NOT NULL,
  expected_arrival_date DATE,
  actual_arrival_date DATE,
  total_amount DECIMAL(12,2),
  status purchase_order_status DEFAULT 'DRAFT',
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICES & PAYMENTS
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  invoice_type invoice_type NOT NULL,
  customer_id UUID REFERENCES customers(id),
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  status invoice_status DEFAULT 'UNPAID',
  promotion_id UUID REFERENCES promotions(id),
  loyalty_points_earned INTEGER DEFAULT 0,
  loyalty_points_redeemed INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL,
  product_id UUID REFERENCES products(id),
  procedure_id UUID REFERENCES procedures(id),
  pet_hotel_booking_id UUID REFERENCES pet_hotel_bookings(id),
  grooming_booking_id UUID REFERENCES grooming_bookings(id),
  description VARCHAR(200) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  payment_method payment_method NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reference_number VARCHAR(100),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);

-- ============================================
-- CASH SHIFTS
-- ============================================
CREATE TABLE cash_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kasir_id UUID NOT NULL REFERENCES users(id),
  open_time TIMESTAMPTZ NOT NULL,
  close_time TIMESTAMPTZ,
  opening_cash DECIMAL(12,2) NOT NULL,
  closing_cash DECIMAL(12,2),
  expected_cash DECIMAL(12,2),
  difference DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOYALTY PROGRAM
-- ============================================
CREATE TABLE loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name loyalty_tier NOT NULL,
  min_points INTEGER NOT NULL,
  min_spending DECIMAL(12,2) NOT NULL,
  point_multiplier DECIMAL(3,2) DEFAULT 1.0,
  benefits JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE loyalty_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) UNIQUE,
  tier_id UUID REFERENCES loyalty_tiers(id),
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  total_spending DECIMAL(12,2) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES loyalty_members(id),
  transaction_type loyalty_transaction_type NOT NULL,
  points INTEGER NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_transactions_member_id ON loyalty_transactions(member_id);

-- ============================================
-- PROMOTIONS
-- ============================================
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  promotion_type promotion_type NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  min_purchase DECIMAL(12,2) DEFAULT 0,
  max_usage INTEGER,
  current_usage INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  applicable_products UUID[],
  status promotion_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE promotion_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  customer_id UUID REFERENCES customers(id),
  discount_applied DECIMAL(12,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXPENSES
-- ============================================
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL,
  category_id UUID NOT NULL REFERENCES expense_categories(id),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status expense_status DEFAULT 'PENDING',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_day INTEGER,
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);

-- ============================================
-- CUSTOMER FEEDBACK
-- ============================================
CREATE TABLE customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  invoice_id UUID REFERENCES invoices(id),
  rating feedback_rating NOT NULL,
  comment TEXT,
  nps_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

---

## 4. TypeScript Types & Interfaces

### 4.1 Base Types

```typescript
// src/types/base.ts
export type UUID = string;
export type Timestamp = string; // ISO 8601

export interface BaseEntity {
  id: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SoftDeletable extends BaseEntity {
  deleted_at: Timestamp | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 4.2 User & Auth Types

```typescript
// src/types/user.ts
export type UserRole = 'OWNER' | 'ADMIN' | 'DOKTER' | 'KASIR' | 'CUSTOMER';

export interface User extends BaseEntity {
  username: string;
  pin_hash: string;
  role: UserRole;
  full_name: string;
  customer_id: UUID | null;
  created_by: UUID | null;
  failed_login_attempts: number;
  locked_until: Timestamp | null;
  is_active: boolean;
  last_login_at: Timestamp | null;
}

export interface LoginCredentials {
  username: string;
  pin: string;
}

export interface LoginResponse {
  user: Omit<User, 'pin_hash'>;
  session_token: string;
}

export interface Session {
  user_id: UUID;
  role: UserRole;
  expires_at: Timestamp;
}

export interface CreateUserInput {
  username: string;
  pin: string;
  role: UserRole;
  full_name: string;
  customer_id?: UUID;
}

export interface UpdatePinInput {
  old_pin: string;
  new_pin: string;
}
```

### 4.3 Customer & Pet Types

```typescript
// src/types/customer.ts
export type CustomerTag = 'VIP' | 'REGULAR' | 'NEW' | 'BLACKLIST';

export interface Customer extends SoftDeletable {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  emergency_contact: string | null;
  photo_url: string | null;
  notes: string | null;
  is_guest: boolean;
  tags: CustomerTag[];
  is_active: boolean;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  photo_url?: string;
  notes?: string;
  is_guest?: boolean;
  tags?: CustomerTag[];
  create_account?: boolean;
  username?: string;
  pin?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

// src/types/pet.ts
export interface Pet extends SoftDeletable {
  customer_id: UUID;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  gender: string | null;
  photo_url: string | null;
  microchip_number: string | null;
  is_active: boolean;
}

export interface CreatePetInput {
  customer_id: UUID;
  name: string;
  species: string;
  breed?: string;
  birth_date?: string;
  gender?: string;
  photo_url?: string;
  microchip_number?: string;
}

export interface UpdatePetInput extends Partial<CreatePetInput> {}

export interface PetWeightLog extends BaseEntity {
  pet_id: UUID;
  weight_kg: number;
  recorded_at: string;
}

export interface PetVaccine extends SoftDeletable {
  pet_id: UUID;
  vaccine_name: string;
  vaccination_date: string;
  due_date: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface PetDisease extends SoftDeletable {
  pet_id: UUID;
  disease_name: string;
  diagnosed_date: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface PetAllergy extends SoftDeletable {
  pet_id: UUID;
  allergen: string;
  notes: string | null;
  is_active: boolean;
}
```

### 4.4 Appointment & Medical Record Types

```typescript
// src/types/appointment.ts
export type AppointmentStatus = 'WAITING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface Appointment extends BaseEntity {
  customer_id: UUID;
  pet_id: UUID;
  doctor_id: UUID | null;
  appointment_date: string;
  appointment_time: string;
  queue_number: number | null;
  status: AppointmentStatus;
  complaint: string | null;
  notes: string | null;
  is_from_portal: boolean;
}

export interface CreateAppointmentInput {
  customer_id: UUID;
  pet_id: UUID;
  doctor_id?: UUID;
  appointment_date: string;
  appointment_time: string;
  complaint?: string;
  notes?: string;
  is_from_portal?: boolean;
}

export interface UpdateAppointmentStatusInput {
  status: AppointmentStatus;
}

// src/types/medical-record.ts
export type MedicalRecordStatus = 'OPEN' | 'CLOSED';

export interface MedicalRecord extends SoftDeletable {
  record_number: string;
  appointment_id: UUID;
  doctor_id: UUID;
  chief_complaint: string | null;
  history: string | null;
  physical_exam: string | null;
  weight_kg: number | null;
  temperature_c: number | null;
  heart_rate_bpm: number | null;
  respiratory_rate_bpm: number | null;
  diagnosis: string | null;
  treatment: string | null;
  prescription: string | null;
  lab_results: string | null;
  additional_notes: string | null;
  attachments: string[];
  status: MedicalRecordStatus;
}

export interface CreateMedicalRecordInput {
  appointment_id: UUID;
  chief_complaint?: string;
  history?: string;
  physical_exam?: string;
  weight_kg?: number;
  temperature_c?: number;
  heart_rate_bpm?: number;
  respiratory_rate_bpm?: number;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  lab_results?: string;
  additional_notes?: string;
  attachments?: string[];
}

export interface UpdateMedicalRecordInput extends Partial<CreateMedicalRecordInput> {}
```

### 4.5 Pet Hotel Types

```typescript
// src/types/pet-hotel.ts
export type RoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE' | 'INACTIVE';
export type RoomCleanliness = 'CLEAN' | 'DIRTY' | 'UNDER_CLEANING';
export type PetHotelBookingStatus = 'BOOKED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type PetHotelLogType = 'FEEDING' | 'MEDICINE' | 'NOTE';

export interface Room extends SoftDeletable {
  name: string;
  room_number: string | null;
  room_type: string;
  price_per_night: number;
  capacity: number;
  status: RoomStatus;
  cleanliness: RoomCleanliness;
  maintenance_status: boolean;
  is_active: boolean;
}

export interface PetHotelBooking extends BaseEntity {
  booking_number: string;
  pet_id: UUID;
  customer_id: UUID;
  room_id: UUID | null;
  check_in_date: string;
  check_out_date: string;
  actual_check_in_at: Timestamp | null;
  actual_check_out_at: Timestamp | null;
  price_per_night: number;
  total_price: number;
  status: PetHotelBookingStatus;
  special_notes: string | null;
  is_from_portal: boolean;
}

export interface PetHotelLog extends BaseEntity {
  booking_id: UUID;
  log_type: PetHotelLogType;
  description: string | null;
  photo_urls: string[];
  logged_at: Timestamp;
}

export interface CreatePetHotelBookingInput {
  pet_id: UUID;
  customer_id: UUID;
  room_id?: UUID;
  check_in_date: string;
  check_out_date: string;
  price_per_night?: number;
  special_notes?: string;
  is_from_portal?: boolean;
}

export interface CreatePetHotelLogInput {
  booking_id: UUID;
  log_type: PetHotelLogType;
  description?: string;
  photo_urls?: string[];
}
```

### 4.6 Grooming Types

```typescript
// src/types/grooming.ts
export type GroomingBookingStatus = 'BOOKED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface GroomingService extends SoftDeletable {
  name: string;
  description: string | null;
  base_price: number;
  duration_minutes: number | null;
  is_active: boolean;
}

export interface GroomingBooking extends BaseEntity {
  booking_number: string;
  pet_id: UUID;
  customer_id: UUID;
  groomer_id: UUID | null;
  service_id: UUID;
  appointment_date: string;
  appointment_time: string;
  status: GroomingBookingStatus;
  total_price: number;
  notes: string | null;
  is_from_portal: boolean;
}

export interface GroomingRecord extends BaseEntity {
  booking_id: UUID;
  skin_condition: string | null;
  flea_tick_found: boolean;
  recommendations: string | null;
  before_photo_url: string | null;
  after_photo_url: string | null;
}

export interface CreateGroomingBookingInput {
  pet_id: UUID;
  customer_id: UUID;
  groomer_id?: UUID;
  service_id: UUID;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  is_from_portal?: boolean;
}

export interface CreateGroomingRecordInput {
  booking_id: UUID;
  skin_condition?: string;
  flea_tick_found?: boolean;
  recommendations?: string;
  before_photo_url?: string;
  after_photo_url?: string;
}
```

### 4.7 Product & Inventory Types

```typescript
// src/types/product.ts
export type ProductStatus = 'ACTIVE' | 'ARCHIVED';
export type StockMovementType = 'IN' | 'OUT' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGED' | 'EXPIRED' | 'OPNAME';

export interface Category extends BaseEntity {
  name: string;
  description: string | null;
  parent_id: UUID | null;
  is_active: boolean;
}

export interface Supplier extends BaseEntity {
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  lead_time_days: number | null;
  is_active: boolean;
}

export interface Product extends SoftDeletable {
  sku: string;
  name: string;
  category_id: UUID | null;
  supplier_id: UUID | null;
  barcode: string | null;
  description: string | null;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  stock_minimum: number;
  stock_maximum: number;
  photo_url: string | null;
  expiry_date: string | null;
  status: ProductStatus;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  category_id?: UUID;
  supplier_id?: UUID;
  barcode?: string;
  description?: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity?: number;
  stock_minimum?: number;
  stock_maximum?: number;
  photo_url?: string;
  expiry_date?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface ProductVariant extends BaseEntity {
  product_id: UUID;
  variant_name: string;
  variant_value: string;
  price_adjustment: number;
  stock_quantity: number;
}

export interface ProductBundle extends BaseEntity {
  name: string;
  description: string | null;
  bundle_price: number;
  is_active: boolean;
}

export interface StockMovement extends BaseEntity {
  product_id: UUID;
  movement_type: StockMovementType;
  quantity: number;
  reference_type: string | null;
  reference_id: UUID | null;
  notes: string | null;
  created_by: UUID;
}

export interface CreateStockMovementInput {
  product_id: UUID;
  movement_type: StockMovementType;
  quantity: number;
  reference_type?: string;
  reference_id?: UUID;
  notes?: string;
}
```

### 4.8 Purchase Order Types

```typescript
// src/types/purchase-order.ts
export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'PARTIAL_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrder extends BaseEntity {
  po_number: string;
  supplier_id: UUID;
  order_date: string;
  expected_arrival_date: string | null;
  actual_arrival_date: string | null;
  total_amount: number;
  status: PurchaseOrderStatus;
  notes: string | null;
  created_by: UUID;
}

export interface PurchaseOrderItem extends BaseEntity {
  po_id: UUID;
  product_id: UUID;
  quantity: number;
  unit_price: number;
  received_quantity: number;
}

export interface CreatePurchaseOrderInput {
  supplier_id: UUID;
  order_date: string;
  expected_arrival_date?: string;
  notes?: string;
  items: Array<{
    product_id: UUID;
    quantity: number;
    unit_price: number;
  }>;
}
```

### 4.9 Invoice & Payment Types

```typescript
// src/types/invoice.ts
export type InvoiceType = 'POS' | 'CLINICAL' | 'PET_HOTEL' | 'GROOMING' | 'MIXED';
export type InvoiceStatus = 'UNPAID' | 'PARTIAL_PAYMENT' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER' | 'E_WALLET' | 'CREDIT_CARD' | 'MIXED';

export interface Invoice extends BaseEntity {
  invoice_number: string;
  invoice_type: InvoiceType;
  customer_id: UUID | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: InvoiceStatus;
  promotion_id: UUID | null;
  loyalty_points_earned: number;
  loyalty_points_redeemed: number;
  notes: string | null;
  created_by: UUID;
}

export interface InvoiceItem extends BaseEntity {
  invoice_id: UUID;
  item_type: string;
  product_id: UUID | null;
  procedure_id: UUID | null;
  pet_hotel_booking_id: UUID | null;
  grooming_booking_id: UUID | null;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Payment extends BaseEntity {
  invoice_id: UUID;
  payment_method: PaymentMethod;
  amount: number;
  reference_number: string | null;
  notes: string | null;
  created_by: UUID;
}

export interface CreateInvoiceInput {
  invoice_type: InvoiceType;
  customer_id?: UUID;
  items: Array<{
    item_type: string;
    product_id?: UUID;
    procedure_id?: UUID;
    pet_hotel_booking_id?: UUID;
    grooming_booking_id?: UUID;
    description: string;
    quantity?: number;
    unit_price: number;
  }>;
  discount_amount?: number;
  tax_amount?: number;
  promotion_id?: UUID;
  loyalty_points_to_redeem?: number;
  notes?: string;
}

export interface RecordPaymentInput {
  invoice_id: UUID;
  payment_method: PaymentMethod;
  amount: number;
  reference_number?: string;
  notes?: string;
}

export interface CashShift extends BaseEntity {
  kasir_id: UUID;
  open_time: Timestamp;
  close_time: Timestamp | null;
  opening_cash: number;
  closing_cash: number | null;
  expected_cash: number | null;
  difference: number | null;
  notes: string | null;
}
```

### 4.10 Loyalty & Promotion Types

```typescript
// src/types/loyalty.ts
export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type LoyaltyTransactionType = 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST';

export interface LoyaltyTierConfig extends BaseEntity {
  tier_name: LoyaltyTier;
  min_points: number;
  min_spending: number;
  point_multiplier: number;
  benefits: Record<string, any>;
}

export interface LoyaltyMember extends BaseEntity {
  customer_id: UUID;
  tier_id: UUID | null;
  total_points: number;
  available_points: number;
  total_spending: number;
  joined_at: Timestamp;
}

export interface LoyaltyTransaction extends BaseEntity {
  member_id: UUID;
  transaction_type: LoyaltyTransactionType;
  points: number;
  invoice_id: UUID | null;
  description: string | null;
}

// src/types/promotion.ts
export type PromotionType = 'PERCENTAGE' | 'FIXED' | 'BUNDLE' | 'HAPPY_HOUR' | 'BIRTHDAY';
export type PromotionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Promotion extends BaseEntity {
  code: string | null;
  name: string;
  description: string | null;
  promotion_type: PromotionType;
  discount_value: number;
  min_purchase: number;
  max_usage: number | null;
  current_usage: number;
  start_date: string;
  end_date: string;
  applicable_products: UUID[] | null;
  status: PromotionStatus;
}

export interface PromotionUsage extends BaseEntity {
  promotion_id: UUID;
  invoice_id: UUID;
  customer_id: UUID | null;
  discount_applied: number;
  used_at: Timestamp;
}

export interface CreatePromotionInput {
  code?: string;
  name: string;
  description?: string;
  promotion_type: PromotionType;
  discount_value: number;
  min_purchase?: number;
  max_usage?: number;
  start_date: string;
  end_date: string;
  applicable_products?: UUID[];
}
```

### 4.11 Expense & Feedback Types

```typescript
// src/types/expense.ts
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVERSED';

export interface ExpenseCategory extends BaseEntity {
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface Expense extends BaseEntity {
  expense_date: string;
  category_id: UUID;
  amount: number;
  description: string | null;
  receipt_url: string | null;
  status: ExpenseStatus;
  is_recurring: boolean;
  recurring_day: number | null;
  created_by: UUID;
  approved_by: UUID | null;
}

export interface CreateExpenseInput {
  expense_date: string;
  category_id: UUID;
  amount: number;
  description?: string;
  receipt_url?: string;
  is_recurring?: boolean;
  recurring_day?: number;
}

// src/types/feedback.ts
export type FeedbackRating = '1' | '2' | '3' | '4' | '5';

export interface CustomerFeedback extends BaseEntity {
  customer_id: UUID;
  invoice_id: UUID | null;
  rating: FeedbackRating;
  comment: string | null;
  nps_score: number | null;
}

export interface CreateFeedbackInput {
  customer_id: UUID;
  invoice_id?: UUID;
  rating: FeedbackRating;
  comment?: string;
  nps_score?: number;
}
```

### 4.12 Audit & Notification Types

```typescript
// src/types/audit.ts
export interface AuditLog extends BaseEntity {
  user_id: UUID | null;
  action: string;
  entity_type: string;
  entity_id: UUID | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
}

// src/types/notification.ts
export interface Notification extends BaseEntity {
  user_id: UUID | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data: Record<string, any> | null;
}
```

---

## 5. Zod Validation Schemas

### 5.1 Base Schemas

```typescript
// src/schemas/base.ts
import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const timestampSchema = z.string().datetime();
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const timeSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);
```

### 5.2 User Schemas

```typescript
// src/schemas/user.ts
import { z } from 'zod';
import { uuidSchema } from './base';

export const userRoleSchema = z.enum(['OWNER', 'ADMIN', 'DOKTER', 'KASIR', 'CUSTOMER']);

export const loginCredentialsSchema = z.object({
  username: z.string().min(3).max(50),
  pin: z.string().length(6).regex(/^\d+$/),
});

export const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-z0-9._]+$/),
  pin: z.string().length(6).regex(/^\d+$/),
  role: userRoleSchema,
  full_name: z.string().min(1).max(100),
  customer_id: uuidSchema.nullable().optional(),
});

export const updatePinSchema = z.object({
  old_pin: z.string().length(6).regex(/^\d+$/),
  new_pin: z.string().length(6).regex(/^\d+$/),
});

export type LoginCredentialsInput = z.infer<typeof loginCredentialsSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdatePinInput = z.infer<typeof updatePinSchema>;
```

### 5.3 Customer Schemas

```typescript
// src/schemas/customer.ts
import { z } from 'zod';
import { uuidSchema } from './base';

export const customerTagSchema = z.enum(['VIP', 'REGULAR', 'NEW', 'BLACKLIST']);

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional(),
  address: z.string().optional(),
  emergency_contact: z.string().max(100).optional(),
  photo_url: z.string().url().optional(),
  notes: z.string().optional(),
  is_guest: z.boolean().default(false),
  tags: z.array(customerTagSchema).default([]),
  create_account: z.boolean().default(false),
  username: z.string().min(3).max(50).optional(),
  pin: z.string().length(6).regex(/^\d+$/).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().omit({
  create_account: true,
  username: true,
  pin: true,
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
```

### 5.4 Pet Schemas

```typescript
// src/schemas/pet.ts
import { z } from 'zod';
import { uuidSchema, dateSchema } from './base';

export const createPetSchema = z.object({
  customer_id: uuidSchema,
  name: z.string().min(1).max(100),
  species: z.string().min(1).max(50),
  breed: z.string().max(50).optional(),
  birth_date: dateSchema.optional(),
  gender: z.string().max(10).optional(),
  photo_url: z.string().url().optional(),
  microchip_number: z.string().max(50).optional(),
});

export const updatePetSchema = createPetSchema.partial().omit({ customer_id: true });

export const createPetWeightLogSchema = z.object({
  pet_id: uuidSchema,
  weight_kg: z.number().positive().max(500),
  recorded_at: dateSchema.optional(),
});

export const createPetVaccineSchema = z.object({
  pet_id: uuidSchema,
  vaccine_name: z.string().min(1).max(100),
  vaccination_date: dateSchema,
  due_date: dateSchema.optional(),
  notes: z.string().optional(),
});

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
```

### 5.5 Appointment Schemas

```typescript
// src/schemas/appointment.ts
import { z } from 'zod';
import { uuidSchema, dateSchema, timeSchema } from './base';

export const appointmentStatusSchema = z.enum(['WAITING', 'IN_PROGRESS', 'DONE', 'CANCELLED']);

export const createAppointmentSchema = z.object({
  customer_id: uuidSchema,
  pet_id: uuidSchema,
  doctor_id: uuidSchema.nullable().optional(),
  appointment_date: dateSchema,
  appointment_time: timeSchema,
  complaint: z.string().optional(),
  notes: z.string().optional(),
  is_from_portal: z.boolean().default(false),
});

export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusSchema,
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
```

### 5.6 Medical Record Schemas

```typescript
// src/schemas/medical-record.ts
import { z } from 'zod';
import { uuidSchema } from './base';

export const medicalRecordStatusSchema = z.enum(['OPEN', 'CLOSED']);

export const createMedicalRecordSchema = z.object({
  appointment_id: uuidSchema,
  chief_complaint: z.string().optional(),
  history: z.string().optional(),
  physical_exam: z.string().optional(),
  weight_kg: z.number().positive().max(500).optional(),
  temperature_c: z.number().min(30).max(45).optional(),
  heart_rate_bpm: z.number().int().positive().optional(),
  respiratory_rate_bpm: z.number().int().positive().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  prescription: z.string().optional(),
  lab_results: z.string().optional(),
  additional_notes: z.string().optional(),
  attachments: z.array(z.string().url()).optional(),
});

export const updateMedicalRecordSchema = createMedicalRecordSchema.partial();

export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;
export type UpdateMedicalRecordInput = z.infer<typeof updateMedicalRecordSchema>;
```

### 5.7 POS & Invoice Schemas

```typescript
// src/schemas/invoice.ts
import { z } from 'zod';
import { uuidSchema } from './base';

export const invoiceTypeSchema = z.enum(['POS', 'CLINICAL', 'PET_HOTEL', 'GROOMING', 'MIXED']);
export const paymentMethodSchema = z.enum(['CASH', 'QRIS', 'TRANSFER', 'E_WALLET', 'CREDIT_CARD', 'MIXED']);

export const invoiceItemSchema = z.object({
  item_type: z.string(),
  product_id: uuidSchema.nullable().optional(),
  procedure_id: uuidSchema.nullable().optional(),
  pet_hotel_booking_id: uuidSchema.nullable().optional(),
  grooming_booking_id: uuidSchema.nullable().optional(),
  description: z.string().min(1).max(200),
  quantity: z.number().int().positive().default(1),
  unit_price: z.number().nonnegative(),
});

export const createInvoiceSchema = z.object({
  invoice_type: invoiceTypeSchema,
  customer_id: uuidSchema.nullable().optional(),
  items: z.array(invoiceItemSchema).min(1),
  discount_amount: z.number().nonnegative().default(0),
  tax_amount: z.number().nonnegative().default(0),
  promotion_id: uuidSchema.nullable().optional(),
  loyalty_points_to_redeem: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  invoice_id: uuidSchema,
  payment_method: paymentMethodSchema,
  amount: z.number().positive(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
```

### 5.8 Product Schemas

```typescript
// src/schemas/product.ts
import { z } from 'zod';
import { uuidSchema, dateSchema } from './base';

export const createProductSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  category_id: uuidSchema.nullable().optional(),
  supplier_id: uuidSchema.nullable().optional(),
  barcode: z.string().max(100).optional(),
  description: z.string().optional(),
  purchase_price: z.number().nonnegative(),
  selling_price: z.number().nonnegative(),
  stock_quantity: z.number().int().nonnegative().default(0),
  stock_minimum: z.number().int().nonnegative().default(0),
  stock_maximum: z.number().int().nonnegative().default(0),
  photo_url: z.string().url().optional(),
  expiry_date: dateSchema.optional(),
});

export const updateProductSchema = createProductSchema.partial().omit({ sku: true });

export const createStockMovementSchema = z.object({
  product_id: uuidSchema,
  movement_type: z.enum(['IN', 'OUT', 'RETURN', 'ADJUSTMENT', 'DAMAGED', 'EXPIRED', 'OPNAME']),
  quantity: z.number().int(),
  reference_type: z.string().optional(),
  reference_id: uuidSchema.nullable().optional(),
  notes: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
```

### 5.9 Loyalty Schemas

```typescript
// src/schemas/loyalty.ts
import { z } from 'zod';
import { uuidSchema } from './base';

export const createLoyaltyTierSchema = z.object({
  tier_name: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),
  min_points: z.number().int().nonnegative(),
  min_spending: z.number().nonnegative(),
  point_multiplier: z.number().positive(),
  benefits: z.record(z.any()),
});

export const redeemPointsSchema = z.object({
  customer_id: uuidSchema,
  points_to_redeem: z.number().int().positive(),
  invoice_id: uuidSchema.nullable().optional(),
});

export type CreateLoyaltyTierInput = z.infer<typeof createLoyaltyTierSchema>;
export type RedeemPointsInput = z.infer<typeof redeemPointsSchema>;
```

### 5.10 Promotion Schemas

```typescript
// src/schemas/promotion.ts
import { z } from 'zod';
import { uuidSchema, dateSchema } from './base';

export const promotionTypeSchema = z.enum(['PERCENTAGE', 'FIXED', 'BUNDLE', 'HAPPY_HOUR', 'BIRTHDAY']);

export const createPromotionSchema = z.object({
  code: z.string().max(50).optional(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  promotion_type: promotionTypeSchema,
  discount_value: z.number().nonnegative(),
  min_purchase: z.number().nonnegative().default(0),
  max_usage: z.number().int().positive().nullable().optional(),
  start_date: dateSchema,
  end_date: dateSchema,
  applicable_products: z.array(uuidSchema).nullable().optional(),
});

export const applyPromoCodeSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
  customer_id: uuidSchema.nullable().optional(),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type ApplyPromoCodeInput = z.infer<typeof applyPromoCodeSchema>;
```

---

*Dokumen ini adalah baseline final yang mencakup seluruh aspek arsitektur teknis Petora. Seluruh kontrak harus diimplementasikan secara konsisten untuk memastikan type-safety, maintainability, dan scalability sistem.* 🚀
