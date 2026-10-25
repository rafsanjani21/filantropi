/**
 * app/(main)/page.tsx
 *
 * Fungsi   : Halaman beranda: sapaan pengguna, pintasan Donasi/Wakaf, dan program terbaru.
 * Ekspor   : default HomePage
 * Dipakai  : Route /; merender LogoNavbar, Carousel, PartnerWakaf, LatestPrograms, BottomNav
 * Catatan  : "use client"; cek role via useAuth dan token helper saat mount
 */

"use client";

import "@/lib/i18n";
import { Gift, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import LogoNavbar from "@/components/layout/navbar/LogoNavbar";
import BottomNav from "@/components/layout/BottomNav";
import Carousel from "@/components/home/Carousel";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken, getRefreshToken } from "@/lib/authTokens";
import { useTranslation } from "react-i18next";
import LatestPrograms from "@/components/home/LatestPrograms";
import PartnerWakaf from "@/components/home/PartnerWakaf";
import type { UserProfile } from "@/types";

export default function HomePage() {
  const { getProfile } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState<
    "donor" | "beneficiary" | "guest" | null
  >(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      const token = getAccessToken() || getRefreshToken();

      if (!token) {
        setRole("guest");
        setIsCheckingAuth(false);
        return;
      }

      let assignedRole: "donor" | "beneficiary" | "guest" =
        "guest";
      let userData = null;

      try {
        userData = await getProfile("donor");
        assignedRole = "donor";
      } catch {}

      if (assignedRole === "guest") {
        try {
          userData = await getProfile("beneficiary");
          assignedRole = "beneficiary";
        } catch {}
      }

      if (assignedRole === "guest") {
        setRole("guest");
        setUserProfile(null);
      } else {
        setRole(assignedRole);
        setUserProfile(userData);
      }

      setIsCheckingAuth(false);
    };

    checkUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const renderGreetingName = () => {
    if (isCheckingAuth) {
      return (
        <span className="inline-block w-32 h-[38px] align-bottom bg-white/20 rounded-md animate-pulse"></span>
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
      <div className="flex flex-col w-full min-h-screen relative bg-[#FBF8F3] pb-28">
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

          <LogoNavbar />

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
            <PartnerWakaf />
          </div>
          
        </div>

        {/*  SHORTCUT MENU (DONASI VS WAKAF)  */}
        <div className="relative -mt-14 z-20 px-5">
          <div className="grid grid-cols-2 gap-3.5">
            {/* 1. Card Donasi Sosial */}
            <Link
              href="/programs?type=donasi"
              className="group relative overflow-hidden bg-white rounded-[1.5rem] p-4 shadow-[0_10px_36px_-12px_rgba(124,57,150,0.22)] border border-[#F3D48A]/40 hover:border-[#E8B94A] hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(232,185,74,0.35)] transition-all duration-300 active:scale-95 flex flex-col"
            >
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
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A5A0B]">
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
              href="/programs?type=wakaf"
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
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
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
            <LatestPrograms />
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}