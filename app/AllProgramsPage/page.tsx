"use client";

import "@/lib/i18n";
import { Suspense, useState, useEffect, useMemo, useDeferredValue, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Search,
  SlidersHorizontal,
  LayoutGrid, // Icon untuk Grid View
  List,       // Icon untuk List View
} from "lucide-react";
import { AuthService } from "@/lib/auth.service";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/ui/root/BottomNav";
import CampaignCard from "./components/CampaignCard";

// Type definisi
type Campaign = {
  id: string | number;
  slug?: string;
  title: string;
  campaign_code?: string;
  status?: string;
  target_amount?: number | null;
  current_amount?: number | null;
  end_date?: string | null;
  created_at?: string | null;
  image_banner?: string | string[];
  full_name?: string;
  category_id?: number;
  is_wakaf?: string | number | boolean; 
};

function ProgramsContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type"); 
  const isWakafTheme = typeFilter === "wakaf";

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [visibleCount, setVisibleCount] = useState(6);
  const [sortOption, setSortOption] = useState("terbanyak");
  
  // STATE BARU: Untuk kontrol mode Grid/List
  const [isGridView, setIsGridView] = useState(true);

  const observerTarget = useRef<HTMLDivElement>(null);
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const theme = {
    bgGradient: isWakafTheme 
      ? "from-emerald-700 via-emerald-600 to-emerald-500" 
      : "from-[#3E1854] via-[#6B2E88] to-[#8A45A8]",
    primaryText: isWakafTheme ? "text-emerald-600" : "text-[#7C3996]",
    primaryBg: isWakafTheme ? "bg-emerald-600" : "bg-[#7C3996]",
    primaryHex: isWakafTheme ? "#059669" : "#7C3996",
    ringFocus: isWakafTheme ? "focus:ring-emerald-600/15" : "focus:ring-[#7C3996]/15",
    borderFocus: isWakafTheme ? "focus:border-emerald-600" : "focus:border-[#7C3996]",
    patternStroke: isWakafTheme ? "#6EE7B7" : "#F3D48A", 
    tagBg: isWakafTheme ? "bg-emerald-800/40" : "bg-[#3E1854]",
    tagText: isWakafTheme ? "text-emerald-100" : "text-[#F3D48A]",
    cardHover: isWakafTheme ? "hover:shadow-[0_8px_28px_-6px_rgba(5,150,105,0.25)]" : "hover:shadow-[0_8px_28px_-6px_rgba(124,57,150,0.25)]",
  };

  useEffect(() => {
    const fetchAllCampaigns = async () => {
      setLoading(true);
      try {
        const cachedData = sessionStorage.getItem("cache_all_campaigns");
        const cacheTime = sessionStorage.getItem("cache_all_campaigns_time");
        const now = Date.now();

        if (cachedData && cacheTime && now - parseInt(cacheTime) < 180000) {
          setCampaigns(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const res = await AuthService.getCampaigns();
        const data = res.data || res;

        if (Array.isArray(data)) {
          setCampaigns(data);
          sessionStorage.setItem("cache_all_campaigns", JSON.stringify(data));
          sessionStorage.setItem("cache_all_campaigns_time", now.toString());
        }
      } catch (error) {
        console.error("Failed to fetch all campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCampaigns();
  }, []);

  const filteredCampaigns = useMemo(() => {
    const keyword = deferredSearch.toLowerCase();
    const currentTime = Date.now();
    const ONE_DAY_MS = 1000 * 60 * 60 * 24;

    const getCategoryName = (id?: number) => {
      const categoryMap: Record<number, string> = {
        1: t("cat_education", "Pendidikan"),
        2: t("cat_health", "Kesehatan"),
        3: t("cat_disaster", "Bencana Alam"),
        4: t("cat_mosque", "Ekonomi"),
        5: t("cat_general", "Umum"),
      };
      return id && categoryMap[id] ? categoryMap[id] : t("cat_general", "Umum");
    };

    let result = campaigns
      .filter((campaign) => {
        const isWakafProgram = 
          campaign.is_wakaf === true || 
          campaign.is_wakaf === 1 || 
          String(campaign.is_wakaf).toLowerCase() === "true" || 
          String(campaign.is_wakaf) === "1" ||
          (campaign.campaign_code && String(campaign.campaign_code).toLowerCase().includes("fw"));

        if (isWakafTheme && !isWakafProgram) return false;
        if (typeFilter === "donasi" && isWakafProgram) return false;
        return true;
      })
      .filter((campaign) => {
        if (!keyword) return true;
        return (
          campaign.title?.toLowerCase().includes(keyword) ||
          campaign.full_name?.toLowerCase().includes(keyword) ||
          getCategoryName(campaign.category_id).toLowerCase().includes(keyword)
        );
      })
      .map((campaign) => {
        let daysLeft: number | null = null;
        if (campaign.end_date) {
          const diff = new Date(campaign.end_date).getTime() - currentTime;
          daysLeft = diff > 0 ? Math.ceil(diff / ONE_DAY_MS) : 0;
        }
        return { campaign, daysLeft };
      });

    result.sort((a, b) => {
      const campA = a.campaign;
      const campB = b.campaign;
      const aOngoing = campA.status === "active" && (a.daysLeft === null || (a.daysLeft ?? 0) > 0);
      const bOngoing = campB.status === "active" && (b.daysLeft === null || (b.daysLeft ?? 0) > 0);

      if (aOngoing && !bOngoing) return -1;
      if (!aOngoing && bOngoing) return 1;

      const amountA = Number(campA.current_amount) || 0;
      const amountB = Number(campB.current_amount) || 0;
      const timeA = campA.created_at ? new Date(campA.created_at).getTime() : Number(campA.id);
      const timeB = campB.created_at ? new Date(campB.created_at).getTime() : Number(campB.id);

      switch (sortOption) {
        case "terbanyak": return amountB - amountA; 
        case "tersedikit": return amountA - amountB; 
        case "terbaru": return timeB - timeA; 
        case "terlama": return timeA - timeB; 
        default: return amountB - amountA;
      }
    });

    return result.map((item) => item.campaign);
  }, [campaigns, deferredSearch, sortOption, typeFilter, isWakafTheme, t]);

  const displayedCampaigns = filteredCampaigns.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 6);
        }
      },
      { threshold: 0.1 }, 
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [observerTarget, displayedCampaigns.length]);

  const getCategoryLabel = (id?: number) => {
    const map: Record<number, string> = {
      1: t("cat_education", "Pendidikan"),
      2: t("cat_health", "Kesehatan"),
      3: t("cat_disaster", "Bencana Alam"),
      4: t("cat_mosque", "Ekonomi"),
      5: t("cat_general", "Umum"),
    };
    return id && map[id] ? map[id] : t("cat_general", "Umum");
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[#FBF8F3] pb-32 relative">
      {/* HEADER */}
      <div className={`sticky top-0 z-40 bg-gradient-to-b ${theme.bgGradient} shadow-lg rounded-b-[2rem] overflow-hidden transition-colors duration-500`}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <pattern id="kawung-programs" width="56" height="56" patternUnits="userSpaceOnUse">
              <g fill="none" stroke={theme.patternStroke} strokeWidth="1.1">
                <ellipse cx="14" cy="14" rx="12" ry="8" transform="rotate(45 14 14)" />
                <ellipse cx="42" cy="14" rx="12" ry="8" transform="rotate(-45 42 14)" />
                <ellipse cx="14" cy="42" rx="12" ry="8" transform="rotate(-45 14 42)" />
                <ellipse cx="42" cy="42" rx="12" ry="8" transform="rotate(45 42 42)" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kawung-programs)" />
        </svg>

        <nav className="relative px-6 pt-8 pb-4 flex items-center justify-between text-white">
          <Link href="/" className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md rounded-full hover:bg-white/20 transition-all cursor-pointer">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold tracking-tight">
              {isWakafTheme ? "Program Wakaf" : typeFilter === "donasi" ? "Program Donasi" : t("all_programs_title", "Semua Program")}
            </h1>
            <span className="text-[10px] text-white/80 font-medium tracking-wide">
              {isWakafTheme ? "Amal jariyah abadi" : typeFilter === "donasi" ? "Bantu sesama" : "Daftar lengkap"}
            </span>
          </div>
          <div className="w-10 h-10"></div>
        </nav>

        <div className="relative px-6 mb-5 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari program..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(6); 
              }}
              className={`w-full h-12 rounded-2xl bg-white border border-white/40 pl-11 pr-4 text-sm text-[#2A1B33] outline-none shadow-sm transition focus:ring-4 ${theme.borderFocus} ${theme.ringFocus}`}
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-white/90">
            {/* TOGGLE 1/2 KOLOM */}
            <div className="flex bg-black/10 rounded-lg p-0.5 border border-white/10">
              <button 
                onClick={() => setIsGridView(false)} 
                className={`p-1.5 rounded-md transition-colors ${!isGridView ? "bg-white text-slate-800 shadow-sm" : "text-white/70 hover:text-white"}`}
              >
                <List size={15} />
              </button>
              <button 
                onClick={() => setIsGridView(true)} 
                className={`p-1.5 rounded-md transition-colors ${isGridView ? "bg-white text-slate-800 shadow-sm" : "text-white/70 hover:text-white"}`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>

            {/* SORT OPTION */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="opacity-80" />
              <span className="text-xs font-medium">Urutkan:</span>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setVisibleCount(6); 
                }}
                className={`bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg px-2 py-1 text-xs outline-none cursor-pointer focus:bg-[${theme.primaryHex}]`}
              >
                <option value="terbanyak" className="text-black">Donasi Terbanyak</option>
                <option value="terbaru" className="text-black">Terbaru</option>
                <option value="terlama" className="text-black">Terlama</option>
                <option value="tersedikit" className="text-black">Donasi Tersedikit</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* LIST / GRID KAMPANYE */}
      {/* Container ini mengubah layout secara dinamis berdasarkan state isGridView */}
      <div className={`px-6 pt-6 ${isGridView ? "grid grid-cols-2 gap-4" : "flex flex-col gap-5"}`}>
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className={`${isGridView ? "h-56" : "h-64"} rounded-3xl animate-pulse border opacity-10 ${isWakafTheme ? "bg-emerald-600 border-emerald-600" : "bg-[#7C3996] border-[#7C3996]"}`} />
          ))
        ) : displayedCampaigns.length > 0 ? (
          <>
            {displayedCampaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.id}
                campaign={campaign}
                isWakafTheme={isWakafTheme}
                theme={theme}
                isGridView={isGridView}
                getCategoryLabel={getCategoryLabel}
                t={t}
                IMAGE_BASE_URL={IMAGE_BASE_URL}
              />
            ))}

            {visibleCount < filteredCampaigns.length ? (
              <div ref={observerTarget} className={`${isGridView ? "col-span-2" : "w-full"} flex items-center justify-center py-8 pb-12`}>
                <div className={`w-7 h-7 border-[3px] border-t-transparent rounded-full animate-spin ${isWakafTheme ? 'border-emerald-600/20 border-t-emerald-600' : 'border-[#7C3996]/20 border-t-[#7C3996]'}`}></div>
              </div>
            ) : displayedCampaigns.length > 0 ? (
              <div className={`${isGridView ? "col-span-2" : "w-full"} flex flex-col items-center justify-center py-8 pb-12 opacity-60`}>
                <div className="w-1 h-1 bg-gray-300 rounded-full mb-2"></div>
                <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Semua program telah ditampilkan</p>
              </div>
            ) : null}
          </>
        ) : (
          <div className={`${isGridView ? "col-span-2" : "w-full"} flex flex-col items-center justify-center py-20 text-center`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isWakafTheme ? 'bg-emerald-50 text-emerald-300' : 'bg-[#7C3996]/8 text-[#7C3996]/40'}`}>
              <Heart size={32} />
            </div>
            <h3 className="text-[#2A1B33] font-bold text-lg">{t("no_active_programs", "Belum Ada Program")}</h3>
            <p className="text-gray-500 text-sm mt-2 px-10 leading-relaxed">
              {isWakafTheme ? "Saat ini belum ada program wakaf yang berjalan." : t("no_active_programs_desc", "Saat ini belum ada program yang berjalan.")}
            </p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export default function AllProgramsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#7C3996] rounded-full animate-spin"></div>
      </div>
    }>
      <ProgramsContent />
    </Suspense>
  );
}