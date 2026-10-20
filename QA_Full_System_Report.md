# Laporan QA — Full System Testing (Frontend Donasi & Wakaf)

## Judul & Waktu Eksekusi

| Item                                   | Detail                                                                                                                |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Proyek**                             | Filantropi (Next.js 16.2.3 / React 19.2.4)                                                                            |
| **Cakupan**                            | Alur transaksi **Donasi** & **Wakaf** (frontend)                                                                      |
| **Waktu Eksekusi (Awal)**              | Jumat, 16 Oktober 2026, 13:36 – 13:53 WIB (+07:00)                                                                    |
| **Waktu Eksekusi (Re-test Pasca-Fix)** | Jumat, 16 Oktober 2026, 14:14 – 14:32 WIB (+07:00)                                                                    |
| **Tooling**                            | Vitest 4.1.12 + Testing Library (unit/component), Playwright 1.x + Chromium (E2E, API mocking penuh via `page.route`) |
| **Server**                             | `next dev` (webServer Playwright), backend **dimock total** — tidak ada server backend yang menyala                   |

### Perintah Eksekusi

```bash
npm run test        # Vitest — 68 tests (68 lulus pasca-fix)
npm run test:e2e    # Playwright — 25 tests (25 lulus pasca-fix)
```

---

## Ringkasan Eksekusi

### Fase 1 — Audit Awal (sebelum perbaikan)

| Lapisan                                                      | Total Test | Lulus  | Gagal | Catatan                                                      |
| ------------------------------------------------------------ | ---------- | ------ | ----- | ------------------------------------------------------------ |
| Unit — `generateDynamicQris`, `formatRp`, sanitasi, validasi | 23         | 23     | 0     | CRC16 tervalidasi dengan vektor referensi `123456789 → 29B1` |
| Unit — FormView Donasi (component)                           | 10         | 10     | 0     | Toggle Anonim, disable tombol saat proses                    |
| Unit — FormWakafView (component)                             | 8          | 8      | 0     | Batas NIK 16 digit, sanitasi telepon                         |
| Unit — QrisSementara (countdown & leak)                      | 4          | 4      | 0     | Interval + cleanup terverifikasi                             |
| Unit — replikasi logika validasi page.tsx                    | 23         | 23     | 0     | Mengekspos celah validasi email & minimum nominal wakaf      |
| E2E — Alur Donasi (Playwright)                               | 13         | 12     | **1** | 1 gagal = **bug double-submit nyata**                        |
| E2E — Alur Wakaf (Playwright)                                | 12         | 12     | 0     | Happy/unhappy path, fallback 500 & timeout lulus             |
| **TOTAL**                                                    | **87**     | **86** | **1** | **Persentase lulus: 98,9%**                                  |

### Fase 2 — Re-test Pasca-Fix (setelah semua perbaikan diterapkan)

| Lapisan                                                                | Total Test | Lulus  | Gagal | Catatan                                                                    |
| ---------------------------------------------------------------------- | ---------- | ------ | ----- | -------------------------------------------------------------------------- |
| Unit — `generateDynamicQris`, `formatRp`, `safeRp`, sanitasi, validasi | 27         | 27     | 0     | Termasuk test throw pada nominal invalid & guard `safeRp`                  |
| Unit — FormView Donasi (component)                                     | 10         | 10     | 0     | Back & UBAH kini disabled saat `isProcessing`                              |
| Unit — FormWakafView (component)                                       | 8          | 8      | 0     | NIK 20 digit kini di-truncate ke 16                                        |
| Unit — QrisSementara (countdown & leak)                                | 3          | 3      | 0     | Ada `setInterval` DAN cleanup `clearInterval`; countdown merosot per detik |
| Unit — replikasi logika validasi page.tsx                              | 20         | 20     | 0     | Email `a@b.c`-style ditolak; pesan error baru terverifikasi                |
| E2E — Alur Donasi (Playwright)                                         | 13         | **13** | **0** | Termasuk **ANTI DOUBLE-SUBMIT kini lulus (postCount = 1)**                 |
| E2E — Alur Wakaf (Playwright)                                          | 12         | **12** | **0** | Email `a@` & `bukan-email` kini ditolak; NIK truncate terverifikasi        |
| **TOTAL**                                                              | **93**     | **93** | **0** | **Persentase lulus: 100%**                                                 |

