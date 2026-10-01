"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AuthService } from "@/lib/auth.service";
import { useTranslation } from "react-i18next";
import CampaignCard from "../../components/ui/sharedcomponent/CampaignCard"; 

type Campaign = {
  id: string | number;
  slug?: string;
  title: string;
  full_name?: string;
  category_id: number;
  target_amount?: number | null;
  current_amount?: number | null;
  end_date?: string | null;
  status?: string;
  image_banner?: string | string[];
  is_wakaf?: string | number | boolean;
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
            .sort((a, b) => {
              const amountA = Number(a.current_amount) || 0;
              const amountB = Number(b.current_amount) || 0;
              return amountB - amountA; 
            })
            .slice(0, 5); 

          setCampaigns(activeData);
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data program terbaru:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="w-full px-6 flex flex-col gap-4 animate-pulse mb-8">
        <div className="h-6 w-48 bg-[#7C3996]/10 rounded-md mb-2"></div>
        <div className="flex gap-4 overflow-hidden">
          <div className="min-w-[75%] h-56 bg-[#7C3996]/10 rounded-2xl"></div>
          <div className="min-w-[75%] h-56 bg-[#7C3996]/10 rounded-2xl"></div>
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

      {/* Daftar Program Menggunakan Universal Card */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 px-6 w-full snap-x snap-mandatory">
        {campaigns.map((campaign) => (
          <CampaignCard 
            key={campaign.id}
            campaign={campaign as any}
            variant="carousel"
            getCategoryLabel={getCategoryName}
            t={t}
            IMAGE_BASE_URL={IMAGE_BASE_URL}
          />
        ))}
      </div>
    </div>
  );
}