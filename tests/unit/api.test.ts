/**
 * tests/unit/api.test.ts
 *
 * Fungsi   : Menguji apiFetch: pemilihan token, endpoint publik tanpa Authorization,
 *            refresh token single-flight, pesan error, dan timeout.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Vitest saat `npm test` / `npx vitest`
 * Catatan  : fetch dimock; tidak ada request jaringan nyata.
 */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/authTokens";

let apiFetch: (typeof import("@/lib/api"))["apiFetch"];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function headersOf(call: unknown[]) {
  return (call[1] as RequestInit).headers as Record<string, string>;
}

describe("apiFetch", () => {
  const fetchMock = vi.fn();

  beforeAll(async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    ({ apiFetch } = await import("@/lib/api"));
  });

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    localStorage.clear();
    sessionStorage.clear();
    clearTokens();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("GET campaign publik tidak mengirim Authorization meski token tersedia", async () => {
    setTokens("token-lama");
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));

    await apiFetch("/campaigns/aktif");

    const headers = headersOf(fetchMock.mock.calls[0]);
    expect(headers.Authorization).toBeUndefined();
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.test/campaigns/aktif");
  });

  it("GET /campaigns/me tetap mengirim Authorization", async () => {
    setTokens("token-lama");
    fetchMock.mockResolvedValue(jsonResponse({ data: {} }));

    await apiFetch("/campaigns/me");

    expect(headersOf(fetchMock.mock.calls[0]).Authorization).toBe(
      "Bearer token-lama",
    );
  });

  it("endpoint publik yang diizinkan tidak mengirim Authorization", async () => {
    setTokens("token-lama");
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ data: {} })),
    );

    await apiFetch("/campaigns/transactions/latest/campaign-1");
    await apiFetch("/campaigns/stepper/campaign-1?t=1");
    await apiFetch("/campaigns/disbursements/campaign-1");
    await apiFetch("/campaigns/report/campaign-1");
    await apiFetch("/donations/in/wallet-1");
    await apiFetch("/user/profile/campaign-creator/user-1");

    for (const call of fetchMock.mock.calls) {
      expect(headersOf(call).Authorization).toBeUndefined();
    }
  });

  it("GET /donations/history dan endpoint campaign privat tetap memakai Authorization", async () => {
    setTokens("token-lama");
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ data: {} })),
    );

    await apiFetch("/donations/history");
    await apiFetch("/campaigns/%6De");
    await apiFetch("/campaigns/me?tab=active");

    for (const call of fetchMock.mock.calls) {
      expect(headersOf(call).Authorization).toBe("Bearer token-lama");
    }
  });

  it("tidak membuka endpoint privat lewat encoded path traversal", async () => {
    setTokens("token-lama");
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ data: {} })),
    );

    await apiFetch("/campaigns/me%2F..%2Fme");
    await apiFetch("/donations/in/..%2Fhistory");
    await apiFetch("/user/profile/campaign-creator/..%2F..%2Fdonors");
    await apiFetch("/campaigns/%252e%252e");

    for (const call of fetchMock.mock.calls) {
      expect(headersOf(call).Authorization).toBe("Bearer token-lama");
    }
  });

  it("POST transaksi mengirim Authorization + Content-Type JSON", async () => {
    setTokens("token-session");
    fetchMock.mockResolvedValue(jsonResponse({ data: { id: 1 } }));

    const body = JSON.stringify({ amount: 10000 });
    await apiFetch("/campaigns/create/v2/transaction-donasi", {
      method: "POST",
      body,
    });

    const headers = headersOf(fetchMock.mock.calls[0]);
    expect(headers.Authorization).toBe("Bearer token-session");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("melempar pesan error berisi status dan message API", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Nominal salah" }, 422));

    await expect(apiFetch("/campaigns/me")).rejects.toThrow(
      /422 \/campaigns\/me: Nominal salah/,
    );
  });

  it("memulihkan access token dari refresh token setelah reload", async () => {
    sessionStorage.setItem("refresh_token", "refresh-abc");
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith("/auth/refresh-token")) {
        return Promise.resolve(
          jsonResponse({ data: { access_token: "token-baru" } }),
        );
      }
      return Promise.resolve(jsonResponse({ data: { ok: true } }));
    });

    await apiFetch("/campaigns/me");

    expect(fetchMock.mock.calls[1][0]).toBe("https://api.test/campaigns/me");
    expect(headersOf(fetchMock.mock.calls[1]).Authorization).toBe(
      "Bearer token-baru",
    );
  });

  it("refresh token single-flight saat dua request 401 bersamaan", async () => {
    setTokens("token-expired", "refresh-abc");
    let refreshCalls = 0;

    fetchMock.mockImplementation((url: string, init: RequestInit) => {
      if (url.endsWith("/auth/refresh-token")) {
        refreshCalls += 1;
        return Promise.resolve(
          jsonResponse({ data: { access_token: "token-baru" } }),
        );
      }

      const auth = (init.headers as Record<string, string>).Authorization;
      if (auth !== "Bearer token-baru") {
        return Promise.resolve(jsonResponse({ message: "expired" }, 401));
      }
      return Promise.resolve(jsonResponse({ data: { ok: true } }));
    });

    const [a, b] = await Promise.all([
      apiFetch("/campaigns/me"),
      apiFetch("/campaigns/me"),
    ]);

    expect(a).toEqual({ data: { ok: true } });
    expect(b).toEqual({ data: { ok: true } });
    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBe("token-baru");
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("membersihkan sesi bila refresh setelah reload gagal", async () => {
    window.history.replaceState({}, "", "/login");
    sessionStorage.setItem("refresh_token", "refresh-abc");
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "refresh tidak valid" }, 401),
    );

    await expect(apiFetch("/campaigns/me")).rejects.toThrow("Sesi habis");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("melempar timeout bila request melewati 20 detik", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    const expectation = expect(apiFetch("/campaigns/me")).rejects.toThrow(
      /timeout/,
    );
    await vi.advanceTimersByTimeAsync(20_000);

    await expectation;
  });
});
