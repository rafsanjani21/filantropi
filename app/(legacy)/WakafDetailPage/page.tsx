/**
 * app/(legacy)/WakafDetailPage/page.tsx
 *
 * Fungsi   : Halaman legacy yang mengalihkan query slug ke /wakaf/<slug>.
 * Ekspor   : default LegacyWakafDetailPage
 * Dipakai  : Route /WakafDetailPage; tidak ada tautan internal ditemukan.
 * Catatan  : Redirect via QueryRedirect; fallback ke /programs?type=wakaf.
 */

import QueryRedirect from "@/components/legacy/QueryRedirect";

export default function LegacyWakafDetailPage() {
  return (
    <QueryRedirect
      param="slug"
      prefix="/wakaf/"
      fallbackHref="/programs?type=wakaf"
    />
  );
}
