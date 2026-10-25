/**
 * app/(main)/payment/pending/page.tsx
 *
 * Fungsi   : Halaman "Menunggu Pembayaran" setelah QRIS/VA ditampilkan; memantau status transaksi.
 * Ekspor   : default PaymentPendingPage
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock3, Receipt, RefreshCw, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatRp } from "@/lib/format";
import { hasRefreshToken } from "@/lib/authTokens";

const POLL_INTERVAL_MS = 5_000;
const MAX_ATTEMPTS = 24;

const SUCCESS_STATUSES = new Set([
  "success", "paid", "settled", "completed", "berhasil", "sukses", "lunas",
]);

const FAILED_STATUSES = new Set([
  "failed", "failure", "expired", "cancelled", "canceled", "gagal", "kadaluarsa",
]);

type PendingState = "polling" | "pending" | "timeout" | "manual";

function PendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trxId = searchParams.get("trx_id");
  
  // Baca parameter type atau tentukan secara dinamis dari prefix trxId jika ada
  const urlType = searchParams.get("type");
  const isDonasi = urlType === "donasi" || trxId?.startsWith("DNS");
  const type = isDonasi ? "donasi" : "wakaf";
  
  const amountParam = Number(searchParams.get("amount") ?? "");
  const amount = Number.isFinite(amountParam) && amountParam > 0 ? amountParam : null;

  const [state, setState] = useState<PendingState>(trxId ? "polling" : "manual");
  const [detail, setDetail] = useState<string>("");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!trxId) return;

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const checkStatus = async () => {
      if (cancelled) return;
      attempts += 1;

      try {
        const res = await apiFetch(
          `/transactions/${encodeURIComponent(trxId)}`,
          { method: "GET" },
          { publicRead: true },
        );
        if (cancelled) return;

        const data = (res?.data ?? res) as { status?: string };
        const status = String(data?.status ?? "").toLowerCase().trim();

        if (SUCCESS_STATUSES.has(status)) {
          router.replace(`/payment/success?trx_id=${encodeURIComponent(trxId)}`);
          return;
        }

        if (FAILED_STATUSES.has(status)) {
          router.replace(`/payment/failed?trx_id=${encodeURIComponent(trxId)}`);
          return;
        }

        setState("pending");
        setDetail("");
      } catch (err) {
        if (cancelled) return;
        setState((prev) => (prev === "polling" ? "pending" : prev));
        setDetail(err instanceof Error ? "Status belum dapat diperiksa otomatis." : "");
      }

      if (attempts >= MAX_ATTEMPTS) {
        if (!cancelled) setState("timeout");
        return;
      }

      timer = setTimeout(checkStatus, POLL_INTERVAL_MS);
    };

    checkStatus();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [trxId, router]);

  const isManual = !trxId;
  const title = isManual ? "Verifikasi Pembayaran" : "Menunggu Pembayaran";
  const subtitle = isManual
    ? "Transaksi ini belum tercatat otomatis di sistem."
    : state === "timeout"
      ? "Status belum tersedia. Silakan cek riwayat secara berkala."
      : "Kami memeriksa status pembayaran Anda secara otomatis.";

  // Konfigurasi Tema Dinamis
  const ui = isDonasi ? {
    gradient: "from-[#7C3996] to-[#5B2A73]",
    textColor: "text-[#7C3996]",
    bgBtn: "bg-[#7C3996]",
    bgBtnHover: "hover:bg-[#5B2A73]",
    shadowBtn: "shadow-purple-200"
  } : {
    gradient: "from-emerald-500 to-emerald-700",
    textColor: "text-emerald-600",
    bgBtn: "bg-emerald-600",
    bgBtnHover: "hover:bg-emerald-700",
    shadowBtn: "shadow-emerald-200"
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header Berwarna Dinamis */}
        <div className={`bg-gradient-to-b ${ui.gradient} px-6 pt-10 pb-14 text-center text-white relative`}>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              {isManual ? (
                <AlertTriangle size={40} className="text-amber-300" />
              ) : (
                <Clock3 size={40} className="text-white animate-pulse" />
              )}
            </div>
            <h1 className="text-2xl font-black tracking-wide">{title}</h1>
            <p className="text-white/80 text-sm mt-1 font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="px-6 py-8 -mt-8 bg-white rounded-t-3xl relative">
          {amount && (
            <div className="text-center mb-6">
              <span className="text-sm text-slate-500 font-medium mb-1 block">
                Total {type === "wakaf" ? "Wakaf" : "Donasi"}
              </span>
              <span className="text-3xl font-black text-slate-800">
                Rp {formatRp(amount)}
              </span>
            </div>
          )}

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-3 border-b border-slate-100 gap-4">
              <span className="text-slate-500 flex items-center gap-2 shrink-0">
                <Receipt size={16} /> ID Transaksi
              </span>
              <span className="font-bold text-slate-800 truncate">
                {trxId ?? "Belum tercatat"}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-100 gap-4">
              <span className="text-slate-500 flex items-center gap-2 shrink-0">
                <RefreshCw size={16} className={state === "polling" ? "animate-spin" : ""} />
                Status
              </span>
              {/* Teks Status Berwarna Dinamis */}
              <span className={`font-bold ${ui.textColor}`}>
                {state === "polling"
                  ? "Memeriksa..."
                  : state === "pending"
                    ? "Menunggu verifikasi"
                    : state === "timeout"
                      ? "Belum tersedia"
                      : "Verifikasi manual"}
              </span>
            </div>
          </div>

          <div className="mt-6 bg-amber-50/70 p-5 rounded-2xl border border-amber-100 text-[12px] text-amber-800 leading-relaxed">
            {isManual
              ? "Pembayaran Anda tetap sah. Simpan bukti pembayaran dari aplikasi Anda. Pencatatan otomatis gagal, verifikasi dilakukan manual oleh admin."
              : "Jika Anda sudah membayar, status akan diperbarui otomatis. Jangan menutup halaman ini sampai status berubah, atau cek kembali melalui Riwayat Transaksi."}
            {detail && <span className="block mt-2 font-semibold">{detail}</span>}
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => router.push("/")}
              className="w-full py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-bold animate-pulse text-slate-500">
          Memuat status pembayaran...
        </div>
      }
    >
      <PendingContent />
    </Suspense>
  );
}