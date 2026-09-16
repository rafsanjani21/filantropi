"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, RefreshCcw, ArrowLeft, AlertCircle } from "lucide-react";

function FailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trx_id = searchParams.get("trx_id");

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-50 mt-4 sm:mt-10 mb-10">
      
      {/* Header Berwarna */}
      <div className="bg-gradient-to-b from-rose-500 to-rose-600 px-6 pt-10 pb-16 text-center relative">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-rose-500 animate-in zoom-in duration-500">
            <XCircle size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide mt-2">Qadarullah</h1>
          <p className="text-rose-100 text-sm mt-1 font-medium">Pembayaran Gagal / Kadaluarsa</p>
        </div>
      </div>

      {/* Rincian Pesan */}
      <div className="px-6 py-8 relative -mt-8 bg-white rounded-t-3xl">
        
        <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 mb-6 flex items-start gap-3">
          <AlertCircle size={24} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-rose-800 mb-1">Transaksi Tidak Dapat Diproses</h3>
            <p className="text-xs text-rose-600 leading-relaxed">
              Sistem mendeteksi pembayaran Anda telah melewati batas waktu (expired) atau terjadi kendala pada bank/metode pembayaran.
            </p>
          </div>
        </div>

        {trx_id && (
          <div className="flex justify-between items-center py-4 border-t border-b border-gray-100 mb-6">
            <span className="text-gray-500 text-sm">ID Transaksi</span>
            <span className="font-bold text-gray-800 text-sm">{trx_id}</span>
          </div>
        )}

        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 leading-relaxed">
            Niat baik Anda insyaAllah sudah tercatat. Silakan coba kembali untuk menyelesaikan wakaf ini.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="space-y-3">
          <button 
            onClick={() => router.push("/")} 
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
          >
            <RefreshCcw size={18} /> Coba Donasi Kembali
          </button>
          <button 
            onClick={() => router.push("/")}
            className="w-full py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#F4FBF7] py-6 px-4">
      <Suspense fallback={<div className="text-center mt-20 animate-pulse text-rose-600 font-bold">Memuat status...</div>}>
        <FailedContent />
      </Suspense>
    </div>
  );
}