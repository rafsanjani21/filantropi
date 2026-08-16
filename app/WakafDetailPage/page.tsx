"use client";

import "@/lib/i18n";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// Anda bisa me-reuse hook dan komponen lain dari folder detail biasa
import { useCampaignDetail } from "../DetailPage/hooks/useCampaignDetail";
import NavbarDetail from "../DetailPage/components/navbar";
import LiveDonationBlink from "../DetailPage/components/LiveDonationBlink";
import CampaignBanner from "../DetailPage/components/CampaignBanner";
import CampaignHeader from "../DetailPage/components/CampaignHeader";
import CampaignStory from "../DetailPage/components/CampaignStory";

import WakafPaymentModal from "./components/WakafPaymentModal";
import WakafBottomBar from "./components/WakafBottomBar";

function WakafDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug");

  const { campaign, loading, error, walletHistory, totalCollected, user } = useCampaignDetail(slug);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // LOGIKA PROTEKSI LOGIN: Wajib Login untuk Wakaf
  const handleWakafClick = () => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    
    // Jika tidak ada token atau user tidak terdeteksi
    if (!token || !user) {
      toast.error("Anda harus login terlebih dahulu untuk menunaikan wakaf.", {
        icon: '🔒',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      
      // Simpan rute saat ini agar setelah login bisa dikembalikan ke sini
      sessionStorage.setItem("redirect_after_login", window.location.pathname + window.location.search);
      
      // Lempar ke halaman login
      router.push("/LoginPage");
      return;
    }

    // Jika sudah login, langsung buka Modal Transfer Bank
    setIsPaymentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4FBF7]"> {/* Tema Hijau Tipis */}
        <div className="relative w-11 h-11">
          <div className="absolute inset-0 border-[3px] border-emerald-600/15 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-transparent border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4FBF7] gap-3 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Terjadi Kesalahan</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <Link href="/" className="mt-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-full shadow-sm hover:bg-emerald-700 transition-colors">
          Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[#F4FBF7] overflow-x-hidden">
      <NavbarDetail />
      
      <LiveDonationBlink history={walletHistory} />

      {/* Modal Pembayaran Bank (Tanpa Kripto & Tanpa Pilihan Tipe) */}
      <WakafPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        wakafName={user?.name || user?.full_name || "Hamba Allah"}
      />

      <CampaignBanner images={campaign.image_banner} />
      
      <div className="relative -mt-6 w-full bg-white flex flex-col z-10 pb-28 shadow-xl rounded-t-[1.75rem]">
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-emerald-600/15" />
        </div>
        
        {/* Anda bisa menambahkan prop themeColor="emerald" jika komponen ini mendung kustomisasi warna */}
        <CampaignHeader campaign={campaign} totalCollected={totalCollected} />
        <CampaignStory story={campaign.story || campaign.description} />
        
        {/* Anda bisa menambahkan DonationHistory jika ingin menampilkan list orang yang berwakaf */}
      </div>

      <WakafBottomBar 
        campaign={campaign}
        onWakafClick={handleWakafClick}
      />
    </div>
  );
}

export default function WakafDetailPage() {
  return (
    <Suspense>
      <WakafDetailContent />
    </Suspense>
  );
}