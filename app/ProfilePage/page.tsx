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
  LogOut,
  ChevronRight,
  CheckCircle2,
  Building2,
  ShieldCheck,
  MapPin,
  Mail,
  LayoutDashboard,
  HelpCircle,
  Scale,
  TrendingUp,
  Timer,
  Infinity as InfinityIcon,
} from "lucide-react";

function SectionMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0" aria-hidden="true">
      <ellipse cx="5" cy="5" rx="4.5" ry="3" transform="rotate(45 5 5)" fill="#E8B94A" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-purple-100/70 text-[11px] font-bold uppercase tracking-[0.18em] mb-3 ml-4">
      <SectionMark />
      {children}
    </h3>
  );
}

function MenuRow({
  href,
  icon,
  iconBg,
  iconColor,
  hoverBg,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  hoverBg: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="group block">
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors duration-200 ${hoverBg}`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`${iconBg} ${iconColor} p-2.5 rounded-xl transition-colors duration-200 group-hover:text-white`}
          >
            {icon}
          </div>
          <div>
            <span className="font-semibold text-[#241432] block text-sm leading-tight">
              {title}
            </span>
            {subtitle && (
              <span className="text-[10.5px] text-gray-400 font-medium uppercase tracking-wide">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <ChevronRight
          size={17}
          className="text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-200"
        />
      </div>
    </Link>
  );
}

export default function ProfilePagePenerima() {
  const {
    handleLogout,
    loading,
    getProfile,
    getInvestorProfile,
    getInvestments,
  } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [investor, setInvestor] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        let userData = null;
        try {
          userData = await getProfile("donor");
        } catch (err) {
          try {
            userData = await getProfile("beneficiary");
          } catch (err2) {
            console.warn("User reguler tidak ditemukan");
          }
        }
        if (userData) setUser(userData);

        const investorData = await getInvestorProfile();

        if (investorData) {
          setInvestor(investorData);

          const invData = await getInvestments();
          if (invData && Array.isArray(invData)) {
            setInvestments(invData);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
      }
    };

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const photoUrl = investor?.profile_image_url || user?.photo_profile;
  const userPhoto = photoUrl
    ? `${BASE_URL}/${photoUrl}?t=${Date.now()}`
    : "/profile.png";

  const displayName =
    investor?.full_name || user?.name || user?.full_name || "User";
  const displayAddress = investor?.address || user?.alamat;
  const displayEmail = investor?.email || user?.email;

  const handleCopyWallet = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const investmentTypes = Array.from(
    new Set(investments.map((inv) => inv.type)),
  );

  const hasInvestments =
    investor &&
    (investmentTypes.includes("investasi_murni") ||
      investmentTypes.includes("wakaf_berjangka") ||
      investmentTypes.includes("wakaf_abadi"));

  const isBeneficiary =
    user?.role === "beneficiary" || user?.role === "penerima_manfaat";

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gradient-to-b from-[#2D1240] via-[#5B2A73] to-[#7C3996] shadow-2xl pb-32 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
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

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(243,212,138,0.16) 0%, rgba(243,212,138,0) 70%)",
        }}
        aria-hidden="true"
      />

      <Navbar />

      {copied && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#241432]/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl text-sm font-medium flex items-center gap-2 z-50 border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={17} className="text-emerald-400" />
          {t("copied_wallet")}
        </div>
      )}

      <main className="relative flex-1 flex flex-col items-center pt-10 px-6">
        {/* HEADER — PHOTO & IDENTITY */}
        <div className="relative mb-5">
          <div className="absolute -inset-2 bg-[#E8B94A]/30 rounded-full blur-xl" aria-hidden="true" />
          <div className="relative p-[3px] bg-gradient-to-br from-[#F3D48A] to-[#C9962F] rounded-full shadow-xl">
            <div className="p-1 bg-white rounded-full">
              <img
                src={userPhoto}
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-28 h-28 rounded-full object-cover"
                onError={(e) => (e.currentTarget.src = "/profile.png")}
              />
            </div>

            {isBeneficiary ? (
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-[#E8B94A]/40 flex items-center gap-1.5 whitespace-nowrap">
                {user?.beneficiary_type === "organization" ? (
                  <Building2 size={11} className="text-[#7C3996]" />
                ) : (
                  <User size={11} className="text-[#7C3996]" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#241432]">
                  {user?.beneficiary_type === "organization"
                    ? i18n.language === "id"
                      ? "Organisasi"
                      : "Organization"
                    : i18n.language === "id"
                      ? "Individu"
                      : "Individual"}
                </span>
              </div>
            ) : investor ? (
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#241432] px-3 py-1 rounded-full shadow-md border border-[#E8B94A]/40 flex items-center gap-1.5 whitespace-nowrap">
                <TrendingUp size={11} className="text-[#F3D48A]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F3D48A]">
                  Investor
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="text-center mb-9 flex flex-col items-center w-full">
          <h1 className="text-[22px] font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
            {displayName}
            {investor?.is_verified && (
              <ShieldCheck size={18} className="text-[#F3D48A]" />
            )}
          </h1>

          <div className="flex items-center gap-1.5 mt-1.5 text-purple-100/70 text-[13px]">
            {displayAddress ? (
              <>
                <MapPin size={13} />
                <span className="truncate max-w-[260px]">{displayAddress}</span>
              </>
            ) : displayEmail ? (
              <>
                <Mail size={13} />
                <span className="truncate max-w-[260px]">{displayEmail}</span>
              </>
            ) : null}
          </div>
        </div>

        {/*  ACCOUNT */}
        <div className="w-full mb-5">
          <SectionLabel>Pengaturan Akun</SectionLabel>
          <div className="bg-white/[0.97] backdrop-blur-sm rounded-lg shadow-xl shadow-black/10 p-2 border border-white/40">
            <MenuRow
              href={
                !user && !investor
                  ? "#"
                  : investor // 🔥 Jika ada data investor, arahkan ke halaman khusus investor
                    ? "/ProfilePage/InvestorPage"
                    : isBeneficiary
                      ? "/ProfilePage/PagePenerima"
                      : "/ProfilePage/UserPage"
              }
              icon={<User size={20} />}
              iconBg="bg-[#7C3996]/10 group-hover:bg-[#7C3996]"
              iconColor="text-[#7C3996]"
              hoverBg="hover:bg-[#7C3996]/[0.04]"
              title={t("profile_detail")}
              subtitle={
                !user && !investor
                  ? "..."
                  : investor // 🔥 Ubah juga subtitle-nya agar sesuai
                    ? "Data Investor" 
                    : isBeneficiary
                      ? t("beneficiary_data")
                      : t("general_account")
              }
            />
          </div>
        </div>

        {/*  PORTFOLIO & WAKAF (INVESTORS ONLY) */}
        {hasInvestments && (
          <div className="w-full mb-5">
            <SectionLabel>Portofolio &amp; Wakaf</SectionLabel>
            <div className="bg-white/[0.97] backdrop-blur-sm rounded-lg shadow-xl shadow-black/10 p-2 border border-white/40 flex flex-col">
              {investmentTypes.includes("investasi_murni") && (
                <MenuRow
                  href="/InvestasiMurniPage"
                  icon={<TrendingUp size={20} />}
                  iconBg="bg-emerald-50 group-hover:bg-emerald-600"
                  iconColor="text-emerald-600"
                  hoverBg="hover:bg-emerald-50/70"
                  title="Investasi Murni"
                  subtitle="Portofolio Anda"
                />
              )}

              {investmentTypes.includes("investasi_murni") &&
                (investmentTypes.includes("wakaf_berjangka") ||
                  investmentTypes.includes("wakaf_abadi")) && (
                  <div className="h-px bg-gray-100 mx-4 my-0.5" />
                )}

              {investmentTypes.includes("wakaf_berjangka") && (
                <MenuRow
                  href="/WakafBerjangkaPage"
                  icon={<Timer size={20} />}
                  iconBg="bg-blue-50 group-hover:bg-blue-600"
                  iconColor="text-blue-600"
                  hoverBg="hover:bg-blue-50/70"
                  title="Wakaf Berjangka"
                  subtitle="Wakaf Waktu Tertentu"
                />
              )}

              {investmentTypes.includes("wakaf_berjangka") &&
                investmentTypes.includes("wakaf_abadi") && (
                  <div className="h-px bg-gray-100 mx-4 my-0.5" />
                )}

              {investmentTypes.includes("wakaf_abadi") && (
                <MenuRow
                  href="/WakafAbadiPage"
                  icon={<InfinityIcon size={20} />}
                  iconBg="bg-indigo-50 group-hover:bg-indigo-600"
                  iconColor="text-indigo-600"
                  hoverBg="hover:bg-indigo-50/70"
                  title="Wakaf Abadi"
                  subtitle="Wakaf Selamanya"
                />
              )}
            </div>
          </div>
        )}

        {/*  ACTIVITY */}
        <div className="w-full mb-5">
          <SectionLabel>Aktivitas Anda</SectionLabel>
          <div className="bg-white/[0.97] backdrop-blur-sm rounded-lg shadow-xl shadow-black/10 p-2 border border-white/40 flex flex-col">
            {isBeneficiary && (
              <>
                <MenuRow
                  href="/ProgramPage"
                  icon={<LayoutDashboard size={20} />}
                  iconBg="bg-[#E8B94A]/15 group-hover:bg-[#E8B94A]"
                  iconColor="text-[#8A6413]"
                  hoverBg="hover:bg-[#E8B94A]/[0.08]"
                  title={t("my_programs")}
                  subtitle={t("manage_campaigns")}
                />
                <div className="h-px bg-gray-100 mx-4 my-0.5" />
              </>
            )}

            <MenuRow
              href="/HistoryPage"
              icon={<History size={20} />}
              iconBg="bg-[#5B2A73]/10 group-hover:bg-[#5B2A73]"
              iconColor="text-[#5B2A73]"
              hoverBg="hover:bg-[#5B2A73]/[0.04]"
              title={t("donation_history")}
              subtitle="Riwayat Anda"
            />
          </div>
        </div>

        {/*  HELP & INFO */}
        <div className="w-full mb-6">
          <SectionLabel>Bantuan &amp; Informasi</SectionLabel>
          <div className="bg-white/[0.97] backdrop-blur-sm rounded-lg shadow-xl shadow-black/10 p-2 border border-white/40 flex flex-col">
            <MenuRow
              href="/PusatBantuan"
              icon={<HelpCircle size={20} />}
              iconBg="bg-gray-100 group-hover:bg-gray-500"
              iconColor="text-gray-500"
              hoverBg="hover:bg-gray-50"
              title={t("help_center")}
            />
            <div className="h-px bg-gray-100 mx-4 my-0.5" />
            <MenuRow
              href="/SyaratKetentuan"
              icon={<Scale size={20} />}
              iconBg="bg-gray-100 group-hover:bg-gray-500"
              iconColor="text-gray-500"
              hoverBg="hover:bg-gray-50"
              title={t("terms_conditions")}
            />
          </div>
        </div>

        {/* LOGOUT */}
        <div className="w-full mb-8">
          <div className="bg-white/[0.97] backdrop-blur-sm rounded-lg shadow-xl shadow-black/10 p-2 border border-white/40">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="group w-full flex items-center justify-between p-3.5 rounded-2xl transition-colors duration-200 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="bg-red-50 group-hover:bg-red-600 p-2.5 rounded-xl text-red-600 group-hover:text-white transition-colors duration-200">
                  <LogOut size={20} />
                </div>
                <span className="font-semibold text-red-600 text-sm">
                  {loading ? t("logging_out") : t("logout")}
                </span>
              </div>
              {loading && (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
              )}
            </button>
          </div>
        </div>

        <p className="text-white/35 text-[10px] font-bold tracking-[0.25em] uppercase mb-10">
          Devhash
        </p>
      </main>

      <BottomNav />
    </div>
  );
}