# Filantropi

**Platform donasi & penggalangan dana berbasis web (Next.js) dengan pelacakan aliran dana hingga dompet (wallet).**

Filantropi adalah aplikasi web yang menghubungkan **donatur** dengan **penggalang dana / penerima manfaat**. Pengguna bisa mencari program donasi (kemanusiaan, wakaf, bencana, dll.), berdonasi lewat QRIS / Virtual Account / e-wallet, membaca berita kebaikan, memantau progres penyaluran dana, hingga menggalang dana sendiri — dengan data transparansi hingga ke alamat dompet penggalang.

> **Untuk orang awam:** bayangkan ini seperti aplikasi donasi online (misal kitabisa.com). Anda cukup buka web, pilih program, tekan "Donasi", isi data diri, bayar lewat QRIS, dan melihat laporannya. Setiap program tetap menyimpan alamat dompet penggalang sehingga riwayat donasi bisa dilacak.

> **Catatan penting:** validasi alamat wallet memakai `ethers.js` **sudah dihapus dari frontend** (dependensi `ethers` & `@phosphor-icons/react` tidak lagi ada di `package.json`). Alamat wallet kini hanya **dibaca** dari data backend untuk menampilkan riwayat donasi dan menandai pemilik program.

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
| 🔐 **Login dengan Google** | Autentikasi via Firebase (`signInWithPopup`), lalu id_token ditukar menjadi token JWT (access + refresh) ke backend. |
| 👥 **Dua peran pengguna** | `donor` (donatur) dan `beneficiary` (penggalang/penerima manfaat), plus `guest` untuk pengunjung. |
| 📋 **Jelajah program donasi** | Beranda (`/`) + katalog `/programs` dengan pencarian, pengurutan, tampilan **grid/list**, dan filter tipe (`?type=wakaf`). |
| 📰 **Halaman berita** | `/berita` menampilkan kartu berita dengan *infinite scroll* (muat 5 item per scroll). |
| 💳 **Pembayaran QRIS, VA & e-wallet** | Alur donasi multi-step: nominal → metode → data diri → QRIS / VA. Metode: QRIS, AstraPay, BNI, BRI, BSI, BSS, CIMB, Mandiri, Permata, Indomaret. |
| 🕌 **Wakaf** | Alur wakaf terpisah: pilih penerima → nominal → pledge → metode → data diri → bayar. |
| 📈 **Progres penyaluran** | Stepper/tahapan pencairan dana (`/progress/[id]`) beserta lampiran bukti. |
| 💸 **Pencairan dana & laporan** | Pemilik program bisa mengajukan pencairan (`DisbursementModal`) dan mengunggah laporan (`ReportModal`) langsung dari halaman detail. |
| 🧾 **Riwayat donasi & wakaf** | `/profile/history` menampilkan riwayat transaksi (kode `DNS`/`WKF`) dari endpoint `/user/profile/history`. |
| 🪙 **Keterlacakan dana (wallet)** | Alamat wallet penggalang dibaca dari backend untuk menampilkan riwayat donasi (`/donations/in/{wallet}`) dan pengecekan pemilik program. |
| ⏰ **Sesi & keamanan** | `SessionModal` di root layout untuk dialog kedaluwarsa sesi, plus force-logout otomatis dari `apiFetch()`. |
| 🌍 **Dua bahasa (i18n)** | Indonesia (default) & Inggris, kamus di `lib/i18n.ts`. |
| 🔔 **Live donation blink** | Notifikasi donasi masuk di beranda (`GlobalLiveDonationBlink`) + notifikasi per halaman detail. |
| 📱 **Mobile-first UI** | Bottom navigation 4 menu (Beranda, Kampanye, Berita, Profil) dengan tombol *floating* aktif. |

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
| QR Pembayaran | **qrcode.react** (render QRIS; `react-qr-code` terpasang tapi belum dipakai) |
| Internasionalisasi | **i18next** + **react-i18next** |
| Notifikasi | **react-hot-toast** |
| Ikon | **Lucide React** |
| Deploy | **GitHub Actions** → SSH ke VPS → **PM2** |

> ⚠️ `ethers.js` dan `@phosphor-icons/react` **tidak lagi dipakai** — sudah dihapus dari `package.json`.

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

Buka **http://localhost:3000** — halaman `/` langsung menampilkan beranda.

---

## Struktur Folder & Fungsinya

