# Laporan QA — Full System Testing (Frontend Donasi & Wakaf)

## Judul & Waktu Eksekusi

| Item | Detail |
|---|---|
| Proyek | Filantropi (Next.js 16.4.2 / React 19.2.4 / TypeScript) |
| Cakupan | Alur transaksi **Donasi** & **Wakaf** (frontend), utility, state management, API fallback |
| Waktu Eksekusi | Kamis, 22 Oktober 2026 (WIB) |
| Tooling | Vitest 4.1.12 + Testing Library, Playwright 1.64 + Chromium |
| Backend | Tidak diperlukan — seluruh request API dimock dengan `page.route` |
| Environment | Windows 11, Node.js, `next dev` via Playwright `webServer` |

### Perintah yang Dijalankan

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run test:e2e
npm run build
```

---

## Ringkasan Eksekusi

| Lapisan | Total | Lulus | Gagal | Status |
|---|---:|---:|---:|---|
| Unit/component (Vitest, 10 file) | 108 | 108 | 0 | Lulus |
| E2E Donasi (Playwright) | 14 | 14 | 0 | Lulus |
| E2E Wakaf (Playwright) | 12 | 12 | 0 | Lulus |
| E2E Security headers | 3 | 3 | 0 | Lulus |
| **TOTAL TEST** | **137** | **137** | **0** | **100% lulus** |
| Lint (`eslint --max-warnings 0`) | — | — | 0 | Lulus |
| Typecheck (`tsc --noEmit`) | — | — | 0 | Lulus |
| Build produksi (`next build`) | 19 route | 19 | 0 | Lulus |

**Status kesehatan frontend: SEHAT (HEALTHY).** Seluruh test lulus, build produksi berhasil, dan temuan kritis pada iterasi ini sudah diperbaiki serta diverifikasi ulang.

### Coverage Unit (modul yang diinstrumentasi)

| File | Statements | Branch | Fungsi | Lines |
|---|---:|---:|---:|---:|
| `lib/qrisDinamis.ts` | 91,07% | 85,71% | 100% | 94% |
| `hooks/useTransactionSubmit.ts` | 84,61% | 69,69% | 81,81% | 87,36% |
| `lib/api.ts` | 81,14% | 82,69% | 94,73% | 82,24% |
| `lib/authTokens.ts` | 84,31% | 77,27% | 90% | 93,33% |
| `components/payment/QrisSementara.tsx` | 19,60% | 48,83% | 16,66% | 20% |
| **Total instrumentasi** | **47,78%** | **48,12%** | **41,93%** | **48,11%** |

Catatan: total coverage rendah karena `include` juga menghitung komponen/halaman yang tidak termasuk fokus QA transaksi (`MethodView`, `VaView`, `QrisView`, `useAuth`, dll.). Modul inti transaksi sudah tercakup tinggi.

---

## Temuan Kritis & Bug

### KRITIS-1 — Redirect `/Payment/Success` memicu loop `ERR_TOO_MANY_REDIRECTS`

**Status: DIPERBAIKI & TERVERIFIKASI**

**Gejala:** Navigasi ke `/payment/success?trx_id=...` gagal total di browser (`chrome-error://chromewebdata/`). Trace Playwright menunjukkan `net::ERR_TOO_MANY_REDIRECTS` pada request RSC/dokumen.

**Akar masalah:** `next.config.ts` memiliki redirect legacy:

```ts
{ source: "/Payment/Success", destination: "/payment/success", permanent: true }
{ source: "/Payment/Failed", destination: "/payment/failed", permanent: true }
```

Pencocokan path Next.js bersifat case-insensitive, sehingga `/payment/success` juga cocok dengan source `/Payment/Success` dan di-redirect ke dirinya sendiri tanpa henti.

**Perbaikan:** Kedua redirect dihapus dari `next.config.ts`. Path lowercase adalah satu-satunya URL yang valid.

**Verifikasi:** E2E `STATUS FLOW: 'Saya Sudah Membayar' -> pending -> sukses` lulus dan halaman sukses tampil.

---

### KRITIS-2 — Halaman sukses menampilkan "Data Tidak Ditemukan" karena abort StrictMode

**Status: DIPERBAIKI & TERVERIFIKASI**

**Gejala:** Setelah redirect ke `/payment/success`, halaman menampilkan "Data Tidak Ditemukan — Waktu pemeriksaan status habis", padahal API mock merespons sukses.

