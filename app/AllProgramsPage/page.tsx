"use client";

import "@/lib/i18n";
import { Suspense, useState, useEffect, useMemo, useDeferredValue, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Heart,
  Infinity,
  Search,
  SlidersHorizontal,
  BookOpen,
  Gift,
} from "lucide-react";
import { AuthService } from "@/lib/auth.service";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/ui/root/BottomNav";

import LiveDonationBlink from "../DetailPage/components/LiveDonationBlink";
import { apiFetch } from "@/lib/api";

type Campaign = {
  id: string | number;
  slug?: string;
  title: string;
  status?: string;
  target_amount?: number | null;
  current_amount_idr?: number | null;
  end_date?: string | null;
  created_at?: string | null;
  image_banner?: string | string[];
  full_name?: string;
  category_id?: number;
  is_wakaf?: boolean; // 🔥 Tambahkan tipe is_wakaf
};

function ProgramsContent() {
  const { t } = useTranslation();
  
  // 🔥 Tangkap parameter URL
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type"); 
  const isWakafTheme = typeFilter === "wakaf";

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [visibleCount, setVisibleCount] = useState(6);

  const [sortOption, setSortOption] = useState("terbanyak");

  const observerTarget = useRef<HTMLDivElement>(null);
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  // ==========================================
  // 🔥 VARIABEL TEMA DINAMIS (HIJAU VS UNGU)
  // ==========================================
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

  useEffect(() => {
    const fetchGlobalRecentDonations = async () => {
      try {
        const res = await apiFetch(`/donations/all`, { method: "GET" });
        if (res && res.data) {
          const historyArray = Array.isArray(res.data.history) ? res.data.history : Array.isArray(res.data) ? res.data : [];
          const apiHistory = historyArray.map((tx: any) => ({
            from_to: tx.donatur_name || t("anonymous", "Anonim"),
            amount: String(tx.amount_idr || 0),
          }));
          setRecentDonations(apiHistory);
        }
      } catch (err) {
        console.error("Gagal memuat donasi terbaru di AllProgramsPage:", err);
      }
    };
    fetchGlobalRecentDonations();
  }, [t]);

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
        // 🔥 Filter Tipe (Wakaf / Donasi)
        if (isWakafTheme && !campaign.is_wakaf) return false;
        if (typeFilter === "donasi" && campaign.is_wakaf) return false;
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

      const amountA = Number(campA.current_amount_idr) || 0;
      const amountB = Number(campB.current_amount_idr) || 0;
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
      <LiveDonationBlink history={recentDonations} />

      <div className={`sticky top-0 z-40 bg-gradient-to-b ${theme.bgGradient} shadow-lg rounded-b-[2rem] overflow-hidden transition-colors duration-500`}>
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
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
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md rounded-full hover:bg-white/20 transition-all cursor-pointer"
          >
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

          <div className="flex items-center justify-end gap-2 text-white/90">
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

      <div className="px-6 pt-6 flex flex-col gap-5">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className={`h-64 rounded-3xl animate-pulse border opacity-10 ${isWakafTheme ? "bg-emerald-600 border-emerald-600" : "bg-[#7C3996] border-[#7C3996]"}`} />
          ))
        ) : displayedCampaigns.length > 0 ? (
          <>
            {displayedCampaigns.map((campaign) => {
              const isUnlimitedTarget = !campaign.target_amount || campaign.target_amount === 0;
              const target = isUnlimitedTarget ? 1 : Number(campaign.target_amount);
              const collected = Number(campaign.current_amount_idr) || 0;

              const progressRaw = (collected / target) * 100;
              const progress = progressRaw > 100 ? 100 : Math.round(progressRaw);

              let daysLeft: number | null = null;
              if (campaign.end_date) {
                const diff = new Date(campaign.end_date).getTime() - Date.now();
                daysLeft = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
              }
              const isUnlimitedTime = daysLeft === null;

              const banner = Array.isArray(campaign.image_banner) ? campaign.image_banner[0] : campaign.image_banner;
              const imageUrl = typeof banner === "string" && banner.trim() !== "" ? banner.startsWith("http") ? banner : `${IMAGE_BASE_URL}/${banner.replace(/^\/+/, "")}?t=${Date.now()}` : "/placeholder.png";

              const campaignIdentifier = campaign.slug || campaign.id;
              
              // 🔥 Arahkan ke Detail Page yang Tepat Berdasarkan Tipe Program
              const targetUrl = campaign.is_wakaf ? `/WakafDetailPage?slug=${campaignIdentifier}` : `/DetailPage?slug=${campaignIdentifier}`;

              return (
                <div
                  key={campaign.id}
                  className={`bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col group transition-all duration-300 ${theme.cardHover}`}
                >
                  <Link href={targetUrl} className="block cursor-pointer">
                    <div className="relative h-44">
                      <img src={imageUrl} alt={campaign.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* 🔥 Label Badge di atas gambar */}
                      <div className="absolute top-3 left-3">
                        {campaign.is_wakaf ? (
                          <div className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-emerald-400">
                            <BookOpen size={12} /> Wakaf
                          </div>
                        ) : (
                          <div className="bg-[#E8B94A]/90 backdrop-blur-sm text-[#2A1B33] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-[#D99A1C]">
                            <Gift size={12} /> Donasi Sosial
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col">
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-2">
                        <span className="font-medium text-gray-600 truncate max-w-[140px]">
                          {campaign.full_name || t("beneficiary", "Penerima Manfaat")}
                        </span>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[8px] shrink-0 ${theme.primaryBg}`}>
                          ✓
                        </div>
                        <div className="ml-auto flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider ${theme.tagBg} ${theme.tagText}`}>
                            {getCategoryLabel(campaign.category_id)}
                          </span>
                        </div>
                      </div>

                      <h3 className={`text-lg font-bold line-clamp-2 leading-snug text-[#2A1B33] transition-colors ${isWakafTheme ? 'group-hover:text-emerald-600' : 'group-hover:text-[#7C3996]'}`}>
                        {campaign.title}
                      </h3>

                      {campaign.status === "active" ? (
                        <div className="mt-4">
                          <div className="flex justify-between items-end mb-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 font-medium mb-0.5">{t("collected_label", "Terkumpul")}</span>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-sm font-bold ${isWakafTheme ? 'text-emerald-700' : 'text-[#5B2A73]'}`}>
                                  Rp {collected.toLocaleString("id-ID")}
                                </span>
                                {!isUnlimitedTarget && (
                                  <span className="text-[10px] text-gray-400 font-normal">
                                    {t("from", "dari")} Rp {target.toLocaleString("id-ID")}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isUnlimitedTarget && (
                              <span className={`text-sm font-black px-2 py-0.5 rounded-md border ${isWakafTheme ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-[#5B2A73] bg-[#E8B94A]/15 border-[#E8B94A]/30'}`}>
                                {progress}%
                              </span>
                            )}
                          </div>

                          {!isUnlimitedTarget && (
                            <div className={`w-full h-2.5 rounded-full overflow-hidden ${isWakafTheme ? 'bg-emerald-100' : 'bg-[#7C3996]/10'}`}>
                              <div
                                className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${isWakafTheme ? 'from-emerald-400 to-emerald-600' : 'from-[#7C3996] to-[#E8B94A]'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                            <span className="text-xs text-gray-400 font-medium">{t("time_limit", "Batas Waktu")}</span>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${!isUnlimitedTime && (daysLeft as number) <= 5 && (daysLeft as number) > 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-[#FBF8F3] text-gray-600 border border-gray-100"}`}>
                              {isUnlimitedTime ? (
                                <>
                                  <Infinity size={14} className={theme.primaryText} />
                                  <span className={theme.primaryText}>{t("unlimited_time", "Tanpa Batas")}</span>
                                </>
                              ) : (
                                <>
                                  <Clock size={12} className={(daysLeft as number) <= 5 && (daysLeft as number) > 0 ? "text-red-500" : "text-gray-400"} />
                                  {(daysLeft as number) > 0 ? `${t("remaining", "Sisa")} ${daysLeft} ${t("days", "Hari")}` : t("has_ended", "Berakhir")}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-2.5">
                          <Clock size={14} className="text-amber-500" />
                          <p className="text-xs text-amber-700 font-medium">{t("under_review_desc", "Program ini sedang ditinjau oleh Admin.")}</p>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}

            {visibleCount < filteredCampaigns.length && (
              <div ref={observerTarget} className="w-full flex items-center justify-center py-6 pb-12">
                <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${isWakafTheme ? 'border-emerald-600/20 border-t-emerald-600' : 'border-[#7C3996]/20 border-t-[#7C3996]'}`}></div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
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

// 🔥 Wajib bungkus dengan Suspense karena menggunakan useSearchParams()
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