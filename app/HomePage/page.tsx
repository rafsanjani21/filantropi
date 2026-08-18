"use client";

import "@/lib/i18n";
import {
  AlertCircle,
  CheckCircle2,
  Gift,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Navbar from "./components/navbar";
import BottomNav from "../components/ui/root/BottomNav";
import Carousel from "./components/carousel";
import LiveDonationBlink from "../DetailPage/components/LiveDonationBlink";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import UrgentDonation from "./components/urgentdonation";
import LatestPrograms from "./components/latestprograms";
import { apiFetch } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const { getProfile, getInvestorProfile } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState<
    "donor" | "beneficiary" | "investor" | "guest" | null
  >(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "warning" | "error" | "success";
  } | null>(null);

  const showToast = (
    message: string,
    type: "warning" | "error" | "success",
  ) => {
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

      let assignedRole: "donor" | "beneficiary" | "investor" | "guest" =
        "guest";
      let userData = null;

      try {
        userData = await getProfile("donor");
        assignedRole = "donor";
      } catch (err) {}

      if (assignedRole === "guest") {
        try {
          userData = await getProfile("beneficiary");
          assignedRole = "beneficiary";
        } catch (err) {}
      }

      if (assignedRole === "guest" && getInvestorProfile) {
        try {
          const investorData = await getInvestorProfile();
          if (investorData) {
            assignedRole = "investor";
            userData = investorData;
          }
        } catch (err) {}
      }

      if (assignedRole === "guest") {
        setRole("guest");
        setUserProfile(null);
      } else {
        setRole(assignedRole);
        setUserProfile(userData);
      }

      setIsCheckingAuth(false);
      setIsCheckingAuth(false);
    };

    checkUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchGlobalRecentDonations = async () => {
      try {
        const res = await apiFetch(`/donations/all`, {
          method: "GET",
        });

        if (res && res.data) {
          const historyArray = Array.isArray(res.data.history)
            ? res.data.history
            : Array.isArray(res.data)
              ? res.data
              : [];

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

  const renderGreetingName = () => {
    if (isCheckingAuth) {
      return (
        <span className="inline-block w-32 h-6 bg-white/20 rounded-md animate-pulse"></span>
      );
    }
    return (
      userProfile?.name ||
      userProfile?.full_name ||
      (role === "guest" ? t("Orang Baik") : t("good_person"))
    );
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
              <CheckCircle2
                size={20}
                className="shrink-0 mt-0.5 text-emerald-500"
              />
            ) : (
              <AlertCircle
                size={20}
                className={`shrink-0 mt-0.5 ${toast.type === "warning" ? "text-[#C9971F]" : "text-red-500"}`}
              />
            )}
            <span className="text-sm font-medium leading-snug text-[#2A1B33]">
              {toast.message}
            </span>
          </div>
        )}

        {/* Hero Banner */}
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] rounded-b-[2.25rem] shadow-lg pt-4 pb-20 flex flex-col z-0">
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.09] pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="kawung"
                width="56"
                height="56"
                patternUnits="userSpaceOnUse"
              >
                <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
                  <ellipse
                    cx="14"
                    cy="14"
                    rx="12"
                    ry="8"
                    transform="rotate(45 14 14)"
                  />
                  <ellipse
                    cx="42"
                    cy="14"
                    rx="12"
                    ry="8"
                    transform="rotate(-45 42 14)"
                  />
                  <ellipse
                    cx="14"
                    cy="42"
                    rx="12"
                    ry="8"
                    transform="rotate(-45 14 42)"
                  />
                  <ellipse
                    cx="42"
                    cy="42"
                    rx="12"
                    ry="8"
                    transform="rotate(45 42 42)"
                  />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#kawung)" />
          </svg>

          <Navbar />

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

        {/* 🔥 SHORTCUT MENU (DONASI VS WAKAF) 🔥 */}
        <div className="relative -mt-14 z-20 px-5">
          <div className="grid grid-cols-2 gap-3.5">
            {/* 1. Card Donasi Sosial */}
            <Link
              href="/AllProgramsPage?type=donasi"
              className="group relative overflow-hidden bg-white rounded-[1.5rem] p-4 shadow-[0_10px_36px_-12px_rgba(124,57,150,0.22)] border border-[#F3D48A]/40 hover:border-[#E8B94A] hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(232,185,74,0.35)] transition-all duration-300 active:scale-95 flex flex-col"
            >
              {/* Motif kawung, senada dengan hero */}
              <svg
                className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none group-hover:opacity-[0.09] transition-opacity duration-500"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="kawung-donasi"
                    width="34"
                    height="34"
                    patternUnits="userSpaceOnUse"
                  >
                    <g fill="none" stroke="#7C3996" strokeWidth="1">
                      <ellipse
                        cx="8.5"
                        cy="8.5"
                        rx="7"
                        ry="4.6"
                        transform="rotate(45 8.5 8.5)"
                      />
                      <ellipse
                        cx="25.5"
                        cy="8.5"
                        rx="7"
                        ry="4.6"
                        transform="rotate(-45 25.5 8.5)"
                      />
                      <ellipse
                        cx="8.5"
                        cy="25.5"
                        rx="7"
                        ry="4.6"
                        transform="rotate(-45 8.5 25.5)"
                      />
                      <ellipse
                        cx="25.5"
                        cy="25.5"
                        rx="7"
                        ry="4.6"
                        transform="rotate(45 25.5 25.5)"
                      />
                    </g>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#kawung-donasi)" />
              </svg>

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-[#7C3996] to-[#5A2470] text-white flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(124,57,150,0.5)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Gift size={22} strokeWidth={2.25} />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#FBF8F3] flex items-center justify-center text-[#C9971F] group-hover:bg-[#E8B94A] group-hover:text-white transition-colors shadow-sm border border-[#F3D48A]/60 group-hover:border-transparent">
                  <ChevronRight size={14} />
                </div>
              </div>

              <div className="relative z-10">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#C9971F]">
                  Sedekah &amp; Donasi
                </span>
                <h3 className="font-jakarta font-extrabold text-gray-800 text-[14px] tracking-tight mt-0.5 group-hover:text-[#7C3996] transition-colors">
                  Donasi Sosial
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-snug font-medium line-clamp-2">
                  Bantu ringankan beban saudara kita.
                </p>
              </div>
            </Link>

            {/* 2. Card Wakaf */}
            <Link
              href="/AllProgramsPage?type=wakaf"
              className="group relative overflow-hidden bg-white rounded-[1.5rem] p-4 shadow-[0_10px_36px_-12px_rgba(5,150,105,0.22)] border border-emerald-100 hover:border-emerald-400 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(5,150,105,0.35)] transition-all duration-300 active:scale-95 flex flex-col"
            >
              <svg
                className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none group-hover:opacity-[0.09] transition-opacity duration-500"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="kawung-wakaf"
                    width="34"
                    height="34"
                    patternUnits="userSpaceOnUse"
                  >
                    <g fill="none" stroke="#059669" strokeWidth="1">
                      <ellipse
                        cx="8.5"
                        cy="8.5"
                        rx="7"
                        ry="4.6"
                        transform="rotate(45 8.5 8.5)"
                      />
                      <ellipse
                        cx="25.5"
                        cy="8.5"
                        rx="7"
                        ry="4.6"
                        transform="rotate(-45 25.5 8.5)"
                      />
                      <ellipse
                        cx="8.5"
                        cy="25.5"
                        rx="7"
                        ry="4.6"
                        transform="rotate(-45 8.5 25.5)"
                      />
                      <ellipse
                        cx="25.5"
                        cy="25.5"
                        rx="7"
                        ry="4.6"
                        transform="rotate(45 25.5 25.5)"
                      />
                    </g>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#kawung-wakaf)" />
              </svg>

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center shadow-[0_6px_16px_-4px_rgba(5,150,105,0.5)] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <BookOpen size={22} strokeWidth={2.25} />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#FBF8F3] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm border border-emerald-100 group-hover:border-transparent">
                  <ChevronRight size={14} />
                </div>
              </div>

              <div className="relative z-10">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                  Amal Jariyah
                </span>
                <h3 className="font-jakarta font-extrabold text-gray-800 text-[14px] tracking-tight mt-0.5 group-hover:text-emerald-600 transition-colors">
                  Program Wakaf
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-snug font-medium line-clamp-2">
                  Pahalanya mengalir abadi untukmu.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Konten Halaman Bawah */}
        <div className="relative w-full -mt-8 z-10">
          <div className="bg-[#FBF8F3] rounded-t-[1.75rem] flex-1 w-full pt-14 flex flex-col gap-8">
            <UrgentDonation />
            <LatestPrograms />
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
