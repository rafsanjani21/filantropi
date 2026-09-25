"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useCampaignDetail } from "../hooks/useCampaignDetail";

// Import komponen View
import NominalView from "../../components/ui/sharedpayment/NominalView";
import MethodView from "../../components/ui/sharedpayment/MethodView";
import FormView from "./components/FormView";
import QrisView from "../../components/ui/sharedpayment/QrisView";
import VaView from "../../components/ui/sharedpayment/VaView";

export default function FormDonasiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const { campaign, loading, error, user } = useCampaignDetail(slug);

  // State Navigasi Antar View
  const [currentView, setCurrentView] = useState<"nominal" | "method" | "form" | "qris" | "va">("nominal");

  // State Form Data
  const [amount, setAmount] = useState<number | "">("");
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [name, setName] = useState(user?.full_name || user?.name || "");
  const [email, setEmail] = useState(user?.email || user?.phone_number || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [doa, setDoa] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State Response API (Menampung data QRIS & VA)
  const [transactionData, setTransactionData] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="relative w-11 h-11">
          <div className="absolute inset-0 border-[3px] border-[#7C3996]/15 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-transparent border-t-[#7C3996] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-slate-500 font-medium">Data program Donasi tidak ditemukan.</p>
      </div>
    );
  }

  const handleBack = () => {
    if (currentView === "nominal") router.back();
    else if (currentView === "method") setCurrentView("nominal");
    else if (currentView === "form") setCurrentView("method");
    else if (currentView === "qris" || currentView === "va") setCurrentView("form");
  };

  const handleNextToForm = () => {
    if (!amount || amount < 1000) return toast.error("Minimal donasi Rp 1.000");
    setCurrentView("method");
  };

  const handleSubmitPayment = async () => {
    // Validasi Input
    if (!name && !isAnonymous) return toast.error("Nama wajib diisi");
    if (!email) return toast.error("Email atau No.HP wajib diisi");
    if (!amount || amount < 1000) return toast.error("Minimal donasi Rp 1.000");

    // Validasi Lapis Dua untuk VA
    const instanMethods = ["QRIS", "ASTRAPAY"];
    if (!instanMethods.includes(selectedMethod.id) && amount < 10000) {
      return toast.error(`Minimal nominal untuk metode ${selectedMethod.name} adalah Rp 10.000`);
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Memproses donasi...");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || sessionStorage.getItem("access_token") : null;
      const finalName = isAnonymous ? "Hamba Allah" : name;
      const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Mapping Format Bank Backend (Misal: MANDIRI -> MANDIRI_VA)
      const isRetailOrQR = ["QRIS", "ASTRAPAY", "INDOMARET", "AKULAKU"].includes(selectedMethod.id);
      const apiPaymentMethod = isRetailOrQR ? selectedMethod.id : `${selectedMethod.id}_VA`;

      const payload = {
        campaign_id: campaign?.id || campaign?.campaign_code,
        campaign_name: campaign?.title || campaign?.name || "Donasi",
        sender_name: finalName,
        sender_phone: email, 
        amount: Number(amount),
        transfer_notes: doa || "Tanpa pesan",
        payment_method: apiPaymentMethod // 🔥 Dikirim sesuai format v2 (Cth: MANDIRI_VA)
      };

      // 🔥 HIT ENDPOINT V2 UNTUK SEMUA METODE DONASI
      // Sesuaikan URL jika endpoint Donasi Anda menggunakan '/api/campaigns/...'
      const response = await fetch(`${GATEWAY_URL}/campaigns/create/v2/transaction-donasi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.message || "Gagal membuat transaksi Donasi");
      }

      toast.success("Checkout Donasi berhasil!", { id: loadingToast });
      
      // Simpan Data Respon API
      setTransactionData(result.data);

      // Arahkan tampilan sesuai Metode Pembayaran (In-App, tanpa redirect)
      if (selectedMethod.id === "QRIS") {
        setCurrentView("qris");
      } else {
        setCurrentView("va");
      }

    } catch (err: any) {
      console.error("Payment Error:", err);
      toast.error(
        err.message || "Terjadi kesalahan sistem saat memproses transaksi",
        { id: loadingToast, style: { borderRadius: "12px" } }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {currentView === "nominal" && (
        <NominalView
          transactionType="donasi"
          campaign={campaign} 
          amount={amount} 
          setAmount={setAmount} 
          onNext={handleNextToForm} 
          onBack={handleBack} 
        />
      )}
      
      {currentView === "method" && (
        <MethodView
          transactionType="donasi" 
          amount={amount} 
          selectedMethod={selectedMethod} 
          onSelectMethod={(m) => { 
            setSelectedMethod(m); 
            setCurrentView("form"); 
          }} 
          onBack={handleBack} 
        />
      )}
      
      {currentView === "form" && (
        <FormView 
          campaign={campaign} 
          amount={amount} 
          selectedMethod={selectedMethod} 
          name={name} 
          setName={setName} 
          email={email} 
          setEmail={setEmail} 
          isAnonymous={isAnonymous} 
          setIsAnonymous={setIsAnonymous} 
          doa={doa} 
          setDoa={setDoa} 
          onSubmit={handleSubmitPayment} 
          isProcessing={isProcessing} 
          onBack={handleBack} 
          onChangeMethod={() => setCurrentView("method")} 
        />
      )}

      {currentView === "qris" && (
        <QrisView
          transactionType="donasi" 
          qrisData={transactionData} 
          amount={amount} 
          onBack={handleBack} 
          onCheckStatus={() => router.push("/ProfilePage/HistoryWakafPage")}
        />
      )}

      {currentView === "va" && (
        <VaView
          transactionType="donasi"
          vaData={{ va_number: transactionData?.payment_code || transactionData?.va_number }} 
          amount={amount} 
          selectedMethod={selectedMethod} 
          onBack={handleBack} 
          onCheckStatus={() => router.push("/ProfilePage/HistoryWakafPage")} 
        />
      )}
    </>
  );
}