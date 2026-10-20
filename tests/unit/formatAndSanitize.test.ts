import { describe, it, expect } from "vitest";
import { isValidEmail, isValidPhone, isValidAmount } from "@/lib/validation";

/**
 * Uji logika format uang (formatRp) dan sanitasi/validasi input
 * sesuai pola yang dipakai di FormView Donasi & FormWakafView.
 * Pola di bawah disalin 1:1 dari sumber:
 * - formatRp: FormView.tsx (donasi & wakaf)
 * - phone: FormView.tsx `e.target.value.replace(/\D/g, "")`
 * - nominal: NominalView.tsx `e.target.value.replace(/\D/g, "")`
 * - NIK: FormWakafView.tsx `val.length <= 16` + replace(/\D/g, "")
 */

const formatRp = (num: number) => new Intl.NumberFormat("id-ID").format(num);

describe("formatRp (format uang id-ID)", () => {
  it("memformat 1000 menjadi 1.000", () => {
    expect(formatRp(1000)).toBe("1.000");
  });

  it("memformat 50000 menjadi 50.000", () => {
    expect(formatRp(50000)).toBe("50.000");
  });

  it("memformat 1000000 menjadi 1.000.000", () => {
    expect(formatRp(1000000)).toBe("1.000.000");
  });

  it("memformat 0 menjadi 0", () => {
    expect(formatRp(0)).toBe("0");
  });

  it("formatRp tetap memformat negatif (display dilindungi safeRp di UI)", () => {
    expect(formatRp(-5000)).toBe("-5.000");
  });

  it("safeRp: nilai negatif/kosong/non-angka ditampilkan sebagai 0 (guard UI)", async () => {
    const { safeRp } = await import("@/lib/format");
    expect(safeRp(-5000)).toBe("0");
    expect(safeRp("")).toBe("0");
    expect(safeRp(NaN)).toBe("0");
    expect(safeRp(50000)).toBe("50.000");
  });

  it("memformat angka desimal sesuai locale (pemisah desimal)", () => {
    expect(formatRp(1500.5)).toBe("1.500,5");
  });
});

describe("Sanitasi input nomor telepon (regex \\D dihapus)", () => {
  const sanitizePhone = (v: string) => v.replace(/\D/g, "");

  it("menghapus huruf dari input telepon", () => {
    expect(sanitizePhone("abc08123456789")).toBe("08123456789");
  });

  it("menghapus spasi dan tanda plus", () => {
    expect(sanitizePhone("+62 812-3456-789")).toBe("628123456789");
  });

  it("menghapus karakter minus (negatif tidak bisa masuk)", () => {
    expect(sanitizePhone("-0812")).toBe("0812");
  });

  it("menghasilkan string kosong untuk input non-digit saja", () => {
    expect(sanitizePhone("abc")).toBe("");
  });
});

describe("Sanitasi input nominal (regex \\D dihapus)", () => {
  const sanitizeNominal = (v: string) => v.replace(/\D/g, "");

  it("menolak huruf pada nominal", () => {
    expect(sanitizeNominal("10rb")).toBe("10");
  });

  it("menolak tanda minus pada nominal (input minus tidak bisa diketik)", () => {
    expect(sanitizeNominal("-5000")).toBe("5000");
  });

  it("menolak titik/desimal pada nominal", () => {
    expect(sanitizeNominal("1.500")).toBe("1500");
  });

  it("input kosong menjadi string kosong", () => {
    expect(sanitizeNominal("")).toBe("");
  });

  it("mempertahankan digit saja", () => {
    expect(sanitizeNominal("Rp 1.000.000")).toBe("1000000");
  });
});

describe("Batas karakter NIK (maks 16 digit, truncate)", () => {
  // Replikasi logika SETELAH perbaikan: slice(0, 16)
  const applyNikChange = (raw: string) => raw.replace(/\D/g, "").slice(0, 16);

  it("menerima NIK 16 digit utuh", () => {
    expect(applyNikChange("3175091505900001")).toBe("3175091505900001");
  });

  it("men-truncate input 20 digit menjadi 16 digit (bukan ditolak seluruhnya)", () => {
    expect(applyNikChange("12345678901234567890")).toBe("1234567890123456");
  });

  it("menghapus huruf pada NIK", () => {
    expect(applyNikChange("3175abc0915")).toBe("31750915");
  });
});

