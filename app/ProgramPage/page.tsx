"use client";

import "@/lib/i18n"; 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import { 
  ArrowLeft, Plus, Clock, CheckCircle2, XCircle, 
  AlertCircle, Share2, Edit3, Heart, Wallet, ShieldAlert 
} from "lucide-react";
import { AuthService } from "@/lib/auth.service";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth"; 
import { useTranslation } from "react-i18next"; 

const truncateWallet = (address: string) => {
  if (!address) return "Belum diatur";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function ProgramPage() {
  const router = useRouter(); 
  const { getProfile } = useAuth(); 
  const { t } = useTranslation(); 
  
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  
  // State Modal
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false); 

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  useEffect(() => {
    const fetchMyCampaigns = async () => {
      setLoading(true);
      try {
        try {
          const profile = await getProfile("beneficiary");
          setUserProfile(profile?.data || profile);
        } catch (err) {
          console.warn("Gagal mengambil profil penerima manfaat");
        }

        const res = await AuthService.getMyCampaigns();
        const rawData = res.data || res;
        
        if (Array.isArray(rawData)) {
          const campaignsWithLiveBalance = await Promise.all(
            rawData.map(async (campaign) => {
              const wallet = campaign.wallet_address || campaign.user?.wallet_address;
              let liveTotal = campaign.current_amount || 0;
              
              if (wallet) {
                try {
                  // 🔥 OPTIMASI: Langsung hit API balance, tidak perlu tarik riwayat
                  const balanceRes = await apiFetch(`/donations/wallet/balance/${wallet}`, { method: "GET" });
                  if (balanceRes && balanceRes.data !== undefined) {
                    const balanceData = typeof balanceRes.data === 'object' ? balanceRes.data.balance : balanceRes.data;
                    liveTotal = parseFloat(balanceData || "0");
                  }
                } catch (err) {
                  console.warn("Gagal ambil live balance untuk", wallet);
                }
              }
              return { ...campaign, live_collected: liveTotal };
            })
          );
          
          setCampaigns(campaignsWithLiveBalance);
        }
      } catch (error) {
        console.error("Gagal mengambil data program saya:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- LOGIKA PEMBATASAN KAMPANYE & VERIFIKASI ---
  const isVerified = userProfile?.is_verified === 1 || userProfile?.is_verified === true;
  const isNotVerified = userProfile !== null && !isVerified; 

  const isIndividual = userProfile?.beneficiary_type?.toLowerCase() === "individu" || 
                       userProfile?.beneficiary_type?.toLowerCase() === "individual";
  const cannotCreateMore = isIndividual && campaigns.length >= 1;

  const handleCreateCampaignClick = (e: React.MouseEvent) => {
    if (isNotVerified) {
      e.preventDefault();
      setShowUnverifiedModal(true);
    } else if (cannotCreateMore) {
      e.preventDefault();
      setShowLimitModal(true);
    } else {
      router.push("/GalangPage");
    }
  };

  const handleShare = (campaignTitle: string) => {
    if (navigator.share) {
      navigator.share({
        title: campaignTitle,
        text: `${t("share_campaign_text")} ${campaignTitle}`,
        url: window.location.origin + "/DonasiPage",
      });
    } else {
      alert(t("link_copied_alert"));
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg border border-green-100 shadow-sm">
            <CheckCircle2 size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">{t("active_status")}</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg border border-red-100 shadow-sm">
            <XCircle size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">{t("rejected_status")}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-100 shadow-sm">
            <Clock size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">{t("waiting_status")}</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 pb-24 relative">
      
      {/* MODAL POPUP: BELUM DIVERIFIKASI */}
      {showUnverifiedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-3xl flex flex-col items-center p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-5 border-4 border-amber-100 shadow-inner">
              <Clock size={36} />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2">{t("unverified_account")}</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {t("unverified_account_desc")}
            </p>
            <button
              onClick={() => setShowUnverifiedModal(false)}
              className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-2xl hover:bg-purple-700 active:scale-95 transition-all shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)]"
            >
              {t("i_understand")}
            </button>
          </div>
        </div>
      )}

      {/* MODAL POPUP: BATAS MAKSIMAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-3xl flex flex-col items-center p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 border-4 border-red-100 shadow-inner">
              <ShieldAlert size={36} />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2">{t("limit_reached")}</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {t("limit_reached_desc")}
            </p>
            <button
              onClick={() => setShowLimitModal(false)}
              className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-2xl hover:bg-purple-700 active:scale-95 transition-all shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)]"
            >
              {t("i_understand")}
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-linear-to-r from-[#7C3996] to-[#b359d4] shadow-lg rounded-b-3xl">
        <nav className="px-6 pt-8 pb-6 flex items-center justify-between text-white">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">{t("my_programs")}</h1>
          
          <button 
            onClick={handleCreateCampaignClick}
            className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all cursor-pointer ${
              isNotVerified || cannotCreateMore 
                ? "bg-gray-300 text-gray-500" 
                : "bg-white text-purple-600 active:scale-95"
            }`}
            title={
              isNotVerified ? t("unverified_tooltip") : 
              cannotCreateMore ? t("max_1_program_tooltip") : 
              t("create_new_program_tooltip")
            }
          >
            <Plus size={20} />
          </button>
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
            const collected = campaign.live_collected !== undefined ? campaign.live_collected : (campaign.current_amount || 0);
            
            let progress: number | string = 0;
            const percent = (collected / target) * 100;
            if (percent >= 100) {
              progress = 100;
            } else if (percent > 99) {
              progress = percent.toFixed(1); 
            } else {
              progress = Math.floor(percent); 
            }
            
            const imageUrl = campaign.image_banner 
              ? (campaign.image_banner.startsWith('http') ? campaign.image_banner : `${IMAGE_BASE_URL}/${campaign.image_banner.replace(/^\/+/, '')}?t=${Date.now()}`)
              : "/placeholder.png";

            const campaignIdentifier = campaign.slug || campaign.id;

            return (
              <div key={campaign.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group transition-shadow hover:shadow-md">
                <Link href={`/DetailPage?slug=${campaignIdentifier}`} className="block cursor-pointer">
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

                    <div className="flex items-center justify-between bg-purple-50 px-3 py-2.5 rounded-xl mb-4 border border-purple-100/50">
                      <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-purple-600 shrink-0" />
                        <span className="text-[10px] font-bold text-purple-800 uppercase tracking-tight">{t("wallet_label")}</span>
                      </div>
                      <span className="text-[11px] font-mono text-purple-600 font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-purple-100">
                        {truncateWallet(campaign.wallet_address || campaign.user?.wallet_address)}
                      </span>
                    </div>

                    {campaign.status === 'active' ? (
                      <div className="space-y-3 mb-3">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{t("collected_label")}</span>
                            <span className="text-sm font-black text-purple-600">{collected} FCC <span className="text-[10px] text-gray-400 font-normal">/ {target} FCC</span></span>
                          </div>
                          <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 shadow-sm">
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
                          <p className="text-[10px] font-black text-red-700 uppercase">{t("rejected_label")}</p>
                          <p className="text-xs text-red-600 leading-tight">
                            {campaign.reject_reason || campaign.reason || t("default_rejection_reason")}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-2.5">
                        <Clock size={14} className="text-amber-500" />
                        <p className="text-xs text-amber-700 font-medium">{t("under_review_desc")}</p>
                      </div>
                    )}
                  </div>
                </Link>

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
                      <Share2 size={16} /> {t("share_button")}
                    </button>
                    
                    <Link 
                      href={`/ProgramPage/EditProgram?id=${campaignIdentifier}`}
                      className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition active:scale-95"
                    >
                      <Edit3 size={16} /> {t("manage_button")}
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
            <h3 className="text-gray-800 font-bold text-lg">{t("no_program_title")}</h3>
            <p className="text-gray-500 text-sm mt-2 px-10 leading-relaxed">
              {t("no_program_desc")}
            </p>
            <button 
              onClick={handleCreateCampaignClick} 
              className="mt-6 bg-purple-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-200 active:scale-95 transition-all cursor-pointer"
            >
              {t("create_program_button")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}