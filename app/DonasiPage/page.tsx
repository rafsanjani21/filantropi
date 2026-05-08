"use client";

import "@/lib/i18n";
import { useState, useEffect } from "react";
import { ArrowLeft, Search, ListFilter } from "lucide-react";
import Link from "next/link";
import CampaignCard from "../components/ui/donasi/campaigncard";
import { AuthService } from "@/lib/auth.service";
import { useTranslation } from "react-i18next";

export default function DonasiPage() {
  const [search, setSearch] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const calculateDaysLeft = (endDateStr: string) => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getCategoryName = (campaign: any) => {
    if (campaign.category?.name) return campaign.category.name;
    if (campaign.category_name) return campaign.category_name;
    
    const categoryMap: Record<number, string> = {
      1: t("cat_health"),
      2: t("cat_education"),
      3: t("cat_disaster"),
      4: t("cat_humanity"),
      5: t("cat_orphanage"),
    };
    
    return categoryMap[campaign.category_id] || t("cat_general");
  };

  useEffect(() => {
    const fetchAllCampaigns = async () => {
      setLoading(true);
      try {
        const res = await AuthService.getCampaigns();
        const data = res.data || res;
        
        if (Array.isArray(data)) {
          setCampaigns(data);
        } else {
          setCampaigns([]);
        }
      } catch (error) {
        console.error("Gagal mengambil daftar campaign:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCampaigns();
  }, []);

  const processedCampaigns = campaigns
    .filter((c) => (c.title || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const daysA = calculateDaysLeft(a.end_date);
      const daysB = calculateDaysLeft(b.end_date);

      if (daysA > 0 && daysB > 0) return daysA - daysB;
      if (daysA > 0 && daysB <= 0) return -1;
      if (daysA <= 0 && daysB > 0) return 1;

      return 0;
    });

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-linear-to-b from-[#7C3996] to-[#b359d4] flex flex-col pb-10">
      
      <div className="sticky top-0 z-20 bg-[#7C3996]/90 backdrop-blur-md px-6 py-5 flex items-center gap-4">
        <Link href="/" className="p-2 -ml-2 text-white active:scale-95 transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-white">{t("donation_program")}</h1>
      </div>

      <div className="px-6 py-4 flex flex-col gap-3">
        <div className="flex bg-white items-center px-4 py-3 rounded-2xl shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-purple-300 transition-all">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_campaign_placeholder")}
            className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2 px-1">
          <ListFilter size={14} className="text-white/80" />
          <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
            {t("sort_most_urgent")}
          </span>
        </div>
      </div>

      <div className="px-6 flex flex-col gap-5 mt-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
             <p className="text-sm font-bold text-white animate-pulse">{t("syncing_data")}</p>
          </div>
        ) : processedCampaigns.length > 0 ? (
          processedCampaigns.map((campaign) => {
            const collected = campaign.current_amount || 0;
            const target = campaign.target_amount || 1; 
            const progressRaw = (collected / target) * 100;
            const progress = progressRaw > 100 ? 100 : Math.round(progressRaw);
            const daysLeft = calculateDaysLeft(campaign.end_date);
            const categoryName = getCategoryName(campaign);

            const imageUrl = campaign.image_banner 
              ? (campaign.image_banner.startsWith('http') ? campaign.image_banner : `${IMAGE_BASE_URL}/${campaign.image_banner.replace(/^\/+/, '')}`)
              : "/bencana.png"; 

            return (
              <CampaignCard
                key={campaign.id}
                id={campaign.slug || campaign.id}
                image={imageUrl}
                foundation={campaign.full_name || t("beneficiary")}
                title={campaign.title}
                collected={`${collected}`}
                target={`${campaign.target_amount}`}
                progress={progress}
                daysLeft={daysLeft}
                category={categoryName}
                walletAddress={campaign.wallet_address || campaign.user?.wallet_address || campaign.beneficiary?.wallet_address}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 mt-4">
            <Search size={28} className="text-white mb-4 opacity-70" />
            <h3 className="text-white font-bold text-lg mb-1">{t("not_found")}</h3>
            <p className="text-purple-100 text-sm px-4">{t("try_other_keywords")}</p>
          </div>
        )}
      </div>
    </div>
  );
}