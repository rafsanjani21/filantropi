/**
 * tests/unit/qrisDinamis.test.ts
 *
 * Fungsi   : Unit test generateDynamicQris untuk perubahan tag statis/dinamis, penyisipan Tag 54, dan validitas CRC16.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Vitest saat `npm test` / `npx vitest`
 * Catatan  : Memverifikasi CRC16 CCITT-FALSE dengan implementasi pembanding, penolakan nominal tidak valid, dan keamanan replace tag 01.
 */
import { describe, it, expect } from "vitest";
import { generateDynamicQris } from "@/lib/qrisDinamis";

const QRIS_STATIC =
  "00020101021126570011ID.DANA.WWW011893600915348406432302094840643230303UMI51440014ID.CO.QRIS.WWW0215ID10232809145820303UMI5204839853033605802ID5918www.filantropi.net6015Kota Jakarta Ti61051322063049E94";

/** Implementasi CRC16-CCITT-FALSE independen untuk verifikasi silang */
function crc16CcittFalse(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

describe("generateDynamicQris", () => {
  it("mengubah Point of Initiation Method dari statis (010211) ke dinamis (010212)", () => {
    const result = generateDynamicQris(QRIS_STATIC, 50000);
    expect(result).toContain("010212");
    expect(result).not.toContain("010211");
  });

  it("menyematkan Tag 54 (nominal) dengan benar untuk nominal 50000", () => {
    const result = generateDynamicQris(QRIS_STATIC, 50000);
    expect(result).toContain("540550000");
  });

  it("menyematkan Tag 54 dengan panjang 2 digit untuk nominal 1000", () => {
    const result = generateDynamicQris(QRIS_STATIC, 1000);
    expect(result).toContain("54041000");
  });

  it("menyematkan Tag 54 dengan panjang 7 digit untuk nominal 3000000", () => {
    const result = generateDynamicQris(QRIS_STATIC, 3000000);
    expect(result).toContain("54073000000");
  });

  it("menghasilkan CRC16 yang valid di 4 karakter terakhir", () => {
    const result = generateDynamicQris(QRIS_STATIC, 150000);
    const body = result.slice(0, -4);
    const crc = result.slice(-4);
    expect(crc).toMatch(/^[0-9A-F]{4}$/);
    expect(crc).toBe(crc16CcittFalse(body));
  });

  it("CRC16 konsisten dengan vektor referensi '123456789' -> 29B1 (sanity check algoritma)", () => {
    // Verifikasi independen bahwa algoritma CRC16-CCITT-FALSE yang dipakai di implementasi aplikasi benar
    const result = generateDynamicQris(QRIS_STATIC, 1);
    const body = result.slice(0, -4);
    expect(result.slice(-4)).toBe(crc16CcittFalse(body));
    // Vektor referensi standar
    expect(crc16CcittFalse("123456789")).toBe("29B1");
  });

  it("mengembalikan string kosong jika QRIS statis kosong", () => {
    expect(generateDynamicQris("", 50000)).toBe("");
  });

  it("MENOLAK nominal negatif dengan throw error (guard payload EMVCo)", () => {
    expect(() => generateDynamicQris(QRIS_STATIC, -5000)).toThrow(
      /bilangan bulat positif/,
    );
  });

  it("MENOLAK nominal desimal dengan throw error (1500.5)", () => {
    expect(() => generateDynamicQris(QRIS_STATIC, 1500.5)).toThrow(
      /bilangan bulat positif/,
    );
  });

  it("MENOLAK nominal 0 dengan throw error", () => {
    expect(() => generateDynamicQris(QRIS_STATIC, 0)).toThrow(
      /bilangan bulat positif/,
    );
  });

  it("replace tag 01 AMAN: hanya mengganti prefix '000201010211', tidak menyentuh merchant name", () => {
    // Layout EMV standar: tag 01 diganti
    const standard = generateDynamicQris(QRIS_STATIC, 10000);
    expect(standard.startsWith("000201010212")).toBe(true);

    // Payload tanpa tag 01 tapi merchant name mengandung '010211' -> TIDAK terkorupsi
    const noTag01 = QRIS_STATIC.replace("010211", "").replace(
      "www.filantropi.net",
      "www.010211lab.net",
    );
    const result = generateDynamicQris(noTag01, 10000);
    expect(result).toContain("www.010211lab.net");
    expect(result).not.toContain("www.010212lab.net");
  });

  it("nominal sangat besar tidak menyebabkan error dan CRC tetap 4 karakter hex", () => {
    const result = generateDynamicQris(QRIS_STATIC, 999999999);
    expect(result).toContain("5409999999999");
    expect(result.slice(-4)).toMatch(/^[0-9A-F]{4}$/);
  });
});
