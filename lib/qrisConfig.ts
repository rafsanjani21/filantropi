/**
 * lib/qrisConfig.ts
 *
 * Fungsi   : Menyimpan payload QRIS statis yayasan untuk dijadikan dasar QRIS Dinamis saat gateway bermasalah.
 * Ekspor   : QRIS_YAYASAN_STATIS
 * Dipakai  : hooks/useTransactionSubmit.ts
 * Catatan  : Diambil dari env NEXT_PUBLIC_QRIS_STATIS dan bernilai string kosong jika tidak diatur.
 */
// QRIS statis milik yayasan — dipakai saat payment gateway bermasalah (QRIS Dinamis manual).
export const QRIS_YAYASAN_STATIS = process.env.NEXT_PUBLIC_QRIS_STATIS ?? "";
