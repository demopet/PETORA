# Technical Specification — Frontend & UI/UX Baseline
## Petora — Sistem Manajemen Terpadu Petshop & Petcare
### Dokumen Baseline Final | 18 Agustus 2026

---

## Daftar Isi
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Design System Foundation](#2-design-system-foundation)
3. [Component Architecture](#3-component-architecture)
4. [Layout System](#4-layout-system)
5. [Navigation & Information Architecture](#5-navigation--information-architecture)
6. [Authentication UI](#6-authentication-ui)
7. [Staff Dashboard — Modul CRM & Pasien](#7-staff-dashboard--modul-crm--pasien)
8. [Staff Dashboard — Modul Petshop](#8-staff-dashboard--modul-petshop)
9. [Staff Dashboard — Modul POS & Billing](#9-staff-dashboard--modul-pos--billing)
10. [Staff Dashboard — Modul Engagement & Loyalty](#10-staff-dashboard--modul-engagement--loyalty)
11. [Staff Dashboard — Modul Keuangan & Operasional](#11-staff-dashboard--modul-keuangan--operasional)
12. [Customer Portal](#12-customer-portal)
13. [State Representations](#13-state-representations)
14. [Form Patterns](#14-form-patterns)
15. [Data Display Patterns](#15-data-display-patterns)
16. [Responsive Design](#16-responsive-design)
17. [Accessibility (a11y)](#17-accessibility-a11y)
18. [Animation & Motion](#18-animation--motion)
19. [Notification System](#19-notification-system)
20. [Keyboard Shortcuts](#20-keyboard-shortcuts)
21. [Performance & Loading Strategy](#21-performance--loading-strategy)
22. [File Structure & Naming](#22-file-structure--naming)

---

## 1. Ringkasan Eksekutif

Dokumen ini mendefinisikan **baseline UI/UX dan frontend** untuk Petora — acuan tunggal bagi designer dan developer untuk membangun antarmuka yang konsisten, accessible, dan efisien.

### Prinsip Desain
| Prinsip | Penjelasan |
|---|---|
| **Clarity over decoration** | Informasi jelas, tidak tersembunyi di balik dekorasi |
| **Speed is a feature** | POS & Admin harus cepat — minimal klik, keyboard-first |
| **Progressive disclosure** | Tampilkan yang penting dulu, detail saat dibutuhkan |
| **Forgiving by design** | Konfirmasi untuk aksi destruktif, undo untuk aksi kritis |
| **Consistent patterns** | Satu pola untuk satu jenis interaksi di seluruh aplikasi |
| **Mobile-first for Portal** | Portal customer dioptimalkan untuk HP |
| **Accessible to all** | WCAG 2.1 AA minimum |

### Dua Permukaan Aplikasi
| Permukaan | Path | Target User | Karakteristik |
|---|---|---|---|
| **Staff Dashboard** | `/app/*` | Owner, Admin, Dokter, Kasir | Desktop-first, sidebar navigation, data-dense |
| **Customer Portal** | `/portal/*` | Customer | Mobile-first, bottom nav, simple & friendly |

---

## 2. Design System Foundation

### 2.1 Design Tokens

#### 2.1.1 Color Palette

**Primary Brand** (Petora Blue — trust, professional, calming)
```css
--primary-50:   #EFF6FF
--primary-100:  #DBEAFE
--primary-200:  #BFDBFE
--primary-300:  #93C5FD
--primary-400:  #60A5FA
--primary-500:  #3B82F6  /* Main brand */
--primary-600:  #2563EB
--primary-700:  #1D4ED8
--primary-800:  #1E40AF
--primary-900:  #1E3A8A
```

**Semantic Colors**
```css
/* Success */
--success-500: #10B981  /* Paid, completed, active */
--success-600: #059669

/* Warning */
--warning-500: #F59E0B  /* Low stock, pending, due soon */
--warning-600: #D97706

/* Danger */
--danger-500: #EF4444   /* Overdue, cancelled, error, critical */
--danger-600: #DC2626

/* Info */
--info-500: #06B6D4     /* Informational, neutral action */
--info-600: #0891B2
```

**Neutral (Slate)**
```css
--slate-50:  #F8FAFC  /* Background */
--slate-100: #F1F5F9  /* Card background */
--slate-200: #E2E8F0  /* Borders */
--slate-300: #CBD5E1  /* Dividers */
--slate-400: #94A3B8  /* Disabled text */
--slate-500: #64748B  /* Secondary text */
--slate-600: #475569  /* Body text */
--slate-700: #334155  /* Headings */
--slate-800: #1E293B  /* Primary text */
--slate-900: #0F172A  /* Titles */
```

**Status Color Mapping**
| Status | Color | Usage |
|---|---|---|
| `PAID` / `DONE` / `ACTIVE` / `AVAILABLE` | Success (green) | Selesai, aktif, tersedia |
| `UNPAID` / `WAITING` / `BOOKED` / `PENDING` | Warning (amber) | Menunggu, dijadwalkan |
| `IN_PROGRESS` / `CHECKED_IN` / `OCCUPIED` | Primary (blue) | Sedang berlangsung |
| `CANCELLED` / `OVERDUE` / `ARCHIVED` | Danger (red) | Dibatalkan, lewat batas |
| `PARTIAL_PAYMENT` / `RESERVED` | Info (cyan) | Partial, reserved |

#### 2.1.2 Typography

**Font Family**: `Inter` (body) + `JetBrains Mono` (code/numbers)

**Type Scale**
| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `display-lg` | 30px | 36px | 700 | Page titles (Dashboard) |
| `display-md` | 24px | 32px | 700 | Section titles |
| `heading-lg` | 20px | 28px | 600 | Modal titles, card headers |
| `heading-md` | 18px | 24px | 600 | Sub-section |
| `heading-sm` | 16px | 24px | 600 | Table headers, labels |
| `body-lg` | 16px | 24px | 400 | Primary body |
| `body-md` | 14px | 20px | 400 | Default body |
| `body-sm` | 12px | 16px | 400 | Secondary, captions |
| `body-xs` | 11px | 14px | 400 | Badges, micro copy |
| `mono-md` | 14px | 20px | 400 | Numbers, codes, SKUs |

#### 2.1.3 Spacing Scale

Base unit: **4px**
```
--space-1:  4px    (tight)
--space-2:  8px
--space-3:  12px
--space-4:  16px   (default)
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

#### 2.1.4 Border Radius
```
--radius-sm:  4px   (badges, small chips)
--radius-md:  8px   (buttons, inputs, cards)
--radius-lg:  12px  (modals, large cards)
--radius-xl:  16px  (hero sections)
--radius-full: 9999px (avatars, pills)
```

#### 2.1.5 Elevation (Shadows)
```
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05)                    /* Inputs */
--shadow-sm:  0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)  /* Cards */
--shadow-md:  0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)  /* Dropdowns */
--shadow-lg:  0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05) /* Modals */
--shadow-xl:  0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04) /* Popovers */
```

#### 2.1.6 Breakpoints
```
--breakpoint-xs:  480px   (mobile portrait)
--breakpoint-sm:  640px   (mobile landscape)
--breakpoint-md:  768px   (tablet portrait)
--breakpoint-lg:  1024px  (tablet landscape / small laptop)
--breakpoint-xl:  1280px  (desktop)
--breakpoint-2xl: 1536px  (large desktop)
```

### 2.2 Dark Mode

Dark mode di-support via Tailwind `dark:` variant. Token override:
```css
.dark {
  --bg-primary: #0F172A;     /* slate-900 */
  --bg-secondary: #1E293B;   /* slate-800 */
  --bg-tertiary: #334155;    /* slate-700 */
  --text-primary: #F8FAFC;   /* slate-50 */
  --text-secondary: #CBD5E1; /* slate-300 */
  --border: #334155;         /* slate-700 */
}
```

Toggle disimpan di `localStorage` + respect `prefers-color-scheme`.

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Feature Components                            │
│  (CustomerTable, POSGrid, AppointmentCalendar, etc.)    │
└─────────────────────────────────────────────────────────┘
                            ▲
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Composite Components                          │
│  (DataTable, FormField, StatCard, StatusBadge, etc.)    │
└─────────────────────────────────────────────────────────┘
                            ▲
┌─────────────────────────────────────────────────────────┐
│  Layer 2: shadcn/ui Primitives                          │
│  (Button, Input, Dialog, Dropdown, Tabs, etc.)          │
└─────────────────────────────────────────────────────────┘
                            ▲
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Design Tokens                                 │
│  (colors, spacing, typography, shadows)                 │
└─────────────────────────────────────────────────────────┘
```

### 3.2 shadcn/ui Components yang Digunakan

| Component | Usage |
|---|---|
| `Button` | Primary actions, dengan variants: `default`, `secondary`, `outline`, `ghost`, `destructive` |
| `Input` | Text inputs, search fields |
| `Textarea` | Long text (notes, complaints) |
| `Select` | Dropdown pilihan tunggal |
| `Checkbox` | Multi-select, boolean flags |
| `RadioGroup` | Single choice dari beberapa opsi |
| `Switch` | Toggle on/off |
| `Dialog` | Modal konfirmasi, form create/edit |
| `Sheet` | Side panel untuk detail/edit |
| `Popover` | Tooltip-like content, date pickers |
| `DropdownMenu` | Action menus |
| `Tabs` | Tab navigation dalam halaman |
| `Accordion` | Collapsible sections |
| `Avatar` | User/pet photos |
| `Badge` | Status, tags, counts |
| `Card` | Container untuk konten |
| `Table` | Data display |
| `Pagination` | List pagination |
| `Toast` | Feedback notifications |
| `Alert` | Inline warnings/errors |
| `Skeleton` | Loading placeholders |
| `Separator` | Visual dividers |
| `Tooltip` | Hover hints |
| `Command` | Command palette (Cmd+K) |
| `Calendar` | Date picker |
| `Progress` | Progress bars |
| `ScrollArea` | Custom scrollable containers |

### 3.3 Custom Components

#### 3.3.1 StatusBadge
```tsx
<StatusBadge status="PAID" />        // Green pill
<StatusBadge status="WAITING" />     // Amber pill
<StatusBadge status="CANCELLED" />   // Red pill
<StatusBadge status="IN_PROGRESS" /> // Blue pill
```

#### 3.3.2 StatCard
```tsx
<StatCard
  title="Revenue Hari Ini"
  value="Rp 5.250.000"
  trend={{ value: 12.5, direction: 'up' }}
  icon={TrendingUp}
/>
```

#### 3.3.3 EmptyState
```tsx
<EmptyState
  icon={Package}
  title="Belum ada produk"
  description="Tambahkan produk pertama Anda untuk mulai berjualan"
  action={<Button>Tambah Produk</Button>}
/>
```

#### 3.3.4 SearchInput
```tsx
<SearchInput
  placeholder="Cari customer..."
  value={query}
  onChange={setQuery}
  shortcuts={['⌘K']}
/>
```

#### 3.3.5 DataTable (wrapper TanStack Table)
```tsx
<DataTable
  columns={columns}
  data={data}
  pagination
  sorting
  filtering
  rowActions={rowActions}
  emptyState={<EmptyState />}
/>
```

#### 3.3.6 FormField (wrapper React Hook Form + Zod)
```tsx
<FormField
  control={form.control}
  name="email"
  label="Email"
  description="Opsional, untuk notifikasi"
  render={({ field }) => <Input {...field} />}
/>
```

#### 3.3.7 ConfirmDialog
```tsx
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Hapus produk?"
  description="Produk ini sudah memiliki riwayat transaksi dan tidak bisa dikembalikan."
  confirmLabel="Hapus"
  variant="destructive"
  onConfirm={handleDelete}
/>
```

#### 3.3.8 NumericKeypad (untuk PIN input)
```tsx
<NumericKeypad
  length={6}
  value={pin}
  onChange={setPin}
  onSubmit={handleSubmit}
  mask
/>
```

#### 3.3.9 PetAvatar
```tsx
<PetAvatar
  name="Buddy"
  species="dog"
  photoUrl="/pets/buddy.jpg"
  size="md"  // sm | md | lg | xl
/>
```

#### 3.3.10 Timeline
```tsx
<Timeline
  items={[
    { date: '2026-08-18', title: 'Vaksin Rabies', description: '...' },
    { date: '2026-06-15', title: 'Steril', description: '...' },
  ]}
/>
```

### 3.4 Icon System

Library: **Lucide React** (konsisten dengan shadcn/ui)

Icon mapping untuk entitas:
| Entitas | Icon |
|---|---|
| Customer | `Users` |
| Pet | `PawPrint` |
| Appointment | `Calendar` |
| Medical Record | `FileText` / `Stethoscope` |
| Pet Hotel | `Home` / `Bed` |
| Grooming | `Scissors` |
| Product | `Package` |
| Inventory | `Warehouse` |
| POS | `ShoppingCart` |
| Invoice | `Receipt` |
| Loyalty | `Award` |
| Promotion | `Tag` |
| Expense | `Wallet` |
| Report | `BarChart3` |
| Settings | `Settings` |
| Notification | `Bell` |

---

## 4. Layout System

### 4.1 Staff Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  TopBar (h-16)                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [☰]  [🔍 Global Search ⌘K]           [🔔] [👤 Owner ▾] │   │
│  └─────────────────────────────────────────────────────────┘   │
├──────────┬──────────────────────────────────────────────────────┤
│ Sidebar  │  Main Content Area                                   │
│ (w-64)   │  ┌────────────────────────────────────────────────┐ │
│          │  │  Breadcrumb: Dashboard > Customers              │ │
│          │  ├────────────────────────────────────────────────┤ │
│          │  │  Page Header                                    │ │
│          │  │  [Title]              [+ Create] [Filter] [⋮]  │ │
│          │  ├────────────────────────────────────────────────┤ │
│          │  │                                                 │ │
│          │  │  Content                                        │ │
│          │  │  (Table / Cards / Form / Dashboard)             │ │
│          │  │                                                 │ │
│          │  │                                                 │ │
│          │  │                                                 │ │
│          │  │                                                 │ │
│          │  └────────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────────┘
```

**Sidebar Structure**:
```
┌────────────────────────┐
│  🐾 Petora             │
│  HaLand PetCare        │
├────────────────────────┤
│  📊 Dashboard          │
│                        │
│  CRM & PASIEN          │
│  ├ 👥 Customers        │
│  ├ 🐕 Pets             │
│  ├ 📅 Appointments     │
│  ├ 🩺 Medical Records  │
│  ├ 🏠 Pet Hotel        │
│  └ ✂️ Grooming         │
│                        │
│  PETSHOP               │
│  ├ 📦 Products         │
│  ├ 🏭 Inventory        │
│  └ 📋 Purchase Orders  │
│                        │
│  POS & BILLING         │
│  ├ 💳 POS              │
│  ├ 🧾 Invoices         │
│  └ 💰 Cash Shifts      │
│                        │
│  ENGAGEMENT            │
│  ├ 🏆 Loyalty          │
│  ├ 🎁 Promotions       │
│  └ ⭐ Feedback         │
│                        │
│  KEUANGAN              │
│  ├ 💸 Expenses         │
│  └ 📈 Reports          │
│                        │
│  ⚙️ Settings           │
├────────────────────────┤
│  [👤 Owner Name]       │
│  [🌙 Dark Mode Toggle] │
└────────────────────────┘
```

**Sidebar Behavior**:
- **Desktop (≥1024px)**: Fixed, collapsible (icon-only mode w-16)
- **Tablet (768-1023px)**: Collapsible, overlay on toggle
- **Mobile (<768px)**: Hidden, accessible via hamburger menu (slide-in drawer)

### 4.2 Customer Portal Layout

```
┌─────────────────────────────────────┐
│  TopBar (h-14)                      │
│  ┌───────────────────────────────┐  │
│  │ 🐾 Petora     [🔔] [👤]      │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│                                     │
│  Main Content                       │
│  (scrollable)                       │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  Bottom Navigation (h-16, sticky)   │
│  ┌───────────────────────────────┐  │
│  │ 🏠  📅  🛒  🎁  👤           │  │
│  │Home Appt Shop Loyalty Profile│  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Bottom Nav Items**:
| Icon | Label | Path |
|---|---|---|
| `Home` | Home | `/portal` |
| `Calendar` | Appointment | `/portal/appointments` |
| `ShoppingBag` | Shop | `/portal/shop` |
| `Award` | Rewards | `/portal/loyalty` |
| `User` | Profile | `/portal/profile` |

### 4.3 Common Layout Patterns

#### 4.3.1 List Page
```
┌──────────────────────────────────────────────────────┐
│  Page Header                                          │
│  [Title + Count]          [+ Create] [Export] [⋮]    │
├──────────────────────────────────────────────────────┤
│  Filter Bar                                           │
│  [🔍 Search] [Status ▾] [Date ▾] [+ More filters]   │
├──────────────────────────────────────────────────────┤
│  Bulk Actions (jika ada row selected)                 │
│  [2 selected] [✓ Archive] [✕ Delete]                  │
├──────────────────────────────────────────────────────┤
│  Data Table / Cards                                   │
│  ┌────────────────────────────────────────────────┐  │
│  │  [ ] │ Column 1 │ Column 2 │ Column 3 │ [⋮]  │  │
│  │  [ ] │ ...      │ ...      │ ...      │ [⋮]  │  │
│  └────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│  Pagination                                           │
│  Showing 1-20 of 156  [< 1 2 3 ... 8 >]             │
└──────────────────────────────────────────────────────┘
```

#### 4.3.2 Detail Page
```
┌──────────────────────────────────────────────────────┐
│  Breadcrumb: Customers > Ibu Wati                     │
├──────────────────────────────────────────────────────┤
│  Header                                               │
│  [Avatar]  Ibu Wati                                   │
│            +62 812-3456-7890                          │
│            wati@email.com                             │
│            [Edit] [⋮ More]                            │
├──────────────────────────────────────────────────────┤
│  Tabs: [Overview] [Pets] [Appointments] [Invoices]   │
├──────────────────────────────────────────────────────┤
│  Tab Content                                          │
│  (Data table / Cards / Timeline)                      │
└──────────────────────────────────────────────────────┘
```

#### 4.3.3 Form Page (Create/Edit)
```
┌──────────────────────────────────────────────────────┐
│  Breadcrumb: Customers > New Customer                 │
├──────────────────────────────────────────────────────┤
│  Header                                               │
│  ← Back    Tambah Customer Baru                       │
├──────────────────────────────────────────────────────┤
│  Form                                                 │
│  ┌────────────────────────────────────────────────┐  │
│  │  Informasi Dasar                                │  │
│  │  [Nama *] [Telepon] [Email]                     │  │
│  │  [Alamat __________________]                    │  │
│  ├────────────────────────────────────────────────┤  │
│  │  Akun Portal (opsional)                         │  │
│  │  [✓] Buat akun login portal                     │  │
│  │  [Username] [PIN]                               │  │
│  ├────────────────────────────────────────────────┤  │
│  │                    [Cancel] [Save]              │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

#### 4.3.4 Dashboard Page
```
┌──────────────────────────────────────────────────────┐
│  Header                                               │
│  Selamat pagi, Pak Budi 👋        [📅 Tue, 18 Aug]  │
├──────────────────────────────────────────────────────┤
│  Stats Grid (4 columns)                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Revenue  │ │Appoint. │ │Customers│ │Low Stock│   │
│  │Rp 5.2M  │ │  12     │ │  +3     │ │   8     │   │
│  │↑ 12.5%  │ │↑ 2      │ │↑ 3      │ │↓ 2      │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
├──────────────────────────────────────────────────────┤
│  Main Grid (2 columns)                                │
│  ┌──────────────────────┐ ┌──────────────────────┐  │
│  │ Appointments Today   │ │ Revenue Chart        │  │
│  │ (list)               │ │ (line chart)         │  │
│  └──────────────────────┘ └──────────────────────┘  │
│  ┌──────────────────────┐ ┌──────────────────────┐  │
│  │ Low Stock Alerts     │ │ Recent Activity      │  │
│  │ (list)               │ │ (timeline)           │  │
│  └──────────────────────┘ └──────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 5. Navigation & Information Architecture

### 5.1 Role-Based Menu Visibility

| Menu Item | Owner | Admin | Dokter | Kasir |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| **CRM & Pasien** | | | | |
| Customers | ✅ | ✅ | 👁️ | 👁️ |
| Pets | ✅ | ✅ | 👁️ | 👁️ |
| Appointments | ✅ | ✅ | ✅ | 👁️ |
| Medical Records | ✅ | ✅ | ✅ | ❌ |
| Pet Hotel | ✅ | ✅ | 👁️ | 👁️ |
| Grooming | ✅ | ✅ | 👁️ | 👁️ |
| **Petshop** | | | | |
| Products | ✅ | ✅ | ❌ | 👁️ |
| Inventory | ✅ | ✅ | ❌ | 👁️ |
| Purchase Orders | ✅ | ✅ | ❌ | ❌ |
| **POS & Billing** | | | | |
| POS | ✅ | ✅ | ❌ | ✅ |
| Invoices | ✅ | ✅ | ❌ | ✅ |
| Cash Shifts | ✅ | ✅ | ❌ | ✅ (own) |
| **Engagement** | | | | |
| Loyalty | ✅ | ✅ | ❌ | 👁️ |
| Promotions | ✅ | ✅ | ❌ | ❌ |
| Feedback | ✅ | ✅ | ❌ | ❌ |
| **Keuangan** | | | | |
| Expenses | ✅ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ⚠️ | ⚠️ |
| Settings | ✅ | ❌ | ❌ | ❌ |

Legend: ✅ = Full access, 👁️ = Read-only, ⚠️ = Limited, ❌ = Hidden

### 5.2 Dokter Menu (Simplified)
```
📊 Dashboard
📅 Appointments (own)
🩺 Medical Records (own write, all read)
🏠 Pet Hotel (read)
📈 Reports (limited: appointments, medical, activity own)
```

### 5.3 Kasir Menu (Simplified)
```
📊 Dashboard
💳 POS
🧾 Invoices
💰 Cash Shifts (own)
👥 Customers (read)
🐕 Pets (read)
📅 Appointments (read)
🏠 Pet Hotel (read)
✂️ Grooming (read)
📦 Products (read)
🏭 Inventory (read)
🏆 Loyalty (read)
```

### 5.4 Breadcrumb Structure

```
Dashboard
└── Customers
    └── [Customer Name]
        └── [Pet Name]
└── Appointments
    └── [Appointment ID]
└── Medical Records
    └── [Record Number]
└── Products
    └── [Product Name]
└── Invoices
    └── [Invoice Number]
└── Reports
    └── [Report Type]
└── Settings
    ├── Users
    ├── Configuration
    └── Audit Log
```

### 5.5 Global Search (⌘K)

Command palette yang bisa mencari:
- **Customers** by name/phone
- **Pets** by name
- **Products** by name/SKU/barcode
- **Invoices** by number
- **Appointments** by date/customer
- **Navigation** (menu items)
- **Actions** (Create customer, New appointment, etc.)

```
┌─────────────────────────────────────────────┐
│  🔍 Search...                               │
├─────────────────────────────────────────────┤
│  NAVIGATION                                 │
│  📊 Dashboard                               │
│  👥 Customers                               │
│  💳 POS                                      │
├─────────────────────────────────────────────┤
│  CUSTOMERS                                  │
│  👤 Ibu Wati         +62 812-3456-7890     │
│  👤 Pak Budi         +62 813-9876-5432     │
├─────────────────────────────────────────────┤
│  PRODUCTS                                   │
│  📦 Royal Canin Adult  SKU: RC-ADT-5KG     │
│  📦 Whiskas Cat Food   SKU: WH-CAT-1KG     │
├─────────────────────────────────────────────┤
│  ACTIONS                                    │
│  ➕ New Customer                            │
│  ➕ New Appointment                         │
│  ➕ New POS Transaction                     │
└─────────────────────────────────────────────┘
```

---

## 6. Authentication UI

### 6.1 Login Screen

**Layout**: Full-screen split (desktop) / Full-screen stacked (mobile)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌───────────────────────┐  ┌──────────────────────────┐ │
│   │                       │  │                          │ │
│   │   🐾 Petora           │  │  Selamat Datang          │ │
│   │                       │  │                          │ │
│   │   [Hero image/        │  │  Username                │ │
│   │    illustration]      │  │  [________________]      │ │
│   │                       │  │                          │ │
│   │   Sistem Manajemen    │  │  PIN                     │ │
│   │   Terpadu Petshop     │  │  [••••••] [👁️]          │ │
│   │   & Petcare           │  │                          │ │
│   │                       │  │  [🔐 Login]              │ │
│   │                       │  │                          │ │
│   │                       │  │  Lupa PIN? Hubungi admin │ │
│   │                       │  │                          │ │
│   └───────────────────────┘  └──────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- PIN input: numeric keypad, masked, toggle visibility
- Auto-focus username field
- Submit on Enter
- Loading state pada button saat submit
- Error message inline (bukan alert)
- Lockout message: "Akun terkunci. Coba lagi dalam X menit"

### 6.2 PIN Input Component

```tsx
<NumericKeypad
  length={6}
  value={pin}
  onChange={setPin}
  onSubmit={handleSubmit}
  mask
  showToggle
  error={error}
/>
```

**Visual**: 6 kotak terpisah, masing-masing menampilkan satu digit (atau • jika mask). Fokus otomatis pindah ke kotak berikutnya setelah input.

### 6.3 First Login Prompt

Setelah login pertama (flag `firstLogin = true`):
```
┌───────────────────────────────────────┐
│  Ganti PIN Anda                       │
│                                       │
│  Untuk keamanan, silakan ganti PIN    │
│  Anda sekarang.                       │
│                                       │
│  PIN Baru        [••••••]             │
│  Konfirmasi PIN  [••••••]             │
│                                       │
│  [Nanti] [Ganti PIN]                  │
└───────────────────────────────────────┘
```

### 6.4 Route Protection

```typescript
// Middleware pattern
<ProtectedRoute requiredRole={['OWNER', 'ADMIN']}>
  <SettingsPage />
</ProtectedRoute>

<PortalRoute>
  <CustomerPortal />
</PortalRoute>
```

**Behavior**:
- Unauthenticated → redirect ke `/login`
- Authenticated tapi wrong role → redirect ke home sesuai role
- Customer mencoba akses `/app/*` → redirect ke `/portal`
- Staff mencoba akses `/portal/*` → redirect ke `/app`

---

## 7. Staff Dashboard — Modul CRM & Pasien

### 7.1 Customers Module

#### 7.1.1 List View
```
┌──────────────────────────────────────────────────────────────┐
│  Customers                                    [+ Tambah] [⋮]│
│  234 pelanggan                                                │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Cari nama/telepon/email]  [Status ▾] [Tag ▾] [⚙️]     │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Avatar] Nama            Telepon          Tag    [⋮]  │ │
│  │ ─────────────────────────────────────────────────────  │ │
│  │ 👤     Ibu Wati         +62 812-3456...  VIP      [⋮] │ │
│  │ 👤     Pak Budi         +62 813-9876...  Regular  [⋮] │ │
│  │ 👤     Walk-in Guest    -                  Guest   [⋮] │ │
│  └────────────────────────────────────────────────────────┘ │
│  Showing 1-20 of 234  [< 1 2 3 ... 12 >]                   │
└──────────────────────────────────────────────────────────────┘
```

**Row Actions** ([⋮] dropdown):
- View Detail
- Edit
- Add Pet
- Create Appointment
- View Invoices
- Convert to Registered (jika guest)
- Deactivate

#### 7.1.2 Detail View
```
┌──────────────────────────────────────────────────────────────┐
│  ← Customers    Ibu Wati                                     │
├──────────────────────────────────────────────────────────────┤
│  ┌────────┐                                                  │
│  │ Avatar │  Ibu Wati                    [Edit] [⋮]         │
│  │  (xl)  │  📱 +62 812-3456-7890                           │
│  └────────┘  ✉️ wati@email.com                              │
│              🏠 Jl. Merdeka No. 10                          │
│              🏆 Gold Member • 2,450 points                  │
│              🏷️ VIP                                         │
├──────────────────────────────────────────────────────────────┤
│  [Overview] [🐕 Pets 3] [📅 Appointments] [🧾 Invoices]    │
├──────────────────────────────────────────────────────────────┤
│  Overview Tab:                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Quick Stats                                          │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │   │
│  │  │  12  │ │  8   │ │  3   │ │ Rp   │                │   │
│  │  │Visit │ │Appmt │ │ Pets │ │ 2.5M │                │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘                │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Recent Activity                                      │   │
│  │  📅 18 Aug - Appointment (Buddy) - DONE              │   │
│  │  💳 15 Aug - Invoice INV-20260815-0012 - PAID        │   │
│  │  ✂️ 10 Aug - Grooming (Mimi) - DONE                  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

#### 7.1.3 Create/Edit Form (Sheet/Dialog)
```
┌──────────────────────────────────────────┐
│  Tambah Customer Baru               [✕] │
├──────────────────────────────────────────┤
│  Informasi Dasar                          │
│  Nama *            [________________]    │
│  Telepon           [________________]    │
│  Email             [________________]    │
│  Alamat            [________________]    │
│  Kontak Darurat    [________________]    │
│  Foto              [📷 Upload]           │
│  Catatan           [________________]    │
│  Tag               [VIP ▾] [Regular ▾]   │
├──────────────────────────────────────────┤
│  ☐ Buat akun login portal                │
│  ┌────────────────────────────────────┐ │
│  │ Username  [____________]           │ │
│  │ PIN       [____________] [🎲]      │ │
│  └────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│                 [Batal] [Simpan]         │
└──────────────────────────────────────────┘
```

### 7.2 Pets Module

#### 7.2.1 List View (Grid or List toggle)
```
┌──────────────────────────────────────────────────────────────┐
│  Pets                                         [+ Tambah] [⋮]│
│  189 hewan terdaftar                                         │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Cari nama/spesies/ras] [Spesies ▾] [Customer ▾] [📋≡] │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 🐕       │ │ 🐈       │ │ 🐕       │ │ 🐈       │       │
│  │ Buddy    │ │ Mimi     │ │ Rex      │ │ Luna     │       │
│  │ Golden   │ │ Persia   │ │ Husky    │ │ Anggora  │       │
│  │ ♂ 3 th   │ │ ♀ 2 th   │ │ ♂ 5 th   │ │ ♀ 1 th   │       │
│  │          │ │          │ │          │ │          │       │
│  │ Ibu Wati │ │ Ibu Wati │ │ Pak Budi │ │ Pak Budi │       │
│  │ [View]   │ │ [View]   │ │ [View]   │ │ [View]   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└──────────────────────────────────────────────────────────────┘
```

#### 7.2.2 Detail View (5 Tabs)
```
┌──────────────────────────────────────────────────────────────┐
│  ← Pets    Buddy                                              │
├──────────────────────────────────────────────────────────────┤
│  ┌────────┐                                                  │
│  │  🐕    │  Buddy                       [Edit] [🆔 ID] [⋮]│
│  │ Avatar │  Golden Retriever • ♂ • 3 tahun                │
│  └────────┘  Microchip: 985112345678901                     │
│              Owner: Ibu Wati                                 │
├──────────────────────────────────────────────────────────────┤
│  [Overview] [⚖️ Weight] [💉 Vaccines] [🩺 Medical] [🆔 ID] │
├──────────────────────────────────────────────────────────────┤
│  Overview Tab:                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Berat Terakhir: 28.5 kg (15 Aug 2026)               │   │
│  │  Alergi: Chicken, Beef                                │   │
│  │  Penyakit: Gastroenteritis (2025)                     │   │
│  │  Vaksinasi:                                           │   │
│  │    ✅ Rabies (10 Jan 2026) - Next: 10 Jan 2027       │   │
│  │    ⚠️ DHPP (15 Feb 2025) - OVERDUE                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Weight Tab:                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [Line chart: berat vs waktu]                        │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ 30kg ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─      │   │   │
│  │  │ 28kg ─ ─ ─ ─ ● ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─      │   │   │
│  │  │ 26kg ─ ─ ─ ─ ─ ─ ─ ● ─ ─ ─ ─ ─ ─ ─ ─      │   │   │
│  │  │ 24kg ─ ─ ● ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─      │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  [+ Tambah Entry]                                   │   │
│  │  Tanggal       │ Berat                              │   │
│  │  15 Aug 2026   │ 28.5 kg                            │   │
│  │  10 May 2026   │ 27.8 kg                            │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

#### 7.2.3 Digital Pet ID Card
```
┌──────────────────────────────────────────┐
│  🐾 PETORA — Digital Pet ID              │
├──────────────────────────────────────────┤
│  ┌────────┐                              │
│  │  🐕    │  Buddy                       │
│  │ Avatar │  Golden Retriever • ♂        │
│  └────────┘  Born: 15 Mar 2023           │
│              Microchip: 985112345678901  │
│                                          │
│  Owner: Ibu Wati                         │
│  Phone: +62 812-3456-7890                │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │                                  │   │
│  │         [QR Code]                │   │
│  │                                  │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ID: PET-20260818-0042                   │
│  [📥 Download] [🖨️ Print]               │
└──────────────────────────────────────────┘
```

### 7.3 Appointments Module

#### 7.3.1 List View (dengan toggle Calendar)
```
┌──────────────────────────────────────────────────────────────┐
│  Appointments                                 [+ Baru] [⋮]  │
│  Selasa, 18 Agustus 2026                                     │
├──────────────────────────────────────────────────────────────┤
│  [📋 List] [📅 Calendar]  [🔍] [Dokter ▾] [Status ▾] [📆] │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │ # │ Waktu  │ Customer │ Pet    │ Dokter    │ Status   │ │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │ │
│  │ 1 │ 09:00  │ Ibu Wati │ Buddy  │ drg. Rina │ 🟢 DONE  │ │
│  │ 2 │ 09:30  │ Pak Budi │ Rex    │ drg. Rina │ 🔵 PROG  │ │
│  │ 3 │ 10:00  │ Bu Ani   │ Luna   │ drg. Andi │ 🟡 WAIT  │ │
│  │ 4 │ 10:30  │ Pak Joko │ Max    │ drg. Andi │ 🟡 WAIT  │ │
│  │ 5 │ 11:00  │ Walk-in  │ (new)  │ -         │ 🟡 WAIT  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

#### 7.3.2 Calendar View
```
┌──────────────────────────────────────────────────────────────┐
│  [◀ Agustus 2026 ▶]      [Hari] [Minggu] [Bulan]           │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │  drg. Rina                                            │   │
│  │  ┌────┬────┬────┬────┬────┬────┬────┐               │   │
│  │  │ 09 │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │               │   │
│  │  │ ●  │ ●  │    │ ●  │ ●  │    │    │               │   │
│  │  │ ●  │    │    │    │ ●  │    │    │               │   │
│  │  │    │    │    │    │    │    │    │               │   │
│  │  └────┴────┴────┴────┴────┴────┴────┘               │   │
│  │  drg. Andi                                            │   │
│  │  ┌────┬────┬────┬────┬────┬────┬────┐               │   │
│  │  │ 09 │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │               │   │
│  │  │    │ ●  │ ●  │    │    │ ●  │    │               │   │
│  │  │    │ ●  │    │    │    │    │    │               │   │
│  │  └────┴────┴────┴────┴────┴────┴────┘               │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

#### 7.3.3 Create Appointment Form (Sheet)
```
┌──────────────────────────────────────────┐
│  Buat Appointment Baru              [✕] │
├──────────────────────────────────────────┤
│  Customer *        [🔍 Pilih customer ▾] │
│  Pet *             [🔍 Pilih pet ▾]      │
│  Dokter            [Pilih dokter ▾]      │
│  Tanggal *         [📅 18 Aug 2026]      │
│  Jam *             [🕐 10:00 ▾]          │
│  Keluhan           [________________]    │
│                    [________________]    │
│  Catatan           [________________]    │
├──────────────────────────────────────────┤
│  📋 Antrian: #6 (estimasi tunggu 30 mnt) │
├──────────────────────────────────────────┤
│                 [Batal] [Buat Appointment]│
└──────────────────────────────────────────┘
```

### 7.4 Medical Records Module

#### 7.4.1 List View
```
┌──────────────────────────────────────────────────────────────┐
│  Medical Records                              [+ Baru] [⋮]  │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Cari no rekam/customer/pet]                            │
│  [Status ▾] [Dokter ▾] [Tanggal ▾]                          │
├──────────────────────────────────────────────────────────────┤
│  No Rekam       │ Tgl       │ Customer │ Pet   │ Dx   │ [⋮]│
│  ──────────────────────────────────────────────────────────  │
│  MR-20260818-01 │ 18 Aug    │ Ibu Wati │ Buddy │ ...  │ [⋮]│
│  MR-20260817-03 │ 17 Aug    │ Pak Budi │ Rex   │ ...  │ [⋮]│
│  MR-20260817-02 │ 17 Aug    │ Bu Ani   │ Luna  │ ...  │ [⋮]│
└──────────────────────────────────────────────────────────────┘
```

#### 7.4.2 Create/Edit Form (Full Page)
```
┌──────────────────────────────────────────────────────────────┐
│  ← Medical Records    MR-20260818-01 (New)                   │
├──────────────────────────────────────────────────────────────┤
│  Appointment *   [🔍 Pilih appointment ▾]                    │
│  (auto-fill: Customer, Pet, Dokter)                          │
├──────────────────────────────────────────────────────────────┤
│  Anamnesis                                                    │
│  Keluhan Utama     [________________]                        │
│  Riwayat Penyakit  [________________]                        │
├──────────────────────────────────────────────────────────────┤
│  Pemeriksaan Fisik                                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────┐ │
│  │ Berat (kg) │ │ Suhu (°C)  │ │ HR (bpm)   │ │ RR(bpm) │ │
│  │ [28.5    ] │ │ [38.5    ] │ │ [80      ] │ │ [20    ] │ │
│  └────────────┘ └────────────┘ └────────────┘ └─────────┘ │
│  Deskripsi Pemeriksaan                                      │
│  [________________]                                          │
│  [________________]                                          │
├──────────────────────────────────────────────────────────────┤
│  Diagnosis & Treatment                                        │
│  Diagnosis         [________________]                        │
│  Treatment         [________________]                        │
│  Resep             [________________]                        │
│  Hasil Lab         [________________]  [+ Upload]            │
│  Catatan Tambahan  [________________]                        │
├──────────────────────────────────────────────────────────────┤
│  Lampiran                                                     │
│  [📷 Upload Foto] [📄 Upload File]                           │
│  [thumb1.jpg ✕] [lab-result.pdf ✕]                           │
├──────────────────────────────────────────────────────────────┤
│  Status: [OPEN ▾]                                            │
├──────────────────────────────────────────────────────────────┤
│                                  [Batal] [Simpan Rekam Medis]│
└──────────────────────────────────────────────────────────────┘
```

### 7.5 Pet Hotel Module

#### 7.5.1 Room Dashboard (Visual Board)
```
┌──────────────────────────────────────────────────────────────┐
│  Pet Hotel Rooms                               [+ Room] [⋮] │
│  Okupansi: 8/12 kamar (67%)                                  │
├──────────────────────────────────────────────────────────────┤
│  Filter: [Semua] [Standard] [Deluxe] [VIP] [Large]           │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 🟢 A-01  │ │ 🔵 A-02  │ │ 🟢 A-03  │ │ 🟢 A-04  │       │
│  │ Standard │ │ Buddy    │ │ Standard │ │ Standard │       │
│  │ Clean    │ │ s/d 20   │ │ Clean    │ │ Clean    │       │
│  │          │ │ Ibu Wati │ │          │ │          │       │
│  │ [Book]   │ │ [View]   │ │ [Book]   │ │ [Book]   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 🔵 B-01  │ │ 🔴 B-02  │ │ 🟡 B-03  │ │ 🟢 B-04  │       │
│  │ Deluxe   │ │ Mimi     │ │ Deluxe   │ │ Deluxe   │       │
│  │ Occup.   │ │ s/d 22   │ │ Maintain │ │ Clean    │       │
│  │          │ │ Pak Budi │ │          │ │          │       │
│  │ [View]   │ │ [View]   │ │ [Edit]   │ │ [Book]   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  Legend: 🟢 Available  🔵 Occupied  🔴 Maintenance  🟡 Dirty│
└──────────────────────────────────────────────────────────────┘
```

#### 7.5.2 Booking Detail (Sheet)
```
┌──────────────────────────────────────────┐
│  Booking BK-20260818-001          [✕]   │
├──────────────────────────────────────────┤
│  🐕 Buddy (Ibu Wati)                     │
│  Kamar A-02 (Deluxe)                     │
│  15 Aug → 20 Aug 2026 (5 malam)          │
│  Rp 750.000/malam × 5 = Rp 3.750.000    │
├──────────────────────────────────────────┤
│  Status: 🔵 CHECKED_IN                   │
│  Check-in: 15 Aug 2026, 14:30            │
│  Check-out rencana: 20 Aug 2026          │
├──────────────────────────────────────────┤
│  Catatan Harian                          │
│  ┌────────────────────────────────────┐ │
│  │ 18 Aug, 08:00 🍖 FEEDING           │ │
│  │ Royal Canin 200g, habis semua      │ │
│  │ [📷 photo.jpg]                     │ │
│  ├────────────────────────────────────┤ │
│  │ 18 Aug, 09:00 💊 MEDICINE          │ │
│  │ Antibiotik 1 tablet                │ │
│  ├────────────────────────────────────┤ │
│  │ 17 Aug, 20:00 📝 NOTE              │ │
│  │ Tidur nyenyak, nafsu makan baik    │ │
│  └────────────────────────────────────┘ │
│  [+ Tambah Catatan]                     │
├──────────────────────────────────────────┤
│  [Perpanjang] [Check-Out] [⋮]           │
└──────────────────────────────────────────┘
```

### 7.6 Grooming Module

#### 7.6.1 List View
```
┌──────────────────────────────────────────────────────────────┐
│  Grooming Bookings                            [+ Baru] [⋮]  │
├──────────────────────────────────────────────────────────────┤
│  [📋 List] [📅 Calendar]  [🔍] [Groomer ▾] [Status ▾]      │
├──────────────────────────────────────────────────────────────┤
│  No        │ Tgl     │ Pet    │ Paket  │ Groomer │ Status   │
│  ──────────────────────────────────────────────────────────  │
│  GR-...-01 │ 18 Aug  │ Mimi   │ Full   │ Rudi    │ 🔵 PROG  │
│  GR-...-02 │ 18 Aug  │ Luna   │ Basic  │ Sari    │ 🟡 BOOK  │
│  GR-...-03 │ 18 Aug  │ Coco   │ Prem.  │ Rudi    │ 🟢 DONE  │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Staff Dashboard — Modul Petshop

### 8.1 Products Module

#### 8.1.1 List View
```
┌──────────────────────────────────────────────────────────────┐
│  Products                                     [+ Produk] [⋮]│
├──────────────────────────────────────────────────────────────┤
│  [🔍 Cari nama/SKU/barcode]                                 │
│  [Kategori ▾] [Status ▾] [Stock ▾] [Supplier ▾]            │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Img] │ SKU        │ Nama              │ Stock │ [⋮]  │ │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │ │
│  │ [📦]  │ RC-ADT-5KG │ Royal Canin Adult │  12   │ [⋮]  │ │
│  │       │            │ 5kg               │ 🟢    │      │ │
│  │ [📦]  │ WH-CAT-1KG │ Whiskas Cat 1kg   │   3   │ [⋮]  │ │
│  │       │            │                   │ 🔴Low │      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Stock indicator**:
- 🟢 Normal (stock > minimum)
- 🟡 Warning (stock ≤ minimum)
- 🔴 Low (stock = 0 atau sangat rendah)

### 8.2 Inventory Module

#### 8.2.1 Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  Inventory Dashboard                           [Stock Opname]│
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Total    │ │ Nilai    │ │ Low      │ │ Over     │       │
│  │ Produk   │ │ Stok     │ │ Stock    │ │ Stock    │       │
│  │   234    │ │ Rp 45M   │ │   8      │ │   3      │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├──────────────────────────────────────────────────────────────┤
│  ⚠️ Low Stock Alerts (8 produk)                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📦 Whiskas Cat 1kg    Stock: 3   Min: 10            │   │
│  │ 📦 Pedigree Adult     Stock: 0   Min: 5             │   │
│  │ 📦 Shampoo Hartz      Stock: 2   Min: 8             │   │
│  │ ... dan 5 lainnya     [Lihat Semua →]                │   │
│  └──────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│  📦 Saran Reorder (berdasarkan penjualan rata-rata)         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📦 Whiskas Cat 1kg    Saran: 20 pcs                  │   │
│  │ 📦 Pedigree Adult     Saran: 15 pcs                  │   │
│  │ [+ Buat Purchase Order]                              │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 8.3 Purchase Orders Module

```
┌──────────────────────────────────────────────────────────────┐
│  Purchase Orders                              [+ PO Baru]   │
├──────────────────────────────────────────────────────────────┤
│  PO Number   │ Supplier   │ Tgl Order │ Total    │ Status   │
│  ──────────────────────────────────────────────────────────  │
│  PO-...-001  │ PT PetFood │ 15 Aug    │ Rp 5.2M  │ 🟢 RCV  │
│  PO-...-002  │ CV Animal  │ 17 Aug    │ Rp 3.1M  │ 🔵 SENT │
│  PO-...-003  │ PT PetFood │ 18 Aug    │ Rp 2.5M  │ 🟡 DRFT │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Staff Dashboard — Modul POS & Billing

### 9.1 POS Dashboard (Kasir)

**Layout khusus — 2 kolom (produk grid + cart)**

```
┌──────────────────────────────────────────────────────────────┐
│  💳 POS                     [🔍 Scan/🔎] [⏸️ Hold] [⚙️]     │
├────────────────────────────────┬─────────────────────────────┤
│  Products                      │  Cart                       │
│  ┌──────────────────────────┐  │  Customer:                  │
│  │ [🔍 Cari produk...]      │  │  [🔍 Pilih customer ▾]     │
│  ├──────────────────────────┤  │  atau [+ Walk-in]           │
│  │ [Semua] [Makanan] [Min.] │  ├─────────────────────────────┤
│  │ [Snack] [Obat] [Lain]    │  │  📦 Royal Canin Adult 5kg  │
│  ├──────────────────────────┤  │     Rp 450.000 × 1          │
│  │ ┌──────┐ ┌──────┐ ┌────┐│  │     [−] 1 [+]  [🗑️]        │
│  │ │ 📦   │ │ 📦   │ │ 📦 ││  │     = Rp 450.000            │
│  │ │RC 5kg│ │WH 1kg│ │PD  ││  ├─────────────────────────────┤
│  │ │450rb │ │ 35rb │ │25rb││  │  📦 Whiskas Cat 1kg        │
│  │ │St:12 │ │St:3 ⚠│ │St:5││  │     Rp 35.000 × 2           │
│  │ └──────┘ └──────┘ └────┘│  │     [−] 2 [+]  [🗑️]        │
│  │ ┌──────┐ ┌──────┐ ┌────┐│  │     = Rp 70.000             │
│  │ │ 📦   │ │ 📦   │ │ 📦 ││  ├─────────────────────────────┤
│  │ │ ...  │ │ ...  │ │ ...││  │  Subtotal       Rp 520.000  │
│  │ └──────┘ └──────┘ └────┘│  │  Diskon (10%)   -Rp 52.000  │
│  │                          │  │  Pajak           +Rp   0    │
│  │                          │  │  ─────────────────────────  │
│  │                          │  │  TOTAL          Rp 468.000  │
│  │                          │  ├─────────────────────────────┤
│  │                          │  │  🎁 Promo: [______][Apply] │
│  │                          │  │  🏆 Poin: 46 pts akan didapat│
│  │                          │  ├─────────────────────────────┤
│  │                          │  │  Metode Bayar:              │
│  │                          │  │  [💵 Cash] [💳 Non-Cash]    │
│  │                          │  │  [🔀 Mixed]                 │
│  │                          │  ├─────────────────────────────┤
│  │                          │  │  Bayar: [Rp 500.000]        │
│  │                          │  │  Kembalian: Rp 32.000       │
│  │                          │  │                             │
│  │                          │  │  [🖨️ Cetak] [💰 Bayar]     │
│  └──────────────────────────┘  └─────────────────────────────┘
└────────────────────────────────┴─────────────────────────────┘
```

**POS Features**:
- **Keyboard shortcuts**:
  - `F1` - Focus search
  - `F2` - New transaction
  - `F3` - Hold transaction
  - `F4` - Recall held transaction
  - `F9` - Payment
  - `F12` - Complete transaction
  - `Esc` - Cancel / close modal
- **Barcode scanner**: auto-focus input, scan → add to cart
- **Low stock warning**: badge merah di product card
- **Quick customer**: tambah customer baru inline
- **Hold transaction**: simpan cart, lanjutkan nanti (max 5 held)

### 9.2 Invoices Module

```
┌──────────────────────────────────────────────────────────────┐
│  Invoices                                     [Export] [⋮]  │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Cari no invoice/customer]                              │
│  [Status ▾] [Tipe ▾] [Tanggal ▾] [Kasir ▾]                 │
├──────────────────────────────────────────────────────────────┤
│  No Invoice     │ Customer │ Tipe     │ Total    │ Status   │
│  ──────────────────────────────────────────────────────────  │
│  INV-...-001    │ Ibu Wati │ CLINICAL │ Rp 250K  │ 🟢 PAID  │
│  INV-...-002    │ Pak Budi │ POS      │ Rp 120K  │ 🟡 PART  │
│  INV-...-003    │ Bu Ani   │ MIXED    │ Rp 450K  │ 🔴 UNPD  │
│  INV-...-004    │ Walk-in  │ POS      │ Rp 35K   │ ⚫ CNCL  │
└──────────────────────────────────────────────────────────────┘
```

#### 9.2.1 Invoice Detail (Sheet)
```
┌──────────────────────────────────────────┐
│  INV-20260818-0001                 [✕]  │
├──────────────────────────────────────────┤
│  🧾 Invoice Klinis                       │
│  Customer: Ibu Wati                      │
│  Tanggal: 18 Aug 2026, 10:30             │
│  Kasir: Sinta                            │
├──────────────────────────────────────────┤
│  Items:                                  │
│  Konsultasi drg. Rina      Rp 100.000   │
│  Vaksin Rabies              Rp  75.000   │
│  Obat (Antibiotik 7 hari)  Rp  50.000   │
│  ─────────────────────────────────────  │
│  Subtotal                  Rp 225.000   │
│  Diskon (10%)              -Rp  22.500  │
│  Pajak                     +Rp      0   │
│  ─────────────────────────────────────  │
│  Total                     Rp 202.500   │
│  Dibayar                   Rp 202.500   │
│  ─────────────────────────────────────  │
│  Sisa                      Rp       0   │
├──────────────────────────────────────────┤
│  Status: 🟢 PAID                         │
│  Pembayaran:                             │
│  • Cash Rp 202.500 (18 Aug, 10:35)      │
├──────────────────────────────────────────┤
│  🏆 Poin didapat: 20                    │
├──────────────────────────────────────────┤
│  [🖨️ Cetak] [💳 Bayar] [⋮]             │
└──────────────────────────────────────────┘
```

### 9.3 Cash Shifts Module

```
┌──────────────────────────────────────────────────────────────┐
│  Cash Shifts                                    [+ Buka]    │
├──────────────────────────────────────────────────────────────┤
│  Shift Aktif: Sinta — 18 Aug 2026, 08:00                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Modal Awal:      Rp 500.000                         │   │
│  │  Transaksi Cash:  Rp 3.250.000 (12 trx)             │   │
│  │  Transaksi Non-Cash: Rp 2.000.000 (8 trx)           │   │
│  │  ──────────────────────────────────────              │   │
│  │  Expected Cash:   Rp 3.750.000                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Riwayat Shift                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Tgl      │ Kasir  │ Open   │ Close  │ Diff   │ [⋮]  │   │
│  │ 17 Aug   │ Sinta  │ 500K   │ 4.2M   │ +50K   │ [⋮]  │   │
│  │ 17 Aug   │ Toni   │ 500K   │ 2.8M   │ -20K   │ [⋮]  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Staff Dashboard — Modul Engagement & Loyalty

### 10.1 Loyalty Module

#### 10.1.1 Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  Loyalty Program                                             │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Members  │ │ Points   │ │ Tier     │ │ Redemp.  │       │
│  │   156    │ │ 45.2K    │ │ Distrib. │ │ This Mo. │       │
│  │          │ │ issued   │ │          │ │   23     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├──────────────────────────────────────────────────────────────┤
│  Tier Distribution                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🥉 Bronze    ████████████████░░░░  80 members       │   │
│  │  🥈 Silver    ██████████░░░░░░░░░░  50 members       │   │
│  │  🥇 Gold      ████░░░░░░░░░░░░░░░░  20 members       │   │
│  │  💎 Platinum  █░░░░░░░░░░░░░░░░░░░   6 members       │   │
│  └──────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│  Top Members                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 👤 Ibu Wati     💎 Platinum   12,450 pts  [View]    │   │
│  │ 👤 Pak Budi     🥇 Gold        8,230 pts  [View]    │   │
│  │ 👤 Bu Ani       🥈 Silver      4,120 pts  [View]    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

#### 10.1.2 Member Detail
```
┌──────────────────────────────────────────────────────────────┐
│  ← Loyalty    Ibu Wati                                        │
├──────────────────────────────────────────────────────────────┤
│  👤 Ibu Wati                                                   │
│  💎 Platinum Member • Sejak Jan 2025                          │
│  Total Spending: Rp 12.500.000                                │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ Available│ │ Total    │ │ Next     │                     │
│  │  2,450   │ │  12,450  │ │ Tier     │                     │
│  │  points  │ │  points  │ │ (max)    │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
├──────────────────────────────────────────────────────────────┤
│  Riwayat Transaksi Poin                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Tgl       │ Tipe   │ Poin │ Keterangan        │ Inv  │   │
│  │ 18 Aug    │ EARN   │ +20  │ INV-...-001       │ [→]  │   │
│  │ 15 Aug    │ REDEEM │ -100 │ Diskon Rp 10.000  │ [→]  │   │
│  │ 10 Aug    │ EARN   │ +45  │ INV-...-003       │ [→]  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 10.2 Promotions Module

```
┌──────────────────────────────────────────────────────────────┐
│  Promotions                                  [+ Promo Baru] │
├──────────────────────────────────────────────────────────────┤
│  Kode      │ Nama              │ Tipe    │ Berlaku   │ Status│
│  ──────────────────────────────────────────────────────────  │
│  DISKON10  │ Diskon 10%        │ %       │ s/d 30Aug │ 🟢   │
│  HEMAT50K  │ Potongan 50K      │ Fixed   │ s/d 25Aug │ 🟢   │
│  BUNDLE1   │ Paket Anak Anjing │ Bundle  │ s/d 31Aug │ 🟢   │
│  BDAY2026  │ Birthday Special  │ Bday    │ Always    │ 🟢   │
│  XMAS25    │ Christmas Sale    │ %       │ 1-31 Dec  │ ⚪   │
└──────────────────────────────────────────────────────────────┘
```

### 10.3 Feedback Module

```
┌──────────────────────────────────────────────────────────────┐
│  Customer Feedback                                           │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Rating   │ │ Total    │ │ NPS      │ │ Response │       │
│  │ Avg      │ │ Feedback │ │ Score    │ │ Rate     │       │
│  │ ⭐ 4.6   │ │   234    │ │   +42    │ │  68%     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├──────────────────────────────────────────────────────────────┤
│  Feedback Terbaru                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ⭐⭐⭐⭐⭐  Ibu Wati — 18 Aug                         │   │
│  │ "Pelayanan sangat ramah, dokternya sabar menjelaskan"│   │
│  │ [View Invoice] [Reply]                               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ ⭐⭐⭐⭐    Pak Budi — 17 Aug                         │   │
│  │ "Cukup puas, tapi waktu tunggu agak lama"            │   │
│  │ [View Invoice] [Reply]                               │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Staff Dashboard — Modul Keuangan & Operasional

### 11.1 Expenses Module

```
┌──────────────────────────────────────────────────────────────┐
│  Expenses                                    [+ Expense] [⋮]│
├──────────────────────────────────────────────────────────────┤
│  [🔍 Cari] [Kategori ▾] [Status ▾] [Bulan ▾]               │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Bulan Ini│ │ Pending  │ │ Approved │ │ Rejected │       │
│  │ Rp 8.5M  │ │   3      │ │   12     │ │   1      │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├──────────────────────────────────────────────────────────────┤
│  Tanggal    │ Kategori │ Nominal   │ Status   │ [⋮]         │
│  ──────────────────────────────────────────────────────────  │
│  18 Aug     │ Listrik  │ Rp 1.2M   │ 🟡 PNDG │ [⋮]         │
│  15 Aug     │ Gaji     │ Rp 5.0M   │ 🟢 APRV │ [⋮]         │
│  10 Aug     │ Marketing│ Rp 800K   │ 🔴 RJCT │ [⋮]         │
└──────────────────────────────────────────────────────────────┘
```

### 11.2 Reports Module

```
┌──────────────────────────────────────────────────────────────┐
│  Reports                                                     │
├──────────────────────────────────────────────────────────────┤
│  Pilih Laporan:                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📊 Revenue          📅 Appointments                 │   │
│  │  💰 Profit & Loss    🩺 Medical Records              │   │
│  │  👥 Customers        🐕 Pets                         │   │
│  │  📦 Inventory        📦 Products                     │   │
│  │  💳 POS              🧾 Invoices                     │   │
│  │  🏠 Pet Hotel        ✂️ Grooming                     │   │
│  │  🏆 Loyalty          💸 Expenses                     │   │
│  │  📋 Activity         🔒 Audit Log                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

#### 11.2.1 Report View (Revenue Example)
```
┌──────────────────────────────────────────────────────────────┐
│  ← Reports    Revenue Report                                  │
├──────────────────────────────────────────────────────────────┤
│  Filter: [📅 1 Aug - 31 Aug 2026] [Group: Month ▾]         │
│  [📥 Export CSV] [📥 Export PDF] [🖨️ Print]                 │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Total    │ │ POS      │ │ Clinical │ │ Pet Hotel│       │
│  │ Revenue  │ │ Revenue  │ │ Revenue  │ │ Revenue  │       │
│  │ Rp 45.2M │ │ Rp 22.5M │ │ Rp 15.2M │ │ Rp 7.5M  │       │
│  │ ↑ 12.5%  │ │ ↑ 8.2%   │ │ ↑ 15.1%  │ │ ↑ 20.3%  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├──────────────────────────────────────────────────────────────┤
│  Revenue Trend                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [Line chart: daily revenue, multi-line by source]   │   │
│  └──────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│  Breakdown by Week                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Week │ POS     │ Clinical│ Pet Hotel│ Grooming│ Total │   │
│  │ W1   │ 5.2M    │ 3.8M    │ 1.8M     │ 0.8M    │ 11.6M │   │
│  │ W2   │ 5.8M    │ 4.2M    │ 2.0M     │ 1.0M    │ 13.0M │   │
│  │ W3   │ 6.1M    │ 3.9M    │ 1.9M     │ 0.9M    │ 12.8M │   │
│  │ W4   │ 5.4M    │ 3.3M    │ 1.8M     │ 0.7M    │ 11.2M │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 11.3 Settings Module

```
┌──────────────────────────────────────────────────────────────┐
│  Settings                                                    │
├──────────┬───────────────────────────────────────────────────┤
│  Users   │  Konfigurasi Sistem                               │
│  Clinic  │  ┌────────────────────────────────────────────┐  │
│  Number  │  │  Nama Klinik                                │  │
│  PIN     │  │  [HaLand PetCare ________________________] │  │
│  Loyalty │  │                                              │  │
│  Tax     │  │  Logo                                        │  │
│  Backup  │  │  [📷 Upload Logo]  [current-logo.png]      │  │
│  Audit   │  │                                              │  │
│  Integr. │  │  Alamat                                      │  │
│          │  │  [Jl. Merdeka No. 10, Jakarta ____________] │  │
│          │  │                                              │  │
│          │  │  Jam Operasional                             │  │
│          │  │  Buka: [08:00]  Tutup: [20:00]              │  │
│          │  │                                              │  │
│          │  │                       [Simpan Perubahan]     │  │
│          │  └────────────────────────────────────────────┘  │
└──────────┴───────────────────────────────────────────────────┘
```

#### 11.3.1 User Management (Staff)
```
┌──────────────────────────────────────────────────────────────┐
│  User Management — Staf                       [+ Tambah]    │
├──────────────────────────────────────────────────────────────┤
│  Username      │ Nama         │ Role       │ Status │ [⋮]   │
│  ──────────────────────────────────────────────────────────  │
│  sinta.admin   │ Sinta        │ ADMIN      │ 🟢     │ [⋮]   │
│  drh.rina      │ drg. Rina    │ DOKTER     │ 🟢     │ [⋮]   │
│  drh.andi      │ drg. Andi    │ DOKTER     │ 🟢     │ [⋮]   │
│  toni.kasir    │ Toni         │ KASIR      │ 🟢     │ [⋮]   │
│  sari.kasir    │ Sari         │ KASIR      │ 🔴     │ [⋮]   │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. Customer Portal

### 12.1 Home Screen
```
┌─────────────────────────────────────┐
│  🐾 Petora         [🔔 3] [👤]     │
├─────────────────────────────────────┤
│  Selamat pagi, Ibu Wati 👋          │
│  💎 Platinum Member                 │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │ 📅 Appointment Berikutnya     │ │
│  │ Buddy - 25 Aug 2026, 10:00   │ │
│  │ drg. Rina - Vaksin Booster   │ │
│  │ [Lihat Detail]               │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  Quick Actions                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐│
│  │ 📅   │ │ ✂️   │ │ 🏠   │ │ 🛒 ││
│  │Appt  │ │Groom │ │Hotel │ │Shop││
│  └──────┘ └──────┘ └──────┘ └────┘│
├─────────────────────────────────────┤
│  Hewan Peliharaan Saya               │
│  ┌───────────────────────────────┐ │
│  │ 🐕 Buddy                      │ │
│  │ Golden Retriever • 3 th       │ │
│  │ 💉 Vaksin: 1 Overdue ⚠️       │ │
│  │ [Lihat Detail →]             │ │
│  ├───────────────────────────────┤ │
│  │ 🐈 Mimi                       │ │
│  │ Persia • 2 th                 │ │
│  │ 💉 Vaksin: Semua up-to-date ✅ │ │
│  │ [Lihat Detail →]             │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  🏆 Rewards Anda                     │
│  2,450 poin tersedia                 │
│  [Lihat Rewards →]                  │
├─────────────────────────────────────┤
│  🏠  📅  🛒  🎁  👤                  │
└─────────────────────────────────────┘
```

### 12.2 Pets Detail
```
┌─────────────────────────────────────┐
│  ← Pets    Buddy                     │
├─────────────────────────────────────┤
│  ┌────────┐                          │
│  │  🐕    │  Buddy                   │
│  │ Avatar │  Golden Retriever        │
│  └────────┘  ♂ • 3 tahun            │
│              Microchip: 9851123...   │
├─────────────────────────────────────┤
│  [🆔 ID Card] [⚖️ Weight] [💉 Vaksin]│
├─────────────────────────────────────┤
│  Overview                            │
│  Berat: 28.5 kg (15 Aug)             │
│  Alergi: Chicken, Beef               │
├─────────────────────────────────────┤
│  Vaksinasi                           │
│  ✅ Rabies (10 Jan 2026)             │
│     Next: 10 Jan 2027               │
│  ⚠️ DHPP (15 Feb 2025)               │
│     OVERDUE - hubungi klinik         │
├─────────────────────────────────────┤
│  Riwayat Kunjungan                   │
│  📅 18 Aug - Konsultasi - DONE       │
│  📅 10 Jun - Vaksin - DONE           │
│  📅 15 Mar - Steril - DONE           │
└─────────────────────────────────────┘
```

### 12.3 Appointment Booking
```
┌─────────────────────────────────────┐
│  ← Appointment   Booking Baru        │
├─────────────────────────────────────┤
│  Pilih Hewan                         │
│  ┌────────┐ ┌────────┐              │
│  │ 🐕     │ │ 🐈     │              │
│  │ Buddy  │ │ Mimi   │              │
│  │ [✓]    │ │        │              │
│  └────────┘ └────────┘              │
├─────────────────────────────────────┤
│  Pilih Tanggal                       │
│  ┌───────────────────────────────┐ │
│  │  [Calendar picker]            │ │
│  │  Available: 20, 21, 22, 25   │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  Pilih Jam                           │
│  [09:00] [09:30] [10:00] [10:30]   │
│  [11:00] [13:00] [13:30] [14:00]   │
├─────────────────────────────────────┤
│  Keluhan                             │
│  [________________]                  │
│  [________________]                  │
├─────────────────────────────────────┤
│  [Ajukan Appointment]                │
└─────────────────────────────────────┘
```

### 12.4 Shop (E-Commerce Ringan)
```
┌─────────────────────────────────────┐
│  🛒 Shop            [🔍] [🛒 3]    │
├─────────────────────────────────────┤
│  Kategori                            │
│  [Semua] [Makanan] [Snack] [Obat]   │
├─────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐         │
│  │ [📦]     │ │ [📦]     │         │
│  │ Royal    │ │ Whiskas  │         │
│  │ Canin    │ │ Cat 1kg  │         │
│  │ 5kg      │ │          │         │
│  │ Rp 450K  │ │ Rp 35K   │         │
│  │ Stok: 12 │ │ Stok: 3 ⚠│         │
│  │ [+ Cart] │ │ [+ Cart] │         │
│  └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐         │
│  │ ...      │ │ ...      │         │
│  └──────────┘ └──────────┘         │
├─────────────────────────────────────┤
│  🏠  📅  🛒  🎁  👤                  │
└─────────────────────────────────────┘
```

### 12.5 Loyalty / Rewards
```
┌─────────────────────────────────────┐
│  🎁 Rewards Anda                     │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │ 💎 Platinum Member            │ │
│  │ 2,450 poin tersedia           │ │
│  │ ━━━━━━━━━━━━━━━━━━━━ 75%     │ │
│  │ 550 poin lagi ke Diamond      │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  Tukar Poin                          │
│  ┌───────────────────────────────┐ │
│  │ 🎫 Diskon Rp 10.000           │ │
│  │ 100 poin                      │ │
│  │ [Tukar]                       │ │
│  ├───────────────────────────────┤ │
│  │ 🎫 Diskon Rp 50.000           │ │
│  │ 500 poin                      │ │
│  │ [Tukar]                       │ │
│  ├───────────────────────────────┤ │
│  │ ✂️ Free Grooming Basic        │ │
│  │ 1,000 poin                    │ │
│  │ [Tukar]                       │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  Voucher Saya                        │
│  ┌───────────────────────────────┐ │
│  │ 🎟️ DISKON10 - 10% s/d 30 Aug │ │
│  │ [Gunakan]                     │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  Riwayat Poin                        │
│  +20  18 Aug - Belanja             │
│  -100 15 Aug - Tukar voucher       │
│  +45  10 Aug - Belanja             │
└─────────────────────────────────────┘
```

### 12.6 Profile
```
┌─────────────────────────────────────┐
│  👤 Profile                          │
├─────────────────────────────────────┤
│  ┌────────┐                          │
│  │ Avatar │  Ibu Wati                │
│  │  (xl)  │  💎 Platinum Member      │
│  └────────┘  Sejak Jan 2025          │
├─────────────────────────────────────┤
│  Informasi Akun                      │
│  Username: wati08                    │
│  Telepon: +62 812-3456-7890          │
│  Email: wati@email.com               │
│  Alamat: Jl. Merdeka No. 10          │
│  [Edit Profile]                      │
├─────────────────────────────────────┤
│  Keamanan                            │
│  🔐 Ganti PIN                        │
│  📱 Logout dari semua perangkat      │
├─────────────────────────────────────┤
│  Preferensi                          │
│  🌙 Dark Mode  [○]                   │
│  🔔 Notifikasi [●]                   │
├─────────────────────────────────────┤
│  [🚪 Logout]                         │
└─────────────────────────────────────┘
```

---

## 13. State Representations

### 13.1 Loading States

#### 13.1.1 Page Loading
```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ████████████████████  (Skeleton - Page Header)      │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  ████████████████████████████████████████████████    │   │
│  │  ████████████████████████████████████████████████    │   │
│  │  ████████████████████████████████████████████████    │   │
│  │  ████████████████████████████████████████████████    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Skeleton patterns**:
- `Skeleton` dari shadcn/ui untuk placeholder
- Pulse animation (default 1.5s)
- Match layout of actual content (table rows, cards, stats)

#### 13.1.2 Button Loading
```tsx
<Button disabled loading>
  <Loader2 className="animate-spin" /> Menyimpan...
</Button>
```

#### 13.1.3 Inline Loading
```tsx
<DataTable data={data} loading={isLoading} />
// Shows skeleton rows while loading
```

### 13.2 Empty States

```tsx
<EmptyState
  icon={Package}
  title="Belum ada produk"
  description="Tambahkan produk pertama Anda untuk mulai berjualan"
  action={
    <Button onClick={handleCreate}>
      <Plus /> Tambah Produk
    </Button>
  }
/>
```

**Empty state variants**:
- **No data yet**: dengan CTA untuk create
- **No results (search/filter)**: "Tidak ditemukan. Coba ubah filter."
- **No permission**: "Anda tidak memiliki akses ke data ini."
- **Error**: "Gagal memuat data. [Coba Lagi]"

### 13.3 Error States

#### 13.3.1 Inline Error (Form)
```
Nama *            [John Doe____________]
                  ⚠️ Nama wajib diisi
```

#### 13.3.2 Toast Error
```
┌─────────────────────────────────────────┐
│  ❌ Gagal menyimpan                     │
│  Username sudah digunakan               │
│                              [✕] [↻]   │
└─────────────────────────────────────────┘
```

#### 13.3.3 Full Page Error
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    ⚠️                                        │
│                                                              │
│               Terjadi Kesalahan                              │
│                                                              │
│        Kami tidak dapat memuat halaman ini.                  │
│        Silakan coba lagi dalam beberapa saat.                │
│                                                              │
│               [🔄 Muat Ulang]                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 13.4 Success States

#### 13.4.1 Toast Success
```
┌─────────────────────────────────────────┐
│  ✅ Customer berhasil ditambahkan       │
│                              [✕] [→]   │
└─────────────────────────────────────────┘
```
(→ button untuk navigate ke detail)

#### 13.4.2 Inline Success
```
┌──────────────────────────────────────────┐
│  ✅ Invoice INV-20260818-0001 berhasil   │
│     dibuat. Total: Rp 468.000            │
│  [🖨️ Cetak] [Lihat Invoice]             │
└──────────────────────────────────────────┘
```

### 13.5 Confirmation Dialogs

```tsx
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Hapus produk?"
  description={
    <>
      Produk <strong>Royal Canin Adult 5kg</strong> akan dihapus.
      Tindakan ini tidak dapat dibatalkan.
    </>
  }
  confirmLabel="Hapus"
  variant="destructive"
  onConfirm={handleDelete}
/>
```

**Confirmation levels**:
| Aksi | Dialog Level |
|---|---|
| Edit data | Inline save (no dialog) |
| Create data | Inline save (no dialog) |
| Soft delete | Confirm dialog |
| Hard delete | Confirm dialog + type name to confirm |
| Cancel invoice | Confirm dialog + reason input |
| Reset PIN | Confirm dialog |
| Deactivate user | Confirm dialog |

---

## 14. Form Patterns

### 14.1 Form Layout

#### 14.1.1 Dialog Form (Simple)
- Max width: `max-w-lg` (512px)
- Untuk create/edit sederhana (customer, pet, product)
- Scrollable jika konten panjang

#### 14.1.2 Sheet Form (Medium)
- Slide dari kanan, width `w-[600px]`
- Untuk form dengan banyak section
- Tidak menutup halaman di belakang

#### 14.1.3 Full Page Form (Complex)
- Untuk medical record, laporan, settings
- Multiple sections dengan heading
- Sticky action bar di bawah

### 14.2 Field Types

| Field Type | Component | Usage |
|---|---|---|
| Text short | `Input` | Nama, SKU, username |
| Text long | `Textarea` | Notes, description, complaint |
| Number | `Input type="number"` | Harga, qty, weight |
| Phone | `Input` + mask | +62 xxx-xxxx-xxxx |
| Email | `Input type="email"` | Email customer |
| Date | `Calendar` popover | Tanggal lahir, appointment |
| Time | `TimePicker` | Jam appointment |
| Date range | `DateRangePicker` | Filter tanggal |
| Select single | `Select` | Role, status, kategori |
| Select multi | `Combobox` / `MultiSelect` | Tags, products |
| Boolean | `Switch` | isActive, isGuest |
| File upload | `FileUpload` | Photo, attachment |
| Currency | `CurrencyInput` | Harga, amount (Rp format) |
| Search | `SearchInput` | Global search, filter |
| PIN | `NumericKeypad` | Login, change PIN |
| Signature | `SignaturePad` | Approval (future) |

### 14.3 Validation Feedback

**Inline validation** (saat blur atau submit):
```
Email             [invalid-email]
                  ⚠️ Format email tidak valid
```

**Field states**:
- Default: border slate-200
- Focus: border primary-500, ring primary-100
- Error: border danger-500, ring danger-100
- Success: border success-500
- Disabled: bg slate-100, cursor not-allowed

### 14.4 Required vs Optional

```
Nama *            [____________]     // Required
Telepon           [____________]     // Optional (no *)
```

Label dengan `*` merah untuk required. Help text di bawah field jika perlu.

### 14.5 Form Actions

**Primary action** (kanan): `Button variant="default"` — "Simpan", "Buat", "Bayar"
**Secondary action** (kiri): `Button variant="outline"` — "Batal"
**Danger action**: `Button variant="destructive"` — "Hapus"

```
┌──────────────────────────────────────────┐
│                 [Batal]  [Simpan]        │
└──────────────────────────────────────────┘
```

### 14.6 Auto-save & Draft

Untuk form panjang (medical record):
- Auto-save draft setiap 30 detik
- Indicator: "Draft tersimpan 2 menit lalu"
- Resume draft saat re-open

### 14.7 Form Shortcuts

- `Ctrl/Cmd + Enter`: Submit form
- `Esc`: Close form / cancel
- `Tab`: Navigate fields
- `Shift + Tab`: Navigate backward

---

## 15. Data Display Patterns

### 15.1 Tables

**Standard Table**:
```tsx
<DataTable
  columns={columns}
  data={data}
  pagination={{ pageSize: 20 }}
  sorting
  filtering
  rowSelection
  rowActions={rowActions}
/>
```

**Features**:
- Sticky header
- Sortable columns (click header)
- Row hover highlight
- Row selection (checkbox)
- Bulk actions toolbar
- Column visibility toggle
- Row actions dropdown ([⋮])
- Responsive: horizontal scroll di mobile

### 15.2 Cards

**Stat Card**:
```tsx
<StatCard
  title="Revenue"
  value="Rp 5.250.000"
  trend={{ value: 12.5, direction: 'up' }}
  icon={TrendingUp}
/>
```

**Info Card**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Buddy</CardTitle>
    <CardDescription>Golden Retriever</CardDescription>
  </CardHeader>
  <CardContent>
    <PetAvatar />
    <div>...</div>
  </CardContent>
</Card>
```

### 15.3 Badges & Status

```tsx
<Badge variant="success">PAID</Badge>
<Badge variant="warning">WAITING</Badge>
<Badge variant="danger">CANCELLED</Badge>
<Badge variant="info">IN_PROGRESS</Badge>
<Badge variant="outline">DRAFT</Badge>
```

### 15.4 Avatars

```tsx
<Avatar>
  <AvatarImage src="/pets/buddy.jpg" />
  <AvatarFallback>BU</AvatarFallback>
</Avatar>

// Sizes: sm (32px), md (40px), lg (56px), xl (80px)
```

### 15.5 Timeline

```tsx
<Timeline
  items={[
    {
      icon: Stethoscope,
      title: 'Konsultasi',
      description: 'Pemeriksaan rutin',
      timestamp: '18 Aug 2026, 10:00',
    },
    {
      icon: Syringe,
      title: 'Vaksin Rabies',
      timestamp: '10 Jan 2026',
    },
  ]}
/>
```

### 15.6 Charts

Library: **Recharts** (React-friendly, customizable)

**Chart types**:
- Line chart: trend (revenue, weight)
- Bar chart: comparison (revenue per week)
- Pie chart: distribution (tier, species)
- Area chart: cumulative data

### 15.7 Progress Bars

```tsx
<Progress value={75} label="Okupansi Pet Hotel" />
// 75% filled, green if <80%, amber if 80-95%, red if >95%
```

### 15.8 Number Formatting

```typescript
formatCurrency(1250000)  // "Rp 1.250.000"
formatNumber(1234)       // "1.234"
formatPercent(0.125)     // "12.5%"
formatDate('2026-08-18') // "18 Agu 2026"
formatDateTime(...)      // "18 Agu 2026, 10:30"
formatRelative(...)      // "2 jam yang lalu"
```

---

## 16. Responsive Design

### 16.1 Breakpoint Strategy

| Breakpoint | Device | Staff Dashboard | Customer Portal |
|---|---|---|---|
| `< 480px` | Mobile portrait | Hidden (redirect) | Full experience |
| `480-767px` | Mobile landscape | Limited (read-only) | Full experience |
| `768-1023px` | Tablet | Sidebar collapsible | Full experience |
| `1024-1279px` | Small laptop | Full | Full |
| `≥ 1280px` | Desktop | Full | Full (centered) |

### 16.2 Staff Dashboard Responsive

**Desktop (≥1024px)**:
- Sidebar fixed (w-64)
- Content area full width
- Tables full columns
- POS 2-column layout

**Tablet (768-1023px)**:
- Sidebar collapsible (icon only w-16)
- Tables with horizontal scroll
- POS stacked layout

**Mobile (<768px)**:
- Redirect ke simplified view atau warning
- POS tidak tersedia di mobile (desktop only)
- Read-only views untuk Dokter

### 16.3 Customer Portal Responsive

**Mobile-first**:
- Bottom navigation
- Single column layouts
- Cards stacked
- Touch-friendly (min 44px tap target)
- Swipe gestures untuk navigasi

**Tablet+**:
- Max width 640px, centered
- Same layout as mobile

### 16.4 Touch Targets

Minimum 44×44px untuk semua interactive elements di mobile:
- Buttons
- List items
- Form inputs
- Navigation items

---

## 17. Accessibility (a11y)

### 17.1 Standards

- **WCAG 2.1 Level AA** minimum
- Keyboard navigable (all features)
- Screen reader friendly (ARIA labels)
- Color contrast ≥ 4.5:1 (text), ≥ 3:1 (UI)
- Focus visible
- Motion reduction support (`prefers-reduced-motion`)

### 17.2 Keyboard Navigation

**Tab order**: Logical, follows visual order
**Focus indicator**: Visible ring (primary-500)
**Skip links**: Skip to main content
**Escape**: Close modals, dialogs, dropdowns
**Arrow keys**: Navigate dropdowns, tabs

### 17.3 Screen Reader

- All icons have `aria-label`
- Status badges have text alternative
- Form fields have labels (not just placeholders)
- Error messages announced via `aria-live`
- Tables have proper headers (`<th>`)

### 17.4 Color & Contrast

- Jangan hanya pakai warna untuk convey information
- Status: warna + icon + text
- Charts: warna + legend + labels
- Error: warna + icon + message text

### 17.5 Focus Management

- Modal: trap focus, restore on close
- Dialog: auto-focus first input
- Sheet: trap focus
- Toast: announce via aria-live
- Delete item: focus next item atau trigger button

### 17.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 18. Animation & Motion

### 18.1 Animation Principles

- **Purposeful**: animasi untuk feedback, bukan dekorasi
- **Fast**: 150-300ms untuk micro-interactions
- **Consistent**: easing yang sama di seluruh aplikasi
- **Subtle**: tidak mengganggu workflow

### 18.2 Animation Tokens

```css
--duration-fast: 150ms
--duration-normal: 250ms
--duration-slow: 400ms

--ease-default: cubic-bezier(0.4, 0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### 18.3 Common Animations

| Interaction | Animation | Duration |
|---|---|---|
| Button hover | Scale 1.02 + shadow | 150ms |
| Button click | Scale 0.98 | 100ms |
| Modal open | Fade in + scale up | 250ms |
| Modal close | Fade out + scale down | 200ms |
| Sheet slide | Slide from right | 300ms |
| Toast enter | Slide from top + fade | 300ms |
| Toast exit | Fade out | 200ms |
| Dropdown open | Fade + scale | 150ms |
| Tab change | Fade content | 200ms |
| List item add | Slide in + fade | 300ms |
| List item remove | Slide out + fade | 200ms |
| Skeleton pulse | Opacity pulse | 1500ms loop |
| Spinner | Rotate 360° | 1000ms loop |

### 18.4 Page Transitions

```tsx
// React Router + Framer Motion
<AnimatePresence>
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

### 18.5 Loading Spinners

```tsx
<Loader2 className="animate-spin" />  // Lucide icon
```

Untuk loading besar:
```tsx
<div className="flex items-center justify-center py-12">
  <div className="flex flex-col items-center gap-2">
    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
    <p className="text-sm text-slate-500">Memuat...</p>
  </div>
</div>
```

---

## 19. Notification System

### 19.1 Toast Notifications

**Position**: Top-right (desktop), Top-center (mobile)
**Duration**: 5s (success/info), sticky (error)
**Stack**: Max 3 toasts visible

```tsx
toast.success('Customer berhasil ditambahkan', {
  description: 'Ibu Wati',
  action: {
    label: 'Lihat',
    onClick: () => navigate(`/app/customers/${id}`),
  },
});

toast.error('Gagal menyimpan', {
  description: 'Username sudah digunakan',
});

toast.warning('Stok rendah', {
  description: 'Whiskas Cat 1kg tersisa 3',
});
```

### 19.2 In-App Notifications (Bell)

```
┌─────────────────────────────────────────┐
│  🔔 Notifikasi                    [✓]   │
├─────────────────────────────────────────┤
│  Baru                                   │
│  ┌───────────────────────────────────┐ │
│  │ 📅 Appointment baru dari portal   │ │
│  │ Buddy - Ibu Wati - 25 Aug 10:00   │ │
│  │ 5 menit yang lalu                 │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ ⚠️ Low stock alert                │ │
│  │ Whiskas Cat 1kg tersisa 3         │ │
│  │ 1 jam yang lalu                   │ │
│  └───────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  Sebelumnya                             │
│  ┌───────────────────────────────────┐ │
│  │ 💳 Invoice INV-...-001 PAID       │ │
│  │ 2 jam yang lalu                   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 19.3 Realtime Updates

Via Supabase Realtime:
- Appointment status changes (dashboard)
- Pet hotel room status (board)
- New notifications (bell badge)
- Stock changes (inventory dashboard)

```tsx
useEffect(() => {
  const channel = supabase
    .channel('appointments-today')
    .on('postgres_changes', {
      event: '*',
      table: 'appointments',
      filter: `appointment_date=eq.${today}`,
    }, (payload) => {
      queryClient.invalidateQueries(['appointments', today]);
      toast.info(`Appointment ${payload.new.status}`);
    })
    .subscribe();
  
  return () => { supabase.removeChannel(channel); };
}, []);
```

---

## 20. Keyboard Shortcuts

### 20.1 Global Shortcuts

| Shortcut | Action |
|---|---|
| `⌘/Ctrl + K` | Open command palette |
| `⌘/Ctrl + /` | Show shortcuts help |
| `⌘/Ctrl + B` | Toggle sidebar |
| `⌘/Ctrl + D` | Toggle dark mode |
| `⌘/Ctrl + Shift + L` | Logout |
| `?` | Show help (saat tidak di input) |

### 20.2 Navigation Shortcuts

| Shortcut | Action |
|---|---|
| `G → D` | Go to Dashboard |
| `G → C` | Go to Customers |
| `G → P` | Go to Products |
| `G → I` | Go to Invoices |
| `G → A` | Go to Appointments |

### 20.3 POS Shortcuts

| Shortcut | Action |
|---|---|
| `F1` | Focus search |
| `F2` | New transaction |
| `F3` | Hold transaction |
| `F4` | Recall held transaction |
| `F9` | Open payment |
| `F12` | Complete transaction |
| `Esc` | Cancel / close |

### 20.4 Table Shortcuts

| Shortcut | Action |
|---|---|
| `↑/↓` | Navigate rows |
| `Enter` | Open selected row |
| `Space` | Select row |
| `⌘/Ctrl + A` | Select all |
| `Delete` | Delete selected (with confirm) |

### 20.5 Modal Shortcuts

| Shortcut | Action |
|---|---|
| `Esc` | Close modal |
| `⌘/Ctrl + Enter` | Submit |
| `Tab` | Next field |
| `Shift + Tab` | Previous field |

---

## 21. Performance & Loading Strategy

### 21.1 Code Splitting

**Route-based splitting** (React Router lazy):
```tsx
const CustomersPage = lazy(() => import('./features/customers/CustomersPage'));
const POSPage = lazy(() => import('./features/pos/POSPage'));
```

**Feature-based splitting**:
- Setiap modul di-bundle terpisah
- shadcn/ui components di-tree-shake
- Charts library lazy load

### 21.2 Data Loading

**TanStack Query strategy**:
- `staleTime: 5 * 60 * 1000` (5 menit)
- `cacheTime: 10 * 60 * 1000` (10 menit)
- `refetchOnWindowFocus: true`
- `refetchOnReconnect: true`
- Optimistic updates untuk mutations

**Pagination**:
- Cursor-based untuk list besar
- Infinite scroll untuk feed
- Traditional pagination untuk tables

### 21.3 Image Optimization

- Lazy load images (`loading="lazy"`)
- Responsive images (srcset)
- WebP format (via Supabase Storage transformations)
- Avatar placeholders (initials) saat loading

### 21.4 Bundle Budget

| Type | Budget |
|---|---|
| Initial JS | < 300 KB (gzipped) |
| Per route | < 100 KB (gzipped) |
| CSS | < 50 KB (gzipped) |
| Total initial | < 500 KB |

### 21.5 Caching Strategy

**Browser cache**:
- Static assets: 1 year (Vercel CDN)
- API responses: via TanStack Query
- Images: 1 month

**Service Worker** (future):
- Cache shell app
- Offline mode untuk read-only views

---

## 22. File Structure & Naming

### 22.1 Folder Structure

```
src/
├── app/
│   ├── routes/                    # Route definitions
│   │   ├── app.routes.tsx         # Staff routes
│   │   └── portal.routes.tsx      # Portal routes
│   ├── layouts/
│   │   ├── StaffLayout.tsx
│   │   ├── PortalLayout.tsx
│   │   └── AuthLayout.tsx
│   └── providers/
│       ├── QueryProvider.tsx
│       ├── AuthProvider.tsx
│       └── ThemeProvider.tsx
│
├── features/                      # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── NumericKeypad.tsx
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   └── useAuth.ts
│   │   ├── schemas/
│   │   │   └── auth.schema.ts
│   │   └── index.ts
│   │
│   ├── customers/
│   │   ├── components/
│   │   │   ├── CustomerList.tsx
│   │   │   ├── CustomerDetail.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   └── CustomerTable.tsx
│   │   ├── hooks/
│   │   │   ├── useCustomers.ts
│   │   │   ├── useCustomer.ts
│   │   │   └── useCustomerMutations.ts
│   │   ├── schemas/
│   │   │   └── customer.schema.ts
│   │   └── index.ts
│   │
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
│   ├── feedback/
│   ├── expenses/
│   ├── reports/
│   ├── settings/
│   └── portal/
│
├── components/                    # Shared UI
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── data-display/
│   │   ├── DataTable.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Timeline.tsx
│   ├── forms/
│   │   ├── FormField.tsx
│   │   ├── SearchInput.tsx
│   │   └── FileUpload.tsx
│   ├── feedback/
│   │   ├── EmptyState.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── LoadingState.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── TopBar.tsx
│       ├── Breadcrumb.tsx
│       └── PageHeader.tsx
│
├── hooks/                         # Shared hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   └── useKeyboardShortcuts.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── middleware.ts
│   ├── services/                  # Service layer
│   │   ├── auth.service.ts
│   │   ├── customer.service.ts
│   │   └── ...
│   ├── utils/
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   └── errors.ts
│
├── schemas/                       # Shared schemas
│   └── base.ts
│
├── types/                         # TypeScript types
│   ├── base.ts
│   ├── user.ts
│   ├── customer.ts
│   └── ...
│
└── styles/
    ├── globals.css
    └── tailwind.css
```

### 22.2 Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Component file | PascalCase | `CustomerList.tsx` |
| Hook file | camelCase + `use` | `useCustomers.ts` |
| Service file | camelCase + `.service` | `customer.service.ts` |
| Schema file | camelCase + `.schema` | `customer.schema.ts` |
| Utility file | camelCase | `format.ts` |
| Type file | camelCase | `customer.ts` |
| Component name | PascalCase | `CustomerList` |
| Hook name | camelCase + `use` | `useCustomers` |
| Function name | camelCase | `formatCurrency` |
| Constant | UPPER_SNAKE | `MAX_RETRY_ATTEMPTS` |
| CSS class | kebab-case (Tailwind) | `text-primary-500` |
| Route path | kebab-case | `/app/medical-records` |
| Query key | Array | `['customers', { page: 1 }]` |

### 22.3 Component Naming

```tsx
// Feature component
CustomerList.tsx           // List of customers
CustomerDetail.tsx         // Detail view
CustomerForm.tsx           // Create/edit form
CustomerTable.tsx          // Table component

// UI component
DataTable.tsx              // Generic data table
StatusBadge.tsx            // Status indicator
EmptyState.tsx             // Empty state display
```

### 22.4 Import Order

```tsx
// 1. React & external libraries
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal modules (absolute paths)
import { Button } from '@/components/ui/button';
import { useCustomers } from '@/features/customers';

// 3. Relative imports
import { CustomerForm } from './CustomerForm';
import { formatCurrency } from './utils';

// 4. Types
import type { Customer } from '@/types';
```

---

## Ringkasan Eksekutif

### Cakupan Dokumen

✅ **Design System** — tokens, colors, typography, spacing, elevation
✅ **Component Architecture** — shadcn/ui + custom components
✅ **Layout System** — Staff Dashboard & Customer Portal
✅ **Navigation** — role-based menus, breadcrumbs, global search
✅ **Authentication UI** — login, PIN input, route protection
✅ **Modul CRM & Pasien** — customers, pets, appointments, medical records, pet hotel, grooming
✅ **Modul Petshop** — products, inventory, purchase orders
✅ **Modul POS & Billing** — POS dashboard, invoices, cash shifts
✅ **Modul Engagement** — loyalty, promotions, feedback
✅ **Modul Keuangan** — expenses, reports, settings
✅ **Customer Portal** — home, pets, appointments, shop, loyalty, profile
✅ **State Representations** — loading, empty, error, success
✅ **Form Patterns** — validation, field types, actions
✅ **Data Display** — tables, cards, badges, charts
✅ **Responsive Design** — breakpoints, mobile-first portal
✅ **Accessibility** — WCAG 2.1 AA, keyboard, screen reader
✅ **Animation** — tokens, common animations, page transitions
✅ **Notifications** — toast, in-app, realtime
✅ **Keyboard Shortcuts** — global, navigation, POS, tables
✅ **Performance** — code splitting, caching, budgets
✅ **File Structure** — folder organization, naming conventions

### Prinsip Implementasi

1. **Consistency** — gunakan design tokens, jangan hardcode values
2. **Reusability** — extract ke shared component jika dipakai ≥ 2 kali
3. **Accessibility** — a11y bukan afterthought, tapi built-in
4. **Performance** — lazy load, optimize images, minimize bundle
5. **Mobile-first** — untuk portal, design dari mobile ke desktop
6. **Keyboard-first** — untuk staff dashboard, optimize untuk power users

### Checklist Implementasi per Halaman

- [ ] Layout sesuai wireframe di dokumen ini
- [ ] Design tokens digunakan (bukan hardcoded)
- [ ] Loading state diimplementasi
- [ ] Empty state diimplementasi
- [ ] Error state diimplementasi
- [ ] Form validation inline
- [ ] Keyboard shortcuts bekerja
- [ ] Screen reader friendly
- [ ] Responsive di semua breakpoint
- [ ] Animation subtle dan purposeful
- [ ] Performance budget respected

---

**Dokumen ini merupakan baseline final untuk UI/UX dan frontend Petora. Seluruh designer dan developer wajib mengikuti spesifikasi ini untuk memastikan konsistensi, accessibility, dan kualitas antarmuka di seluruh aplikasi.** 🚀
