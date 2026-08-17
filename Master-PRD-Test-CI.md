# Product Requirements Document (PRD)
## HaLand PetCare — Testing Strategy & CI/CD Pipeline
### Dokumen Baseline Final | 18 Agustus 2026

---

## Daftar Isi
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Tujuan & Prinsip](#2-tujuan--prinsip)
3. [Testing Pyramid & Strategy](#3-testing-pyramid--strategy)
4. [Unit Testing](#4-unit-testing)
5. [Component Testing](#5-component-testing)
6. [Integration Testing](#6-integration-testing)
7. [End-to-End (E2E) Testing](#7-end-to-end-e2e-testing)
8. [Security Testing](#8-security-testing)
9. [Performance Testing](#9-performance-testing)
10. [Accessibility & Usability Testing](#10-accessibility--usability-testing)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Quality Gates & Metrics](#12-quality-gates--metrics)
13. [Test Data Management](#13-test-data-management)
14. [Environment Management](#14-environment-management)
15. [Monitoring & Observability](#15-monitoring--observability)
16. [Definition of Done](#16-definition-of-done)
17. [Tools & Dependencies](#17-tools--dependencies)
18. [Item Terbuka](#18-item-terbuka)
19. [Glosarium](#19-glosarium)

---

## 1. Ringkasan Eksekutif

Dokumen ini mendefinisikan **strategi testing dan pipeline CI/CD** untuk HaLand PetCare — sistem manajemen terpadu Petshop & Petcare berbasis React + Vite + TypeScript + Supabase yang di-deploy ke Vercel.

Dokumen ini menjadi **baseline tunggal** untuk:
- Menjamin kualitas kode sebelum merge ke branch utama
- Mencegah regresi fitur pada setiap perubahan
- Memvalidasi alur bisnis kritis (POS, appointment, medical records, pet hotel, grooming, loyalty, e-commerce portal)
- Memastikan keamanan autentikasi dan Row Level Security (RLS) Supabase
- Mengotomasi deployment ke staging & production
- Memberikan feedback cepat kepada developer (target: < 10 menit untuk PR check)

Dokumen ini melengkapi **PRD Produk HaLand PetCare** dan harus diimplementasikan secara paralel sejak hari pertama pengembangan.

---

## 2. Tujuan & Prinsip

### 2.1 Tujuan
- **Zero critical bugs** di production untuk alur bisnis kritis
- **Coverage minimal 80%** untuk business logic (Zod schemas, hooks, utils)
- **Feedback loop cepat** — developer tahu hasil test dalam < 10 menit
- **Deployment aman** — tidak ada deploy tanpa green build
- **Regression-free** — setiap fitur memiliki test yang menjaganya
- **Audit-ready** — test log terdokumentasi untuk compliance

### 2.2 Prinsip Testing
| Prinsip | Penjelasan |
|---|---|
| **Test what matters** | Fokus pada alur bisnis kritis, bukan coverage semu |
| **Fast feedback** | Test suite utama harus selesai < 5 menit |
| **Deterministic** | Test harus konsisten, tidak flaky |
| **Isolated** | Setiap test independen, tidak bergantung urutan |
| **Readable** | Test adalah dokumentasi — nama test harus jelas |
| **Maintainable** | Test yang sulit di-maintain adalah test yang gagal |
| **Shift-left** | Test sedini mungkin, mulai dari unit |
| **Production-like** | Staging environment harus mirip production |

### 2.3 Non-Goals (Tidak Termasuk)
- ❌ Coverage 100% (biaya terlalu tinggi, value marginal)
- ❌ Visual regression testing untuk setiap pixel (hanya untuk komponen kritis)
- ❌ Load testing di CI (dilakukan terpisah, terjadwal)
- ❌ Penetration testing otomatis penuh (dilakukan manual berkala)

---

## 3. Testing Pyramid & Strategy

### 3.1 Testing Pyramid
```
         ╱╲
        ╱E2E╲          ← 10%  | Playwright | Alur bisnis end-to-end
       ╱──────╲
      ╱Integration╲     ← 20%  | Vitest + Testing Library | Fitur + Supabase
     ╱──────────────╲
    ╱ Component Tests ╲  ← 30%  | Vitest + Testing Library | UI components
   ╱────────────────────╲
  ╱     Unit Tests        ╲ ← 40% | Vitest | Schemas, utils, hooks
 ╱──────────────────────────╲
```

### 3.2 Distribusi Test per Layer
| Layer | Tools | Target Coverage | Waktu Eksekusi |
|---|---|---|---|
| Unit Tests | Vitest | 80%+ | < 30 detik |
| Component Tests | Vitest + Testing Library + MSW | 70%+ | < 2 menit |
| Integration Tests | Vitest + Supabase local + MSW | 60%+ | < 3 menit |
| E2E Tests | Playwright | 20+ skenario kritis | < 10 menit |
| Security Tests | ESLint + custom rules + manual audit | N/A | < 5 menit |
| Performance Tests | Lighthouse CI + k6 | N/A | < 5 menit |

### 3.3 Test Naming Convention
```typescript
// Format: [modul] - [fitur] - [skenario] - [hasil yang diharapkan]
describe('POS Checkout', () => {
  it('should deduct stock when checkout succeeds', () => { ... });
  it('should reject checkout when stock insufficient', () => { ... });
  it('should apply loyalty points redemption correctly', () => { ... });
});
```

---

## 4. Unit Testing

### 4.1 Scope
Unit test mencakup **business logic murni** tanpa dependency UI atau database:
- **Zod schemas** — validasi input/output
- **Utility functions** — format currency, date, kalkulasi diskon, konversi unit
- **Custom hooks** (pure logic) — `useDebounce`, `useLocalStorage`, kalkulasi
- **State management** — Zustand stores (pure reducers)
- **Business rules** — kalkulasi loyalty points, tier upgrade, invoice total
- **Enum validators** — status transitions

### 4.2 Tools
| Tool | Fungsi |
|---|---|
| **Vitest** | Test runner (Vite-native, cepat) |
| **@testing-library/react** | Untuk hooks testing |
| **Zod** test helpers | Validasi schema |

### 4.3 Contoh Test yang Wajib Ada

#### 4.3.1 Zod Schema Validation
```typescript
// schemas/invoice.test.ts
describe('InvoiceSchema', () => {
  it('should accept valid invoice data', () => { ... });
  it('should reject negative total', () => { ... });
  it('should reject empty items array', () => { ... });
  it('should validate payment method enum', () => { ... });
  it('should enforce unique SKU on products', () => { ... });
});
```

#### 4.3.2 Business Rules
```typescript
// lib/business-rules/loyalty.test.ts
describe('Loyalty Points Calculation', () => {
  it('should calculate 1 point per Rp 10.000', () => { ... });
  it('should apply tier multiplier correctly', () => { ... });
  it('should reject redemption if points insufficient', () => { ... });
  it('should prevent redemption below minimum tier', () => { ... });
});

// lib/business-rules/inventory.test.ts
describe('Stock Validation', () => {
  it('should reject checkout when stock < qty', () => { ... });
  it('should detect low stock condition', () => { ... });
  it('should detect overstock condition', () => { ... });
  it('should calculate reorder suggestion', () => { ... });
});

// lib/business-rules/billing.test.ts
describe('Invoice Total Calculation', () => {
  it('should compute (subtotal - discount) + tax', () => { ... });
  it('should choose smaller discount when both % and fixed given', () => { ... });
  it('should compute cash change correctly', () => { ... });
  it('should handle mixed payment correctly', () => { ... });
});
```

#### 4.3.3 Utility Functions
```typescript
// lib/utils/format.test.ts
describe('formatCurrency', () => {
  it('should format to Rupiah with thousand separator', () => { ... });
  it('should handle negative values', () => { ... });
  it('should handle zero', () => { ... });
});

describe('calculateAge', () => {
  it('should compute age in years/months from birthdate', () => { ... });
  it('should handle future date as invalid', () => { ... });
});
```

### 4.4 Coverage Target
- **Zod schemas**: 100% (karena kecil & kritis)
- **Business rules**: 90%+
- **Utility functions**: 80%+
- **Custom hooks (pure)**: 80%+

---

## 5. Component Testing

### 5.1 Scope
Test komponen React secara terisolasi:
- **shadcn/ui components** — rendering, props, variants
- **Custom components** — form, table, modal, card
- **Feature components** — POS grid, appointment list, pet detail tabs
- **Form validation** — Zod + React Hook Form integration

### 5.2 Tools
| Tool | Fungsi |
|---|---|
| **Vitest** | Test runner |
| **@testing-library/react** | Render & query |
| **@testing-library/user-event** | Simulasi interaksi user |
| **MSW (Mock Service Worker)** | Mock API & Supabase |
| **jsdom** | DOM environment |

### 5.3 Test Scenarios Wajib

#### 5.3.1 Form Components
```typescript
// features/auth/components/LoginForm.test.tsx
describe('LoginForm', () => {
  it('should render username and PIN inputs', () => { ... });
  it('should show validation error for empty username', () => { ... });
  it('should show validation error for invalid PIN length', () => { ... });
  it('should disable submit button while loading', () => { ... });
  it('should call onSubmit with credentials', () => { ... });
  it('should show lockout message when account locked', () => { ... });
});
```

#### 5.3.2 Data Display Components
```typescript
// features/pets/components/PetDetailTabs.test.tsx
describe('PetDetailTabs', () => {
  it('should render all 5 tabs', () => { ... });
  it('should show overdue indicator for expired vaccine', () => { ... });
  it('should display weight history chart', () => { ... });
  it('should render Digital Pet ID Card with QR code', () => { ... });
});
```

#### 5.3.3 POS Components
```typescript
// features/pos/components/POSCart.test.tsx
describe('POSCart', () => {
  it('should add product to cart', () => { ... });
  it('should update quantity correctly', () => { ... });
  it('should remove item from cart', () => { ... });
  it('should calculate subtotal correctly', () => { ... });
  it('should apply discount and recalculate', () => { ... });
  it('should show low stock warning', () => { ... });
});
```

### 5.4 Mocking Strategy
- **Supabase client**: mock via MSW atau manual mock
- **React Router**: wrap dengan `MemoryRouter`
- **TanStack Query**: wrap dengan `QueryClientProvider` + test client
- **shadcn/ui**: test via props & variants, tidak perlu re-test library

---

## 6. Integration Testing

### 6.1 Scope
Test integrasi antar komponen dengan backend (Supabase):
- **Feature flows** — create appointment → view in list
- **Supabase queries** — RLS policies, data fetching
- **TanStack Query hooks** — caching, refetch, optimistic updates
- **Form submission** → API call → success/error handling
- **Role-based access** — UI render sesuai role

### 6.2 Tools
| Tool | Fungsi |
|---|---|
| **Vitest** | Test runner |
| **Supabase CLI** | Local Supabase instance |
| **@supabase/supabase-js** | Real client ke local instance |
| **MSW** | Mock HTTP untuk edge cases |
| **Docker** | Run Supabase local |

### 6.3 Test Scenarios Wajib per Modul

#### 6.3.1 Auth Flow
```typescript
// features/auth/auth.integration.test.ts
describe('Authentication Flow', () => {
  it('should login successfully with valid credentials', () => { ... });
  it('should lock account after 5 failed attempts', () => { ... });
  it('should reset failed attempts after successful login', () => { ... });
  it('should reject login for inactive account', () => { ... });
  it('should redirect to correct dashboard based on role', () => { ... });
  it('should allow PIN change with valid old PIN', () => { ... });
  it('should reject PIN change with invalid old PIN', () => { ... });
});
```

#### 6.3.2 Customer & Pet Management
```typescript
// features/customers/customers.integration.test.ts
describe('Customer Management', () => {
  it('should allow Owner to create Customer account', () => { ... });
  it('should allow Admin to create Customer account', () => { ... });
  it('should reject Doctor from creating Customer account', () => { ... });
  it('should reject Customer from creating another Customer account', () => { ... });
  it('should convert Guest to Registered without losing history', () => { ... });
  it('should soft-delete Customer with transactions', () => { ... });
});
```

#### 6.3.3 POS & Billing
```typescript
// features/pos/pos.integration.test.ts
describe('POS Checkout Flow', () => {
  it('should complete checkout and deduct stock atomically', () => { ... });
  it('should reject checkout when stock insufficient (concurrent)', () => { ... });
  it('should create invoice with correct status', () => { ... });
  it('should apply promo code correctly', () => { ... });
  it('should redeem loyalty points and update balance', () => { ... });
  it('should handle mixed payment (cash + QRIS)', () => { ... });
  it('should restore stock when invoice cancelled', () => { ... });
  it('should add loyalty points after successful payment', () => { ... });
});
```

#### 6.3.4 Appointments & Medical Records
```typescript
// features/appointments/appointments.integration.test.ts
describe('Appointment Flow', () => {
  it('should create appointment with auto queue number', () => { ... });
  it('should transition status WAITING → IN_PROGRESS → DONE', () => { ... });
  it('should prompt for Medical Record when DONE without one', () => { ... });
  it('should only allow creator Doctor to edit Medical Record', () => { ... });
  it('should mark vaccine overdue automatically', () => { ... });
});
```

#### 6.3.5 Pet Hotel
```typescript
// features/pet-hotel/pet-hotel.integration.test.ts
describe('Pet Hotel Flow', () => {
  it('should reserve room on booking', () => { ... });
  it('should mark room OCCUPIED on check-in', () => { ... });
  it('should return room to AVAILABLE on check-out', () => { ... });
  it('should calculate final cost based on actual stay', () => { ... });
  it('should create PET_HOTEL invoice item on check-out', () => { ... });
  it('should log daily feeding/medicine/note', () => { ... });
});
```

#### 6.3.6 Grooming
```typescript
// features/grooming/grooming.integration.test.ts
describe('Grooming Flow', () => {
  it('should book grooming with package and groomer', () => { ... });
  it('should transition BOOKED → IN_PROGRESS → DONE', () => { ... });
  it('should record before/after photos', () => { ... });
  it('should calculate price based on pet size + package + addons', () => { ... });
});
```

#### 6.3.7 Inventory & Purchase Orders
```typescript
// features/inventory/inventory.integration.test.ts
describe('Inventory Management', () => {
  it('should trigger low stock alert when below minimum', () => { ... });
  it('should create stock movement on PO receive', () => { ... });
  it('should prevent PO modification after RECEIVED', () => { ... });
  it('should suggest reorder based on average sales', () => { ... });
  it('should track product expiry and alert H-30', () => { ... });
});
```

#### 6.3.8 Loyalty & Promotions
```typescript
// features/loyalty/loyalty.integration.test.ts
describe('Loyalty Program', () => {
  it('should earn points based on tier multiplier', () => { ... });
  it('should auto-upgrade tier based on spending', () => { ... });
  it('should apply tier benefits at checkout', () => { ... });
  it('should prevent promo stacking (unless configured)', () => { ... });
  it('should expire voucher after max usage', () => { ... });
});
```

#### 6.3.9 Customer Portal
```typescript
// features/portal/portal.integration.test.ts
describe('Customer Portal', () => {
  it('should display only own data (RLS validation)', () => { ... });
  it('should allow booking appointment', () => { ... });
  it('should allow booking grooming', () => { ... });
  it('should allow booking pet hotel', () => { ... });
  it('should browse products and add to cart', () => { ... });
  it('should complete e-commerce checkout', () => { ... });
  it('should redeem loyalty points', () => { ... });
  it('should submit feedback after visit', () => { ... });
});
```

### 6.4 RLS Policy Testing (Kritikal)
Setiap tabel Supabase wajib memiliki test untuk RLS:
```typescript
// tests/rls/rls-policies.test.ts
describe('Row Level Security', () => {
  describe('customers table', () => {
    it('should allow Owner to read all customers', () => { ... });
    it('should allow Admin to read all customers', () => { ... });
    it('should allow Doctor to read all customers', () => { ... });
    it('should allow Customer to read only own data', () => { ... });
    it('should block Customer from reading other customers', () => { ... });
  });

  describe('medical_records table', () => {
    it('should block Customer from detailed medical records', () => { ... });
    it('should allow Customer to read summary only', () => { ... });
    it('should block Kasir from accessing medical records', () => { ... });
  });

  describe('users table', () => {
    it('should only allow Owner to create staff accounts', () => { ... });
    it('should only allow Owner/Admin to create Customer accounts', () => { ... });
    it('should block Doctor from creating any account', () => { ... });
  });
});
```

---

## 7. End-to-End (E2E) Testing

### 7.1 Scope
Test alur bisnis lengkap dari awal sampai akhir, meniru user nyata:
- Login → navigasi → aksi → hasil
- Multi-role flows (Customer booking → Admin confirm → Doctor examine → Cashier bill)
- Critical business paths yang tidak boleh gagal

### 7.2 Tools
| Tool | Fungsi |
|---|---|
| **Playwright** | Browser automation (Chromium, Firefox, WebKit) |
| **Playwright Test** | Test runner built-in |
| **Supabase local** | Backend untuk E2E |
| **Docker Compose** | Orchestrate full stack |

### 7.3 Critical E2E Scenarios

#### 7.3.1 Authentication
```typescript
// e2e/auth.spec.ts
test('Owner can login and see full dashboard', async ({ page }) => {
  // ...
});

test('Customer can login and see portal', async ({ page }) => {
  // ...
});

test('Account locks after 5 failed attempts', async ({ page }) => {
  // ...
});

test('User can change PIN after login', async ({ page }) => {
  // ...
});
```

#### 7.3.2 Patient Visit End-to-End
```typescript
// e2e/patient-visit.spec.ts
test('Full patient visit: booking → examination → billing → payment', async ({ page }) => {
  // 1. Admin creates appointment
  // 2. Doctor examines & creates medical record
  // 3. Admin creates invoice
  // 4. Cashier processes payment
  // 5. Loyalty points added
  // 6. Feedback request sent
});
```

#### 7.3.3 POS Transaction
```typescript
// e2e/pos.spec.ts
test('POS checkout with promo and loyalty redemption', async ({ page }) => {
  // 1. Cashier adds products
  // 2. Applies promo code
  // 3. Redeems loyalty points
  // 4. Processes mixed payment
  // 5. Prints receipt
  // 6. Stock deducted correctly
});
```

#### 7.3.4 Pet Hotel End-to-End
```typescript
// e2e/pet-hotel.spec.ts
test('Pet hotel: booking → check-in → daily logs → check-out → billing', async ({ page }) => {
  // ...
});
```

#### 7.3.5 Grooming End-to-End
```typescript
// e2e/grooming.spec.ts
test('Grooming: booking → in-progress → done → billing', async ({ page }) => {
  // ...
});
```

#### 7.3.6 Purchase Order
```typescript
// e2e/purchase-order.spec.ts
test('Purchase order: create → send → receive → stock updated', async ({ page }) => {
  // ...
});
```

#### 7.3.7 Customer Portal Self-Service
```typescript
// e2e/portal.spec.ts
test('Customer books appointment via portal', async ({ page }) => {
  // ...
});

test('Customer browses shop and orders online', async ({ page }) => {
  // ...
});

test('Customer views invoices and pays online', async ({ page }) => {
  // ...
});

test('Customer redeems loyalty points', async ({ page }) => {
  // ...
});
```

#### 7.3.8 Role-Based Access
```typescript
// e2e/rbac.spec.ts
test('Doctor cannot access POS or inventory', async ({ page }) => {
  // ...
});

test('Kasir cannot access medical records', async ({ page }) => {
  // ...
});

test('Customer cannot access staff dashboard', async ({ page }) => {
  // ...
});

test('Admin cannot create staff accounts', async ({ page }) => {
  // ...
});
```

### 7.4 E2E Test Organization
```
e2e/
├── auth/
│   ├── login.spec.ts
│   ├── pin-change.spec.ts
│   └── lockout.spec.ts
├── patient-visit/
│   ├── full-visit.spec.ts
│   └── walk-in.spec.ts
├── pos/
│   ├── checkout.spec.ts
│   ├── hold-transaction.spec.ts
│   └── shift-reconciliation.spec.ts
├── pet-hotel/
│   ├── booking-flow.spec.ts
│   └── daily-logs.spec.ts
├── grooming/
│   └── full-flow.spec.ts
├── inventory/
│   ├── stock-movement.spec.ts
│   └── purchase-order.spec.ts
├── loyalty/
│   ├── earn-points.spec.ts
│   └── redeem-points.spec.ts
├── portal/
│   ├── appointment-booking.spec.ts
│   ├── shop-checkout.spec.ts
│   └── invoice-payment.spec.ts
├── rbac/
│   ├── doctor-restrictions.spec.ts
│   ├── kasir-restrictions.spec.ts
│   └── customer-restrictions.spec.ts
└── fixtures/
    ├── test-data.ts
    └── page-objects/
```

### 7.5 Parallelization & Sharding
- E2E tests dijalankan **parallel** di CI
- Sharding berdasarkan folder (auth, pos, portal, dll)
- Target total waktu: < 10 menit untuk full suite

---

## 8. Security Testing

### 8.1 Static Application Security Testing (SAST)
| Tool | Fungsi |
|---|---|
| **ESLint** + `eslint-plugin-security` | Detect common vulnerabilities |
| **npm audit** | Dependency vulnerability scan |
| **Snyk / Socket** | Deep dependency analysis |
| **TypeScript strict mode** | Type safety sebagai security layer |

### 8.2 Authentication Security Tests
```typescript
// tests/security/auth-security.test.ts
describe('Authentication Security', () => {
  it('should never expose PIN in plain text (API response)', () => { ... });
  it('should hash PIN with bcrypt/argon2', () => { ... });
  it('should enforce lockout after 5 failed attempts', () => { ... });
  it('should prevent brute force via rate limiting', () => { ... });
  it('should invalidate session on logout', () => { ... });
  it('should prevent session hijacking (CSRF protection)', () => { ... });
  it('should reject SQL injection attempts', () => { ... });
  it('should reject XSS attempts in input fields', () => { ... });
});
```

### 8.3 RLS Security Tests
Setiap tabel wajib di-test untuk RLS policy (lihat §6.4).

### 8.4 Authorization Tests
```typescript
// tests/security/authorization.test.ts
describe('Authorization', () => {
  it('should block Kasir from accessing medical records API', () => { ... });
  it('should block Doctor from accessing POS API', () => { ... });
  it('should block Customer from accessing staff APIs', () => { ... });
  it('should block non-Owner from creating staff accounts', () => { ... });
  it('should block non-Owner/Admin from creating Customer accounts', () => { ... });
  it('should block Customer from modifying own data beyond allowed fields', () => { ... });
});
```

### 8.5 Dependency Scanning
- **Daily**: `npm audit` di CI
- **Weekly**: Full Snyk/Socket scan
- **Pre-commit**: Check for known vulnerable packages
- **Alert**: Slack/email notification untuk critical CVE

### 8.6 Security Checklist per PR
- [ ] No hardcoded secrets
- [ ] All inputs validated via Zod
- [ ] RLS policies tested
- [ ] No direct SQL queries (use Supabase client)
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] CORS properly configured
- [ ] Rate limiting on auth endpoints

---

## 9. Performance Testing

### 9.1 Frontend Performance
| Tool | Fungsi |
|---|---|
| **Lighthouse CI** | Automated performance audit |
| **Web Vitals** | Core Web Vitals monitoring |
| **Bundle analyzer** | `rollup-plugin-visualizer` |

### 9.2 Performance Budgets
| Metric | Target |
|---|---|
| **First Contentful Paint (FCP)** | < 1.5s |
| **Largest Contentful Paint (LCP)** | < 2.5s |
| **Total Blocking Time (TBT)** | < 200ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 |
| **Time to Interactive (TTI)** | < 3.5s |
| **Bundle size (initial)** | < 300 KB (gzipped) |
| **Bundle size (max per route)** | < 100 KB (gzipped) |

### 9.3 Lighthouse CI Configuration
```yaml
# lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:5173/", "http://localhost:5173/portal"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### 9.4 Backend Performance (Supabase)
| Tool | Fungsi |
|---|---|
| **k6** | Load testing untuk API endpoints |
| **Supabase Dashboard** | Query performance monitoring |
| **pg_stat_statements** | Slow query detection |

### 9.5 Load Testing Scenarios
```javascript
// k6-scripts/pos-checkout.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // ramp up
    { duration: '3m', target: 50 },  // steady
    { duration: '1m', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% failures
  },
};

export default function () {
  // Simulate POS checkout
}
```

### 9.6 Load Test Schedule
- **Weekly**: Full load test di staging
- **Pre-release**: Load test untuk perubahan kritis
- **Quarterly**: Stress test untuk capacity planning

---

## 10. Accessibility & Usability Testing

### 10.1 Accessibility (a11y)
| Tool | Fungsi |
|---|---|
| **axe-core** + `@axe-core/playwright` | Automated a11y testing |
| **Lighthouse** | A11y audit |
| **eslint-plugin-jsx-a11y** | Static analysis |

### 10.2 A11y Test Scenarios
```typescript
// tests/a11y/accessibility.spec.ts
test('Login page meets WCAG 2.1 AA', async ({ page }) => {
  const results = await axe.run(page);
  expect(results.violations).toEqual([]);
});

test('POS dashboard is keyboard navigable', async ({ page }) => {
  // Test tab order, focus management
});

test('Forms have proper labels and error messages', async ({ page }) => {
  // ...
});
```

### 10.3 Usability Testing
- **Heuristic evaluation** per release
- **User testing** bulanan dengan customer nyata
- **POS keyboard shortcuts** validation
- **Mobile responsiveness** testing (Portal)
- **Numeric keypad** for PIN input validation

---

## 11. CI/CD Pipeline

### 11.1 Pipeline Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Pre-commit Hooks (local)                                 │
│     - lint-staged                                            │
│     - type-check                                             │
│     - format                                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Pull Request → GitHub Actions                            │
│     - Install dependencies                                   │
│     - Lint + Type check                                      │
│     - Unit tests                                             │
│     - Component tests                                        │
│     - Build verification                                     │
│     - Bundle size check                                      │
│     - Security audit                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (merge to main)
┌─────────────────────────────────────────────────────────────┐
│  3. Main Branch → Staging                                    │
│     - Integration tests (Supabase local)                     │
│     - E2E tests (Playwright)                                 │
│     - Lighthouse CI                                          │
│     - Deploy to Vercel Preview (staging)                     │
│     - Notify Slack                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (manual approval / auto)
┌─────────────────────────────────────────────────────────────┐
│  4. Production Deployment                                    │
│     - Smoke tests                                            │
│     - Deploy to Vercel Production                            │
│     - Post-deploy monitoring                                 │
│     - Release notes                                          │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 GitHub Actions Workflows

#### 11.2.1 PR Check Workflow
```yaml
# .github/workflows/pr-check.yml
name: PR Check
on:
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

      - name: Unit & component tests
        run: npm run test:coverage

      - name: Build
        run: npm run build

      - name: Bundle size check
        run: npm run size

      - name: Security audit
        run: npm audit --audit-level=high

      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

#### 11.2.2 Staging Deployment Workflow
```yaml
# .github/workflows/staging.yml
name: Staging Deployment
on:
  push:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    services:
      supabase:
        image: supabase/postgres:latest
        # ... configuration
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Setup Supabase local
        run: npx supabase start

      - name: Run migrations
        run: npx supabase db push

      - name: Integration tests
        run: npm run test:integration

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: E2E tests
        run: npm run test:e2e

      - name: Lighthouse CI
        run: npm run lhci

      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--environment staging'

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployment completed'
```

#### 11.2.3 Production Deployment Workflow
```yaml
# .github/workflows/production.yml
name: Production Deployment
on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Smoke tests
        run: npm run test:smoke

      - name: Notify Slack (success)
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Production deployment successful'

      - name: Notify Slack (failure)
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Production deployment failed - ROLLBACK REQUIRED'
```

#### 11.2.4 Scheduled Workflows
```yaml
# .github/workflows/scheduled.yml
name: Scheduled Checks
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
    - cron: '0 3 * * 1'  # Weekly Monday 3 AM

jobs:
  security-audit:
    if: github.event.schedule == '0 2 * * *'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --json > audit.json
      - name: Upload audit report
        uses: actions/upload-artifact@v4

  load-test:
    if: github.event.schedule == '0 3 * * 1'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run k6 load tests
        uses: grafana/k6-action@v0.3.0
        with:
          filename: k6-scripts/*.js

  e2e-full:
    if: github.event.schedule == '0 2 * * *'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Full E2E suite
        run: npm run test:e2e:full
```

### 11.3 Vercel Deployment Strategy
| Environment | Branch | Auto-deploy | Purpose |
|---|---|---|---|
| **Preview** | Every PR branch | ✅ | Review per PR |
| **Staging** | `main` | ✅ | Pre-production validation |
| **Production** | Git tag / release | ✅ (with approval) | Live system |

### 11.4 Branch Strategy
```
main ───────────────────────────────────────► (production)
  │
  ├── develop ──────────────────────────────► (staging)
  │     │
  │     ├── feature/pos-loyalty
  │     ├── feature/grooming-module
  │     └── fix/login-lockout
  │
  └── release/v1.2.0 ───────────────────────► (hotfix)
```

### 11.5 Commit Convention
```
<type>(<scope>): <subject>

feat(pos): add loyalty points redemption
fix(auth): resolve lockout reset issue
test(e2e): add pet hotel flow tests
docs(prd): update testing strategy
chore(deps): update supabase-js to v2.45.0
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`

---

## 12. Quality Gates & Metrics

### 12.1 PR Merge Requirements
| Gate | Requirement | Blocker |
|---|---|---|
| **Build** | ✅ Success | Hard |
| **Lint** | ✅ No errors | Hard |
| **Type check** | ✅ No errors | Hard |
| **Unit tests** | ✅ 100% pass | Hard |
| **Component tests** | ✅ 100% pass | Hard |
| **Coverage** | ≥ 80% business logic | Soft (warn) |
| **Bundle size** | Within budget | Soft (warn) |
| **Security audit** | No high/critical CVE | Hard |
| **Code review** | ≥ 1 approval | Hard |
| **No TODO/FIXME** | Or tracked in issues | Soft |

### 12.2 Staging Deployment Requirements
| Gate | Requirement | Blocker |
|---|---|---|
| **All PR gates** | ✅ Passed | Hard |
| **Integration tests** | ✅ 100% pass | Hard |
| **E2E tests** | ✅ 100% pass | Hard |
| **Lighthouse** | Score ≥ 90 all categories | Hard |
| **A11y audit** | ✅ No critical violations | Hard |
| **Smoke tests** | ✅ Pass | Hard |

### 12.3 Production Deployment Requirements
| Gate | Requirement | Blocker |
|---|---|---|
| **All staging gates** | ✅ Passed | Hard |
| **Manual approval** | Owner/Lead approval | Hard |
| **Release notes** | Documented | Hard |
| **Rollback plan** | Documented | Hard |
| **Smoke tests** | ✅ Pass post-deploy | Hard |

### 12.4 Quality Metrics Dashboard
| Metric | Target | Measurement |
|---|---|---|
| **Test pass rate** | ≥ 99% | CI/CD |
| **Flaky test rate** | < 1% | CI/CD |
| **Code coverage** | ≥ 80% (business logic) | Codecov |
| **PR cycle time** | < 24 hours | GitHub Insights |
| **Deployment frequency** | ≥ 2x/week | Vercel |
| **Change failure rate** | < 5% | Incident tracking |
| **Mean time to recovery** | < 1 hour | Monitoring |
| **Bug escape rate** | < 2% | Issue tracking |

---

## 13. Test Data Management

### 13.1 Principles
- **Isolated**: Setiap test punya data sendiri
- **Deterministic**: Hasil sama setiap run
- **Minimal**: Hanya data yang dibutuhkan
- **Clean**: Data dibersihkan setelah test

### 13.2 Test Data Strategy
| Layer | Strategy |
|---|---|
| **Unit tests** | Inline data, factories |
| **Component tests** | MSW mocks, fixtures |
| **Integration tests** | Supabase local + seed scripts |
| **E2E tests** | Dedicated test database + seed |
| **Performance tests** | Production-like dataset (anonymized) |

### 13.3 Seed Scripts
```typescript
// tests/seed/seed.ts
export async function seedTestData(supabase: SupabaseClient) {
  // Clean up
  await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Create test users (one per role)
  const owner = await createUser(supabase, { role: 'OWNER', username: 'test.owner' });
  const admin = await createUser(supabase, { role: 'ADMIN', username: 'test.admin', createdBy: owner.id });
  const doctor = await createUser(supabase, { role: 'DOKTER', username: 'test.doctor', createdBy: owner.id });
  const kasir = await createUser(supabase, { role: 'KASIR', username: 'test.kasir', createdBy: owner.id });
  const customer = await createUser(supabase, { role: 'CUSTOMER', username: 'test.customer', createdBy: admin.id });

  // Create test customer, pets, products, etc.
  // ...
}
```

### 13.4 Test Factories
```typescript
// tests/factories/customer.factory.ts
export function createCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: crypto.randomUUID(),
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    isGuest: false,
    ...overrides,
  };
}
```

### 13.5 Data Cleanup
- **Unit/Component**: Automatic via test isolation
- **Integration**: Transaction rollback atau cleanup script
- **E2E**: Dedicated test DB, reset before each suite
- **Performance**: Anonymized production snapshot, refreshed monthly

---

## 14. Environment Management

### 14.1 Environment Matrix
| Environment | Purpose | Database | Deploy |
|---|---|---|---|
| **Local** | Developer workstation | Supabase local (Docker) | Vite dev server |
| **Test** | CI/CD runs | Supabase local (ephemeral) | GitHub Actions runner |
| **Preview** | Per-PR review | Supabase project (preview) | Vercel Preview |
| **Staging** | Pre-production | Supabase project (staging) | Vercel Preview (main) |
| **Production** | Live system | Supabase project (prod) | Vercel Production |

### 14.2 Environment Variables
```bash
# .env.local (developer)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local-anon-key
VITE_APP_ENV=local

# .env.staging
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
VITE_APP_ENV=staging

# .env.production
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_APP_ENV=production
```

### 14.3 Secrets Management
| Secret | Storage | Rotation |
|---|---|---|
| Supabase service role key | GitHub Secrets + Vercel Env | Quarterly |
| Vercel tokens | GitHub Secrets | Annually |
| Payment gateway keys | Vercel Env | Per provider policy |
| WhatsApp gateway token | Vercel Env | Annually |
| SMTP credentials | Vercel Env | Annually |

### 14.4 Database Migration Strategy
- **Versioned migrations** via Supabase CLI
- **Migration per PR** — wajib untuk perubahan schema
- **Rollback script** untuk setiap migration
- **Zero-downtime** migrations (backward compatible)
- **Test migrations** di CI sebelum merge

```bash
# Generate migration
npx supabase migration new add_loyalty_tables

# Apply locally
npx supabase db push

# Test in CI
npx supabase db push --linked
```

---

## 15. Monitoring & Observability

### 15.1 Frontend Monitoring
| Tool | Fungsi |
|---|---|
| **Vercel Analytics** | Web Vitals, request timing |
| **Sentry** | Error tracking, performance |
| **LogRocket** (opsional) | Session replay |

### 15.2 Backend Monitoring
| Tool | Fungsi |
|---|---|
| **Supabase Dashboard** | Query performance, auth events |
| **Supabase Logs** | API logs, edge function logs |
| **pg_stat_statements** | Slow query analysis |

### 15.3 Alerting
| Alert | Channel | Severity |
|---|---|---|
| Error rate > 1% | Slack + Email | Critical |
| LCP > 4s | Slack | Warning |
| Failed login spike | Slack | Warning |
| Database connection errors | Slack + PagerDuty | Critical |
| Deployment failure | Slack | Critical |
| Security incident | Slack + Email + SMS | Critical |

### 15.4 Logging Standards
```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: import.meta.env.VITE_LOG_LEVEL || 'info',
  redact: ['pin', 'pinHash', 'password', '*.pin'],
});

// Usage
logger.info({ userId, action: 'login' }, 'User logged in');
logger.error({ err, userId }, 'Login failed');
```

**Rules**:
- ❌ Never log PIN, pinHash, passwords
- ✅ Log user ID, action, timestamp
- ✅ Include correlation ID for request tracing
- ✅ Structured logging (JSON)

### 15.5 Health Checks
```typescript
// /api/health
export async function GET() {
  const supabaseHealth = await checkSupabase();
  const dbHealth = await checkDatabase();

  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: supabaseHealth,
      database: dbHealth,
    },
  });
}
```

---

## 16. Definition of Done

### 16.1 Feature DoD
Sebuah fitur dianggap **selesai** jika:
- [ ] Kode di-write dengan TypeScript strict mode
- [ ] Zod schema untuk semua input/output
- [ ] Unit tests untuk business logic (≥ 80% coverage)
- [ ] Component tests untuk UI baru
- [ ] Integration tests untuk alur lengkap
- [ ] E2E test untuk skenario kritis
- [ ] RLS policies di-test
- [ ] Lint + type check pass
- [ ] Code review approved (≥ 1 reviewer)
- [ ] Documentation updated (PRD + API docs)
- [ ] No TODO/FIXME without tracked issue
- [ ] Performance budget respected
- [ ] Accessibility validated
- [ ] Deployed to staging & smoke tested

### 16.2 Release DoD
Sebuah release dianggap **siap production** jika:
- [ ] All features DoD met
- [ ] Full E2E suite pass di staging
- [ ] Lighthouse scores ≥ 90 all categories
- [ ] Security audit clean
- [ ] Load test pass
- [ ] Release notes documented
- [ ] Rollback plan documented
- [ ] Stakeholder approval
- [ ] Monitoring alerts configured
- [ ] Post-deploy smoke tests pass

### 16.3 Hotfix DoD
Hotfix untuk production issue:
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Regression test added
- [ ] Tested di staging
- [ ] Approved oleh Owner + Lead
- [ ] Deployed via hotfix branch
- [ ] Post-deploy verification
- [ ] Incident report documented

---

## 17. Tools & Dependencies

### 17.1 Testing Tools
| Tool | Version | Purpose |
|---|---|---|
| **Vitest** | ^1.6 | Test runner |
| **@testing-library/react** | ^15 | Component testing |
| **@testing-library/user-event** | ^14 | User interaction |
| **MSW** | ^2.3 | API mocking |
| **Playwright** | ^1.44 | E2E testing |
| **Faker** | ^8.4 | Test data generation |
| **k6** | Latest | Load testing |
| **Lighthouse CI** | ^0.13 | Performance audit |
| **axe-core** | ^4.9 | Accessibility |

### 17.2 Quality Tools
| Tool | Version | Purpose |
|---|---|---|
| **ESLint** | ^9 | Linting |
| **Prettier** | ^3.2 | Formatting |
| **TypeScript** | ^5.4 | Type checking |
| **Husky** | ^9 | Git hooks |
| **lint-staged** | ^15 | Pre-commit checks |
| **commitlint** | ^19 | Commit message |
| **Codecov** | Latest | Coverage reporting |
| **Snyk** | Latest | Dependency security |

### 17.3 CI/CD Tools
| Tool | Purpose |
|---|---|
| **GitHub Actions** | CI/CD orchestration |
| **Vercel** | Deployment |
| **Supabase CLI** | Database migrations |
| **Docker** | Local Supabase |
| **Slack** | Notifications |

### 17.4 Monitoring Tools
| Tool | Purpose |
|---|---|
| **Sentry** | Error tracking |
| **Vercel Analytics** | Performance |
| **Supabase Dashboard** | Backend monitoring |

### 17.5 NPM Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:smoke": "playwright test --grep @smoke",
    "test:all": "npm run test:coverage && npm run test:integration && npm run test:e2e",
    "lhci": "lhci autorun",
    "size": "size-limit",
    "audit": "npm audit --audit-level=high",
    "prepare": "husky install",
    "db:migrate": "supabase db push",
    "db:seed": "supabase db seed",
    "db:reset": "supabase db reset"
  }
}
```

---

## 18. Item Terbuka

| No | Item | Status |
|---|---|---|
| 1 | Pilihan antara Playwright vs Cypress — rekomendasi Playwright, perlu konfirmasi | TBD |
| 2 | Self-hosted vs managed Sentry — rekomendasi managed, perlu budget approval | TBD |
| 3 | Load testing tool — k6 vs Locust, rekomendasi k6 | TBD |
| 4 | Coverage threshold final (80% business logic) — perlu stakeholder approval | TBD |
| 5 | E2E test parallelization strategy — sharding by folder vs by file | TBD |
| 6 | Visual regression testing — apakah perlu (Playwright screenshots) | TBD |
| 7 | Test data anonymization strategy untuk load testing | TBD |
| 8 | Monitoring stack final — Vercel Analytics + Sentry + Supabase Dashboard | TBD |
| 9 | Backup & restore testing frequency — monthly/quarterly | TBD |
| 10 | Chaos engineering — apakah perlu di roadmap | TBD |
| 11 | Mobile E2E testing — Playwright mobile emulation vs real devices | TBD |
| 12 | Test environment cost budget — Supabase projects, Vercel preview deployments | TBD |

---

## 19. Glosarium

| Istilah | Definisi |
|---|---|
| **CI (Continuous Integration)** | Praktik mengintegrasikan kode secara otomatis & test setiap perubahan |
| **CD (Continuous Deployment)** | Praktik deploy otomatis ke production setelah test pass |
| **Unit Test** | Test untuk unit kode terkecil (fungsi, class) secara terisolasi |
| **Component Test** | Test untuk komponen React secara terisolasi |
| **Integration Test** | Test untuk interaksi antar komponen & backend |
| **E2E Test** | Test alur bisnis lengkap dari awal sampai akhir |
| **RLS (Row Level Security)** | Fitur Supabase untuk otorisasi level database |
| **MSW (Mock Service Worker)** | Library untuk mock API di test |
| **Playwright** | Framework untuk E2E testing multi-browser |
| **Vitest** | Test runner Vite-native untuk unit & component test |
| **Lighthouse** | Tool Google untuk audit performa, a11y, SEO |
| **Web Vitals** | Metrik performa user experience (FCP, LCP, CLS, TBT) |
| **SAST** | Static Application Security Testing |
| **Smoke Test** | Test cepat untuk verifikasi deploy berhasil |
| **Flaky Test** | Test yang kadang pass kadang fail tanpa perubahan kode |
| **Quality Gate** | Kriteria yang harus dipenuhi sebelum lanjut ke tahap berikutnya |
| **Seed Data** | Data awal untuk test environment |
| **Factory** | Pattern untuk generate test data konsisten |
| **Definition of Done (DoD)** | Kriteria lengkap sebuah fitur/release dianggap selesai |
| **Bundle Size** | Ukuran file JavaScript yang di-download user |
| **Code Coverage** | Persentase kode yang di-execute oleh test |
| **Regression Test** | Test untuk memastikan perubahan tidak merusak fitur lama |

---

## Ringkasan Eksekutif

### Cakupan Dokumen
- ✅ **Testing Strategy** — pyramid, tools, scenarios per modul
- ✅ **CI/CD Pipeline** — GitHub Actions + Vercel + Supabase
- ✅ **Quality Gates** — PR merge, staging, production requirements
- ✅ **Test Data Management** — factories, seeds, cleanup
- ✅ **Environment Management** — local, test, preview, staging, production
- ✅ **Monitoring & Observability** — error tracking, performance, alerting
- ✅ **Definition of Done** — feature, release, hotfix
- ✅ **Tools & Dependencies** — complete list with versions

### Prinsip Utama
1. **Test what matters** — fokus pada alur bisnis kritis
2. **Fast feedback** — developer tahu hasil dalam < 10 menit
3. **Shift-left** — test sedini mungkin
4. **Automate everything** — manual testing hanya untuk eksplorasi
5. **Production-like** — staging harus mirip production

### Target Kualitas
| Metrik | Target |
|---|---|
| Test pass rate | ≥ 99% |
| Code coverage (business logic) | ≥ 80% |
| PR cycle time | < 24 hours |
| Deployment frequency | ≥ 2x/week |
| Change failure rate | < 5% |
| Mean time to recovery | < 1 hour |
| Bug escape rate | < 2% |

---

**Dokumen ini merupakan baseline final untuk testing strategy dan CI/CD pipeline HaLand PetCare. Seluruh aturan, tools, dan workflow harus diimplementasikan sejak hari pertama pengembangan untuk menjamin kualitas dan konsistensi delivery.** 🚀
