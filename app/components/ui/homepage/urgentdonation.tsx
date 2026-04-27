"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UrgentCard from "./urgentcard"; // Pastikan path ini benar
import { ChevronRight } from "lucide-react";
import { AuthService } from "@/lib/auth.service"; // Pastikan path ini benar

export default function UrgentDonation() {
  const [urgentCampaigns, setUrgentCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const IMAGE_BASE_URL = "http://192.168.52.29:8080";

  // RUMUS MENGHITUNG SISA HARI
  const calculateDaysLeft = (endDateStr: string) => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getCategoryName = (id: number) => {
  const categoryMap: Record<number, string> = {
    1: "Kesehatan",
    2: "Pendidikan",
    3: "Bencana Alam",
    4: "Kemanusiaan",
    5: "Panti Asuhan",
  };
  return categoryMap[id] || "Umum";
};

  useEffect(() => {
    const fetchUrgentCampaigns = async () => {
      try {
        setLoading(true);
        const res = await AuthService.getCampaigns();
        const data = res.data || res;

        if (Array.isArray(data)) {
          // FILTER: Hanya ambil yang sisa harinya < 6 DAN masih belum kadaluarsa (> 0)
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

  // Jika sedang loading, berikan efek skeleton/teks ringan
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

  // Jika tidak ada kampanye yang mendesak, hilangkan seluruh blok ini (Lebih rapi)
  if (urgentCampaigns.length === 0) {
    return null; 
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end px-6 mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Penggalangan Dana Mendesak
        </h2>
        <Link href="/DonasiPage" className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center transition-colors">
          Lihat Semua <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-8 px-6 w-full snap-x snap-mandatory">
        {urgentCampaigns.map((campaign) => {
          // Hitung logika persentase aman
          const target = campaign.target_amount || 1;
          const collected = campaign.current_amount || 0;
          const progressRaw = (collected / target) * 100;
          const progress = progressRaw > 100 ? 100 : Math.round(progressRaw);
          
          const daysLeft = calculateDaysLeft(campaign.end_date);

          // Render gambar dinamis
          const imageUrl = campaign.image_banner 
            ? (campaign.image_banner.startsWith('http') ? campaign.image_banner : `${IMAGE_BASE_URL}/${campaign.image_banner.replace(/^\/+/, '')}`)
            : "/bencana.png";

          return (
  <UrgentCard
    key={campaign.id}
    id={campaign.slug || campaign.id}
    image={imageUrl}
    foundation={campaign.full_name || "Penerima Manfaat"}
    title={campaign.title}
    collected={`${collected} FCC`}
    target={`${target} FCC`}
    progress={progress}
    daysLeft={daysLeft}
    category={getCategoryName(campaign.category_id)} // <--- Tambahkan ini
  />
);
        })}
      </div>
    </div>
  );
}