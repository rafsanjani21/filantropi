/**
 * app/(legacy)/WakafDetailPage/FormWakafPage/page.tsx
 *
 * Fungsi   : Halaman legacy yang mengalihkan query slug ke /wakaf/<slug>/donate.
 * Ekspor   : default LegacyFormWakafPage
 * Dipakai  : Route /WakafDetailPage/FormWakafPage; tidak ada tautan internal ditemukan.
 * Catatan  : Redirect via QueryRedirect; fallback ke /programs?type=wakaf.
 */

import QueryRedirect from "@/components/legacy/QueryRedirect";

export default function LegacyFormWakafPage() {
  return (
    <QueryRedirect
      param="slug"
      prefix="/wakaf/"
      suffix="/donate"
      fallbackHref="/programs?type=wakaf"
    />
  );
}
