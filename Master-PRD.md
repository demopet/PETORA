# Product Requirements Document (PRD)
## HaLand PetCare — Sistem Manajemen Terpadu Petshop & Petcare
### Dokumen Baseline Final | 18 Agustus 2026

---

## Daftar Isi
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Masalah](#2-latar-belakang--masalah)
3. [Tujuan & Success Metrics](#3-tujuan--success-metrics)
4. [Target Pengguna & Persona](#4-target-pengguna--persona)
5. [Tech Stack & Arsitektur](#5-tech-stack--arsitektur)
6. [Autentikasi & Manajemen Akun](#6-autentikasi--manajemen-akun)
7. [Role & Hak Akses](#7-role--hak-akses)
8. [Modul Inti](#8-modul-inti)
9. [Portal Customer](#9-portal-customer)
10. [Model Data](#10-model-data)
11. [Alur Kerja Utama](#11-alur-kerja-utama)
12. [Business Rules](#12-business-rules)
13. [Notifikasi & Reminder](#13-notifikasi--reminder)
14. [Kebutuhan Non-Fungsional](#14-kebutuhan-non-fungsional)
15. [Di Luar Ruang Lingkup](#15-di-luar-ruang-lingkup)
16. [Item Terbuka](#16-item-terbuka)
17. [Glosarium](#17-glosarium)

---

## 1. Ringkasan Eksekutif

**HaLand PetCare** adalah sistem manajemen terpadu berbasis web (SPA) yang menggabungkan operasional **Petshop** (retail produk) dan **Petcare** (jasa layanan hewan) dalam satu platform. Sistem ini memiliki dua permukaan:

- **Staff Dashboard** — untuk Owner, Admin, Dokter, dan Kasir dalam operasional harian
- **Customer Portal** — self-service bagi pelanggan untuk memantau hewan, appointment, tagihan, dan melakukan pemesanan

Sistem dirancang sebagai **satu sumber kebenaran** (single source of truth) untuk data customer, hewan peliharaan, rekam medis, inventory, transaksi keuangan, dan program loyalitas — sehingga seluruh alur bisnis, dari pendaftaran customer hingga pembayaran invoice, berjalan dalam satu platform yang terintegrasi.

### Permukaan Aplikasi
| Permukaan | Path | Pengguna | Tujuan |
|---|---|---|---|
| Staff Dashboard | `/app/*` | Owner, Admin, Dokter, Kasir | Operasional harian |
| Customer Portal | `/portal/*` | Customer | Self-service pelanggan |

### Prinsip Desain Utama
- **Satu mekanisme autentikasi** (Username + PIN) untuk semua role
- **Tidak ada self sign-up** — seluruh akun dibuat oleh pihak berwenang
- **Kontrol akses berbasis peran (RBAC)** yang ketat di level UI, API, dan database
- **Audit trail lengkap** — setiap aksi dan pembuatan akun dapat ditelusuri
- **Modular per fitur** — mudah dikembangkan tanpa mengganggu modul lain

---

## 2. Latar Belakang & Masalah

Bisnis petshop + petcare skala kecil–menengah menghadapi masalah umum:

1. **Data terfragmentasi** — rekam medis di buku, stok di spreadsheet, kasir di aplikasi terpisah
2. **Stok tidak real-time** — sering kehabisan obat penting atau overstock mengikat modal
3. **Riwayat medis tidak terpusat** — dokter kesulitan melihat riwayat saat pasien kembali
4. **Customer tidak mandiri** — harus telepon klinik untuk cek jadwal vaksin, tagihan, riwayat
5. **Billing campur aduk** — produk + jasa + penitipan sulit direkonsiliasi
6. **Tidak ada program loyalitas** — customer tidak punya insentif untuk kembali
7. **Kontrol akses longgar** — staf bisa saling membuat akun tanpa sepengetahuan owner
8. **Layanan grooming tidak terkelola** — dicampur dengan konsultasi medis
9. **Pengadaan barang tidak terstruktur** — tidak ada Purchase Order, restock berdasarkan ingatan
10. **Pengeluaran operasional tidak tercatat** — sulit menghitung laba/rugi sebenarnya

HaLand PetCare dirancang untuk **menyatukan seluruh alur** dalam satu platform dengan kontrol akses berbasis peran yang ketat, sekaligus memberikan pengalaman modern bagi customer melalui portal self-service.

---

## 3. Tujuan & Success Metrics

### 3.1 Tujuan Produk
- Single source of truth untuk data customer, hewan, medis, inventory, dan transaksi
- Mengurangi waktu administratif staf (appointment, rekam medis, kasir)
- Memberikan visibilitas stok real-time + peringatan dini
- Kanal self-service untuk customer (portal)
- Laporan operasional & finansial akurat untuk decision-making Owner
- Meningkatkan retensi customer melalui loyalty program & engagement portal
- Audit trail lengkap: siapa mendaftarkan siapa, siapa mengubah apa
- Mengelola layanan grooming sebagai modul terpisah dari konsultasi medis
- Mengotomasi pengadaan barang melalui Purchase Order
- Mencatat seluruh pengeluaran operasional untuk perhitungan laba/rugi

### 3.2 Success Metrics
| Metrik | Target |
|---|---|
| Waktu login (username + PIN) | < 10 detik |
| Waktu buat 1 appointment | < 60 detik |
| Waktu checkout POS (1 transaksi) | < 90 detik |
| Akurasi stok (vs fisik) | > 95% setelah 1 bulan |
| Adopsi portal customer | > 30% customer aktif/bulan (3 bulan pasca-launch) |
| Komplain "salah tagihan" | Turun signifikan vs manual |
| Insiden akun tidak sah | 0 (zero) |
| Retensi customer (loyalty) | > 40% customer repeat dalam 6 bulan |
| Uptime sistem | ≥ 99.5% |
| Waktu load halaman utama | < 2 detik |

---

## 4. Target Pengguna & Persona

### 👤 Owner — "Pak Budi"
Pemilik bisnis. Butuh visibilitas menyeluruh: revenue, aktivitas staf, audit log, stok. Satu-satunya yang bisa mendaftarkan akun staf.

### 👤 Admin Klinik — "Sinta"
Resepsionis/admin harian. Menangani pendaftaran, scheduling, kasir, koordinasi. Butuh alur cepat karena melayani banyak customer sekaligus.

### 👤 Dokter Hewan — "drg. Rina"
Fokus pemeriksaan & rekam medis. Butuh akses cepat ke riwayat pasien. **Tidak** boleh akses data keuangan/inventory.

### 👤 Kasir — "Toni"
Khusus menangani POS & billing. Dibutuhkan karena bisnis memiliki sisi retail yang sibuk. Tidak bisa akses rekam medis.

### 👤 Customer — "Ibu Wati"
Pemilik hewan. Ingin cek jadwal vaksin, riwayat kunjungan, tagihan, dan booking dari HP tanpa telepon klinik.

---

## 5. Tech Stack & Arsitektur

### 5.1 Stack Teknologi
| Layer | Teknologi | Alasan |
|---|---|---|
| **Frontend Framework** | React 18+ | Ecosystem luas, component-based |
| **Build Tool** | Vite | Build cepat, HMR instan |
| **Language** | TypeScript | Type safety, mengurangi bug |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first + komponen premium siap pakai |
| **Routing** | React Router v6 | SPA routing standar |
| **Server State** | TanStack Query v5 | Caching, refetch, optimistic update |
| **Validation** | Zod | Schema validation + type inference |
| **Backend-as-a-Service** | Supabase | PostgreSQL + Auth + Storage + Realtime + Edge Functions |
| **Database** | PostgreSQL (via Supabase) | Relational, robust, free tier generous |
| **Deployment** | Vercel | Auto-deploy dari Git, edge network |
| **State Management** | Zustand (opsional) | Lightweight global state jika diperlukan |

### 5.2 Arsitektur Sistem
```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (CDN + Edge)                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│        React SPA (Vite + TypeScript + shadcn/ui)        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Staff        │  │ Customer     │  │ Shared       │  │
│  │ Dashboard    │  │ Portal       │  │ Components   │  │
│  │ /app/*       │  │ /portal/*    │  │ /components  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          ▼                              │
│        TanStack Query + Supabase JS Client              │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Supabase Platform                    │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ PostgreSQL │ │   Auth   │ │ Storage  │ │Realtime │ │
│  │   (DB)     │ │ (custom) │ │ (files)  │ │(live up)│ │
│  └────────────┘ └──────────┘ └──────────┘ └─────────┘ │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Edge Functions (opsional, untuk logika kompleks) │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Row Level Security (RLS) — otorisasi di level DB │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Struktur Folder Frontend
```
src/
├── app/                    # Routing & layouts
│   ├── routes/             # React Router routes
│   ├── layouts/            # StaffLayout, PortalLayout, AuthLayout
│   └── providers/          # QueryClient, AuthProvider, ThemeProvider
├── features/               # Feature-based modules
│   ├── auth/
│   ├── customers/
│   ├── pets/
│   ├── appointments/
│   ├── medical-records/
│   ├── pet-hotel/
│   ├── grooming/
│   ├── products/
│   ├── inventory/
│   ├── pos/
│   ├── billing/
│   ├── loyalty/
│   ├── promotions/
│   ├── expenses/
│   ├── purchase-orders/
│   ├── reports/
│   ├── settings/
│   └── portal/
├── components/             # Shared UI (shadcn/ui + custom)
├── hooks/                  # Custom hooks
├── lib/                    # Utils, Supabase client, constants
├── schemas/                # Zod schemas
├── types/                  # TypeScript types
└── styles/                 # Global CSS
```

---

## 6. Autentikasi & Manajemen Akun

### 6.1 Skema Login: Username + PIN (Semua Role)
Seluruh pengguna login dengan **Username + PIN** (6 digit numerik). Tidak ada email/password.

| Aspek | Ketentuan |
|---|---|
| Panjang PIN | 6 digit numerik (konfigurasi Owner) |
| Penyimpanan | Hash (bcrypt/argon2) via Supabase Auth custom |
| Percobaan gagal | Max 5x → lockout 15 menit |
| Reset PIN | Oleh pihak berwenang (Owner/Admin) |
| Ganti PIN mandiri | Bisa, dengan verifikasi PIN lama |

### 6.2 Prinsip Pendaftaran Akun
- **Tidak ada self sign-up** untuk role apapun
- Akun Owner dibuat sekali saat initial setup (seed)
- Akun staf (Admin, Dokter, Kasir) **hanya oleh Owner**
- Akun Customer oleh **Owner atau Admin**
- Setiap akun mencatat `createdBy` untuk audit trail

### 6.3 Matriks Kewenangan Akun
| Role yang dibuat | Siapa yang boleh buat | Siapa yang boleh reset PIN |
|---|---|---|
| Owner | Initial setup only | Prosedur infrastruktur |
| Admin | Owner | Owner |
| Dokter | Owner | Owner |
| Kasir | Owner | Owner |
| Customer | Owner / Admin | Owner / Admin |

### 6.4 Implementasi di Supabase
Karena Supabase Auth default menggunakan email/password, implementasi dilakukan dengan:
1. **Custom auth flow**: simpan username + pinHash di tabel `users` sendiri
2. **JWT session**: gunakan `supabase.auth.setSession()` dengan custom token, atau manage session via `localStorage` + Zustand
3. **RLS policies**: setiap tabel punya policy berdasarkan `auth.uid()` yang di-map ke `users.id`
4. **Alternatif**: gunakan Supabase Auth dengan email fiktif (`username@haland.internal`) + PIN sebagai password — lebih simpel, tetap aman

### 6.5 Alur Pembuatan Username
- Pihak pendaftar (Owner/Admin) menetapkan username untuk pengguna
- Sistem validasi keunikan username secara real-time (lintas role)
- Format: huruf kecil, angka, underscore/titik, tanpa spasi (contoh: `sinta.admin`, `drh.rina`, `wati08`)
- PIN awal dapat ditetapkan manual atau di-generate otomatis, lalu disampaikan offline

### 6.6 Sesi & Logout
- Setelah login, sesi dibuat (JWT/session token) berisi `userId` dan `role`
- Sesi Staff Dashboard dan Customer Portal terpisah secara route/middleware
- Logout mengakhiri sesi aktif; tersedia opsi "logout dari semua perangkat"

---

## 7. Role & Hak Akses

### 7.1 Matriks Akses per Modul
| Modul | Owner | Admin | Dokter | Kasir | Customer |
|---|---|---|---|---|---|
| Customers | CRUD | CRUD | Read | Read | Read (sendiri) |
| Pets | CRUD | CRUD | Read | Read | Read (sendiri) |
| Appointments | CRUD | CRUD | R + Update | Read | R + Create |
| Medical Records | R + Delete | CRUD | C/U (milik sendiri) | — | Read ringkasan |
| Pet Hotel | CRUD | CRUD | Read | Read | R + Create |
| Grooming | CRUD | CRUD | Read | Read | R + Create |
| Products | CRUD | C/U | — | Read | Read |
| Inventory | CRUD | C/U | — | Read | — |
| POS / Billing | Full | Full | — | Full | Read invoice |
| Promotions | CRUD | CRUD | — | Read | Read |
| Loyalty | CRUD | CRUD | — | View poin | View poin |
| Expenses | CRUD | CRUD | — | — | — |
| Purchase Orders | CRUD | CRUD | — | — | — |
| Reports | Semua | Semua kecuali audit | Terbatas | POS only | — |
| Settings | Full | — | — | — | Edit profil |
| Audit Log | Full | — | — | — | — |

### 7.2 Ringkasan per Role

**OWNER** — Akses penuh ke semua modul, satu-satunya yang bisa manage akun staf, lihat audit log, backup/restore.

**ADMIN** — Operasional harian: customer, appointment, inventory, billing, grooming. Bisa buat akun Customer.

**DOKTER** — Fokus klinis: appointment, medical records, pet hotel (read). Tidak bisa akses POS/inventory/keuangan.

**KASIR** — Fokus POS & billing: transaksi, invoice, pembayaran, lihat produk. Tidak bisa akses rekam medis atau ubah inventory.

**CUSTOMER** — Portal self-service: profil, pets, appointment, medical records (ringkasan), invoice, pet hotel, grooming, loyalty points.

---

## 8. Modul Inti

Sistem terdiri dari **5 modul inti** yang mencakup seluruh operasional bisnis.

### 📦 Modul 1: CRM & Pasien

Menggabungkan semua interaksi dengan customer dan hewan peliharaan dalam satu modul kohesif.

#### 1.1 Customers
- List, search, pagination
- Tambah/edit/hapus (soft-delete)
- Detail: profil + daftar hewan + riwayat appointment + invoice + loyalty points
- **Tipe**: Registered (lengkap, bisa punya akun portal) & Guest (walk-in)
- **Tag/Label**: VIP, Regular, New, Blacklist (untuk segmentasi)

#### 1.2 Pets
- List per customer, filter by species/breed
- Tambah/edit/hapus
- **Detail Pet — 5 Tab**:
  1. **Overview** — info dasar, umur auto-hitung, berat terakhir
  2. **Weight History** — log berat + grafik trend
  3. **Vaccines** — riwayat + jadwal + indikator "Overdue"
  4. **Medical History** — penyakit & alergi
  5. **Digital Pet ID Card** — kartu identitas digital (QR code) berisi info dasar hewan

#### 1.3 Appointments
- List dengan filter (tanggal, dokter, status, customer)
- Tambah: pilih customer → pet → dokter → slot waktu → keluhan
- **Status flow**: `WAITING → IN_PROGRESS → DONE` / `CANCELLED`
- Nomor antrian auto-generate (reset harian)
- Flag "diajukan oleh customer" untuk tracking self-request
- **Integrasi reminder**: auto-notify customer H-1 via WhatsApp/email

#### 1.4 Medical Records
- List dengan filter (tanggal, dokter, customer, status)
- Tambah: link ke appointment (wajib), keluhan, pemeriksaan, tanda vital, diagnosis, treatment, resep, lampiran
- Nomor auto-generate: `MR-YYYYMMDD-XXXX`
- Status: `OPEN / CLOSED`
- **Kontrol**: hanya dokter pembuat yang bisa edit; Owner/Admin bisa read & delete

#### 1.5 Pet Hotel
- **Rooms**: manajemen kamar (tipe, harga, kapasitas, status, kebersihan)
- **Bookings**: check-in/check-out, perpanjangan, pembatalan
- **Logs harian**: feeding, medicine, note + foto
- Dashboard visual board (grid kamar berwarna per status)
- **Live webcam feed** (opsional, via URL embed) — customer bisa lihat hewan dari portal

#### 1.6 Grooming
Layanan grooming terpisah dari konsultasi medis.
- **Service Packages**: paket grooming (basic, full, premium) dengan harga & durasi
- **Booking grooming**: pilih pet → paket → groomer → slot waktu
- **Status**: `BOOKED → IN_PROGRESS → DONE`
- **Grooming Record**: catatan hasil (kondisi kulit, kutu, rekomendasi) + foto before/after
- **Pricing**: berdasarkan ukuran hewan + paket + add-on (cut kuku, cleaning telinga, dll)

---

### 🛒 Modul 2: Petshop

Menggabungkan manajemen produk, stok, dan pengadaan.

#### 2.1 Products
- List dengan filter (kategori, supplier, status)
- Tambah: SKU (unik, immutable), nama, kategori, supplier, harga beli/jual, stok min/max, foto, barcode
- **Variant**: ukuran, warna, rasa (untuk makanan)
- Status: `ACTIVE / ARCHIVED`
- **Bundle Products**: paket produk (misal "Paket Anak Anjing" = makanan + shampoo + mainan)

#### 2.2 Categories & Suppliers
- Kategori produk (nested, max 2 level)
- Supplier: nama, kontak, alamat, catatan, lead time

#### 2.3 Inventory & Stock
- **Stock Dashboard**: ringkasan stok, indikator low/overstock, nilai inventory
- **Stock Movement**: log pergerakan (IN/OUT/RETURN/ADJUSTMENT/DAMAGED/EXPIRED/OPNAME)
- **Stock Opname**: pencocokan fisik vs tercatat
- **Low Stock Alert**: notifikasi otomatis saat stok < minimum
- **Barcode Scanner**: scan barcode produk via kamera HP/kamera POS untuk input cepat
- **Expiry Tracking**: tracking kedaluwarsa produk, alert H-30

#### 2.4 Purchase Orders (PO)
Pengadaan barang ke supplier.
- Buat PO: pilih supplier → produk → qty → harga → estimasi tanggal tiba
- Status: `DRAFT → SENT → PARTIAL_RECEIVED → RECEIVED → CANCELLED`
- Saat PO di-receive, otomatis create `StockMovement` bertipe `IN`
- Riwayat PO per supplier
- **Auto-suggest reorder**: sistem sarankan PO berdasarkan stok minimum + penjualan rata-rata

---

### 💳 Modul 3: POS & Billing

Menggabungkan kasir, invoice, dan pembayaran dalam satu modul.

#### 3.1 POS Dashboard (Kasir)
- **Grid produk** dengan pencarian cepat / scan barcode
- **Keranjang**: tambah/kurang qty, hapus, subtotal
- **Pilih customer**: registered (search) atau walk-in (guest)
- **Diskon & Pajak**: input diskon (%/fixed) + pajak
- **Apply Promo/Voucher**: kode promo, loyalty points redemption
- **Metode pembayaran**: CASH / NON_CASH / MIXED (cash + non-cash)
- **Checkout**: validasi stok → deduct stok → buat invoice + payment → cetak struk
- **Hold Transaction**: simpan keranjang sementara, lanjutkan nanti
- **Quick Customer**: tambah customer baru langsung dari POS

#### 3.2 Invoice & Billing
**Jenis Invoice** (digabung dalam satu entitas):
- `POS` — penjualan produk murni
- `CLINICAL` — konsultasi/tindakan/obat dari kunjungan
- `PET_HOTEL` — penitipan hewan
- `GROOMING` — layanan grooming
- `MIXED` — gabungan (produk + jasa dalam satu kunjungan)

**Pembayaran**:
- Status auto: `UNPAID → PARTIAL_PAYMENT → PAID` / `CANCELLED`
- Record payment berkali-kali hingga lunas
- **Payment Methods**: Cash, QRIS, Transfer Bank, E-Wallet (GoPay, OVO, Dana), Credit Card
- **Payment Gateway Integration** (opsional): Midtrans/Xendit untuk non-cash otomatis

**Pembatalan**:
- Status → `CANCELLED`
- Auto-restore stok produk
- Opsi refund/credit

#### 3.3 POS History
- List transaksi dengan filter (tanggal, metode, kasir, status)
- Detail drill-down ke invoice
- Export CSV/Excel
- Cetak ulang struk
- **Shift Reconciliation**: tutup shift kasir, hitung cash drawer, selisih

---

### 💎 Modul 4: Engagement & Loyalty

Menggabungkan program loyalitas, promo, dan feedback customer.

#### 4.1 Loyalty Program
- **Points System**: customer dapat poin per transaksi (misal Rp 10.000 = 1 poin)
- **Tier Membership**: Bronze → Silver → Gold → Platinum (berdasarkan akumulasi poin/spending)
- **Benefits per Tier**: diskon tambahan, free grooming, priority booking, dll
- **Redemption**: tukar poin dengan diskon, produk gratis, atau layanan
- **Dashboard**: list member, poin, tier, riwayat transaksi

#### 4.2 Promotions & Vouchers
- **Discount Codes**: kode promo (% atau fixed)
- **Vouchers**: voucher nominal, bisa di-generate massal
- **Bundle Deals**: beli X gratis Y
- **Happy Hour**: diskon di jam tertentu
- **Birthday Special**: diskon otomatis di bulan ulang tahun customer/pet
- **Validasi**: tanggal mulai/akhir, min transaksi, max penggunaan, produk eligible

#### 4.3 Customer Feedback
- **Rating & Review**: customer bisa rating setelah kunjungan (1-5 bintang + komentar)
- **NPS Survey**: Net Promoter Score survey periodik
- **Dashboard**: rata-rata rating, trend, respons admin
- **Auto-request**: kirim link feedback via WhatsApp/email setelah invoice lunas

---

### 💰 Modul 5: Keuangan & Operasional

Menggabungkan laporan, pengeluaran, dan pengaturan sistem.

#### 5.1 Expenses (Pengeluaran)
Pencatatan pengeluaran operasional di luar pembelian produk.
- **Kategori**: gaji, listrik, air, sewa, marketing, maintenance, lain-lain
- **Catat pengeluaran**: tanggal, kategori, nominal, catatan, bukti (foto struk)
- **Recurring expenses**: pengeluaran rutin bulanan (auto-create)
- **Dashboard**: total pengeluaran per periode, breakdown per kategori

#### 5.2 Reports
| Laporan | Deskripsi | Akses |
|---|---|---|
| **Revenue** | Pendapatan per periode, breakdown per sumber (POS/klinik/pet hotel/grooming) | Owner, Admin |
| **Profit & Loss** | Revenue − COGS − Expenses = Laba/Rugi | Owner |
| **Appointments** | Jumlah & tren appointment per dokter/periode/status | Owner, Admin, Dokter (sendiri) |
| **Medical Records** | Statistik diagnosis, jumlah rekam medis | Owner, Admin, Dokter (sendiri) |
| **Customers** | Pertumbuhan customer, paling aktif, retensi | Owner, Admin |
| **Pets** | Distribusi spesies/ras, status vaksinasi | Owner, Admin |
| **Inventory** | Nilai stok, low/overstock, pergerakan | Owner, Admin |
| **Products** | Terlaris, margin, turnover | Owner, Admin |
| **POS** | Transaksi kasir per periode/kasir | Owner, Admin, Kasir (sendiri) |
| **Invoices** | Status tagihan, aging piutang | Owner, Admin |
| **Pet Hotel** | Okupansi, revenue | Owner, Admin |
| **Grooming** | Revenue grooming, groomer terproduktif | Owner, Admin |
| **Loyalty** | Member aktif, poin terdistribusi, redemption | Owner, Admin |
| **Expenses** | Pengeluaran per kategori | Owner, Admin |
| **Activity** | Log aktivitas staf per user | Owner, Admin, Staff (sendiri) |
| **Audit Log** | Log lengkap seluruh perubahan data | Owner saja |

**Fitur laporan**:
- Filter rentang tanggal
- Export CSV/PDF/Excel
- Visualisasi grafik (line, bar, pie)
- **Scheduled reports**: kirim laporan otomatis ke email Owner (harian/mingguan/bulanan)

#### 5.3 Settings
| Sub-fitur | Deskripsi | Akses |
|---|---|---|
| **User Management — Staf** | CRUD akun Admin, Dokter, Kasir; reset PIN | Owner |
| **User Management — Customer** | CRUD akun Customer; reset PIN | Owner, Admin |
| **Konfigurasi Klinik** | Nama, logo, alamat, jam operasional | Owner |
| **Konfigurasi Penomoran** | Prefix invoice, medical record, booking | Owner |
| **Konfigurasi PIN & Keamanan** | Panjang PIN, max percobaan, lockout duration | Owner |
| **Konfigurasi Loyalty** | Rule poin, tier, benefit | Owner |
| **Konfigurasi Pajak** | Pajak default, jenis pajak | Owner |
| **Backup & Restore** | Backup on-demand/terjadwal (via Supabase) | Owner |
| **Audit Log** | Log lengkap seluruh aktivitas | Owner |
| **Integrations** | WhatsApp gateway, payment gateway, email SMTP | Owner |

---

## 9. Portal Customer

Portal di path `/portal` dengan autentikasi Username + PIN yang sama.

### 9.1 Fitur Portal
| Menu | Fitur |
|---|---|
| **Dashboard** | Ringkasan: appointment berikutnya, poin loyalty, tagihan belum bayar |
| **Profile** | Edit profil, ganti PIN, lihat tier membership |
| **Pets** | Lihat daftar hewan + Digital Pet ID Card (QR) |
| **Appointments** | Riwayat + buat appointment baru |
| **Medical Records** | Lihat ringkasan rekam medis (read-only) |
| **Invoices** | Riwayat tagihan + detail + **bayar online** (via payment gateway) |
| **Pet Hotel** | Riwayat penitipan + **live webcam** (jika diaktifkan) |
| **Grooming** | Riwayat grooming + booking grooming baru |
| **Loyalty** | Poin saat ini, tier, riwayat perolehan/redemption, voucher tersedia |
| **Shop** | Browse produk petshop + **wishlist** + **order online** (delivery/pickup) |
| **Promotions** | Promo aktif, voucher milik saya |
| **Feedback** | Beri rating & review setelah kunjungan |
| **Notifications** | Notifikasi: reminder appointment, promo, tagihan |

### 9.2 Fitur E-Commerce Ringan
Portal customer juga berfungsi sebagai **mini e-commerce**:
- Browse produk dengan kategori & search
- Add to cart / wishlist
- Checkout: pilih metode (pickup di klinik / delivery)
- Pembayaran: transfer bank / e-wallet / QRIS (via payment gateway)
- Tracking order
- Riwayat pesanan

> **Catatan**: Ini bukan pengganti POS penuh, tapi kanal penjualan tambahan untuk customer yang ingin belanja tanpa datang.

---

## 10. Model Data

### 10.1 Entitas Utama
| Entitas | Ringkasan |
|---|---|
| `users` | Akun login (Owner, Admin, Dokter, Kasir, Customer) |
| `customers` | Data pelanggan (registered / guest) |
| `pets` | Hewan peliharaan |
| `pet_weight_logs` | Riwayat berat badan |
| `pet_vaccines` | Riwayat & jadwal vaksinasi |
| `pet_diseases` | Riwayat penyakit |
| `pet_allergies` | Riwayat alergi |
| `appointments` | Jadwal kunjungan |
| `medical_records` | Rekam medis |
| `procedures` | Master layanan klinik |
| `rooms` | Kamar pet hotel |
| `pet_hotel_bookings` | Booking penitipan |
| `pet_hotel_logs` | Catatan harian penitipan |
| `grooming_services` | Master layanan grooming |
| `grooming_bookings` | Booking grooming |
| `grooming_records` | Catatan hasil grooming |
| `products` | Produk petshop |
| `product_variants` | Varian produk |
| `categories` | Kategori produk |
| `suppliers` | Vendor |
| `stock_movements` | Log pergerakan stok |
| `purchase_orders` | PO ke supplier |
| `purchase_order_items` | Item dalam PO |
| `invoices` | Tagihan |
| `invoice_items` | Item dalam invoice |
| `payments` | Pembayaran |
| `loyalty_members` | Data membership customer |
| `loyalty_transactions` | Transaksi poin (earn/redeem) |
| `loyalty_tiers` | Definisi tier |
| `promotions` | Promo/voucher |
| `promotion_usage` | Penggunaan promo |
| `expenses` | Pengeluaran operasional |
| `expense_categories` | Kategori pengeluaran |
| `customer_feedback` | Rating & review |
| `cash_shifts` | Shift kasir |
| `product_bundles` | Paket produk |
| `audit_logs` | Log aktivitas sistem |

### 10.2 Struktur `users`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `username` | String, unique | Login identifier |
| `pin_hash` | String | Hash PIN |
| `role` | Enum | OWNER / ADMIN / DOKTER / KASIR / CUSTOMER |
| `full_name` | String | Nama lengkap |
| `customer_id` | UUID, nullable | Link ke customers jika role = CUSTOMER |
| `created_by` | UUID, nullable | Siapa yang mendaftarkan |
| `failed_login_attempts` | Integer | Counter gagal login |
| `locked_until` | Timestamp, nullable | Durasi lockout |
| `is_active` | Boolean | Status aktif |
| `last_login_at` | Timestamp, nullable | Login terakhir |
| `created_at` / `updated_at` | Timestamp | Audit |

### 10.3 Enum Status
| Entitas | Enum |
|---|---|
| Appointment | WAITING, IN_PROGRESS, DONE, CANCELLED |
| MedicalRecord | OPEN, CLOSED |
| Room | AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE, INACTIVE |
| PetHotelBooking | BOOKED, CHECKED_IN, CHECKED_OUT, CANCELLED |
| GroomingBooking | BOOKED, IN_PROGRESS, DONE, CANCELLED |
| Product | ACTIVE, ARCHIVED |
| StockMovement | IN, OUT, RETURN, ADJUSTMENT, DAMAGED, EXPIRED, OPNAME |
| Invoice | UNPAID, PARTIAL_PAYMENT, PAID, CANCELLED |
| PurchaseOrder | DRAFT, SENT, PARTIAL_RECEIVED, RECEIVED, CANCELLED |
| Promotion | ACTIVE, EXPIRED, CANCELLED |
| User role | OWNER, ADMIN, DOKTER, KASIR, CUSTOMER |

### 10.4 Relasi Utama
```
Customer 1—N Pet
Pet 1—N PetWeightLog / PetVaccine / PetDisease / PetAllergy
Customer 1—N Appointment
Pet 1—N Appointment
Appointment 1—1 MedicalRecord (opsional, dibuat setelah DONE)
User(role=DOKTER) 1—N Appointment / MedicalRecord
Pet 1—N PetHotelBooking
Room 1—N PetHotelBooking
PetHotelBooking 1—N PetHotelLog
Pet 1—N GroomingBooking
GroomingBooking 1—1 GroomingRecord
Category 1—N Product
Supplier 1—N Product
Product 1—N StockMovement
Product 1—N ProductVariant
Product N—N ProductBundle
Customer 1—N Invoice
Invoice 1—N InvoiceItem
Invoice 1—N Payment
Customer 1—1 LoyaltyMember
LoyaltyMember 1—N LoyaltyTransaction
Supplier 1—N PurchaseOrder
PurchaseOrder 1—N PurchaseOrderItem
Customer 1—N CustomerFeedback
User 1—N AuditLog
User 1—N User (self-relation via createdBy)
```

---

## 11. Alur Kerja Utama

### 11.1 Alur Kunjungan Pasien End-to-End
1. Customer datang / booking via portal → Admin buat Appointment (`WAITING`)
2. Dokter panggil → status `IN_PROGRESS`
3. Dokter periksa → buat Medical Record
4. Appointment `DONE` → prompt "Buat Rekam Medis" jika belum
5. Admin buat Invoice (tambah item KONSULTASI/TINDAKAN/OBAT)
6. Apply promo/loyalty points jika ada
7. Customer bayar → status invoice auto-update
8. Kirim feedback request via WhatsApp/email
9. Poin loyalty otomatis ditambahkan

### 11.2 Alur Transaksi POS
1. Kasir pilih produk (grid / scan barcode)
2. Atur qty, diskon, pajak
3. Pilih customer (registered / walk-in)
4. Apply promo code / redeem loyalty points
5. Pilih metode pembayaran (cash / non-cash / mixed)
6. Validasi stok → deduct → buat Invoice + Payment → cetak struk
7. Poin loyalty otomatis ditambahkan

### 11.3 Alur Grooming
1. Customer booking grooming via portal / Admin buat booking
2. Pilih pet → paket grooming → groomer → slot
3. Status `BOOKED`, groomer notifikasi
4. Hewan datang → groomer mulai → status `IN_PROGRESS`
5. Grooming selesai → groomer catat hasil + foto before/after → status `DONE`
6. Admin buat Invoice (item GROOMING)
7. Customer bayar

### 11.4 Alur Purchase Order
1. Admin lihat Low Stock Alert / auto-suggest reorder
2. Buat PO: pilih supplier → produk → qty → harga
3. Status `DRAFT` → `SENT` (kirim ke supplier via email/WA)
4. Barang tiba → Admin receive PO → status `RECEIVED`
5. Auto-create StockMovement bertipe `IN`
6. Stok produk ter-update

### 11.5 Alur Loyalty
1. Customer transaksi → sistem hitung poin (berdasarkan tier multiplier)
2. Poin masuk ke `loyalty_transactions` (tipe EARN)
3. Customer cek poin di portal
4. Customer redeem poin saat checkout → `loyalty_transactions` (tipe REDEEM)
5. Akumulasi spending → auto-upgrade tier
6. Benefit tier otomatis applied saat transaksi

### 11.6 Alur E-Commerce Portal
1. Customer login portal → browse produk
2. Add to cart / wishlist
3. Checkout → pilih pickup / delivery
4. Pilih pembayaran (transfer / e-wallet / QRIS)
5. Payment gateway proses → callback ke sistem
6. Status order: `PENDING → PAID → PREPARING → READY / SHIPPED → COMPLETED`
7. Notifikasi ke customer via WhatsApp/email

### 11.7 Alur Pet Hotel End-to-End
1. Booking dibuat (oleh staff atau customer via portal) → status `BOOKED`, kamar `RESERVED`
2. Hewan tiba → staff Check-In → status `CHECKED_IN`, kamar `OCCUPIED`, `actualCheckInAt` tercatat
3. Selama masa inap, staff mencatat Pet Hotel Log harian (feeding/medicine/note)
4. Hewan dijemput → staff Check-Out → status `CHECKED_OUT`, kamar `AVAILABLE`
5. Sistem trigger pembuatan/penambahan item `PET_HOTEL` pada Invoice
6. Customer membayar invoice melalui Billing

### 11.8 Alur Login (Semua Role)
1. Pengguna membuka halaman login (Staff Dashboard atau `/portal`)
2. Masukkan Username dan PIN
3. Sistem validasi kredensial terhadap `pinHash`
4. Jika valid + `isActive = true` + tidak lockout → sesi dibuat, redirect sesuai role
5. Jika tidak valid → `failedLoginAttempts` +1; jika mencapai batas → akun dikunci
6. Setelah login berhasil, counter `failedLoginAttempts` direset, `lastLoginAt` diperbarui

### 11.9 Alur Pembuatan Akun Staf (Khusus Owner)
1. Owner login → Settings → User Management — Staf
2. Isi form: nama, role, username (validasi unik), PIN awal
3. Sistem buat `User` dengan `createdBy = Owner.id`
4. Owner sampaikan kredensial ke staf secara offline
5. Staf login pertama, disarankan ganti PIN
6. Seluruh proses tercatat di Audit Log

### 11.10 Alur Reset PIN
1. Pengguna lapor lupa PIN/terkunci ke pihak berwenang
2. Pihak berwenang buka Settings → pilih akun → "Reset PIN" → set PIN baru
3. Sistem hapus lockout, reset `failedLoginAttempts`
4. Aktivitas tercatat di Audit Log

---

## 12. Business Rules

| No | Aturan |
|---|---|
| 1 | SKU produk unik & immutable |
| 2 | Produk hanya bisa hard-delete jika belum pernah bertransaksi; jika sudah, archive |
| 3 | Kategori/Supplier hanya bisa dihapus jika tidak ada produk yang mereferensikan |
| 4 | Procedure/GroomingService tidak pernah hard-delete (selalu soft-delete) |
| 5 | Nomor antrian appointment reset harian |
| 6 | Medical Record wajib terhubung ke Appointment |
| 7 | Hanya dokter pembuat yang bisa edit Medical Record |
| 8 | Checkout POS: validasi stok (`stock ≥ qty`) wajib lolos |
| 9 | Pengurangan stok pakai atomic operation untuk cegah oversell |
| 10 | Total transaksi = (Subtotal − Diskon) + Pajak |
| 11 | Pembayaran cash ≥ total tagihan; kembalian auto-hitung |
| 12 | Status Invoice auto dari akumulasi Payment |
| 13 | Pembatalan Invoice dengan item PRODUK → auto-restock |
| 14 | Room hanya `OCCUPIED` jika ada booking `CHECKED_IN` |
| 15 | Vaksin "Overdue" jika tanggal hari ini > jatuh tempo |
| 16 | Customer tidak bisa hapus appointment/booking sendiri |
| 17 | Guest Customer bisa dikonversi ke Registered tanpa kehilangan riwayat |
| 18 | Username unik global lintas role |
| 19 | Akun Admin/Dokter/Kasir hanya bisa dibuat oleh Owner (validasi di API + RLS) |
| 20 | Akun Customer hanya bisa dibuat oleh Owner/Admin |
| 21 | Field `createdBy` wajib & immutable |
| 22 | Lockout otomatis setelah 5x gagal login |
| 23 | PIN tidak pernah ditampilkan plain text setelah dibuat/reset |
| 24 | Poin loyalty hanya bisa di-redeem jika cukup & tier mengizinkan |
| 25 | Promo tidak bisa stack (hanya 1 promo per transaksi, kecuali dikonfigurasi lain) |
| 26 | Voucher punya max usage & expiry date |
| 27 | PO yang sudah `RECEIVED` tidak bisa diubah |
| 28 | Expense yang sudah di-approve tidak bisa dihapus, hanya bisa di-reverse |
| 29 | Diskon POS: jika input dua jenis (% & fixed), pilih yang lebih menguntungkan bisnis |
| 30 | Room status `AVAILABLE` hanya jika tidak ada booking aktif `CHECKED_IN` |

---

## 13. Notifikasi & Reminder

| Trigger | Penerima | Kanal |
|---|---|---|
| Stok < minimum | Admin, Owner | In-app, WhatsApp |
| Vaksin jatuh tempo (H-14) | Admin, Customer | In-app, WhatsApp, Email |
| Appointment H-1 | Customer | WhatsApp, Email |
| Appointment DONE tanpa Medical Record | Dokter | In-app prompt |
| Pet hotel care needed hari ini | Admin, staf pet hotel | Dashboard |
| Invoice baru / status berubah | Customer | In-app portal, WhatsApp, Email |
| Booking dari portal | Admin | In-app |
| Akun baru dibuat | Owner, Admin (untuk Customer) | In-app |
| Akun terkunci | Pemilik akun, Owner/Admin | In-app |
| Promo baru aktif | Semua Customer | In-app portal, WhatsApp blast |
| Poin loyalty akan expired | Customer | WhatsApp, Email |
| Tier upgrade | Customer | WhatsApp, Email |
| Feedback request (H+1 pasca kunjungan) | Customer | WhatsApp, Email |
| Order e-commerce status update | Customer | In-app portal, WhatsApp |
| Low stock + auto-suggest PO | Admin, Owner | In-app, Email |

**Kanal notifikasi**:
- **In-app** (wajib) — via Supabase Realtime + toast notification
- **WhatsApp** (opsional) — via Fonnte / Wablas / Twilio API
- **Email** (opsional) — via Supabase Edge Functions + Resend/SendGrid

---

## 14. Kebutuhan Non-Fungsional

### 14.1 Performa
- Load halaman utama < 2 detik
- Search autocomplete < 500ms
- POS checkout concurrent tanpa oversell
- Login < 1 detik

### 14.2 Keamanan
- PIN di-hash (bcrypt/argon2) via Supabase Edge Functions
- Lockout seragam semua role
- **RLS (Row Level Security)** di Supabase untuk otorisasi level DB
- Validasi role di API/middleware
- Audit log lengkap termasuk `createdBy`
- Data sensitif (rekam medis) dibatasi per role
- HTTPS only, CSP headers, rate limiting

### 14.3 Ketersediaan
- Uptime ≥ 99.5% (Supabase SLA)
- Backup harian otomatis (Supabase)
- Soft-delete untuk entitas kritikal

### 14.4 Skalabilitas
- Supabase auto-scaling
- Desain DB siap multi-cabang (future)
- Modular per feature

### 14.5 Usability
- POS dioptimalkan untuk kecepatan (keyboard shortcut)
- Portal responsive (mobile-first)
- Numeric keypad untuk PIN input
- Dark mode support
- Keyboard navigation untuk power users

### 14.6 Auditability
- Audit log: user, aksi, entitas, before/after, timestamp
- Relasi `createdBy` di `users` untuk trace "siapa mendaftarkan siapa"

### 14.7 Lokalisasi
- Bahasa default: Indonesia
- Zona waktu: mengikuti lokasi klinik (WIB/WITA/WIT)
- Mata uang: Rupiah (Rp)

---

## 15. Di Luar Ruang Lingkup

Hal-hal berikut **tidak** termasuk dalam baseline ini, tapi bisa dikembangkan nanti:

1. **Multi-cabang / multi-tenant** — satu Owner, banyak cabang
2. **Multi-Owner** — lebih dari 1 Owner per instance
3. **Mobile app native** (iOS/Android) — saat ini web responsive
4. **Biometric login** (fingerprint/face ID)
5. **2FA / OTP** tambahan
6. **Sistem antrian display** (TV ruang tunggu)
7. **Integrasi lab eksternal** (hasil lab otomatis)
8. **Telemedicine** — konsultasi video call
9. **Pet insurance integration**
10. **AI-powered features** — prediksi stok, rekomendasi produk, diagnosis assist
11. **IoT integration** — smart feeder, temperature sensor di pet hotel
12. **Franchise management** — untuk bisnis yang mau scale jadi franchise
13. **Marketplace** — jual produk ke platform lain (Tokopedia, Shopee)
14. **Accounting integration** — sync ke Jurnal, Xero, QuickBooks
15. **Multi-bahasa** — saat ini hanya Indonesia

---

## 16. Item Terbuka

| No | Item | Status |
|---|---|---|
| 1 | Lampiran file (Medical Records, Pet Hotel Logs) — upload langsung atau URL? | TBD |
| 2 | Logika refund saat pembatalan invoice — tunai / kredit / kombinasi? | TBD |
| 3 | Format final username — bebas atau pola tertentu? | TBD |
| 4 | Panjang PIN final — 6 digit atau ada opsi lain? | TBD |
| 5 | Mekanisme penyampaian kredensial awal — tatap muka / cetak kartu / enkripsi? | TBD |
| 6 | Prosedur jika Owner lupa PIN (tidak ada role di atas Owner) | TBD |
| 7 | Hard-delete vs soft-delete policy — standardisasi lintas modul | TBD |
| 8 | Kebijakan diskon POS — pembulatan & aturan diskon % vs fixed | TBD |
| 9 | Payment gateway pilihan — Midtrans / Xendit / lainnya? | TBD |
| 10 | WhatsApp gateway pilihan — Fonnte / Wablas / Twilio? | TBD |
| 11 | Zona waktu default — WIB / WITA / WIT? | TBD |
| 12 | Loyalty points expiry — apakah ada masa kedaluwarsa? | TBD |
| 13 | E-commerce delivery — self-manage atau integrasi kurir (GoSend, GrabExpress)? | TBD |
| 14 | Live webcam pet hotel — IP camera brand & integration method? | TBD |
| 15 | Field sensitif Medical Record yang ditampilkan ke customer di portal | TBD |

> **Rekomendasi**: Adakan sesi requirement clarification dengan stakeholder sebelum masuk tahap technical design.

---

## 17. Glosarium

| Istilah | Definisi |
|---|---|
| Username | Nama pengguna unik lintas role, untuk login |
| PIN | Kode numerik rahasia pengganti password |
| Lockout | Akun terkunci sementara setelah gagal login berulang |
| createdBy | Field audit: siapa yang mendaftarkan akun |
| Walk-in / Guest | Customer yang transaksi tanpa daftar tetap |
| Registered Customer | Customer dengan data lengkap, bisa punya akun portal |
| Soft-delete | Hapus logis (ditandai nonaktif), data tetap ada |
| Hard-delete | Hapus permanen dari database |
| Low Stock | Stok di bawah minimum |
| Overstock | Stok di atas maksimum |
| Stock Opname | Audit fisik vs tercatat |
| PO (Purchase Order) | Pesanan pembelian ke supplier |
| Loyalty Points | Poin yang didapat customer dari transaksi |
| Tier | Level membership (Bronze/Silver/Gold/Platinum) |
| Promotion | Promo/voucher/diskon |
| Grooming | Layanan perawatan kecantikan hewan |
| RLS (Row Level Security) | Fitur Supabase untuk otorisasi level database |
| SPA | Single Page Application |
| RBAC | Role-Based Access Control |
| NPS | Net Promoter Score — metrik loyalitas customer |
| COGS | Cost of Goods Sold — harga pokok penjualan |
| Mixed Payment | Pembayaran gabungan cash + non-cash |

---

## Ringkasan Cakupan Sistem

### Modul Inti (5 Modul)
1. **CRM & Pasien** — Customers, Pets, Appointments, Medical Records, Pet Hotel, Grooming
2. **Petshop** — Products, Categories, Suppliers, Inventory, Purchase Orders
3. **POS & Billing** — POS Dashboard, Invoice, Payments, POS History
4. **Engagement & Loyalty** — Loyalty Program, Promotions, Customer Feedback
5. **Keuangan & Operasional** — Expenses, Reports, Settings

### Role Pengguna (5 Role)
- Owner, Admin, Dokter, Kasir, Customer

### Permukaan Aplikasi (2 Permukaan)
- Staff Dashboard (`/app/*`)
- Customer Portal (`/portal/*`)

### Teknologi Utama
- React + Vite + TypeScript + Tailwind + shadcn/ui
- React Router + TanStack Query + Zod
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Vercel (deployment)

---

**Dokumen ini merupakan PRD baseline final yang siap menjadi acuan tunggal untuk tahap technical design, implementasi, dan testing. Seluruh fitur, alur, dan aturan bisnis telah didefinisikan secara end-to-end tanpa duplikasi.** 🚀
