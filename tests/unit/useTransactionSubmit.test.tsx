/**
 * tests/unit/useTransactionSubmit.test.tsx
 *
 * Fungsi   : Menguji guard double-submit, validasi field, status pencatatan gateway,
 *            fallback QRIS lokal, timeout, dan idempotency key per payload.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Vitest saat `npm test` / `npx vitest`
 * Catatan  : fetch dan QRIS dimock agar test tidak membutuhkan backend/gateway.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useTransactionSubmit } from "@/hooks/useTransactionSubmit";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/qrisConfig", () => ({
  QRIS_YAYASAN_STATIS: "000201010211TEST",
}));

vi.mock("@/lib/qrisDinamis", () => ({
  generateDynamicQris: vi.fn(() => "QRIS-DYNAMIC"),
}));

const baseArgs = {
  transactionType: "donasi" as const,
  campaignId: 7,
  campaignName: "Bantu Pendidikan",
  senderName: "Budi",
  email: "budi@mail.com",
  phone: "08123456789",
  amount: 50000 as number | "",
  onShowQris: vi.fn(),
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("useTransactionSubmit", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    baseArgs.onShowQris.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("menolak submit dengan email/telepon/nominal tidak valid tanpa memanggil fetch", () => {
    const { result } = renderHook(() => useTransactionSubmit());

    act(() => {
      result.current.submit({
        ...baseArgs,
        email: "bukan-email",
        phone: "0",
        amount: 500,
      });
    });

    expect(result.current.fieldErrors.email).toBe("Format email tidak valid");
    expect(result.current.fieldErrors.phone).toMatch(/9–15 digit/);
    expect(result.current.fieldErrors.amount).toMatch(/Minimal donasi/);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(baseArgs.onShowQris).not.toHaveBeenCalled();
  });

  it("menjalankan validateExtra dan menampilkan error field khusus flow", () => {
    const { result } = renderHook(() => useTransactionSubmit());

    act(() => {
      result.current.submit({
        ...baseArgs,
        validateExtra: () => ({ field: "name", message: "Nama wajib diisi" }),
      });
    });

    expect(result.current.fieldErrors.name).toBe("Nama wajib diisi");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("menampilkan QRIS lokal dan menandai transaksi recorded saat gateway sukses", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ data: { id: 123 } })),
    );
    const { result } = renderHook(() => useTransactionSubmit());

    act(() => {
      result.current.submit(baseArgs);
    });

    expect(baseArgs.onShowQris).toHaveBeenCalledWith("QRIS-DYNAMIC");
    expect(result.current.qrisString).toBe("QRIS-DYNAMIC");

    await waitFor(() => {
      expect(result.current.recordStatus).toBe("recorded");
    });
    expect(result.current.transactionId).toBe(123);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("tetap menampilkan QRIS dan menandai failed saat gateway 500", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ message: "Gateway down" }, 500)),
    );
    const { result } = renderHook(() => useTransactionSubmit());

    act(() => {
      result.current.submit(baseArgs);
    });

    await waitFor(() => {
      expect(result.current.recordStatus).toBe("failed");
    });
    expect(result.current.recordError).toMatch(/Gateway down/);
    expect(result.current.qrisString).toBe("QRIS-DYNAMIC");
  });

  it("menandai failed saat pencatatan melewati batas waktu (timeout)", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );
    const { result } = renderHook(() => useTransactionSubmit());

    act(() => {
      result.current.submit(baseArgs);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20_000);
    });

    expect(result.current.recordStatus).toBe("failed");
    expect(result.current.recordError).toMatch(/melebihi batas waktu/);
  });

  it("memakai idempotency key yang sama untuk payload sama dan berbeda untuk nominal berubah", async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ data: { id: 1 } })),
    );
    const { result } = renderHook(() => useTransactionSubmit());

    act(() => {
      result.current.submit(baseArgs);
    });
    await waitFor(() => expect(result.current.recordStatus).toBe("recorded"));
    await waitFor(() => expect(result.current.isProcessing).toBe(false));

    act(() => {
      result.current.submit(baseArgs);
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const firstKey = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<
      string,
      string
    >;
    const secondKey = (fetchMock.mock.calls[1][1] as RequestInit).headers as Record<
      string,
      string
    >;
    expect(firstKey["X-Idempotency-Key"]).toBe(
      secondKey["X-Idempotency-Key"],
    );

    await waitFor(() => expect(result.current.isProcessing).toBe(false));
    act(() => {
      result.current.submit({ ...baseArgs, amount: 75000 });
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    const thirdKey = (fetchMock.mock.calls[2][1] as RequestInit).headers as Record<
      string,
      string
    >;
    expect(thirdKey["X-Idempotency-Key"]).not.toBe(
      firstKey["X-Idempotency-Key"],
    );
  });
});
