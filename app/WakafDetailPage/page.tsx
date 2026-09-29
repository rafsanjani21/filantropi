"use client";

import "@/lib/i18n";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

// Komponen Detail Utama
import { useCampaignDetail } from "../DetailPage/hooks/useCampaignDetail";
import NavbarDetail from "../DetailPage/components/navbar";
import CampaignBanner from "../DetailPage/components/CampaignBanner";
import CampaignHeader from "../DetailPage/components/CampaignHeader";
import CampaignStory from "../DetailPage/components/CampaignStory";
import DonationHistory from "../DetailPage/components/DonationHistory";

// Komponen Wakaf Khusus 
import WakafBottomBar from "./components/WakafBottomBar";

function WakafDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug");

  // Hapus pemanggilan 'user', 'role', dan 'isInitialized' karena tidak lagi dibutuhkan
  const {
    campaign,
    loading,
    error,
    walletHistory,
    totalCollected,
  } = useCampaignDetail(slug);

  // LOGIKA PROTEKSI DIHAPUS - Akses Publik / Guest Checkout
  const handleWakafClick = () => {
    // Langsung arahkan ke halaman Form Wakaf tanpa validasi profil/login
    router.push(`/WakafDetailPage/FormWakafPage?slug=${campaign?.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4FBF7]">
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
        <Link
          href="/"
          className="mt-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-full shadow-sm hover:bg-emerald-700 transition-colors"
        >
          Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[#F4FBF7] overflow-x-hidden">
      <NavbarDetail />

      <CampaignBanner images={campaign.image_banner} />

      <div className="relative -mt-6 w-full bg-white flex flex-col z-10 pb-28 shadow-xl rounded-t-[1.75rem]">
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-emerald-600/15" />
        </div>

        <CampaignHeader campaign={campaign} totalCollected={totalCollected} />
        <CampaignStory story={campaign.story || campaign.description} />
        <DonationHistory history={walletHistory} />
      </div>

      <WakafBottomBar campaign={campaign} onWakafClick={handleWakafClick} />
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