describe("Validasi form — util bersama lib/validation.ts (setelah perbaikan)", () => {
  it("isValidEmail: menolak email tanpa format valid", () => {
    expect(isValidEmail("bukanemail")).toBe(false);
    expect(isValidEmail("bukan-email-tanpa-titik")).toBe(false);
    expect(isValidEmail("@")).toBe(false);
    expect(isValidEmail("a@")).toBe(false);
    expect(isValidEmail("@@@@")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false); // tanpa TLD
  });

  it("isValidEmail: menerima email valid dan melakukan trim", () => {
    expect(isValidEmail("budi@mail.com")).toBe(true);
    expect(isValidEmail("  budi@qa.id  ")).toBe(true);
    expect(isValidEmail("user.name+tag@domain.co.id")).toBe(true);
  });

  it("isValidEmail: menolak email berisi spasi saja", () => {
    expect(isValidEmail("   ")).toBe(false);
  });

  it("isValidPhone: panjang 9–15 digit", () => {
    expect(isValidPhone("081234567")).toBe(true); // 9
    expect(isValidPhone("081234567890123")).toBe(true); // 15
    expect(isValidPhone("08123456")).toBe(false); // 8 — terlalu pendek
    expect(isValidPhone("0")).toBe(false);
    expect(isValidPhone("")).toBe(false);
    expect(isValidPhone("0812345678901234")).toBe(false); // 16 — terlalu panjang
  });

  it("isValidAmount: bilangan bulat positif minimal 1000", () => {
    expect(isValidAmount(1000)).toBe(true);
    expect(isValidAmount(999)).toBe(false);
    expect(isValidAmount(1500.5)).toBe(false);
    expect(isValidAmount(-5000)).toBe(false);
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount("")).toBe(false);
  });
});

describe("Logika validasi form page.tsx (setelah perbaikan — konsisten donasi & wakaf)", () => {
  const validateDonasi = (name: string, isAnonymous: boolean, email: string, phone: string, amount: number | "") => {
    if (!name.trim() && !isAnonymous) return "Nama wajib diisi";
    if (!isValidEmail(email)) return "Format email tidak valid";
    if (!isValidPhone(phone)) return "Nomor telepon tidak valid";
    if (!isValidAmount(amount)) return "Minimal donasi Rp 1.000";
    return null;
  };

  const validateWakaf = (name: string, email: string, phone: string, amount: number | "") => {
    if (!name.trim()) return "Nama wajib diisi";
    if (!isValidEmail(email)) return "Format email tidak valid";
    if (!isValidPhone(phone)) return "Nomor telepon tidak valid";
    if (!isValidAmount(amount)) return "Minimal wakaf Rp 1.000";
    return null;
  };

  it("donasi: nama wajib jika tidak anonim", () => {
    expect(validateDonasi("", false, "a@b.c", "08123456789", 50000)).toBe("Nama wajib diisi");
  });

  it("donasi: nama BOLEH kosong jika anonim", () => {
    expect(validateDonasi("", true, "a@bcd.com", "08123456789", 50000)).toBeNull();
  });

  it("FIXED: email tanpa format valid DITOLAK di donasi", () => {
    expect(validateDonasi("Budi", false, "bukanemail", "08123456789", 50000)).toBe(
      "Format email tidak valid",
    );
  });

  it("FIXED: email '   ' (spasi) DITOLAK di donasi", () => {
    expect(validateDonasi("Budi", false, "   ", "08123456789", 50000)).toBe(
      "Format email tidak valid",
    );
  });

  it("donasi: nominal di bawah 1000 ditolak", () => {
    expect(validateDonasi("Budi", false, "budi@mail.com", "08123456789", 999)).toBe(
      "Minimal donasi Rp 1.000",
    );
  });

  it("FIXED: telepon terlalu pendek ('0') DITOLAK", () => {
    expect(validateDonasi("Budi", false, "budi@mail.com", "0", 50000)).toBe(
      "Nomor telepon tidak valid",
    );
  });

  it("FIXED: wakaf — email 'a@' DITOLAK", () => {
    expect(validateWakaf("Budi", "a@", "08123456789", 50000)).toBe(
      "Format email tidak valid",
    );
  });

  it("FIXED: wakaf — nominal 500 (di bawah minimum) DITOLAK di submit", () => {
    expect(validateWakaf("Budi", "budi@mail.com", "08123456789", 500)).toBe(
      "Minimal wakaf Rp 1.000",
    );
  });

  it("wakaf: nama kosong ditolak", () => {
    expect(validateWakaf("  ", "budi@mail.com", "08123456789", 50000)).toBe("Nama wajib diisi");
  });

  it("wakaf: input valid lolos sepenuhnya", () => {
    expect(validateWakaf("Budi", "budi@mail.com", "08123456789", 1000000)).toBeNull();
  });
});
