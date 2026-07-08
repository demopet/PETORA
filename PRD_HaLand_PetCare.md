# Product Requirements Document (PRD)
# HaLand PetCare
### Sistem Manajemen Terpadu Klinik Hewan & Petshop

| | |
|---|---|
| **Versi Dokumen** | 2.0 |
| **Tanggal** | 8 Juli 2026 |
| **Status** | Draft untuk Review |
| **Platform** | Web Application (Next.js + PostgreSQL) |
| **Pemilik Dokumen** | Product Team — HaLand PetCare |
| **Perubahan Utama vs v1.1** | (1) Skema login diseragamkan menjadi **Username + PIN** untuk seluruh role (Owner, Admin Klinik, Dokter, Customer) — tidak ada lagi email/password. (2) Aturan pendaftaran akun diperketat: seluruh role staf (Admin Klinik, Dokter) **hanya dapat didaftarkan oleh Owner**; role **Customer dapat didaftarkan oleh Owner maupun Admin Klinik**. Tidak ada self sign-up untuk role apapun. |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Masalah](#2-latar-belakang--masalah)
3. [Tujuan & Success Metrics](#3-tujuan--success-metrics)
4. [Target Pengguna & Persona](#4-target-pengguna--persona)
5. [Ruang Lingkup Produk](#5-ruang-lingkup-produk)
6. [Autentikasi & Pendaftaran Akun](#6-autentikasi--pendaftaran-akun)
7. [Role & Hak Akses Pengguna](#7-role--hak-akses-pengguna)
8. [Modul 1 — Klinik](#8-modul-1--klinik)
9. [Modul 2 — Petshop](#9-modul-2--petshop)
10. [Modul 3 — POS / Billing](#10-modul-3--pos--billing)
11. [Modul 4 — Reports](#11-modul-4--reports)
12. [Modul 5 — Settings](#12-modul-5--settings)
13. [Portal Customer](#13-portal-customer)
14. [Model Data (Entitas Utama)](#14-model-data-entitas-utama)
15. [Alur Kerja Utama (Key Workflows)](#15-alur-kerja-utama-key-workflows)
16. [Business Rules & Validasi](#16-business-rules--validasi)
17. [Notifikasi & Reminder](#17-notifikasi--reminder)
18. [Kebutuhan Non-Fungsional](#18-kebutuhan-non-fungsional)
19. [Arsitektur & Tumpukan Teknologi](#19-arsitektur--tumpukan-teknologi)
20. [Asumsi & Batasan](#20-asumsi--batasan)
21. [Di Luar Ruang Lingkup (Out of Scope)](#21-di-luar-ruang-lingkup-out-of-scope)
22. [Item Terbuka & Perlu Klarifikasi](#22-item-terbuka--perlu-klarifikasi)
23. [Glosarium](#23-glosarium)

---

## 1. Ringkasan Eksekutif

HaLand PetCare adalah sistem manajemen terpadu berbasis web untuk klinik hewan dan petshop, dibangun di atas **Next.js** (frontend + API layer) dan **PostgreSQL** (database). Aplikasi ini menggabungkan dua sisi operasional yang biasanya berjalan terpisah pada bisnis klinik hewan:

- **Operasional klinik** — pendaftaran pasien, penjadwalan appointment, rekam medis, dan penitipan hewan (pet hotel).
- **Operasional retail** — manajemen inventory produk, kategori, supplier, serta transaksi kasir (POS) dan penagihan (invoice/billing).

Kedua sisi ini terhubung dalam satu dashboard, satu basis data pelanggan dan hewan peliharaan, serta satu sistem invoice — sehingga transaksi obat, produk, dan layanan medis dapat digabung dalam satu tagihan per kunjungan pasien.

Aplikasi memiliki dua permukaan (surface) utama:

- **Staff Dashboard** — digunakan oleh Owner, Admin Klinik, dan Dokter untuk operasional harian.
- **Customer Portal** (`/portal`) — digunakan pelanggan untuk memantau data hewan peliharaan, appointment, invoice, dan pet hotel milik mereka sendiri secara self-service.

Seluruh pengguna — baik staf maupun customer — **login menggunakan kombinasi Username + PIN**. Tidak ada mekanisme pendaftaran mandiri (*self sign-up*) untuk role apapun: seluruh akun dibuat secara terkendali oleh pihak berwenang, dengan Owner sebagai otoritas tertinggi untuk seluruh akun staf, dan Admin Klinik diberi kewenangan tambahan khusus untuk mendaftarkan akun Customer.

---

## 2. Latar Belakang & Masalah

Klinik hewan skala kecil-menengah umumnya menghadapi masalah berikut:

- **Data pasien dan transaksi terpecah** di banyak tempat — buku catatan manual untuk rekam medis, aplikasi kasir terpisah untuk penjualan produk, dan spreadsheet untuk booking pet hotel.
- **Tidak ada visibilitas stok real-time**, sehingga sering terjadi kehabisan stok obat/produk tanpa peringatan dini, atau sebaliknya overstock yang mengikat modal.
- **Riwayat medis hewan tidak terpusat**, menyulitkan dokter melihat riwayat vaksinasi, alergi, dan penyakit sebelumnya saat pasien datang kembali (apalagi jika ditangani dokter berbeda).
- **Pelanggan tidak punya visibilitas mandiri** atas riwayat kunjungan, tagihan, atau jadwal vaksin hewan peliharaan mereka, sehingga harus selalu menghubungi klinik untuk informasi dasar.
- **Proses billing bercampur** antara penjualan produk, jasa konsultasi/tindakan medis, dan biaya pet hotel — sulit direkonsiliasi jika sistemnya terpisah-pisah.
- **Kontrol atas siapa yang boleh punya akun** kerap longgar pada sistem sejenis — misalnya staf dapat saling mendaftarkan akun tanpa sepengetahuan pemilik. HaLand PetCare secara khusus mengunci kewenangan pembuatan akun staf hanya pada Owner, untuk menghindari penyalahgunaan akses.

HaLand PetCare dirancang untuk menyatukan seluruh alur ini dalam satu platform, dengan kontrol akses berbasis peran serta kontrol pendaftaran akun yang ketat, agar setiap staf hanya melihat dan mengubah data yang relevan dengan tanggung jawabnya, dan agar tidak ada akun yang dibuat tanpa otorisasi yang jelas.

---

## 3. Tujuan & Success Metrics

### 3.1 Tujuan Produk

1. Menyediakan satu sumber kebenaran (*single source of truth*) untuk data pelanggan, hewan peliharaan, rekam medis, inventory, dan transaksi keuangan klinik.
2. Mengurangi waktu administratif staf klinik dalam pencatatan appointment, rekam medis, dan transaksi kasir.
3. Memberikan visibilitas stok dan peringatan dini (low stock) untuk mencegah kehabisan obat/produk penting.
4. Memberikan kanal self-service bagi pelanggan (portal) untuk mengurangi beban staf dalam menjawab pertanyaan rutin (jadwal, tagihan, riwayat).
5. Menyediakan laporan operasional dan finansial yang akurat untuk mendukung pengambilan keputusan Owner.
6. Memastikan setiap akun pengguna dalam sistem dapat ditelusuri asal-usul pendaftarannya (siapa mendaftarkan siapa) demi keamanan dan akuntabilitas.

### 3.2 Indikator Keberhasilan (Success Metrics) — Usulan

> Catatan: metrik berikut adalah usulan awal berdasarkan tujuan produk di atas; perlu disepakati bersama stakeholder bisnis sebagai bagian dari OKR peluncuran.

| Metrik | Target Awal (Usulan) |
|---|---|
| Waktu rata-rata login (username + PIN) | < 10 detik |
| Waktu rata-rata membuat 1 appointment baru | < 60 detik |
| Waktu rata-rata proses checkout POS (1 transaksi) | < 90 detik |
| Persentase produk dengan stok tercatat akurat (vs stok fisik) | > 95% setelah 1 bulan penggunaan |
| Adopsi portal customer (pelanggan aktif login per bulan) | > 30% dari pelanggan terdaftar dalam 3 bulan |
| Jumlah komplain "salah tagihan" | Menurun signifikan dibanding proses manual sebelumnya |
| Jumlah insiden akun tidak sah/tanpa otorisasi | 0 (nol) — seluruh akun harus tercatat pembuatnya |
| Uptime sistem | ≥ 99.5% |

---

## 4. Target Pengguna & Persona

### 4.1 Owner — "Pak Budi, Pemilik Klinik"
Pemilik 1–2 cabang klinik hewan. Tidak selalu di lokasi, butuh visibilitas menyeluruh (laporan revenue, aktivitas staf, audit log) dari mana saja. Peduli pada kontrol biaya, keamanan data, dan performa staf. Satu-satunya pihak yang berwenang mendaftarkan akun Admin Klinik dan Dokter, sehingga ia selalu tahu persis siapa saja yang memiliki akses ke sistem.

### 4.2 Admin Klinik — "Sinta, Resepsionis/Admin"
Berada di lokasi setiap hari, menangani pendaftaran pasien, penjadwalan, kasir, dan koordinasi antara pelanggan dan dokter. Butuh alur kerja yang cepat karena sering melayani banyak pelanggan sekaligus di jam sibuk. Diberi kewenangan terbatas untuk mendaftarkan akun Customer (bukan akun staf lain), sesuai kebutuhan operasional harian saat pelanggan baru datang.

### 4.3 Dokter — "drg. Rina, Dokter Hewan"
Fokus pada pemeriksaan pasien dan pencatatan medis. Butuh akses cepat ke riwayat medis pasien sebelumnya (alergi, penyakit, vaksin) tanpa harus mencari-cari dokumen. Tidak butuh (dan tidak boleh diberi) akses ke data keuangan/inventory, dan tidak memiliki kewenangan mendaftarkan akun apapun.

### 4.4 Customer — "Ibu Wati, Pemilik Kucing"
Ingin tahu kapan jadwal vaksin kucingnya, riwayat kunjungan terakhir, dan tagihan yang harus dibayar, tanpa harus menelepon klinik. Mengakses dari HP menggunakan Username dan PIN yang diberikan staf saat pertama kali didaftarkan.

---

## 5. Ruang Lingkup Produk

### 5.1 Struktur Aplikasi

Aplikasi terbagi menjadi dua sisi utama:

- **Sisi Staff** — digunakan oleh Owner, Admin Klinik, dan Dokter untuk menjalankan operasional klinik dan petshop.
- **Sisi Customer (Portal)** di path `/portal` — digunakan pelanggan untuk melihat data hewan peliharaan, appointment, invoice, dan pet hotel milik mereka sendiri.

Kedua sisi menggunakan **satu mekanisme login yang sama** (Username + PIN), namun tetap terpisah secara sesi/route berdasarkan role pengguna.

### 5.2 Modul Utama

| No | Modul | Fungsi Utama |
|---|---|---|
| 1 | **Klinik** | Customers, Pets, Appointments, Medical Records, Pet Hotel, Procedures |
| 2 | **Petshop** | Products, Categories, Suppliers, Inventory |
| 3 | **POS / Billing** | Kasir (POS), Invoice klinis, Riwayat transaksi |
| 4 | **Reports** | Laporan revenue, appointment, rekam medis, customer, pet, inventory, produk, POS, invoice, pet hotel, aktivitas, audit |
| 5 | **Settings** | User management (username & PIN), konfigurasi klinik, backup/restore, audit log |
| 6 | **Customer Portal** | Profile, Pets (read), Appointments, Medical Records (read), Invoices, Pet Hotel |

---

## 6. Autentikasi & Pendaftaran Akun

> Bagian ini adalah perubahan inti dari versi sebelumnya. Seluruh alur login dan pembuatan akun di dokumen ini mengacu ke aturan pada bab ini.

### 6.1 Skema Login: Username + PIN (Berlaku untuk Semua Role)

Seluruh pengguna sistem — **Owner, Admin Klinik, Dokter, maupun Customer** — login menggunakan kombinasi:

- **Username** — unik secara global di seluruh sistem (lintas role), tidak boleh duplikat.
- **PIN** — kode numerik rahasia, digunakan sebagai pengganti password konvensional untuk semua role (bukan hanya Customer seperti pada versi sebelumnya).

Layar login menampilkan dua input: `Username` dan `PIN`. Tidak ada field email/password di manapun dalam sistem untuk tujuan autentikasi login utama.

**Ketentuan teknis PIN (usulan, perlu konfirmasi final — lihat [§22](#22-item-terbuka--perlu-klarifikasi)):**

| Aspek | Ketentuan Usulan |
|---|---|
| Panjang PIN | 6 digit numerik |
| Penyimpanan | Di-hash (mis. bcrypt/argon2), tidak pernah disimpan sebagai plain text |
| Percobaan gagal | Maksimal 5 kali percobaan berturut-turut sebelum akun dikunci sementara (lockout) |
| Durasi lockout | 15 menit, atau sampai direset manual oleh pihak berwenang |
| Reset PIN | Tidak ada fitur "lupa PIN" mandiri berbasis email/SMS; reset PIN wajib dilakukan oleh pihak yang berwenang mendaftarkan role tersebut (lihat §6.3) |
| Ganti PIN mandiri | Setiap pengguna (semua role) dapat mengganti PIN miliknya sendiri setelah login, dengan memasukkan PIN lama sebagai verifikasi |

### 6.2 Prinsip Umum Pendaftaran Akun

Prinsip inti yang berlaku di seluruh sistem:

1. **Tidak ada self sign-up.** Tidak ada halaman "Daftar Akun" yang dapat diakses publik untuk role apapun, termasuk Customer.
2. **Akun Owner** dibuat satu kali pada saat instalasi/inisialisasi awal sistem (initial setup), tidak melalui form pendaftaran biasa. Sistem hanya mengizinkan satu akun Owner aktif per instance (kecuali dikonfigurasi lain untuk multi-owner di masa depan — lihat §21).
3. **Seluruh akun staf** (role `ADMIN_KLINIK` dan `DOKTER`) **hanya dapat dibuat, diubah, dinonaktifkan, atau dihapus oleh Owner.** Tidak ada role lain, termasuk sesama Admin Klinik, yang dapat mendaftarkan akun staf.
4. **Akun Customer** dapat dibuat oleh **Owner maupun Admin Klinik.** Ini adalah satu-satunya pengecualian terhadap aturan "hanya Owner" — dimaksudkan agar proses pendaftaran pelanggan baru di meja depan tidak harus menunggu Owner.
5. Setiap akun yang dibuat mencatat **`createdBy`** (User ID pembuat akun) untuk keperluan audit — sehingga selalu dapat ditelusuri siapa mendaftarkan siapa.
6. Dokter dan Customer **tidak memiliki kewenangan mendaftarkan akun apapun**, termasuk akun sesama Customer atau Dokter lain.

### 6.3 Matriks Kewenangan Pendaftaran & Pengelolaan Akun

| Role yang Didaftarkan | Siapa yang Boleh Mendaftarkan | Siapa yang Boleh Reset PIN | Siapa yang Boleh Menonaktifkan/Menghapus |
|---|---|---|---|
| Owner | Tidak melalui UI — hanya saat initial setup sistem | Prosedur pemulihan khusus di level infrastruktur (di luar cakupan aplikasi) | Tidak dapat dinonaktifkan melalui UI aplikasi |
| Admin Klinik | **Owner saja** | **Owner saja** | **Owner saja** |
| Dokter | **Owner saja** | **Owner saja** | **Owner saja** |
| Customer | **Owner atau Admin Klinik** | **Owner atau Admin Klinik** | **Owner atau Admin Klinik** |

> Dokter tidak muncul di kolom manapun sebagai pihak yang berwenang mendaftarkan/mereset/menghapus akun role apapun — Dokter murni sebagai pengguna, bukan pengelola akun.

### 6.4 Alur Pembuatan Username

- Saat akun dibuat (staf maupun Customer), pihak pendaftar (Owner atau Admin Klinik sesuai matriks di atas) menetapkan **Username** untuk pengguna baru.
- Sistem melakukan validasi **keunikan username secara real-time** (tidak boleh sama dengan username yang sudah ada, lintas role).
- Format username disarankan: huruf kecil, angka, dan underscore/titik, tanpa spasi (mis. `sinta.admin`, `drh.rina`, `wati08`) — format final perlu dikonfirmasi (lihat §22).
- PIN awal dapat: (a) ditetapkan manual oleh pendaftar, atau (b) di-generate otomatis oleh sistem lalu ditampilkan satu kali kepada pendaftar untuk disampaikan ke pengguna baru. Pengguna disarankan mengganti PIN saat login pertama.

### 6.5 Sesi & Logout

- Setelah login berhasil, sistem membuat sesi (mis. JWT atau session token) yang menyimpan `userId` dan `role`, digunakan untuk otorisasi RBAC di setiap pemanggilan API.
- Sesi Staff Dashboard dan sesi Customer Portal terpisah secara route/middleware, meskipun mekanisme login (username + PIN) sama persis.
- Logout mengakhiri sesi aktif; sistem dapat menyediakan opsi "logout dari semua perangkat" (usulan, lihat §22).

---

## 7. Role & Hak Akses Pengguna

Sistem memiliki **empat peran pengguna** dengan tingkat akses berbeda, mengikuti prinsip *least privilege* — setiap peran hanya memiliki akses ke modul yang relevan dengan tanggung jawabnya. Seluruh role login dengan mekanisme yang sama (Username + PIN, lihat [§6](#6-autentikasi--pendaftaran-akun)); perbedaan role terletak pada hak akses data/modul dan kewenangan pendaftaran akun, bukan pada cara login.

### 7.1 Matriks Ringkasan Akses per Modul

| Modul | Owner | Admin Klinik | Dokter | Customer |
|---|---|---|---|---|
| Klinik – Customers | Full CRUD | Full CRUD | Read-only | Read (data sendiri) |
| Klinik – Pets | Full CRUD | Full CRUD | Read-only | Read (milik sendiri) |
| Klinik – Appointments | Full CRUD | Full CRUD | Read + Update status | Read + Create (sendiri) |
| Klinik – Medical Records | Read + Delete | Full CRUD | Create/Update (milik sendiri), Read semua | Read ringkasan (sendiri) |
| Klinik – Pet Hotel | Full CRUD | Full CRUD | Read-only | Read + Create booking (sendiri) |
| Klinik – Procedures (master) | Full CRUD | Read-only | Read-only | – |
| Petshop – Products/Inventory | Full CRUD (termasuk delete/archive) | Read/Create/Update (no delete) | – | – |
| Petshop – Categories/Suppliers | Full CRUD | Read-only | – | – |
| POS / Billing | Full CRUD + Payment | Full CRUD + Payment | – | Read invoice sendiri |
| Reports | Semua tipe termasuk audit | Semua kecuali audit log | Terbatas: appointment, medical record, pet hotel, activity (performa sendiri) | – |
| Settings — Konfigurasi & Backup | Full | – | – | – |
| Settings — Akun Staf (Admin Klinik, Dokter) | **Full (satu-satunya)** | – | – | – |
| Settings — Akun Customer | Full | **Full (create, reset PIN, nonaktifkan)** | – | Edit profil & ganti PIN sendiri |

### 7.2 OWNER — Akses Penuh

Pemilik klinik. Satu-satunya akun dengan akses penuh ke semua modul dalam sistem, dan **satu-satunya pihak yang dapat mendaftarkan akun staf (Admin Klinik, Dokter)**.

**Modul yang dapat diakses:**
- ✅ Klinik (customers, pets, appointments, medical records, pet hotel, procedures)
- ✅ Petshop (products, categories, suppliers, inventory)
- ✅ POS / Billing (kasir, invoice, pembayaran)
- ✅ Reports (semua tipe laporan: revenue, appointments, medical records, customers, pets, inventory, products, POS, invoices, pet hotel, activity, audit)
- ✅ Settings (user management, konfigurasi klinik, backup/restore, audit log)

**Akses khusus Owner saja:**
- Membuat, mengubah, menonaktifkan, dan menghapus akun **Admin Klinik dan Dokter** — tidak ada role lain yang dapat melakukan ini.
- Menetapkan/mereset **Username dan PIN** staf.
- Membuat akun Customer (selain Admin Klinik, ini juga tersedia untuk Owner).
- Mengubah konfigurasi sistem (nama klinik, logo, prefix nomor invoice, jam operasional, dll).
- Melihat audit log lengkap seluruh aktivitas pengguna, termasuk log pembuatan/perubahan akun.
- Melakukan backup dan restore database.

### 7.3 ADMIN KLINIK — Akses Operasional

Pengelola harian klinik, bertugas mengelola pasien, appointment, inventory, dan billing. **Tidak memiliki kewenangan mendaftarkan akun staf lain** — kewenangan pendaftaran akun Admin Klinik terbatas hanya pada role Customer.

**Modul yang dapat diakses:**
- ✅ Klinik (customers, pets, appointments, medical records, pet hotel, procedures) — read/create/update/delete
- ✅ Petshop (products, inventory) — read/create/update
- ✅ POS / Billing (kasir, invoice, pembayaran) — read/create/update/payment
- ✅ Reports (semua laporan kecuali audit log)

**Yang tidak dapat diakses:**
- ❌ Settings (konfigurasi sistem) — hanya Owner
- ❌ Mendaftarkan, mengubah, atau menghapus akun **Admin Klinik atau Dokter** — hanya Owner yang berwenang
- ❌ Hapus/archive produk — hanya Owner
- ❌ Perubahan struktur data master (kategori, supplier, procedures) — hanya lihat

**Akses khusus:**
- **Dapat membuat akun Customer** (menetapkan username & PIN awal) untuk pelanggan yang ingin login ke portal — satu-satunya kewenangan pendaftaran akun yang dimiliki Admin Klinik.
- Dari modul POS/Billing dapat langsung menambahkan pelanggan baru dengan opsi pembuatan akun login.
- Dapat melakukan reset PIN dan menonaktifkan akun Customer.

### 7.4 DOKTER — Akses Klinis Terbatas

Praktisi kesehatan hewan yang fokus pada penanganan pasien dan rekam medis. **Tidak memiliki kewenangan mendaftarkan atau mengelola akun pengguna apapun** — Dokter murni pengguna sistem dengan sesi login sendiri (username + PIN yang didaftarkan oleh Owner).

**Modul Klinik (dengan batasan per sub-modul):**
- Customers: read-only (lihat data saja).
- Pets: read-only.
- Appointments: read + update status (WAITING → IN_PROGRESS → DONE).
- Medical Records: create + update milik sendiri; read semua rekam medis.
- Pet Hotel: read-only (lihat booking hewan).
- Procedures: read-only (lihat daftar layanan).

**Reports:**
- ✅ Hanya laporan: Appointments, Medical Records, Pet Hotel, Activity (untuk melihat performa sendiri).

**Yang tidak dapat diakses:**
- ❌ Petshop — tidak bisa lihat/kelola inventory/produk
- ❌ POS / Billing — tidak bisa kasir/buat invoice
- ❌ Settings — tidak bisa mengubah apapun, termasuk tidak bisa mendaftarkan akun apapun

### 7.5 CUSTOMER — Akses Portal Terbatas

Pelanggan klinik yang memiliki akun login, sekaligus pemilik hewan peliharaan. Mengakses sistem melalui portal khusus di path `/portal` menggunakan **Username + PIN** yang sama seperti staf, namun **akun hanya dapat dibuat oleh Owner atau Admin Klinik.**

**Fitur Portal Customer:**
- ✅ Profile — lihat & edit profil sendiri (nama, telepon, alamat), ganti PIN sendiri (username tidak dapat diubah sendiri — lihat §22)
- ✅ Pets — lihat daftar hewan peliharaan milik sendiri (tidak bisa buat/edit sendiri, hanya staff yang bisa)
- ✅ Appointments — lihat riwayat appointment hewan sendiri + buat appointment baru
- ✅ Medical Records — lihat ringkasan rekam medis hewan sendiri (read-only)
- ✅ Invoices — lihat riwayat tagihan milik sendiri + detail invoice
- ✅ Pet Hotel — lihat riwayat penitipan hewan milik sendiri + buat booking baru

**Yang tidak dapat diakses:**
- ❌ Area staff (klinik, petshop, pos, settings)
- ❌ Mengubah data hewan sendiri (harus datang ke klinik dan diedit oleh staff)
- ❌ Melihat data pelanggan/hewan milik pengguna lain
- ❌ Melihat laporan apapun
- ❌ Menghapus appointment/booking sendiri (harus menghubungi klinik)
- ❌ Mendaftarkan akun apapun, termasuk akun Customer lain (mis. anggota keluarga) — tetap harus melalui staff

**Pembuatan Akun Customer:**
Tidak tersedia fitur pendaftaran mandiri (*self sign-up*) melalui portal. Akun customer **hanya dapat dibuat oleh Owner atau Admin Klinik**, baik melalui modul Klinik–Customers maupun modul POS/Billing: saat staf mendaftarkan pelanggan baru, tersedia opsi **"Buatkan akun login portal"** yang secara otomatis membuat `User` dengan role `CUSTOMER`, lengkap dengan Username dan PIN awal. Autentikasi portal menggunakan skema **Username + PIN**, sama seperti staf, dan PIN dapat direset oleh Owner maupun Admin Klinik.

---

## 8. Modul 1 — Klinik

Modul ini mencakup seluruh operasi pelayanan medis dan manajemen pasien hewan, terdiri dari enam sub-fitur.

### 8.1 Customers (Manajemen Pelanggan)

| Fitur | Deskripsi |
|---|---|
| List Customers | Menampilkan daftar seluruh customer, dengan pencarian berdasarkan nama/telepon dan pagination |
| Tambah Customer | Form dengan field: nama, telepon, email, alamat, kontak darurat, foto (URL), catatan, opsi "Buatkan akun login portal" (username + PIN) |
| Ubah Customer | Edit seluruh field customer |
| Hapus Customer | Soft-delete, atau hard-delete jika customer belum memiliki transaksi/pet |
| Detail Customer | Menampilkan profil lengkap beserta daftar hewan miliknya dan riwayat appointment/invoice |
| Tandai sebagai Walk-in | Flag `isGuest` untuk pelanggan yang tidak terdaftar, digunakan saat transaksi kasir walk-in |

**Catatan teknis:** Customer terbagi menjadi dua jenis:
- **Registered Customer** — terdaftar dengan data lengkap, mungkin memiliki akun login portal (dibuat oleh Owner/Admin Klinik).
- **Guest Customer** — walk-in, dibuat otomatis saat transaksi kasir tanpa akun login.

### 8.2 Pets (Manajemen Hewan Peliharaan)

| Fitur | Deskripsi |
|---|---|
| List Pets | Menampilkan seluruh hewan per customer, dengan filter customer dan pencarian berdasarkan nama hewan |
| Tambah Pet | Form: nama, spesies (anjing/kucing/kelinci/dsb), ras, tanggal lahir, jenis kelamin, foto (URL) |
| Ubah Pet | Edit data pet (nama, ras, foto, dsb) |
| Hapus Pet | Soft-delete, atau hard-delete jika pet belum memiliki appointment/medical record |

**Detail Pet — 4 Tab:**

1. **Overview** — info dasar (nama, ras, umur terhitung otomatis dari tanggal lahir, berat terakhir).
2. **Weight History** — log berat badan per tanggal (tabel + grafik trend berat).
   - Tambah entry: berat (kg), tanggal (default hari ini).
   - Hapus entry.
3. **Vaccines** — riwayat vaksinasi.
   - Tambah vaksin: nama (misal "Rabies", "DHPP"), tanggal vaksin, tanggal jatuh tempo (auto-reminder 2 minggu sebelumnya).
   - Edit & hapus vaksin.
   - Indikator visual **"Overdue"** jika sudah melewati tanggal jatuh tempo.
4. **Medical History** — riwayat penyakit dan alergi.
   - Disease Records: nama penyakit, tanggal, catatan (misal "Gastroenteritis").
   - Allergies: alergen (misal "chicken"), catatan alergi (misal "gatal-gatal").
   - Tambah/edit/hapus disease & allergy.

### 8.3 Appointments (Penjadwalan Appointment)

**List Appointments** — tabel dengan kolom: tanggal, nomor antrian, customer, pet, dokter, status (`WAITING`/`IN_PROGRESS`/`DONE`/`CANCELLED`).

**Filter:**
- By tanggal (hari ini/kemarin/minggu ini/bulan ini)
- By dokter
- By status
- By customer

**Tambah Appointment:**
- Pilih customer (atau walk-in)
- Pilih pet milik customer
- Pilih dokter (opsional — bisa assign nanti)
- Tanggal & jam appointment (atau tanggal saja dengan jam otomatis dari slot ketersediaan)
- Catatan/keluhan awal
- Nomor antrian di-generate otomatis (per hari, reset harian)
- Flag **"Diajukan oleh customer"** jika appointment dibuat dari portal (untuk tracking self-request vs staff-created)

**Aksi lain:**
- Ubah Appointment — mengubah tanggal, dokter, status, catatan.
- Batalkan Appointment — status berubah menjadi `CANCELLED`.

**Alur status:**
```
WAITING → IN_PROGRESS (dokter mulai periksa) → DONE (selesai, rekam medis dibuat)
                                              ↘ CANCELLED (dari status manapun sebelum DONE)
```

> **Catatan penting:** saat status appointment berubah menjadi `DONE`, sistem menampilkan auto-prompt untuk **"Buat Rekam Medis"** apabila rekam medis untuk appointment tersebut belum dibuat.

### 8.4 Medical Records (Rekam Medis Pasien)

**List Medical Records** — tabel dengan kolom: nomor rekam medis (auto-generate, format `MR-YYYYMMDD-XXXX`), tanggal, customer, pet, dokter, diagnosis singkat.

**Filter** — by tanggal, by dokter, by customer, by status (`OPEN`/`CLOSED`).

**Tambah Medical Record — field:**
- Link ke appointment (**wajib**)
- Keluhan utama (*chief complaint*)
- Riwayat penyakit (*history*)
- Hasil pemeriksaan fisik (*physical exam*)
- Tanda vital: berat (kg), suhu (°C), detak jantung (bpm), laju napas (bpm)
- Diagnosis
- Treatment/terapi
- Resep (teks bebas atau terstruktur)
- Hasil lab (opsional)
- Catatan tambahan
- Lampiran (file/foto — mekanisme upload vs URL masih perlu ditentukan, lihat [§22](#22-item-terbuka--perlu-klarifikasi))

Nomor rekam medis auto-generate dengan prefix dari Settings; status default `OPEN`, dapat diubah menjadi `CLOSED` saat final/discharge.

**Aksi lain:**
- Ubah Medical Record — dokter dapat mengedit rekam medis miliknya sendiri, dengan *version tracking*.
- Hapus Medical Record — soft-delete, disimpan di arsip.
- View Detail — menampilkan rekam medis lengkap beserta link ke appointment dan invoice terkait (jika ada).

**Kontrol akses:** hanya dokter pemilik rekam medis yang dapat mengedit. Admin dan Owner hanya dapat membaca dan menghapus.

### 8.5 Pet Hotel (Penitipan Hewan)

#### 8.5.1 Pet Hotel Rooms (Manajemen Kamar)

| Fitur | Deskripsi |
|---|---|
| List Rooms | Tabel: nama/nomor kamar, tipe kamar, harga/malam, kapasitas, status (`AVAILABLE`/`RESERVED`/`OCCUPIED`/`MAINTENANCE`/`INACTIVE`) |
| Tambah Room | Nama kamar, nomor kamar (opsional), tipe kamar (`STANDARD`/`DELUXE`/`VIP`/`LARGE`), harga per malam (Rp), kapasitas, status awal `AVAILABLE`, status kebersihan (`CLEAN`/`DIRTY`/`UNDER_CLEANING`), status maintenance (`OPERATIONAL`/`UNDER_MAINTENANCE`) |
| Ubah Room | Edit nama, tipe, harga, kapasitas, status |
| Hapus Room | Soft-delete untuk kamar yang tidak dipakai lagi |
| Dashboard Kamar | Visual board seperti sistem booking hotel, grid kamar dengan warna berbeda per status |

#### 8.5.2 Pet Hotel Bookings (Penjadwalan Penitipan)

**List Bookings** — tabel: nomor booking, pet, customer, kamar, check-in rencana, check-out rencana, status (`BOOKED`/`CHECKED_IN`/`CHECKED_OUT`/`CANCELLED`), harga total.

**Filter** — by status, by tanggal, by kamar, by customer.

**Tambah Booking:**
- Pilih pet dan customer (auto-fill jika pet sudah punya owner)
- Check-in date & check-out date (rencana)
- Pilih kamar (sistem dapat men-*suggest* kamar available pada rentang tanggal tersebut)
- Harga per malam auto-fill dari tarif kamar, dapat di-*override*
- Total harga = (check-out − check-in) × harga per malam
- Catatan khusus (preferensi makanan, jadwal obat, catatan perilaku)
- Nomor booking auto-generate (prefix `BK-YYYYMMDD-XXXX`)
- Flag "Diajukan oleh customer" jika booking dibuat dari portal

**Check-In Booking:**
- Update `actualCheckInAt` (timestamp)
- Status berubah: `BOOKED` → `CHECKED_IN`
- Konfirmasi kamar yang ditempati (dapat berbeda dari rencana jika kamar awal sedang terpakai)
- Sistem otomatis mengubah status kamar menjadi `OCCUPIED`

**Check-Out Booking:**
- Update `actualCheckOutAt` (timestamp)
- Status berubah: `CHECKED_IN` → `CHECKED_OUT`
- Hitung biaya final (jika actual checkout berbeda dari rencana, tentukan apakah dikenakan biaya per hari tambahan)
- Trigger pembuatan invoice dari pet hotel booking (atau auto-tambah ke invoice jika ada transaksi lain)
- Sistem otomatis mengubah status kamar: `OCCUPIED` → `AVAILABLE`

**Aksi lain:**
- Perpanjangan Booking — update `checkOutDate`, hitung biaya tambahan, update total harga invoice (jika sudah dibuat).
- Batalkan Booking — status menjadi `CANCELLED`, kamar kembali `AVAILABLE` (atau `RESERVED` jika ada booking lain), dengan opsi refund partial jika ada pembayaran di muka.

#### 8.5.3 Pet Hotel Logs (Catatan Harian Penitipan)

**List Logs** — per booking, tabel: tanggal, tipe (`FEEDING`/`MEDICINE`/`NOTE`), deskripsi, foto (opsional).

**Tambah Log — tipe log:**
- `FEEDING` — pemberian makanan (jam, jumlah, jenis makanan, respon hewan)
- `MEDICINE` — pemberian obat (nama obat, dosis, jam, respon)
- `NOTE` — catatan umum (perilaku, kesehatan, aktivitas, foto)

Edit Log — ubah deskripsi & foto. Hapus Log — soft-delete.

> **Fitur tambahan:** setiap hari staff dapat melihat notifikasi **"Pet Hotel Care Needed Today"** berisi daftar hewan yang perlu diberi makan/obat sesuai jadwal dari catatan booking.

### 8.6 Procedures (Master Data Layanan Klinik)

| Fitur | Deskripsi |
|---|---|
| List Procedures | Tabel: kode, nama layanan, deskripsi, harga (Rp) |
| Tambah Procedure | Kode unik, nama, deskripsi, harga (Rp), kategori (opsional: konsultasi/tindakan/vaksinasi/grooming) |
| Ubah Procedure | Edit nama, deskripsi, harga |
| Hapus Procedure | Selalu soft-delete (tidak pernah hard-delete, lihat §16 aturan #4) |

---

## 9. Modul 2 — Petshop

### 9.1 Products (Produk)

| Fitur | Deskripsi |
|---|---|
| List Products | Tabel: SKU, nama, kategori, supplier, harga jual, stok, status (`ACTIVE`/`ARCHIVED`) |
| Tambah Product | SKU (unik, tidak dapat diubah), nama, kategori, supplier, harga beli, harga jual, stok awal, stok minimum, stok maksimum, foto (URL) |
| Ubah Product | Edit seluruh field kecuali SKU |
| Hapus/Archive Product | Hard-delete hanya jika belum pernah bertransaksi; jika sudah, otomatis di-archive (hanya Owner) |
| Detail Product | Info lengkap + riwayat `StockMovement` |

### 9.2 Categories & Suppliers

| Fitur | Deskripsi |
|---|---|
| List/Tambah/Ubah Category | Nama kategori, deskripsi |
| List/Tambah/Ubah Supplier | Nama, kontak, alamat, catatan |
| Hapus Category/Supplier | Hanya jika tidak ada Product yang mereferensikannya |

### 9.3 Inventory & Stock Management

| Fitur | Deskripsi |
|---|---|
| Stock Dashboard | Ringkasan stok, indikator Low Stock/Overstock |
| Stock Movement | Tabel pergerakan stok: tipe (`IN`/`OUT`/`RETURN`/`ADJUSTMENT`/`DAMAGED`/`EXPIRED`/`CORRECTION`/`OPNAME`), qty, tanggal, catatan, user pencatat |
| Stock Opname | Fitur pencocokan stok fisik vs tercatat, menghasilkan `StockMovement` tipe `OPNAME`/`CORRECTION` |
| Low Stock Alert | Notifikasi otomatis saat stok < stok minimum |

---

## 10. Modul 3 — POS / Billing

### 10.1 POS Dashboard (Kasir)

| Fitur | Deskripsi |
|---|---|
| Grid Produk | Pilih produk dengan pencarian cepat/barcode (opsional) |
| Keranjang | Tambah/kurangi qty, hapus item, lihat subtotal |
| Pilih Customer | Registered Customer (search) atau Walk-in (guest, auto-create) |
| Diskon & Pajak | Input diskon (persen/fixed) dan pajak per transaksi |
| Metode Pembayaran | `CASH` / `NON_CASH` |
| Checkout | Validasi stok, deduct stok, buat Invoice + Payment, cetak struk |

### 10.2 Invoice & Billing

**Jenis Invoice:**
- Invoice POS (murni penjualan produk)
- Invoice Klinis (konsultasi/tindakan/obat dari kunjungan)
- Invoice Pet Hotel (dari booking penitipan)
- Invoice gabungan (produk + jasa medis + pet hotel dalam satu tagihan per kunjungan)

**Pembayaran Cicilan:**
- Saat invoice berstatus `UNPAID`, dapat dilakukan **"Record Payment"** dengan input metode pembayaran dan jumlah pembayaran.
- Sistem otomatis memperbarui status berdasarkan jumlah pembayaran:

  | Kondisi | Status |
  |---|---|
  | Pembayaran = 0 | `UNPAID` |
  | 0 < Pembayaran < Total | `PARTIAL_PAYMENT` |
  | Pembayaran ≥ Total | `PAID` |

- Pembayaran dapat dilakukan berkali-kali hingga lunas, dengan riwayat tercatat pada tabel `Payment`.

**Batalkan Invoice:**
- Status berubah dari `UNPAID`/`PARTIAL_PAYMENT`/`PAID` menjadi `CANCELLED`.
- Jika invoice memiliki item bertipe `PRODUK`, sistem otomatis me-*restore* stok produk (mengembalikan qty ke stok awal).
- Jika sudah ada pembayaran, tersedia opsi refund atau credit (logika refund masih perlu ditentukan — lihat [§22](#22-item-terbuka--perlu-klarifikasi)).

### 10.3 POS History — Riwayat Transaksi

**List Transactions** — tabel: nomor invoice, customer, tanggal, total, metode pembayaran, kasir (user yang membuat transaksi).

**Filter (usulan, perlu konfirmasi final — lihat §22):**
- By rentang tanggal
- By metode pembayaran (cash/non-cash)
- By kasir/staff pembuat transaksi
- By status invoice

**Aksi tambahan (usulan):**
- Lihat detail transaksi (drill-down ke invoice terkait).
- Export riwayat transaksi ke CSV/Excel untuk rekonsiliasi harian.
- Cetak ulang struk dari transaksi lama.

---

## 11. Modul 4 — Reports

> Modul Reports disebutkan pada matriks akses di sumber requirement, namun rincian per jenis laporan belum dijabarkan detail di dokumen asal. Bagian ini disusun berdasarkan daftar tipe laporan yang disebutkan pada bagian Role & Akses, dan perlu divalidasi/diperluas bersama stakeholder.

Berdasarkan hak akses Owner ("semua tipe laporan") dan Admin Klinik ("semua laporan kecuali audit log"), tipe laporan yang perlu tersedia dalam sistem meliputi:

| Laporan | Deskripsi (usulan) | Akses |
|---|---|---|
| Revenue Report | Ringkasan pendapatan per periode (harian/mingguan/bulanan), dipecah per sumber (POS produk, konsultasi, tindakan, pet hotel) | Owner, Admin |
| Appointments Report | Jumlah & tren appointment per dokter/periode/status | Owner, Admin, Dokter (data sendiri) |
| Medical Records Report | Statistik diagnosis, jumlah rekam medis per dokter/periode | Owner, Admin, Dokter (data sendiri) |
| Customers Report | Pertumbuhan jumlah customer, customer paling aktif | Owner, Admin |
| Pets Report | Distribusi spesies/ras, status vaksinasi keseluruhan | Owner, Admin |
| Inventory Report | Nilai stok, produk low/overstock, pergerakan stok per periode | Owner, Admin |
| Products Report | Produk terlaris, margin per produk | Owner, Admin |
| POS Report | Ringkasan transaksi kasir per periode/kasir | Owner, Admin |
| Invoices Report | Status tagihan (unpaid/partial/paid), umur piutang (*aging*) | Owner, Admin |
| Pet Hotel Report | Okupansi kamar, revenue pet hotel per periode | Owner, Admin, Dokter (read-only, performa terbatas) |
| Activity Report | Log aktivitas staf (transaksi, perubahan data) per user | Owner, Admin, Dokter (aktivitas sendiri) |
| Audit Log | Log lengkap seluruh perubahan data sistem, **termasuk log pembuatan/reset/penghapusan akun** (siapa mendaftarkan siapa, kapan, dari mana) | **Owner saja** |

Setiap laporan idealnya mendukung filter rentang tanggal, ekspor ke CSV/PDF, dan visualisasi ringkas (grafik) untuk laporan yang bersifat tren (revenue, appointment, inventory).

---

## 12. Modul 5 — Settings

> Modul Settings disebutkan pada bagian Role & Akses sebagai akses eksklusif Owner untuk konfigurasi sistem dan akun staf, dengan pengecualian pendaftaran akun Customer yang juga tersedia untuk Admin Klinik (lihat [§6](#6-autentikasi--pendaftaran-akun)).

| Sub-fitur | Deskripsi | Akses |
|---|---|---|
| User Management — Staf | Membuat, mengubah, menonaktifkan, dan menghapus akun **Admin Klinik dan Dokter**; menetapkan/mereset **Username & PIN** staf | **Owner saja** |
| User Management — Customer | Membuat, mengubah, menonaktifkan akun **Customer**; mereset PIN Customer | Owner, Admin Klinik |
| Konfigurasi Klinik | Nama klinik, logo, alamat, jam operasional | Owner saja |
| Konfigurasi Penomoran | Prefix nomor invoice (`INV-`), rekam medis (`MR-`), booking pet hotel (`BK-`) | Owner saja |
| Konfigurasi PIN & Keamanan Login | Panjang PIN, jumlah maksimal percobaan gagal, durasi lockout (lihat §6.1) | Owner saja |
| Backup & Restore | Melakukan backup database on-demand/terjadwal, serta restore dari backup tertentu | Owner saja |
| Audit Log | Melihat log lengkap seluruh aktivitas sistem: user, aksi, entitas yang diubah, timestamp, termasuk log pendaftaran akun | Owner saja |

---

## 13. Portal Customer

Portal customer diakses melalui path `/portal` dengan autentikasi **Username + PIN** — mekanisme yang sama dengan Staff Dashboard, hanya berbeda pada scope akses dan sesi. Berikut ringkasan fitur (detail lengkap mengikuti hak akses pada [§7.5](#75-customer--akses-portal-terbatas)):

| Menu | Aksi yang Tersedia |
|---|---|
| Login | Masuk dengan Username + PIN yang diberikan oleh Owner/Admin Klinik saat akun dibuat |
| Profile | Lihat & edit profil sendiri, ganti PIN |
| Pets | Lihat daftar hewan peliharaan milik sendiri (read-only) |
| Appointments | Lihat riwayat + buat appointment baru (masuk sebagai status `WAITING`, flag "diajukan oleh customer") |
| Medical Records | Lihat ringkasan rekam medis hewan sendiri (read-only, tanpa detail teknis internal seperti catatan dokter yang bersifat sensitif — perlu didefinisikan field mana yang ditampilkan) |
| Invoices | Lihat riwayat tagihan + detail invoice milik sendiri |
| Pet Hotel | Lihat riwayat penitipan + buat booking baru |

**Catatan alur:** Appointment dan booking pet hotel yang diajukan customer melalui portal tetap memerlukan konfirmasi/pengelolaan lanjutan oleh staff (misalnya assignment dokter atau kamar final), karena customer tidak memiliki akses untuk menentukan slot/kamar secara langsung di luar yang tersedia sebagai pilihan.

**Catatan akun:** Customer tidak dapat mendaftar sendiri di portal ini — tombol/halaman pendaftaran mandiri sengaja tidak disediakan. Jika pelanggan baru mengunjungi portal tanpa akun, halaman login menampilkan pesan yang mengarahkan mereka untuk menghubungi/mengunjungi klinik agar didaftarkan oleh staf.

---

## 14. Model Data (Entitas Utama)

> Diagram relasi berikut disusun berdasarkan entitas yang disebutkan secara eksplisit maupun implisit dalam requirement. Nama field final mengikuti konvensi camelCase seperti pada dokumen sumber (`isGuest`, `actualCheckInAt`, dsb).

### 14.1 Daftar Entitas

| Entitas | Ringkasan |
|---|---|
| `User` | Akun login sistem: Owner, Admin Klinik, Dokter, Customer (role-based), autentikasi via `username` + `pinHash` |
| `Customer` | Data pelanggan (registered / guest) |
| `Pet` | Hewan peliharaan, terkait ke `Customer` |
| `PetWeightLog` | Riwayat berat badan pet |
| `PetVaccine` | Riwayat & jadwal vaksinasi pet |
| `PetDisease` | Riwayat penyakit pet |
| `PetAllergy` | Riwayat alergi pet |
| `Appointment` | Jadwal kunjungan klinik |
| `MedicalRecord` | Rekam medis, terkait ke `Appointment` |
| `Procedure` | Master data layanan/tindakan klinik |
| `Room` | Kamar pet hotel |
| `PetHotelBooking` | Booking penitipan hewan |
| `PetHotelLog` | Catatan harian selama masa inap |
| `Product` | Produk petshop |
| `Category` | Kategori produk |
| `Supplier` | Vendor/pemasok produk |
| `StockMovement` | Log pergerakan stok produk |
| `Invoice` | Tagihan (POS maupun klinis) |
| `InvoiceItem` | Item dalam invoice (tipe: PRODUK/KONSULTASI/TINDAKAN/OBAT/PET_HOTEL) |
| `Payment` | Catatan pembayaran terhadap invoice |
| `AuditLog` | Log perubahan data sistem, termasuk log pendaftaran/reset/penghapusan akun |

### 14.2 Struktur Field Utama `User` (Detail Baru)

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `username` | String, unik | Digunakan untuk login, lintas role |
| `pinHash` | String | Hash dari PIN (bcrypt/argon2), tidak pernah disimpan plain text |
| `role` | Enum | `OWNER` / `ADMIN_KLINIK` / `DOKTER` / `CUSTOMER` |
| `fullName` | String | Nama lengkap pengguna |
| `customerId` | UUID (nullable) | Relasi ke `Customer` jika role = `CUSTOMER` |
| `createdBy` | UUID (nullable) | `User.id` pembuat akun ini — null hanya untuk akun Owner awal |
| `failedLoginAttempts` | Integer | Counter percobaan login gagal berturut-turut |
| `lockedUntil` | Timestamp (nullable) | Waktu sampai akun dapat login kembali setelah lockout |
| `isActive` | Boolean | Status aktif/nonaktif akun |
| `lastLoginAt` | Timestamp (nullable) | Waktu login terakhir |
| `createdAt` / `updatedAt` | Timestamp | Standar audit |

**Aturan integritas terkait `createdBy` (lihat juga §16 Business Rules):**
- Jika `role = ADMIN_KLINIK` atau `role = DOKTER`, maka `createdBy` **wajib** merujuk ke `User` dengan `role = OWNER`.
- Jika `role = CUSTOMER`, maka `createdBy` **wajib** merujuk ke `User` dengan `role = OWNER` atau `role = ADMIN_KLINIK`.

### 14.3 Relasi Utama (Ringkasan)

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
Category 1—N Product
Supplier 1—N Product
Product 1—N StockMovement
Customer 1—N Invoice
Invoice 1—N InvoiceItem
Invoice 1—N Payment
InvoiceItem N—1 Product / Procedure / PetHotelBooking (tergantung tipe item)
User 1—N AuditLog
User 1—N User (self-relation via createdBy: siapa mendaftarkan siapa)
```

### 14.4 Enumerasi Status Penting

| Entitas | Enum Status |
|---|---|
| Appointment | `WAITING`, `IN_PROGRESS`, `DONE`, `CANCELLED` |
| MedicalRecord | `OPEN`, `CLOSED` |
| Room | `AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`, `INACTIVE` |
| Room (kebersihan) | `CLEAN`, `DIRTY`, `UNDER_CLEANING` |
| Room (maintenance) | `OPERATIONAL`, `UNDER_MAINTENANCE` |
| PetHotelBooking | `BOOKED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED` |
| Product | `ACTIVE`, `ARCHIVED` |
| StockMovement (tipe) | `IN`, `OUT`, `RETURN`, `ADJUSTMENT`, `DAMAGED`, `EXPIRED`, `CORRECTION`, `OPNAME` |
| Invoice | `UNPAID`, `PARTIAL_PAYMENT`, `PAID`, `CANCELLED` |
| Payment (metode) | `CASH`, `NON_CASH` |
| InvoiceItem (tipe) | `PRODUK`, `KONSULTASI`, `TINDAKAN`, `OBAT`, `PET_HOTEL` |
| User (role) | `OWNER`, `ADMIN_KLINIK`, `DOKTER`, `CUSTOMER` |

---

## 15. Alur Kerja Utama (Key Workflows)

### 15.1 Alur Kunjungan Pasien End-to-End

1. Customer datang (atau membuat appointment via portal) → Admin membuat/mengonfirmasi **Appointment** (status `WAITING`), nomor antrian ter-generate.
2. Dokter memanggil pasien → status diubah menjadi `IN_PROGRESS`.
3. Dokter melakukan pemeriksaan → membuat **Medical Record** terkait appointment (diagnosis, treatment, resep).
4. Appointment ditandai `DONE` → sistem prompt "Buat Rekam Medis" jika belum ada.
5. Admin membuat **Invoice klinis** dari kunjungan tersebut: menambahkan item `KONSULTASI`, `TINDAKAN`, dan/atau `OBAT` sesuai resep dokter.
6. Customer melakukan pembayaran (penuh atau cicilan) di Billing → status invoice ter-update otomatis.
7. Jika lunas, invoice berstatus `PAID`; struk/kuitansi dapat dicetak.

### 15.2 Alur Transaksi POS Sederhana (Penjualan Produk)

1. Kasir memilih produk dari grid POS → produk masuk ke keranjang.
2. Kasir menyesuaikan qty, menerapkan diskon/pajak jika ada.
3. Kasir memilih customer (registered/walk-in) → memilih metode pembayaran → input jumlah bayar.
4. Sistem validasi stok tersedia → deduct stok → buat Invoice (`PRODUK`) berstatus `PAID`/`PARTIAL_PAYMENT` → rekam Payment → cetak struk.

### 15.3 Alur Pet Hotel End-to-End

1. Booking dibuat (oleh staff atau customer via portal) → status `BOOKED`, kamar berubah status `RESERVED` (jika direservasi eksplisit).
2. Hewan tiba → staff melakukan Check-In → status `CHECKED_IN`, kamar `OCCUPIED`, `actualCheckInAt` tercatat.
3. Selama masa inap, staff mencatat **Pet Hotel Log** harian (feeding/medicine/note).
4. Hewan dijemput → staff melakukan Check-Out → status `CHECKED_OUT`, kamar kembali `AVAILABLE`, `actualCheckOutAt` tercatat, biaya final dihitung.
5. Sistem men-trigger pembuatan/penambahan item `PET_HOTEL` pada Invoice.
6. Customer membayar invoice melalui Billing.

### 15.4 Alur Login (Semua Role)

1. Pengguna membuka halaman login (Staff Dashboard atau `/portal`).
2. Pengguna memasukkan **Username** dan **PIN**.
3. Sistem memvalidasi kredensial terhadap `pinHash` yang tersimpan.
4. Jika valid dan akun `isActive = true` serta tidak dalam status lockout → sesi dibuat, redirect sesuai role (Staff Dashboard untuk Owner/Admin/Dokter, `/portal` untuk Customer).
5. Jika tidak valid → `failedLoginAttempts` bertambah 1; jika mencapai batas maksimum → akun dikunci (`lockedUntil` diset) dan pengguna diberi pesan untuk menghubungi pihak berwenang (Owner untuk staf, Owner/Admin Klinik untuk Customer) guna reset.
6. Setelah login berhasil, counter `failedLoginAttempts` direset ke 0 dan `lastLoginAt` diperbarui.

### 15.5 Alur Pembuatan Akun Staf (Admin Klinik / Dokter) — Khusus Owner

1. Owner login ke Staff Dashboard → membuka Settings → User Management — Staf.
2. Owner mengisi form: nama lengkap, role (`ADMIN_KLINIK` atau `DOKTER`), username (divalidasi unik), dan PIN awal (manual atau auto-generate).
3. Sistem membuat `User` baru dengan `createdBy = Owner.id`.
4. Owner menyampaikan Username & PIN awal kepada staf yang bersangkutan secara langsung/offline (di luar sistem, demi keamanan — tidak dikirim otomatis via email/SMS pada versi ini).
5. Staf login pertama kali dan disarankan mengganti PIN.
6. Seluruh proses ini tercatat di Audit Log.

> Tidak ada jalur lain untuk membuat akun Admin Klinik atau Dokter selain melalui langkah di atas oleh Owner.

### 15.6 Alur Pembuatan Akun Customer — Owner atau Admin Klinik

1. Pelanggan baru datang ke klinik (atau sudah menjadi Guest Customer dari transaksi sebelumnya).
2. **Owner atau Admin Klinik** menambahkan/memilih Customer di modul Klinik–Customers atau POS/Billing.
3. Staf yang berwenang mencentang opsi **"Buatkan akun login portal"**.
4. Sistem membuat `User` baru dengan role `CUSTOMER`, `createdBy` diisi otomatis dengan ID staf pembuat (Owner atau Admin Klinik), terhubung ke `Customer` terkait, dan men-generate Username + PIN awal (atau meminta staf menetapkan PIN).
5. Customer dapat login ke `/portal` menggunakan kredensial tersebut dan mengganti PIN sendiri kapan saja.

### 15.7 Alur Reset PIN

1. Pengguna (staf atau Customer) melaporkan lupa PIN atau terkunci (lockout) kepada pihak berwenang sesuai matriks [§6.3](#63-matriks-kewenangan-pendaftaran--pengelolaan-akun):
   - Akun Admin Klinik/Dokter → hanya Owner yang dapat mereset.
   - Akun Customer → Owner atau Admin Klinik dapat mereset.
2. Pihak berwenang membuka Settings/User Management → memilih akun terkait → "Reset PIN" → menetapkan PIN baru.
3. Sistem menghapus status lockout (jika ada) dan mereset `failedLoginAttempts` ke 0.
4. Aktivitas reset tercatat di Audit Log (siapa mereset PIN siapa, kapan).

### 15.8 Alur Low Stock Alert

1. Setiap kali `StockMovement` bertipe `OUT` (atau tipe pengurangan lain) tercatat, sistem mengevaluasi ulang `product.stock` terhadap `stockMinimum`.
2. Jika `stock < stockMinimum`, produk masuk daftar Low Stock di Stock Dashboard dan memicu notifikasi ke Admin/Owner.
3. Admin melakukan pemesanan ulang ke supplier, lalu mencatat `StockMovement` bertipe `IN` saat barang tiba.

---

## 16. Business Rules & Validasi

| No | Aturan |
|---|---|
| 1 | SKU produk bersifat unik dan tidak dapat diubah setelah dibuat. |
| 2 | Produk hanya dapat dihapus permanen jika tidak pernah direferensikan oleh `InvoiceItem` atau `StockMovement` manapun; jika pernah, hanya dapat di-*archive*. |
| 3 | Kategori dan Supplier hanya dapat dihapus jika tidak ada Product yang mereferensikannya. |
| 4 | Procedure tidak pernah dihapus secara permanen (selalu soft-delete) karena berpotensi direferensikan invoice historis. |
| 5 | Nomor antrian Appointment di-generate per hari dan reset setiap hari baru. |
| 6 | Medical Record wajib terhubung ke satu Appointment. |
| 7 | Hanya dokter pemilik (pembuat) Medical Record yang dapat mengedit rekam medis tersebut. |
| 8 | Saat checkout POS, validasi stok (`stock ≥ qty`) wajib lolos untuk semua item sebelum transaksi dapat diproses. |
| 9 | Pengurangan stok saat checkout menggunakan operasi atomik dengan guard `stock >= qty` untuk mencegah *oversell* akibat concurrent request. |
| 10 | Diskon POS: jika diinput dua jenis (persen & fixed), sistem memilih otomatis nilai *diskon* yang lebih kecil (menguntungkan pelanggan lebih sedikit / bisnis lebih terlindungi — perlu konfirmasi arah kebijakan ini). |
| 11 | Total transaksi = (Subtotal − Diskon) + Pajak. |
| 12 | Pembayaran cash pada POS wajib ≥ total tagihan; kembalian dihitung otomatis. |
| 13 | Status Invoice ditentukan otomatis dari akumulasi Payment: `UNPAID` (0), `PARTIAL_PAYMENT` (sebagian), `PAID` (lunas/lebih). |
| 14 | Pembatalan Invoice yang memiliki item `PRODUK` memicu pengembalian (restock) otomatis kuantitas produk terkait. |
| 15 | Room hanya dapat berstatus `OCCUPIED` jika memiliki booking aktif berstatus `CHECKED_IN`. |
| 16 | Vaksin ditandai "Overdue" secara otomatis jika tanggal saat ini melewati tanggal jatuh tempo vaksin dan belum ada entry vaksin baru untuk jenis vaksin yang sama. |
| 17 | Customer tidak dapat menghapus data appointment/booking/pet miliknya sendiri; hanya staff yang berwenang. |
| 18 | Guest Customer (`isGuest = true`) dapat dikonversi menjadi Registered Customer oleh staff tanpa kehilangan riwayat transaksi. |
| 19 | **Username bersifat unik secara global** lintas seluruh role (`OWNER`, `ADMIN_KLINIK`, `DOKTER`, `CUSTOMER`) — tidak boleh ada dua akun dengan username yang sama walau berbeda role. |
| 20 | **Akun dengan `role = ADMIN_KLINIK` atau `role = DOKTER` hanya dapat dibuat oleh akun dengan `role = OWNER`.** Permintaan pembuatan akun staf dari role manapun selain Owner harus ditolak sistem di level API (bukan hanya UI). |
| 21 | **Akun dengan `role = CUSTOMER` hanya dapat dibuat oleh akun dengan `role = OWNER` atau `role = ADMIN_KLINIK`.** Permintaan dari role `DOKTER` atau `CUSTOMER` untuk membuat akun Customer harus ditolak sistem. |
| 22 | Field `createdBy` pada `User` bersifat wajib diisi dan tidak dapat diubah setelah akun dibuat (kecuali oleh proses migrasi data), untuk menjaga jejak audit pendaftaran akun. |
| 23 | Setelah mencapai batas maksimum percobaan login gagal (default 5 kali), akun otomatis terkunci (`lockedUntil` diset) hingga durasi lockout berakhir atau direset manual oleh pihak berwenang sesuai §6.3. |
| 24 | PIN tidak pernah ditampilkan kembali dalam bentuk plain text setelah pembuatan awal/reset — termasuk kepada Owner sekalipun — hanya disimpan sebagai hash. |

---

## 17. Notifikasi & Reminder

| Trigger | Penerima | Kanal (usulan) |
|---|---|---|
| Stok produk di bawah minimum | Admin Klinik, Owner | In-app notification, email |
| Vaksin jatuh tempo (H-14) | Admin Klinik (untuk follow-up ke customer), Customer (portal) | In-app, email/SMS (opsional) |
| Appointment DONE tanpa Medical Record | Dokter terkait | In-app prompt saat mengubah status |
| Hewan butuh perawatan pet hotel hari ini (feeding/medicine) | Admin Klinik, staf pet hotel | Dashboard "Pet Hotel Care Needed Today" |
| Invoice baru dibuat / status berubah | Customer (jika punya akun portal) | In-app portal, email (opsional) |
| Booking pet hotel/appointment baru diajukan customer dari portal | Admin Klinik | In-app notification |
| Akun staf/Customer baru berhasil dibuat | Owner (untuk semua akun baru), Admin Klinik (khusus akun Customer yang dibuatnya) | In-app notification |
| Akun terkunci akibat percobaan login gagal berulang | Pemilik akun (pesan di layar login), Owner (untuk akun staf), Owner/Admin Klinik (untuk akun Customer) | In-app, dashboard Settings |

> Kanal notifikasi (email/SMS/push) belum ditentukan secara eksplisit dalam requirement sumber; disarankan minimal mendukung in-app notification pada rilis awal, dengan email sebagai peningkatan berikutnya.

---

## 18. Kebutuhan Non-Fungsional

> Bagian ini bersifat usulan standar industri karena tidak dirinci eksplisit dalam dokumen requirement sumber. Perlu divalidasi dengan tim engineering dan bisnis.

### 18.1 Performa
- Waktu muat halaman utama (dashboard) < 2 detik pada koneksi standar.
- Pencarian produk/customer (autocomplete) merespons < 500ms.
- Sistem mampu menangani transaksi POS secara concurrent tanpa oversell (lihat aturan §16.9).
- Proses login (validasi username + PIN) merespons < 1 detik.

### 18.2 Keamanan
- **Autentikasi seluruh role (Owner, Admin Klinik, Dokter, Customer) menggunakan Username + PIN**, dengan PIN di-hash menggunakan algoritma standar (mis. bcrypt/argon2) — tidak ada penyimpanan PIN dalam bentuk plain text di manapun, termasuk log.
- Mekanisme *lockout* diterapkan secara seragam untuk semua role setelah sejumlah percobaan login gagal (lihat §6.1 dan §16 aturan #23).
- **Kontrol pendaftaran akun diterapkan di level API**, bukan hanya UI: endpoint pembuatan akun staf memvalidasi bahwa pemanggil (`requester`) memiliki `role = OWNER`; endpoint pembuatan akun Customer memvalidasi bahwa pemanggil memiliki `role = OWNER` atau `role = ADMIN_KLINIK`.
- Role-based access control (RBAC) diterapkan di level API untuk seluruh modul, bukan hanya UI.
- Seluruh perubahan data penting (invoice, medical record, user) tercatat di Audit Log, termasuk seluruh aktivitas pembuatan/reset/penghapusan akun beserta `createdBy`/pelaku aksi.
- Data sensitif (rekam medis) hanya dapat diakses sesuai matriks hak akses pada §7.

### 18.3 Ketersediaan & Reliabilitas
- Target uptime ≥ 99.5%.
- Backup database terjadwal (harian) di samping backup on-demand oleh Owner.
- Mekanisme *soft-delete* pada entitas kritikal (Customer, Pet, Medical Record, Procedure, Room) untuk mencegah kehilangan data yang tidak disengaja.

### 18.4 Skalabilitas
- Desain database mendukung multi-cabang di masa depan (meski tidak eksplisit diminta di versi ini — dicatat sebagai potensi *future work*).
- Struktur modular per domain (Klinik, Petshop, POS) memudahkan penambahan fitur baru tanpa mengganggu modul lain.

### 18.5 Usability
- POS Dashboard dioptimalkan untuk kecepatan input saat jam sibuk (minim klik, keyboard shortcut untuk kasir berpengalaman — usulan).
- Portal Customer dioptimalkan untuk akses mobile (responsive design), karena mayoritas pelanggan diasumsikan mengakses dari HP.
- Input PIN pada layar login menggunakan numeric keypad khusus (mobile-friendly) dengan masking (mis. titik/asterisk), mendukung fitur "tampilkan PIN" sementara jika diperlukan pengguna.

### 18.6 Auditability
- Audit Log mencatat minimal: user, aksi (create/update/delete), entitas & ID yang terdampak, nilai sebelum/sesudah (jika memungkinkan), timestamp.
- Khusus entitas `User`, Audit Log secara eksplisit mencatat relasi `createdBy` sehingga rantai "siapa mendaftarkan siapa" selalu dapat ditelusuri oleh Owner.

---

## 19. Arsitektur & Tumpukan Teknologi

| Layer | Teknologi |
|---|---|
| Frontend & API Layer | Next.js |
| Database | PostgreSQL |
| Autentikasi (seluruh role) | **Username + PIN**, PIN di-hash (bcrypt/argon2); tidak ada skema email/password konvensional |
| Otorisasi Pendaftaran Akun | Middleware/guard di level API yang memvalidasi `role` pemanggil sebelum mengizinkan pembuatan akun staf (khusus `OWNER`) atau akun Customer (`OWNER`/`ADMIN_KLINIK`) |
| Struktur Aplikasi | Dua permukaan: Staff Dashboard & Customer Portal (`/portal`), berbagi satu mekanisme login yang sama |
| Sesi | Token (mis. JWT) berisi `userId` dan `role`, digunakan RBAC di setiap request API |

> Detail lebih lanjut seperti ORM, hosting, strategi caching, dan integrasi pihak ketiga (payment gateway, SMS gateway, dsb) belum disebutkan dalam dokumen requirement sumber dan perlu didefinisikan oleh tim engineering.

---

## 20. Asumsi & Batasan

**Asumsi:**
1. Sistem digunakan untuk satu klinik/cabang tunggal pada versi awal (belum ada kebutuhan eksplisit multi-cabang).
2. Mata uang yang digunakan adalah Rupiah (Rp) di seluruh modul finansial.
3. Semua timestamp mengikuti zona waktu lokasi klinik (perlu konfirmasi zona waktu default, misal WIB).
4. Foto/gambar (produk, pet, customer) disimpan sebagai referensi URL, bukan file upload langsung ke server aplikasi — kecuali dinyatakan lain saat implementasi.
5. Akun Owner pertama dibuat melalui proses instalasi/inisialisasi sistem (seed data atau setup wizard), bukan melalui form pendaftaran di dalam aplikasi.
6. Penyampaian Username & PIN awal kepada staf/Customer baru dilakukan secara langsung (tatap muka) oleh pihak yang mendaftarkan, bukan melalui email/SMS otomatis pada versi awal.

**Batasan:**
1. Tidak ada fitur self sign-up untuk role apapun (Owner, Admin Klinik, Dokter, maupun Customer); seluruh akun dibuat oleh pihak berwenang sesuai [§6.3](#63-matriks-kewenangan-pendaftaran--pengelolaan-akun).
2. **Admin Klinik tidak dapat mendaftarkan, mengubah, atau menghapus akun Admin Klinik lain maupun akun Dokter** — kewenangan ini eksklusif milik Owner.
3. **Dokter dan Customer tidak memiliki kewenangan mendaftarkan akun apapun**, termasuk akun sesama role mereka.
4. Customer tidak memiliki hak hapus atas data appointment/booking miliknya sendiri.
5. Produk yang sudah pernah bertransaksi tidak dapat dihapus permanen, hanya dapat di-archive.
6. Tidak ada mekanisme "lupa PIN" mandiri (self-service) berbasis email/SMS pada versi ini; reset PIN selalu melalui pihak berwenang sesuai matriks §6.3.

---

## 21. Di Luar Ruang Lingkup (Out of Scope)

Berdasarkan requirement yang tersedia, hal-hal berikut **belum** termasuk dalam ruang lingkup versi ini (dan dapat dipertimbangkan sebagai *future work*):

- Integrasi payment gateway online (pembayaran non-tunai tercatat manual sebagai `NON_CASH`, bukan diproses via API pembayaran).
- Aplikasi mobile native (portal saat ini berbasis web responsive).
- Multi-cabang / multi-tenant klinik dalam satu akun Owner.
- Multi-Owner dalam satu instance sistem (versi ini mengasumsikan satu Owner per instance).
- Login berbasis biometrik (fingerprint/face ID) atau OTP/2FA tambahan di luar Username + PIN.
- Sistem antrian display (layar TV) untuk ruang tunggu.
- Integrasi laboratorium eksternal untuk hasil lab otomatis.
- Notifikasi SMS/WhatsApp otomatis (hanya disebut sebagai opsi masa depan).
- Fitur telemedicine/konsultasi jarak jauh.

---

## 22. Item Terbuka & Perlu Klarifikasi

Beberapa detail dalam dokumen requirement sumber masih belum final (TBD) atau memerlukan klarifikasi lebih lanjut dari stakeholder sebelum masuk tahap desain teknis dan implementasi:

1. **Lampiran file** pada Medical Records dan Pet Hotel Logs — apakah melalui upload file langsung ke server/storage, atau hanya referensi URL eksternal.
2. **Logika refund/credit** saat pembatalan invoice yang sudah memiliki pembayaran (refund tunai, saldo kredit untuk transaksi berikutnya, atau kombinasi keduanya).
3. **Detail lengkap filter & aksi pada modul POS History** — dokumen sumber terpotong pada bagian ini; filter tambahan pada §10.3 bersifat usulan dan perlu dikonfirmasi.
4. **Detail modul Reports** — jenis laporan pada §11 disusun dari daftar nama laporan yang disebutkan di bagian akses; format, filter, dan visualisasi masing-masing laporan perlu didetailkan lebih lanjut bersama tim desain.
5. **Detail modul Settings** — sub-fitur pada §12 disusun dari poin "akses khusus Owner"; perlu dikonfirmasi apakah ada sub-fitur tambahan (misal integrasi pihak ketiga, pengaturan pajak default, dsb).
6. **Kebijakan hard-delete vs soft-delete** perlu distandardisasi lintas seluruh modul secara eksplisit (Customer, Pet, Product mengizinkan hard-delete bersyarat; Medical Record, Procedure, Room selalu soft-delete).
7. **Panjang & format PIN final** — apakah 6 digit numerik sudah final, atau perlu opsi panjang lain (mis. 4 digit untuk kemudahan staf lansia/kurang familiar teknologi).
8. **Format username final** — apakah wajib mengikuti pola tertentu (mis. auto-generate dari nomor telepon customer), atau bebas ditentukan pendaftar selama unik.
9. **Mekanisme penyampaian kredensial awal** — apakah cukup disampaikan tatap muka/tertulis di kertas, atau perlu fitur cetak kartu akun/kirim notifikasi terenkripsi.
10. **Kebijakan jika Owner lupa PIN sendiri** — karena tidak ada role di atas Owner, perlu prosedur pemulihan khusus (mis. akses langsung ke database oleh tim teknis/support) yang perlu didefinisikan di luar aplikasi.
11. **Apakah Owner dapat memiliki lebih dari satu akun Owner** (multi-owner) untuk klinik dengan lebih dari satu pemilik — versi ini mengasumsikan satu Owner tunggal.
12. **Zona waktu dan lokalisasi** — apakah sistem perlu mendukung lebih dari satu zona waktu / bahasa.
13. **Kebijakan diskon POS** — arah pembulatan dan aturan pemilihan otomatis antara diskon persen vs fixed perlu dikonfirmasi ulang ke pemilik bisnis.

Disarankan agar seluruh item di atas dibahas dalam sesi *requirement clarification* bersama tim produk dan stakeholder bisnis sebelum dokumen ini difinalisasi ke versi 2.1 / disetujui untuk masuk tahap desain teknis (technical design).

---

## 23. Glosarium

| Istilah | Definisi |
|---|---|
| **Username** | Nama pengguna unik lintas seluruh role, digunakan bersama PIN untuk login ke sistem |
| **PIN** | Kode numerik rahasia yang berfungsi sebagai kredensial autentikasi pengganti password, digunakan oleh seluruh role (Owner, Admin Klinik, Dokter, Customer) |
| **Lockout** | Kondisi akun terkunci sementara setelah melewati batas maksimum percobaan login gagal berturut-turut |
| **createdBy** | Field pada entitas `User` yang mencatat akun mana yang membuat/mendaftarkan akun tersebut, untuk keperluan audit |
| **Walk-in / Guest Customer** | Pelanggan yang bertransaksi tanpa didaftarkan sebagai customer tetap; dibuat otomatis oleh sistem saat transaksi kasir |
| **Registered Customer** | Pelanggan dengan data lengkap dan tercatat permanen di sistem, mungkin memiliki akun login portal |
| **Soft-delete** | Penghapusan data secara logis (ditandai tidak aktif) tanpa menghapus baris data secara fisik dari database |
| **Hard-delete** | Penghapusan data secara permanen dari database |
| **Low Stock** | Kondisi stok produk berada di bawah ambang batas minimum yang ditetapkan |
| **Overstock** | Kondisi stok produk melebihi ambang batas maksimum yang ditetapkan |
| **Stock Opname** | Proses audit fisik untuk mencocokkan stok tercatat dengan stok aktual di gudang |
| **Chief Complaint** | Keluhan utama yang disampaikan pemilik hewan saat kunjungan |
| **Partial Payment** | Status invoice ketika pembayaran yang diterima lebih dari nol namun belum mencapai total tagihan |
| **RBAC** | *Role-Based Access Control* — kontrol akses berbasis peran pengguna |

---

