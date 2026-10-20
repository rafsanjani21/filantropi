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
