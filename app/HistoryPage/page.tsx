"use client";

import "@/lib/i18n"; 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ArrowDownRight, ArrowUpRight, Clock, 
  ExternalLink, Search, Wallet 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "react-i18next"; 

type WalletHistory = {
  tx_hash: string;
  date: string;
  type: "In" | "Out";
  amount: string;
  from_to: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const { getProfile } = useAuth();
  const { t } = useTranslation(); 
  
  const [myWallet, setMyWallet] = useState(""); 
  const [searchInput, setSearchInput] = useState(""); 
  const [activeWallet, setActiveWallet] = useState(""); 
  
  // 🔥 STATE BARU: Menyimpan role pengguna saat ini
  const [userRole, setUserRole] = useState<"donor" | "beneficiary" | null>(null);

  const [transactions, setTransactions] = useState<WalletHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        let profile = null;
        let detectedRole: "donor" | "beneficiary" | null = null;
        
        try {
          // Coba ambil profil sebagai donatur
          profile = await getProfile("donor");
          detectedRole = "donor";
        } catch (err) {
          try {
            // Jika gagal, coba ambil sebagai penerima manfaat
            profile = await getProfile("beneficiary");
            detectedRole = "beneficiary";
          } catch (errFallback) {
            console.warn("Bukan user terdaftar / Guest mode");
          }
        }

        if (detectedRole) {
          setUserRole(detectedRole);
        }

        // Ambil wallet dari response (menyesuaikan struktur data axios/fetch)
        const profileData = profile?.data || profile;
        const wallet = profileData?.wallet_address?.trim();
        
        if (wallet) {
          setMyWallet(wallet);
          setSearchInput(wallet);
          setActiveWallet(wallet); 
        } else {
          setLoading(false); 
        }
      } catch (err) {
        setLoading(false);
      }
    };

    fetchMyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeWallet) return;

    const fetchHistoryFromBackend = async () => {
      try {
        setLoading(true);
        setTransactions([]); 

        // 🔥 LOGIKA BARU: Cek role untuk menentukan endpoint & mapping data
        if (userRole === "beneficiary") {
          // PENERIMA MANFAAT: Cek donasi masuk (IN)
          const res = await apiFetch(`/donations/in/${activeWallet}`, { method: "GET" });
          
          if (res && res.data && Array.isArray(res.data.history)) {
            const mappedData: WalletHistory[] = res.data.history.map((tx: any) => ({
              tx_hash: tx.tx_hash,
              date: tx.created_at,
              type: "In",
              amount: tx.amount.toString(),
              from_to: tx.donatur_address || "Anonim",
            }));
            
            // Urutkan dari yang terbaru
            mappedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(mappedData);
          }
        } else {
          // DONATUR (Atau Guest): Cek donasi keluar (OUT)
          const res = await apiFetch(`/donations/out/${activeWallet}`, { method: "GET" });
          
          if (res && Array.isArray(res.data)) {
            const mappedData: WalletHistory[] = res.data.map((tx: any) => ({
              tx_hash: tx.tx_hash,
              date: tx.created_at,
              type: "Out",
              amount: tx.amount.toString(),
              from_to: tx.campaign_wallet || "Anonim",
            }));
            
            // Urutkan dari yang terbaru
            mappedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(mappedData);
          }
        }

      } catch (err) {
        console.error("Gagal memuat riwayat dari backend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryFromBackend();
  }, [activeWallet, userRole]); 

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    if (!searchInput.trim().startsWith("0x")) {
      alert(t("invalid_wallet_format", "Format wallet tidak valid. Harus diawali dengan 0x.")); 
      return;
    }

    setActiveWallet(searchInput.trim());
  };

  const handleResetToMyWallet = () => {
    if (myWallet) {
      setSearchInput(myWallet);
      setActiveWallet(myWallet);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta"
    });
  };

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-gray-50 flex flex-col relative">
      <div className="bg-purple-600 px-6 pt-8 pb-6 flex items-center gap-4 sticky top-0 z-40 text-white shadow-md">
        <button onClick={() => router.back()} className="hover:bg-white/20 p-2 rounded-full transition cursor-pointer">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-black tracking-tight">{t("wallet_tracker", "Pelacak Wallet")}</h1>
          <p className="text-[10px] text-purple-200 uppercase font-bold tracking-widest opacity-80">
            {t("fcc_history_explorer", "Eksplorasi Riwayat FCC")}
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 mb-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all shadow-sm">
            <Search size={18} className="text-gray-400 shrink-0 mr-3" />
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("search_wallet_placeholder", "Cari alamat 0x...")}
              className="w-full bg-transparent outline-none text-xs font-mono text-gray-700"
            />
          </div>
          
          <div className="flex items-center justify-between mt-1">
            {myWallet && (
              <button 
                type="button" 
                onClick={handleResetToMyWallet}
                className="text-[10px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Wallet size={12} /> {t("track_my_wallet", "Lacak Wallet Saya")}
              </button>
            )}
            <button 
              type="submit"
              disabled={loading || !searchInput}
              className="ml-auto bg-purple-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg hover:bg-purple-700 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {t("search_history", "Cari Riwayat")}
            </button>
          </div>
        </form>

        {activeWallet && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-purple-800 uppercase">{t("reading_data", "Membaca Data")}</p>
              <p className="text-xs font-mono text-purple-600 truncate">{activeWallet}</p>
            </div>
          </div>
        )}

        {!activeWallet && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search size={48} className="mb-4 text-gray-300" />
            <p className="font-bold text-gray-600">{t("history_search", "Pencarian Riwayat")}</p>
            <p className="text-xs mt-1 text-center px-4">{t("history_search_desc", "Masukkan alamat dompet di atas untuk melihat riwayat donasi.")}</p>
          </div>
        )}

        {loading && activeWallet ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold animate-pulse tracking-wide">{t("fetching_data", "Menarik data blockchain...")}</p>
          </div>
        ) : activeWallet && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-center">
            <Clock size={48} className="mb-4 text-gray-200" />
            <p className="font-bold text-gray-600">{t("no_transactions", "Tidak Ada Transaksi")}</p>
            <p className="text-xs mt-1 px-4">{t("no_history_desc", "Belum ada riwayat donasi yang tercatat untuk dompet ini.")}</p>
          </div>
        ) : (
          transactions.map((tx, index) => {
            // Evaluasi berdasarkan maping data API
            const isMasuk = tx.type === "In";
            
            return (
              <div key={`${tx.tx_hash}-${index}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isMasuk ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                  }`}>
                    {isMasuk ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {isMasuk ? t("token_in", "Token Masuk") : t("token_out", "Token Keluar")}
                    </p>
                    {/* 🔥 Penyesuaian UI Label untuk memperjelas dari/ke mana aliran dana */}
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5 w-32 truncate" title={tx.from_to}>
                      {isMasuk ? `Dari: ${tx.from_to}` : `Ke: ${tx.from_to}`}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {formatDate(tx.date)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <p className={`font-black text-sm ${isMasuk ? "text-green-600" : "text-gray-800"}`}>
                    {isMasuk ? "+" : "-"}{parseFloat(tx.amount).toFixed(2)} FCC
                  </p>
                  <a 
                    href={`https://polygonscan.com/tx/${tx.tx_hash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-purple-500 font-bold mt-1 hover:underline"
                  >
                    {t("view_tx", "Lihat TX")} <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}