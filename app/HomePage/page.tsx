"use client";

import "@/lib/i18n"; 
import { HandCoins, Heart, Lock, AlertCircle, Wallet, RefreshCw } from "lucide-react"; 
import Navbar from "../components/ui/homepage/navbar";
import Carousel from "../components/ui/homepage/carousel";
import UrgentDonation from "../components/ui/homepage/urgentdonation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api"; // 🔥 Menggunakan apiFetch, bukan ethers
import { useTranslation } from "react-i18next"; 

export default function HomePage() {
  const router = useRouter(); 
  const [search, setSearch] = useState("");
  const { getProfile } = useAuth();
  const { t } = useTranslation(); 
  
  const [role, setRole] = useState<"donor" | "beneficiary" | "guest" | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [balance, setBalance] = useState<string>("0.00"); // Default 0.00
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "warning" | "error" | "success" } | null>(null);

  const showToast = (message: string, type: "warning" | "error" | "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      
      if (!token) {
        router.replace("/LoginPage");
        return; 
      }

      try {
        const data = await getProfile();
        setRole("donor");
        setUserProfile(data);
        setIsCheckingAuth(false); 
      } catch (err) {
        try {
          const data = await getProfile("beneficiary");
          setRole("beneficiary");
          setUserProfile(data);
          setIsCheckingAuth(false);
        } catch (err) {
          localStorage.removeItem("access_token");
          router.replace("/LoginPage");
        }
      }
    };

    checkUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 FUNGSI FETCH BALANCE YANG SUDAH DIPERBARUI MENGGUNAKAN API BACKEND
  const fetchBalance = async () => {
    if (!userProfile?.wallet_address) return;
    
    const cleanWallet = userProfile.wallet_address.trim();

    setLoadingBalance(true);
    try {
      // Hit API backend Anda langsung
      const res = await apiFetch(`/donations/wallet/balance/${cleanWallet}`, { method: "GET" });
      
      if (res && res.data !== undefined) {
        // Antisipasi jika backend mengirim object { balance: "..." } atau langsung string
        const balanceData = typeof res.data === 'object' ? res.data.balance : res.data;
        
        // Format agar selalu menampilkan 2 angka desimal
        setBalance(balanceData || "0");
      } else {
        setBalance("0.00");
      }
    } catch (err) {
      console.error("Gagal memuat saldo dari API:", err);
      showToast(t("fail_fetch_balance"), "error");
      setBalance("0.00");
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (!isCheckingAuth && userProfile?.wallet_address) {
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.wallet_address, isCheckingAuth]);

  const isDonasiLocked = role === "beneficiary"; 
  const isGalangLocked = role === "donor" || role === "guest";

  const handleDonasiClick = (e: React.MouseEvent) => {
    if (isDonasiLocked) {
      e.preventDefault();
      showToast(t("lock_donate_beneficiary"), "warning");
    }
  };

  const handleGalangClick = (e: React.MouseEvent) => {
    if (isGalangLocked) {
      e.preventDefault();
      showToast(t("lock_galang_user"), "warning");
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-b from-[#7C3996] to-[#b359d4]">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full max-w-lg justify-center mx-auto bg-gray-50 shadow-2xl relative overflow-x-hidden">
    <div className="flex flex-col w-full min-h-screen relative bg-white"> 
      
      {toast && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 duration-300 border w-[90%] max-w-sm ${
          toast.type === "warning" 
            ? "bg-orange-600/95 border-orange-400 text-white" 
            : toast.type === "success" 
            ? "bg-green-600/95 border-green-400 text-white" 
            : "bg-red-600/95 border-red-400 text-white"
        }`}>
          <AlertCircle size={24} className="shrink-0" />
          <span className="font-semibold text-sm leading-snug">{toast.message}</span>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-[28rem] bg-linear-to-b from-[#7C3996] to-[#b359d4] rounded-b-[3rem] z-0 shadow-lg" />

      <div className="relative z-10 flex flex-col flex-1 w-full pt-4">
        <Navbar />

        <div className="px-6 mt-6 mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1 drop-shadow-sm">
            {t("hello")}, {userProfile?.name || userProfile?.full_name || t("good_person")}!
          </h1>
          <p className="text-purple-100 text-sm mb-6 font-medium">
            {t("let_do_good")}
          </p>

          {userProfile?.wallet_address && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 flex items-center justify-between mb-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-purple-100 uppercase tracking-widest opacity-80">{t("your_fcc_balance")}</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    {loadingBalance ? (
                      <div className="h-6 w-20 bg-white/20 animate-pulse rounded-md"></div>
                    ) : (
                      <>
                        <span className="text-sm md:text-2xl font-black text-white tracking-tighter">{balance}</span>
                        <span className="text-xs font-bold text-purple-200">FCC</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={fetchBalance}
                disabled={loadingBalance}
                className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 active:scale-90 transition-all text-white disabled:opacity-50"
              >
                <RefreshCw size={18} className={loadingBalance ? "animate-spin" : ""} />
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <Carousel />
        </div>

        <div className="bg-white rounded-t-[2.5rem] flex-1 w-full pt-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex flex-col gap-8 pb-12">
          
          <div className="px-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {t("philanthropy_program")}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              
              <Link
                href={isDonasiLocked ? "#" : "/DonasiPage"}
                onClick={handleDonasiClick}
                className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl border transition-all duration-300 ${
                  isDonasiLocked 
                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-75" 
                    : "bg-purple-50 border-purple-100 hover:bg-purple-600 hover:shadow-xl hover:shadow-purple-200 active:scale-95 cursor-pointer" 
                }`}
              >
                {isDonasiLocked && <Lock className="absolute top-3 right-3 w-4 h-4 text-gray-400" />}
                
                <div className={`p-3.5 rounded-2xl shadow-sm mb-3 transition-transform duration-300 ${isDonasiLocked ? "bg-gray-200" : "bg-white group-hover:scale-110"}`}>
                  <Heart className={`w-7 h-7 ${isDonasiLocked ? "text-gray-400" : "text-purple-600"}`} />
                </div>
                <span className={`font-bold text-sm transition-colors ${isDonasiLocked ? "text-gray-400" : "text-gray-700 group-hover:text-white"}`}>
                  {t("donate")}
                </span>
              </Link>

              <Link
                href={isGalangLocked ? "#" : "/GalangPage"}
                onClick={handleGalangClick}
                className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl border transition-all duration-300 ${
                  isGalangLocked 
                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-75" 
                    : "bg-blue-50 border-blue-100 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 active:scale-95 cursor-pointer" 
                }`}
              >
                {isGalangLocked && <Lock className="absolute top-3 right-3 w-4 h-4 text-gray-400" />}

                <div className={`p-3.5 rounded-2xl shadow-sm mb-3 transition-transform duration-300 ${isGalangLocked ? "bg-gray-200" : "bg-white group-hover:scale-110"}`}>
                  <HandCoins className={`w-7 h-7 ${isGalangLocked ? "text-gray-400" : "text-blue-600"}`} />
                </div>
                <span className={`font-bold text-sm transition-colors ${isGalangLocked ? "text-gray-400" : "text-gray-700 group-hover:text-white"}`}>
                  {t("raise_funds")}
                </span>
              </Link>

            </div>
          </div>

          <UrgentDonation />

        </div>
      </div>
    </div>
    </main>
  );
}