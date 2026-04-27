"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Share2,
  CheckCircle2,
  Heart,
  Clock,
  AlertCircle,
  XCircle // Tambahkan ini untuk ikon ditolak
} from "lucide-react";
import NavbarDetail from "../components/ui/detail/navbar";
import Link from "next/link";
import { AuthService } from "@/lib/auth.service";
import { useAuth } from "@/hooks/useAuth"; 

function DetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const { getProfile } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const IMAGE_BASE_URL = "http://192.168.52.29:8080";

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        try {
          let profileData;
          try {
            profileData = await getProfile();
          } catch (err) {
            profileData = await getProfile("beneficiary");
          }
          setCurrentUser(profileData);
        } catch (err) {
          console.log("User tidak login atau tamu");
        }

        if (!id) throw new Error("ID Program tidak ditemukan.");
        const res = await AuthService.getCampaignDetail(id);
        setCampaign(res.data || res);
        
      } catch (err: any) {
        setError(err.message || "Gagal mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-purple-600 font-bold animate-pulse">Menyiapkan data...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3 px-6 text-center">
        <AlertCircle size={48} className="text-red-400 mb-2" />
        <h2 className="text-xl font-bold text-gray-800">Ups, Terjadi Kesalahan</h2>
        <p className="text-gray-500">{error || "Data kampanye tidak tersedia."}</p>
        <Link href="/" className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full font-bold">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // Helper & Data Processing
  const title = campaign?.title;
  const foundation = campaign?.full_name || "Penerima Manfaat";
  const collected = campaign?.current_amount || 0;
  const target = campaign?.target_amount || 1;
  const progress = Math.min(Math.round((collected / target) * 100), 100);
  const story = campaign?.story || campaign?.description || "Belum ada cerita.";

  const getCategoryName = (catId: number) => {
    const map: Record<number, string> = { 1: "Kesehatan", 2: "Pendidikan", 3: "Bencana Alam", 4: "Kemanusiaan", 5: "Panti Asuhan" };
    return map[catId] || "Umum";
  };

  const calculateDaysLeft = (date: string) => {
    if (!date) return 0;
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
  const daysLeft = calculateDaysLeft(campaign?.end_date);

  // --- HELPER UNTUK BADGE STATUS ---
  const renderStatusBadge = (status: string, sisaHari: number) => {
    if (status === 'active' && sisaHari <= 0) {
      return (
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 uppercase border border-gray-200 flex items-center gap-1">
          <Clock size={12} /> Berakhir
        </span>
      );
    }
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-100 text-green-700 uppercase border border-green-200 flex items-center gap-1 shadow-sm">
            <CheckCircle2 size={12} /> Aktif
          </span>
        );
      case "rejected":
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-100 text-red-700 uppercase border border-red-200 flex items-center gap-1 shadow-sm">
            <XCircle size={12} /> Ditolak
          </span>
        );
      default: // pending
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 uppercase border border-amber-200 flex items-center gap-1 shadow-sm">
            <Clock size={12} /> Menunggu
          </span>
        );
    }
  };

  const isBeneficiary = currentUser?.role === "beneficiary" || currentUser?.role === "penerima_manfaat";

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50">
      <NavbarDetail />

      {/* Hero Image */}
      <div className="relative w-full h-72 bg-gray-200">
        <img src={campaign?.image_banner?.startsWith("http") ? campaign.image_banner : `${IMAGE_BASE_URL}/${campaign?.image_banner?.replace(/^\/+/, "")}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative -mt-8 w-full bg-white rounded-t-4xl flex flex-col z-10 pb-28 shadow-xl">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2" />

        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-purple-600">{foundation}</span>
              <CheckCircle2 className="w-4 h-4 text-sky-500" />
            </div>
            
            {/* --- AREA BADGE (KATEGORI & STATUS) --- */}
            <div className="flex items-center gap-2">
              {renderStatusBadge(campaign?.status, daysLeft)}
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 uppercase border border-purple-200 shadow-sm shrink-0">
                {getCategoryName(campaign.category_id)}
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-800 leading-snug mb-4">{title}</h1>

          <div className="w-full">
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium mb-0.5">Terkumpul</span>
                <span className="text-lg font-bold text-purple-700">{collected} FCC <span className="text-xs text-gray-400 font-normal">/ {target} FCC</span></span>
              </div>
              <span className="text-sm font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>

            {/* --- INFO SISA HARI (Dikembalikan) --- */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${daysLeft > 0 ? 'text-orange-600 bg-orange-50 border border-orange-100' : 'text-gray-500 bg-gray-100 border border-gray-200'}`}>
                <Clock size={14} className="shrink-0" />
                {daysLeft > 0 ? `Sisa ${daysLeft} Hari Lagi` : 'Program Telah Berakhir'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Informasi Penggalang Dana</h2>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl border border-purple-200 uppercase">
                {foundation.charAt(0)}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                  {foundation} <CheckCircle2 className="w-3 h-3 text-sky-500" />
                </p>
                <p className="text-xs text-gray-500">Organisasi Terverifikasi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Cerita Penggalangan Dana</h2>
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{story}</div>
        </div>
      </div>

      {/* --- FIXED BOTTOM BAR --- */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="bg-white/90 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex gap-3 shadow-2xl">
          
          <button
            onClick={() => navigator.share ? navigator.share({ title, url: window.location.href }) : alert("Tautan disalin!")}
            className={`flex items-center justify-center gap-2 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-95 ${
              isBeneficiary ? "w-full" : "w-1/3"
            }`}
          >
            <Share2 className="w-5 h-5" />
            Bagikan
          </button>

          {/* Tombol Donasi (Hanya bisa diklik jika status aktif DAN sisa hari > 0) */}
          {!isBeneficiary && (
            <Link
              href={`/FormDonasi?id=${campaign.id}`}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 w-2/3 font-bold transition-all active:scale-95 text-center ${
                campaign?.status === 'active' && daysLeft > 0 
                  ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200" 
                  : "bg-gray-200 text-gray-400 pointer-events-none"
              }`}
            >
              <Heart className={`w-5 h-5 ${campaign?.status === 'active' && daysLeft > 0 ? "fill-white/20" : "fill-gray-300"}`} />
              {campaign?.status !== 'active' ? "Belum Aktif" : (daysLeft > 0 ? "Donasi Sekarang" : "Telah Berakhir")}
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    }>
      <DetailContent />
    </Suspense>
  );
}