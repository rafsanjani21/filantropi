<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**Role:**
Bertindaklah sebagai Senior QA Automation Engineer dan SDET yang ahli dalam ekosistem React/Next.js dan Playwright. 

**Tugas Utama:**
Lakukan pengujian menyeluruh (*Full System Testing*) pada kode *frontend* aplikasi Next.js saya, khususnya untuk seluruh alur transaksi **Donasi** dan **Wakaf**. Setelah selesai, dokumentasikan seluruh hasil, temuan *bug*, dan rekomendasi perbaikan ke dalam file Markdown baru.

**Cakupan Pengujian (Test Coverage) yang Harus Anda Lakukan:**

1. **Unit Testing (Utilitas & Logika):** 
   Uji fungsi `generateDynamicQris`, logika format angka/uang (`formatRp`), dan fungsi sanitasi/validasi input (seperti penghapusan huruf menggunakan regex pada input nomor telepon atau nominal).

2. **Form Validation & State Management:** 
   Uji komponen halaman `FormView` (Donasi) dan `FormWakafView` (Wakaf). Cek skenario input kosong, format email tidak valid, nominal di bawah Rp 1.000, batasan karakter NIK, serta logika *toggle* "Sembunyikan nama (Anonim)".

3. **E2E User Flow (Playwright):** 
   Buat dan jalankan skenario simulasi pergerakan pengguna dari halaman pemilihan nominal, pengisian form, hingga munculnya QRIS. Uji *happy path* (alur lancar) dan *unhappy path* (pengguna menekan tombol "Back" di tengah proses atau memanipulasi *state*).

4. **API Integration & Fallback (WAJIB API MOCKING):** 
   Gunakan teknik API Mocking (*network interception* menggunakan `page.route` di Playwright) agar seluruh pengujian E2E dapat berjalan secara independen tanpa memerlukan *server backend* yang menyala. 
   - **Mock GET Campaign:** Anda WAJIB mencegat request *fetch* dari hook `useCampaignDetail` (misalnya endpoint `/campaigns/...`) dan selalu kembalikan respons JSON *dummy* berisi data *campaign* (id, title, status aktif) agar UI bisa me-render halaman awal dengan sukses dan tidak tersangkut di pesan "Data program tidak ditemukan".
   - **Mock POST Transaksi:** Cegat request POST ke `/campaigns/create/v2/...`. Uji bagaimana UI bereaksi jika *mock* ini merespons dengan sukses (200), gagal/error (500), atau *timeout*. Pastikan *fallback* QRIS Dinamis lokal dan hitungan mundur tetap berfungsi normal.

5. **UI/UX & Edge Cases:** 
   Uji pencegahan *double-submit* (memastikan tombol ter-*disable* saat `isProcessing` bernilai true) dan pastikan tidak ada kebocoran memori (*memory leak*) pada `setInterval` di komponen `QrisSementara` saat pengguna berpindah halaman.

**Langkah-Langkah Eksekusi Otomatis:**
1. Buat file skrip pengujian (Vitest/Jest untuk *unit test*, dan Playwright untuk E2E) untuk cakupan di atas jika file tersebut belum ada di dalam *repository*.
2. Jalankan seluruh pengujian tersebut melalui terminal terintegrasi.
3. Baca dan analisis *output* terminal secara mendalam. Cari tahu bagian mana yang gagal (*fail*), rentan, kurang optimal, atau berpotensi menjadi *bug*.
4. Buat file baru bernama `QA_Full_System_Report.md` di *root directory*.

**Struktur File Laporan (`QA_Full_System_Report.md`):**
- **Judul & Waktu Eksekusi**
- **Ringkasan Eksekusi:** Total *test* yang dijalankan, persentase *pass/fail*, dan status kesehatan *frontend* secara umum.
- **Temuan Kritis & Bug:** Daftarkan semua *bug*, celah validasi, atau *error* UI yang Anda temukan selama pengujian (contoh: apakah pengguna bisa lolos memasukkan input minus pada nominal?). Sertakan log *error* dari terminal jika ada yang gagal.
- **Evaluasi UX & Performa:** Catatan mengenai performa *rendering*, *state management*, ketahanan *fallback* QRIS, atau kelemahan alur interaksi pengguna.
- **Rekomendasi Perbaikan (Actionable Items):** Tuliskan rekomendasi perbaikan baris kode secara spesifik dan solutif untuk setiap *bug* atau celah yang ditemukan agar saya bisa langsung mengimplementasikannya.
<!-- END:nextjs-agent-rules -->
