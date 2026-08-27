"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UrgentCard from "./urgentcard"; 
import { ChevronRight } from "lucide-react";
import { AuthService } from "@/lib/auth.service"; 
import { useTranslation } from "react-i18next"; 

type Campaign = {
  id: string | number;
  slug?: string;
  title: string;
  full_name?: string;
  category_id: number;
  target_amount?: number | null;
  current_amount?: number | null;
  end_date?: string | null;
  image_banner?: string | string[]; 
};

export default function UrgentDonation() {
  const { t } = useTranslation(); 
  
  const [urgentCampaigns, setUrgentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  // 🔥 Logika menghitung hari dengan penanganan NULL
  const calculateDaysLeft = (endDateStr: string | null | undefined) => {
    if (!endDateStr) return null; // null = Unlimited Time
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
    const fetchUrgentCampaigns = async () => {
      try {
        setLoading(true);
        const res = await AuthService.getCampaigns();
        const data = res.data || res;

        if (Array.isArray(data)) {
          const urgentData = data.filter((campaign) => {
            const daysLeft = calculateDaysLeft(campaign.end_date);
            // 🔥 HANYA TAMPIL JIKA daysLeft BUKAN NULL (Ada batas waktunya)
            return daysLeft !== null && daysLeft > 0 && daysLeft < 6;
          });

          setUrgentCampaigns(urgentData);
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data urgent:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="w-full px-6 py-8 flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
        <div className="flex gap-4 overflow-hidden">
          <div className="min-w-[280px] h-72 bg-gray-200 rounded-2xl"></div>
          <div className="min-w-[280px] h-72 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (urgentCampaigns.length === 0) return null; 

  return (
    <div className="w-full">
      <div className="flex justify-between items-end px-6 mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          {t("urgent_donation_title", "Donasi Mendesak")} 
        </h2>
        <Link href="/AllProgramsPage" className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center transition-colors">
          {t("see_all", "Lihat Semua")} <ChevronRight className="w-4 h-4 ml-0.5" /> 
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-8 px-6 w-full snap-x snap-mandatory">
        {urgentCampaigns.map((campaign) => {
          const collected = campaign.current_amount || 0;
          const daysLeft = calculateDaysLeft(campaign.end_date) as number; // Dijamin bukan null karena filter
          
          // 🔥 PENGECEKAN UNLIMITED TARGET (Walau waktunya urgent, bisa jadi targetnya bebas)
          const isUnlimitedTarget = !campaign.target_amount || campaign.target_amount === 0;
          const target = isUnlimitedTarget ? 1 : Number(campaign.target_amount);
          
          const progressRaw = (collected / target) * 100;
          const progress = progressRaw > 100 ? 100 : Math.round(progressRaw);

          const banner = Array.isArray(campaign.image_banner) 
            ? campaign.image_banner[0] 
            : campaign.image_banner;

          const imageUrl = typeof banner === "string" && banner.trim() !== ""
            ? (banner.startsWith('http') ? banner : `${IMAGE_BASE_URL}/${banner.replace(/^\/+/, '')}?t=${Date.now()}`)
            : "/bencana.png";

          return (
            <UrgentCard
              key={campaign.id}
              id={campaign.slug || campaign.id}
              image={imageUrl}
              foundation={campaign.full_name || t("beneficiary")} 
              title={campaign.title}
              collected={collected}
              // 🔥 Kirim null ke UrgentCard jika targetnya unlimited
              target={isUnlimitedTarget ? null : target}
              progress={progress}
              daysLeft={daysLeft}
              category={getCategoryName(campaign.category_id)} 
            />
          );
        })}
      </div>
    </div>
  );
}