**Akar masalah:** Efek `useEffect` membuat `AbortController`; cleanup (termasuk cleanup ganda React StrictMode di development) memanggil `controller.abort()`. `catch` memperlakukan `AbortError` sebagai timeout nyata dan menulis `setError(...)` setelah fetch kedua berhasil.

**Perbaikan di `app/(main)/payment/success/page.tsx`:**

- Flag `cancelled` di-set pada cleanup.
- `catch` mengabaikan error bila `cancelled === true`.
- `setLoading(false)` tidak dijalankan setelah unmount.
- Abort karena timeout (bukan unmount) tetap menampilkan pesan timeout.

---

### TINGGI-1 — QRIS statis rusak saat berisi spasi sah pada nama merchant

**Status: DIPERBAIKI & TERVERIFIKASI**

**Gejala:** `generateDynamicQris` melempar "Struktur QRIS tidak valid" untuk payload QRIS yayasan yang valid.

**Akar masalah:** Normalisasi memakai `qrisStatic.replace(/\s+/g, "")`. Spasi di dalam Tag 59/60 (merchant name/location) adalah karakter sah EMVCo. Menghapusnya mengubah panjang value sehingga parser TLV membaca tag berikutnya secara salah.

**Perbaikan di `lib/qrisDinamis.ts`:**

- Hanya `trim()` tepi payload dan buang `\r\n\t`, bukan spasi internal.
- Parser TLV top-level + validasi CRC16 CCITT-FALSE payload asli.
- Tag 54 lama dibuang agar nominal tidak duplikat.
- Tag 01 `11` diubah menjadi `010212` (statis → dinamis).
- Nominal wajib bilangan bulat positif.

**Verifikasi:** Test `menerima spasi sah di dalam nama merchant`, `tidak menduplikasi Tag 54`, `MENOLAK payload dengan CRC salah`, dan `MENOLAK payload non-TLV` lulus.

---

### TINGGI-2 — Status transaksi pending tetap ditampilkan sebagai "berhasil"

**Status: DIPERBAIKI & TERVERIFIKASI**

**Akar masalah:** Halaman `/payment/success` langsung merender status sukses tanpa memeriksa `status` transaksi dari backend.

**Perbaikan:**

- `success/page.tsx` memeriksa status: `pending/process/processing/menunggu/unpaid` → redirect ke `/payment/pending`; `failed/expired/cancelled/gagal` → redirect ke `/payment/failed`.
- Halaman baru `app/(main)/payment/pending/page.tsx` melakukan polling status setiap 5 detik (maksimal 24 percobaan / 2 menit), lalu redirect ke success/failed.
- Jika `trx_id` tidak ada (POST gateway gagal), halaman pending menampilkan panduan verifikasi manual, bukan klaim sukses palsu.

---

### TINGGI-3 — Pencatatan gateway gagal tetap terlihat seperti sukses

**Status: DIPERBAIKI & TERVERIFIKASI**

**Akar masalah:** QRIS lokal ditampilkan dan toast sukses muncul tanpa menunggu/mengetahui hasil POST transaksi. Kegagalan pencatatan tidak terlihat pengguna.

**Perbaikan di `hooks/useTransactionSubmit.ts`:**

- Menyimpan status pencatatan (`idle | recording | recorded | failed`) dan pesan error.
- QRIS tetap tampil segera (fallback lokal tetap berfungsi), tetapi `QrisSementara` menampilkan banner:
  - "Mencatat transaksi... QRIS sudah dapat dipindai."
  - "Transaksi tercatat..."
  - "Pencatatan otomatis gagal. QRIS tetap dapat dibayar, simpan bukti pembayaran Anda."
- Timeout POST 20 detik via `AbortController`.
- `X-Idempotency-Key` dikirim dan dipertahankan untuk payload yang sama; berubah bila nominal/kontak berubah.
- Guard double-submit sinkron (`processingRef`) + state `isProcessing`.

**Verifikasi E2E:** POST 500 → QRIS tetap tampil + banner gagal + tombol "Saya Sudah Membayar" menuju verifikasi manual; POST timeout → QRIS tampil < 5 detik.

---

### SEDANG-1 — `apiFetch` tidak memiliki timeout/SSR guard dan refresh token tidak single-flight

**Status: DIPERBAIKI**

**Perbaikan di `lib/api.ts`:**