### Status Kesehatan Frontend

- **Fase 1:** Sehat dengan catatan penting (CONDITIONALLY HEALTHY) — 1 bug kritis & beberapa celah validasi.
- **Fase 2 (PASCA-FIX):** **SEHAT (HEALTHY).** Seluruh 93 test lulus. Semua temuan kritis/sedang/rendah telah diperbaiki dan diverifikasi ulang lewat unit test maupun E2E. Fallback QRIS Dinamis tetap tangguh (POST 500/timeout → QRIS lokal tetap tampil, kini bahkan tanpa menunggu).

---

## Temuan Kritis & Bug (Fase 1) — Status Pasca-Fix

### 🔴 KRITIS-1 — Double-submit donasi bisa menghasilkan 2 request POST

**Status: ✅ DIPERBAIKI & TERVERIFIKASI (E2E lulus, postCount = 1)**

**Akar masalah:** Guard hanya mengandalkan `disabled={isProcessing}` pada JSX — state React belum sempat re-render ketika dua klik `btn.click()` sinkron terjadi dalam satu task JS. Kedua klik menjalankan `handleSubmitPayment` dengan closure `isProcessing === false` yang sama.

**Perbaikan yang diterapkan:**

1. Guard sinkron di awal handler via `useRef` (`processingRef.current || isProcessing`) — ref update sinkron menutup celah klik-ganda-satu-task.
2. Reset guard di `finally` **ditunda ke `setTimeout(..., 0)`** — handler fire-and-forget selesai sinkron dalam satu task; reset sinkron akan membuka celah sebelum klik kedua.
3. Reset eksplisit di `handleBack` saat kembali dari view QRIS/VA ke form.

**Lokasi:** `app/DetailPage/FormDonasiPage/page.tsx:49,83,89,175-181` dan `app/WakafDetailPage/FormWakafPage/page.tsx:50,78,84,167-173`

---

### 🔴 KRITIS-2 — Email Donasi TIDAK divalidasi formatnya

**Status: ✅ DIPERBAIKI & TERVERIFIKASI (unit + E2E: email tidak valid kini DITOLAK)**

**Perbaikan:** `isValidEmail` (regex `EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`) di `lib/validation.ts`. Email `bukan-email-tanpa-titik` kini menampilkan toast **"Format email tidak valid"** dan QRIS tidak tampil.

**Lokasi:** `lib/validation.ts`, `app/DetailPage/FormDonasiPage/page.tsx:85`

---

### 🔴 KRITIS-3 — Validasi email Wakaf sangat lemah (`includes("@")`)

**Status: ✅ DIPERBAIKI & TERVERIFIKASI (E2E: `a@` & `bukan-email` kini DITOLAK)**

**Perbaikan:** Validasi sama ketatnya dengan donasi — gunakan `isValidEmail` yang sama. Pesan error: **"Format email tidak valid"**.

**Lokasi:** `lib/validation.ts`, `app/WakafDetailPage/FormWakafPage/page.tsx:80`

---

### 🔴 KRITIS-4 — Submit Wakaf tidak mengulang validasi minimum nominal Rp 1.000

**Status: ✅ DIPERBAIKI & TERVERIFIKASI (unit test: nominal 500 → "Minimal wakaf Rp 1.000")**

**Perbaikan:** `isValidAmount(amount)` (integer ≥ 1000) dipanggil di `handleSubmitPayment` wakaf — konsisten dengan donasi.

**Lokasi:** `lib/validation.ts`, `app/WakafDetailPage/FormWakafPage/page.tsx:82`

---

### 🟠 SEDANG-1 — `generateDynamicQris` tidak memvalidasi nominal

