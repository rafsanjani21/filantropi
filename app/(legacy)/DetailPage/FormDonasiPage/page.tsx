/**
 * app/(legacy)/DetailPage/FormDonasiPage/page.tsx
 *
 * Fungsi   : Halaman legacy yang mengalihkan query slug ke /programs/<slug>/donate.
 * Ekspor   : default LegacyFormDonasiPage
 * Dipakai  : Route /DetailPage/FormDonasiPage; tidak ada tautan internal ditemukan.
 * Catatan  : Redirect via QueryRedirect; fallback ke /programs.
 */

import QueryRedirect from "@/components/legacy/QueryRedirect";

export default function LegacyFormDonasiPage() {
  return (
    <QueryRedirect
      param="slug"
      prefix="/programs/"
      suffix="/donate"
      fallbackHref="/programs"
    />
  );
}
