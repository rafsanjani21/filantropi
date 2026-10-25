/**
 * lib/safeUrl.ts
 *
 * Fungsi   : Memvalidasi URL dari API agar hanya memakai http/https atau path internal.
 * Ekspor   : safeHref, safeImageUrl
 * Dipakai  : komponen yang merender tautan/gambar dinamis dari backend
 * Catatan  : Menolak javascript:, data:text/html, dan skema berbahaya lain.
 */

const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

function isSafeInternalPath(value: string): boolean {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
  );
}

export function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isSafeInternalPath(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    return SAFE_PROTOCOLS.has(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function safeImageUrl(
  value: unknown,
  fallback = "/bencana.webp",
): string {
  return safeHref(value) ?? fallback;
}
