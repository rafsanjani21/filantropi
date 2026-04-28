"use client";

import { useState, useEffect } from "react";
// 1. Tambahkan useRouter dari next/navigation
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import { 
  ArrowLeft, Plus, Clock, CheckCircle2, XCircle, 
  AlertCircle, Share2, Edit3, Heart, Wallet 
} from "lucide-react";
import { AuthService } from "@/lib/auth.service";

const truncateWallet = (address: string) => {
  if (!address) return "Belum diatur";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function ProgramPage() {
  // 2. Inisialisasi router
  const router = useRouter(); 
  
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const IMAGE_BASE_URL = "http://192.168.52.29:8080";

  useEffect(() => {
    const fetchMyCampaigns = async () => {
      setLoading(true);
      try {
        const res = await AuthService.getMyCampaigns();
        const data = res.data || res;
        
        if (Array.isArray(data)) {
          setCampaigns(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data program saya:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCampaigns();
  }, []);

  const handleShare = (campaignTitle: string) => {
    if (navigator.share) {
      navigator.share({
        title: campaignTitle,
        text: `Ayo bantu kampanye kebaikan ini: ${campaignTitle}`,
        url: window.location.origin + "/DonasiPage",
      });
    } else {
      alert("Tautan kampanye berhasil disalin!");
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg border border-green-100 shadow-sm">
            <CheckCircle2 size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">Aktif</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg border border-red-100 shadow-sm">
            <XCircle size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">Ditolak</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-100 shadow-sm">
            <Clock size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">Menunggu</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 pb-24">
      
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-linear-to-r from-[#7C3996] to-[#E5AFE7] shadow-lg rounded-b-3xl">
        <nav className="px-6 pt-8 pb-6 flex items-center justify-between text-white">
          
          {/* 3. UBAH DI SINI: Gunakan <button> dengan router.back() */}
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-lg font-bold tracking-tight">Program Saya</h1>
          
          <Link href="/GalangPage" className="w-10 h-10 flex items-center justify-center bg-white text-purple-600 rounded-full shadow-md active:scale-95 transition-all">
            <Plus size={20} />
          </Link>
        </nav>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-5">
        {loading ? (
          [1, 2].map((i) => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100 shadow-sm" />
          ))
        ) : campaigns.length > 0 ? (
          campaigns.map((campaign) => {
            const target = campaign.target_amount || 1;
            const collected = campaign.current_amount || 0;
            const progress = Math.min(Math.round((collected / target) * 100), 100);
            
            const imageUrl = campaign.image_banner 
              ? (campaign.image_banner.startsWith('http') ? campaign.image_banner : `${IMAGE_BASE_URL}/${campaign.image_banner.replace(/^\/+/, '')}`)
              : "/placeholder.png";

            return (
              <div key={campaign.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group transition-shadow hover:shadow-md">
                
                {/* --- AREA YANG BISA DIKLIK UNTUK MELIHAT DETAIL --- */}
                <Link 
                  href={`/DetailPage?id=${campaign.slug || campaign.id}`} 
                  className="block cursor-pointer"
                >
                  {/* Banner & Status Overlay */}
                  <div className="relative h-40">
                    <img src={imageUrl} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute top-3 left-3">
                      {renderStatusBadge(campaign.status)}
                    </div>
                  </div>

                  <div className="px-5 pt-5 pb-2">
                    <h3 className="font-bold text-gray-800 text-base line-clamp-2 mb-3 leading-snug group-hover:text-purple-600 transition-colors">
                      {campaign.title}
                    </h3>

                    {/* --- INFO DOMPET PENERIMA --- */}
                    <div className="flex items-center justify-between bg-purple-50 px-3 py-2.5 rounded-xl mb-4 border border-purple-100/50">
                      <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-purple-600 shrink-0" />
                        <span className="text-[10px] font-bold text-purple-800 uppercase tracking-tight">Dompet</span>
                      </div>
                      <span className="text-[11px] font-mono text-purple-600 font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-purple-100">
                        {truncateWallet(campaign.wallet_address || campaign.user?.wallet_address)}
                      </span>
                    </div>

                    {/* Conditional Status Rendering */}
                    {campaign.status === 'active' ? (
                      <div className="space-y-3 mb-3">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Terkumpul</span>
                            <span className="text-sm font-black text-purple-600">{collected} FCC <span className="text-[10px] text-gray-400 font-normal">/ {target} FCC</span></span>
                          </div>
                          {/* --- INFO PERSENTASE --- */}
                          <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 shadow-sm">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    ) : campaign.status === 'rejected' ? (
                      <div className="mb-3 p-3 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-2.5">
                        <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <p className="text-[10px] font-black text-red-700 uppercase">Ditolak:</p>
                          <p className="text-xs text-red-600 leading-tight">
                            {campaign.rejection_reason || "Data tidak sesuai ketentuan. Silakan hubungi admin."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-2.5">
                        <Clock size={14} className="text-amber-500" />
                        <p className="text-xs text-amber-700 font-medium">Sedang dalam proses tinjauan Admin.</p>
                      </div>
                    )}
                  </div>
                </Link>

                {/* --- AREA TOMBOL AKSI (Kelola & Bagikan) --- */}
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => campaign.status === 'active' ? handleShare(campaign.title) : null}
                      disabled={campaign.status !== 'active'}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition ${
                        campaign.status === 'active' 
                          ? 'bg-purple-50 text-purple-600 hover:bg-purple-100 active:scale-95' 
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Share2 size={16} /> Bagikan
                    </button>
                    
                    <Link 
                      href={`/KelolaProgram?id=${campaign.id}`}
                      className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition active:scale-95"
                    >
                      <Edit3 size={16} /> Kelola
                    </Link>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4">
              <Heart size={32} className="text-purple-300" />
            </div>
            <h3 className="text-gray-800 font-bold text-lg">Belum Ada Program</h3>
            <p className="text-gray-500 text-sm mt-2 px-10 leading-relaxed">
              Anda belum membuat program penggalangan dana. Mulai buat sekarang!
            </p>
            <Link href="/GalangPage" className="mt-6 bg-purple-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-200 active:scale-95 transition-all">
              Buat Program
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}