- Timeout 20 detik per request dengan dukungan `AbortSignal` eksternal.
- Guard `typeof window` untuk akses storage.
- Satu promise refresh dipakai bersama oleh semua request 401 bersamaan (single-flight).
- Retry sekali setelah refresh; jika tetap 401 → force logout.
- Opsi `{ publicRead: true }` untuk endpoint status pembayaran yang harus bisa diakses guest tanpa memicu force logout.
- Hanya memasang `Content-Type: application/json` bila ada body non-`FormData`.

**Verifikasi unit:** 6 test `apiFetch` lulus, termasuk refresh single-flight dan timeout.

---

### SEDANG-2 — Validasi nominal/NIK/email tidak konsisten antar halaman

**Status: DIPERBAIKI**

- `lib/validation.ts` menjadi sumber tunggal: `MIN_TRANSACTION_AMOUNT = 1.000`, `MAX_TRANSACTION_AMOUNT = 1.000.000.000`, `getAmountError`, `getNikError`.
- NIK opsional, tetapi bila diisi wajib 16 digit.
- Input nominal dibatasi 12 digit dan disanitasi `\D`; minus/huruf tidak bisa masuk.
- Email memakai regex ketat; telepon 9–15 digit setelah sanitasi.
- Form Donasi/Wakaf menampilkan error inline `role="alert"` + `aria-invalid`/`aria-describedby`.
- Prefill nama/email/telepon dari profil kini reaktif (`useEffect` + `useRef`) dan tidak menimpa input yang sudah diketik.

---

### RENDAH-1 — Tombol unduh QRIS memakai API deprecated dan berpotensi gagal

**Status: DIPERBAIKI**

`QrisSementara` kini mengubah SVG → `Blob` → canvas → `toBlob` → PNG, merevoke object URL, dan tidak memakai `unescape`/`btoa`. Satu `setTimeout` hanya untuk revoke URL setelah unduhan (bukan countdown berulang). Test lama yang melarang semua `setTimeout` sudah diperbarui.

---

### RENDAH-2 — Test E2E bergantung pada prefix `/api/`

**Status: DIPERBAIKI**

Mock diubah dari `**/api/campaigns/**` menjadi `**/campaigns/**` sehingga tetap bekerja jika `NEXT_PUBLIC_API_BASE_URL` tidak memakai prefix `/api` atau berjalan di origin lain.

---

### RENDAH-3 — Kontrak CI tidak menyediakan QRIS statis

**Status: DIPERBAIKI**

`NEXT_PUBLIC_QRIS_STATIS` ditambahkan ke environment `quality.yml`. Tanpa ini, hook menolak submit dengan "Konfigurasi QRIS yayasan belum diatur" dan E2E happy path akan gagal.

---

## P0 Security Hardening (Tindak Lanjut)

**Status: DITERAPKAN DAN DIVERIFIKASI**

| Area | Perubahan | Verifikasi |
|---|---|---|
| Token | Access token hanya di memori; refresh token di `sessionStorage`; token legacy/admin dibersihkan | `tests/unit/authTokens.test.ts` |
| API | Allowlist publik eksplisit; `/donations/history`, `/campaigns/me`, dan endpoint privat lain wajib Bearer | `tests/unit/api.test.ts` |
| Refresh | Single-flight, proaktif setelah reload, dan force logout + sign out Firebase saat gagal | `tests/unit/api.test.ts` |
| CSP | `img-src`/`connect-src`/`frame-src` memakai origin eksplisit; tanpa wildcard `https:`/`*.googleapis.com`; `upgrade-insecure-requests` hanya produksi | `tests/e2e/security.spec.ts` |
| Header | `camera=()`, `X-Permitted-Cross-Domain-Policies: none`, `Origin-Agent-Cluster: ?1` | `tests/e2e/security.spec.ts` |
| Cache | `no-store` untuk `/profile`, `/payment`, `/programs/manage` | `tests/e2e/security.spec.ts` |
| URL | `safeHref`/`safeImageUrl` menolak `javascript:`, `data:text/html`, `ftp:`, dan `//evil` | `tests/unit/safeUrl.test.ts` |
| E2E runner | `next dev --webpack` dipakai untuk menghindari `EPERM` manifest Turbopack di Windows | 29/29 E2E lulus |

Catatan: `authTokens.ts` sudah diuji untuk sesi lama yang tidak membawa refresh token baru, sehingga refresh milik pengguna sebelumnya tidak tersisa. Endpoint profil kreator publik juga sudah masuk allowlist agar halaman `/creator/[id]` tidak memicu force logout.

---

## Evaluasi UX & Performa

