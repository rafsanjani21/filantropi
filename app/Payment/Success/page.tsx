"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Heart, Receipt, Home, XCircle } from "lucide-react";

type Transaction = {
  transaction_code: string;
  campaign_name: string;
  sender_name: string;
  amount: number;
  status: string;
  transfer_notes: string;
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trx_id = searchParams.get("trx_id");

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!trx_id) {
      setError("ID Transaksi tidak ditemukan.");
      setLoading(false);
      return;
    }

    const fetchTransaction = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
        // Sesuaikan endpoint ini dengan backend Golang/Node Anda
        const res = await fetch(`${API_BASE}/transactions/${trx_id}`);
        
        if (!res.ok) throw new Error("Gagal mengambil data transaksi");
        
        const data = await res.json();
        // Asumsi backend mengembalikan data di dalam object "data" atau langsung object JSON
        setTransaction(data.data || data);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan sistem");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [trx_id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 animate-pulse border border-gray-100 mt-10">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
        </div>
        <div className="h-24 bg-gray-100 rounded-xl w-full mt-6"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100 mt-10">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button onClick={() => router.push("/")} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-50 mt-4 sm:mt-10 mb-10">
      {/* Header Berwarna */}
      <div className="bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 pt-10 pb-16 text-center relative">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-emerald-500 animate-in zoom-in duration-500">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>
          <p className="text-emerald-50 font-arabic text-2xl mb-2" style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </p>
          <h1 className="text-2xl font-black text-white tracking-wide">Alhamdulillah</h1>
          <p className="text-emerald-100 text-sm mt-1 font-medium">Pembayaran Anda Telah Berhasil</p>
        </div>
      </div>

      {/* Rincian Transaksi */}
      <div className="px-6 py-8 relative -mt-8 bg-white rounded-t-3xl">
        <div className="flex flex-col items-center mb-6">
          <span className="text-sm text-gray-500 font-medium mb-1">Total Donasi</span>
          <span className="text-3xl font-black text-gray-800">{formatCurrency(transaction.amount)}</span>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 flex items-center gap-2"><Receipt size={16} /> ID Transaksi</span>
            <span className="font-bold text-gray-800">{transaction.transaction_code}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 flex items-center gap-2"><Heart size={16} /> Program</span>
            <span className="font-bold text-emerald-600 text-right max-w-[150px] truncate">{transaction.campaign_name}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500">Atas Nama</span>
            <span className="font-bold text-gray-800 text-right max-w-[150px] truncate">{transaction.sender_name}</span>
          </div>
        </div>

        {/* Kotak Doa (Ditampilkan jika ada) */}
        {transaction.transfer_notes && transaction.transfer_notes !== "Tanpa pesan" && (
          <div className="mt-6 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Pesan & Doa</p>
            <p className="text-gray-600 text-sm italic leading-relaxed">
              "{transaction.transfer_notes}"
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Semoga Allah SWT membalas kebaikan Anda dengan pahala yang berlipat ganda, dan menjadikannya sebagai amal jariyah. Amin.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-8 space-y-3">
          <button 
            onClick={() => router.push("/")}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
          >
            <Home size={18} /> Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F4FBF7] py-6 px-4">
      <Suspense fallback={<div className="text-center mt-20 animate-pulse text-emerald-600 font-bold">Memuat rincian transaksi...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}