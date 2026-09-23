"use client";

import "@/lib/i18n";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";

import { useCampaignDetail } from "./hooks/useCampaignDetail";
import NavbarDetail from "./components/navbar";
import PaymentModal from "./components/PaymentModal";
import DisbursementModal from "./components/DisbursementModal";
import ReportModal from "./components/ReportModal";

import CampaignBanner from "./components/CampaignBanner";
import CampaignHeader from "./components/CampaignHeader";
import CampaignStory from "./components/CampaignStory";
import DonationHistory from "./components/DonationHistory";
import BottomActionBar from "./components/BottomActionBar";

function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug");

  const {
    campaign,
    loading,
    error,
    walletHistory,
    totalCollected,
    receiverWallet,
    user,
  } = useCampaignDetail(slug);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donationType, setDonationType] = useState("Donasi");
  const [wakafName, setWakafName] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showDisburseConfirmModal, setShowDisburseConfirmModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    const isUnlimitedTime = !campaign?.end_date;
    const daysLeft = isUnlimitedTime
      ? null
      : Math.max(
          0,
          Math.ceil(
            (new Date(campaign.end_date).getTime() - Date.now()) / 86400000,
          ),
        );

    if (
      sessionStorage.getItem("auto_open_donate") === "true" &&
      campaign?.status === "active" &&
      (isUnlimitedTime || (daysLeft as number) > 0)
    ) {
      sessionStorage.removeItem("auto_open_donate");
      setTimeout(() => {
        setDonationType(campaign?.is_wakaf ? "Wakaf" : "Donasi");
        setIsModalOpen(true);
      }, 500);
    }
  }, [campaign]);

  // 🔥 FUNGSI PEMBAYARAN: FULL GATEWAY, TANPA TOKEN, TANPA MANUAL 🔥
  const handlePaymentSubmit = async (
    amount: number, 
    guestName: string, 
    transferNotes: string = "Tanpa pesan",
    userEmail: string = "",
    idempotencyKey: string = ""
  ) => {
    setIsProcessingPayment(true);
    const loadingToast = toast.loading("Menghubungkan ke sistem pembayaran...");

    try {
      const isWakaf = donationType === "Wakaf";
      const finalName = user ? user.full_name || user.name || "Hamba Allah" : guestName || "Hamba Allah";

      const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
      
      const endpoint = isWakaf 
        ? `${GATEWAY_URL}/campaigns/create/transaction-wakaf`
        : `${GATEWAY_URL}/campaigns/create/transaction-donasi`;

      const payloadGateway: any = {
        amount: Number(amount),
        campaign_name: campaign?.title || campaign?.name || "Donasi",
        campaign_id: campaign?.id || campaign?.campaign_code,
        sender_name: isWakaf ? (wakafName || finalName) : finalName,
        transfer_notes: transferNotes,
        user_email: user?.email || userEmail || "hamba@allah.com",
        ...(idempotencyKey && { idempotency_key: idempotencyKey })
      };

      const token = typeof window !== "undefined" 
        ? localStorage.getItem("access_token") || sessionStorage.getItem("access_token") 
        : null;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Jika token ada, masukkan ke dalam header Authorization
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payloadGateway),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error(`Server bermasalah (Status: ${response.status})`);
      }

      const result = await response.json();

      if (!response.ok || result.error === true) {
        throw new Error(result.message || "Gagal membuat tagihan pembayaran");
      }

      const paymentUrl = result.data?.payment_url;
      
      if (paymentUrl) {
        toast.dismiss(loadingToast);
        window.location.href = paymentUrl; // Redirect langsung ke Xendit
      } else {
        throw new Error("URL Pembayaran tidak ditemukan dari server");
      }

    } catch (err: any) {
      console.error("Payment Error:", err);
      toast.error(err.message || "Terjadi kesalahan sistem saat memproses transaksi", { 
        id: loadingToast,
        style: { borderRadius: "16px", fontSize: "13px", fontWeight: "600" }
      });
    } finally {
      setIsProcessingPayment(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3]">
        <div className="relative w-11 h-11">
          <div className="absolute inset-0 border-[3px] border-[#7C3996]/15 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-transparent border-t-[#7C3996] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
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
  }

  const isCampaignOwner = !!(
    user &&
    (user.id === campaign.user_id || user.wallet_address === receiverWallet)
  );

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[#FBF8F3] overflow-x-hidden">
      <NavbarDetail />

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={user}
        onSubmit={handlePaymentSubmit}
        isProcessing={isProcessingPayment}
      />

      <DisbursementModal
        isOpen={showDisburseConfirmModal}
        onClose={() => setShowDisburseConfirmModal(false)}
        onSubmit={handleDisbursementSubmit}
        isSubmitting={isSubmittingReport}
        currentPhase={1}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={isSubmittingReport}
      />

      <CampaignBanner images={campaign.image_banner} />

      <div className="relative -mt-6 w-full bg-white flex flex-col z-10 pb-28 shadow-xl rounded-t-[1.75rem]">
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-[#7C3996]/15" />
        </div>

        <CampaignHeader campaign={campaign} totalCollected={totalCollected} />
        <CampaignStory story={campaign.story || campaign.description} />
        <DonationHistory history={walletHistory} />
      </div>

      <BottomActionBar
        campaign={campaign}
        isCampaignOwner={isCampaignOwner}
        onDonate={() => {
          setDonationType(campaign?.is_wakaf ? "Wakaf" : "Donasi");
          setIsModalOpen(true);
        }}
        onDisburse={() => setShowDisburseConfirmModal(true)}
        onReport={() => setShowReportModal(true)}
      />
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