```
filantropi/
├── app/                     ⭐ SEMUA HALAMAN WEBSITE (App Router Next.js)
│   ├── layout.tsx           → Kerangka utama: font, AuthProvider, i18n, Toaster,
│   │                          GlobalLiveDonationBlink, WhatsAppButton, SessionModal
│   ├── loading.tsx / error.tsx / global-error.tsx / not-found.tsx
│   ├── globals.css          → Style global (Tailwind)
│   │
│   ├── (auth)/              → Route group tanpa segmen URL
│   │   └── login/           → Form login (Google)
│   ├── (main)/              → Route group halaman utama
│   │   ├── layout.tsx       → Layout sisa route group
│   │   ├── page.tsx         → Beranda "/" (carousel + program terbaru)
│   │   ├── programs/        → Katalog, form galang, kelola program, detail, donasi
│   │   ├── wakaf/[slug]/    → Detail wakaf + alur wakaf (donate/)
│   │   ├── berita/          → Daftar berita + detail [slug] (placeholder)
│   │   ├── progress/[id]/   → Progres penyaluran dana
│   │   ├── profile/         → Profil & submenu (user, beneficiary, history, help, terms)
│   │   └── creator/[id]/    → Profil publik penggalang dana
│   ├── payment/             → Hasil pembayaran: success/ dan failed/
│   └── (redirect lama)      → DetailPage/, WakafDetailPage/, ProgressPage/,
│                              ProgramPage/EditProgram/ (kompatibilitas URL lama)
│
├── lib/                     🔧 UTILITAS & LAYANAN INTI
│   ├── api.ts               → apiFetch(): auto Authorization, refresh token 401,
│   │                          force logout (dengan daftar halaman yang dikecualikan)
│   ├── auth.service.ts      → Login, register, logout, profil, CRUD campaign
│   ├── firebase.ts          → Inisialisasi Firebase & provider Google
│   └── i18n.ts              → Kamus teks bahasa Indonesia & Inggris (~726 baris)
│
├── hooks/                   🪝 HOOK KUSTOM
│   └── useAuth.ts           → smartAuth (login sekali klik), logout, getProfile, createCampaign
│
├── store/                   🗄️ STATE GLOBAL
│   └── useAuthStore.ts      → Zustand: simpan user, peran, status login
│
├── public/                  🖼️ ASET STATIS (logo, gambar, ikon bank/ewallet)
│   └── logo/                → Ikon pembayaran (AstraPay, BNI, BSS, Permata, dll.)
│
├── .github/workflows/
│   └── deploy.yml           → Otomatis deploy ke VPS setiap push ke branch main
│
├── .env / .env.example      → Konfigurasi rahasia (API, Firebase, slot contract)
├── next.config.ts           → Konfigurasi Next.js (rewrite proxy /api-proxy → backend)
├── tsconfig.json            → Konfigurasi TypeScript (path alias "@/")
├── eslint.config.mjs        → Aturan linting kode
└── package.json             → Daftar dependensi & perintah script
```

### Rincian `components/` (Komponen Bersama)

| Folder | Isi | Dipakai Untuk |
|---|---|---|
| `layout/` | `AuthProvider`, `BottomNav`, `GlobalLiveDonationBlink`, `SessionModal`, `WhatsAppButton` | Elemen global yang muncul di semua halaman |
| `layout/navbar/` | `LogoNavbar`, `AuthNavbar`, `DetailNavbar` | Navigasi atas (beranda, auth/daftar, detail) |
| `payment/` | `NominalView`, `MethodView`, `QrisView`, `QrisSementara`, `VaView` | Alur pembayaran donasi & wakaf (dipakai ulang) |
| `campaign/` | `CampaignCard`, `CampaignBanner`, `CampaignHeader`, `CampaignStory`, `DonationHistory` | Kartu & detail program |
| `news/` | `NewsCard` | Kartu berita |
| `home/` | `Carousel`, `LatestPrograms`, `PartnerWakaf` | Beranda |
| `providers/` | `I18nProvider` | Pembungkus i18n di root layout |
| `legacy/` | `QueryRedirect` | Redirect halaman lama berbasis query string |

### Rincian folder halaman besar

**`app/(main)/programs/`** — katalog & detail program donasi

| File | Fungsi |
|---|---|
| `[slug]/page.tsx` | Detail program (parameter dinamis `slug`), cek pemilik via `wallet_address` |
| `_components/` | `CampaignBanner`-type komponen privat: `BottomActionBar`, `DisbursementModal`, `ReportModal`, `LiveDonationBlink` |
| `[slug]/donate/page.tsx` | Alur donasi: `NominalView → MethodView → FormView → QrisView / VaView` |
| `[slug]/donate/_components/FormView.tsx` | Form data donatur + validasi |
| `manage/` | "Program Saya" + `[id]/edit/` untuk edit program |
| `new/` | Formulir membuat penggalangan dana baru |

