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