**Status: ✅ DIPERBAIKI & TERVERIFIKASI (unit test: negatif/desimal/0 → throw)**

**Perbaikan:** Guard di awal fungsi — `if (!Number.isFinite(nominal) || nominal <= 0 || !Number.isInteger(nominal)) throw new Error("Nominal QRIS harus bilangan bulat positif")`.

**Lokasi:** `lib/qrisDinamis.ts`

---

### 🟠 SEDANG-2 — Fragilitas `replace("010211", "010212")`

**Status: ✅ DIPERBAIKI & TERVERIFIKASI (unit test: merchant name `www.010211lab.net` TIDAK terkorupsi)**

**Perbaikan:** Replace hanya pada prefix `"000201010211" → "000201010212"`, bukan substring pertama di mana pun.

**Lokasi:** `lib/qrisDinamis.ts`

---

### 🟠 SEDANG-3 — Fitur hitungan mundur (countdown) QRIS TIDAK ADA

**Status: ✅ DIPERBAIKI & TERVERIFIKASI (unit test: countdown merosot 15:00 → 14:57, cleanup OK)**

**Perbaikan:** Countdown 15 menit (`QRIS_EXPIRY_SECONDS = 900`) dengan `setInterval` + cleanup `useEffect(..., [qrisString])`. Saat expired: teks "QRIS kedaluwarsa", tombol unduh & "Saya Sudah Membayar" disabled. Memory leak dicegah via `clearInterval` di cleanup — terverifikasi unit test `qrisSementara.leak.test.tsx`.

**Lokasi:** `app/components/ui/sharedpayment/QrisSementara.tsx`

---

### 🟡 RENDAH-1 — Tombol Back Donasi tetap AKTIF saat `isProcessing`

**Status: ✅ DIPERBAIKI & TERVERIFIKASI (unit test: Back & UBAH disabled saat `isProcessing=true`)**

**Lokasi:** `app/DetailPage/FormDonasiPage/components/FormView.tsx`

---

### 🟡 RENDAH-2 — NIK 17+ digit ditolak SELURUHNYA, bukan di-truncate

**Status: ✅ DIPERBAIKI & TERVERIFIKASI (E2E: input 20 digit → kini menjadi 16 digit)**

**Perbaikan:** `val.replace(/\D/g, "").slice(0, 16)`.

**Lokasi:** `app/WakafDetailPage/FormWakafPage/components/FormView.tsx`

---

### 🟡 RENDAH-3 — Celah validasi minor lain

**Status: ✅ SEMUA DIPERBAIKI**

| #   | Celah                                       | Status   | Bukti                                            |
| --- | ------------------------------------------- | -------- | ------------------------------------------------ |
| 1   | Email `"   "` lolos — tanpa `.trim()`       | ✅ Fixed | `isValidEmail` regex menolak spasi               |
| 2   | Telepon `"0"` lolos — tanpa panjang minimum | ✅ Fixed | `isValidPhone`: 9–15 digit (unit test)           |
| 3   | `formatRp` render negatif (`Rp -5.000`)     | ✅ Fixed | `safeRp` menampilkan `Rp 0` untuk negatif/NaN/"" |
| 4   | `amount === ""` → "Rp 0"                    | ✅ Fixed | `safeRp` guard                                   |
| 5   | Nominal wakaf di submit hanya cek falsy     | ✅ Fixed | `isValidAmount` diulang di submit                |

**Lokasi:** `lib/validation.ts`, `lib/format.ts`, kedua `FormView.tsx`

---

### ⚠️ Log Error / Warning Selama Eksekusi

**1. Gagal E2E double-submit (bug produk — Fase 1):**

```
Error: expect(received).toBe(expected) // Object.is equality
Expected: 1
Received: 2
  at tests/e2e/donasi.spec.ts:233 (postCount)
```

**Status:** ✅ Setelah fix `useRef` + deferred reset → E2E lulus (postCount = 1).

