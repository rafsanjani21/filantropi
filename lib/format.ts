/**
 * lib/format.ts
 *
 * Fungsi   : Memformat angka/uang gaya Indonesia dan menyediakan tampilan aman untuk nilai tidak valid.
 * Ekspor   : formatRp, safeRp
 * Dipakai  : app/(main)/programs/[slug]/donate/_components/FormView.tsx, app/(main)/wakaf/[slug]/donate/_components/FormView.tsx, tests/unit/formatAndSanitize.test.ts
 * Catatan  : formatRp memakai Intl "id-ID"; safeRp mengubah nilai negatif/kosong/NaN menjadi "0".
 */
/** Format angka/uang gaya Indonesia. */
export const formatRp = (num: number) => new Intl.NumberFormat("id-ID").format(num);

/** Format aman untuk ditampilkan: nilai negatif/bukan angka ditampilkan sebagai 0. */
export const safeRp = (amount: number | "") => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return formatRp(n);
};
