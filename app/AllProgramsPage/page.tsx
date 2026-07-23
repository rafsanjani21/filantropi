"use client";

import "@/lib/i18n";
import { useState, useEffect, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Heart,
  Infinity,
  Search,
} from "lucide-react";
import { AuthService } from "@/lib/auth.service";
import { useTranslation } from "react-i18next";
import BottomNav from "../components/ui/root/BottomNav";

import LiveDonationBlink from "../components/ui/detail/LiveDonationBlink";
import { apiFetch } from "@/lib/api"; 

type Campaign = {
  id: string | number;
  slug?: string;
  title: string;
  status?: string;
  target_amount?: number | null;
  current_amount_idr?: number | null;
  end_date?: string | null;
  image_banner?: string | string[];
  full_name?: string;
  category_id?: number;
};

export default function AllProgramsPage() {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [visibleCount, setVisibleCount] = useState(6);
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

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
        const res = await apiFetch(`/donations/all`, {
          method: "GET",
        });

        if (res && res.data) {
          const historyArray = Array.isArray(res.data.history) 
            ? res.data.history 
            : (Array.isArray(res.data) ? res.data : []);
          
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

    return campaigns
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
      })
      .sort((a, b) => {
        const aOngoing = a.campaign.status === "active" && (a.daysLeft === null || a.daysLeft > 0);
        const bOngoing = b.campaign.status === "active" && (b.daysLeft === null || b.daysLeft > 0);

        if (aOngoing && bOngoing) {
          if (a.daysLeft === null && b.daysLeft === null) return 0;
          if (a.daysLeft === null) return 1;
          if (b.daysLeft === null) return -1;
          return a.daysLeft - b.daysLeft;
        }

        if (aOngoing && !bOngoing) return -1;
        if (!aOngoing && bOngoing) return 1;
        return 0;
      })
      .map((item) => item.campaign);
  }, [campaigns, deferredSearch, t]);

  const displayedCampaigns = filteredCampaigns.slice(0, visibleCount);

  // 🔥 PERUBAHAN: Desain badge disesuaikan karena sekarang berada di background putih
  const renderStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md shrink-0">
            <CheckCircle2 size={10} />
            <span className="text-[9px] font-black uppercase tracking-wider">
              {t("active_status", "Aktif")}
            </span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-md shrink-0">
            <XCircle size={10} />
            <span className="text-[9px] font-black uppercase tracking-wider">
              {t("rejected_status", "Ditolak")}
            </span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md shrink-0">
            <Clock size={10} />
            <span className="text-[9px] font-black uppercase tracking-wider">
              {t("waiting_status", "Menunggu")}
            </span>
          </div>
        );
    }
  };

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

      <div className="sticky top-0 z-40 bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] shadow-lg rounded-b-3xl overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <pattern id="kawung-programs" width="56" height="56" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
                <ellipse cx="14" cy="14" rx="12" ry="8" transform="rotate(45 14 14)" />
                <ellipse cx="42" cy="14" rx="12" ry="8" transform="rotate(-45 42 14)" />
                <ellipse cx="14" cy="42" rx="12" ry="8" transform="rotate(-45 14 42)" />
                <ellipse cx="42" cy="42" rx="12" ry="8" transform="rotate(45 42 42)" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kawung-programs)" />
        </svg>

        <nav className="relative px-6 pt-8 pb-6 flex items-center justify-between text-white">
          <Link
            href="/HomePage"
            className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md rounded-full hover:bg-white/20 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold tracking-tight">
            {t("all_programs_title", "Semua Program")}
          </h1>
          <div className="w-10 h-10"></div>
        </nav>
        <div className="relative px-6 mb-5">
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
              className="w-full h-14 rounded-2xl bg-white border border-white/40 pl-12 pr-4 text-sm text-[#2A1B33] outline-none shadow-sm transition focus:border-[#7C3996] focus:ring-4 focus:ring-[#7C3996]/15"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-5">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-[#7C3996]/8 rounded-3xl animate-pulse border border-[#7C3996]/8" />
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

              const banner = Array.isArray(campaign.image_banner)
                ? campaign.image_banner[0]
                : campaign.image_banner;

              const imageUrl = typeof banner === "string" && banner.trim() !== ""
                ? banner.startsWith("http")
                  ? banner
                  : `${IMAGE_BASE_URL}/${banner.replace(/^\/+/, "")}?t=${Date.now()}`
                : "/placeholder.png";

              const campaignIdentifier = campaign.slug || campaign.id;

              return (
                <div
                  key={campaign.id}
                  className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(124,57,150,0.15)] border border-[#7C3996]/8 overflow-hidden flex flex-col group transition-shadow hover:shadow-[0_8px_28px_-6px_rgba(124,57,150,0.25)]"
                >
                  <Link href={`/DetailPage?slug=${campaignIdentifier}`} className="block cursor-pointer">
                    <div className="relative h-44">
                      <img
                        src={imageUrl}
                        alt={campaign.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent group-hover:from-black/10 transition-colors"></div>
                      
      
                      
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-extrabold px-2 py-1 rounded-md bg-[#3E1854]/80 backdrop-blur-sm text-[#F3D48A] uppercase tracking-wider">
                          {getCategoryLabel(campaign.category_id)}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col">
                      
                     
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-2">
                        <span className="font-medium text-gray-600 truncate max-w-[140px]">
                          {campaign.full_name || t("beneficiary", "Penerima Manfaat")}
                        </span>
                        <div className="w-3.5 h-3.5 rounded-full bg-[#7C3996] flex items-center justify-center text-white text-[8px] shrink-0">
                          ✓
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                        {renderStatusBadge(campaign.status)}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold line-clamp-2 leading-snug text-[#2A1B33] group-hover:text-[#7C3996] transition-colors">
                        {campaign.title}
                      </h3>

                      {campaign.status === "active" ? (
                        <div className="mt-4">
                          <div className="flex justify-between items-end mb-2">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 font-medium mb-0.5">
                                {t("collected_label", "Terkumpul")}
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-[#5B2A73]">
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
                              <span className="text-sm font-black text-[#5B2A73] bg-[#E8B94A]/15 border border-[#E8B94A]/30 px-2 py-0.5 rounded-md">
                                {progress}%
                              </span>
                            )}
                          </div>

                          {!isUnlimitedTarget && (
                            <div className="w-full bg-[#7C3996]/10 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#7C3996] to-[#E8B94A]"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                            <span className="text-xs text-gray-400 font-medium">
                              {t("time_limit", "Batas Waktu")}
                            </span>
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                                !isUnlimitedTime && (daysLeft as number) <= 5 && (daysLeft as number) > 0
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : "bg-[#FBF8F3] text-gray-600 border border-gray-100"
                              }`}
                            >
                              {isUnlimitedTime ? (
                                <>
                                  <Infinity size={14} className="text-[#7C3996]" />
                                  <span className="text-[#7C3996]">{t("unlimited_time", "Tanpa Batas")}</span>
                                </>
                              ) : (
                                <>
                                  <Clock
                                    size={12}
                                    className={(daysLeft as number) <= 5 && (daysLeft as number) > 0 ? "text-red-500" : "text-gray-400"}
                                  />
                                  {(daysLeft as number) > 0
                                    ? `${t("remaining", "Sisa")} ${daysLeft} ${t("days", "Hari")}`
                                    : t("has_ended", "Berakhir")}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-2.5">
                          <Clock size={14} className="text-amber-500" />
                          <p className="text-xs text-amber-700 font-medium">
                            {t("under_review_desc", "Program ini sedang ditinjau oleh Admin.")}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}

            {visibleCount < filteredCampaigns.length && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="w-full py-4 bg-gradient-to-r from-[#7C3996] to-[#5B2A73] hover:brightness-110 text-white rounded-2xl font-bold text-sm shadow-md shadow-[#7C3996]/20 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                Muat Lebih Banyak ({filteredCampaigns.length - visibleCount} program lainnya)
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-[#7C3996]/8 rounded-full flex items-center justify-center mb-4">
              <Heart size={32} className="text-[#7C3996]/40" />
            </div>
            <h3 className="text-[#2A1B33] font-bold text-lg">
              {t("no_active_programs", "Belum Ada Program")}
            </h3>
            <p className="text-gray-500 text-sm mt-2 px-10 leading-relaxed">
              {t("no_active_programs_desc", "Saat ini belum ada program yang berjalan.")}
            </p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}