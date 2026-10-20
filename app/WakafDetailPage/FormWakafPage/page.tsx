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
