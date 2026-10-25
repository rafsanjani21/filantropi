/**
 * lib/authTokens.ts
 *
 * Fungsi   : Menyimpan access token hanya di memori dan refresh token di sessionStorage.
 *            Token lama dari localStorage/admin dibersihkan saat pertama dibaca.
 * Ekspor   : getAccessToken, getRefreshToken, hasRefreshToken, setTokens, setAccessToken, clearTokens
 * Dipakai  : lib/api.ts, lib/auth.service.ts, hooks/useAuth.ts, store/useAuthStore.ts
 * Catatan  : Access token sengaja tidak pernah ditulis ke localStorage/sessionStorage.
 */

const REFRESH_TOKEN_KEY = "refresh_token";

const LEGACY_KEYS = [
  "access_token",
  "refresh_token",
  "admin_token",
  "admin_refresh_token",
] as const;

let accessToken: string | null = null;

const canUseStorage = () => typeof window !== "undefined";

function readSessionRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function removeLegacyTokens() {
  if (!canUseStorage()) return;

  try {
    for (const key of LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
    sessionStorage.removeItem("access_token");
  } catch {
    // Storage dapat diblokir browser; token di memori tetap dipakai.
  }
}

function migrateLegacyTokens() {
  if (!canUseStorage()) return;

  let legacyAccess: string | null = null;
  let legacyRefresh: string | null = null;

  try {
    legacyAccess =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
    legacyRefresh = localStorage.getItem("refresh_token");
  } catch {
    return;
  }

  if (!accessToken && legacyAccess) {
    accessToken = legacyAccess;
  }

  if (!readSessionRefreshToken() && legacyRefresh) {
    try {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, legacyRefresh);
    } catch {
      // Abaikan jika storage diblokir.
    }
  }

  removeLegacyTokens();
}

export function getAccessToken(): string | null {
  migrateLegacyTokens();
  return accessToken;
}

export function getRefreshToken(): string | null {
  migrateLegacyTokens();
  return readSessionRefreshToken();
}

export function hasRefreshToken(): boolean {
  return Boolean(getRefreshToken());
}

export function setAccessToken(token: string) {
  accessToken = token;
  removeLegacyTokens();
}

export function setTokens(access: string, refresh?: string | null) {
  accessToken = access;

  if (!canUseStorage()) return;

  try {
    if (refresh) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    } else {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    removeLegacyTokens();
  } catch {
    // Token akses tetap tersedia di memori.
  }
}

export function clearTokens() {
  accessToken = null;

  if (!canUseStorage()) return;

  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Abaikan jika storage diblokir.
  }

  removeLegacyTokens();
}
