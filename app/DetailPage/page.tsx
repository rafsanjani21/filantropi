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
