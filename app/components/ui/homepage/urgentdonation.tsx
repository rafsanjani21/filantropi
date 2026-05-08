"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UrgentCard from "./urgentcard"; 
import { ChevronRight } from "lucide-react";
import { AuthService } from "@/lib/auth.service"; 
import { useTranslation } from "react-i18next"; // 🔥 1. Import i18n

export default function UrgentDonation() {
  const { t } = useTranslation(); // 🔥 2. Panggil fungsi t()
  
  const [urgentCampaigns, setUrgentCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const calculateDaysLeft = (endDateStr: string) => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // 🔥 3. Kategori diganti dengan i18n keys
  const getCategoryName = (id: number) => {
    const categoryMap: Record<number, string> = {
      1: t("cat_health"),
      2: t("cat_education"),
      3: t("cat_disaster"),
      4: t("cat_humanity"),
      5: t("cat_orphanage"),
    };
    return categoryMap[id] || t("cat_general");
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
            return daysLeft > 0 && daysLeft < 6;
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

  if (urgentCampaigns.length === 0) {
    return null; 
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end px-6 mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          {t("urgent_donation_title")} {/* 🔥 4. Ubah judul */}
        </h2>
        <Link href="/DonasiPage" className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center transition-colors">
          {t("see_all")} <ChevronRight className="w-4 h-4 ml-0.5" /> {/* 🔥 5. Ubah teks link */}
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-8 px-6 w-full snap-x snap-mandatory">
        {urgentCampaigns.map((campaign) => {
          const target = campaign.target_amount || 1;
          const collected = campaign.current_amount || 0;
          const progressRaw = (collected / target) * 100;
          const progress = progressRaw > 100 ? 100 : Math.round(progressRaw);
          
          const daysLeft = calculateDaysLeft(campaign.end_date);

          const imageUrl = campaign.image_banner 
            ? (campaign.image_banner.startsWith('http') ? campaign.image_banner : `${IMAGE_BASE_URL}/${campaign.image_banner.replace(/^\/+/, '')}?t=${Date.now()}`)
            : "/bencana.png";

          return (
            <UrgentCard
              key={campaign.id}
              id={campaign.slug || campaign.id}
              image={imageUrl}
              foundation={campaign.full_name || t("beneficiary")} // 🔥 6. Ubah teks fallback nama
              title={campaign.title}
              collected={`${collected} FCC`}
              target={`${target} FCC`}
              progress={progress}
              daysLeft={daysLeft}
              category={getCategoryName(campaign.category_id)}
              walletAddress={campaign.wallet_address || campaign.user?.wallet_address} 
            />
          );
        })}
      </div>
    </div>
  );
}