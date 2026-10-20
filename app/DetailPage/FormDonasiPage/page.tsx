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
