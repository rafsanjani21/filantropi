/**
 * app/(main)/payment/success/page.tsx
 *
 * Fungsi   : Halaman status pembayaran berhasil; fetch detail transaksi via trx_id.
 * Ekspor   : default PaymentSuccessPage
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Receipt, Home, XCircle } from "lucide-react";
import { BASE_URL } from "@/lib/api";
import type { TransactionDetail } from "@/types";

const PENDING_STATUSES = new Set(["pending", "process", "processing", "menunggu", "unpaid"]);
const FAILED_STATUSES = new Set(["failed", "failure", "expired", "cancelled", "canceled", "gagal", "kadaluarsa"]);

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trx_id = searchParams.get("trx_id");
  const missingTrxId = !trx_id;

  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(!missingTrxId);
  const [error, setError] = useState(
    missingTrxId ? "ID Transaksi tidak ditemukan." : "",
  );

  useEffect(() => {
    if (!trx_id) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);
    let cancelled = false;

    const fetchTransaction = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/transactions/${encodeURIComponent(trx_id)}`,
          { signal: controller.signal },
        );
        
        if (!res.ok) throw new Error("Gagal mengambil data transaksi");
        
        const data = await res.json();
        if (cancelled) return;

        const tx = (data.data || data) as TransactionDetail;
        const status = String(tx.status ?? "").toLowerCase().trim();

        if (status && FAILED_STATUSES.has(status)) {
          router.replace(`/payment/failed?trx_id=${encodeURIComponent(trx_id)}`);
          return;
        }
        if (status && PENDING_STATUSES.has(status)) {
          const query = new URLSearchParams({ trx_id });
          if (tx.amount) query.set("amount", String(tx.amount));
          router.replace(`/payment/pending?${query.toString()}`);
          return;
        }

        setTransaction(tx);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof DOMException && err.name === "AbortError"
            ? "Waktu pemeriksaan status habis"
            : err instanceof Error
              ? err.message
              : "Terjadi kesalahan sistem",
        );
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    };

    fetchTransaction();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trx_id, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 animate-pulse border border-slate-100 mt-10">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-6"></div>
        <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          <div className="h-4 bg-slate-100 rounded w-full"></div>
        </div>
        <div className="h-24 bg-slate-100 rounded-xl w-full mt-6"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100 mt-10">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button onClick={() => router.push("/")} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Menentukan tema berdasarkan kode transaksi
  const isDonasi = transaction.transaction_code?.startsWith("DNS");
  
  const ui = isDonasi ? {
    gradient: "from-[#7C3996] to-[#5B2A73]",
    textIcon: "text-[#7C3996]",
    textBold: "text-[#7C3996]",
    bgBtn: "bg-[#7C3996]",
    bgBtnHover: "hover:bg-[#5B2A73]",
    bgBox: "bg-purple-50/50",
    borderBox: "border-purple-100",
    shadowBtn: "shadow-purple-200",
    label: "Total Donasi"
  } : {
    gradient: "from-emerald-500 to-emerald-600",
    textIcon: "text-emerald-500",
    textBold: "text-emerald-600",
    bgBtn: "bg-emerald-600",
    bgBtnHover: "hover:bg-emerald-700",
    bgBox: "bg-emerald-50/50",
    borderBox: "border-emerald-100",
    shadowBtn: "shadow-emerald-200",
    label: "Total Wakaf"
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-50 mt-4 sm:mt-10 mb-10">
      {/* Header Berwarna */}
      <div className={`bg-gradient-to-b ${ui.gradient} px-6 pt-10 pb-16 text-center relative`}>
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 ${ui.textIcon} animate-in zoom-in duration-500`}>
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>
          <p className="text-white/90 font-arabic text-2xl mb-2" style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}>
            الحمد لله
          </p>
          <p className="text-white/80 text-sm mt-1 font-medium">Transaksi Anda Telah Berhasil</p>
        </div>
      </div>

      {/* Rincian Transaksi */}
      <div className="px-6 py-8 relative -mt-8 bg-white rounded-t-3xl">
        <div className="flex flex-col items-center mb-6">
          <span className="text-sm text-slate-500 font-medium mb-1">{ui.label}</span>
          <span className="text-3xl font-black text-slate-800">{formatCurrency(transaction.amount ?? 0)}</span>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-2"><Receipt size={16} /> ID Transaksi</span>
            <span className="font-bold text-slate-800">{transaction.transaction_code}</span>
          </div>
        </div>

        {/* Kotak Doa */}
        {transaction.transfer_notes && transaction.transfer_notes !== "Tanpa pesan" && (
          <div className={`mt-6 ${ui.bgBox} p-4 rounded-2xl border ${ui.borderBox}`}>
            <p className={`text-xs font-bold ${ui.textBold} uppercase tracking-wider mb-2`}>Pesan & Doa</p>
            <p className="text-slate-600 text-sm italic leading-relaxed">
              &ldquo;{transaction.transfer_notes}&rdquo;
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            Semoga Allah SWT membalas kebaikan Anda dengan pahala yang berlipat ganda, dan menjadikannya sebagai amal jariyah. Amin.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-8 space-y-3">
          <button 
            onClick={() => router.push("/")}
            className={`w-full py-3.5 ${ui.bgBtn} ${ui.bgBtnHover} text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${ui.shadowBtn}`}
          >
            <Home size={18} /> Ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <Suspense fallback={<div className="text-center mt-20 animate-pulse text-slate-500 font-bold">Memuat rincian transaksi...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}