Hook `useCampaignDetail` dipindahkan ke `hooks/useCampaignDetail.ts`.

**`app/(main)/wakaf/[slug]/`** — halaman detail & alur wakaf

| File | Fungsi |
|---|---|
| `page.tsx` | Detail program wakaf |
| `_components/WakafBottomBar.tsx` | Tombol aksi wakaf |
| `donate/page.tsx` | State mesin view: `name → nominal → pledge → method → form → qris/va` |
| `donate/_components/` | `NameSelectionView`, `FormView`, `PledgeView` |

---

## Peta Halaman (Routing)

Karena proyek memakai **App Router**, nama folder = URL halaman.

| URL | File | Fungsi |
|---|---|---|
| `/` | `app/(main)/page.tsx` | Beranda (carousel + program terbaru) |
| `/programs` | `app/(main)/programs/page.tsx` | Katalog program + pencarian/sortir/filter (`?type=wakaf`) |
| `/programs/new` | `app/(main)/programs/new/page.tsx` | Buat penggalangan dana baru |
| `/programs/manage` | `app/(main)/programs/manage/page.tsx` | Daftar program milik saya |
| `/programs/manage/[id]/edit` | `app/(main)/programs/manage/[id]/edit/page.tsx` | Edit program |
| `/programs/[slug]` | `app/(main)/programs/[slug]/page.tsx` | Detail program |
| `/programs/[slug]/donate` | `app/(main)/programs/[slug]/donate/page.tsx` | Alur pembayaran donasi |
| `/wakaf/[slug]` | `app/(main)/wakaf/[slug]/page.tsx` | Detail wakaf |
| `/wakaf/[slug]/donate` | `app/(main)/wakaf/[slug]/donate/page.tsx` | Alur wakaf |
| `/berita` | `app/(main)/berita/page.tsx` | Daftar berita (infinite scroll) |
| `/berita/[slug]` | `app/(main)/berita/[slug]/page.tsx` | Detail berita (placeholder) |
| `/progress/[id]` | `app/(main)/progress/[id]/page.tsx` | Progres penyaluran dana |
| `/login` | `app/(auth)/login/page.tsx` | Form login (Google) |
| `/profile` | `app/(main)/profile/page.tsx` | Menu profil |
| `/profile/user` | `app/(main)/profile/user/page.tsx` | Form pendaftaran donatur |
| `/profile/beneficiary` | `app/(main)/profile/beneficiary/page.tsx` | Form penerima manfaat |
| `/profile/beneficiary/type` | `app/(main)/profile/beneficiary/type/page.tsx` | Pilih tipe penerima: perorangan/organisasi |
| `/profile/history` | `app/(main)/profile/history/page.tsx` | Riwayat donasi & wakaf saya |
| `/profile/help` | `app/(main)/profile/help/page.tsx` | Pusat bantuan |
| `/profile/terms` | `app/(main)/profile/terms/page.tsx` | Syarat & ketentuan |
| `/creator/[id]` | `app/(main)/creator/[id]/page.tsx` | Profil penggalang dana |
| `/payment/success` | `app/payment/success/page.tsx` | Halaman pembayaran berhasil |
| `/payment/failed` | `app/payment/failed/page.tsx` | Halaman pembayaran gagal |

> URL lama (`/HomePage`, `/AllProgramsPage`, `/DetailPage?slug=...`, `/ProfilePage/...`, `/Payment/Success`, dll.) tetap didukung melalui `redirects()` di `next.config.ts`.

---

## Arsitektur & Alur Kerja

### 1. Alur Autentikasi (Login)

```
User klik "Login Google"
        │
        ▼
Firebase Auth (signInWithPopup)  ──►  mendapat id_token
        │
        ▼
POST /auth/login  ──►  backend menerbitkan access_token + refresh_token
        │
        ▼
Disimpan di localStorage / sessionStorage
        │
        ▼
useAuth / useAuthStore  ──►  coba ambil profil sebagai "donor";
                             jika gagal, coba sebagai "beneficiary"
        │
        ▼
Status login & peran tersimpan → UI menyesuaikan (BottomNav, kunci fitur)
```

Kode utama: `hooks/useAuth.ts` (`smartAuth`), `lib/auth.service.ts`, `store/useAuthStore.ts`.

### 2. Alur Request API (`lib/api.ts`)

Setiap request ke backend lewat helper `apiFetch()` yang otomatis:

1. Menyisipkan header `Authorization: Bearer <token>` — **kecuali** endpoint publik (`/auth/*`, `GET /campaigns/*` non-`me`, `GET /donations/*`) atau body `FormData`.
2. Jika server menjawab **401 (token kedaluwarsa)** → memanggil `/auth/refresh-token` lalu **mengulang request** dengan token baru.
3. Jika refresh gagal / tidak ada refresh token → **force logout**: token dibersihkan dan user dialihkan ke `/login`.
4. `SessionModal` (mount di `layout.tsx`) siap menampilkan dialog sesi habis ketika event `sessionExpired` dikirim.

