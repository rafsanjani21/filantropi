"use client";

import "@/lib/i18n";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useCallback } from "react";
import {
  Share2,
  CheckCircle2,
  Heart,
  Clock,
  AlertCircle,
  XCircle,
  History,
  ArrowDownRight,
  Infinity,
} from "lucide-react";

import NavbarDetail from "../components/ui/detail/navbar";
import LiveDonationBlink from "../components/ui/detail/LiveDonationBlink";
import PaymentModal from "../components/ui/detail/PaymentModal";
import DisbursementModal from "../components/ui/detail/DisbursementModal";
import ReportModal from "../components/ui/detail/ReportModal";

import Link from "next/link";
import { AuthService } from "@/lib/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("slug");
  const { t } = useTranslation();

  const { getProfile } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const foundation =
    campaign?.full_name || t("beneficiary", "Penerima Manfaat");

  const story =
    campaign?.story ||
    campaign?.description ||
    t("no_story_yet", "Belum ada cerita");

  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [totalCollected, setTotalCollected] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // STATE MODAL TIPE DONASI & WAKAF (Disimpan untuk dikirim ke backend, tetapi modal tidak ditampilkan lagi)
  const [donationType, setDonationType] = useState<string>("Donasi");
  const [wakafName, setWakafName] = useState("");

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [milestone, setMilestone] = useState<any>(null);
  const [isFetchingMilestone, setIsFetchingMilestone] = useState(true);

  // STATE MODAL CREATOR
  const [showDisburseConfirmModal, setShowDisburseConfirmModal] =
    useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const fetchMilestoneStatus = useCallback(async (campaignId: string) => {
    setIsFetchingMilestone(true);
    try {
      const res = await apiFetch(`/campaigns/milestone-status/${campaignId}`, {
        method: "GET",
      });
      if (res && res.data) setMilestone(res.data);
    } catch (err) {
      console.error("Gagal menarik status milestone:", err);
    } finally {
      setIsFetchingMilestone(false);
    }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

        if (token) {
          try {
            setCurrentUser(
              (await getProfile()) || (await getProfile("beneficiary")),
            );
          } catch (err) {}
        }

        if (!id) throw new Error(t("campaign_id_not_found"));

        const res = await AuthService.getCampaignDetail(id);
        const campaignData = res.data || res;
        setCampaign(campaignData);

        if (token && campaignData?.id) {
          fetchMilestoneStatus(campaignData.id);
        } else {
          setIsFetchingMilestone(false);
        }
      } catch (err: any) {
        setError(err.message || t("fail_fetch_data"));
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id, fetchMilestoneStatus]);

  const receiverWallet =
    campaign?.wallet_address ||
    campaign?.user?.wallet_address ||
    campaign?.beneficiary?.wallet_address ||
    "";

  useEffect(() => {
    const fetchCampaignHistory = async () => {
      // 1. Cek apakah wallet penerima berhasil ditarik 
      if (!receiverWallet) {
        return;
      }

      setLoadingHistory(true);

      try {
        // 2. Jika apiFetch tidak otomatis menambahkan /api, tambahkan secara manual di sini:
        // Misalnya: `/api/donations/in/${receiverWallet}`
        const res = await apiFetch(`/donations/in/${receiverWallet}`, {
          method: "GET",
        });
        // 3. Tangani jika apiFetch me-return data langsung tanpa bungkus "data:"
        const apiData = res?.data || res; 

        if (apiData) {
          let apiHistory: any[] = [];
          
          if (Array.isArray(apiData.history)) {
            
            apiHistory = apiData.history.map((tx: any, index: number) => ({
              tx_hash: tx.tx_hash || index.toString(), // Fallback jika tx_hash tidak ada
              date: tx.created_at,
              type: "In",
              // Menggunakan ?? agar nilai 0 tetap terbaca sebagai 0
              amount: String(tx.amount_idr ?? 0), 
              from_to: tx.donatur_name || "Anonim",
            }));
          } else {
             console.log("3. Array history TIDAK ditemukan di dalam response");
          }

          
          setWalletHistory(apiHistory);
          
          if (apiData.total_balance_idr !== undefined) {
            setTotalCollected(parseFloat(apiData.total_balance_idr));
          }
        }
      } catch (err) {
        console.error("Gagal memuat riwayat donasi dari backend:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchCampaignHistory();
  }, [receiverWallet]);

  const isUnlimitedTime = !campaign?.end_date;
  const daysLeft = isUnlimitedTime
    ? null
    : Math.max(
        0,
        Math.ceil(
          (new Date(campaign.end_date).getTime() - Date.now()) / 86400000,
        ),
      );

  // FUNGSI BARU: Langsung eksekusi buka payment modal
  const handleDirectDonate = () => {
    setDonationType(campaign?.is_wakaf ? "Wakaf" : "Donasi");
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (
      sessionStorage.getItem("auto_open_donate") === "true" &&
      campaign?.status === "active" &&
      (isUnlimitedTime || (daysLeft as number) > 0)
    ) {
      sessionStorage.removeItem("auto_open_donate");
      setTimeout(() => {
        handleDirectDonate();
      }, 500);
    }
  }, [campaign, daysLeft, isUnlimitedTime]);

  const handleSimulatePayment = (amount: number, guestName: string) => {
    setIsProcessingPayment(true);
    const loadingToast = toast.loading("Meneruskan ke pembayaran...");
    setTimeout(() => {
      toast.dismiss(loadingToast);
      setIsProcessingPayment(false);
      setIsModalOpen(false);

      const query = new URLSearchParams();
      query.append("amount", amount.toString());
      query.append("campaignId", campaign.id);
      query.append("donationType", donationType);
      if (donationType === "Wakaf") query.append("wakafName", wakafName);

      query.append(
        "name",
        currentUser
          ? currentUser.full_name || currentUser.name || "Orang Baik"
          : guestName,
      );

      router.push(`/PaymentSimulation?${query.toString()}`);
    }, 800);
  };

  const handleDisbursementSubmit = async () => {
    setIsSubmittingReport(true);
    const loadingToast = toast.loading("Mengajukan pencairan dana...");
    try {
      await apiFetch(`/campaigns/disbursements/${campaign.id}`, {
        method: "POST",
      });
      toast.success("Pencairan berhasil diajukan!", { id: loadingToast });
      setShowDisburseConfirmModal(false);
      fetchMilestoneStatus(campaign.id);
    } catch (err: any) {
      toast.error(
        typeof err === "string"
          ? err
          : err.message || "Gagal mengajukan pencairan.",
        { id: loadingToast },
      );
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleReportSubmit = async (description: string, files: File[]) => {
    setIsSubmittingReport(true);
    const loadingToast = toast.loading("Mengirim laporan...");
    const formData = new FormData();
    formData.append("description", description);
    files.forEach((file) => formData.append("proof_images", file));

    try {
      await apiFetch(`/campaigns/report/${campaign.id}`, {
        method: "POST",
        body: formData,
      });
      toast.success("Laporan berhasil dikirim!", { id: loadingToast });
      setShowReportModal(false);
      fetchMilestoneStatus(campaign.id);
    } catch (err: any) {
      toast.error(
        typeof err === "string"
          ? err
          : err.message || "Gagal mengirim laporan.",
        { id: loadingToast },
      );
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3]">
        <div className="relative w-11 h-11">
          <div className="absolute inset-0 border-[3px] border-[#7C3996]/15 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-transparent border-t-[#7C3996] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  if (error || !campaign)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8F3] gap-3 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-[#2A1B33]">Terjadi Kesalahan</h2>
        <p className="text-sm text-gray-500">{error}</p>
        <Link
          href="/"
          className="mt-2 px-6 py-2.5 bg-[#7C3996] text-white text-sm font-bold rounded-full shadow-sm hover:bg-[#6B2E88] transition-colors"
        >
          Kembali
        </Link>
      </div>
    );

  const isUnlimitedTarget = !campaign.target_amount;
  const target = isUnlimitedTarget
    ? 1
    : parseFloat(String(campaign.target_amount).replace(/[^\d.-]/g, ""));
  const collected = parseFloat(
    String((totalCollected ?? campaign.current_amount_idr) || 0).replace(
      /[^\d.-]/g,
      "",
    ),
  );
  const progress =
    isUnlimitedTarget || target === 0
      ? 0
      : Math.min(100, Math.floor((collected / target) * 100));
  const isCampaignOwner = !!(
    currentUser &&
    (currentUser.id === campaign.user_id ||
      currentUser.wallet_address === receiverWallet)
  );

  const campaignImages = (
    Array.isArray(campaign?.image_banner)
      ? campaign.image_banner
      : [campaign?.image_banner]
  )
    .filter(Boolean)
    .map((img: string) =>
      img.startsWith("http")
        ? img
        : `${IMAGE_BASE_URL}/${img.replace(/^\/+/, "")}`,
    );
  if (campaignImages.length === 0) campaignImages.push("/bencana.png");

  function renderStatusBadge(status: any, daysLeft: number | null) {
    if (status === "active" && daysLeft !== null && daysLeft <= 0) {
      return (
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 uppercase border border-gray-200 flex items-center gap-1">
          <Clock size={12} /> Berakhir
        </span>
      );
    }

    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase border border-emerald-200 flex items-center gap-1 shadow-sm">
            <CheckCircle2 size={12} /> Aktif
          </span>
        );
      case "rejected":
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-50 text-red-700 uppercase border border-red-200 flex items-center gap-1 shadow-sm">
            <XCircle size={12} /> Ditolak
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 uppercase border border-amber-200 flex items-center gap-1 shadow-sm">
            <Clock size={12} /> Menunggu
          </span>
        );
    }
  }

  function getCategoryName(category_id: any) {
    const map: Record<number, string> = {
      1: t("cat_education", "Pendidikan"),
      2: t("cat_health", "Kesehatan"),
      3: t("cat_disaster", "Bencana Alam"),
      4: t("cat_mosque", "Ekonomi"),
      5: t("cat_general", "Umum"),
    };
    return map[category_id] || "Umum";
  }

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[#FBF8F3] overflow-x-hidden">
      <NavbarDetail />
      <LiveDonationBlink history={walletHistory} />

      {/* PaymentModal dipanggil secara langsung */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        donationType={donationType}
        wakafName={wakafName}
        currentUser={currentUser}
        onSubmit={handleSimulatePayment}
        isProcessing={isProcessingPayment}
        onLoginRedirect={() => {
          sessionStorage.setItem(
            "redirect_after_login",
            window.location.pathname,
          );
          router.push("/LoginPage");
        }}
        receiverWallet={receiverWallet}
      />

      <DisbursementModal
        isOpen={showDisburseConfirmModal}
        onClose={() => setShowDisburseConfirmModal(false)}
        onSubmit={handleDisbursementSubmit}
        isSubmitting={isSubmittingReport}
        currentPhase={milestone?.current_phase || 1}
      />
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={isSubmittingReport}
      />

      {/* GAMBAR HEADER */}
      <div className="relative w-full h-72 bg-[#2A1B33]">
        <div
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
          onScroll={(e) =>
            setActiveImage(
              Math.round(
                e.currentTarget.scrollLeft / e.currentTarget.clientWidth,
              ),
            )
          }
        >
          {campaignImages.map((img: string, i: number) => (
            <img
              key={i}
              src={img}
              alt="Banner"
              className="w-full h-full object-cover shrink-0 snap-center min-w-full"
            />
          ))}
        </div>

        {/* Scrim untuk transisi halus ke kartu putih */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2A1B33]/60 to-transparent pointer-events-none" />

        {campaignImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {campaignImages.map((_: string, i: number) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeImage ? "w-5 bg-[#E8B94A]" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
        {campaignImages.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold">
            {activeImage + 1} / {campaignImages.length}
          </div>
        )}
      </div>

      <div className="relative -mt-6 w-full bg-white flex flex-col z-10 pb-28 shadow-xl rounded-t-[1.75rem]">
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-[#7C3996]/15" />
        </div>

        <div className="p-6 border-b border-gray-100 mt-2">
          <div className="flex items-center justify-between mb-3">
            {/* Nama Penerima */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#5B2A73]">
                {foundation}
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#7C3996]" />
            </div>

            {/* Status & Kategori */}
            <div className="flex items-center gap-2">
              {renderStatusBadge(campaign?.status, daysLeft)}
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#E8B94A]/15 text-[#8A6413] uppercase border border-[#E8B94A]/30 shrink-0">
                {getCategoryName(campaign.category_id)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">
                Terkumpul
              </span>
              <span className="text-xl font-bold text-[#2A1B33] tabular-nums">
                Rp {collected.toLocaleString("id-ID")}{" "}
                {!isUnlimitedTarget && (
                  <span className="text-xs font-normal text-gray-400">
                    {" "}
                    / Rp {target.toLocaleString("id-ID")}
                  </span>
                )}
              </span>
            </div>
            {!isUnlimitedTarget && (
              <span className="text-sm font-black text-[#5B2A73] bg-[#E8B94A]/15 border border-[#E8B94A]/30 px-2 py-0.5 rounded-md">
                {progress}%
              </span>
            )}
          </div>
          {!isUnlimitedTarget && (
            <div className="w-full h-2.5 bg-[#7C3996]/10 rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7C3996] to-[#E8B94A] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                isUnlimitedTime || (daysLeft as number) > 0
                  ? "text-orange-600 bg-orange-50 border border-orange-100"
                  : "text-gray-500 bg-gray-100 border border-gray-200"
              }`}
            >
              {isUnlimitedTime ? (
                <>
                  <Infinity size={16} className="shrink-0" />
                  {t("unlimited_time", "Tanpa Batas Waktu")}
                </>
              ) : (
                <>
                  <Clock size={14} className="shrink-0" />
                  {(daysLeft as number) > 0
                    ? `${t("remaining", "Sisa")} ${daysLeft} ${t("days", "Hari")}`
                    : t("program_has_ended", "Program Berakhir")}
                </>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-[#2A1B33] leading-snug my-4">
            {campaign.title}
          </h1>

          {campaign.description && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {campaign.description}
            </p>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-4 rounded-full bg-[#E8B94A]" />
            <h2 className="text-lg font-bold text-[#2A1B33]">
              {t("fundraising_purpose", "Tujuan Penggalangan Dana")}
            </h2>
          </div>
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {story}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 bg-[#FBF8F3]">
          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-[#7C3996]" />
            <h2 className="text-lg font-bold text-[#2A1B33]">Donasi Masuk</h2>
          </div>
          <div className="flex flex-col gap-3">
            {walletHistory.slice(0, 5).map((tx, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-2xl shadow-sm border border-[#7C3996]/8 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ArrowDownRight size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {tx.from_to}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {new Date(tx.date).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
                <p className="font-black text-sm text-emerald-600 tabular-nums">
                  +Rp {parseFloat(tx.amount || "0").toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 justify-center text-center">
            5 donasi terakhir ditampilkan.
          </p>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex gap-2.5 shadow-2xl overflow-visible">
        <button
          onClick={() =>
            navigator.share && navigator.share({ url: window.location.href })
          }
          className="flex justify-center items-center p-3 border-2 border-[#7C3996]/15 text-[#7C3996] rounded-xl w-1/3 hover:bg-[#7C3996]/5 transition-colors"
        >
          <Share2 size={20} />
        </button>
        {isCampaignOwner ? (
          <>
            <button
              onClick={() => setShowDisburseConfirmModal(true)}
              className="flex-1 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
            >
              Cairkan
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex-1 border-2 border-[#7C3996] text-[#7C3996] rounded-xl font-bold hover:bg-[#7C3996]/5 transition-colors"
            >
              Laporan
            </button>
          </>
        ) : (
          <div className="relative flex-1 group">
            <button
              onClick={handleDirectDonate}
              disabled={
                campaign?.status !== "active" ||
                (!isUnlimitedTime && (daysLeft as number) <= 0)
              }
              className="w-full bg-gradient-to-r from-[#7C3996] to-[#5B2A73] text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 shadow-md shadow-[#7C3996]/25 hover:shadow-lg transition-shadow disabled:opacity-50 disabled:shadow-none"
            >
              <Heart size={20} fill="currentColor" className="text-[#E8B94A]" />{" "}
              {campaign?.status !== "active" ? "Belum Aktif" : "Donasi Sekarang"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense>
      <DetailContent />
    </Suspense>
  );
}