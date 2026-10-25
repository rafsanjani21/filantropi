/**
 * lib/validation.ts
 *
 * Fungsi   : Validasi bersama alur Donasi/Wakaf untuk email, nomor telepon, NIK, dan nominal transaksi.
 * Ekspor   : EMAIL_REGEX, MIN_TRANSACTION_AMOUNT, MAX_TRANSACTION_AMOUNT,
 *            isValidEmail, isValidPhone, isValidAmount, getAmountError, getNikError
 * Dipakai  : hooks/useTransactionSubmit.ts, components/payment/NominalView.tsx, tests/unit/*
 * Catatan  : Telepon disaring menjadi digit lalu wajib 9-15 digit; nominal wajib bilangan bulat
 *            antara Rp 1.000 dan Rp 1.000.000.000; NIK opsional tetapi bila diisi harus 16 digit.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_TRANSACTION_AMOUNT = 1_000;
export const MAX_TRANSACTION_AMOUNT = 1_000_000_000;

export function isValidEmail(v: string): boolean {
  return EMAIL_REGEX.test(v.trim());
}

/** Nomor telepon Indonesia: digit saja, 9–15 karakter. */
export function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

/** Nominal transaksi: bilangan bulat, minimal Rp 1.000, maksimal Rp 1.000.000.000. */
export function isValidAmount(
  amount: number | "",
  min = MIN_TRANSACTION_AMOUNT,
  max = MAX_TRANSACTION_AMOUNT,
): boolean {
  if (amount === "" || !Number.isFinite(amount)) return false;
  if (!Number.isInteger(amount)) return false;
  return amount >= min && amount <= max;
}

/** Pesan error nominal yang siap ditampilkan, atau null bila valid. */
export function getAmountError(
  amount: number | "",
  label: "donasi" | "wakaf",
): string | null {
  if (amount === "" || !Number.isFinite(amount)) {
    return `Minimal ${label} Rp 1.000`;
  }
  if (!Number.isInteger(amount)) {
    return `Nominal ${label} harus bilangan bulat`;
  }
  if (amount < MIN_TRANSACTION_AMOUNT) {
    return `Minimal ${label} Rp 1.000`;
  }
  if (amount > MAX_TRANSACTION_AMOUNT) {
    return `Maksimal ${label} Rp 1.000.000.000`;
  }
  return null;
}

/** NIK opsional; bila diisi wajib tepat 16 digit. */
export function getNikError(nik: string): string | null {
  if (!nik) return null;
  return /^\d{16}$/.test(nik) ? null : "NIK harus 16 digit";
}
