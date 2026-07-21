"use client";

import "@/lib/i18n";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "../components/ui/homepage/navbar";
import BottomNav from "../components/ui/root/BottomNav";
import Carousel from "../components/ui/homepage/carousel";
import LiveDonationBlink from "../components/ui/detail/LiveDonationBlink";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

// 🔥 OPTIMASI: Lazy load komponen yang berada di bawah untuk mempercepat render layar pertama
import UrgentDonation from "../components/ui/homepage/urgentdonation";
import LatestPrograms from "../components/ui/homepage/latestprograms";
import { apiFetch } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const { getProfile } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState<"donor" | "beneficiary" | "guest" | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "warning" | "error" | "success";
  } | null>(null);

  const showToast = (message: string, type: "warning" | "error" | "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const checkUserRole = async () => {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (!token) {
        setRole("guest");
        setIsCheckingAuth(false);
        return;
      }

      try {
        const data = await getProfile();
        setRole("donor");
        setUserProfile(data);
      } catch (err) {
        try {
          const data = await getProfile("beneficiary");
          setRole("beneficiary");
          setUserProfile(data);
        } catch (err) {
          localStorage.removeItem("access_token");
          router.replace("/LoginPage");
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 MENGGUNAKAN API BACKEND ASLI UNTUK DONASI GLOBAL
  useEffect(() => {
    const fetchGlobalRecentDonations = async () => {
      try {
        // Memanggil endpoint /api/donations/all
        const res = await apiFetch(`/donations/all`, {
          method: "GET",
        });

        if (res && res.data) {
          // Menyesuaikan penangkapan array (jika dibungkus dalam 'history' atau langsung array)
          const historyArray = Array.isArray(res.data.history) 
            ? res.data.history 
            : (Array.isArray(res.data) ? res.data : []);
          
          // Mapping data sesuai yang dibutuhkan oleh komponen LiveDonationBlink
          const apiHistory = historyArray.map((tx: any) => ({
            from_to: tx.donatur_name || t("anonymous", "Anonim"),
            amount: String(tx.amount_idr || 0),
          }));

          setRecentDonations(apiHistory);
        }
      } catch (err) {
        console.error("Gagal memuat semua donasi di Homepage:", err);
      }
    };
    
    fetchGlobalRecentDonations();
  }, [t]);

  // Render teks sapaan dengan status loading yang rapi
  const renderGreetingName = () => {
    if (isCheckingAuth) {
      return <span className="inline-block w-32 h-6 bg-white/20 rounded-md animate-pulse"></span>;
    }
    return userProfile?.name || userProfile?.full_name || (role === "guest" ? t("Orang Baik") : t("good_person"));
  };

  return (
    <main className="flex min-h-screen w-full max-w-lg justify-center mx-auto bg-[#FBF8F3] shadow-2xl relative overflow-x-hidden">
      <LiveDonationBlink history={recentDonations} />

      <div className="flex flex-col w-full min-h-screen relative bg-[#FBF8F3] pb-28">
        
        {toast && (
          <div
            role="status"
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm rounded-xl bg-white shadow-xl border-l-4 flex items-start gap-3 px-4 py-3.5 animate-in fade-in slide-in-from-top-4 duration-300 ${
              toast.type === "warning"
                ? "border-[#E8B94A]"
                : toast.type === "success"
                  ? "border-emerald-500"
                  : "border-red-500"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-500" />
            ) : (
              <AlertCircle size={20} className={`shrink-0 mt-0.5 ${toast.type === "warning" ? "text-[#C9971F]" : "text-red-500"}`} />
            )}
            <span className="text-sm font-medium leading-snug text-[#2A1B33]">
              {toast.message}
            </span>
          </div>
        )}

        {/* Hero */}
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] rounded-b-[2.25rem] shadow-lg pt-4 pb-14 flex flex-col z-0">
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.09] pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern id="kawung" width="56" height="56" patternUnits="userSpaceOnUse">
                <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
                  <ellipse cx="14" cy="14" rx="12" ry="8" transform="rotate(45 14 14)" />
                  <ellipse cx="42" cy="14" rx="12" ry="8" transform="rotate(-45 42 14)" />
                  <ellipse cx="14" cy="42" rx="12" ry="8" transform="rotate(-45 14 42)" />
                  <ellipse cx="42" cy="42" rx="12" ry="8" transform="rotate(45 42 42)" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#kawung)" />
          </svg>

          <Navbar isLoggedIn={role !== "guest"} />

          <div className="relative px-6 mt-4">
            <h1 className="font-jakarta text-[1.75rem] leading-snug font-extrabold text-white drop-shadow-sm">
              {t("hello")},<br />
              {renderGreetingName()}!
            </h1>
            <p className="text-purple-100/90 text-sm mt-1.5 mb-5 font-medium">
              {t("let_do_good")}
            </p>
          </div>

          <div className="mt-5">
            <Carousel />
          </div>
        </div>

        <div className="relative w-full -mt-8 z-10">
          <div className="flex justify-center pt-3 pb-1">
            <span className="w-10 h-1 rounded-full bg-[#7C3996]/15" />
          </div>
          <div className="bg-[#FBF8F3] rounded-t-[1.75rem] flex-1 w-full  pt-6 flex flex-col gap-8">
            <UrgentDonation />
            <LatestPrograms />
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}