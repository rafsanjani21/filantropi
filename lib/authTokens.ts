/**
 * lib/authTokens.ts
 *
 * Fungsi   : Menyimpan access token dan refresh token di localStorage agar sesi dibagi ke semua
 *            tab dan bertahan saat reload.
 * Ekspor   : getAccessToken, getRefreshToken, hasRefreshToken, setTokens, setAccessToken, clearTokens
 * Dipakai  : lib/api.ts, lib/auth.service.ts, hooks/useAuth.ts, store/useAuthStore.ts
 * Catatan  : Token lama di sessionStorage dimigrasikan otomatis ke localStorage; sessionStorage
 *            hanya dipakai sebagai fallback bila localStorage diblokir.
 */

const REFRESH_TOKEN_KEY = "refresh_token";
const ACCESS_TOKEN_KEY = "access_token";

const LEGACY_LOCAL_KEYS = ["admin_token", "admin_refresh_token"] as const;

const canUseStorage = () => typeof window !== "undefined";

function readSession(key: string): string | null {
  if (!canUseStorage()) return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function readLocal(key: string): string | null {
  if (!canUseStorage()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Token di sessionStorage tetap dipakai jika localStorage diblokir.
  }
}

function removeLocal(key: string) {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Abaikan jika storage diblokir.
  }
}

function removeSession(key: string) {
  if (!canUseStorage()) return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Abaikan jika storage diblokir.
  }
}

function cleanupLegacyTokens() {
  if (!canUseStorage()) return;

  try {
    for (const key of LEGACY_LOCAL_KEYS) {
      localStorage.removeItem(key);
    }

    // Hapus salinan lama di sessionStorage hanya setelah tersedia di localStorage.
    if (readLocal(ACCESS_TOKEN_KEY)) sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    if (readLocal(REFRESH_TOKEN_KEY)) {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    // Storage dapat diblokir browser; token di sessionStorage tetap dipakai.
  }
}

function migrateLegacyTokens() {
  if (!canUseStorage()) return;

  let sessionAccess: string | null = null;
  let sessionRefresh: string | null = null;

  try {
    sessionAccess = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    sessionRefresh = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return;
  }

  if (!readLocal(ACCESS_TOKEN_KEY) && sessionAccess) {
    writeLocal(ACCESS_TOKEN_KEY, sessionAccess);
  }

  if (!readLocal(REFRESH_TOKEN_KEY) && sessionRefresh) {
    writeLocal(REFRESH_TOKEN_KEY, sessionRefresh);
  }

  cleanupLegacyTokens();
}

export function getAccessToken(): string | null {
  migrateLegacyTokens();
  return readLocal(ACCESS_TOKEN_KEY) ?? readSession(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  migrateLegacyTokens();
  return readLocal(REFRESH_TOKEN_KEY) ?? readSession(REFRESH_TOKEN_KEY);
}

export function hasRefreshToken(): boolean {
  return Boolean(getRefreshToken());
}

export function setAccessToken(token: string) {
  writeLocal(ACCESS_TOKEN_KEY, token);
  cleanupLegacyTokens();
}

export function setTokens(access: string, refresh?: string | null) {
  writeLocal(ACCESS_TOKEN_KEY, access);

  if (refresh) {
    writeLocal(REFRESH_TOKEN_KEY, refresh);
  } else {
    removeLocal(REFRESH_TOKEN_KEY);
  }

  cleanupLegacyTokens();
}

export function clearTokens() {
  removeLocal(ACCESS_TOKEN_KEY);
  removeLocal(REFRESH_TOKEN_KEY);
  removeSession(ACCESS_TOKEN_KEY);
  removeSession(REFRESH_TOKEN_KEY);
  cleanupLegacyTokens();
}
