/** Format angka/uang gaya Indonesia. */
export const formatRp = (num: number) => new Intl.NumberFormat("id-ID").format(num);

/** Format aman untuk ditampilkan: nilai negatif/bukan angka ditampilkan sebagai 0. */
export const safeRp = (amount: number | "") => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return formatRp(n);
};
