"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, Receipt, Search, AlertCircle
} from "lucide-react";

type Transaction = {
  id: string;
  wallet_address: string;
  type: "donasi" | "pencairan" | "terima_donasi";
  title: string;
  amount: string;
  date: string;
  status: "berhasil" | "proses" | "gagal";
};

export default function HistoryPage() {
  const router = useRouter();
  const { getProfile } = useAuth(); // Gunakan fungsi cek profile
  
  const [activeTab, setActiveTab] = useState<"semua" | "berhasil" | "proses">("semua");
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (!token) {
        router.replace("/LoginPage");
        return;
      }

      try {
        // 1. Coba tebak apakah dia Pengguna Umum (Donor)
        await getProfile();
        
        // --- JIKA BERHASIL (Berarti dia Donor) ---
        // Nanti ganti dengan: await fetch("/api/donor/history")
        setTimeout(() => {
          setTransactions([
            {
              id: "0x8f2a9b1c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a",
              wallet_address: "0x9F2a1B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a",
              type: "donasi",
              title: "Donasi Untuk Sumatera",
              amount: "50",
              date: "24 Apr 2026, 09:30",
              status: "berhasil",
            },
            {
              id: "0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0",
              wallet_address: "0xZ9y8X7w6V5u4T3s2R1q0P9o8N7m6L5k4J3i2H1g0",
              type: "donasi",
              title: "Beasiswa Anak Asuh Berprestasi",
              amount: "100",
              date: "20 Apr 2026, 10:00",
              status: "berhasil",
            },
          ]);
          setLoading(false);
        }, 1000);

      } catch (err) {
        try {
          // 2. Jika gagal, coba tebak apakah dia Penerima Manfaat
          await getProfile("beneficiary");
          
          // --- JIKA BERHASIL (Berarti dia Penerima Manfaat) ---
          // Nanti ganti dengan: await fetch("/api/beneficiary/history")
          setTimeout(() => {
            setTransactions([
              {
                id: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
                wallet_address: "0xA1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0",
                type: "pencairan",
                title: "Pencairan Tahap 1 - Pembangunan Masjid",
                amount: "300",
                date: "22 Apr 2026, 14:15",
                status: "proses",
              },
              {
                id: "0xf1e2d3c4b5a697867564534231201f2e3d4c5b6a",
                wallet_address: "0xM1n2O3p4Q5r6S7t8U9v0W1x2Y3z4A5b6C7d8E9f0",
                type: "terima_donasi",
                title: "Terima Dana - Bantuan Medis",
                amount: "25",
                date: "19 Apr 2026, 16:45",
                status: "berhasil",
              },
            ]);
            setLoading(false);
          }, 1000);

        } catch (err) {
          // Jika keduanya gagal, token mungkin sudah expired
          localStorage.clear();
          sessionStorage.clear();
          router.replace("/LoginPage");
        }
      }
    };

    fetchHistory();
  }, [router]);

  // Fitur penyingkat teks wallet (0x1234...5678)
  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Logika Filter
  const filteredTransactions = transactions.filter((trx) => {
    const matchesSearch = 
      trx.title.toLowerCase().includes(search.toLowerCase()) || 
      trx.wallet_address.toLowerCase().includes(search.toLowerCase());
    
    const matchesTab = 
      activeTab === "semua" ? true : 
      activeTab === "berhasil" ? trx.status === "berhasil" : 
      trx.status === "proses";

    return matchesSearch && matchesTab;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "donasi": return <ArrowUpRight className="text-red-500 w-5 h-5" />;
      case "pencairan":
      case "terima_donasi": return <ArrowDownLeft className="text-green-500 w-5 h-5" />;
      default: return <Receipt className="text-gray-500 w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "berhasil":
        return (
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md border border-green-100">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Berhasil</span>
          </div>
        );
      case "proses":
        return (
          <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
            <Clock className="w-3 h-3 text-orange-600" />
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Diproses</span>
          </div>
        );
      case "gagal":
        return (
          <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-100">
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Gagal</span>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 relative pb-10">
      
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <nav className="px-6 pt-8 pb-4 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()} 
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all active:scale-95 text-gray-700 cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-800 tracking-wide">
            Riwayat Transaksi
          </h1>
          <div className="w-10 h-10"></div> 
        </nav>

        {/* SEARCH BAR */}
        <div className="px-6 pb-4">
          <div className="flex bg-gray-100 items-center px-4 py-3 rounded-2xl focus-within:bg-purple-50 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari dompet atau nama program..."
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
            />
          </div>
        </div>

        {/* TABS */}
        <div className="flex px-6 gap-6 border-t border-gray-100 pt-2">
          {(["semua", "berhasil", "proses"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold capitalize transition-all relative ${
                activeTab === tab ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* LIST TRANSAKSI */}
      <main className="flex-1 px-6 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-purple-600 animate-pulse">Memuat riwayat...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredTransactions.map((trx) => (
              <div 
                key={trx.id} 
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {trx.type === "donasi" ? "Kepada" : "Dari"}
                    </span>
                    <span className="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                      {formatWalletAddress(trx.wallet_address)}
                    </span>
                  </div>
                  {getStatusBadge(trx.status)}
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    trx.type === "donasi" ? "bg-red-50" : "bg-green-50"
                  }`}>
                    {getIcon(trx.type)}
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{trx.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">{trx.date}</p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-base font-black ${
                      trx.type === "donasi" ? "text-gray-800" : "text-green-600"
                    }`}>
                      {trx.type === "donasi" ? "-" : "+"}{trx.amount} <span className="text-xs">FCC</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Receipt size={32} className="text-gray-400" />
            </div>
            <h3 className="text-gray-800 font-bold text-lg mb-1">Belum Ada Transaksi</h3>
            <p className="text-gray-500 text-sm px-4">Riwayat donasi atau pencairan dana Anda akan muncul di sini.</p>
          </div>
        )}
      </main>
    </div>
  );
}