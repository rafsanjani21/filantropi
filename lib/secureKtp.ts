/**
 * lib/secureKtp.ts
 *
 * Fungsi   : Mengambil foto KTP dari endpoint terproteksi (`/api/v1/secure/ktp/:filename`)
 *            memakai Authorization Bearer, lalu mengubahnya menjadi object URL untuk <img>.
 * Ekspor   : isSecureKtpPath, resolveImageAssetUrl, fetchSecureKtpObjectUrl
 * Dipakai  : app/(main)/profile/user/page.tsx, app/(main)/profile/beneficiary/page.tsx
 * Catatan  : Endpoint KTP mengembalikan binary image dan tidak bisa dirender lewat src biasa
 *            karena butuh header Authorization dari access token.
 */

import { apiFetchBlob } from "./api";

const IMAGE_BASE_URL = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "").replace(
  /\/+$/,
  "",
);

/** Deteksi path endpoint KTP aman yang wajib diambil dengan header Authorization. */
export function isSecureKtpPath(path: string): boolean {
  return /\/secure\/ktp\//i.test(path);
}

/**
 * Rapikan garis miring ganda di dalam path tanpa merusak `http://`.
 * Backend mengembalikan prefix `/api/v1/secure/ktp/` + file `/uploads/ktp/...`
 * sehingga terbentuk `ktp//uploads`; browser lalu 404.
 */
function collapseSlashes(value: string): string {
  return value.replace(/([^:]\/)\/+/g, "$1");
}

/** Ubah path relatif dari API menjadi URL absolut berbasis NEXT_PUBLIC_IMAGE_BASE_URL. */
export function resolveImageAssetUrl(path: string): string {
  const normalized = collapseSlashes(path.trim());

  if (/^https?:\/\//i.test(normalized)) return normalized;

  const cleanPath = normalized.replace(/^\/+/, "");
  const url = IMAGE_BASE_URL ? `${IMAGE_BASE_URL}/${cleanPath}` : `/${cleanPath}`;
  return collapseSlashes(url);
}

/**
 * Ambil foto KTP terenkripsi lalu kembalikan blob URL.
 * Pemanggil bertanggung jawab memanggil URL.revokeObjectURL saat preview tidak dipakai.
 */
export async function fetchSecureKtpObjectUrl(path: string): Promise<string> {
  const blob = await apiFetchBlob(resolveImageAssetUrl(path));
  return URL.createObjectURL(blob);
}