### 3. Alur Donasi (Pembayaran)

```
/programs/[slug] → tekan "Donasi Sekarang"
   → /programs/[slug]/donate:
      1. NominalView   (pilih/isi jumlah, min Rp 1.000)
      2. MethodView     (pilih QRIS / AstraPay / VA bank / Indomaret)
      3. FormView       (nama, email, telepon, anonim, doa)
      4. QrisSementara / QrisView (QR dari qrcode.react) atau VaView (nomor VA)
   → backend: POST .../transaction-donasi
   → redirect ke /payment/success atau /payment/failed
```

- Nominal minimal untuk metode selain QRIS & AstraPay: **Rp 10.000**.
- Komponen bersama ada di `components/payment/`.

### 4. Alur Wakaf

```
/wakaf/[slug] → "Wakaf Sekarang"
   → /wakaf/[slug]/donate:
      name (untuk diri sendiri / atas nama orang lain)
      → nominal → pledge → method → form → qris / va
```

### 5. Posisi "Blockchain" / Wallet

Frontend **bukan** dompet kripto dan **tidak lagi memakai `ethers.js`**:

- Form buat/edit program **tidak lagi meminta** alamat wallet (field & validasi `ethers.isAddress()` sudah dihapus).
- `campaign.wallet_address` tetap **dibaca** dari respons backend untuk:
  - menampilkan riwayat donasi (`GET /donations/in/{wallet}`),
  - menandai apakah user adalah pemilik program (tombol Cairkan/Laporan),
  - menampilkan alamat terpotong di halaman "Program Saya".
- `NEXT_PUBLIC_CONTRACT_ADDRESS` & `NEXT_PUBLIC_RPC_URL` masih disediakan di `.env` untuk kebutuhan kontrak di masa depan (saat ini belum dirujuk kode frontend).

### 6. Multi-bahasa (i18n)

- Kamus ada di `lib/i18n.ts`, bahasa default **Indonesia**, cadangan **Inggris**.
- Komponen memakai `const { t } = useTranslation()` lalu `t("judul_kunci")`.
- Beberapa halaman mengimpor `"@/lib/i18n"` langsung sebagai proteksi agar inisialisasi tidak ganda.

---

## Konfigurasi Environment Variables

Salin `.env.example` menjadi `.env`, lalu isi nilainya:

| Variabel | Fungsi |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | **Wajib.** Alamat backend API (contoh: `https://example.com/api`) |
| `NEXT_PUBLIC_IMAGE_BASE_URL` | **Wajib.** Alamat aset/gambar dari backend |
| `API_PROXY_TARGET` | Target rewrite `/api-proxy/:path*` (server-side). Default ke backend dev jika kosong |
| `NEXT_PUBLIC_QRIS_STATIS` | Payload QRIS statis untuk fallback QRIS dinamis |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Kredensial Firebase untuk login Google |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | "" |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | "" |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | "" |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | "" |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | "" |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Slot smart contract (opsional, belum dipakai frontend) |
| `NEXT_PUBLIC_RPC_URL` | RPC Polygon (opsional, belum dipakai frontend) |

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
| `npm test` | Unit test (Vitest) |
| `npm run test:e2e` | E2E test (Playwright, API dimock) |

---

## Catatan Tambahan untuk Kontributor

- **Path alias:** gunakan `@/` untuk menunjuk ke root proyek, contoh `@/lib/api.ts`.
- **Konvensi routing:** folder di dalam `app/` = segmen URL. Route group `(main)`/`(auth)` tidak muncul di URL.
- **Komponen privat route** diletakkan di `_components/` (contoh `app/(main)/programs/[slug]/_components/`).
- **Komponen kartu program** dipakai bersama dari `components/campaign/CampaignCard.tsx` — jangan membuat duplikat di tiap halaman.
- **Komponen pembayaran** (`NominalView`, `MethodView`, `QrisView`, `QrisSementara`, `VaView`) juga bersama di `components/payment/` — perubahan di satu tempat berlaku untuk donasi **dan** wakaf.
- **`"use client"`** ditulis di komponen yang memakai `useState`/`useEffect`/hook browser. Untuk segmen dinamis gunakan `useParams()`; `<Suspense>` hanya diperlukan bila memakai `useSearchParams`.
- Dokumen ini adalah sumber utama struktur proyek — perbarui bila menambah/menghapus halaman.
