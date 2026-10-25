/**
 * lib/api.ts
 *
 * Fungsi   : Wrapper fetch API dengan penyisipan token, timeout, penanganan 401 + refresh token
 *            single-flight, retry request, dan force logout.
 * Ekspor   : BASE_URL, apiFetch
 * Dipakai  : lib/auth.service.ts, hooks/useCampaignDetail.ts, components/layout/GlobalLiveDonationBlink.tsx,
 *            app/(main)/progress/[id]/page.tsx, app/(main)/programs/[slug]/page.tsx,
 *            app/(main)/programs/manage/page.tsx, app/(main)/programs/manage/[id]/edit/page.tsx
 * Catatan  : Access token hanya di memori dan refresh token di sessionStorage; endpoint baca publik dan
 *            auth tidak memakai Authorization. Refresh token yang berjalan bersamaan dibagi lewat satu
 *            promise (single-flight).
 */

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
} from "./authTokens";
import { signOutFirebase } from "./firebaseSession";

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const REQUEST_TIMEOUT_MS = 20_000;

const NO_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/refresh-token",
  "/auth/logout",
];

const NO_AUTH_PREFIXES = ["/auth/register"];

const RESERVED_CAMPAIGN_SEGMENTS = new Set([
  "create",
  "me",
  "disbursements",
  "report",
  "stepper",
  "transactions",
]);

const ALLOWED_LOGOUT_PATHS = [
  "/login",
  "/profile/beneficiary/type",
  "/profile/user",
];

let refreshPromise: Promise<string> | null = null;

const canUseStorage = () => typeof window !== "undefined";

function pathOf(endpoint: string): string {
  return endpoint.split("?")[0].replace(/\/+$/, "") || "/";
}

/**
 * Tolak segmen yang dapat dinormalisasi backend menjadi path lain
 * (mis. `me%2F..%2Fme` atau `..%2Fhistory`) agar tidak lolos allowlist publik.
 */
function hasUnsafePathSegment(path: string): boolean {
  return path.split("/").some((segment) => {
    if (!segment) return false;

    let decoded: string;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      return true;
    }

    return (
      decoded === "." ||
      decoded === ".." ||
      decoded.includes("/") ||
      decoded.includes("\\") ||
      decoded.includes("%") ||
      /[\u0000-\u001f]/.test(decoded)
    );
  });
}

function isAuthEndpoint(path: string): boolean {
  return (
    NO_AUTH_ENDPOINTS.includes(path) ||
    NO_AUTH_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    )
  );
}

function isPublicCampaignRead(path: string): boolean {
  if (path === "/campaigns") return true;

  if (/^\/campaigns\/disbursements\/[^/]+$/.test(path)) return true;
  if (/^\/campaigns\/report\/[^/]+$/.test(path)) return true;
  if (/^\/campaigns\/stepper\/[^/]+$/.test(path)) return true;
  if (/^\/campaigns\/transactions\/latest\/[^/]+$/.test(path)) return true;

  const singleCampaign = /^\/campaigns\/([^/]+)$/.exec(path);
  if (!singleCampaign) return false;

  try {
    const segment = decodeURIComponent(singleCampaign[1]);
    return !RESERVED_CAMPAIGN_SEGMENTS.has(segment);
  } catch {
    return false;
  }
}

function isPublicRead(method: string, path: string): boolean {
  if (method !== "GET" || hasUnsafePathSegment(path)) return false;
  if (isPublicCampaignRead(path)) return true;

  // Hanya endpoint saldo dompet dan profil kreator publik, bukan seluruh /donations/*.
  return (
    /^\/donations\/in\/[^/]+$/.test(path) ||
    /^\/user\/profile\/campaign-creator\/[^/]+$/.test(path)
  );
}

function forceLogout() {
  if (!canUseStorage()) return;

  const isAllowed = ALLOWED_LOGOUT_PATHS.some((path) =>
    window.location.pathname.startsWith(path),
  );

  clearTokens();

  // Halaman pendaftaran memang belum punya token; jangan tendang user dari sana.
  if (isAllowed) return;

  try {
    sessionStorage.removeItem("id_token");
    sessionStorage.removeItem("temp_name");
  } catch {
    // Storage dapat diblokir browser.
  }

  void signOutFirebase();

  window.location.replace("/login");
}

/** fetch dengan timeout dan dukungan signal eksternal. */
async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const externalSignal = init.signal;
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const forwardAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", forwardAbort, { once: true });
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted && !externalSignal?.aborted) {
      throw new Error("Waktu permintaan habis (timeout)");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", forwardAbort);
  }
}

async function parseBody(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
}

/** Refresh token single-flight: request 401 bersamaan berbagi satu proses refresh. */
function refreshAccessToken(refresh_token: string): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshRes = await fetchWithTimeout(
        `${BASE_URL}/auth/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token }),
        },
      );

      const refreshData = await parseBody(refreshRes);
      if (!refreshRes.ok) {
        throw new Error(refreshData.message || "Refresh token gagal");
      }

      const newToken =
        refreshData?.data?.access_token ?? refreshData?.access_token;

      if (!newToken || typeof newToken !== "string") {
        throw new Error("Refresh token tidak mengembalikan access token");
      }

      const newRefreshToken =
        refreshData?.data?.refresh_token ?? refreshData?.refresh_token;

      if (typeof newRefreshToken === "string" && newRefreshToken) {
        setTokens(newToken, newRefreshToken);
      } else {
        setAccessToken(newToken);
      }

      return newToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  config: { publicRead?: boolean } = {},
) {
  const method = (options.method ?? "GET").toUpperCase();
  const path = pathOf(endpoint);

  const isNoAuth =
    config.publicRead === true ||
    isPublicRead(method, path) ||
    isAuthEndpoint(path);

  let access_token = getAccessToken();

  // Setelah reload, access token di memori hilang; gunakan refresh token sesi.
  if (!isNoAuth && !access_token) {
    const refresh_token = getRefreshToken();

    if (refresh_token) {
      try {
        access_token = await refreshAccessToken(refresh_token);
      } catch {
        forceLogout();
        throw new Error("Sesi habis");
      }
    }
  }

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const doFetch = (token: string | null) =>
    fetchWithTimeout(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(options.body && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...(!isNoAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let res = await doFetch(access_token);

  // HANDLE TOKEN EXPIRED
  if (res.status === 401 && !isNoAuth) {
    const refresh_token = getRefreshToken();

    if (!refresh_token) {
      forceLogout();
      throw new Error("Sesi habis");
    }

    try {
      const newToken = await refreshAccessToken(refresh_token);
      res = await doFetch(newToken);

      if (res.status === 401) {
        forceLogout();
        throw new Error("Sesi habis");
      }
    } catch {
      forceLogout();
      throw new Error("Sesi habis");
    }
  }

  const data = await parseBody(res);

  if (!res.ok) {
    throw new Error(
      `${res.status} ${endpoint}: ${data.message || data.error || "API Error"}`,
    );
  }

  return data;
}
