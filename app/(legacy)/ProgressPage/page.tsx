/**
 * app/(legacy)/ProgressPage/page.tsx
 *
 * Fungsi   : Halaman legacy yang mengalihkan query id ke /progress/<id>.
 * Ekspor   : default LegacyProgressPage
 * Dipakai  : Route /ProgressPage; tidak ada tautan internal ditemukan.
 * Catatan  : Redirect via QueryRedirect; fallback ke /programs/manage.
 */

import QueryRedirect from "@/components/legacy/QueryRedirect";

export default function LegacyProgressPage() {
  return (
    <QueryRedirect
      param="id"
      prefix="/progress/"
      fallbackHref="/programs/manage"
    />
  );
}
