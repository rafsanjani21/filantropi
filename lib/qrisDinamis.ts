// Dipakai saat payment gateway bermasalah, untuk mengubah QRIS Statis menjadi QRIS Dinamis dengan menyematkan nominal donasi/wakaf.

/**
 * Mengubah QRIS Statis menjadi QRIS Dinamis dengan menyematkan nominal.
 * Menggunakan algoritma CRC16 CCITT FALSE.
 * 
 * @param qrisStatic String QRIS asli/statis (biasanya dari gambar QRIS yayasan)
 * @param nominal Angka nominal donasi/wakaf
 * @returns String QRIS Dinamis yang siap dirender menjadi gambar QR Code
 */
export function generateDynamicQris(qrisStatic: string, nominal: number): string {
  if (!qrisStatic) return "";

  // Validasi nominal: harus bilangan bulat positif (mencegah payload EMVCo invalid)
  if (!Number.isFinite(nominal) || !Number.isInteger(nominal) || nominal <= 0) {
    throw new Error("Nominal QRIS harus bilangan bulat positif");
  }

  // 1. Ubah Point of Initiation Method: "010211" (Static) menjadi "010212" (Dynamic)
  //    Hanya ganti tag 01 di awal payload ("000201010211"), bukan substring di mana pun
  let qris = qrisStatic.startsWith("000201010211")
    ? qrisStatic.replace("000201010211", "000201010212")
    : qrisStatic;

  // 2. Buang CRC lama (Tag 6304 + 4 karakter di akhir) -> Total 8 karakter terakhir
  const qrisWithoutCrc = qris.slice(0, -8);

  // 3. Buat Tag 54 untuk Nominal
  const amountStr = nominal.toString();
  const amountLength = amountStr.length.toString().padStart(2, "0");
  const tag54Amount = `54${amountLength}${amountStr}`;

  // 4. Sisipkan Tag 54 dan siapkan string untuk dihitung CRC barunya
  const payloadToCalculate = `${qrisWithoutCrc}${tag54Amount}6304`;

  // 5. Hitung CRC16 CCITT FALSE
  const calculateCRC16 = (payload: string): string => {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    // Format ke Hexadecimal uppercase 4 digit
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
  };

  const newCrc = calculateCRC16(payloadToCalculate);

  // 6. Kembalikan QRIS utuh
  return `${payloadToCalculate}${newCrc}`;
}