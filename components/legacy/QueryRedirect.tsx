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
