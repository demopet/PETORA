# Roadmap Pengembangan Petora
## Sistem Manajemen Terpadu Petshop & Petcare
### Dokumen Baseline Final | 18 Agustus 2026

---

## Daftar Isi
1. [Overview Roadmap](#1-overview-roadmap)
2. [Phase 0: Foundation & Setup](#2-phase-0-foundation--setup)
3. [Phase 1: Auth & User Management](#3-phase-1-auth--user-management)
4. [Phase 2: Core CRM (Customers & Pets)](#4-phase-2-core-crm-customers--pets)
5. [Phase 3: Appointments & Medical Records](#5-phase-3-appointments--medical-records)
6. [Phase 4: Pet Hotel & Grooming](#6-phase-4-pet-hotel--grooming)
7. [Phase 5: Petshop & Inventory](#7-phase-5-petshop--inventory)
8. [Phase 6: POS & Billing](#8-phase-6-pos--billing)
9. [Phase 7: Loyalty & Promotions](#9-phase-7-loyalty--promotions)
10. [Phase 8: Finance & Reports](#10-phase-8-finance--reports)
11. [Phase 9: Customer Portal](#11-phase-9-customer-portal)
12. [Phase 10: Integration & Testing](#12-phase-10-integration--testing)
13. [Phase 11: Deployment & Launch](#13-phase-11-deployment--launch)
14. [Matrik Definition of Done Global](#14-matrik-definition-of-done-global)
15. [Dependency Matrix](#15-dependency-matrix)

---

## 1. Overview Roadmap

### 1.1 Struktur Fase

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 0: Foundation & Setup                                 │
│  (Infrastructure, DB Schema, Project Scaffold)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Auth & User Management                             │
│  (Login, RBAC, User CRUD, RLS Policies)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: Core CRM (Customers & Pets)                        │
│  (Customer CRUD, Pet CRUD, Pet Details)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: Appointments & Medical Records                     │
│  (Appointment CRUD, Medical Record CRUD, State Machine)     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: Pet Hotel & Grooming                               │
│  (Room Management, Booking, Check-in/out, Grooming Flow)    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 5: Petshop & Inventory                                │
│  (Product CRUD, Stock Management, Purchase Orders)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 6: POS & Billing                                      │
│  (POS Dashboard, Invoice, Payment, Cash Shift)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 7: Loyalty & Promotions                               │
│  (Loyalty Program, Tier, Promotions, Feedback)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 8: Finance & Reports                                  │
│  (Expenses, Reports, Settings)                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 9: Customer Portal                                    │
│  (Portal UI, Self-service, E-commerce)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 10: Integration & Testing                             │
│  (E2E Testing, Performance, Security Audit)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 11: Deployment & Launch                               │
│  (Staging, Production, Monitoring, Handover)                │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Prinsip Roadmap

| Prinsip | Penjelasan |
|---|---|
| **Foundation First** | Setup infrastruktur & DB schema sebelum fitur |
| **Auth Early** | Auth & RBAC di awal karena semua modul bergantung |
| **Core Before Advanced** | CRM → Appointments → Petshop → POS |
| **Integration Last** | Integrasi & testing setelah semua modul siap |
| **Incremental Delivery** | Setiap phase deliverable & testable |
| **No Time Estimates** | Fokus pada quality, bukan speed |

---

## 2. Phase 0: Foundation & Setup

### 2.1 Objective
Membangun fondasi teknis yang solid: infrastruktur, database schema, project scaffold, dan CI/CD pipeline dasar.

### 2.2 Deliverables (End-to-End)

#### 2.2.1 Infrastructure Setup
- [ ] **Supabase Project**
  - Create project di Supabase (dev, staging, prod)
  - Configure database settings
  - Enable RLS (Row Level Security)
  - Setup storage buckets
  - Configure environment variables

- [ ] **Vercel Project**
  - Create project di Vercel
  - Connect to GitHub repository
  - Configure environment variables (dev, staging, prod)
  - Setup custom domain (opsional)

- [ ] **GitHub Repository**
  - Initialize repository
  - Setup branch protection rules (main, develop)
  - Configure GitHub Actions secrets
  - Setup CODEOWNERS file

#### 2.2.2 Database Schema
- [ ] **Migrations**
  - Create all tables sesuai kontrak teknis
  - Create all enums
  - Create all indexes
  - Create all foreign keys
  - Create all constraints
  - Test migrations di local Supabase

- [ ] **RLS Policies (Initial)**
  - Create helper functions (`get_user_role`, `is_owner`, etc.)
  - Create RLS policies untuk tabel `users`
  - Test RLS policies

- [ ] **Seed Data**
  - Create initial Owner account
  - Create sample data untuk testing (customers, pets, products)
  - Document seed scripts

#### 2.2.3 Project Scaffold
- [ ] **Frontend Setup**
  - Initialize Vite + React + TypeScript project
  - Install dependencies (Tailwind, shadcn/ui, React Router, TanStack Query, Zod, Supabase JS)
  - Configure TypeScript (strict mode)
  - Configure ESLint + Prettier
  - Configure path aliases (`@/`)

- [ ] **Design System**
  - Setup Tailwind config dengan design tokens
  - Install shadcn/ui components
  - Create custom components (StatusBadge, StatCard, EmptyState, etc.)
  - Setup dark mode

- [ ] **Project Structure**
  - Create folder structure sesuai kontrak
  - Setup feature-based architecture
  - Create shared utilities (format, validation, constants)
  - Create types & interfaces

#### 2.2.4 CI/CD Pipeline (Basic)
- [ ] **GitHub Actions**
  - Create PR check workflow (lint, type-check, build)
  - Create staging deployment workflow
  - Create production deployment workflow
  - Test workflows

- [ ] **Pre-commit Hooks**
  - Setup Husky
  - Configure lint-staged
  - Configure commitlint
  - Test hooks

#### 2.2.5 Development Environment
- [ ] **Local Setup**
  - Document setup instructions (README.md)
  - Create `.env.example` file
  - Test local development flow
  - Verify hot reload works

### 2.3 Dependencies
- Tidak ada dependency (phase pertama)

### 2.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Supabase project created (dev, staging, prod) | ☐ | Check Supabase dashboard |
| Vercel project created & connected to GitHub | ☐ | Check Vercel dashboard |
| GitHub repository initialized with branch protection | ☐ | Check GitHub settings |
| All database migrations created & tested | ☐ | Run `supabase db push` successfully |
| RLS policies untuk `users` table created & tested | ☐ | Test RLS dengan different roles |
| Seed data created & documented | ☐ | Check seed scripts |
| Frontend project initialized dengan all dependencies | ☐ | Run `npm install` successfully |
| TypeScript configured in strict mode | ☐ | Run `npm run type-check` successfully |
| ESLint + Prettier configured & working | ☐ | Run `npm run lint` successfully |
| Design system setup (Tailwind + shadcn/ui) | ☐ | Check component rendering |
| Project structure created sesuai kontrak | ☐ | Verify folder structure |
| CI/CD workflows created & tested | ☐ | Trigger workflow manually |
| Pre-commit hooks configured & working | ☐ | Test commit dengan invalid code |
| Local development environment documented & tested | ☐ | New developer can setup in < 30 min |
| README.md complete dengan setup instructions | ☐ | Follow instructions successfully |

---

## 3. Phase 1: Auth & User Management

### 3.1 Objective
Membangun sistem autentikasi lengkap (Username + PIN) dan manajemen user dengan RBAC yang ketat.

### 3.2 Deliverables (End-to-End)

#### 3.2.1 Authentication System
- [ ] **Login Flow**
  - Create login page UI (Staff Dashboard + Portal)
  - Implement Username + PIN input dengan numeric keypad
  - Create login form dengan validation (Zod)
  - Implement login logic (Edge Function atau RPC)
  - Handle lockout mechanism (5 failed attempts → 15 min lockout)
  - Handle inactive account
  - Create session management (JWT atau Supabase Auth)
  - Redirect berdasarkan role setelah login

- [ ] **Logout Flow**
  - Implement logout function
  - Clear session
  - Redirect to login page
  - Optional: "Logout from all devices"

- [ ] **Change PIN (Self)**
  - Create change PIN form
  - Validate old PIN
  - Update PIN (hash baru)
  - Audit log

- [ ] **Reset PIN (Admin/Owner)**
  - Create reset PIN form (Settings)
  - Validate caller role (Owner untuk staff, Owner/Admin untuk customer)
  - Update PIN (hash baru)
  - Clear lockout
  - Audit log

#### 3.2.2 User Management
- [ ] **User CRUD (Owner only untuk staff)**
  - Create user list page (Settings → User Management)
  - Create user form (username, PIN, role, full_name)
  - Validate username uniqueness
  - Hash PIN (bcrypt/argon2)
  - Set `createdBy` field
  - Implement RLS policies (hanya Owner bisa create staff)
  - Audit log

- [ ] **User CRUD (Owner/Admin untuk customer)**
  - Create customer account dari customer form
  - Link user ke customer record
  - Validate caller role (Owner atau Admin)
  - Implement RLS policies
  - Audit log

- [ ] **User Deactivation**
  - Soft-delete user (set `is_active = false`)
  - Prevent login untuk inactive user
  - Audit log

#### 3.2.3 RLS Policies (Complete)
- [ ] **Users Table**
  - SELECT: all authenticated users
  - INSERT: Owner (staff), Owner+Admin (customer)
  - UPDATE: self (profile, PIN), Owner (all), Admin (customers)
  - DELETE: soft-delete only, same rules as update

- [ ] **Helper Functions**
  - `get_user_role(user_id)` → returns role
  - `is_owner(user_id)` → returns boolean
  - `is_admin(user_id)` → returns boolean
  - Test all helper functions

#### 3.2.4 UI Components
- [ ] **Login Page**
  - Responsive design (desktop + mobile)
  - Numeric keypad untuk PIN
  - Error messages (invalid credentials, lockout, inactive)
  - Loading state
  - Accessibility (WCAG 2.1 AA)

- [ ] **User Management Page**
  - User list dengan search & filter
  - Create/Edit user modal
  - Deactivate user confirmation
  - Reset PIN modal

#### 3.2.5 Testing
- [ ] **Unit Tests**
  - Login validation (Zod schemas)
  - PIN hashing
  - Lockout logic

- [ ] **Integration Tests**
  - Login flow (success, failed, lockout, inactive)
  - Create user (Owner, Admin, unauthorized)
  - Reset PIN (Owner, Admin, unauthorized)
  - RLS policies (all roles)

- [ ] **E2E Tests**
  - Login flow (all roles)
  - Change PIN
  - Create user (Owner)
  - Lockout flow

### 3.3 Dependencies
- Phase 0 (Foundation & Setup)

### 3.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Login page UI created & responsive | ☐ | Test di desktop + mobile |
| Username + PIN input working dengan numeric keypad | ☐ | Test input & validation |
| Login logic implemented (Edge Function/RPC) | ☐ | Test login success & failed |
| Lockout mechanism working (5 attempts → 15 min) | ☐ | Test lockout flow |
| Session management working (JWT/Supabase Auth) | ☐ | Test session persistence |
| Redirect berdasarkan role setelah login | ☐ | Test all roles |
| Logout working & clearing session | ☐ | Test logout flow |
| Change PIN (self) working | ☐ | Test change PIN |
| Reset PIN (Admin/Owner) working | ☐ | Test reset PIN |
| User CRUD (Owner untuk staff) working | ☐ | Test create/edit/deactivate staff |
| User CRUD (Owner/Admin untuk customer) working | ☐ | Test create customer account |
| RLS policies untuk `users` table complete & tested | ☐ | Test RLS dengan different roles |
| Helper functions created & tested | ☐ | Test helper functions |
| Unit tests created & passing | ☐ | Run `npm run test` |
| Integration tests created & passing | ☐ | Run `npm run test:integration` |
| E2E tests created & passing | ☐ | Run `npm run test:e2e` |
| Audit logging working untuk semua auth operations | ☐ | Check audit_logs table |
| Accessibility (WCAG 2.1 AA) validated | ☐ | Run axe-core |
| Documentation updated (API docs, user guide) | ☐ | Check documentation |

---

## 4. Phase 2: Core CRM (Customers & Pets)

### 4.1 Objective
Membangun modul CRM inti: manajemen customer dan hewan peliharaan dengan detail lengkap.

### 4.2 Deliverables (End-to-End)

#### 4.2.1 Customers Module
- [ ] **Customer List**
  - Create customer list page
  - Implement search (name, phone, email)
  - Implement pagination
  - Implement filters (status, tags)
  - Display customer info (name, phone, email, tags)

- [ ] **Customer CRUD**
  - Create customer form (name, phone, email, address, emergency_contact, photo, notes, tags)
  - Create customer logic (RPC)
  - Update customer logic (RPC)
  - Soft-delete customer logic (RPC)
  - Validate input (Zod)
  - Audit log

- [ ] **Customer Detail**
  - Create customer detail page
  - Display customer info
  - Display pets list
  - Display appointments history
  - Display invoices history
  - Display loyalty info

- [ ] **Guest Customer**
  - Implement `is_guest` flag
  - Convert guest to registered (RPC)
  - Preserve transaction history

- [ ] **Customer Account Creation**
  - Checkbox "Create portal account" di form
  - Create user account dengan role CUSTOMER
  - Link user ke customer
  - Generate username + PIN (manual atau auto)

- [ ] **RLS Policies**
  - SELECT: Owner, Admin, Doctor (all), Customer (own)
  - INSERT: Owner, Admin
  - UPDATE: Owner, Admin, Customer (own)
  - DELETE: soft-delete, Owner, Admin

#### 4.2.2 Pets Module
- [ ] **Pet List**
  - Create pet list page (grid + list view)
  - Implement search (name, species, breed)
  - Implement filters (customer, species)
  - Display pet info (name, species, breed, age, photo)

- [ ] **Pet CRUD**
  - Create pet form (customer_id, name, species, breed, birth_date, gender, photo, microchip_number)
  - Create pet logic (RPC)
  - Update pet logic (RPC)
  - Soft-delete pet logic (RPC)
  - Validate input (Zod)
  - Audit log

- [ ] **Pet Detail (5 Tabs)**
  - **Overview Tab**
    - Display basic info (name, species, breed, age, gender, microchip)
    - Display owner info
    - Display last weight
  
  - **Weight History Tab**
    - Display weight log table
    - Display weight chart (line chart)
    - Add weight entry form
    - Delete weight entry
  
  - **Vaccines Tab**
    - Display vaccine list
    - Add vaccine form (name, vaccination_date, due_date, notes)
    - Edit vaccine
    - Delete vaccine
    - Overdue indicator (visual)
  
  - **Medical History Tab**
    - Display diseases list
    - Display allergies list
    - Add disease form
    - Add allergy form
    - Edit/delete disease & allergy
  
  - **Digital Pet ID Card Tab**
    - Display pet info
    - Generate QR code (pet ID)
    - Download/print ID card

- [ ] **RLS Policies**
  - SELECT: Owner, Admin, Doctor, Customer (own pets)
  - INSERT: Owner, Admin
  - UPDATE: Owner, Admin
  - DELETE: soft-delete, Owner, Admin

#### 4.2.3 UI Components
- [ ] **Customer Components**
  - CustomerTable
  - CustomerForm (modal/sheet)
  - CustomerDetail
  - CustomerSearch (autocomplete)

- [ ] **Pet Components**
  - PetGrid / PetList
  - PetForm (modal/sheet)
  - PetDetail (tabs)
  - PetAvatar
  - WeightChart
  - VaccineList
  - PetIDCard (QR code)

#### 4.2.4 Testing
- [ ] **Unit Tests**
  - Customer validation (Zod)
  - Pet validation (Zod)
  - Age calculation
  - Overdue vaccine detection

- [ ] **Integration Tests**
  - Customer CRUD (Owner, Admin, unauthorized)
  - Pet CRUD (Owner, Admin, unauthorized)
  - Guest to registered conversion
  - Customer account creation
  - RLS policies

- [ ] **E2E Tests**
  - Create customer
  - Create pet
  - View pet detail (all tabs)
  - Add vaccine
  - Convert guest to registered

### 4.3 Dependencies
- Phase 1 (Auth & User Management)

### 4.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Customer list page created dengan search, filter, pagination | ☐ | Test list functionality |
| Customer CRUD working (create, edit, soft-delete) | ☐ | Test all operations |
| Customer detail page created dengan all info | ☐ | Test detail view |
| Guest customer flag working | ☐ | Test guest creation |
| Guest to registered conversion working | ☐ | Test conversion |
| Customer account creation working (checkbox) | ☐ | Test account creation |
| RLS policies untuk customers table complete & tested | ☐ | Test RLS dengan different roles |
| Pet list page created (grid + list view) | ☐ | Test list views |
| Pet CRUD working (create, edit, soft-delete) | ☐ | Test all operations |
| Pet detail page created dengan 5 tabs | ☐ | Test all tabs |
| Weight history tab working (log + chart) | ☐ | Test weight tracking |
| Vaccines tab working (add, edit, delete, overdue indicator) | ☐ | Test vaccine management |
| Medical history tab working (diseases + allergies) | ☐ | Test medical history |
| Digital Pet ID Card tab working (QR code) | ☐ | Test ID card generation |
| RLS policies untuk pets table complete & tested | ☐ | Test RLS dengan different roles |
| Unit tests created & passing | ☐ | Run `npm run test` |
| Integration tests created & passing | ☐ | Run `npm run test:integration` |
| E2E tests created & passing | ☐ | Run `npm run test:e2e` |
| Audit logging working untuk all operations | ☐ | Check audit_logs table |
| Accessibility validated | ☐ | Run axe-core |

---

## 5. Phase 3: Appointments & Medical Records

### 5.1 Objective
Membangun sistem appointment (penjadwalan) dan rekam medis dengan state machine yang ketat.

### 5.2 Deliverables (End-to-End)

#### 5.2.1 Appointments Module
- [ ] **Appointment List**
  - Create appointment list page (list + calendar view)
  - Implement filters (date, doctor, status, customer)
  - Display appointment info (date, time, queue_number, customer, pet, doctor, status)
  - Status badge (WAITING, IN_PROGRESS, DONE, CANCELLED)

- [ ] **Appointment CRUD**
  - Create appointment form (customer, pet, doctor, date, time, complaint, notes)
  - Auto-generate queue_number (per day, atomic)
  - Create appointment logic (RPC)
  - Update appointment logic (RPC)
  - Cancel appointment logic (RPC)
  - Validate input (Zod)
  - Audit log

- [ ] **State Machine**
  - WAITING → IN_PROGRESS (doctor starts)
  - WAITING → CANCELLED
  - IN_PROGRESS → DONE
  - IN_PROGRESS → CANCELLED (rare)
  - DONE → (final state)
  - CANCELLED → (final state)
  - Validate state transitions
  - Auto-prompt "Create Medical Record" saat status = DONE

- [ ] **Calendar View**
  - Create calendar component
  - Display appointments per doctor
  - Day/week/month views
  - Click to view detail

- [ ] **Portal Appointments**
  - Flag `is_from_portal` untuk appointment dari portal
  - Different workflow (needs confirmation)

- [ ] **RLS Policies**
  - SELECT: Owner, Admin, Doctor (all), Customer (own)
  - INSERT: Owner, Admin, Customer (own)
  - UPDATE: Owner, Admin, Doctor (own appointments)
  - DELETE: soft-delete, Owner, Admin

#### 5.2.2 Medical Records Module
- [ ] **Medical Record List**
  - Create medical record list page
  - Implement filters (date, doctor, customer, status)
  - Display record info (record_number, date, customer, pet, doctor, diagnosis)

- [ ] **Medical Record CRUD**
  - Create medical record form (appointment_id, chief_complaint, history, physical_exam, vital_signs, diagnosis, treatment, prescription, lab_results, notes, attachments)
  - Auto-generate record_number (MR-YYYYMMDD-XXXX, atomic)
  - Create medical record logic (RPC)
  - Update medical record logic (RPC, creator only)
  - Soft-delete medical record logic (RPC, Owner/Admin only)
  - Validate input (Zod)
  - Audit log

- [ ] **Medical Record Detail**
  - Display full medical record
  - Link to appointment
  - Link to invoice (if exists)
  - Display attachments

- [ ] **Access Control**
  - Only creator doctor can edit
  - Owner/Admin can read & delete
  - Customer can read summary (portal)

- [ ] **RLS Policies**
  - SELECT: Owner, Admin, Doctor (all), Customer (summary only, own)
  - INSERT: Doctor (own appointments)
  - UPDATE: Doctor (creator only)
  - DELETE: soft-delete, Owner, Admin

#### 5.2.3 UI Components
- [ ] **Appointment Components**
  - AppointmentTable
  - AppointmentCalendar
  - AppointmentForm (modal/sheet)
  - AppointmentDetail
  - StatusBadge (appointment status)

- [ ] **Medical Record Components**
  - MedicalRecordTable
  - MedicalRecordForm (full page)
  - MedicalRecordDetail
  - VitalSignsInput
  - AttachmentUpload

#### 5.2.4 Testing
- [ ] **Unit Tests**
  - Appointment validation (Zod)
  - Medical record validation (Zod)
  - State machine transitions
  - Queue number generation

- [ ] **Integration Tests**
  - Appointment CRUD (Owner, Admin, Doctor, Customer)
  - State machine transitions (valid & invalid)
  - Medical record CRUD (Doctor, unauthorized)
  - Queue number generation (concurrent)
  - RLS policies

- [ ] **E2E Tests**
  - Create appointment
  - Update appointment status (WAITING → IN_PROGRESS → DONE)
  - Create medical record
  - Edit medical record (creator only)
  - Calendar view

### 5.3 Dependencies
- Phase 2 (Core CRM)

### 5.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Appointment list page created (list + calendar view) | ☐ | Test list & calendar views |
| Appointment CRUD working (create, edit, cancel) | ☐ | Test all operations |
| Queue number auto-generation working (atomic, per day) | ☐ | Test concurrent creation |
| State machine working (all transitions) | ☐ | Test all state transitions |
| Auto-prompt "Create Medical Record" saat DONE | ☐ | Test prompt |
| Calendar view working (day/week/month) | ☐ | Test calendar navigation |
| Portal appointments flag working | ☐ | Test portal appointment |
| RLS policies untuk appointments table complete & tested | ☐ | Test RLS dengan different roles |
| Medical record list page created | ☐ | Test list view |
| Medical record CRUD working (create, edit, delete) | ☐ | Test all operations |
| Record number auto-generation working (atomic) | ☐ | Test concurrent creation |
| Only creator doctor can edit | ☐ | Test access control |
| Owner/Admin can read & delete | ☐ | Test access control |
| Medical record detail page created | ☐ | Test detail view |
| RLS policies untuk medical_records table complete & tested | ☐ | Test RLS dengan different roles |
| Unit tests created & passing | ☐ | Run `npm run test` |
| Integration tests created & passing | ☐ | Run `npm run test:integration` |
| E2E tests created & passing | ☐ | Run `npm run test:e2e` |
| Audit logging working untuk all operations | ☐ | Check audit_logs table |
| Accessibility validated | ☐ | Run axe-core |

---

## 6. Phase 4: Pet Hotel & Grooming

### 6.1 Objective
Membangun modul pet hotel (penitipan hewan) dan grooming dengan booking, check-in/out, dan daily logs.

### 6.2 Deliverables (End-to-End)

#### 6.2.1 Pet Hotel Module
- [ ] **Room Management**
  - Create room list page
  - Create room form (name, room_number, room_type, price_per_night, capacity, status, cleanliness)
  - Room CRUD logic (RPC)
  - Room status management (AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE, INACTIVE)
  - Room cleanliness tracking (CLEAN, DIRTY, UNDER_CLEANING)
  - Visual room dashboard (grid dengan color coding)

- [ ] **Booking Management**
  - Create booking list page
  - Create booking form (pet, customer, room, check_in_date, check_out_date, special_notes)
  - Auto-generate booking_number (BK-YYYYMMDD-XXXX, atomic)
  - Check room availability (no overlap)
  - Calculate total_price (nights × price_per_night)
  - Booking CRUD logic (RPC)
  - Flag `is_from_portal` untuk booking dari portal

- [ ] **Check-in/Check-out Flow**
  - Check-in: update status to CHECKED_IN, set actual_check_in_at, update room status to OCCUPIED
  - Check-out: update status to CHECKED_OUT, set actual_check_out_at, recalculate total_price (actual stay), update room status to AVAILABLE, trigger invoice creation
  - Extend booking: update check_out_date, recalculate total_price

- [ ] **Daily Logs**
  - Create log list per booking
  - Create log form (log_type: FEEDING/MEDICINE/NOTE, description, photo_urls)
  - Log CRUD logic (RPC)
  - "Pet Hotel Care Needed Today" dashboard

- [ ] **RLS Policies**
  - Rooms: SELECT (all authenticated), INSERT/UPDATE (Owner, Admin)
  - Bookings: SELECT (Owner, Admin, Customer own), INSERT (Owner, Admin, Customer own), UPDATE (Owner, Admin)
  - Logs: SELECT (Owner, Admin), INSERT (Owner, Admin)

#### 6.2.2 Grooming Module
- [ ] **Grooming Service Management**
  - Create service list page
  - Create service form (name, description, base_price, duration_minutes)
  - Service CRUD logic (RPC)

- [ ] **Grooming Booking**
  - Create booking list page (list + calendar view)
  - Create booking form (pet, customer, groomer, service, date, time, notes)
  - Auto-generate booking_number (GR-YYYYMMDD-XXXX, atomic)
  - Check groomer availability (optional)
  - Calculate total_price (base_price + size adjustment + addons)
  - Booking CRUD logic (RPC)
  - Flag `is_from_portal`

- [ ] **Grooming Flow**
  - State machine: BOOKED → IN_PROGRESS → DONE
  - Start grooming: update status to IN_PROGRESS
  - Finish grooming: update status to DONE, create grooming_record (skin_condition, flea_tick_found, recommendations, before_photo, after_photo)
  - Auto-create invoice item (GROOMING)

- [ ] **RLS Policies**
  - Services: SELECT (all authenticated), INSERT/UPDATE (Owner, Admin)
  - Bookings: SELECT (Owner, Admin, Groomer own, Customer own), INSERT (Owner, Admin, Customer own), UPDATE (Owner, Admin, Groomer own)
  - Records: SELECT (Owner, Admin, Groomer own, Customer own), INSERT (Owner, Admin, Groomer own)

#### 6.2.3 UI Components
- [ ] **Pet Hotel Components**
  - RoomDashboard (visual grid)
  - RoomForm (modal)
  - BookingTable
  - BookingForm (modal/sheet)
  - BookingDetail (dengan logs)
  - DailyLogForm
  - CareNeededDashboard

- [ ] **Grooming Components**
  - GroomingServiceTable
  - GroomingServiceForm
  - GroomingBookingTable
  - GroomingBookingCalendar
  - GroomingBookingForm
  - GroomingRecordForm

#### 6.2.4 Testing
- [ ] **Unit Tests**
  - Room availability check
  - Booking price calculation
  - State machine transitions

- [ ] **Integration Tests**
  - Room CRUD
  - Booking CRUD (check availability)
  - Check-in/check-out flow
  - Daily logs
  - Grooming service CRUD
  - Grooming booking flow
  - RLS policies

- [ ] **E2E Tests**
  - Create room
  - Book pet hotel
  - Check-in/check-out
  - Add daily logs
  - Book grooming
  - Finish grooming

### 6.3 Dependencies
- Phase 3 (Appointments & Medical Records)

### 6.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Room management page created (list + visual dashboard) | ☐ | Test room management |
| Room CRUD working | ☐ | Test all operations |
| Room status management working | ☐ | Test status transitions |
| Booking list page created | ☐ | Test list view |
| Booking CRUD working (check availability) | ☐ | Test booking operations |
| Booking number auto-generation working | ☐ | Test concurrent creation |
| Check-in flow working (update status, room, timestamp) | ☐ | Test check-in |
| Check-out flow working (recalculate price, create invoice) | ☐ | Test check-out |
| Extend booking working | ☐ | Test extension |
| Daily logs CRUD working | ☐ | Test log operations |
| "Care Needed Today" dashboard working | ☐ | Test dashboard |
| RLS policies untuk pet hotel tables complete & tested | ☐ | Test RLS |
| Grooming service management working | ☐ | Test service CRUD |
| Grooming booking list page created (list + calendar) | ☐ | Test list views |
| Grooming booking CRUD working | ☐ | Test booking operations |
| Grooming state machine working (BOOKED → IN_PROGRESS → DONE) | ☐ | Test state transitions |
| Grooming record creation working | ☐ | Test record creation |
| Auto-create invoice item (GROOMING) working | ☐ | Test invoice integration |
| RLS policies untuk grooming tables complete & tested | ☐ | Test RLS |
| Unit tests created & passing | ☐ | Run `npm run test` |
| Integration tests created & passing | ☐ | Run `npm run test:integration` |
| E2E tests created & passing | ☐ | Run `npm run test:e2e` |
| Audit logging working | ☐ | Check audit_logs table |
| Accessibility validated | ☐ | Run axe-core |

---

## 7. Phase 5: Petshop & Inventory

### 7.1 Objective
Membangun modul petshop (produk) dan inventory (stok) dengan stock management dan purchase orders.

### 7.2 Deliverables (End-to-End)

#### 7.2.1 Products Module
- [ ] **Product List**
  - Create product list page
  - Implement search (name, SKU, barcode)
  - Implement filters (category, status, stock level)
  - Display product info (SKU, name, category, price, stock, status)
  - Stock indicator (normal, low, out)

- [ ] **Product CRUD**
  - Create product form (SKU, name, category, supplier, barcode, description, purchase_price, selling_price, stock_quantity, stock_minimum, stock_maximum, photo, expiry_date)
  - Validate SKU uniqueness (immutable)
  - Validate barcode uniqueness (if provided)
  - Product CRUD logic (RPC)
  - Archive product (soft-delete)
  - Hard-delete only if no references
  - Audit log

- [ ] **Product Variants** (optional)
  - Create variant form (variant_name, variant_value, price_adjustment, stock_quantity)
  - Variant CRUD logic

- [ ] **Product Bundles** (optional)
  - Create bundle form (name, description, bundle_price, products)
  - Bundle CRUD logic

- [ ] **Categories & Suppliers**
  - Category CRUD (name, description, parent_id)
  - Supplier CRUD (name, contact_person, phone, email, address, notes, lead_time_days)
  - Validate no references before delete

#### 7.2.2 Inventory Module
- [ ] **Stock Dashboard**
  - Create stock dashboard page
  - Display stock summary (total products, total value, low stock count, overstock count)
  - Low stock alerts list
  - Overstock alerts list
  - Reorder suggestions

- [ ] **Stock Movement**
  - Create stock movement list per product
  - Record stock movement logic (RPC, atomic)
  - Movement types: IN, OUT, RETURN, ADJUSTMENT, DAMAGED, EXPIRED, OPNAME
  - Atomic stock update (prevent negative stock)
  - Auto-trigger low stock alert

- [ ] **Stock Opname**
  - Create stock opname form (product_id, actual_quantity, notes)
  - Calculate difference
  - Create OPNAME movement

- [ ] **Purchase Orders**
  - Create PO list page
  - Create PO form (supplier, items, expected_arrival_date, notes)
  - Auto-generate PO_number (PO-YYYYMMDD-XXXX, atomic)
  - PO CRUD logic (RPC)
  - PO state machine: DRAFT → SENT → PARTIAL_RECEIVED → RECEIVED
  - Receive PO: create IN movements, update stock
  - Auto-suggest reorder based on average sales

#### 7.2.3 UI Components
- [ ] **Product Components**
  - ProductTable
  - ProductForm (modal/sheet)
  - ProductDetail
  - ProductSearch (autocomplete, barcode scan)
  - StockIndicator

- [ ] **Inventory Components**
  - StockDashboard
  - StockMovementTable
  - StockMovementForm
  - StockOpnameForm
  - LowStockAlerts
  - ReorderSuggestions

- [ ] **Purchase Order Components**
  - PurchaseOrderTable
  - PurchaseOrderForm
  - PurchaseOrderDetail
  - ReceivePOForm

#### 7.2.4 Testing
- [ ] **Unit Tests**
  - Product validation (Zod)
  - Stock calculation
  - Reorder suggestion

- [ ] **Integration Tests**
  - Product CRUD
  - Stock movement (atomic, concurrent)
  - Stock opname
  - Purchase order flow
  - RLS policies

- [ ] **E2E Tests**
  - Create product
  - Record stock movement
  - Perform stock opname
  - Create & receive PO

### 7.3 Dependencies
- Phase 4 (Pet Hotel & Grooming)

### 7.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Product list page created dengan search, filter | ☐ | Test list functionality |
| Product CRUD working (create, edit, archive, hard-delete) | ☐ | Test all operations |
| SKU uniqueness validation working | ☐ | Test duplicate SKU |
| Barcode uniqueness validation working | ☐ | Test duplicate barcode |
| Product variants working (optional) | ☐ | Test variants |
| Product bundles working (optional) | ☐ | Test bundles |
| Category CRUD working | ☐ | Test category operations |
| Supplier CRUD working | ☐ | Test supplier operations |
| Stock dashboard created | ☐ | Test dashboard |
| Stock movement recording working (atomic) | ☐ | Test concurrent movements |
| Low stock alert working | ☐ | Test alert trigger |
| Stock opname working | ☐ | Test opname flow |
| Purchase order list page created | ☐ | Test list view |
| Purchase order CRUD working | ☐ | Test PO operations |
| PO number auto-generation working | ☐ | Test concurrent creation |
| PO state machine working | ☐ | Test state transitions |
| Receive PO working (create IN movements) | ☐ | Test receive flow |
| Reorder suggestion working | ☐ | Test suggestion logic |
| RLS policies untuk all petshop tables complete & tested | ☐ | Test RLS |
| Unit tests created & passing | ☐ | Run `npm run test` |
| Integration tests created & passing | ☐ | Run `npm run test:integration` |
| E2E tests created & passing | ☐ | Run `npm run test:e2e` |
| Audit logging working | ☐ | Check audit_logs table |
| Accessibility validated | ☐ | Run axe-core |

---

## 8. Phase 6: POS & Billing

### 8.1 Objective
Membangun sistem POS (kasir) dan billing (invoice, payment) yang terintegrasi dengan semua modul.

### 8.2 Deliverables (End-to-End)

#### 8.2.1 POS Dashboard
- [ ] **POS UI**
  - Create POS dashboard page (2-column layout)
  - Product grid dengan search/barcode scan
  - Cart component (add, update qty, remove)
  - Customer selection (registered/walk-in)
  - Discount & tax input
  - Payment method selection (CASH, NON_CASH, MIXED)
  - Checkout button

- [ ] **POS Logic**
  - Create invoice logic (RPC, atomic transaction)
  - Validate stock availability (atomic, prevent oversell)
  - Calculate totals (subtotal, discount, tax, total)
  - Apply promo code (if exists)
  - Redeem loyalty points (if exists)
  - Deduct stock (atomic)
  - Create invoice + invoice_items + payment
  - Auto-create loyalty points (earn)
  - Print receipt

- [ ] **POS Features**
  - Hold transaction (save cart, recall later)
  - Quick customer creation
  - Keyboard shortcuts (F1-F12)
  - Barcode scanner integration

#### 8.2.2 Invoice & Billing
- [ ] **Invoice List**
  - Create invoice list page
  - Implement filters (date, status, type, customer, kasir)
  - Display invoice info (invoice_number, customer, type, total, status)

- [ ] **Invoice Types**
  - POS (product sales)
  - CLINICAL (consultation/treatment/medicine)
  - PET_HOTEL (boarding)
  - GROOMING (grooming service)
  - MIXED (combined)

- [ ] **Invoice Detail**
  - Create invoice detail page/sheet
  - Display invoice items
  - Display payments
  - Display promo & loyalty info
  - Print invoice

- [ ] **Payment Recording**
  - Record payment form (payment_method, amount, reference_number, notes)
  - Payment logic (RPC)
  - Auto-update invoice status (UNPAID → PARTIAL_PAYMENT → PAID)
  - Auto-create loyalty points (earn) saat PAID
  - Handle mixed payments

- [ ] **Invoice Cancellation**
  - Cancel invoice logic (RPC)
  - Auto-restore stock (for PRODUCT items)
  - Auto-reverse loyalty points
  - Auto-reverse promo usage
  - Handle refund (optional)

#### 8.2.3 Cash Shifts
- [ ] **Cash Shift Management**
  - Create cash shift list page
  - Open shift (set opening_cash)
  - Close shift (set closing_cash, calculate expected_cash, difference)
  - Display shift summary (transactions, total cash, total non-cash)

#### 8.2.4 UI Components
- [ ] **POS Components**
  - POSGrid (product grid)
  - POSCart
  - POSProductCard
  - POSSearch (barcode scan)
  - POSCustomerSelect
  - POSPaymentModal
  - POSReceipt

- [ ] **Invoice Components**
  - InvoiceTable
  - InvoiceDetail
  - InvoiceItem
  - PaymentForm
  - PaymentHistory

- [ ] **Cash Shift Components**
  - CashShiftTable
  - OpenShiftForm
  - CloseShiftForm
  - ShiftSummary

#### 8.2.5 Testing
- [ ] **Unit Tests**
  - Invoice total calculation
  - Payment status calculation
  - Stock deduction logic

- [ ] **Integration Tests**
  - POS checkout (atomic, concurrent)
  - Payment recording
  - Invoice cancellation (stock restore)
  - Loyalty points (earn, redeem)
  - Promo code application
  - Cash shift
  - RLS policies

- [ ] **E2E Tests**
  - POS checkout (full flow)
  - Record payment
  - Cancel invoice
  - Open/close cash shift

### 8.3 Dependencies
- Phase 5 (Petshop & Inventory)

### 8.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| POS dashboard UI created (2-column layout) | ☐ | Test POS UI |
| Product grid working (search, barcode scan) | ☐ | Test product selection |
| Cart working (add, update, remove) | ☐ | Test cart operations |
| Customer selection working (registered/walk-in) | ☐ | Test customer selection |
| Discount & tax input working | ☐ | Test discount/tax |
| POS checkout working (atomic, concurrent-safe) | ☐ | Test concurrent checkout |
| Stock validation working (prevent oversell) | ☐ | Test stock validation |
| Stock deduction working (atomic) | ☐ | Test stock update |
| Invoice creation working (all types) | ☐ | Test invoice creation |
| Payment recording working | ☐ | Test payment operations |
| Invoice status auto-update working | ☐ | Test status transitions |
| Invoice cancellation working (stock restore) | ☐ | Test cancellation |
| Loyalty points earn working | ☐ | Test points earning |
| Loyalty points redeem working | ☐ | Test points redemption |
| Promo code application working | ☐ | Test promo application |
| Cash shift open/close working | ☐ | Test cash shift |
| Hold transaction working | ☐ | Test hold/recall |
| Keyboard shortcuts working | ☐ | Test shortcuts |
| Receipt printing working | ☐ | Test receipt |
| RLS policies untuk all billing tables complete & tested | ☐ | Test RLS |
| Unit tests created & passing | ☐ | Run `npm run test` |
| Integration tests created & passing | ☐ | Run `npm run test:integration` |
| E2E tests created & passing | ☐ | Run `npm run test:e2e` |
| Audit logging working | ☐ | Check audit_logs table |
| Accessibility validated | ☐ | Run axe-core |

---

## 9. Phase 7: Loyalty & Promotions

### 9.1 Objective
Membangun sistem loyalty program (points, tiers) dan promotions (discounts, vouchers) untuk meningkatkan customer retention.

### 9.2 Deliverables (End-to-End)

#### 9.2.1 Loyalty Program
- [ ] **Loyalty Tier Management**
  - Create tier list page
  - Create tier form (tier_name, min_points, min_spending, point_multiplier, benefits)
  - Tier CRUD logic (RPC)
  - Default tiers: BRONZE, SILVER, GOLD, PLATINUM

- [ ] **Loyalty Member Management**
  - Create member list page
  - Display member info (customer, tier, total_points, available_points, total_spending)
  - Member detail (transaction history)

- [ ] **Loyalty Transactions**
  - Earn points logic (RPC, triggered by invoice PAID)
  - Redeem points logic (RPC, triggered by POS checkout)
  - Reverse points logic (RPC, triggered by invoice cancel)
  - Auto tier upgrade check

- [ ] **Loyalty Dashboard**
  - Create loyalty dashboard page
  - Display member statistics (total members, tier distribution)
  - Display top members
  - Display points issued/redeemed

#### 9.2.2 Promotions
- [ ] **Promotion Management**
  - Create promotion list page
  - Create promotion form (code, name, description, type, discount_value, min_purchase, max_usage, start_date, end_date, applicable_products)
  - Promotion types: PERCENTAGE, FIXED, BUNDLE, HAPPY_HOUR, BIRTHDAY
  - Promotion CRUD logic (RPC)
  - Promotion status: ACTIVE, EXPIRED, CANCELLED

- [ ] **Promotion Validation**
  - Validate promo code (active, not expired, usage limit, min purchase)
  - Calculate discount
  - Check applicable products
  - Prevent stacking (configurable)

- [ ] **Promotion Usage Tracking**
  - Track promotion usage per invoice
  - Update current_usage counter
  - Reverse usage on invoice cancel

#### 9.2.3 Customer Feedback
- [ ] **Feedback Management**
  - Create feedback list page
  - Display feedback info (customer, rating, comment, nps_score, date)
  - Feedback detail
  - Auto-request feedback (H+1 after invoice PAID)

#### 9.2.4 UI Components
- [ ] **Loyalty Components**
  - LoyaltyDashboard
  - LoyaltyTierTable
  - LoyaltyTierForm
  - LoyaltyMemberTable
  - LoyaltyMemberDetail
  - LoyaltyTransactionTable

- [ ] **Promotion Components**
  - PromotionTable
  - PromotionForm
  - PromotionDetail
  - PromoCodeInput (POS)

- [ ] **Feedback Components**
  - FeedbackTable
  - FeedbackDetail
  - FeedbackForm (portal)

#### 9.2.5 Testing
- [ ] **Unit Tests**
  - Points calculation
  - Tier upgrade logic
  - Promotion validation

- [ ] **Integration Tests**
  - Tier CRUD
  - Earn/redeem/reverse points
  - Tier upgrade
  - Promotion CRUD
  - Promo code validation
  - Feedback CRUD
  - RLS policies

- [ ] **E2E Tests**
  - Create tier
  - Earn points (via invoice)
  - Redeem points (via POS)
  - Create & apply promotion
  - Submit feedback

### 9.3 Dependencies
- Phase 6 (POS & Billing)

### 9.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Loyalty tier management working | ☐ | Test tier CRUD |
| Loyalty member management working | ☐ | Test member list & detail |
| Earn points working (triggered by invoice PAID) | ☐ | Test points earning |
| Redeem points working (triggered by POS checkout) | ☐ | Test points redemption |
| Reverse points working (triggered by invoice cancel) | ☐ | Test points reversal |
| Auto tier upgrade working | ☐ | Test tier upgrade |
| Loyalty dashboard working | ☐ | Test dashboard |
| Promotion management working | ☐ | Test promotion CRUD |
| Promotion validation working | ☐ | Test promo validation |
| Promotion usage tracking working | ☐ | Test usage tracking |
| Feedback management working | ☐ | Test feedback CRUD |
| Auto-request feedback working | ☐ | Test feedback request |
| RLS policies untuk all loyalty/promotion tables complete & tested | ☐ | Test RLS |
| Unit tests created & passing | ☐ | Run `npm run test` |
| Integration tests created & passing | ☐ | Run `npm run test:integration` |
| E2E tests created & passing | ☐ | Run `npm run test:e2e` |
| Audit logging working | ☐ | Check audit_logs table |
| Accessibility validated | ☐ | Run axe-core |

---

## 10. Phase 8: Finance & Reports

### 10.1 Objective
Membangun modul keuangan (expenses) dan laporan (reports) untuk decision-making.

### 10.2 Deliverables (End-to-End)

#### 10.2.1 Expenses Module
- [ ] **Expense Category Management**
  - Create category list page
  - Create category form (name, description)
  - Category CRUD logic (RPC)

- [ ] **Expense Management**
  - Create expense list page
  - Create expense form (expense_date, category, amount, description, receipt_url, is_recurring, recurring_day)
  - Expense CRUD logic (RPC)
  - Expense status: PENDING, APPROVED, REJECTED, REVERSED
  - Approve/reject/reverse logic (Owner only)

- [ ] **Expense Dashboard**
  - Create expense dashboard page
  - Display expense summary (monthly, by category)
  - Display pending expenses

#### 10.2.2 Reports Module
- [ ] **Revenue Report**
  - Create revenue report page
  - Display revenue by period (day/week/month)
  - Display revenue by source (POS, clinical, pet hotel, grooming)
  - Charts (line, bar)
  - Export CSV/PDF

- [ ] **Profit & Loss Report**
  - Create P&L report page
  - Calculate revenue, COGS, expenses, net profit
  - Charts
  - Export CSV/PDF

- [ ] **Appointments Report**
  - Create appointments report page
  - Display appointments by period/doctor/status
  - Charts
  - Export CSV/PDF

- [ ] **Medical Records Report**
  - Create medical records report page
  - Display records by period/doctor
  - Statistics (diagnosis, etc.)
  - Export CSV/PDF

- [ ] **Customers Report**
  - Create customers report page
  - Display customer growth, most active
  - Charts
  - Export CSV/PDF

- [ ] **Pets Report**
  - Create pets report page
  - Display species/breed distribution, vaccination status
  - Charts
  - Export CSV/PDF

- [ ] **Inventory Report**
  - Create inventory report page
  - Display stock value, low/overstock, movements
  - Charts
  - Export CSV/PDF

- [ ] **Products Report**
  - Create products report page
  - Display best-selling, margin, turnover
  - Charts
  - Export CSV/PDF

- [ ] **POS Report**
  - Create POS report page
  - Display transactions by period/kasir
  - Charts
  - Export CSV/PDF

- [ ] **Invoices Report**
  - Create invoices report page
  - Display invoice status, aging
  - Charts
  - Export CSV/PDF

- [ ] **Pet Hotel Report**
  - Create pet hotel report page
  - Display occupancy, revenue
  - Charts
  - Export CSV/PDF

- [ ] **Grooming Report**
  - Create grooming report page
  - Display revenue, groomer productivity
  - Charts
  - Export CSV/PDF

- [ ] **Loyalty Report**
  - Create loyalty report page
  - Display active members, points distributed, redemptions
  - Charts
  - Export CSV/PDF

- [ ] **Expenses Report**
  - Create expenses report page
  - Display expenses by category
  - Charts
  - Export CSV/PDF

- [ ] **Activity Report**
  - Create activity report page
  - Display staff activity by user
  - Export CSV/PDF

- [ ] **Audit Log**
  - Create audit log page (Owner only)
  - Display all system changes
  - Filters (user, action, entity, date)
  - Export CSV/PDF

#### 10.2.3 UI Components
- [ ] **Expense Components**
  - ExpenseCategoryTable
  - ExpenseCategoryForm
  - ExpenseTable
  - ExpenseForm
  - ExpenseDashboard

- [ ] **Report Components**
  - ReportSelector
  - ReportFilter
  - ReportChart (line, bar, pie)
  - ReportTable
  - ReportExport (CSV/PDF)

#### 10.2.4 Testing
- [ ] **Unit Tests**
  - Report calculations
  - P&L calculation

- [ ] **Integration Tests**
  - Expense CRUD
  - Expense approval flow
  - All reports (data accuracy)
  - Export functionality
  - RLS policies

- [ ] **E2E Tests**
  - Create expense
  - Approve expense
  - Generate reports
  - Export reports

### 10.3 Dependencies
- Phase 7 (Loyalty & Promotions)

### 10.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Expense category management working | ☐ | Test category CRUD |
| Expense management working | ☐ | Test expense CRUD |
| Expense approval flow working | ☐ | Test approve/reject/reverse |
| Expense dashboard working | ☐ | Test dashboard |
| Revenue report working | ☐ | Test report accuracy |
| P&L report working | ☐ | Test P&L calculation |
| Appointments report working | ☐ | Test report |
| Medical records report working | ☐ | Test report |
| Customers report working | ☐ | Test report |
| Pets report working | ☐ | Test report |
| Inventory report working | ☐ | Test report |
| Products report working | ☐ | Test report |
| POS report working | ☐ | Test report |
| Invoices report working | ☐ | Test report |
| Pet hotel report working | ☐ | Test report |
| Grooming report working | ☐ | Test report |
| Loyalty report working | ☐ | Test report |
| Expenses report working | ☐ | Test report |
| Activity report working | ☐ | Test report |
| Audit log working (Owner only) | ☐ | Test audit log |
| All reports exportable (CSV/PDF) | ☐ | Test export |
| RLS policies untuk all finance tables complete & tested | ☐ | Test RLS |
| Unit tests created & passing | ☐ | Run `npm run test` |
| Integration tests created & passing | ☐ | Run `npm run test:integration` |
| E2E tests created & passing | ☐ | Run `npm run test:e2e` |
| Audit logging working | ☐ | Check audit_logs table |
| Accessibility validated | ☐ | Run axe-core |

---

## 11. Phase 9: Customer Portal

### 11.1 Objective
Membangun portal customer (self-service) dengan semua fitur yang dibutuhkan customer.

### 11.2 Deliverables (End-to-End)

#### 11.2.1 Portal UI
- [ ] **Portal Layout**
  - Create portal layout (mobile-first, bottom navigation)
  - Create portal home page
  - Create portal navigation (Home, Appointments, Shop, Rewards, Profile)

#### 11.2.2 Portal Features
- [ ] **Profile**
  - View & edit profile (name, phone, email, address)
  - Change PIN
  - View tier membership

- [ ] **Pets**
  - View own pets list
  - View pet detail (all tabs)
  - View Digital Pet ID Card

- [ ] **Appointments**
  - View appointment history
  - Create new appointment (flag `is_from_portal`)
  - View appointment detail

- [ ] **Medical Records**
  - View medical record summary (read-only, limited fields)

- [ ] **Invoices**
  - View invoice history
  - View invoice detail
  - Pay invoice online (payment gateway integration, optional)

- [ ] **Pet Hotel**
  - View pet hotel booking history
  - Create new booking (flag `is_from_portal`)
  - View booking detail

- [ ] **Grooming**
  - View grooming booking history
  - Create new booking (flag `is_from_portal`)
  - View booking detail

- [ ] **Loyalty**
  - View points balance
  - View tier info
  - View transaction history
  - Redeem points (voucher)
  - View available vouchers

- [ ] **Shop (E-Commerce Ringan)**
  - Browse products (ACTIVE only)
  - Add to cart / wishlist
  - Checkout (pickup/delivery)
  - Payment (payment gateway, optional)
  - View order history
  - Track order

- [ ] **Promotions**
  - View active promotions
  - View own vouchers

- [ ] **Feedback**
  - Submit feedback after visit
  - View feedback history

- [ ] **Notifications**
  - View notifications (reminder, promo, invoice)
  - Mark as read

#### 11.2.3 UI Components
- [ ] **Portal Components**
  - PortalLayout
  - PortalBottomNav
  - PortalHome
  - PortalProfile
  - PortalPets
  - PortalAppointments
  - PortalMedicalRecords
  - PortalInvoices
  - PortalPetHotel
  - PortalGrooming
  - PortalLoyalty
  - PortalShop
  - PortalPromotions
  - PortalFeedback
  - PortalNotifications

#### 11.2.4 Testing
- [ ] **Unit Tests**
  - Portal form validation

- [ ] **Integration Tests**
  - Portal features (all)
  - RLS policies (customer can only see own data)

- [ ] **E2E Tests**
  - Portal login
  - Book appointment
  - Book pet hotel
  - Book grooming
  - Shop checkout
  - Redeem points
  - Submit feedback

### 11.3 Dependencies
- Phase 8 (Finance & Reports)

### 11.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Portal layout created (mobile-first, bottom nav) | ☐ | Test portal UI |
| Profile feature working (view, edit, change PIN) | ☐ | Test profile operations |
| Pets feature working (view own pets) | ☐ | Test pets view |
| Appointments feature working (view, create) | ☐ | Test appointment operations |
| Medical records feature working (view summary) | ☐ | Test medical records view |
| Invoices feature working (view, pay online) | ☐ | Test invoice operations |
| Pet hotel feature working (view, book) | ☐ | Test pet hotel operations |
| Grooming feature working (view, book) | ☐ | Test grooming operations |
| Loyalty feature working (view, redeem) | ☐ | Test loyalty operations |
| Shop feature working (browse, cart, checkout) | ☐ | Test shop operations |
| Promotions feature working (view) | ☐ | Test promotions view |
| Feedback feature working (submit) | ☐ | Test feedback submission |
| Notifications feature working (view, mark read) | ☐ | Test notifications |
| RLS policies enforced (customer only sees own data) | ☐ | Test RLS |
| Portal responsive (mobile, tablet, desktop) | ☐ | Test responsiveness |
| Unit tests created & passing | ☐ | Run `npm run test` |
| Integration tests created & passing | ☐ | Run `npm run test:integration` |
| E2E tests created & passing | ☐ | Run `npm run test:e2e` |
| Accessibility validated | ☐ | Run axe-core |

---

## 12. Phase 10: Integration & Testing

### 12.1 Objective
Melakukan integrasi menyeluruh dan testing ekstensif untuk memastikan kualitas sistem.

### 12.2 Deliverables (End-to-End)

#### 12.2.1 Integration Testing
- [ ] **Cross-Module Integration**
  - Test appointment → medical record → invoice flow
  - Test pet hotel booking → check-in → daily logs → check-out → invoice flow
  - Test grooming booking → in-progress → done → invoice flow
  - Test POS checkout → stock deduction → loyalty points flow
  - Test promotion application → invoice → usage tracking flow
  - Test portal booking → staff confirmation flow

- [ ] **RBAC Testing**
  - Test all role permissions (Owner, Admin, Doctor, Kasir, Customer)
  - Test unauthorized access attempts
  - Test RLS policies comprehensively

#### 12.2.2 Performance Testing
- [ ] **Frontend Performance**
  - Run Lighthouse CI (target: ≥ 90 all categories)
  - Optimize bundle size (target: < 300 KB initial)
  - Optimize images & assets
  - Implement code splitting
  - Test Core Web Vitals (FCP, LCP, TBT, CLS)

- [ ] **Backend Performance**
  - Run load tests (k6) untuk critical endpoints
  - Optimize database queries
  - Add missing indexes
  - Test concurrent transactions (POS checkout)
  - Monitor Supabase performance

#### 12.2.3 Security Testing
- [ ] **Security Audit**
  - Run `npm audit` & fix vulnerabilities
  - Test authentication security (brute force, SQL injection, XSS)
  - Test authorization (RBAC, RLS)
  - Test session management
  - Test input validation (all forms)
  - Test file upload security
  - Review logs for sensitive data leaks

- [ ] **Penetration Testing** (manual, optional)
  - Hire security consultant (optional)
  - Test common vulnerabilities
  - Document findings & fixes

#### 12.2.4 Accessibility Testing
- [ ] **WCAG 2.1 AA Compliance**
  - Run axe-core pada semua pages
  - Test keyboard navigation
  - Test screen reader compatibility
  - Test color contrast
  - Fix all critical violations

#### 12.2.5 User Acceptance Testing (UAT)
- [ ] **UAT dengan Stakeholder**
  - Prepare UAT test cases
  - Conduct UAT sessions dengan Owner, Admin, Doctor, Kasir, Customer
  - Collect feedback
  - Fix critical issues
  - Get sign-off

#### 12.2.6 Documentation
- [ ] **Technical Documentation**
  - API documentation (all endpoints, RPCs)
  - Database schema documentation
  - Deployment guide
  - Troubleshooting guide

- [ ] **User Documentation**
  - User manual (Owner, Admin, Doctor, Kasir)
  - Customer portal guide
  - FAQ
  - Video tutorials (optional)

### 12.3 Dependencies
- Phase 9 (Customer Portal)

### 12.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Cross-module integration tested | ☐ | Test all flows |
| RBAC tested comprehensively | ☐ | Test all roles |
| Lighthouse CI score ≥ 90 all categories | ☐ | Run Lighthouse |
| Bundle size < 300 KB (initial) | ☐ | Run `npm run size` |
| Core Web Vitals within target | ☐ | Check Lighthouse report |
| Load tests passed | ☐ | Run k6 tests |
| Security audit completed (no critical vulnerabilities) | ☐ | Run `npm audit` |
| Authentication security tested | ☐ | Test auth flows |
| Authorization (RBAC, RLS) tested | ☐ | Test access control |
| Input validation tested | ☐ | Test all forms |
| WCAG 2.1 AA compliance validated | ☐ | Run axe-core |
| Keyboard navigation tested | ☐ | Test keyboard |
| UAT completed dengan stakeholder | ☐ | Get UAT sign-off |
| Critical UAT issues fixed | ☐ | Check issue tracker |
| Technical documentation complete | ☐ | Check docs |
| User documentation complete | ☐ | Check docs |

---

## 13. Phase 11: Deployment & Launch

### 13.1 Objective
Deploy sistem ke production dan memastikan operasional berjalan lancar.

### 13.2 Deliverables (End-to-End)

#### 13.2.1 Staging Deployment
- [ ] **Staging Environment**
  - Deploy to staging (Vercel)
  - Configure staging Supabase
  - Test all features di staging
  - Performance testing di staging
  - Security testing di staging

#### 13.2.2 Production Deployment
- [ ] **Production Environment**
  - Deploy to production (Vercel)
  - Configure production Supabase
  - Configure custom domain (jika ada)
  - Configure SSL certificate
  - Setup monitoring (Sentry, Vercel Analytics)
  - Setup alerting (Slack, email)

- [ ] **Data Migration** (jika ada data existing)
  - Prepare migration script
  - Test migration di staging
  - Execute migration di production
  - Verify data integrity

#### 13.2.3 Post-Deployment
- [ ] **Smoke Tests**
  - Run smoke tests di production
  - Verify all critical flows working
  - Monitor error rates

- [ ] **Monitoring Setup**
  - Configure error tracking (Sentry)
  - Configure performance monitoring (Vercel Analytics)
  - Configure uptime monitoring
  - Configure alerting (Slack, email, SMS)

- [ ] **Backup & Recovery**
  - Configure automatic backups (Supabase)
  - Test backup restoration
  - Document recovery procedure

#### 13.2.4 Training & Handover
- [ ] **Training**
  - Train Owner (full system)
  - Train Admin (operational)
  - Train Doctor (clinical features)
  - Train Kasir (POS)
  - Train Customer (portal)

- [ ] **Handover**
  - Handover documentation
  - Handover credentials (Supabase, Vercel, GitHub)
  - Handover support contact
  - Warranty period (optional)

#### 13.2.5 Launch
- [ ] **Soft Launch**
  - Launch dengan limited users
  - Monitor closely
  - Collect feedback
  - Fix issues

- [ ] **Full Launch**
  - Announce launch
  - Onboard all users
  - Provide support
  - Monitor system

### 13.3 Dependencies
- Phase 10 (Integration & Testing)

### 13.4 Definition of Done (Matrik Selesai)

| Kriteria | Status | Verifikasi |
|---|---|---|
| Staging deployment successful | ☐ | Test staging environment |
| Production deployment successful | ☐ | Test production environment |
| Custom domain configured (jika ada) | ☐ | Check domain |
| SSL certificate active | ☐ | Check HTTPS |
| Monitoring configured (Sentry, Vercel Analytics) | ☐ | Check monitoring dashboards |
| Alerting configured (Slack, email) | ☐ | Test alerts |
| Automatic backups configured | ☐ | Check backup schedule |
| Backup restoration tested | ☐ | Test restoration |
| Smoke tests passed di production | ☐ | Run smoke tests |
| Training completed untuk all roles | ☐ | Get training sign-off |
| Handover completed | ☐ | Get handover sign-off |
| Soft launch completed | ☐ | Monitor soft launch |
| Full launch completed | ☐ | Announce launch |
| Support channel established | ☐ | Check support channel |
| All critical issues resolved | ☐ | Check issue tracker |

---

## 14. Matrik Definition of Done Global

### 14.1 Code Quality

| Kriteria | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 | Phase 10 | Phase 11 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| TypeScript strict mode | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ESLint passing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Prettier formatted | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| No TODO/FIXME without issue | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Code review approved | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 14.2 Testing

| Kriteria | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 | Phase 10 | Phase 11 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Unit tests created | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Unit tests passing | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Integration tests created | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Integration tests passing | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| E2E tests created | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| E2E tests passing | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Code coverage ≥ 80% (business logic) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |

### 14.3 Security

| Kriteria | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 | Phase 10 | Phase 11 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| RLS policies created | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| RLS policies tested | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Audit logging working | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| No hardcoded secrets | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Input validation (Zod) | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Security audit passed | — | — | — | — | — | — | — | — | — | — | ✅ | ✅ |

### 14.4 Performance

| Kriteria | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 | Phase 10 | Phase 11 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Lighthouse score ≥ 90 | — | — | — | — | — | — | — | — | — | — | ✅ | ✅ |
| Bundle size < 300 KB | — | — | — | — | — | — | — | — | — | — | ✅ | ✅ |
| Load tests passed | — | — | — | — | — | — | — | — | — | — | ✅ | — |

### 14.5 Accessibility

| Kriteria | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 | Phase 10 | Phase 11 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| WCAG 2.1 AA validated | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Keyboard navigation working | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 14.6 Documentation

| Kriteria | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 | Phase 10 | Phase 11 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| README.md updated | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| API docs updated | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| User guide updated | — | — | — | — | — | — | — | — | — | — | ✅ | ✅ |

### 14.7 Deployment

| Kriteria | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 | Phase 10 | Phase 11 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CI/CD pipeline working | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Staging deployment successful | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Production deployment successful | — | — | — | — | — | — | — | — | — | — | — | ✅ |

---

## 15. Dependency Matrix

### 15.1 Phase Dependencies

| Phase | Depends On | Blocks |
|---|---|---|
| Phase 0: Foundation | — | Phase 1-11 |
| Phase 1: Auth | Phase 0 | Phase 2-11 |
| Phase 2: CRM | Phase 1 | Phase 3-11 |
| Phase 3: Appointments | Phase 2 | Phase 4-11 |
| Phase 4: Pet Hotel & Grooming | Phase 3 | Phase 5-11 |
| Phase 5: Petshop | Phase 4 | Phase 6-11 |
| Phase 6: POS & Billing | Phase 5 | Phase 7-11 |
| Phase 7: Loyalty & Promotions | Phase 6 | Phase 8-11 |
| Phase 8: Finance & Reports | Phase 7 | Phase 9-11 |
| Phase 9: Customer Portal | Phase 8 | Phase 10-11 |
| Phase 10: Integration & Testing | Phase 9 | Phase 11 |
| Phase 11: Deployment & Launch | Phase 10 | — |

### 15.2 Module Dependencies

| Module | Depends On |
|---|---|
| Auth | — |
| Customers | Auth |
| Pets | Customers |
| Appointments | Customers, Pets |
| Medical Records | Appointments |
| Pet Hotel | Customers, Pets |
| Grooming | Customers, Pets |
| Products | — |
| Inventory | Products |
| Purchase Orders | Products, Inventory, Suppliers |
| POS | Products, Inventory, Customers |
| Invoices | POS, Appointments, Pet Hotel, Grooming |
| Payments | Invoices |
| Loyalty | Customers, Invoices |
| Promotions | Invoices |
| Feedback | Invoices |
| Expenses | — |
| Reports | All modules |
| Portal | All modules |

---

## Ringkasan Eksekutif

### Total Phases: 12 (Phase 0 - Phase 11)

### Total Deliverables
- **Phase 0**: 15 deliverables
- **Phase 1**: 19 deliverables
- **Phase 2**: 20 deliverables
- **Phase 3**: 18 deliverables
- **Phase 4**: 22 deliverables
- **Phase 5**: 23 deliverables
- **Phase 6**: 24 deliverables
- **Phase 7**: 17 deliverables
- **Phase 8**: 26 deliverables
- **Phase 9**: 19 deliverables
- **Phase 10**: 12 deliverables
- **Phase 11**: 11 deliverables

**Total: ~226 deliverables**

### Quality Gates
Setiap phase memiliki Definition of Done yang ketat:
- ✅ Code quality (TypeScript, ESLint, Prettier)
- ✅ Testing (unit, integration, E2E)
- ✅ Security (RLS, audit logging, validation)
- ✅ Performance (Lighthouse, bundle size)
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Documentation (API docs, user guide)

### Prinsip Pengembangan
1. **Foundation First** — Setup infrastruktur & DB schema sebelum fitur
2. **Auth Early** — Auth & RBAC di awal karena semua modul bergantung
3. **Core Before Advanced** — CRM → Appointments → Petshop → POS
4. **Integration Last** — Integrasi & testing setelah semua modul siap
5. **Incremental Delivery** — Setiap phase deliverable & testable
6. **Quality Over Speed** — Fokus pada quality, bukan speed

### Success Criteria
- Semua phase completed dengan DoD met
- All tests passing (unit, integration, E2E)
- Security audit passed (no critical vulnerabilities)
- Performance targets met (Lighthouse ≥ 90, bundle < 300 KB)
- Accessibility validated (WCAG 2.1 AA)
- UAT completed dengan stakeholder sign-off
- Production deployment successful
- Training completed untuk all users
- Support channel established

---

**Roadmap ini merupakan baseline final untuk pengembangan Petora. Setiap phase harus diselesaikan dengan Definition of Done yang ketat sebelum melanjutkan ke phase berikutnya. Kualitas adalah prioritas utama, bukan kecepatan.** 🚀
