"use client";

import "@/lib/i18n";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// Komponen Detail
import { useCampaignDetail } from "../DetailPage/hooks/useCampaignDetail";
import NavbarDetail from "../DetailPage/components/navbar";
import CampaignBanner from "../DetailPage/components/CampaignBanner";
import CampaignHeader from "../DetailPage/components/CampaignHeader";
import CampaignStory from "../DetailPage/components/CampaignStory";
import DonationHistory from "../DetailPage/components/DonationHistory";

// Komponen Wakaf
import WakafPaymentModal from "./components/WakafPaymentModal";
import WakafBottomBar from "./components/WakafBottomBar";
import WakafPledgeModal from "./components/WakafPledgeModal";
import WakafFormModal from "./components/WakafFormModal";
import NameSelectionModal from "./components/NameSelectionModal";

function WakafDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug");

  const {
    campaign,
    loading,
    error,
    walletHistory,
    totalCollected,
    user,
    role,
    isInitialized,
  } = useCampaignDetail(slug);

  // STATE MODAL
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isNameSelectionModalOpen, setIsNameSelectionModalOpen] = useState(false);
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);

  // STATE DATA WAKAF
  const [wakafName, setWakafName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);
  
  // STATE ATAS NAMA & PEMBAYARAN
  const [wakafFor, setWakafFor] = useState<"self" | "other">("self");
  const [representativeName, setRepresentativeName] = useState(""); 
  const [paymentMethod, setPaymentMethod] = useState<"gateway" | "manual">("gateway");
  const [transferNotes, setTransferNotes] = useState("");

  // LOGIKA PROTEKSI WAKAF (LOGIN, ROLE, DAN KELENGKAPAN REKENING)
  const handleWakafClick = () => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    if (token && !isInitialized) {
      toast.loading("Memeriksa sesi login...", { id: "checking-auth" });
      return;
    }

    // 1. Cek Login
    if (!token || !user) {
      toast.error("Anda harus login terlebih dahulu untuk menunaikan wakaf.", {
        icon: "🔒",
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });

      sessionStorage.setItem(
        "redirect_after_login",
        window.location.pathname + window.location.search,
      );
      router.push("/LoginPage/Masuk");
      return;
    }

    // 2. Cek Role (Penerima Manfaat tidak bisa berwakaf)
    if (role === "beneficiary") {
      toast.error(
        "Akun Penerima Manfaat tidak dapat menunaikan wakaf. Silakan pakai akun Pengguna Umum.",
        {
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        },
      );
      return;
    }

    // 3. CEK KELENGKAPAN SEMUA DATA PROFIL & REKENING
    if (
      !user.nik ||
      !user.phone_number ||
      !user.address ||
      !user.domicile_province ||
      !user.domicile_city ||
      !user.domicile_district ||
      !user.domicile_village ||
      !user.bank_name ||
      !user.no_req ||
      !user.bank_account_name
    ) {
      toast.error(
        "Data profil belum lengkap! Silakan lengkapi profil Anda terlebih dahulu.",
        {
          icon: "⚠️",
          style: { borderRadius: "10px", background: "#333", color: "#fff" },
        },
      );
      router.push("/ProfilePage/UserPage");
      return;
    }

    toast.dismiss("checking-auth");

    // Jika validasi lolos, BUKA MODAL PEMILIHAN NAMA
    setIsNameSelectionModalOpen(true);
  };

  // LOGIKA SETELAH SETUJU IKRAR (LANJUT KE INPUT NOMINAL)
  const handlePledgeSubmit = (nameFromPledge: any) => {
    const finalName = nameFromPledge || user?.name || user?.full_name || "Hamba Allah";
    setWakafName(finalName);
    setIsPledgeModalOpen(false);
    setIsFormModalOpen(true);
  };

  // LOGIKA UTAMA TRANSAKSI PEMBAYARAN (GATEWAY & MANUAL)
  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      
      // 🔥 1. JALUR PAYMENT GATEWAY (XENDIT/MIDTRANS)
      if (paymentMethod === "gateway") {
        const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
        
        const payloadGateway = {
          // PASTIKAN AMOUNT DIUBAH JADI ANGKA (NUMBER)
          amount: Number(formData.amount), 
          campaign_name: campaign?.title || campaign?.name || "Wakaf",
          campaign_id: campaign?.id || campaign?.campaign_code,
          sender_name: wakafName || formData.senderName || user?.full_name,
          transfer_notes: formData.doa || "Tanpa pesan",
          user_email: user?.email || "hamba@allah.com"
        };

        // Tambahkan console.log ini untuk mengecek apa yang sebenarnya dikirim ke backend
        console.log("MENGIRIM DATA KE BACKEND:", payloadGateway);

        const responseGateway = await fetch(`${GATEWAY_URL}/campaigns/create/transaction-wakaf`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payloadGateway),
        });

        const resultGateway = await responseGateway.json();
        
        // 🔥 Penyesuaian pengecekan error berdasarkan respons JSON
        if (!responseGateway.ok || resultGateway.error === true) {
          throw new Error(resultGateway.message || "Gagal membuat tagihan otomatis");
        }

        // 🔥 Mengambil payment_url persis dari objek "data" di JSON respons Anda
        const paymentUrl = resultGateway.data?.payment_url;
        
        if (paymentUrl) {
          // Arahkan ke URL Pembayaran (Xendit)
          window.location.href = paymentUrl;
          return; // Hentikan eksekusi kode di sini agar tidak lanjut ke manual
        } else {
          throw new Error("URL Pembayaran tidak ditemukan dari server");
        }
      }

      // 🔥 2. JALUR TRANSFER MANUAL (ATAU FALLBACK JIKA GATEWAY ERROR)
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
      const payloadManual = {
        campaignCode: campaign?.campaign_code || "",
        bankAccountId: "BANK-BSI-01",
        amount: formData.amount,
        senderName: wakafName || formData.senderName,
        senderBank: formData.senderBank,
        senderAccountNumber: formData.senderAccountNumber,
        transfer_notes: formData.doa || "Tanpa pesan",
      };

      const responseManual = await fetch(`${API_BASE}/campaigns/transaction/wakaf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payloadManual),
      });

      const resultManual = await responseManual.json();

      if (!responseManual.ok || resultManual.error) {
        throw new Error(resultManual.message || "Gagal membuat transaksi manual");
      }

      setTransactionData(resultManual.data);
      setIsFormModalOpen(false);
      setIsPaymentModalOpen(true);

    } catch (err: any) {
      console.error(err);
      
      // JIKA GATEWAY ERROR, PINDAHKAN OPSI KE MANUAL OTOMATIS
      if (paymentMethod === "gateway") {
        toast.error("Sistem otomatis sedang sibuk. Mengalihkan ke Transfer Manual...", {
          style: { borderRadius: "16px", fontSize: "13px", fontWeight: "600", background: '#333', color: '#fff' },
        });
        setPaymentMethod("manual"); 
      } else {
        toast.error(
          err.message || "Terjadi kesalahan sistem saat memproses transaksi",
          { style: { borderRadius: "16px", fontSize: "13px", fontWeight: "600", background: '#333', color: '#fff' } }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Modal Pemilihan Nama */}
      <NameSelectionModal 
        isOpen={isNameSelectionModalOpen}
        onClose={() => setIsNameSelectionModalOpen(false)}
        onProceed={() => {
          setIsNameSelectionModalOpen(false);
          setIsPledgeModalOpen(true);
        }}
        userName={user?.full_name || ""}
        wakafFor={wakafFor}
        setWakafFor={setWakafFor}
        representativeName={representativeName}
        setRepresentativeName={setRepresentativeName}
      />

      {/* Modal Ikrar */}
      <WakafPledgeModal
        isOpen={isPledgeModalOpen}
        onClose={() => setIsPledgeModalOpen(false)}
        onSubmit={handlePledgeSubmit}
        userName={user?.full_name || "Hamba Allah"} 
        wakafFor={wakafFor}
        representativeName={representativeName}
      />

      {/* Modal Form Input Nominal */}
      <WakafFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        currentUser={user}
      />

      {/* Modal Instruksi Pembayaran (Khusus Manual) */}
      <WakafPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        wakafName={wakafName || user?.name || user?.full_name || "Hamba Allah"}
        campaignCode={campaign?.campaign_code}
        transactionData={transactionData}
      />

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