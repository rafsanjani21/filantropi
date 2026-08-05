"use client";

import "@/lib/i18n";
import Link from "next/link";
import Navbar from "@/app/components/ui/profile/navbar";
import BottomNav from "@/app/components/ui/root/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  History,
  FileText,
  LogOut,
  ChevronRight,
  Copy,
  CheckCircle2,
  Building2,
  ShieldCheck,
  MapPin,
  Mail,
  LayoutDashboard,
  HelpCircle,
  Scale,
  Globe
} from "lucide-react";

export default function ProfilePagePenerima() {
  const { handleLogout, loading, getProfile } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // PANGGIL FUNGSI TRANSLATOR DAN I18N OBJECT
  const { t, i18n } = useTranslation();

  

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let data;
        try {
          data = await getProfile();
        } catch (err: any) {
          data = await getProfile("beneficiary");
        }
        setUser(data);
      } catch (err) {
        console.error("Gagal mengambil data profil sama sekali:", err);
      }
    };

    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const userPhoto = user?.photo_profile
    ? `${BASE_URL}/${user.photo_profile}?t=${Date.now()}`
    : "/profile.png";

  const handleCopyWallet = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] shadow-2xl pb-32 overflow-hidden">
      {/* Signature: motif kawung tipis, konsisten dengan seluruh app */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="kawung-profile" width="56" height="56" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
              <ellipse cx="14" cy="14" rx="12" ry="8" transform="rotate(45 14 14)" />
              <ellipse cx="42" cy="14" rx="12" ry="8" transform="rotate(-45 42 14)" />
              <ellipse cx="14" cy="42" rx="12" ry="8" transform="rotate(-45 14 42)" />
              <ellipse cx="42" cy="42" rx="12" ry="8" transform="rotate(45 42 42)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kawung-profile)" />
      </svg>

      <Navbar />

      {/* Toast Notification */}
      {copied && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-[#2A1B33]/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full shadow-2xl text-sm font-medium flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <CheckCircle2 size={18} className="text-emerald-400" />
          {t("copied_wallet")}
        </div>
      )}

      <main className="relative flex-1 flex flex-col items-center pt-10 px-6">

        {/* Profile Header Section */}
        <div className="relative mb-6">
          <div className="absolute -inset-1.5 bg-[#E8B94A]/40 rounded-full blur-md"></div>
          <div className="relative p-1 bg-white rounded-full shadow-lg">
            <img
              src={userPhoto}
              alt="Profile"
              referrerPolicy="no-referrer"
              className="w-32 h-32 rounded-full object-cover border-4 border-white"
              onError={(e) => (e.currentTarget.src = "/profile.png")}
            />
            {user?.role === "beneficiary" || user?.role === "penerima_manfaat" ? (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-[#E8B94A]/40 flex items-center gap-1.5 whitespace-nowrap">
                {user?.beneficiary_type === "organization" ? (
                  <Building2 size={12} className="text-[#7C3996]" />
                ) : (
                  <User size={12} className="text-[#7C3996]" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A1B33]">
                  {user?.beneficiary_type === "organization" ? (i18n.language === 'id' ? "Organisasi" : "Organization") : (i18n.language === 'id' ? "Individu" : "Individual")}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="text-center mb-10 flex flex-col items-center w-full">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            {user?.name || user?.full_name || "User"}
            {user?.beneficiary_type === "organization" && user?.registration_number && (
              <ShieldCheck size={20} className="text-[#F3D48A]" />
            )}
          </h1>

          <div className="flex items-center gap-2 mt-1 text-purple-100/80 text-sm">
            {user?.role === "beneficiary" || user?.role === "penerima_manfaat" ? (
              <>
                <MapPin size={14} />
                <span className="truncate max-w-[250px]">{user?.alamat || t("no_address")}</span>
              </>
            ) : (
              <>
                <Mail size={14} />
                <span className="truncate max-w-[250px]">{user?.email || t("no_email")}</span>
              </>
            )}
          </div>
        </div>

        {/* Menu Utama */}
        <div className="w-full bg-white rounded-[2.5rem] shadow-xl p-4 space-y-2 mb-8 border border-white/20">

          <Link
            href={
              !user
                ? "#"
                : user.role === "beneficiary" || user.role === "penerima_manfaat"
                ? "/ProfilePage/PagePenerima"
                : "/ProfilePage/UserPage"
            }
            className="group"
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
              }
            }}
          >
            <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-[#7C3996]/5">
              <div className="flex items-center gap-4">
                <div className="bg-[#7C3996]/10 p-2.5 rounded-xl text-[#7C3996] group-hover:bg-[#7C3996] group-hover:text-white transition-colors">
                  <User size={22} />
                </div>
                <div>
                  <span className="font-bold text-[#2A1B33] block text-sm">{t("profile_detail")}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase">
                    {!user ? "..." : user.role === "beneficiary" || user.role === "penerima_manfaat" ? t("beneficiary_data") : t("general_account")}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* PROGRAM SAYA */}
          {(user?.role === "beneficiary" || user?.role === "penerima_manfaat") && (
            <Link href="/ProgramPage" className="group">
              <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-[#E8B94A]/8">
                <div className="flex items-center gap-4">
                  <div className="bg-[#E8B94A]/15 p-2.5 rounded-xl text-[#8A6413] group-hover:bg-[#E8B94A] group-hover:text-white transition-colors">
                    <LayoutDashboard size={22} />
                  </div>
                  <div>
                    <span className="font-bold text-[#2A1B33] block text-sm">{t("my_programs")}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">
                      {t("manage_campaigns")}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          )}

          {/* RIWAYAT DONASI */}
          <Link href="/HistoryPage" className="group">
            <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-[#7C3996]/5">
              <div className="flex items-center gap-4">
                <div className="bg-[#5B2A73]/10 p-2.5 rounded-xl text-[#5B2A73] group-hover:bg-[#5B2A73] group-hover:text-white transition-colors">
                  <History size={22} />
                </div>
                <span className="font-bold text-[#2A1B33] text-sm">{t("donation_history")}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <div className="h-px bg-gray-100 mx-4 my-2"></div>

          {/* PUSAT BANTUAN */}
          <Link href="/PusatBantuan" className="group">
            <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500 group-hover:bg-gray-500 group-hover:text-white transition-colors">
                  <HelpCircle size={22} />
                </div>
                <span className="font-bold text-[#2A1B33] text-sm">{t("help_center")}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* SYARAT & KETENTUAN */}
          <Link href="/SyaratKetentuan" className="group">
            <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500 group-hover:bg-gray-500 group-hover:text-white transition-colors">
                  <Scale size={22} />
                </div>
                <span className="font-bold text-[#2A1B33] text-sm">{t("terms_conditions")}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <div className="h-px bg-gray-100 mx-4 my-2"></div>

          

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="group w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-4 ">
              <div className="bg-red-100 p-2.5 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <LogOut size={22} />
              </div>
              <span className="font-bold text-red-600 text-sm">
                {loading ? t("logging_out") : t("logout")}
              </span>
            </div>
            {loading && <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
          </button>
        </div>

        <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-10">
          Kemas Foundation
        </p>
      </main>

      {/* 🔥 Render BottomNav di bagian bawah */}
      <BottomNav />
    </div>
  );
}