**2. Fallback timeout (perilaku by-design):**

```
[browser] Pencatatan background gagal TypeError: Failed to fetch
```

Bukan bug — `.catch()` bekerja, QRIS lokal tetap tampil. Pasca-fix QRIS tampil segera (< 5 detik) tanpa menunggu POST settle.

**3. Warning Next.js 16 (colorScheme di metadata):**
**Status:** ✅ Fixed — `colorScheme` dipindah ke `export const viewport` di `app/layout.tsx`.

**4. Warning build (dev) EPERM rename `.next/dev`:**

```
Node.js fs rename failed ... EPERM ... .next/dev/server/*.tmp
Could not find files for /_error in .next/build-manifest.json
```

**Status:** Gangguan file-lock Windows (antivirus/HMR). Menyebabkan 1 kegagalan happy-path donasi yang flaky pada satu run. **Diselesaikan dengan** `Remove-Item -Recurse -Force .next\dev` → run ulang lulus penuh. Tidak ada bug produk.

---

## Evaluasi UX & Performa

### ✅ Kekuatan (Pasca-Fix)

1. **Fallback QRIS Dinamis tangguh & instan** — POST 500/timeout → QRIS lokal tampil segera (fire-and-forget, tidak di-await). Terverifikasi E2E dengan timeout 5 detik.
2. **Anti double-submit berlapis** — `useRef` sinkron (klik-ganda-satu-task) + `isProcessing` state (disable tombol) + deferred reset. Terverifikasi E2E: postCount = 1.
3. **Validasi form seragam & ketat** — util bersama `lib/validation.ts` (`isValidEmail`, `isValidPhone`, `isValidAmount`) menghilangkan drift donasi vs wakaf.
4. **Countdown QRIS 15 menit** dengan cleanup `clearInterval` — tidak ada memory leak (terverifikasi unit test fake-timers).
5. **Guard input aman** — `generateDynamicQris` melempar error pada nominal invalid; `safeRp` mencegah render angka negatif.
6. **NIK UX membaik** — paste 20 digit kini di-truncate ke 16 (bukan input kembali kosong).
7. **API mocking E2E 100% independen** — 25 test berjalan tanpa backend.

### ⚠️ Catatan Lanjutan (nice-to-have, bukan blocker)

1. **Pesan error validasi hanya toast singkat** — belum ada inline error di bawah field (aksesibilitas screen reader).
2. **`idempotencyKey` masih dibuat baru per panggilan handler** — pertimbangkan `useRef` per sesi form agar retry/ganda ke gateway tetap ter-deteksi server (lapisan proteksi server-side).
3. **Duplikasi `handleSubmitPayment`** donasi/wakaf — dapat diekstrak ke custom hook `useTransactionSubmit` untuk mencegah drift masa depan.
4. **Client-heavy rendering** (`"use client"` di hampir semua page) — acceptable untuk aplikasi transaksi dengan state kompleks; tidak ditemukan masalah performa render signifikan (form tampil < 2 detik).

---

## Rekomendasi Perbaikan — Status Implementasi

