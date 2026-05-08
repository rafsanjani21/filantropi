"use client";

import "@/lib/i18n"; 
import Link from "next/link";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "react-i18next"; 

type CampaignCardProps = {
  id: string | number;
  image: string;
  foundation: string;
  title: string;
  collected: string | number;
  target: string | number;
  progress: number;
  daysLeft: number;
  category: string;
  walletAddress?: string; 
};

export default function CampaignCard({
  id, image, foundation, title, collected, target, progress, daysLeft, category, walletAddress
}: CampaignCardProps) {
  
  const { t } = useTranslation(); 
  
  // 🔥 UBAH 1: Ganti nama state menjadi totalCollectedAmount
  const [totalCollectedAmount, setTotalCollectedAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!walletAddress) return;
    const fetchTotalAmount = async () => {
      try {
        // 🔥 UBAH 2: Tembak ke endpoint /donations/amount/:wallet
        const res = await apiFetch(`/donations/amount/${walletAddress}`, { method: "GET" });
        
        // 🔥 UBAH 3: Ekstrak data dari atribut total_amount
        if (res && res.data && res.data.total_amount !== undefined) {
          setTotalCollectedAmount(parseFloat(res.data.total_amount));
        }
      } catch (e) {
        console.warn("Gagal menarik total donasi di CampaignCard:", e);
      }
    };
    fetchTotalAmount();
  }, [walletAddress]);

  const parsedCollected = typeof collected === 'string' ? parseFloat(collected.replace(/[^\d.-]/g, '')) : collected;
  const parsedTarget = typeof target === 'string' ? parseFloat(target.replace(/[^\d.-]/g, '')) : target;

  // 🔥 UBAH 4: Gunakan state totalCollectedAmount
  const displayCollected = totalCollectedAmount !== null ? totalCollectedAmount : Number(parsedCollected || 0);
  const numTarget = Number(parsedTarget || 1);
  
  const calculateProgress = () => {
    if (numTarget === 0) return 0;
    const percent = (displayCollected / numTarget) * 100;
    if (percent >= 100) return 100;
    if (percent > 99) return percent.toFixed(1);
    return Math.floor(percent);
  };
  const displayProgress = calculateProgress();

  return (
    <Link href={`/DetailPage?slug=${id}`} className="w-full block transition-transform active:scale-95">
      <div className="w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
        <div className="relative w-full h-44">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          {daysLeft > 0 && daysLeft < 6 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
              {t("urgent")}
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <span className="font-medium text-gray-600 truncate max-w-[140px]">{foundation}</span>
              <div className="w-3.5 h-3.5 rounded-full bg-sky-500 flex items-center justify-center text-white text-[8px] shrink-0">✓</div>
            </div>
            <span className="text-[9px] font-extrabold px-2 py-1 rounded-md bg-purple-50 text-purple-600 border border-purple-100 uppercase tracking-wider">
              {category}
            </span>
          </div>

          <h3 className="text-lg font-bold line-clamp-2 leading-snug text-gray-800">{title}</h3>

          <div className="mt-4">
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium mb-0.5">{t("collected_card")}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-purple-700">{displayCollected} FCC</span>
                  <span className="text-[10px] text-gray-400 font-normal">{t("from")} {numTarget} FCC</span>
                </div>
              </div>
              <span className="text-sm font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{displayProgress}%</span>
            </div>

            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
              <div className="h-full bg-purple-700 rounded-full transition-all duration-1000 ease-out" style={{ width: `${displayProgress}%` }} />
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
               <span className="text-xs text-gray-400 font-medium">{t("time_limit")}</span>
               <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${daysLeft <= 5 && daysLeft > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                 <Clock size={12} className={daysLeft <= 5 && daysLeft > 0 ? "text-red-500" : "text-gray-400"} />
                 {daysLeft > 0 ? `${t("remaining")} ${daysLeft} ${t("days")}` : t("has_ended")}
               </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}