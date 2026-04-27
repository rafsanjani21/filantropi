"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, ListFilter } from "lucide-react";
import Link from "next/link";
import CampaignCard from "../components/ui/donasi/campaigncard";
import { AuthService } from "@/lib/auth.service";

export default function DonasiPage() {
  const [search, setSearch] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
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

  // --- FUNGSI PENERJEMAH KATEGORI ---
  const getCategoryName = (campaign: any) => {
    // Jika backend suatu saat sudah mengirimkan nama kategorinya langsung
    if (campaign.category?.name) return campaign.category.name;
    if (campaign.category_name) return campaign.category_name;
    
    // Jika backend hanya mengirim category_id berupa angka (Fallback)
    // SESUAIKAN TEKS INI DENGAN DATA DATABASE ANDA
    const categoryMap: Record<number, string> = {
      1: "Kesehatan",
      2: "Pendidikan",
      3: "Bencana Alam",
      4: "Kemanusiaan",
      5: "Panti Asuhan",
    };
    
    return categoryMap[campaign.category_id] || "Umum";
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
    <div className="min-h-screen w-full max-w-md mx-auto bg-linear-to-b from-[#7C3996] to-[#E5AFE7] flex flex-col pb-10">
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#7C3996]/90 backdrop-blur-md px-6 py-5 flex items-center gap-4">
        <Link href="/" className="p-2 -ml-2 text-white active:scale-95 transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-white">Program Donasi</h1>
      </div>

      {/* Search & Sort Indicator */}
      <div className="px-6 py-4 flex flex-col gap-3">
        <div className="flex bg-white items-center px-4 py-3 rounded-2xl shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-purple-300 transition-all">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul program..."
            className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2 px-1">
          <ListFilter size={14} className="text-white/80" />
          <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
            Urutan: Paling Mendesak
          </span>
        </div>
      </div>

      {/* List Campaign */}
      <div className="px-6 flex flex-col gap-5 mt-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
             <p className="text-sm font-bold text-white animate-pulse">Sinkronisasi data...</p>
          </div>
        ) : processedCampaigns.length > 0 ? (
          processedCampaigns.map((campaign) => {
            const collected = campaign.current_amount || 0;
            const target = campaign.target_amount || 1; 
            const progressRaw = (collected / target) * 100;
            const progress = progressRaw > 100 ? 100 : Math.round(progressRaw);
            const daysLeft = calculateDaysLeft(campaign.end_date);
            
            // Dapatkan nama kategori
            const categoryName = getCategoryName(campaign);

            const imageUrl = campaign.image_banner 
              ? (campaign.image_banner.startsWith('http') ? campaign.image_banner : `${IMAGE_BASE_URL}/${campaign.image_banner.replace(/^\/+/, '')}`)
              : "/bencana.png"; 

            return (
              <CampaignCard
                key={campaign.id}
                id={campaign.slug || campaign.id}
                image={imageUrl}
                foundation={campaign.full_name || "Penerima Manfaat"}
                title={campaign.title}
                collected={`${collected} FCC`}
                target={`${campaign.target_amount} FCC`}
                progress={progress}
                daysLeft={daysLeft}
                category={categoryName} // <--- KIRIM KATEGORI KE UI
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 mt-4">
            <Search size={28} className="text-white mb-4 opacity-70" />
            <h3 className="text-white font-bold text-lg mb-1">Tidak Ditemukan</h3>
            <p className="text-purple-100 text-sm px-4">Coba cari dengan kata kunci lain.</p>
          </div>
        )}
      </div>
    </div>
  );
}