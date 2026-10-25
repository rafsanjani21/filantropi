/**
 * tests/unit/validation.test.ts
 *
 * Fungsi   : Menguji batas nominal minimum/maksimum, pesan error, dan aturan NIK 16 digit.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Vitest saat `npm test` / `npx vitest`
 * Catatan  : Melengkapi formatAndSanitize.test.ts dengan boundary Rp 1.000 / Rp 1.000.000.000.
 */
import { describe, it, expect } from "vitest";
import {
  MAX_TRANSACTION_AMOUNT,
  MIN_TRANSACTION_AMOUNT,
  getAmountError,
  getNikError,
  isValidAmount,
} from "@/lib/validation";

describe("batas nominal transaksi", () => {
  it("menerima batas bawah tepat Rp 1.000 dan batas atas Rp 1.000.000.000", () => {
    expect(MIN_TRANSACTION_AMOUNT).toBe(1_000);
    expect(isValidAmount(1_000)).toBe(true);
    expect(isValidAmount(MAX_TRANSACTION_AMOUNT)).toBe(true);
  });

  it("menolak nominal di atas batas atas", () => {
    expect(isValidAmount(1_000_000_001)).toBe(false);
  });

  it("menolak NaN, Infinity, dan string kosong", () => {
    expect(isValidAmount(NaN)).toBe(false);
    expect(isValidAmount(Infinity)).toBe(false);
    expect(isValidAmount("")).toBe(false);
  });
});

describe("getAmountError", () => {
  it("memberi pesan minimum untuk nilai kosong dan di bawah minimum", () => {
    expect(getAmountError("", "donasi")).toBe("Minimal donasi Rp 1.000");
    expect(getAmountError(999, "wakaf")).toBe("Minimal wakaf Rp 1.000");
  });

  it("memberi pesan maksimum di atas batas", () => {
    expect(getAmountError(1_000_000_001, "donasi")).toBe(
      "Maksimal donasi Rp 1.000.000.000",
    );
  });

  it("menolak nominal desimal", () => {
    expect(getAmountError(1500.5, "wakaf")).toBe(
      "Nominal wakaf harus bilangan bulat",
    );
  });

  it("mengembalikan null untuk nominal valid", () => {
    expect(getAmountError(50_000, "donasi")).toBeNull();
  });
});

describe("getNikError", () => {
  it("NIK kosong dianggap valid (opsional)", () => {
    expect(getNikError("")).toBeNull();
  });

  it("menerima tepat 16 digit", () => {
    expect(getNikError("3175091505900001")).toBeNull();
  });

  it("menolak NIK kurang/lebih dari 16 digit atau mengandung huruf", () => {
    expect(getNikError("317509150590000")).toBe("NIK harus 16 digit");
    expect(getNikError("31750915059000011")).toBe("NIK harus 16 digit");
    expect(getNikError("31750915059000AB")).toBe("NIK harus 16 digit");
  });
});
