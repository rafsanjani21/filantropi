"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // <-- Import useRouter
import { 
  ArrowLeft, Plus, Clock, CheckCircle2, XCircle, 
  AlertCircle, Share2, Edit3, Heart 
} from "lucide-react";
import { AuthService } from "@/lib/auth.service";

export default function ProgramPage() {
  const router = useRouter(); // <-- Inisialisasi router
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // BASE_URL Backend Anda untuk merender gambar
  const IMAGE_BASE_URL = "http://192.168.52.29:8080";

  useEffect(() => {
    const fetchMyCampaigns = async () => {
      setLoading(true);
      try {
        const res = await AuthService.getMyCampaigns();
        // Sesuaikan dengan struktur respons Golang Anda
        const data = res.data || res;
        
        if (Array.isArray(data)) {
          setCampaigns(data);
        } else {
          setCampaigns([]);
        }
      } catch (error: any) {
        console.error("Gagal mengambil data program saya:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCampaigns();
  }, []);

  // Fungsi untuk membagikan tautan kampanye
  const handleShare = (campaignTitle: string) => {
    if (navigator.share) {
      navigator.share({
        title: campaignTitle,
        text: `Ayo bantu kampanye kebaikan ini: ${campaignTitle}`,
        url: window.location.origin + "/DonasiPage", // Sesuaikan URL
      });
    } else {
      alert("Tautan kampanye berhasil disalin!");
    }
  };

  // --- FUNGSI HELPER UNTUK BADGE STATUS ---
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
      default: // Menangani status 'pending' atau kosong
        return (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-100 shadow-sm">
            <Clock size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">Menunggu</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 pb-20 relative">
      
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-40 bg-linear-to-r from-[#7C3996] to-[#E5AFE7] shadow-lg rounded-b-3xl">
        <nav className="px-6 pt-8 pb-4 flex items-center justify-between">
          
          {/* TOMBOL BACK DINAMIS (Diperbaiki) */}
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-lg text-white font-bold tracking-wide drop-shadow-md">
            Program Saya
          </h1>
          <Link 
            href="/GalangPage"
            className="w-10 h-10 flex items-center justify-center bg-white text-purple-600 rounded-full hover:bg-gray-100 transition-all active:scale-95 shadow-md"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </nav>

        {/* DASHBOARD SUMMARY (STATISTIK SINGKAT) */}
        <div className="px-6 pb-6 pt-2">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 flex justify-between items-center text-white">
            <div className="flex flex-col">
              <span className="text-sm opacity-90">Total Program</span>
              <span className="text-2xl font-black">{campaigns.length}</span>
            </div>
            <div className="h-10 w-[1px] bg-white/30"></div>
            <div className="flex flex-col items-end">
              <span className="text-sm opacity-90">Program Aktif</span>
              <span className="text-2xl font-black">
                {campaigns.filter(c => c.status === 'active').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DAFTAR KAMPANYE */}
      <div className="px-6 pt-6 flex-1 flex flex-col gap-5">
        {loading ? (
          // SKELETON LOADING
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                <div className="w-full h-32 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 w-3/4 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          campaigns.map((campaign) => {
            // Pengolahan data aman
            const target = campaign.target_amount || 1;
            const collected = campaign.current_amount || 0;
            const progressRaw = (collected / target) * 100;
            const progress = progressRaw > 100 ? 100 : Math.round(progressRaw);
            
            const imageUrl = campaign.image_banner 
              ? (campaign.image_banner.startsWith('http') ? campaign.image_banner : `${IMAGE_BASE_URL}/${campaign.image_banner.replace(/^\/+/, '')}`)
              : "/placeholder.png";

            return (
              <div key={campaign.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                
                {/* --- AREA LINK KE DETAIL PAGE --- */}
                <Link href={`/DetailPage?id=${campaign.slug || campaign.id}`} className="block cursor-pointer">
                  {/* Banner Image & Status */}
                  <div className="h-36 w-full relative bg-gray-200 overflow-hidden">
                    <img src={imageUrl} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    
                    {/* Badge Status (Kiri Atas) */}
                    <div className="absolute top-3 left-3">
                      {renderStatusBadge(campaign.status)}
                    </div>

                    {/* Badge Progress (Kanan Atas) - Tampil hanya jika aktif */}
                    {campaign.status === 'active' && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Heart size={14} className="text-red-500 fill-red-500" />
                        <span className="text-xs font-bold text-gray-800">{progress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content (Bagian Atas) */}
                  <div className="px-5 pt-5 pb-2">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight mb-4 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {campaign.title}
                    </h3>
                    
                    {/* --- CONDITIONAL RENDERING BERDASARKAN STATUS --- */}
                    {campaign.status === 'active' ? (
                      <>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center mb-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Terkumpul</span>
                            <span className="text-sm font-black text-purple-600">{collected} FCC</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Target</span>
                            <span className="text-sm font-bold text-gray-700">{target} FCC</span>
                          </div>
                        </div>
                      </>
                    ) : campaign.status === 'rejected' ? (
                      <div className="mb-3 p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2.5">
                        <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <p className="text-[10px] font-black text-red-700 uppercase">Alasan Ditolak:</p>
                          <p className="text-xs text-red-600 leading-tight">
                            {campaign.rejection_reason || "Data tidak sesuai dengan ketentuan platform. Silakan edit dan ajukan kembali."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2.5">
                        <Clock size={14} className="text-amber-500" />
                        <p className="text-xs text-amber-700 font-medium">Program Anda sedang dalam antrean verifikasi Admin.</p>
                      </div>
                    )}
                  </div>
                </Link>

                {/* --- AREA TOMBOL AKSI (Kelola & Bagikan) --- */}
                {/* Diletakkan di luar tag Link agar tidak saling bertumpuk (nested link error) */}
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
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200 mt-4 px-6">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-purple-400" />
            </div>
            <h3 className="text-gray-800 font-extrabold text-xl mb-2">Belum Ada Program</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Anda belum membuat program penggalangan dana apapun. Mulai tebarkan kebaikan hari ini!
            </p>
            <Link 
              href="/GalangPage"
              className="bg-purple-600 text-white font-bold py-3.5 px-8 rounded-full shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] hover:shadow-lg hover:-translate-y-1 transition-all active:scale-95"
            >
              Buat Program Baru
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}