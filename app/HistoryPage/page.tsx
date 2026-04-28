"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Clock, ExternalLink, Receipt, Coins } from "lucide-react";
import { apiFetch } from "@/lib/api";

// Tipe data berdasarkan response JSON dari Backend
type DonationHistory = {
  id: string;
  transaction_hash: string;
  amount: number;
  status: string;
  date: string;
  campaign_name: string;
};

export default function RiwayatDonasiPage() {
  const router = useRouter();
  const [history, setHistory] = useState<DonationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Panggil endpoint backend
        // Catatan: Jika BASE_URL di api.ts Anda sudah berakhiran /api, gunakan "/donations/history"
        const res = await apiFetch("/donations/history", {
          method: "GET",
        });
        
        // Simpan array data ke state
        if (res && res.data) {
          setHistory(res.data);
        }
      } catch (error) {
        console.error("Gagal mengambil riwayat donasi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Fungsi untuk mengubah format tanggal ISO menjadi rapi (Contoh: 28 Apr 2026, 11:57)
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta" // Menyesuaikan dengan zona waktu
    });
  };

  // Fungsi untuk membuat lencana status (Badge)
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "verified":
        return (
          <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg border border-green-100 shadow-sm shrink-0">
            <CheckCircle2 size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">Sukses</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg border border-red-100 shadow-sm shrink-0">
            <XCircle size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">Gagal</span>
          </div>
        );
      case "pending":
      default:
        return (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-100 shadow-sm shrink-0">
            <Clock size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">Pending</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full max-w-md mx-auto flex flex-col bg-gray-50 pb-10">
      
      {/* HEADER */}
      <div className="bg-purple-600 px-6 pt-8 pb-6 flex items-center gap-4 sticky top-0 z-40 text-white shadow-md rounded-b-3xl">
        <button onClick={() => router.back()} className="hover:bg-white/20 p-2 rounded-full transition cursor-pointer">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-black tracking-tight">Riwayat Donasi</h1>
          <p className="text-[10px] text-purple-200 uppercase font-bold tracking-widest opacity-80">
            Daftar Kontribusi Anda
          </p>
        </div>
      </div>

      {/* KONTEN */}
      <div className="px-6 pt-6 flex flex-col gap-4">
        {loading ? (
          // Loading Skeleton
          [1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100 shadow-sm" />
          ))
        ) : history.length === 0 ? (
          // Jika kosong
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4">
              <Receipt size={32} className="text-purple-300" />
            </div>
            <h3 className="text-gray-800 font-bold text-lg">Belum Ada Riwayat</h3>
            <p className="text-gray-500 text-sm mt-2 px-6 leading-relaxed">
              Anda belum melakukan donasi apa pun. Mari mulai tebarkan kebaikan hari ini!
            </p>
          </div>
        ) : (
          // List Riwayat
          history.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden">
              
              {/* Efek Garis Samping untuk visual tambahan */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                item.status.toLowerCase() === 'success' || item.status.toLowerCase() === 'verified' ? 'bg-green-500' :
                item.status.toLowerCase() === 'failed' ? 'bg-red-500' : 'bg-amber-500'
              }`} />

              <div className="flex items-start justify-between gap-2 pl-2">
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{item.campaign_name}</h3>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5">{formatDate(item.date)}</p>
                </div>
                {renderStatusBadge(item.status)}
              </div>

              <div className="flex items-center justify-between pl-2 pt-2 border-t border-gray-50 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="bg-purple-50 p-1.5 rounded-lg text-purple-600">
                    <Coins size={14} />
                  </div>
                  <span className="text-sm font-black text-purple-700">{item.amount} FCC</span>
                </div>
                
                {/* Link ke Block Explorer (Misal: Polygonscan) */}
                {item.transaction_hash && (
                  <a 
                    href={`https://polygonscan.com/tx/${item.transaction_hash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-purple-600 transition-colors bg-gray-50 px-2 py-1.5 rounded-lg active:scale-95"
                  >
                    Lihat Tx <ExternalLink size={12} />
                  </a>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}