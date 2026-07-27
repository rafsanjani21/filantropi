"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Clock, CheckCircle2, Infinity } from "lucide-react";
import { AuthService } from "@/lib/auth.service";
import { useTranslation } from "react-i18next";

type Campaign = {
  id: string | number;
  slug?: string;
  title: string;
  full_name?: string;
  category_id: number;
  target_amount?: number | null;
  current_amount_idr?: number | null;
  end_date?: string | null;
  status?: string;
  image_banner?: string | string[];
};

export default function LatestPrograms() {
  const { t } = useTranslation();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const calculateDaysLeft = (endDateStr: string | null | undefined) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getCategoryName = (id: number) => {
    const categoryMap: Record<number, string> = {
      1: t("cat_education", "Pendidikan"),
      2: t("cat_health", "Kesehatan"),
      3: t("cat_disaster", "Bencana Alam"),
      4: t("cat_mosque", "Ekonomi"),
      5: t("cat_general", "Umum"),
    };
    return categoryMap[id] || t("cat_general", "Umum");
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const res = await AuthService.getCampaigns();
        const data = res.data || res;

        if (Array.isArray(data)) {
          const activeData = data
            .filter((campaign) => {
              const daysLeft = calculateDaysLeft(campaign.end_date);
              const isUnlimitedTime = daysLeft === null;
              return (
                campaign.status === "active" &&
                (isUnlimitedTime || (daysLeft !== null && daysLeft >= 6))
              );
            })
            // --- TAMBAHKAN LOGIKA SORTING DI SINI ---
            .sort((a, b) => {
              const amountA = Number(a.current_amount_idr) || 0;
              const amountB = Number(b.current_amount_idr) || 0;
              return amountB - amountA; // Nominal terbesar berada di paling awal
            })
            // ----------------------------------------
            .slice(0, 5); // Tampilkan 5 program saja agar tidak berat

          setCampaigns(activeData);
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data program terbaru:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="w-full px-6 flex flex-col gap-4 animate-pulse mb-8">
        <div className="h-6 w-48 bg-[#7C3996]/10 rounded-md mb-2"></div>
        <div className="flex gap-4 overflow-hidden">
          <div className="min-w-[85%] h-64 bg-[#7C3996]/10 rounded-3xl"></div>
          <div className="min-w-[85%] h-64 bg-[#7C3996]/10 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) return null;

  return (
    <div className="w-full">
      {/* Header dengan Title dan "Lihat Semua" */}
      <div className="flex justify-between items-end mb-4 px-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8B94A]">
            {t("curated_eyebrow", "Terverifikasi")}
          </span>
          <h2 className="text-lg font-bold text-[#2A1B33] leading-tight">
            {t("latest_programs", "Program Pilihan")}
          </h2>
        </div>
        <Link
          href="/AllProgramsPage"
          className="text-sm font-bold text-[#7C3996] hover:text-[#5B2A73] flex items-center transition-colors"
        >
          {t("see_all", "Lihat Semua")}{" "}
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      {/* Daftar Program */}
      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-8 px-6 w-full snap-x snap-mandatory">
        {campaigns.map((campaign) => {
          const collected = Number(campaign.current_amount_idr) || 0;
          const daysLeft = calculateDaysLeft(campaign.end_date);

          const isUnlimitedTarget =
            !campaign.target_amount || campaign.target_amount === 0;
          const isUnlimitedTime = daysLeft === null;

          const target = isUnlimitedTarget ? 1 : Number(campaign.target_amount);
          const progressRaw = (collected / target) * 100;
          const progress = progressRaw > 100 ? 100 : Math.round(progressRaw);

          const banner = Array.isArray(campaign.image_banner)
            ? campaign.image_banner[0]
            : campaign.image_banner;

          const imageUrl =
            typeof banner === "string" && banner.trim() !== ""
              ? banner.startsWith("http")
                ? banner
                : `${IMAGE_BASE_URL}/${banner.replace(/^\/+/, "")}?t=${Date.now()}`
              : "/placeholder.png";

          return (
            <Link
              href={`/DetailPage?slug=${campaign.slug || campaign.id}`}
              key={campaign.id}
              className="w-[85vw] max-w-[320px] h-[400px] shrink-0 snap-center bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(124,57,150,0.15)] border border-[#7C3996]/8 overflow-hidden flex flex-col group transition-shadow hover:shadow-[0_8px_28px_-6px_rgba(124,57,150,0.25)] cursor-pointer"
            >
              <div className="relative w-full h-[160px] shrink-0 overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={campaign.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent group-hover:from-black/10 transition-colors z-10"></div>
              </div>

              <div className="p-5 flex flex-col justify-between h-[240px] relative z-20 bg-white">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-2">
                    <span className="font-medium text-gray-600 truncate max-w-[180px]">
                      {campaign.full_name ||
                        t("beneficiary", "Penerima Manfaat")}
                    </span>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#7C3996] flex items-center justify-center text-white text-[8px] shrink-0">
                      ✓
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 z-20">
                    <span className="text-[9px] font-extrabold px-2 py-1 rounded-md bg-[#3E1854]/80 backdrop-blur-sm text-[#F3D48A] uppercase tracking-wider">
                      {getCategoryName(campaign.category_id)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold line-clamp-2 leading-snug text-[#2A1B33] group-hover:text-[#7C3996] transition-colors">
                    {campaign.title}
                  </h3>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium mb-0.5">
                        {t("collected_label", "Terkumpul")}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-[#5B2A73]">
                          Rp {collected.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {!isUnlimitedTarget && (
                      <span className="text-sm font-black text-[#5B2A73] bg-[#E8B94A]/15 px-2 py-0.5 rounded-md border border-[#E8B94A]/30">
                        {progress}%
                      </span>
                    )}
                  </div>

                  {!isUnlimitedTarget && (
                    <div className="w-full bg-[#7C3996]/10 h-2.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#7C3996] to-[#E8B94A]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <div
                    className={`flex justify-between items-center ${
                      isUnlimitedTarget
                        ? "mt-2"
                        : "mt-3 pt-3 border-t border-gray-50"
                    }`}
                  >
                    <span className="text-xs text-gray-400 font-medium">
                      {t("time_limit", "Batas Waktu")}
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#FBF8F3] text-gray-600 border border-gray-100">
                      {isUnlimitedTime ? (
                        <>
                          <Infinity size={14} className="text-[#7C3996]" />
                          <span className="text-[#7C3996]">
                            {t("unlimited_time", "Tanpa Batas")}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} className="text-gray-400" />
                          {(daysLeft as number) > 0
                            ? `${t("remaining", "Sisa")} ${daysLeft} ${t("days", "Hari")}`
                            : t("has_ended", "Berakhir")}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}