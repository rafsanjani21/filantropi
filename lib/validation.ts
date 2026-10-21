/**
 * lib/validation.ts
 *
 * Fungsi   : Validasi bersama alur Donasi/Wakaf untuk email, nomor telepon, dan nominal transaksi.
 * Ekspor   : EMAIL_REGEX, isValidEmail, isValidPhone, isValidAmount
 * Dipakai  : hooks/useTransactionSubmit.ts, tests/unit/formatAndSanitize.test.ts
 * Catatan  : Telepon disaring menjadi digit lalu wajib 9-15 digit; nominal wajib bilangan bulat minimal Rp 1.000.
 */
/** Utilitas validasi bersama untuk alur Donasi & Wakaf. */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(v: string): boolean {
  return EMAIL_REGEX.test(v.trim());
}

/** Nomor telepon Indonesia: digit saja, 9–15 karakter. */
export function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

/** Nominal transaksi: bilangan bulat positif minimal Rp 1.000. */
export function isValidAmount(amount: number | "", min = 1000): boolean {
  if (amount === "" || !Number.isFinite(amount)) return false;
  if (!Number.isInteger(amount)) return false;
  return amount >= min;
}
