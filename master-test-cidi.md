# Technical Specification — Testing & CI/CD Baseline Contract
## Petora — Sistem Manajemen Terpadu Petshop & Petcare
### Dokumen Baseline Final | 18 Agustus 2026

---

## Daftar Isi
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Testing Strategy & Pyramid](#2-testing-strategy--pyramid)
3. [Tooling Matrix](#3-tooling-matrix)
4. [Unit Testing Contract](#4-unit-testing-contract)
5. [Component Testing Contract](#5-component-testing-contract)
6. [Integration Testing Contract](#6-integration-testing-contract)
7. [RLS Policy Testing Contract](#7-rls-policy-testing-contract)
8. [E2E Testing Contract](#8-e2e-testing-contract)
9. [Security Testing Contract](#9-security-testing-contract)
10. [Performance Testing Contract](#10-performance-testing-contract)
11. [Accessibility Testing Contract](#11-accessibility-testing-contract)
12. [CI/CD Pipeline Contract](#12-cicd-pipeline-contract)
13. [Quality Gates & Metrics](#13-quality-gates--metrics)
14. [Test Data Management Contract](#14-test-data-management-contract)
15. [Environment Management Contract](#15-environment-management-contract)
16. [Monitoring & Observability Contract](#16-monitoring--observability-contract)
17. [Definition of Done](#17-definition-of-done)
18. [NPM Scripts Contract](#18-npm-scripts-contract)
19. [Configuration Files Baseline](#19-configuration-files-baseline)
20. [Glosarium](#20-glosarium)

---

## 1. Ringkasan Eksekutif

Dokumen ini mendefinisikan **kontrak teknis baseline untuk testing & CI/CD** Petora — acuan tunggal bagi developer dan QA untuk memastikan kualitas kode, mencegah regresi, dan mengotomasi deployment.

### Prinsip Testing
| Prinsip | Penjelasan |
|---|---|
| **Test what matters** | Fokus pada alur bisnis kritis, bukan coverage semu |
| **Fast feedback** | Test suite utama < 10 menit |
| **Deterministic** | Test konsisten, tidak flaky |
| **Isolated** | Setiap test independen |
| **Readable** | Test adalah dokumentasi |
| **Shift-left** | Test sedini mungkin |
| **Production-like** | Staging mirip production |

### Target Kualitas
| Metrik | Target |
|---|---|
| Test pass rate | ≥ 99% |
| Code coverage (business logic) | ≥ 80% |
| PR cycle time | < 24 jam |
| Deployment frequency | ≥ 2x/minggu |
| Change failure rate | < 5% |
| Mean time to recovery | < 1 jam |
| Bug escape rate | < 2% |

---

## 2. Testing Strategy & Pyramid

### 2.1 Testing Pyramid

```
         ╱╲
        ╱E2E╲          ← 10%  | Playwright | 20+ skenario kritis
       ╱──────╲
      ╱Integration╲     ← 20%  | Vitest + Supabase local | Fitur + RLS
     ╱──────────────╲
    ╱ Component Tests ╲  ← 30%  | Vitest + Testing Library + MSW
   ╱────────────────────╲
  ╱     Unit Tests        ╲ ← 40% | Vitest | Schemas, utils, hooks
 ╱──────────────────────────╲
```

### 2.2 Distribusi Test per Layer

| Layer | Tools | Target Coverage | Waktu Eksekusi | Lokasi File |
|---|---|---|---|---|
| Unit Tests | Vitest | 80%+ | < 30 detik | `src/**/*.test.ts` |
| Component Tests | Vitest + Testing Library + MSW | 70%+ | < 2 menit | `src/**/*.test.tsx` |
| Integration Tests | Vitest + Supabase local | 60%+ | < 3 menit | `tests/integration/**/*.test.ts` |
| RLS Tests | Vitest + Supabase local | 100% per tabel | < 2 menit | `tests/rls/**/*.test.ts` |
| E2E Tests | Playwright | 20+ skenario | < 10 menit | `e2e/**/*.spec.ts` |
| Security Tests | ESLint + custom + manual | N/A | < 5 menit | `tests/security/**/*.test.ts` |
| Performance Tests | Lighthouse CI + k6 | N/A | < 5 menit | `lighthouserc.json`, `k6-scripts/` |
| A11y Tests | axe-core + Playwright | WCAG 2.1 AA | < 2 menit | `tests/a11y/**/*.spec.ts` |

### 2.3 Test Naming Convention

```typescript
// Format: [modul] - [fitur] - [skenario] - [hasil yang diharapkan]
describe('POS Checkout', () => {
  it('should deduct stock when checkout succeeds', () => { ... });
  it('should reject checkout when stock insufficient', () => { ... });
  it('should apply loyalty points redemption correctly', () => { ... });
});
```

### 2.4 Test Organization

```
tests/
├── integration/              # Integration tests per modul
│   ├── auth/
│   ├── customers/
│   ├── pets/
│   ├── appointments/
│   ├── medical-records/
│   ├── pet-hotel/
│   ├── grooming/
│   ├── products/
│   ├── inventory/
│   ├── purchase-orders/
│   ├── pos/
│   ├── invoices/
│   ├── loyalty/
│   ├── promotions/
│   ├── expenses/
│   ├── reports/
│   └── portal/
├── rls/                      # RLS policy tests
│   ├── users.test.ts
│   ├── customers.test.ts
│   ├── pets.test.ts
│   ├── appointments.test.ts
│   ├── medical-records.test.ts
│   ├── invoices.test.ts
│   └── ...
├── security/                 # Security tests
│   ├── auth-security.test.ts
│   └── authorization.test.ts
├── a11y/                     # Accessibility tests
│   ├── login.spec.ts
│   ├── pos-dashboard.spec.ts
│   └── portal.spec.ts
├── seed/                     # Test data seeding
│   └── seed.ts
├── factories/                # Test data factories
│   ├── user.factory.ts
│   ├── customer.factory.ts
│   ├── pet.factory.ts
│   └── ...
└── fixtures/                 # Shared test fixtures
    ├── test-data.ts
    └── mocks.ts

e2e/                          # E2E tests (Playwright)
├── auth/
├── patient-visit/
├── pos/
├── pet-hotel/
├── grooming/
├── inventory/
├── loyalty/
├── portal/
├── rbac/
└── fixtures/
    ├── test-data.ts
    └── page-objects/
```

---

## 3. Tooling Matrix

### 3.1 Testing Tools

| Tool | Versi | Purpose | Install |
|---|---|---|---|
| **Vitest** | ^1.6.0 | Test runner (unit, component, integration) | `npm i -D vitest` |
| **@testing-library/react** | ^15.0.0 | Component testing | `npm i -D @testing-library/react` |
| **@testing-library/user-event** | ^14.5.0 | User interaction simulation | `npm i -D @testing-library/user-event` |
| **@testing-library/jest-dom** | ^6.4.0 | Custom matchers | `npm i -D @testing-library/jest-dom` |
| **MSW** | ^2.3.0 | API mocking | `npm i -D msw` |
| **Playwright** | ^1.44.0 | E2E testing | `npm i -D @playwright/test` |
| **Faker** | ^8.4.0 | Test data generation | `npm i -D @faker-js/faker` |
| **k6** | Latest | Load testing | Install via binary |
| **Lighthouse CI** | ^0.13.0 | Performance audit | `npm i -D @lhci/cli` |
| **axe-core** | ^4.9.0 | Accessibility testing | `npm i -D @axe-core/playwright` |
| **Vitest Coverage** | ^1.6.0 | Code coverage | Included with Vitest |

### 3.2 Quality Tools

| Tool | Versi | Purpose |
|---|---|---|
| **ESLint** | ^9.0.0 | Linting |
| **Prettier** | ^3.2.0 | Formatting |
| **TypeScript** | ^5.4.0 | Type checking |
| **Husky** | ^9.0.0 | Git hooks |
| **lint-staged** | ^15.0.0 | Pre-commit checks |
| **commitlint** | ^19.0.0 | Commit message validation |
| **Codecov** | Latest | Coverage reporting |
| **Snyk** | Latest | Dependency security |

### 3.3 CI/CD Tools

| Tool | Purpose |
|---|---|
| **GitHub Actions** | CI/CD orchestration |
| **Vercel** | Deployment |
| **Supabase CLI** | Database migrations |
| **Docker** | Local Supabase |
| **Slack** | Notifications |

---

## 4. Unit Testing Contract

### 4.1 Scope

Unit test mencakup **business logic murni** tanpa dependency UI atau database:
- **Zod schemas** — validasi input/output
- **Utility functions** — format currency, date, kalkulasi diskon
- **Custom hooks** (pure logic) — `useDebounce`, `useLocalStorage`
- **State management** — Zustand stores (pure reducers)
- **Business rules** — kalkulasi loyalty points, tier upgrade, invoice total
- **Enum validators** — status transitions

### 4.2 Konfigurasi Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        'src/types/**',
        'src/**/*.d.ts',
      ],
      thresholds: {
        'src/lib/business-rules/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/schemas/**': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
        'src/lib/utils/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### 4.3 Test Cases Wajib per Modul

#### 4.3.1 Zod Schema Validation

```typescript
// src/schemas/__tests__/invoice.test.ts
import { describe, it, expect } from 'vitest';
import { createInvoiceSchema, recordPaymentSchema } from '../invoice';

describe('InvoiceSchema', () => {
  describe('createInvoiceSchema', () => {
    it('should accept valid invoice data', () => {
      const validData = {
        invoice_type: 'POS',
        customer_id: '550e8400-e29b-41d4-a716-446655440000',
        items: [
          {
            item_type: 'PRODUCT',
            product_id: '550e8400-e29b-41d4-a716-446655440001',
            description: 'Royal Canin 5kg',
            quantity: 2,
            unit_price: 450000,
          },
        ],
        discount_amount: 0,
        tax_amount: 0,
      };
      
      const result = createInvoiceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty items array', () => {
      const invalidData = {
        invoice_type: 'POS',
        items: [],
      };
      
      const result = createInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('at least 1 item');
    });

    it('should reject negative discount', () => {
      const invalidData = {
        invoice_type: 'POS',
        items: [{ item_type: 'PRODUCT', description: 'Test', quantity: 1, unit_price: 100000 }],
        discount_amount: -10000,
      };
      
      const result = createInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate invoice_type enum', () => {
      const invalidData = {
        invoice_type: 'INVALID_TYPE',
        items: [{ item_type: 'PRODUCT', description: 'Test', quantity: 1, unit_price: 100000 }],
      };
      
      const result = createInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('recordPaymentSchema', () => {
    it('should accept valid payment data', () => {
      const validData = {
        invoice_id: '550e8400-e29b-41d4-a716-446655440000',
        payment_method: 'CASH',
        amount: 500000,
      };
      
      const result = recordPaymentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject zero amount', () => {
      const invalidData = {
        invoice_id: '550e8400-e29b-41d4-a716-446655440000',
        payment_method: 'CASH',
        amount: 0,
      };
      
      const result = recordPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate payment_method enum', () => {
      const invalidData = {
        invoice_id: '550e8400-e29b-41d4-a716-446655440000',
        payment_method: 'BITCOIN',
        amount: 500000,
      };
      
      const result = recordPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
```

#### 4.3.2 Business Rules

```typescript
// src/lib/business-rules/__tests__/loyalty.test.ts
import { describe, it, expect } from 'vitest';
import { calculateLoyaltyPoints, canRedeemPoints } from '../loyalty';

describe('Loyalty Points Calculation', () => {
  describe('calculateLoyaltyPoints', () => {
    it('should calculate 1 point per Rp 10.000', () => {
      const points = calculateLoyaltyPoints(100000, 1.0);
      expect(points).toBe(10);
    });

    it('should apply tier multiplier correctly', () => {
      const points = calculateLoyaltyPoints(100000, 1.5); // Gold tier
      expect(points).toBe(15);
    });

    it('should floor the result', () => {
      const points = calculateLoyaltyPoints(15000, 1.0);
      expect(points).toBe(1); // 1.5 floored to 1
    });

    it('should return 0 for amount below minimum', () => {
      const points = calculateLoyaltyPoints(5000, 1.0);
      expect(points).toBe(0);
    });
  });

  describe('canRedeemPoints', () => {
    it('should allow redemption if points sufficient', () => {
      const canRedeem = canRedeemPoints(1000, 500);
      expect(canRedeem).toBe(true);
    });

    it('should reject redemption if points insufficient', () => {
      const canRedeem = canRedeemPoints(100, 500);
      expect(canRedeem).toBe(false);
    });

    it('should reject zero points redemption', () => {
      const canRedeem = canRedeemPoints(1000, 0);
      expect(canRedeem).toBe(false);
    });
  });
});
```

```typescript
// src/lib/business-rules/__tests__/inventory.test.ts
import { describe, it, expect } from 'vitest';
import { validateStockAvailability, calculateReorderSuggestion } from '../inventory';

describe('Stock Validation', () => {
  describe('validateStockAvailability', () => {
    it('should return true when stock sufficient', () => {
      const isValid = validateStockAvailability(10, 5);
      expect(isValid).toBe(true);
    });

    it('should return false when stock insufficient', () => {
      const isValid = validateStockAvailability(3, 5);
      expect(isValid).toBe(false);
    });

    it('should return false when stock equals zero', () => {
      const isValid = validateStockAvailability(0, 1);
      expect(isValid).toBe(false);
    });
  });

  describe('calculateReorderSuggestion', () => {
    it('should suggest reorder based on average sales', () => {
      const suggestion = calculateReorderSuggestion({
        currentStock: 5,
        minimumStock: 10,
        averageDailySales: 2,
        leadTimeDays: 7,
      });
      expect(suggestion).toBe(19); // 10 - 5 + (2 * 7) = 19
    });

    it('should return 0 when stock above minimum', () => {
      const suggestion = calculateReorderSuggestion({
        currentStock: 20,
        minimumStock: 10,
        averageDailySales: 2,
        leadTimeDays: 7,
      });
      expect(suggestion).toBe(0);
    });
  });
});
```

```typescript
// src/lib/business-rules/__tests__/billing.test.ts
import { describe, it, expect } from 'vitest';
import { calculateInvoiceTotal, calculateChange } from '../billing';

describe('Invoice Total Calculation', () => {
  describe('calculateInvoiceTotal', () => {
    it('should compute (subtotal - discount) + tax', () => {
      const total = calculateInvoiceTotal({
        subtotal: 500000,
        discount: 50000,
        tax: 10000,
      });
      expect(total).toBe(460000);
    });

    it('should handle zero discount and tax', () => {
      const total = calculateInvoiceTotal({
        subtotal: 500000,
        discount: 0,
        tax: 0,
      });
      expect(total).toBe(500000);
    });

    it('should choose smaller discount when both % and fixed given', () => {
      const total = calculateInvoiceTotal({
        subtotal: 100000,
        discountPercent: 10, // 10.000
        discountFixed: 15000, // 15.000
        tax: 0,
      });
      expect(total).toBe(90000); // Uses 10% (smaller discount)
    });
  });

  describe('calculateChange', () => {
    it('should compute cash change correctly', () => {
      const change = calculateChange(500000, 468000);
      expect(change).toBe(32000);
    });

    it('should return 0 when exact amount', () => {
      const change = calculateChange(500000, 500000);
      expect(change).toBe(0);
    });

    it('should throw error when payment less than total', () => {
      expect(() => calculateChange(400000, 500000)).toThrow();
    });
  });
});
```

#### 4.3.3 Utility Functions

```typescript
// src/lib/utils/__tests__/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatDate } from '../format';

describe('formatCurrency', () => {
  it('should format to Rupiah with thousand separator', () => {
    expect(formatCurrency(1250000)).toBe('Rp 1.250.000');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('Rp 0');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-50000)).toBe('-Rp 50.000');
  });
});

describe('formatNumber', () => {
  it('should format with thousand separator', () => {
    expect(formatNumber(1234)).toBe('1.234');
  });
});

describe('formatDate', () => {
  it('should format date to Indonesian locale', () => {
    expect(formatDate('2026-08-18')).toBe('18 Agu 2026');
  });
});
```

### 4.4 Coverage Target

| Module | Branches | Functions | Lines | Statements |
|---|---|---|---|---|
| Zod schemas | 100% | 100% | 100% | 100% |
| Business rules | 90% | 90% | 90% | 90% |
| Utility functions | 80% | 80% | 80% | 80% |
| Custom hooks (pure) | 80% | 80% | 80% | 80% |

---

## 5. Component Testing Contract

### 5.1 Scope

Test komponen React secara terisolasi:
- **shadcn/ui components** — rendering, props, variants
- **Custom components** — form, table, modal, card
- **Feature components** — POS grid, appointment list, pet detail tabs
- **Form validation** — Zod + React Hook Form integration

### 5.2 Mocking Strategy

```typescript
// tests/mocks/supabase.ts
export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
};

vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase,
}));
```

### 5.3 Test Cases Wajib per Modul

#### 5.3.1 Form Components

```typescript
// src/features/auth/components/__tests__/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('should render username and PIN inputs', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pin/i)).toBeInTheDocument();
  });

  it('should show validation error for empty username', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username wajib diisi/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid PIN length', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/pin/i), '123');
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/pin harus 6 digit/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} isLoading />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeDisabled();
  });

  it('should call onSubmit with credentials', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/pin/i), '123456');
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        pin: '123456',
      });
    });
  });

  it('should show lockout message when account locked', () => {
    render(<LoginForm onSubmit={vi.fn()} lockoutUntil={new Date(Date.now() + 900000)} />);
    
    expect(screen.getByText(/akun terkunci/i)).toBeInTheDocument();
    expect(screen.getByText(/15 menit/i)).toBeInTheDocument();
  });
});
```

#### 5.3.2 Data Display Components

```typescript
// src/features/pets/components/__tests__/PetDetailTabs.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PetDetailTabs } from '../PetDetailTabs';
import { mockPet } from '@/tests/fixtures/pet';

describe('PetDetailTabs', () => {
  it('should render all 5 tabs', () => {
    render(<PetDetailTabs pet={mockPet} />);
    
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /weight/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /vaccines/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medical/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /id card/i })).toBeInTheDocument();
  });

  it('should show overdue indicator for expired vaccine', () => {
    const petWithOverdueVaccine = {
      ...mockPet,
      vaccines: [
        {
          id: '1',
          vaccine_name: 'DHPP',
          vaccination_date: '2025-02-15',
          due_date: '2026-02-15', // Overdue
          is_active: true,
        },
      ],
    };
    
    render(<PetDetailTabs pet={petWithOverdueVaccine} />);
    
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('should display weight history chart', () => {
    render(<PetDetailTabs pet={mockPet} />);
    
    // Click weight tab
    screen.getByRole('tab', { name: /weight/i }).click();
    
    expect(screen.getByTestId('weight-chart')).toBeInTheDocument();
  });

  it('should render Digital Pet ID Card with QR code', () => {
    render(<PetDetailTabs pet={mockPet} />);
    
    screen.getByRole('tab', { name: /id card/i }).click();
    
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    expect(screen.getByText(mockPet.name)).toBeInTheDocument();
  });
});
```

#### 5.3.3 POS Components

```typescript
// src/features/pos/components/__tests__/POSCart.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { POSCart } from '../POSCart';
import { mockProducts } from '@/tests/fixtures/products';

describe('POSCart', () => {
  it('should add product to cart', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<POSCart items={[]} onAddItem={vi.fn()} />);
    
    const addButton = screen.getByRole('button', { name: /add royal canin/i });
    await user.click(addButton);
    
    // Rerender with updated cart
    rerender(<POSCart items={[mockProducts[0]]} onAddItem={vi.fn()} />);
    
    expect(screen.getByText('Royal Canin Adult 5kg')).toBeInTheDocument();
  });

  it('should update quantity correctly', async () => {
    const user = userEvent.setup();
    const handleUpdateQty = vi.fn();
    render(
      <POSCart
        items={[{ ...mockProducts[0], quantity: 1 }]}
        onUpdateQuantity={handleUpdateQty}
      />
    );
    
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    await user.click(incrementButton);
    
    expect(handleUpdateQty).toHaveBeenCalledWith(mockProducts[0].id, 2);
  });

  it('should remove item from cart', async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();
    render(
      <POSCart
        items={[mockProducts[0]]}
        onRemoveItem={handleRemove}
      />
    );
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);
    
    expect(handleRemove).toHaveBeenCalledWith(mockProducts[0].id);
  });

  it('should calculate subtotal correctly', () => {
    const items = [
      { ...mockProducts[0], quantity: 2, unit_price: 450000 },
      { ...mockProducts[1], quantity: 1, unit_price: 35000 },
    ];
    
    render(<POSCart items={items} />);
    
    expect(screen.getByText('Rp 935.000')).toBeInTheDocument();
  });

  it('should apply discount and recalculate', async () => {
    const user = userEvent.setup();
    const items = [{ ...mockProducts[0], quantity: 1, unit_price: 500000 }];
    
    render(<POSCart items={items} />);
    
    const discountInput = screen.getByLabelText(/discount/i);
    await user.type(discountInput, '10'); // 10%
    
    expect(screen.getByText('Rp 450.000')).toBeInTheDocument();
  });

  it('should show low stock warning', () => {
    const lowStockProduct = { ...mockProducts[0], stock_quantity: 3, stock_minimum: 10 };
    render(<POSCart items={[lowStockProduct]} />);
    
    expect(screen.getByText(/low stock/i)).toBeInTheDocument();
  });
});
```

### 5.4 Coverage Target

| Component Type | Branches | Functions | Lines | Statements |
|---|---|---|---|---|
| Form components | 70% | 70% | 70% | 70% |
| Data display | 60% | 60% | 60% | 60% |
| Feature components | 70% | 70% | 70% | 70% |

---

## 6. Integration Testing Contract

### 6.1 Scope

Test integrasi antar komponen dengan backend (Supabase):
- **Feature flows** — create appointment → view in list
- **Supabase queries** — RLS policies, data fetching
- **TanStack Query hooks** — caching, refetch, optimistic updates
- **Form submission** → API call → success/error handling
- **Role-based access** — UI render sesuai role

### 6.2 Supabase Local Setup

```typescript
// tests/integration/setup.ts
import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll } from 'vitest';

const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Local key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

beforeAll(async () => {
  // Ensure Supabase local is running
  // Run migrations
  // Seed test data
});

afterAll(async () => {
  // Cleanup test data
});
```

### 6.3 Test Cases Wajib per Modul

#### 6.3.1 Auth Flow

```typescript
// tests/integration/auth/auth.integration.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '../setup';
import { createUserFactory } from '../../factories/user.factory';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    // Seed test users
    await supabase.from('users').insert([
      createUserFactory({ username: 'test.owner', role: 'OWNER' }),
      createUserFactory({ username: 'test.admin', role: 'ADMIN' }),
      createUserFactory({ username: 'test.customer', role: 'CUSTOMER' }),
    ]);
  });

  it('should login successfully with valid credentials', async () => {
    const { data, error } = await supabase.functions.invoke('auth-login', {
      body: { username: 'test.owner', pin: '123456' },
    });
    
    expect(error).toBeNull();
    expect(data.user.username).toBe('test.owner');
    expect(data.session_token).toBeDefined();
  });

  it('should lock account after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await supabase.functions.invoke('auth-login', {
        body: { username: 'test.admin', pin: 'wrong' },
      });
    }
    
    const { data, error } = await supabase.functions.invoke('auth-login', {
      body: { username: 'test.admin', pin: '123456' },
    });
    
    expect(error.code).toBe('ACCOUNT_LOCKED');
    expect(data.locked_until).toBeDefined();
  });

  it('should reset failed attempts after successful login', async () => {
    // Fail 3 times
    for (let i = 0; i < 3; i++) {
      await supabase.functions.invoke('auth-login', {
        body: { username: 'test.customer', pin: 'wrong' },
      });
    }
    
    // Successful login
    await supabase.functions.invoke('auth-login', {
      body: { username: 'test.customer', pin: '123456' },
    });
    
    // Check failed attempts reset
    const { data: user } = await supabase
      .from('users')
      .select('failed_login_attempts')
      .eq('username', 'test.customer')
      .single();
    
    expect(user.failed_login_attempts).toBe(0);
  });

  it('should reject login for inactive account', async () => {
    await supabase
      .from('users')
      .update({ is_active: false })
      .eq('username', 'test.admin');
    
    const { error } = await supabase.functions.invoke('auth-login', {
      body: { username: 'test.admin', pin: '123456' },
    });
    
    expect(error.code).toBe('ACCOUNT_INACTIVE');
  });

  it('should redirect to correct dashboard based on role', async () => {
    const { data: ownerData } = await supabase.functions.invoke('auth-login', {
      body: { username: 'test.owner', pin: '123456' },
    });
    
    expect(ownerData.user.role).toBe('OWNER');
    // Frontend should redirect to /app/dashboard
  });
});
```

#### 6.3.2 POS Checkout Flow

```typescript
// tests/integration/pos/pos.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../setup';
import { createProductFactory } from '../../factories/product.factory';
import { createCustomerFactory } from '../../factories/customer.factory';

describe('POS Checkout Flow', () => {
  let testProduct: any;
  let testCustomer: any;

  beforeEach(async () => {
    // Seed test data
    testProduct = await supabase
      .from('products')
      .insert(createProductFactory({ sku: 'TEST-001', stock_quantity: 10 }))
      .select()
      .single();
    
    testCustomer = await supabase
      .from('customers')
      .insert(createCustomerFactory())
      .select()
      .single();
  });

  it('should complete checkout and deduct stock atomically', async () => {
    const { data: invoice, error } = await supabase.functions.invoke('create-invoice', {
      body: {
        invoice_type: 'POS',
        customer_id: testCustomer.id,
        items: [
          {
            item_type: 'PRODUCT',
            product_id: testProduct.id,
            description: 'Test Product',
            quantity: 3,
            unit_price: 100000,
          },
        ],
      },
    });
    
    expect(error).toBeNull();
    expect(invoice.status).toBe('UNPAID');
    
    // Check stock deducted
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single();
    
    expect(product.stock_quantity).toBe(7);
  });

  it('should reject checkout when stock insufficient (concurrent)', async () => {
    // Simulate concurrent checkout
    const promises = Array(15).fill(null).map(() =>
      supabase.functions.invoke('create-invoice', {
        body: {
          invoice_type: 'POS',
          customer_id: testCustomer.id,
          items: [
            {
              item_type: 'PRODUCT',
              product_id: testProduct.id,
              description: 'Test Product',
              quantity: 1,
              unit_price: 100000,
            },
          ],
        },
      })
    );
    
    const results = await Promise.allSettled(promises);
    
    // Only 10 should succeed (initial stock)
    const successes = results.filter(r => r.status === 'fulfilled' && !r.value.error);
    expect(successes.length).toBe(10);
  });

  it('should apply promo code correctly', async () => {
    // Create promo
    await supabase.from('promotions').insert({
      code: 'TEST10',
      name: 'Test 10%',
      promotion_type: 'PERCENTAGE',
      discount_value: 10,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      status: 'ACTIVE',
    });
    
    const { data: invoice } = await supabase.functions.invoke('create-invoice', {
      body: {
        invoice_type: 'POS',
        customer_id: testCustomer.id,
        items: [
          {
            item_type: 'PRODUCT',
            product_id: testProduct.id,
            description: 'Test Product',
            quantity: 1,
            unit_price: 100000,
          },
        ],
        promotion_id: 'TEST10',
      },
    });
    
    expect(invoice.discount_amount).toBe(10000); // 10% of 100000
  });

  it('should redeem loyalty points and update balance', async () => {
    // Create loyalty member
    await supabase.from('loyalty_members').insert({
      customer_id: testCustomer.id,
      available_points: 1000,
      total_points: 1000,
    });
    
    const { data: invoice } = await supabase.functions.invoke('create-invoice', {
      body: {
        invoice_type: 'POS',
        customer_id: testCustomer.id,
        items: [
          {
            item_type: 'PRODUCT',
            product_id: testProduct.id,
            description: 'Test Product',
            quantity: 1,
            unit_price: 100000,
          },
        ],
        loyalty_points_to_redeem: 500,
      },
    });
    
    expect(invoice.loyalty_points_redeemed).toBe(500);
    
    // Check points deducted
    const { data: member } = await supabase
      .from('loyalty_members')
      .select('available_points')
      .eq('customer_id', testCustomer.id)
      .single();
    
    expect(member.available_points).toBe(500);
  });

  it('should restore stock when invoice cancelled', async () => {
    const { data: invoice } = await supabase.functions.invoke('create-invoice', {
      body: {
        invoice_type: 'POS',
        customer_id: testCustomer.id,
        items: [
          {
            item_type: 'PRODUCT',
            product_id: testProduct.id,
            description: 'Test Product',
            quantity: 3,
            unit_price: 100000,
          },
        ],
      },
    });
    
    // Cancel invoice
    await supabase.functions.invoke('cancel-invoice', {
      body: { invoice_id: invoice.id },
    });
    
    // Check stock restored
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single();
    
    expect(product.stock_quantity).toBe(10); // Back to original
  });
});
```

#### 6.3.3 Pet Hotel Flow

```typescript
// tests/integration/pet-hotel/pet-hotel.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../setup';
import { createRoomFactory } from '../../factories/room.factory';
import { createPetFactory } from '../../factories/pet.factory';
import { createCustomerFactory } from '../../factories/customer.factory';

describe('Pet Hotel Flow', () => {
  let testRoom: any;
  let testPet: any;
  let testCustomer: any;

  beforeEach(async () => {
    testRoom = await supabase
      .from('rooms')
      .insert(createRoomFactory({ status: 'AVAILABLE' }))
      .select()
      .single();
    
    testCustomer = await supabase
      .from('customers')
      .insert(createCustomerFactory())
      .select()
      .single();
    
    testPet = await supabase
      .from('pets')
      .insert(createPetFactory({ customer_id: testCustomer.id }))
      .select()
      .single();
  });

  it('should reserve room on booking', async () => {
    const { data: booking } = await supabase.functions.invoke('create-pet-hotel-booking', {
      body: {
        pet_id: testPet.id,
        customer_id: testCustomer.id,
        room_id: testRoom.id,
        check_in_date: '2026-08-20',
        check_out_date: '2026-08-25',
      },
    });
    
    expect(booking.status).toBe('BOOKED');
    
    // Check room status
    const { data: room } = await supabase
      .from('rooms')
      .select('status')
      .eq('id', testRoom.id)
      .single();
    
    expect(room.status).toBe('RESERVED');
  });

  it('should mark room OCCUPIED on check-in', async () => {
    const { data: booking } = await supabase.functions.invoke('create-pet-hotel-booking', {
      body: {
        pet_id: testPet.id,
        customer_id: testCustomer.id,
        room_id: testRoom.id,
        check_in_date: '2026-08-20',
        check_out_date: '2026-08-25',
      },
    });
    
    await supabase.functions.invoke('pet-hotel-checkin', {
      body: { booking_id: booking.id },
    });
    
    const { data: room } = await supabase
      .from('rooms')
      .select('status')
      .eq('id', testRoom.id)
      .single();
    
    expect(room.status).toBe('OCCUPIED');
  });

  it('should return room to AVAILABLE on check-out', async () => {
    // ... booking and check-in
    
    await supabase.functions.invoke('pet-hotel-checkout', {
      body: { booking_id: booking.id },
    });
    
    const { data: room } = await supabase
      .from('rooms')
      .select('status')
      .eq('id', testRoom.id)
      .single();
    
    expect(room.status).toBe('AVAILABLE');
  });

  it('should calculate final cost based on actual stay', async () => {
    // Book for 5 nights
    const { data: booking } = await supabase.functions.invoke('create-pet-hotel-booking', {
      body: {
        pet_id: testPet.id,
        customer_id: testCustomer.id,
        room_id: testRoom.id,
        check_in_date: '2026-08-20',
        check_out_date: '2026-08-25',
        price_per_night: 150000,
      },
    });
    
    // Check-in
    await supabase.functions.invoke('pet-hotel-checkin', {
      body: { booking_id: booking.id },
    });
    
    // Check-out 1 day early
    await supabase.functions.invoke('pet-hotel-checkout', {
      body: {
        booking_id: booking.id,
        actual_check_out_date: '2026-08-24',
      },
    });
    
    const { data: updatedBooking } = await supabase
      .from('pet_hotel_bookings')
      .select('total_price')
      .eq('id', booking.id)
      .single();
    
    expect(updatedBooking.total_price).toBe(600000); // 4 nights × 150000
  });

  it('should create PET_HOTEL invoice item on check-out', async () => {
    // ... booking, check-in, check-out
    
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, invoice_items(*)')
      .eq('customer_id', testCustomer.id);
    
    const petHotelInvoice = invoices.find(inv =>
      inv.invoice_items.some(item => item.item_type === 'PET_HOTEL')
    );
    
    expect(petHotelInvoice).toBeDefined();
  });
});
```

### 6.4 Coverage Target

| Module | Branches | Functions | Lines | Statements |
|---|---|---|---|---|
| Auth | 80% | 80% | 80% | 80% |
| POS/Billing | 80% | 80% | 80% | 80% |
| Pet Hotel | 70% | 70% | 70% | 70% |
| Grooming | 70% | 70% | 70% | 70% |
| Inventory | 70% | 70% | 70% | 70% |
| Loyalty | 80% | 80% | 80% | 80% |
| Portal | 60% | 60% | 60% | 60% |

---

## 7. RLS Policy Testing Contract

### 7.1 Scope

Setiap tabel Supabase wajib memiliki test untuk RLS policies. Ini adalah **critical security test**.

### 7.2 Test Structure

```typescript
// tests/rls/customers.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../integration/setup';

describe('Row Level Security - customers table', () => {
  let ownerClient: any;
  let adminClient: any;
  let doctorClient: any;
  let kasirClient: any;
  let customerClient: any;

  beforeAll(async () => {
    // Create authenticated clients for each role
    const { data: ownerSession } = await supabase.functions.invoke('auth-login', {
      body: { username: 'test.owner', pin: '123456' },
    });
    ownerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${ownerSession.session_token}` } },
    });
    
    // ... repeat for other roles
  });

  describe('SELECT', () => {
    it('should allow Owner to read all customers', async () => {
      const { data, error } = await ownerClient
        .from('customers')
        .select('*');
      
      expect(error).toBeNull();
      expect(data.length).toBeGreaterThan(0);
    });

    it('should allow Admin to read all customers', async () => {
      const { data, error } = await adminClient
        .from('customers')
        .select('*');
      
      expect(error).toBeNull();
      expect(data.length).toBeGreaterThan(0);
    });

    it('should allow Doctor to read all customers', async () => {
      const { data, error } = await doctorClient
        .from('customers')
        .select('*');
      
      expect(error).toBeNull();
    });

    it('should allow Customer to read only own data', async () => {
      const { data, error } = await customerClient
        .from('customers')
        .select('*');
      
      expect(error).toBeNull();
      expect(data.length).toBe(1); // Only own customer record
    });

    it('should block Customer from reading other customers', async () => {
      // Try to read another customer's data
      const { data, error } = await customerClient
        .from('customers')
        .select('*')
        .neq('id', 'own-customer-id');
      
      expect(data.length).toBe(0);
    });
  });

  describe('INSERT', () => {
    it('should allow Owner to create customer', async () => {
      const { data, error } = await ownerClient
        .from('customers')
        .insert({ name: 'Test Customer' })
        .select();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should allow Admin to create customer', async () => {
      const { data, error } = await adminClient
        .from('customers')
        .insert({ name: 'Test Customer 2' })
        .select();
      
      expect(error).toBeNull();
    });

    it('should block Doctor from creating customer', async () => {
      const { error } = await doctorClient
        .from('customers')
        .insert({ name: 'Test Customer 3' });
      
      expect(error).toBeDefined();
      expect(error.code).toBe('42501'); // RLS violation
    });

    it('should block Customer from creating customer', async () => {
      const { error } = await customerClient
        .from('customers')
        .insert({ name: 'Test Customer 4' });
      
      expect(error).toBeDefined();
    });
  });

  describe('UPDATE', () => {
    it('should allow Owner to update any customer', async () => {
      const { error } = await ownerClient
        .from('customers')
        .update({ name: 'Updated Name' })
        .eq('id', 'some-customer-id');
      
      expect(error).toBeNull();
    });

    it('should allow Customer to update own data', async () => {
      const { error } = await customerClient
        .from('customers')
        .update({ phone: '+6281234567890' })
        .eq('id', 'own-customer-id');
      
      expect(error).toBeNull();
    });

    it('should block Customer from updating other customer data', async () => {
      const { error } = await customerClient
        .from('customers')
        .update({ phone: '+6281234567890' })
        .eq('id', 'other-customer-id');
      
      expect(error).toBeDefined();
    });
  });
});
```

### 7.3 RLS Test Coverage

**Wajib di-test untuk setiap tabel**:
- ✅ `users` — create, read, update permissions per role
- ✅ `customers` — read (own vs all), create, update
- ✅ `pets` — read (own vs all), create, update
- ✅ `appointments` — read, create (portal vs staff), update status
- ✅ `medical_records` — read (doctor own vs all), create, update (creator only)
- ✅ `invoices` — read (own vs all), create, update
- ✅ `products` — read (active only for customer), create, update
- ✅ `stock_movements` — read, create
- ✅ `loyalty_members` — read (own vs all)
- ✅ `notifications` — read (own only)

---

## 8. E2E Testing Contract

### 8.1 Konfigurasi Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 8.2 Critical E2E Scenarios

#### 8.2.1 Authentication

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Owner can login and see full dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="username"]', 'test.owner');
    await page.fill('input[name="pin"]', '123456');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/app/dashboard');
    await expect(page.getByText('Selamat pagi')).toBeVisible();
  });

  test('Customer can login and see portal', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="username"]', 'test.customer');
    await page.fill('input[name="pin"]', '123456');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/portal');
    await expect(page.getByText('Selamat pagi')).toBeVisible();
  });

  test('Account locks after 5 failed attempts', async ({ page }) => {
    await page.goto('/login');
    
    for (let i = 0; i < 5; i++) {
      await page.fill('input[name="username"]', 'test.admin');
      await page.fill('input[name="pin"]', 'wrong');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }
    
    await expect(page.getByText(/akun terkunci/i)).toBeVisible();
  });

  test('User can change PIN after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test.owner');
    await page.fill('input[name="pin"]', '123456');
    await page.click('button[type="submit"]');
    
    // Navigate to profile
    await page.goto('/app/settings/profile');
    
    // Change PIN
    await page.click('button:has-text("Ganti PIN")');
    await page.fill('input[name="oldPin"]', '123456');
    await page.fill('input[name="newPin"]', '654321');
    await page.fill('input[name="confirmPin"]', '654321');
    await page.click('button:has-text("Simpan")');
    
    await expect(page.getByText(/pin berhasil diubah/i)).toBeVisible();
  });
});
```

#### 8.2.2 Patient Visit End-to-End

```typescript
// e2e/patient-visit/full-visit.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Full Patient Visit', () => {
  test('booking → examination → billing → payment', async ({ page }) => {
    // 1. Admin creates appointment
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test.admin');
    await page.fill('input[name="pin"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.goto('/app/appointments');
    await page.click('button:has-text("Buat Appointment")');
    
    await page.fill('input[name="customer"]', 'Ibu Wati');
    await page.click('.customer-option:has-text("Ibu Wati")');
    
    await page.fill('input[name="pet"]', 'Buddy');
    await page.click('.pet-option:has-text("Buddy")');
    
    await page.fill('input[name="date"]', '2026-08-20');
    await page.fill('input[name="time"]', '10:00');
    
    await page.click('button:has-text("Buat Appointment")');
    
    await expect(page.getByText(/appointment berhasil dibuat/i)).toBeVisible();
    
    // 2. Doctor examines & creates medical record
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test.doctor');
    await page.fill('input[name="pin"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.goto('/app/appointments');
    await page.click('button:has-text("Panggil")');
    
    await expect(page.getByText(/in progress/i)).toBeVisible();
    
    await page.click('button:has-text("Buat Rekam Medis")');
    
    await page.fill('textarea[name="chief_complaint"]', 'Vaksin tahunan');
    await page.fill('textarea[name="diagnosis"]', 'Sehat');
    await page.fill('textarea[name="treatment"]', 'Vaksin Rabies');
    
    await page.click('button:has-text("Simpan")');
    
    await expect(page.getByText(/rekam medis berhasil disimpan/i)).toBeVisible();
    
    // 3. Admin creates invoice
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test.admin');
    await page.fill('input[name="pin"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.goto('/app/invoices');
    await page.click('button:has-text("Buat Invoice")');
    
    await page.click('button:has-text("Tambah Item")');
    await page.selectOption('select[name="item_type"]', 'KONSULTASI');
    await page.fill('input[name="unit_price"]', '100000');
    
    await page.click('button:has-text("Tambah Item")');
    await page.selectOption('select[name="item_type"]', 'TINDAKAN');
    await page.fill('input[name="description"]', 'Vaksin Rabies');
    await page.fill('input[name="unit_price"]', '150000');
    
    await page.click('button:has-text("Simpan Invoice")');
    
    // 4. Cashier processes payment
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test.kasir');
    await page.fill('input[name="pin"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.goto('/app/invoices');
    await page.click('tr:has-text("UNPAID") button:has-text("Bayar")');
    
    await page.selectOption('select[name="payment_method"]', 'CASH');
    await page.fill('input[name="amount"]', '250000');
    
    await page.click('button:has-text("Proses Pembayaran")');
    
    await expect(page.getByText(/pembayaran berhasil/i)).toBeVisible();
    await expect(page.getByText(/PAID/i)).toBeVisible();
    
    // 5. Loyalty points added
    await page.goto('/app/loyalty');
    await page.click('tr:has-text("Ibu Wati")');
    
    const pointsText = await page.textContent('[data-testid="available-points"]');
    expect(parseInt(pointsText)).toBeGreaterThan(0);
  });
});
```

#### 8.2.3 POS Transaction

```typescript
// e2e/pos/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('POS Checkout', () => {
  test('checkout with promo and loyalty redemption', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test.kasir');
    await page.fill('input[name="pin"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.goto('/app/pos');
    
    // 1. Add products
    await page.click('.product-card:has-text("Royal Canin")');
    await page.click('.product-card:has-text("Whiskas")');
    
    await expect(page.getByText('Royal Canin Adult 5kg')).toBeVisible();
    await expect(page.getByText('Whiskas Cat Food 1kg')).toBeVisible();
    
    // 2. Select customer
    await page.click('button:has-text("Pilih Customer")');
    await page.fill('input[name="customer"]', 'Ibu Wati');
    await page.click('.customer-option:has-text("Ibu Wati")');
    
    // 3. Apply promo code
    await page.fill('input[name="promo_code"]', 'DISKON10');
    await page.click('button:has-text("Apply")');
    
    await expect(page.getByText(/diskon diterapkan/i)).toBeVisible();
    
    // 4. Redeem loyalty points
    await page.click('button:has-text("Gunakan Poin")');
    await page.fill('input[name="points_to_redeem"]', '100');
    await page.click('button:has-text("Konfirmasi")');
    
    // 5. Process payment
    await page.click('button:has-text("Cash")');
    await page.fill('input[name="cash_amount"]', '500000');
    
    await page.click('button:has-text("Bayar")');
    
    await expect(page.getByText(/transaksi berhasil/i)).toBeVisible();
    
    // 6. Verify receipt
    await expect(page.getByText(/struk/i)).toBeVisible();
    
    // 7. Verify stock deducted
    await page.goto('/app/products');
    await page.fill('input[name="search"]', 'Royal Canin');
    
    const stockText = await page.textContent('[data-testid="stock-quantity"]');
    expect(parseInt(stockText)).toBeLessThan(12); // Initial stock
  });
});
```

#### 8.2.4 Role-Based Access

```typescript
// e2e/rbac/doctor-restrictions.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Doctor Restrictions', () => {
  test('Doctor cannot access POS or inventory', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test.doctor');
    await page.fill('input[name="pin"]', '123456');
    await page.click('button[type="submit"]');
    
    // Try to access POS
    await page.goto('/app/pos');
    await expect(page).toHaveURL('/app/dashboard'); // Redirected
    await expect(page.getByText(/akses ditolak/i)).toBeVisible();
    
    // Try to access inventory
    await page.goto('/app/inventory');
    await expect(page).toHaveURL('/app/dashboard');
    await expect(page.getByText(/akses ditolak/i)).toBeVisible();
    
    // Verify sidebar doesn't show restricted menus
    await page.goto('/app/dashboard');
    await expect(page.getByRole('link', { name: /pos/i })).not.toBeVisible();
    await expect(page.getByRole('link', { name: /inventory/i })).not.toBeVisible();
  });
});
```

### 8.3 E2E Test Organization

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
        ├── login.page.ts
        ├── pos.page.ts
        └── ...
```

### 8.4 Parallelization & Sharding

```typescript
// playwright.config.ts
export default defineConfig({
  // ... other config
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
});
```

**Target**: Full E2E suite < 10 menit di CI

---

## 9. Security Testing Contract

### 9.1 Static Application Security Testing (SAST)

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:security/recommended"
  ],
  "plugins": ["security"],
  "rules": {
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "error",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-possible-timing-attacks": "error",
    "security/detect-pseudoRandomBytes": "error",
    "security/detect-new-buffer": "error"
  }
}
```

### 9.2 Authentication Security Tests

```typescript
// tests/security/auth-security.test.ts
import { describe, it, expect } from 'vitest';
import { supabase } from '../integration/setup';

describe('Authentication Security', () => {
  it('should never expose PIN in plain text (API response)', async () => {
    const { data } = await supabase.functions.invoke('auth-login', {
      body: { username: 'test.owner', pin: '123456' },
    });
    
    expect(data.user.pin_hash).toBeUndefined();
    expect(JSON.stringify(data)).not.toContain('123456');
  });

  it('should hash PIN with bcrypt/argon2', async () => {
    const { data: user } = await supabase
      .from('users')
      .select('pin_hash')
      .eq('username', 'test.owner')
      .single();
    
    // bcrypt hash starts with $2b$ or $2a$
    expect(user.pin_hash).toMatch(/^\$2[ab]\$\d{2}\$/);
  });

  it('should enforce lockout after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await supabase.functions.invoke('auth-login', {
        body: { username: 'test.admin', pin: 'wrong' },
      });
    }
    
    const { data: user } = await supabase
      .from('users')
      .select('locked_until')
      .eq('username', 'test.admin')
      .single();
    
    expect(user.locked_until).not.toBeNull();
  });

  it('should prevent brute force via rate limiting', async () => {
    // Attempt 100 logins in 1 minute
    const promises = Array(100).fill(null).map(() =>
      supabase.functions.invoke('auth-login', {
        body: { username: 'test.owner', pin: 'wrong' },
      })
    );
    
    const results = await Promise.allSettled(promises);
    
    // Some should be rate-limited
    const rateLimited = results.filter(r =>
      r.status === 'fulfilled' && r.value.error?.code === 'RATE_LIMITED'
    );
    
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  it('should invalidate session on logout', async () => {
    const { data: loginData } = await supabase.functions.invoke('auth-login', {
      body: { username: 'test.owner', pin: '123456' },
    });
    
    const token = loginData.session_token;
    
    // Logout
    await supabase.functions.invoke('auth-logout', {
      body: { token },
    });
    
    // Try to use token
    const { error } = await supabase.functions.invoke('protected-endpoint', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    expect(error).toBeDefined();
  });

  it('should reject SQL injection attempts', async () => {
    const maliciousUsername = "admin' OR '1'='1";
    
    const { error } = await supabase.functions.invoke('auth-login', {
      body: { username: maliciousUsername, pin: '123456' },
    });
    
    expect(error).toBeDefined();
    expect(error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should reject XSS attempts in input fields', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const { error } = await supabase
      .from('customers')
      .insert({ name: xssPayload });
    
    // Should be sanitized or rejected
    expect(error).toBeDefined();
  });
});
```

### 9.3 Dependency Scanning

```yaml
# .github/workflows/security.yml
name: Security Audit
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=high --json > audit.json
      
      - name: Check for critical vulnerabilities
        run: |
          if jq '.metadata.vulnerabilities.critical' audit.json | grep -q '[1-9]'; then
            echo "Critical vulnerabilities found!"
            exit 1
          fi
      
      - name: Upload audit report
        uses: actions/upload-artifact@v4
        with:
          name: audit-report
          path: audit.json
```

### 9.4 Security Checklist per PR

- [ ] No hardcoded secrets
- [ ] All inputs validated via Zod
- [ ] RLS policies tested
- [ ] No direct SQL queries (use Supabase client)
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] CORS properly configured
- [ ] Rate limiting on auth endpoints
- [ ] PIN never logged in plain text
- [ ] Session tokens expire appropriately
- [ ] No sensitive data in localStorage (except session token)

---

## 10. Performance Testing Contract

### 10.1 Frontend Performance

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:5173/",
        "http://localhost:5173/portal",
        "http://localhost:5173/app/pos"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 10.2 Performance Budgets

| Metric | Target | Measurement |
|---|---|---|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Total Blocking Time (TBT)** | < 200ms | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **Time to Interactive (TTI)** | < 3.5s | Lighthouse |
| **Bundle size (initial)** | < 300 KB (gzipped) | `size-limit` |
| **Bundle size (max per route)** | < 100 KB (gzipped) | `size-limit` |

### 10.3 Bundle Size Check

```json
// package.json
{
  "size-limit": [
    {
      "path": "dist/assets/*.js",
      "limit": "300 KB"
    },
    {
      "path": "dist/assets/*.css",
      "limit": "50 KB"
    }
  ]
}
```

### 10.4 Backend Performance (Supabase)

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
  const payload = JSON.stringify({
    invoice_type: 'POS',
    customer_id: 'test-customer-id',
    items: [
      {
        item_type: 'PRODUCT',
        product_id: 'test-product-id',
        description: 'Test Product',
        quantity: 1,
        unit_price: 100000,
      },
    ],
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.SUPABASE_TOKEN}`,
    },
  };
  
  const res = http.post(
    `${__ENV.SUPABASE_URL}/functions/v1/create-invoice`,
    payload,
    params
  );
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### 10.5 Load Test Schedule

| Test | Frequency | Purpose |
|---|---|---|
| POS checkout | Weekly | Validate concurrent transactions |
| Portal browse | Weekly | Validate read performance |
| Full load test | Monthly | Capacity planning |
| Stress test | Quarterly | Find breaking point |

---

## 11. Accessibility Testing Contract

### 11.1 Standards

- **WCAG 2.1 Level AA** minimum
- Keyboard navigable (all features)
- Screen reader friendly (ARIA labels)
- Color contrast ≥ 4.5:1 (text), ≥ 3:1 (UI)
- Focus visible
- Motion reduction support

### 11.2 A11y Test Scenarios

```typescript
// tests/a11y/login.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Login Page Accessibility', () => {
  test('should meet WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/login');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through all interactive elements
    await page.keyboard.press('Tab'); // Username
    await page.keyboard.press('Tab'); // PIN
    await page.keyboard.press('Tab'); // Submit button
    
    const focusedElement = await page.evaluate(() => document.activeElement);
    expect(focusedElement.tagName).toBe('BUTTON');
  });

  test('should have proper labels', async ({ page }) => {
    await page.goto('/login');
    
    const usernameInput = page.locator('input[name="username"]');
    await expect(usernameInput).toHaveAttribute('aria-label', /username/i);
    
    const pinInput = page.locator('input[name="pin"]');
    await expect(pinInput).toHaveAttribute('aria-label', /pin/i);
  });
});
```

### 11.3 A11y Checklist

- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA roles correct
- [ ] Screen reader tested
- [ ] Motion reduction respected
- [ ] Error messages announced
- [ ] Skip links provided

---

## 12. CI/CD Pipeline Contract

### 12.1 Pipeline Overview

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
│     - RLS tests                                              │
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

### 12.2 GitHub Actions Workflows

#### 12.2.1 PR Check Workflow

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
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

#### 12.2.2 Staging Deployment Workflow

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
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup Supabase CLI
        run: npm install -g supabase
      
      - name: Start Supabase local
        run: supabase start
      
      - name: Run migrations
        run: supabase db push
      
      - name: Integration tests
        run: npm run test:integration
        env:
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: RLS tests
        run: npm run test:rls
        env:
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: E2E tests
        run: npm run test:e2e
        env:
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Lighthouse CI
        run: npm run lhci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--environment staging'
      
      - name: Notify Slack (success)
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Staging deployment completed successfully'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify Slack (failure)
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Staging deployment failed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### 12.2.3 Production Deployment Workflow

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
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: ${{ secrets.PRODUCTION_URL }}
      
      - name: Notify Slack (success)
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Production deployment successful 🚀'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify Slack (failure)
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Production deployment failed - ROLLBACK REQUIRED 🚨'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### 12.2.4 Scheduled Workflows

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
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --json > audit.json
      
      - name: Check for critical vulnerabilities
        run: |
          if jq '.metadata.vulnerabilities.critical' audit.json | grep -q '[1-9]'; then
            echo "Critical vulnerabilities found!"
            exit 1
          fi
      
      - name: Upload audit report
        uses: actions/upload-artifact@v4
        with:
          name: audit-report
          path: audit.json
  
  load-test:
    if: github.event.schedule == '0 3 * * 1'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run k6 load tests
        uses: grafana/k6-action@v0.3.0
        with:
          filename: k6-scripts/*.js
          flags: --out json=results.json
        env:
          SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          SUPABASE_TOKEN: ${{ secrets.STAGING_SUPABASE_TOKEN }}
      
      - name: Upload load test results
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results
          path: results.json
  
  e2e-full:
    if: github.event.schedule == '0 2 * * *'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Full E2E suite
        run: npm run test:e2e:full
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
```

### 12.3 Vercel Deployment Strategy

| Environment | Branch | Auto-deploy | Purpose |
|---|---|---|---|
| **Preview** | Every PR branch | ✅ | Review per PR |
| **Staging** | `main` | ✅ | Pre-production validation |
| **Production** | Git tag / release | ✅ (with approval) | Live system |

### 12.4 Branch Strategy

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

### 12.5 Commit Convention

```
<type>(<scope>): <subject>

feat(pos): add loyalty points redemption
fix(auth): resolve lockout reset issue
test(e2e): add pet hotel flow tests
docs(prd): update testing strategy
chore(deps): update supabase-js to v2.45.0
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`

---

## 13. Quality Gates & Metrics

### 13.1 PR Merge Requirements

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

### 13.2 Staging Deployment Requirements

| Gate | Requirement | Blocker |
|---|---|---|
| **All PR gates** | ✅ Passed | Hard |
| **Integration tests** | ✅ 100% pass | Hard |
| **RLS tests** | ✅ 100% pass | Hard |
| **E2E tests** | ✅ 100% pass | Hard |
| **Lighthouse** | Score ≥ 90 all categories | Hard |
| **A11y audit** | ✅ No critical violations | Hard |
| **Smoke tests** | ✅ Pass | Hard |

### 13.3 Production Deployment Requirements

| Gate | Requirement | Blocker |
|---|---|---|
| **All staging gates** | ✅ Passed | Hard |
| **Manual approval** | Owner/Lead approval | Hard |
| **Release notes** | Documented | Hard |
| **Rollback plan** | Documented | Hard |
| **Smoke tests** | ✅ Pass post-deploy | Hard |

### 13.4 Quality Metrics Dashboard

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

## 14. Test Data Management Contract

### 14.1 Principles

- **Isolated**: Setiap test punya data sendiri
- **Deterministic**: Hasil sama setiap run
- **Minimal**: Hanya data yang dibutuhkan
- **Clean**: Data dibersihkan setelah test

### 14.2 Test Data Strategy

| Layer | Strategy |
|---|---|
| **Unit tests** | Inline data, factories |
| **Component tests** | MSW mocks, fixtures |
| **Integration tests** | Supabase local + seed scripts |
| **E2E tests** | Dedicated test database + seed |
| **Performance tests** | Production-like dataset (anonymized) |

### 14.3 Seed Scripts

```typescript
// tests/seed/seed.ts
import { supabase } from '../integration/setup';
import { createUserFactory } from '../factories/user.factory';
import { createCustomerFactory } from '../factories/customer.factory';
import { createPetFactory } from '../factories/pet.factory';
import { createProductFactory } from '../factories/product.factory';

export async function seedTestData() {
  // Clean up
  await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('loyalty_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('pets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Create test users (one per role)
  const owner = await supabase
    .from('users')
    .insert(createUserFactory({ role: 'OWNER', username: 'test.owner', pin: '123456' }))
    .select()
    .single();
  
  const admin = await supabase
    .from('users')
    .insert(createUserFactory({
      role: 'ADMIN',
      username: 'test.admin',
      pin: '123456',
      created_by: owner.id,
    }))
    .select()
    .single();
  
  const doctor = await supabase
    .from('users')
    .insert(createUserFactory({
      role: 'DOKTER',
      username: 'test.doctor',
      pin: '123456',
      created_by: owner.id,
    }))
    .select()
    .single();
  
  const kasir = await supabase
    .from('users')
    .insert(createUserFactory({
      role: 'KASIR',
      username: 'test.kasir',
      pin: '123456',
      created_by: owner.id,
    }))
    .select()
    .single();
  
  const customer = await supabase
    .from('users')
    .insert(createUserFactory({
      role: 'CUSTOMER',
      username: 'test.customer',
      pin: '123456',
      created_by: admin.id,
    }))
    .select()
    .single();
  
  // Create test customer
  const testCustomer = await supabase
    .from('customers')
    .insert(createCustomerFactory({
      name: 'Ibu Wati',
      phone: '+6281234567890',
    }))
    .select()
    .single();
  
  // Link customer to user
  await supabase
    .from('users')
    .update({ customer_id: testCustomer.id })
    .eq('id', customer.id);
  
  // Create test pets
  await supabase.from('pets').insert([
    createPetFactory({ customer_id: testCustomer.id, name: 'Buddy', species: 'Dog' }),
    createPetFactory({ customer_id: testCustomer.id, name: 'Mimi', species: 'Cat' }),
  ]);
  
  // Create test products
  await supabase.from('products').insert([
    createProductFactory({ sku: 'RC-ADT-5KG', name: 'Royal Canin Adult 5kg', stock_quantity: 10 }),
    createProductFactory({ sku: 'WH-CAT-1KG', name: 'Whiskas Cat 1kg', stock_quantity: 20 }),
    createProductFactory({ sku: 'PD-ADT-10KG', name: 'Pedigree Adult 10kg', stock_quantity: 5 }),
  ]);
}
```

### 14.4 Test Factories (Lanjutan)

```typescript
// tests/factories/customer.factory.ts
import { faker } from '@faker-js/faker';

export function createCustomerFactory(overrides: any = {}) {
  return {
    id: faker.string.uuid(),
    name: overrides.name || faker.person.fullName(),
    phone: overrides.phone || faker.phone.number('+62 8## #### ####'),
    email: overrides.email || faker.internet.email(),
    address: overrides.address || faker.location.streetAddress(),
    emergency_contact: overrides.emergency_contact || null,
    photo_url: overrides.photo_url || null,
    notes: overrides.notes || null,
    is_guest: overrides.is_guest ?? false,
    tags: overrides.tags || [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}
```

```typescript
// tests/factories/pet.factory.ts
import { faker } from '@faker-js/faker';

export function createPetFactory(overrides: any = {}) {
  const species = overrides.species || faker.helpers.arrayElement(['Dog', 'Cat', 'Rabbit']);
  
  return {
    id: faker.string.uuid(),
    customer_id: overrides.customer_id || faker.string.uuid(),
    name: overrides.name || faker.person.firstName(),
    species,
    breed: overrides.breed || faker.helpers.arrayElement([
      'Golden Retriever', 'Persian', 'Husky', 'Anggora', 'Labrador'
    ]),
    birth_date: overrides.birth_date || faker.date.past({ years: 5 }).toISOString().split('T')[0],
    gender: overrides.gender || faker.helpers.arrayElement(['M', 'F']),
    photo_url: overrides.photo_url || null,
    microchip_number: overrides.microchip_number || faker.string.numeric(15),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}
```

```typescript
// tests/factories/product.factory.ts
import { faker } from '@faker-js/faker';

export function createProductFactory(overrides: any = {}) {
  const purchasePrice = overrides.purchase_price || faker.number.int({ min: 10000, max: 500000 });
  
  return {
    id: faker.string.uuid(),
    sku: overrides.sku || `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    name: overrides.name || faker.commerce.productName(),
    category_id: overrides.category_id || null,
    supplier_id: overrides.supplier_id || null,
    barcode: overrides.barcode || faker.string.numeric(13),
    description: overrides.description || faker.commerce.productDescription(),
    purchase_price: purchasePrice,
    selling_price: overrides.selling_price || Math.round(purchasePrice * 1.3),
    stock_quantity: overrides.stock_quantity ?? faker.number.int({ min: 0, max: 100 }),
    stock_minimum: overrides.stock_minimum ?? 5,
    stock_maximum: overrides.stock_maximum ?? 100,
    photo_url: overrides.photo_url || null,
    expiry_date: overrides.expiry_date || null,
    status: overrides.status || 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}
```

```typescript
// tests/factories/room.factory.ts
import { faker } from '@faker-js/faker';

export function createRoomFactory(overrides: any = {}) {
  return {
    id: faker.string.uuid(),
    name: overrides.name || `Room ${faker.string.numeric(3)}`,
    room_number: overrides.room_number || faker.string.alphanumeric(5).toUpperCase(),
    room_type: overrides.room_type || faker.helpers.arrayElement(['STANDARD', 'DELUXE', 'VIP', 'LARGE']),
    price_per_night: overrides.price_per_night || faker.number.int({ min: 100000, max: 500000 }),
    capacity: overrides.capacity || 1,
    status: overrides.status || 'AVAILABLE',
    cleanliness: overrides.cleanliness || 'CLEAN',
    maintenance_status: overrides.maintenance_status ?? false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}
```

```typescript
// tests/factories/appointment.factory.ts
import { faker } from '@faker-js/faker';

export function createAppointmentFactory(overrides: any = {}) {
  return {
    id: faker.string.uuid(),
    customer_id: overrides.customer_id || faker.string.uuid(),
    pet_id: overrides.pet_id || faker.string.uuid(),
    doctor_id: overrides.doctor_id || null,
    appointment_date: overrides.appointment_date || faker.date.soon({ days: 7 }).toISOString().split('T')[0],
    appointment_time: overrides.appointment_time || `${faker.number.int({ min: 8, max: 17 })}:00`,
    queue_number: overrides.queue_number || faker.number.int({ min: 1, max: 50 }),
    status: overrides.status || 'WAITING',
    complaint: overrides.complaint || faker.lorem.sentence(),
    notes: overrides.notes || null,
    is_from_portal: overrides.is_from_portal ?? false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
```

```typescript
// tests/factories/invoice.factory.ts
import { faker } from '@faker-js/faker';

export function createInvoiceFactory(overrides: any = {}) {
  const subtotal = overrides.subtotal || faker.number.int({ min: 50000, max: 2000000 });
  const discount = overrides.discount_amount || 0;
  const tax = overrides.tax_amount || 0;
  const total = subtotal - discount + tax;
  
  return {
    id: faker.string.uuid(),
    invoice_number: overrides.invoice_number || `INV-${faker.string.numeric(8)}`,
    invoice_type: overrides.invoice_type || 'POS',
    customer_id: overrides.customer_id || null,
    subtotal,
    discount_amount: discount,
    tax_amount: tax,
    total_amount: overrides.total_amount || total,
    paid_amount: overrides.paid_amount || 0,
    status: overrides.status || 'UNPAID',
    promotion_id: overrides.promotion_id || null,
    loyalty_points_earned: overrides.loyalty_points_earned || 0,
    loyalty_points_redeemed: overrides.loyalty_points_redeemed || 0,
    notes: overrides.notes || null,
    created_by: overrides.created_by || faker.string.uuid(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
```

### 14.5 Data Cleanup Strategy

```typescript
// tests/cleanup/cleanup.ts
import { supabase } from '../integration/setup';

export async function cleanupTestData() {
  // Urutan penting: hapus child tables dulu, baru parent
  const tables = [
    'audit_logs',
    'notifications',
    'promotion_usage',
    'loyalty_transactions',
    'payments',
    'invoice_items',
    'invoices',
    'pet_hotel_logs',
    'pet_hotel_bookings',
    'grooming_records',
    'grooming_bookings',
    'medical_records',
    'appointments',
    'pet_allergies',
    'pet_diseases',
    'pet_vaccines',
    'pet_weight_logs',
    'pets',
    'customers',
    'stock_movements',
    'purchase_order_items',
    'purchase_orders',
    'product_variants',
    'products',
    'categories',
    'suppliers',
    'rooms',
    'procedures',
    'grooming_services',
    'expense_categories',
    'expenses',
    'loyalty_members',
    'loyalty_tiers',
    'promotions',
    'cash_shifts',
    'customer_feedback',
  ];
  
  for (const table of tables) {
    await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
  
  // Users dihapus terakhir (karena createdBy reference)
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

// Cleanup per test suite
export async function cleanupTestSuite(suiteName: string) {
  console.log(`Cleaning up test suite: ${suiteName}`);
  await cleanupTestData();
}
```

### 14.6 Test Data Isolation Patterns

```typescript
// tests/helpers/test-isolation.ts
import { supabase } from '../integration/setup';
import { cleanupTestData } from '../cleanup/cleanup';

export function withTestIsolation(setupFn?: () => Promise<void>) {
  beforeAll(async () => {
    await cleanupTestData();
    if (setupFn) await setupFn();
  });
  
  afterAll(async () => {
    await cleanupTestData();
  });
}

// Pattern: transaction rollback per test (ideal tapi terbatas di Supabase)
export function withTransactionRollback() {
  let client: any;
  
  beforeAll(async () => {
    // Begin transaction
    await supabase.rpc('begin_test_transaction');
  });
  
  afterAll(async () => {
    // Rollback transaction
    await supabase.rpc('rollback_test_transaction');
  });
}
```

---

## 15. Environment Management Contract

### 15.1 Environment Matrix

| Environment | Purpose | Database | Deploy | Access |
|---|---|---|---|---|
| **Local** | Developer workstation | Supabase local (Docker) | Vite dev server (port 5173) | Developer only |
| **Test** | CI/CD runs | Supabase local (ephemeral) | GitHub Actions runner | CI only |
| **Preview** | Per-PR review | Supabase project (preview) | Vercel Preview URL | Team + stakeholders |
| **Staging** | Pre-production | Supabase project (staging) | Vercel Preview (main branch) | QA + stakeholders |
| **Production** | Live system | Supabase project (prod) | Vercel Production | Public |

### 15.2 Environment Variables Contract

```bash
# .env.local (developer)
VITE_APP_NAME=Petora
VITE_APP_ENV=local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local-anon-key
VITE_ENABLE_MSW=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEVTOOLS=true

# .env.staging
VITE_APP_NAME=Petora
VITE_APP_ENV=staging
VITE_SUPABASE_URL=https://xxx-staging.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
VITE_ENABLE_MSW=false
VITE_LOG_LEVEL=info
VITE_ENABLE_DEVTOOLS=false
VITE_WHATSAPP_GATEWAY_URL=https://api.fonnte.com
VITE_EMAIL_SERVICE=resend

# .env.production
VITE_APP_NAME=Petora
VITE_APP_ENV=production
VITE_SUPABASE_URL=https://xxx-prod.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_ENABLE_MSW=false
VITE_LOG_LEVEL=warn
VITE_ENABLE_DEVTOOLS=false
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_WHATSAPP_GATEWAY_URL=https://api.fonnte.com
VITE_EMAIL_SERVICE=resend
VITE_PAYMENT_GATEWAY=midtrans
```

### 15.3 Server-Side Secrets (Vercel Environment)

```bash
# Server-side only (tidak terekspos ke client)
SUPABASE_SERVICE_ROLE_KEY=xxx
WHATSAPP_API_TOKEN=xxx
EMAIL_API_KEY=xxx
PAYMENT_GATEWAY_SERVER_KEY=xxx
SENTRY_AUTH_TOKEN=xxx
```

### 15.4 Secrets Management Rules

| Secret | Storage | Rotation | Access |
|---|---|---|---|
| Supabase service role key | GitHub Secrets + Vercel Env | Quarterly | CI/CD only |
| Vercel tokens | GitHub Secrets | Annually | CI/CD only |
| Payment gateway keys | Vercel Env | Per provider policy | Server-side only |
| WhatsApp gateway token | Vercel Env | Annually | Server-side only |
| SMTP credentials | Vercel Env | Annually | Server-side only |
| Sentry DSN | Vercel Env + .env | Annually | Client + server |

### 15.5 Database Migration Strategy

```bash
# Generate migration
npx supabase migration new add_loyalty_tables

# Apply locally
npx supabase db push

# Test in CI
npx supabase db push --linked

# Rollback (manual)
npx supabase db reset
```

**Migration Rules**:
- ✅ Setiap PR yang mengubah schema WAJIB menyertakan migration file
- ✅ Migration harus backward-compatible (zero-downtime)
- ✅ Setiap migration WAJIB memiliki rollback script
- ✅ Migration di-test di CI sebelum merge
- ❌ Tidak boleh drop column/table tanpa approval Owner
- ❌ Tidak boleh rename column (buat column baru, migrate data, drop lama)

### 15.6 Environment Validation

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string(),
  VITE_APP_ENV: z.enum(['local', 'staging', 'production']),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_ENABLE_MSW: z.string().transform(v => v === 'true'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  VITE_ENABLE_DEVTOOLS: z.string().transform(v => v === 'true'),
});

export const env = envSchema.parse(import.meta.env);
```

---

## 16. Monitoring & Observability Contract

### 16.1 Frontend Monitoring

| Tool | Fungsi | Alert Threshold |
|---|---|---|
| **Vercel Analytics** | Web Vitals, request timing | LCP > 4s |
| **Sentry** | Error tracking, performance | Error rate > 1% |
| **LogRocket** (opsional) | Session replay | N/A |

### 16.2 Backend Monitoring

| Tool | Fungsi | Alert Threshold |
|---|---|---|
| **Supabase Dashboard** | Query performance, auth events | Slow query > 1s |
| **Supabase Logs** | API logs, edge function logs | Error rate > 0.5% |
| **pg_stat_statements** | Slow query analysis | Query > 500ms |

### 16.3 Alerting Matrix

| Alert | Channel | Severity | Response Time |
|---|---|---|---|
| Error rate > 1% | Slack + Email | Critical | < 15 menit |
| LCP > 4s | Slack | Warning | < 1 jam |
| Failed login spike (>10/menit) | Slack | Warning | < 30 menit |
| Database connection errors | Slack + PagerDuty | Critical | < 5 menit |
| Deployment failure | Slack | Critical | < 15 menit |
| Security incident | Slack + Email + SMS | Critical | < 5 menit |
| Low stock alert | In-app + WhatsApp | Info | < 24 jam |
| Invoice unpaid > 7 hari | In-app | Info | < 24 jam |

### 16.4 Logging Standards

```typescript
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: import.meta.env.VITE_LOG_LEVEL || 'info',
  redact: ['pin', 'pinHash', 'password', '*.pin', '*.pin_hash'],
  base: {
    app: 'petora',
    env: import.meta.env.VITE_APP_ENV,
  },
});

// Usage examples
logger.info({ userId, action: 'login' }, 'User logged in');
logger.error({ err, userId, action: 'login' }, 'Login failed');
logger.warn({ productId, stock }, 'Low stock detected');
```

**Logging Rules**:
- ❌ Never log: PIN, pinHash, passwords, session tokens
- ✅ Always log: user ID, action, timestamp, correlation ID
- ✅ Structured logging (JSON) untuk parsing
- ✅ Include correlation ID untuk request tracing
- ✅ Sanitize PII sebelum log

### 16.5 Health Checks

```typescript
// src/lib/health.ts
export async function checkHealth() {
  const checks = {
    supabase: await checkSupabase(),
    database: await checkDatabase(),
    storage: await checkStorage(),
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  
  return {
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION,
    checks,
  };
}
```

### 16.6 Metrics to Track

| Category | Metric | Target |
|---|---|---|
| **Performance** | FCP, LCP, TBT, CLS | < 1.5s, < 2.5s, < 200ms, < 0.1 |
| **Reliability** | Uptime, error rate | ≥ 99.5%, < 1% |
| **Business** | Daily revenue, appointments | Trending up |
| **User** | Portal adoption, session duration | > 30%, > 5 min |
| **Security** | Failed logins, lockouts | Trending down |

---

## 17. Definition of Done

### 17.1 Feature DoD

Sebuah fitur dianggap **selesai** jika:

- [ ] Kode di-write dengan TypeScript strict mode
- [ ] Zod schema untuk semua input/output
- [ ] Unit tests untuk business logic (≥ 80% coverage)
- [ ] Component tests untuk UI baru
- [ ] Integration tests untuk alur lengkap
- [ ] E2E test untuk skenario kritis
- [ ] RLS policies di-test (untuk tabel baru)
- [ ] Lint + type check pass
- [ ] Code review approved (≥ 1 reviewer)
- [ ] Documentation updated (PRD + API docs)
- [ ] No TODO/FIXME without tracked issue
- [ ] Performance budget respected
- [ ] Accessibility validated (WCAG 2.1 AA)
- [ ] Responsive design tested (mobile + desktop)
- [ ] Deployed to staging & smoke tested
- [ ] Monitoring alerts configured (jika perlu)

### 17.2 Release DoD

Sebuah release dianggap **siap production** jika:

- [ ] All features DoD met
- [ ] Full E2E suite pass di staging
- [ ] Lighthouse scores ≥ 90 all categories
- [ ] Security audit clean (no high/critical CVE)
- [ ] Load test pass (jika ada perubahan kritis)
- [ ] Release notes documented
- [ ] Rollback plan documented
- [ ] Stakeholder approval
- [ ] Monitoring alerts configured
- [ ] Post-deploy smoke tests pass
- [ ] Database migration tested & rollback ready

### 17.3 Hotfix DoD

Hotfix untuk production issue:

- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Regression test added (wajib)
- [ ] Tested di staging
- [ ] Approved oleh Owner + Lead
- [ ] Deployed via hotfix branch
- [ ] Post-deploy verification
- [ ] Incident report documented
- [ ] Post-mortem scheduled (jika critical)

### 17.4 PR DoD

Sebuah PR dianggap **siap merge** jika:

- [ ] Follows commit convention
- [ ] Small & focused (≤ 400 lines changed ideal)
- [ ] All CI checks pass
- [ ] No merge conflicts
- [ ] Self-reviewed dulu sebelum request review
- [ ] Screenshots/video untuk perubahan UI
- [ ] Linked to issue (jika ada)
- [ ] Migration file included (jika ada schema change)
- [ ] Test coverage maintained or improved

---

## 18. NPM Scripts Contract

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
    "test:rls": "vitest run --config vitest.rls.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:full": "playwright test --project=chromium,firefox,webkit",
    "test:smoke": "playwright test --grep @smoke",
    "test:a11y": "playwright test tests/a11y/",
    "test:all": "npm run test:coverage && npm run test:integration && npm run test:rls && npm run test:e2e",
    
    "lhci": "lhci autorun",
    "size": "size-limit",
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix",
    
    "prepare": "husky install",
    
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase db push",
    "db:seed": "supabase db seed",
    "db:generate-migration": "supabase migration new",
    
    "setup": "npm install && npm run db:start && npm run db:migrate && npm run db:seed",
    "clean": "rm -rf node_modules dist coverage .vitest-cache"
  }
}
```

### 18.1 Script Usage Guide

| Script | Kapan Digunakan |
|---|---|
| `npm run dev` | Development sehari-hari |
| `npm run build` | Sebelum commit/PR |
| `npm run type-check` | Pre-commit, CI |
| `npm run lint` | Pre-commit, CI |
| `npm run test` | Development, CI |
| `npm run test:coverage` | Sebelum PR, CI |
| `npm run test:integration` | Sebelum PR, CI |
| `npm run test:rls` | Sebelum PR (jika ada perubahan RLS) |
| `npm run test:e2e` | Sebelum PR, CI |
| `npm run test:all` | Sebelum release |
| `npm run lhci` | Sebelum release |
| `npm run size` | Sebelum PR (jika ada perubahan bundle) |
| `npm run db:start` | Start local Supabase |
| `npm run db:migrate` | Apply migrations |
| `npm run setup` | First-time setup |

---

## 19. Configuration Files Baseline

### 19.1 `vitest.config.ts` (Unit & Component)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e', 'tests/integration', 'tests/rls'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'e2e/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        'src/types/**',
        'src/**/*.d.ts',
        'src/app/routes/**',
      ],
      thresholds: {
        'src/lib/business-rules/**': { branches: 90, functions: 90, lines: 90, statements: 90 },
        'src/schemas/**': { branches: 100, functions: 100, lines: 100, statements: 100 },
        'src/lib/utils/**': { branches: 80, functions: 80, lines: 80, statements: 80 },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 19.2 `vitest.integration.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 19.3 `vitest.rls.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/rls/**/*.test.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 19.4 `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 19.5 `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:5173/",
        "http://localhost:5173/portal",
        "http://localhost:5173/app/pos"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 19.6 `.eslintrc.json`

```json
{
  "root": true,
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:security/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks", "security", "jsx-a11y"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "security/detect-object-injection": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### 19.7 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "tests", "e2e"],
  "exclude": ["node_modules", "dist"]
}
```

### 19.8 `package.json` (Dependencies Baseline)

```json
{
  "name": "petora",
  "version": "1.0.0",
  "type": "module",
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
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:rls": "vitest run --config vitest.rls.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:smoke": "playwright test --grep @smoke",
    "test:all": "npm run test:coverage && npm run test:integration && npm run test:rls && npm run test:e2e",
    "lhci": "lhci autorun",
    "size": "size-limit",
    "audit": "npm audit --audit-level=high",
    "prepare": "husky install"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "@tanstack/react-query": "^5.40.0",
    "@supabase/supabase-js": "^2.43.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.4.0",
    "zustand": "^4.5.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "lucide-react": "^0.378.0",
    "pino": "^9.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.10.0",
    "@typescript-eslint/parser": "^7.10.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "vitest": "^1.6.0",
    "@vitest/coverage-v8": "^1.6.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@playwright/test": "^1.44.0",
    "msw": "^2.3.0",
    "@faker-js/faker": "^8.4.0",
    "eslint": "^9.0.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-security": "^3.0.0",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "prettier": "^3.2.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "@lhci/cli": "^0.13.0",
    "@size-limit/preset-small-lib": "^11.0.0",
    "size-limit": "^11.0.0",
    "@axe-core/playwright": "^4.9.0",
    "jsdom": "^24.0.0"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  },
  "size-limit": [
    {
      "path": "dist/assets/*.js",
      "limit": "300 KB"
    },
    {
      "path": "dist/assets/*.css",
      "limit": "50 KB"
    }
  ]
}
```

### 19.9 `.github/workflows/pr-check.yml`

```yaml
name: PR Check
on:
  pull_request:
    branches: [main, develop]

concurrency:
  group: pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    timeout-minutes: 15
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
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: false
```

### 19.10 `.github/workflows/staging.yml`

```yaml
name: Staging Deployment
on:
  push:
    branches: [main]

concurrency:
  group: staging
  cancel-in-progress: false

jobs:
  test-and-deploy:
    name: Test & Deploy to Staging
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Start Supabase local
        run: supabase start
      
      - name: Run migrations
        run: supabase db push
      
      - name: Integration tests
        run: npm run test:integration
        env:
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_LOCAL_ANON_KEY }}
      
      - name: RLS tests
        run: npm run test:rls
        env:
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_LOCAL_ANON_KEY }}
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: E2E tests
        run: npm run test:e2e
        env:
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_LOCAL_ANON_KEY }}
      
      - name: Lighthouse CI
        run: npm run lhci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
      
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--environment staging'
      
      - name: Notify Slack (success)
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: '✅ Staging deployment completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify Slack (failure)
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: '❌ Staging deployment failed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 19.11 `.github/workflows/production.yml`

```yaml
name: Production Deployment
on:
  release:
    types: [published]

concurrency:
  group: production
  cancel-in-progress: false

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: ${{ secrets.PRODUCTION_URL }}
      
      - name: Notify Slack (success)
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: '🚀 Production deployment successful'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify Slack (failure)
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: '🚨 Production deployment failed — ROLLBACK REQUIRED'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 19.12 `.github/workflows/scheduled.yml`

```yaml
name: Scheduled Checks
on:
  schedule:
    - cron: '0 2 * * *'   # Daily at 2 AM
    - cron: '0 3 * * 1'   # Weekly Monday 3 AM

jobs:
  security-audit:
    if: github.event.schedule == '0 2 * * *'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm audit --json > audit.json
      - name: Check for critical vulnerabilities
        run: |
          if jq '.metadata.vulnerabilities.critical' audit.json | grep -q '[1-9]'; then
            echo "::error::Critical vulnerabilities found!"
            exit 1
          fi
      - uses: actions/upload-artifact@v4
        with:
          name: audit-report
          path: audit.json
  
  load-test:
    if: github.event.schedule == '0 3 * * 1'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run k6 load tests
        uses: grafana/k6-action@v0.3.0
        with:
          filename: k6-scripts/*.js
          flags: --out json=results.json
        env:
          SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          SUPABASE_TOKEN: ${{ secrets.STAGING_SUPABASE_TOKEN }}
      - uses: actions/upload-artifact@v4
        with:
          name: load-test-results
          path: results.json
  
  e2e-full:
    if: github.event.schedule == '0 2 * * *'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e:full
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
```

### 19.13 `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

### 19.14 `.husky/commit-msg`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit ${1}
```

### 19.15 `commitlint.config.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'test', 'chore', 'perf', 'ci', 'build', 'revert'
    ]],
    'scope-enum': [1, 'always', [
      'auth', 'customers', 'pets', 'appointments', 'medical-records',
      'pet-hotel', 'grooming', 'products', 'inventory', 'purchase-orders',
      'pos', 'invoices', 'loyalty', 'promotions', 'feedback',
      'expenses', 'reports', 'settings', 'portal', 'ui', 'ci', 'deps'
    ]],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
  },
};
```

---

## 20. Glosarium

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
| **Atomic Operation** | Operasi yang要么 berhasil semua,要么 gagal semua |
| **Race Condition** | Bug akibat konkurensi, hasil tergantung urutan eksekusi |
| **Idempotent** | Operasi yang bisa dipanggil berkali-kali tanpa efek samping berbeda |
| **Deterministic** | Test yang selalu memberikan hasil yang sama |

---

## Ringkasan Eksekutif Final

### Cakupan Dokumen

✅ **Testing Strategy** — pyramid, tools, scenarios per modul
✅ **Unit Testing Contract** — Zod schemas, business rules, utils
✅ **Component Testing Contract** — forms, data display, POS
✅ **Integration Testing Contract** — auth, POS, pet hotel, RLS
✅ **RLS Policy Testing Contract** — security-critical per tabel
✅ **E2E Testing Contract** — Playwright, 20+ skenario kritis
✅ **Security Testing Contract** — SAST, auth security, dependency scan
✅ **Performance Testing Contract** — Lighthouse CI, k6, budgets
✅ **Accessibility Testing Contract** — WCAG 2.1 AA, axe-core
✅ **CI/CD Pipeline Contract** — GitHub Actions, Vercel, Supabase
✅ **Quality Gates & Metrics** — PR, staging, production requirements
✅ **Test Data Management** — factories, seeds, cleanup, isolation
✅ **Environment Management** — local, test, preview, staging, production
✅ **Monitoring & Observability** — error tracking, alerting, logging
✅ **Definition of Done** — feature, release, hotfix, PR
✅ **NPM Scripts Contract** — lengkap dengan usage guide
✅ **Configuration Files Baseline** — semua config files siap pakai

### Prinsip Utama

1. **Test what matters** — fokus pada alur bisnis kritis
2. **Fast feedback** — developer tahu hasil dalam < 10 menit
3. **Shift-left** — test sedini mungkin
4. **Automate everything** — manual testing hanya untuk eksplorasi
5. **Production-like** — staging harus mirip production
6. **Fail-fast** — validasi di setiap layer
7. **Audit everything** — setiap perubahan tercatat

### Target Kualitas

| Metrik | Target |
|---|---|
| Test pass rate | ≥ 99% |
| Code coverage (business logic) | ≥ 80% |
| Code coverage (Zod schemas) | 100% |
| PR cycle time | < 24 jam |
| Deployment frequency | ≥ 2x/minggu |
| Change failure rate | < 5% |
| Mean time to recovery | < 1 jam |
| Bug escape rate | < 2% |
| Flaky test rate | < 1% |

### Alur Kerja Developer

```
1. git checkout -b feature/xxx
2. Write code + tests (unit + component)
3. npm run type-check && npm run lint && npm run test
4. git commit (commitlint validates)
5. git push → PR created
6. CI runs: type-check, lint, unit tests, build, size, audit
7. Code review (≥ 1 approval)
8. Merge to main
9. CI runs: integration, RLS, E2E, Lighthouse
10. Deploy to staging
11. Manual QA (jika perlu)
12. Release created
13. Deploy to production
14. Smoke tests
15. Monitoring
```

### Checklist Implementasi

Sebelum memulai development, pastikan:
- [ ] Semua config files di-copy dari baseline ini
- [ ] Dependencies terinstall dengan versi yang sesuai
- [ ] Supabase local bisa berjalan (`npm run db:start`)
- [ ] Husky hooks terpasang (`npm run prepare`)
- [ ] CI/CD workflows sudah di-setup di GitHub
- [ ] Vercel project sudah terkoneksi
- [ ] Slack webhook sudah terkonfigurasi
- [ ] Sentry DSN sudah terpasang (production)
- [ ] Secrets sudah di-set di GitHub & Vercel
- [ ] Team sudah memahami DoD & quality gates

---

**Dokumen ini merupakan baseline final untuk testing strategy dan CI/CD pipeline Petora. Seluruh aturan, tools, dan workflow harus diimplementasikan sejak hari pertama pengembangan untuk menjamin kualitas dan konsistensi delivery. Setiap developer WAJIB mengikuti kontrak yang didefinisikan di sini untuk memastikan sistem yang aman, scalable, dan maintainable.** 🚀
