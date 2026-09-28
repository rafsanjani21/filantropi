# Filantropi

**Platform donasi & penggalangan dana berbasis web dengan integrasi blockchain (Polygon).**

Filantropi adalah aplikasi web yang menghubungkan **donatur** dengan **penggalang dana / penerima manfaat**. Pengguna bisa mencari program donasi (kemanusiaan, wakaf, bencana, dll.), berdonasi lewat QRIS / Virtual Account, memantau progres penyaluran dana, hingga menggalang dana sendiri — dengan transparansi data hingga ke dompet (wallet) Polygon.

> **Untuk orang awam:** bayangkan ini seperti aplikasi donasi online (misal kitabisa.com), tetapi setiap penggalang dana wajib mencantumkan alamat dompet kripto, sehingga aliran dananya bisa dilacak. Anda cukup buka web, pilih program, tekan "Donasi", bayar lewat QRIS, dan melihat laporannya.

---

## Daftar Isi

1. [Fitur Utama](#fitur-utama)
2. [Teknologi Yang Digunakan](#teknologi-yang-digunakan)
3. [Cara Menjalankan Proyek](#cara-menjalankan-proyek)
4. [Struktur Folder & Fungsinya](#struktur-folder--fungsinya)
5. [Peta Halaman (Routing)](#peta-halaman-routing)
6. [Arsitektur & Alur Kerja](#arsitektur--alur-kerja)
7. [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
8. [Deployment](#deployment)
9. [Daftar Perintah](#daftar-perintah)

---

## Fitur Utama

| Fitur | Penjelasan Singkat |
|---|---|
| 🔐 **Login dengan Google** | Autentikasi via Firebase, lalu ditukar menjadi token JWT (access + refresh) ke backend. |
| 👥 **Dua peran pengguna** | `donor` (donatur) dan `beneficiary` (penggalang/penerima manfaat), plus `guest` untuk pengunjung. |
| 📋 **Jelajah program donasi** | Halaman beranda, daftar semua program, pencarian & filter kategori. |
| 💳 **Pembayaran QRIS & VA** | Alur donasi multi-step: pilih nominal → pilih metode → bayar (QRIS / Virtual Account). |
| 🕌 **Wakaf** | Alur wakaf terpisah: pilih aset/nilai, isi data, konfirmasi (pledge). |
| 📈 **Progres penyaluran** | Stepper/tahapan pencairan dana beserta lampiran bukti. |
| 💸 **Pencairan dana (disbursement)** | Penggalang mengajukan pencairan; ada persetujuan admin. |
| 🪙 **Integrasi Blockchain** | Validasi alamat wallet Polygon memakai `ethers.js`, slot contract & RPC di `.env`. |
| 🌍 **Dua bahasa (i18n)** | Indonesia (default) & Inggris, tersimpan di `localStorage`. |
| 🔔 **Live donation blink** | Notifikasi donasi masuk secara real-time di seluruh halaman. |
| 📱 **Mobile-first UI** | Bottom navigation bar, dirancang untuk layar ponsel. |

---

## Teknologi Yang Digunakan

| Kategori | Teknologi |
|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** |
| Bahasa | **TypeScript** |
| Styling | **Tailwind CSS v4** (via PostCSS) |
| State Management | **Zustand** |
| Autentikasi | **Firebase Auth** (Google) + JWT backend |
| HTTP Client | `fetch` dibungkus helper `apiFetch()` |
| Blockchain | **ethers.js v6** (Polygon / MATIC) |
| Internasionalisasi | **i18next** + **react-i18next** |
| Notifikasi | **react-hot-toast** |
| Ikon | **Lucide React**, **Phosphor Icons** |
| Deploy | **GitHub Actions** → SSH ke VPS → **PM2** |

---

## Cara Menjalankan Proyek

### Prasyarat

- [Node.js](https://nodejs.org) versi 18 atau lebih baru
- npm (bawaan Node.js)
- Akses ke backend API (lihat bagian Environment Variables)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone <url-repositori-anda>
cd filantropi

# 2. Install semua dependensi
npm install

# 3. Salin file konfigurasi environment
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux

# 4. Isi nilai .env Anda (lihat tabel di bawah)

# 5. Jalankan server pengembangan
npm run dev
```

Buka **http://localhost:3000** — Anda akan otomatis diarahkan ke halaman beranda (`/HomePage`).

---

## Struktur Folder & Fungsinya

```
filantropi/
├── app/                     ⭐ SEMUA HALAMAN WEBSITE (App Router Next.js)
│   ├── layout.tsx           → Kerangka utama: memuat font, provider auth, i18n, toast, tombol WhatsApp
│   ├── page.tsx             → Halaman "/" → langsung redirect ke /HomePage
│   ├── globals.css          → Style global (Tailwind)
│   ├── I18nProvider.tsx     → Pembungkus i18n (cegah hydration mismatch)
│   ├── favicon.ico          → Ikon tab browser
│   │
│   ├── HomePage/            → Beranda: carousel, program terbaru, donasi mendesak
│   ├── DonasiPage/          → Katalog semua program donasi + pencarian
│   ├── AllProgramsPage/     → Daftar lengkap program dengan filter kata kunci
│   ├── DetailPage/          → Detail 1 program donasi (banner, cerita, riwayat donasi)
│   ├── GalangPage/          → Formulir membuat penggalangan dana baru
│   ├── ProgramPage/         → "Program Saya" (milik penggalang) + EditProgram/
│   ├── ProgressPage/        → Progres penyaluran dana per tahap
│   ├── WakafDetailPage/     → Detail program wakaf + FormWakafPage (alur donasi wakaf)
│   ├── LoginPage/           → Halaman login/registrasi + Masuk/ (form masuk)
│   ├── ProfilePage/         → Profil & submenu (UserPage, PagePenerima, riwayat, bantuan)
│   ├── CreatorProfile/      → Profil publik penggalang dana (dinamis via [id])
│   ├── Payment/             → Halaman hasil pembayaran: Success/ dan Failed/
│   └── components/ui/       → Komponen UI bersama (lihat tabel di bawah)
│
├── lib/                     🔧 UTILITAS & LAYANAN INTI
│   ├── api.ts               → apiFetch(): kirim request + auto-refresh token + logout paksa
│   ├── auth.service.ts      → API login, register, logout, ambil profil
│   ├── firebase.ts          → Inisialisasi Firebase & provider Google
│   └── i18n.ts              → Kamus teks bahasa Indonesia & Inggris (~760 baris)
│
├── hooks/                   🪝 HOOK KUSTOM
│   └── useAuth.ts           → Login sekali klik (cek apakah user sudah terdaftar)
│
├── store/                   🗄️ STATE GLOBAL
│   └── useAuthStore.ts      → Zustand: simpan user, peran, status login
│
├── public/                  🖼️ ASET STATIS (logo, gambar, ikon bank/ewallet)
│   └── logo/                → Logo payment gateway (BNI, BSS, BSI, AstraPay, Akulaku, dll.)
│
├── .github/workflows/
│   └── deploy.yml           → Otomatis deploy ke VPS setiap push ke branch main
│
├── .env / .env.example      → Konfigurasi rahasia (API, Firebase, Blockchain)
├── next.config.ts           → Konfigurasi Next.js (rewrite proxy API)
├── tsconfig.json            → Konfigurasi TypeScript (path alias "@/")
├── eslint.config.mjs         → Aturan linting kode
└── package.json             → Daftar dependensi & perintah script
```

### Rincian `app/components/ui/` (Komponen Bersama)

| Folder | Isi | Dipakai Untuk |
|---|---|---|
| `root/` | `AuthProvider`, `BottomNav`, `GlobalLiveDonationBlink`, `WhatsAppButton` | Elemen global yang muncul di semua halaman |
| `sharedpayment/` | `NominalView`, `MethodView`, `QrisView`, `VaView` | Alur pembayaran donasi & wakaf (dipakai ulang) |
| `donasi/` | `campaigncard` | Kartu program donasi |
| `user/` | `navbar` | Navigasi atas untuk halaman user |

### Rincian folder halaman besar

**`app/DetailPage/`** — halaman detail program donasi

| File | Fungsi |
|---|---|
| `page.tsx` | Kontainer utama halaman detail |
| `components/CampaignBanner.tsx` | Banner/galeri gambar kampanye |
| `components/CampaignHeader.tsx` | Judul, target dana, jumlah terkumpul |
| `components/CampaignStory.tsx` | Cerita/deskripsi kampanye |
| `components/DonationHistory.tsx` | Daftar riwayat donatur |
| `components/BottomActionBar.tsx` | Tombol "Donasi" di bawah layar |
| `components/DisbursementModal.tsx` | Modal pengajuan pencairan dana |
| `components/ReportModal.tsx` | Modal unggah laporan penggunaan dana |
| `components/LiveDonationBlink.tsx` | Notifikasi donasi masuk |
| `hooks/useCampaignDetail.ts` | Hook ambil data detail kampanye |
| `FormDonasiPage/` | Alur donasi: nominal → metode → data diri → bayar |

**`app/WakafDetailPage/`** — halaman detail & alur wakaf

| File | Fungsi |
|---|---|
| `page.tsx` | Detail program wakaf |
| `components/WakafBottomBar.tsx` | Tombol aksi wakaf |
| `FormWakafPage/` | Alur wakaf: `NominalView` → `NameSelectionView` → `PledgeView` |

**`app/HomePage/`** — halaman beranda

`carousel.tsx` (slider promo), `homeheader.tsx` (header + pencarian), `urgentdonation.tsx` & `urgentcard.tsx` (donasi mendesak), `latestprograms.tsx` (program terbaru), `navbar.tsx` (navigasi atas).

---

## Peta Halaman (Routing)

Karena proyek memakai **App Router**, nama folder = URL halaman.

| URL | File | Fungsi |
|---|---|---|
| `/` | `app/page.tsx` | Redirect otomatis ke `/HomePage` |
| `/HomePage` | `app/HomePage/page.tsx` | Beranda |
| `/DonasiPage` | `app/DonasiPage/page.tsx` | Katalog program donasi |
| `/AllProgramsPage` | `app/AllProgramsPage/page.tsx` | Semua program + filter |
| `/DetailPage` | `app/DetailPage/page.tsx` | Detail program (parameter via query) |
| `/DetailPage/FormDonasiPage` | `app/DetailPage/FormDonasiPage/page.tsx` | Alur pembayaran donasi |
| `/GalangPage` | `app/GalangPage/page.tsx` | Buat penggalangan dana baru |
| `/ProgramPage` | `app/ProgramPage/page.tsx` | Daftar program milik saya |
| `/ProgramPage/EditProgram` | `app/ProgramPage/EditProgram/page.tsx` | Edit program |
| `/ProgressPage` | `app/ProgressPage/page.tsx` | Progres penyaluran dana |
| `/WakafDetailPage` | `app/WakafDetailPage/page.tsx` | Detail wakaf |
| `/WakafDetailPage/FormWakafPage` | `app/WakafDetailPage/FormWakafPage/page.tsx` | Alur donasi wakaf |
| `/LoginPage` | `app/LoginPage/page.tsx` | Pilih masuk/daftar |
| `/LoginPage/Masuk` | `app/LoginPage/Masuk/page.tsx` | Form login |
| `/ProfilePage` | `app/ProfilePage/page.tsx` | Menu profil |
| `/ProfilePage/UserPage` | `app/ProfilePage/UserPage/page.tsx` | Form pendaftaran donatur |
| `/ProfilePage/PagePenerima` | `app/ProfilePage/PagePenerima/page.tsx` | Pendaftaran penerima manfaat |
| `/ProfilePage/HistoryWakafPage` | `app/ProfilePage/HistoryWakafPage/page.tsx` | Riwayat wakaf saya |
| `/ProfilePage/PusatBantuan` | `app/ProfilePage/PusatBantuan/page.tsx` | Pusat bantuan |
| `/ProfilePage/SyaratKetentuan` | `app/ProfilePage/SyaratKetentuan/page.tsx` | Syarat & ketentuan |
| `/CreatorProfile/[id]` | `app/CreatorProfile/[id]/page.tsx` | Profil penggalang dana |
| `/Payment/Success` | `app/Payment/Success/page.tsx` | Halaman pembayaran berhasil |
| `/Payment/Failed` | `app/Payment/Failed/page.tsx` | Halaman pembayaran gagal |

---

## Arsitektur & Alur Kerja

### 1. Alur Autentikasi (Login)

```
User klik "Login Google"
        │
        ▼
Firebase Auth  ──►  mendapat id_token (bukti sudah login Google)
        │
        ▼
POST /auth/login  ──►  backend menerbitkan access_token + refresh_token
        │
        ▼
Disimpan di localStorage / sessionStorage
        │
        ▼
useAuthStore.checkAuth()  ──►  coba ambil profil sebagai "donor";
                                jika gagal, coba sebagai "beneficiary"
        │
        ▼
Status login & peran tersimpan di Zustand → UI menyesuaikan
```

Kode utama: `hooks/useAuth.ts`, `lib/auth.service.ts`, `store/useAuthStore.ts`.

### 2. Alur Request API (`lib/api.ts`)

Setiap request ke backend lewat helper `apiFetch()` yang otomatis:

1. Menyisipkan header `Authorization: Bearer <token>` (kecuali endpoint publik seperti login/register).
2. Jika server menjawab **401 (token kedaluwarsa)** → otomatis memanggil `/auth/refresh-token` lalu **mengulang request**.
3. Jika refresh gagal → **force logout** dan dialihkan ke `/LoginPage/Masuk` (kecuali user sedang di halaman pendaftaran).

### 3. Alur Donasi (Pembayaran)

```
DetailPage → tekan "Donasi"
   → FormDonasiPage: NominalView (pilih jumlah)
   → MethodView (pilih QRIS / Virtual Account)
   → QrisView (tampilkan QR)  atau  VaView (tampilkan nomor VA)
   → backend: POST /campaigns/create/v2/transaction-donasi
   → redirect ke /Payment/Success atau /Payment/Failed
```

Komponen bersama ada di `app/components/ui/sharedpayment/`.

### 4. Posisi Blockchain

Frontend **bukan** dompet kripto. Yang dilakukan:

- Memvalidasi format alamat wallet Polygon penggalang dengan `ethers.isAddress()` (lihat `app/GalangPage/page.tsx`).
- Menyimpan `NEXT_PUBLIC_CONTRACT_ADDRESS` & `NEXT_PUBLIC_RPC_URL` untuk kebutuhan kontrak (opsional, bisa diisi nanti).

### 5. Multi-bahasa (i18n)

- Kamus ada di `lib/i18n.ts`, bahasa default **Indonesia**, cadangan **Inggris**.
- Komponen memakai `const { t } = useTranslation()` lalu `t("judul_kunci")`.
- Pilihan bahasa disimpan di `localStorage` dengan kunci `app_lang` dan dibaca oleh `app/I18nProvider.tsx`.

---

## Konfigurasi Environment Variables

Salin `.env.example` menjadi `.env`, lalu isi nilainya:

| Variabel | Fungsi |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | **Wajib.** Alamat backend API (contoh: `https://example.com/api`) |
| `NEXT_PUBLIC_IMAGE_BASE_URL` | **Wajib.** Alamat aset/gambar dari backend |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Kredensial Firebase untuk login Google |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | "" |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | "" |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | "" |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | "" |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | "" |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Alamat smart contract (opsional) |
| `NEXT_PUBLIC_RPC_URL` | RPC Polygon (opsional) |

> ⚠️ **Jangan pernah** menyalin file `.env` ke repository publik — file ini sudah masuk `.gitignore`.

---

## Deployment

Deploy otomatis lewat GitHub Actions (`.github/workflows/deploy.yml`):

1. Setiap **push ke branch `main`** → workflow aktif.
2. Workflow membuka **SSH ke VPS** memakai secret: `VPS_HOST`, `VPS_USERNAME`, `VPS_PORT`, `VPS_SSH_KEY`.
3. Di VPS: `git fetch` → `git reset --hard origin/main` → `npm install` → `npm run build`.
4. Aplikasi di-reload oleh **PM2** dengan nama proses **"Filantropi LP"** pada **port 3005** (zero downtime).

### Konfigurasi GitHub Secrets

Buka **Repository → Settings → Secrets and variables → Actions**, lalu tambahkan:

`VPS_HOST` · `VPS_USERNAME` · `VPS_PORT` · `VPS_SSH_KEY`

---

## Daftar Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan server pengembangan (http://localhost:3000) |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan versi produksi |
| `npm run lint` | Periksa kualitas kode dengan ESLint |

---

## Catatan Tambahan untuk Kontributor

- **Path alias:** gunakan `@/` untuk menunjuk ke root proyek, contoh `@/lib/api.ts`.
- **Konvensi penamaan folder:** `SomethingPage/page.tsx` → rute `/SomethingPage`.
- **`"use client"`** ditulis di komponen yang memakai `useState`/`useEffect`/hook browser.
- Dokumen ini adalah sumber utama struktur proyek — perbarui bila menambah halaman baru.
- Panduan untuk AI asisten ada di [`AGENTS.md`](./AGENTS.md) dan [`CLAUDE.md`](./CLAUDE.md).
