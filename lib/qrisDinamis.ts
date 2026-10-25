/**
 * lib/qrisDinamis.ts
 *
 * Fungsi   : Mengubah QRIS Statis menjadi QRIS Dinamis dengan menyisipkan Tag 54 (nominal)
 *            dan menghitung ulang CRC16 CCITT-FALSE.
 * Ekspor   : generateDynamicQris
 * Dipakai  : hooks/useTransactionSubmit.ts, tests/unit/qrisDinamis.test.ts
 * Catatan  : Payload dinormalisasi (whitespace dibuang), struktur TLV + CRC lama divalidasi,
 *            Tag 54 lama dibuang agar tidak duplikat, dan nominal non-bulat/negatif ditolak.
 */

type TlvItem = {
  tag: string;
  value: string;
  start: number;
  end: number;
};

/** Parser TLV top-level EMVCo (tag 2 digit + panjang 2 digit + value). */
function parseTlv(payload: string): TlvItem[] | null {
  const items: TlvItem[] = [];
  let index = 0;

  while (index < payload.length) {
    if (index + 4 > payload.length) return null;

    const tag = payload.slice(index, index + 2);
    const lengthStr = payload.slice(index + 2, index + 4);
    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(lengthStr)) return null;

    const length = Number(lengthStr);
    const valueStart = index + 4;
    const end = valueStart + length;
    if (end > payload.length) return null;

    items.push({
      tag,
      value: payload.slice(valueStart, end),
      start: index,
      end,
    });
    index = end;
  }

  return items;
}

/** CRC16 CCITT-FALSE untuk payload EMVCo. */
function calculateCRC16(payload: string): string {
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
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Mengubah QRIS Statis menjadi QRIS Dinamis dengan menyematkan nominal.
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

  // Hanya buang whitespace di tepi + line break/tab. Spasi di dalam nama merchant
  // (tag 59/60) adalah karakter sah; menghapusnya akan merusak panjang TLV.
  const cleaned = qrisStatic.trim().replace(/[\r\n\t]+/g, "");

  if (!cleaned.startsWith("000201")) {
    throw new Error("Payload QRIS tidak valid");
  }

  const parsed = parseTlv(cleaned);
  if (!parsed || parsed.length === 0) {
    throw new Error("Struktur QRIS tidak valid");
  }

  const crcItem = parsed[parsed.length - 1];
  if (crcItem.tag !== "63" || crcItem.value.length !== 4) {
    throw new Error("Tag CRC QRIS tidak ditemukan");
  }

  const computedCrc = calculateCRC16(cleaned.slice(0, -4));
  if (computedCrc !== crcItem.value.toUpperCase()) {
    throw new Error("CRC QRIS statis tidak valid");
  }

  // Buang "6304" + 4 karakter CRC lama.
  const body = cleaned.slice(0, -8);
  const bodyItems = parseTlv(body);
  if (!bodyItems) {
    throw new Error("Struktur QRIS tidak valid");
  }

  // Buang Tag 54 lama (jika payload sudah dinamis) agar nominal tidak duplikat,
  // lalu ubah Point of Initiation Method 11 -> 12.
  const rebuilt = bodyItems
    .filter((item) => item.tag !== "54")
    .map((item) => {
      if (item.tag === "01" && item.value === "11") {
        return "010212";
      }
      return body.slice(item.start, item.end);
    })
    .join("");

  const amountStr = nominal.toString();
  const amountLength = amountStr.length.toString().padStart(2, "0");
  const payloadToCalculate = `${rebuilt}54${amountLength}${amountStr}6304`;

  return `${payloadToCalculate}${calculateCRC16(payloadToCalculate)}`;
}
