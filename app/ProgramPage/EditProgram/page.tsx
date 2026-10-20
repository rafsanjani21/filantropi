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
