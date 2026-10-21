/**
 * app/(legacy)/ProgramPage/EditProgram/page.tsx
 *
 * Fungsi   : Halaman legacy yang mengalihkan query id ke /programs/manage/<id>/edit.
 * Ekspor   : default LegacyEditProgramPage
 * Dipakai  : Route /ProgramPage/EditProgram; tidak ada tautan internal ditemukan.
 * Catatan  : Redirect via QueryRedirect; fallback ke /programs/manage.
 */

import QueryRedirect from "@/components/legacy/QueryRedirect";

export default function LegacyEditProgramPage() {
  return (
    <QueryRedirect
      param="id"
      prefix="/programs/manage/"
      suffix="/edit"
      fallbackHref="/programs/manage"
    />
  );
}