1. **Fallback QRIS tangguh.** QRIS Dinamis lokal dirender sebelum POST selesai. Pengguna tidak menunggu gateway; kegagalan pencatatan tidak menghilangkan kemampuan membayar.
2. **Status jujur.** Banner pencatatan + halaman pending menghindari klaim "berhasil" palsu. Ini penting untuk transaksi finansial.
3. **Anti double-submit.** Guard sinkron menutup celah dua klik dalam satu task JS; tombol juga `disabled` saat `isProcessing`.
4. **Aksesibilitas.** Error inline memiliki `role="alert"`; input memiliki `aria-invalid`, `aria-describedby`, `autoComplete`; toggle anonim dan tombol back memiliki label.
5. **Kebocoran timer.** `QrisSementara` tidak memiliki countdown berulang. Halaman pending membersihkan `setTimeout` pada cleanup. Halaman sukses membatalkan fetch saat unmount.
6. **Duplikasi pesan.** Error validasi muncul sebagai toast sekaligus inline. Fungsional, tetapi bisa terasa berisik; pertimbangkan menonaktifkan toast untuk error field.
7. **Performa CSP.** `await connection()` di `app/layout.tsx` membuat seluruh halaman dynamic agar nonce CSP dapat disisipkan. Ini trade-off keamanan vs static rendering; jangan dihapus tanpa mengganti mekanisme nonce.
8. **Idempotency.** Frontend mengirim `X-Idempotency-Key`, tetapi efektivitas akhir bergantung pada backend yang wajib menyimpan/menghormati key tersebut.

---

## Rekomendasi Perbaikan (Actionable Items)

### Wajib sebelum produksi

1. **Pastikan backend menghormati `X-Idempotency-Key`** dan menyimpan key minimal 24 jam. Tanpa itu, retry tetap bisa membuat transaksi ganda.
2. **Validasi `NEXT_PUBLIC_QRIS_STATIS` saat startup/healthcheck.** Sekarang payload invalid baru ketahuan saat user submit ("CRC QRIS statis tidak valid"). Tambahkan pengecekan build-time atau endpoint health.
3. **Tambahkan E2E status `failed`:** mock `/transactions/:id` mengembalikan `failed`, pastikan redirect ke `/payment/failed` dan bukan success.
4. **Tambahkan E2E timeout polling pending** (mis. 24 percobaan) dan pastikan tombol "Cek Riwayat" tetap tersedia.

### Peningkatan

5. **Kurangi duplikasi toast + inline error** atau tampilkan toast hanya untuk error form-level.
6. **Sertakan `amount` dan `type` pada redirect pending → success** agar halaman sukses dapat menampilkan nominal segera sebelum fetch selesai.
7. **Tambahkan coverage threshold** di `vitest.config.ts` (mis. 70% untuk `lib/validation.ts`, `lib/qrisDinamis.ts`, `hooks/useTransactionSubmit.ts`) dan upload laporan coverage sebagai artifact CI.
8. **Pisahkan error `AbortError` berdasarkan alasan** (timeout vs unmount) dengan helper kecil agar pola ini tidak terulang di halaman lain.
9. **Tinjau 5 high severity vulnerability** dari `npm audit` (mayoritas transitif Firebase/Google). Jalankan `npm audit` dan update dependensi secara terkontrol.
10. **Hindari `window.location.replace` di `apiFetch`** bila memungkinkan; gunakan event + router agar transisi logout lebih halus. Namun karena `apiFetch` dipakai di luar React, pendekatan sekarang masih dapat diterima.
11. **Bersihkan `.next/dev` saat E2E di Windows** jika muncul `EPERM rename server-reference-manifest.js` (antivirus/file lock). Ini bukan bug aplikasi, tetapi dapat membuat developer bingung.

---

## Bukti Eksekusi

```text
npm run lint        -> 0 error, 0 warning
npm run typecheck   -> sukses
npm test            -> 10 file, 108 test lulus
npm run test:coverage -> 108 test lulus; statements 47,78%, lines 48,11%
npm run test:e2e    -> 29 test lulus (2,7 menit, webpack dev)
npm run build       -> 19 route berhasil dibangun
```

Catatan: `test:e2e` memakai `next dev --webpack` karena Turbopack dev di Windows sesekali gagal `rename` manifest `.next/dev/server/server-reference-manifest.js` (EPERM) dan membuat satu request halaman merespons 500. Peringatan Vite `configLoader: 'native'` hanya informational dan dapat dihilangkan dengan mengganti `vitest.config.ts` menjadi `.mts`.
