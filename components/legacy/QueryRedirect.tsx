/**
 * components/legacy/QueryRedirect.tsx
 *
 * Fungsi   : Membaca query param lalu mengalihkan ke URL tujuan (prefix + nilai + suffix) atau fallback.
 * Ekspor   : default QueryRedirect
 * Dipakai  : app/(legacy)/DetailPage/page.tsx, app/(legacy)/DetailPage/FormDonasiPage/page.tsx, app/(legacy)/WakafDetailPage/page.tsx, app/(legacy)/WakafDetailPage/FormWakafPage/page.tsx, app/(legacy)/ProgressPage/page.tsx, app/(legacy)/ProgramPage/EditProgram/page.tsx
 * Catatan  : "use client"; useSearchParams dibungkus Suspense; redirect memakai router.replace.
 */
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type QueryRedirectProps = {
  param: string;
  prefix: string;
  suffix?: string;
  fallbackHref: string;
};

function QueryRedirectInner({
  param,
  prefix,
  suffix = "",
  fallbackHref,
}: QueryRedirectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get(param);

  useEffect(() => {
    router.replace(value ? `${prefix}${value}${suffix}` : fallbackHref);
  }, [router, value, prefix, suffix, fallbackHref]);

  return null;
}

export default function QueryRedirect(props: QueryRedirectProps) {
  return (
    <Suspense fallback={null}>
      <QueryRedirectInner {...props} />
    </Suspense>
  );
}
