/**
 * app/(legacy)/DetailPage/page.tsx
 *
 * Fungsi   : Halaman legacy yang mengalihkan query slug ke /programs/<slug>.
 * Ekspor   : default LegacyDetailPage
 * Dipakai  : Route /DetailPage; tidak ada tautan internal ditemukan.
 * Catatan  : Redirect via QueryRedirect; fallback ke /programs.
 */

import QueryRedirect from "@/components/legacy/QueryRedirect";

export default function LegacyDetailPage() {
  return (
    <QueryRedirect
      param="slug"
      prefix="/programs/"
      fallbackHref="/programs"
    />
  );
}
