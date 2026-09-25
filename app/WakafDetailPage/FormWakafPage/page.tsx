"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useCampaignDetail } from "../../DetailPage/hooks/useCampaignDetail"; // Sesuaikan path hooks Anda

// Import komponen View
import NameSelectionView from "./components/NameSelectionView";
import PledgeView from "./components/PledgeView";
import NominalView from "../../components/ui/sharedpayment/NominalView";
import MethodView from "../../components/ui/sharedpayment/MethodView";
import FormView from "./components/FormView";
import QrisView from "../../components/ui/sharedpayment/QrisView";
import VaView from "../../components/ui/sharedpayment/VaView"; 
export default function FormWakafPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const { campaign, loading, error, user } = useCampaignDetail(slug);

  // State Navigasi
  const [currentView, setCurrentView] = useState<"name" | "pledge" | "nominal" | "method" | "form" | "qris" | "va">("name");

  // State Form Data
  const [wakafFor, setWakafFor] = useState<"self" | "other">("self");
  const [representativeName, setRepresentativeName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [doa, setDoa] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State Response API
  const [transactionData, setTransactionData] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4FBF7]">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4FBF7]">
        <p className="text-slate-500 font-medium">Data program Wakaf tidak ditemukan.</p>
      </div>
    );
  }

  const handleBack = () => {
    if (currentView === "name") router.back();
    else if (currentView === "pledge") setCurrentView("name");
    else if (currentView === "nominal") setCurrentView("pledge");
    else if (currentView === "method") setCurrentView("nominal");
    else if (currentView === "form") setCurrentView("method");
    else if (currentView === "qris" || currentView === "va") setCurrentView("form");
  };

  const handleSubmitPayment = async () => {
    // 1. Validasi Token Bearer (Wajib untuk Wakaf)
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || sessionStorage.getItem("access_token") : null;
    if (!token) {
      return toast.error("Anda wajib login untuk melakukan Wakaf.");
    }

    // 2. Validasi Nominal Minimum (1.000 untuk Instan, 10.000 untuk VA)
    if (!amount || amount < 1000) return toast.error("Minimal wakaf Rp 1.000");
    const instanMethods = ["QRIS", "ASTRAPAY"];
    if (!instanMethods.includes(selectedMethod.id) && amount < 10000) {
      return toast.error(`Minimal nominal untuk metode ${selectedMethod.name} adalah Rp 10.000`);
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Memproses ikrar wakaf...");

    try {
      const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
      
      // Generate Idempotency Key
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Mapping Format Bank Backend (Misal: MANDIRI -> MANDIRI_VA)
      const isRetailOrQR = ["QRIS", "ASTRAPAY", "INDOMARET", "AKULAKU"].includes(selectedMethod.id);
      const apiPaymentMethod = isRetailOrQR ? selectedMethod.id : `${selectedMethod.id}_VA`;

      // Nama Pengirim Sesuai Niat Wakaf
      const senderName = wakafFor === "other" && representativeName.trim() !== "" 
        ? representativeName 
        : (user?.full_name || user?.name || "Hamba Allah");

      const payload = {
        campaign_id: campaign?.id || campaign?.campaign_code,
        campaign_name: campaign?.title || campaign?.name || "Wakaf",
        sender_name: senderName,
        sender_phone: user?.phone || user?.phone_number || "081234567890",
        amount: Number(amount),
        transfer_notes: doa || "Semoga berkah",
        payment_method: apiPaymentMethod // 🔥 Format dinamis sesuai Bank
      };

      // 🔥 HIT ENDPOINT V2 UNTUK SEMUA METODE WAKAF
      const response = await fetch(`${GATEWAY_URL}/campaigns/create/v2/transaction-wakaf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
          "Authorization": `Bearer ${token}` // Wajib ada
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.message || "Gagal membuat transaksi Wakaf");
      }

      toast.success("Checkout WAKAF berhasil!", { id: loadingToast });
      
      // Simpan Data Respon API
      setTransactionData(result.data);

      // Arahkan tampilan sesuai Metode Pembayaran
      if (selectedMethod.id === "QRIS") {
        setCurrentView("qris");
      } else {
        // Arahkan VA / Retail ke komponen VaView (Pastikan Anda ubah tema warnanya jadi Emerald di komponen VaView-nya)
        setCurrentView("va"); 
      }

    } catch (err: any) {
      console.error("Payment Error:", err);
      toast.error(err.message || "Terjadi kesalahan sistem.", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {currentView === "name" && (
        <NameSelectionView 
          wakafFor={wakafFor} setWakafFor={setWakafFor} 
          representativeName={representativeName} setRepresentativeName={setRepresentativeName} 
          onNext={() => {
            if (wakafFor === "other" && !representativeName.trim()) return toast.error("Nama almarhum/keluarga wajib diisi");
            setCurrentView("pledge");
          }} 
          onBack={handleBack} 
        />
      )}
      
      {currentView === "pledge" && (
        <PledgeView 
          userName={user?.full_name || user?.name || "Saya"} 
          wakafFor={wakafFor} 
          representativeName={representativeName} 
          onNext={() => setCurrentView("nominal")} 
          onBack={handleBack} 
        />
      )}
      
      {currentView === "nominal" && (
        <NominalView 
          transactionType="wakaf"
          amount={amount} 
          setAmount={setAmount} 
          onNext={() => {
            if (!amount || amount < 1000) return toast.error("Minimal wakaf Rp 1.000");
            setCurrentView("method");
          }} 
          onBack={handleBack} 
        />
      )}
      
      {currentView === "method" && (
        <MethodView 
        transactionType="wakaf"
          amount={amount} 
          selectedMethod={selectedMethod} 
          onSelectMethod={(m) => { setSelectedMethod(m); setCurrentView("form"); }} 
          onBack={handleBack} 
        />
      )}
      
      {currentView === "form" && (
        <FormView 
          wakafName={wakafFor === "other" ? representativeName : (user?.full_name || user?.name || "Hamba Allah")} 
          amount={amount} 
          selectedMethod={selectedMethod} 
          doa={doa} setDoa={setDoa} 
          onSubmit={handleSubmitPayment} 
          isProcessing={isProcessing} 
          onBack={handleBack} 
          onChangeMethod={() => setCurrentView("method")} 
          user={user} 
        />
      )}

      {currentView === "qris" && (
        <QrisView 
        transactionType="wakaf"
        qrisData={transactionData} 
        amount={amount} 
        onBack={handleBack}
        onCheckStatus={() => router.push("/ProfilePage/HistoryWakafPage")}
        />
        
      )}

      {currentView === "va" && (
        <VaView 
        transactionType="wakaf"
          vaData={{ va_number: transactionData?.payment_code }} 
          amount={amount} 
          selectedMethod={selectedMethod} 
          onBack={handleBack} 
          onCheckStatus={() => router.push("/ProfilePage/HistoryWakafPage")} 
        />
      )}
    </>
  );
}