| #   | Rekomendasi                                                             | Status                  | Lokasi Implementasi                           |
| --- | ----------------------------------------------------------------------- | ----------------------- | --------------------------------------------- |
| 1   | Guard anti double-submit (`useRef` sinkron + deferred reset)            | ✅ Implemented          | Kedua `page.tsx` (`handleSubmitPayment`)      |
| 2   | Validasi email ketat (`isValidEmail` regex)                             | ✅ Implemented          | `lib/validation.ts` + kedua `page.tsx`        |
| 3   | Ulangi validasi minimum nominal di submit Wakaf                         | ✅ Implemented          | `FormWakafPage/page.tsx:82` (`isValidAmount`) |
| 4   | Validasi nominal di `generateDynamicQris` (throw) + replace prefix-only | ✅ Implemented          | `lib/qrisDinamis.ts`                          |
| 5   | Countdown QRIS + cleanup anti memory leak                               | ✅ Implemented          | `QrisSementara.tsx`                           |
| 6   | Kunci tombol Back saat proses                                           | ✅ Implemented          | `FormDonasiPage/components/FormView.tsx`      |
| 7   | Truncate NIK ke 16 digit                                                | ✅ Implemented          | `FormWakafPage/components/FormView.tsx`       |
| 8   | Hardening validasi minor (`isValidPhone`, `safeRp`, trim)               | ✅ Implemented          | `lib/validation.ts`, `lib/format.ts`          |
| 9   | Fire-and-forget POST (QRIS tampil dulu)                                 | ✅ Implemented          | Kedua `page.tsx`                              |
| 10  | Rapikan warning Next.js 16 (`viewport` export)                          | ✅ Implemented          | `app/layout.tsx`                              |
| 11  | Ekstrak `formatRp` ke `lib/format.ts`                                   | ✅ Implemented          | `lib/format.ts` (`formatRp`, `safeRp`)        |
| 12  | Ekstrak `handleSubmitPayment` ke custom hook `useTransactionSubmit`     | ⬜ Belum (nice-to-have) | —                                             |
| 13  | Idempotency key per sesi form (useRef)                                  | ⬜ Belum (nice-to-have) | —                                             |
| 14  | Inline field error (aksesibilitas)                                      | ⬜ Belum (nice-to-have) | —                                             |

---

## Lampiran — Struktur File Pengujian

```
vitest.config.ts                          # Konfigurasi Vitest (jsdom, alias @/)
playwright.config.ts                      # Konfigurasi Playwright + webServer dev
tests/unit/setup.ts                       # Setup jest-dom matchers
tests/unit/qrisDinamis.test.ts            # CRC, Tag 54, throw pada nominal invalid, replace prefix-only
tests/unit/formatAndSanitize.test.ts      # formatRp, safeRp, regex \D, replikasi validasi (import lib/validation)
tests/unit/FormViewDonasi.test.tsx        # render, anonim, disable Back/UBAH saat isProcessing
tests/unit/FormViewWakaf.test.tsx         # NIK truncate 16 digit, sanitasi, safeRp
tests/unit/qrisSementara.leak.test.tsx    # setInterval + cleanup clearInterval + countdown fake-timers
tests/e2e/helpers.ts                      # Mock campaign GET + POST (ok/500/timeout/delay-abort)
tests/e2e/donasi.spec.ts                  # 13 skenario E2E donasi (termasuk anti double-submit lulus)
tests/e2e/wakaf.spec.ts                   # 12 skenario E2E wakaf (email ketat, NIK truncate)
```

`package.json` scripts:

- `npm run test` → `vitest run` (68 tests)
- `npm run test:e2e` → `playwright test` (25 tests)

---

## Kesimpulan

Frontend alur Donasi & Wakaf **telah diperbaiki sepenuhnya** berdasarkan seluruh temuan audit. Status akhir re-test: **93/93 test lulus (100%)**.

**Perbaikan kritis yang diimplementasikan:**

1. **Double-submit donasi (2 POST)** → fixed via `useRef` sinkron guard + deferred reset — E2E `ANTI DOUBLE-SUBMIT` kini lulus (postCount = 1).
2. **Email donasi tanpa validasi format** → fixed via `isValidEmail` regex ketat.
3. **Validasi email wakaf lemah + minimum nominal tidak diulang di submit** → fixed via util bersama `lib/validation.ts` (`isValidEmail`, `isValidAmount`, `isValidPhone`).

**Perbaikan sedang/rendah yang diimplementasikan:** validasi & throw nominal di `generateDynamicQris`, replace prefix-only, countdown QRIS 15 menit dengan cleanup anti-leak, kunci Back/UBAH saat proses, truncate NIK ke 16 digit, `safeRp` guard render negatif, `viewport` export Next 16.

**Sisa rekomendasi nice-to-have (tidak blocker rilis):** ekstrak `useTransactionSubmit`, idempotency key per sesi, inline field error.
