"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useCampaignDetail } from "../hooks/useCampaignDetail";
import { generateDynamicQris } from "@/lib/qrisDinamis";

// Import komponen View
import NominalView from "../../components/ui/sharedpayment/NominalView";
import FormView from "./components/FormView";
import VaView from "../../components/ui/sharedpayment/VaView";
import QrisSementara from "../../components/ui/sharedpayment/QrisSementara"; 

// ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Buka comment di bawah ini
// import MethodView from "../../components/ui/sharedpayment/MethodView";
// import QrisView from "../../components/ui/sharedpayment/QrisView";

export default function FormDonasiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const { campaign, loading, error, user } = useCampaignDetail(slug);

  // GANTI DENGAN QRIS YAYASAN ANDA
  const QRIS_YAYASAN_STATIS = "00020101021126570011ID.DANA.WWW011893600915348406432302094840643230303UMI51440014ID.CO.QRIS.WWW0215ID10232809145820303UMI5204839853033605802ID5918www.filantropi.net6015Kota Jakarta Ti61051322063049E94";

  // State Navigasi
  // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Tambahkan kembali "method" ke dalam useState ini jika MethodView diaktifkan
  const [currentView, setCurrentView] = useState<"nominal" | "method" | "form" | "qris" | "va">("nominal");

  // State Form Data
  const [amount, setAmount] = useState<number | "">("");
  
  // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Ubah nilai awal state ini menjadi `null`
  const [selectedMethod, setSelectedMethod] = useState<any>({
    id: "QRIS", name: "QRIS Dinamis", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg"
  });

  const [name, setName] = useState(user?.full_name || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [doa, setDoa] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [qrisString, setQrisString] = useState<string>("");
  const [transactionData, setTransactionData] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="relative w-11 h-11"><div className="absolute inset-0 border-[3px] border-[#7C3996]/15 rounded-full" /><div className="absolute inset-0 border-[3px] border-transparent border-t-[#7C3996] rounded-full animate-spin" /></div>
      </div>
    );
  }

  if (error || !campaign) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><p className="text-slate-500 font-medium">Data program tidak ditemukan.</p></div>;
  }

  const handleBack = () => {
    if (currentView === "nominal") router.back();
    // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Aktifkan baris currentView === "method" dan ubah tujuan currentView === "form" ke "method"
    // else if (currentView === "method") setCurrentView("nominal");
    // else if (currentView === "form") setCurrentView("method");
    else if (currentView === "form") setCurrentView("nominal"); 
    else if (currentView === "qris" || currentView === "va") setCurrentView("form");
  };

  const handleNextToForm = () => {
    if (!amount || amount < 1000) return toast.error("Minimal donasi Rp 1.000");
    // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Ubah "form" menjadi "method"
    setCurrentView("form");
  };

  const handleSubmitPayment = async () => {
    if (!name && !isAnonymous) return toast.error("Nama wajib diisi");
    if (!email) return toast.error("Email wajib diisi");
    if (!phone) return toast.error("Nomor telepon wajib diisi");
    if (!amount || amount < 1000) return toast.error("Minimal donasi Rp 1.000");

    setIsProcessing(true);
    const loadingToast = toast.loading("Memproses donasi...");

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || sessionStorage.getItem("access_token") : null;
    const finalName = isAnonymous ? "Hamba Allah" : name;
    const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;

    try {
      /* ====================================================================
         ⚠️ CARA KEMBALI KE PAYMENT GATEWAY (HAPUS COMMENT BLOK INI, DAN HAPUS BLOK MANUAL DI BAWAHNYA)
         ====================================================================
      const isRetailOrQR = ["QRIS", "ASTRAPAY", "INDOMARET"].includes(selectedMethod.id);
      const apiPaymentMethod = isRetailOrQR ? selectedMethod.id : `${selectedMethod.id}_VA`;

      const payload = {
        campaign_id: campaign?.id || campaign?.campaign_code,
        campaign_name: campaign?.title || campaign?.name || "Donasi",
        sender_name: finalName,
        sender_phone: phone,
        sender_email: email,
        amount: Number(amount),
        transfer_notes: doa || "Tanpa pesan",
        payment_method: apiPaymentMethod 
      };

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
      if (!response.ok || result.error) throw new Error(result.message || "Gagal membuat transaksi Donasi");

      toast.success("Checkout Donasi berhasil!", { id: loadingToast });
      setTransactionData(result.data);

      if (selectedMethod.id === "QRIS") {
        setCurrentView("qris");
      } else {
        setCurrentView("va");
      }
      ==================================================================== */

      // ====================================================================
      // 🔥 LOGIKA SEMENTARA: QRIS DINAMIS MANUAL (HAPUS INI JIKA KEMBALI KE PAYMENT GATEWAY)
      // ====================================================================
      const dynamicQris = generateDynamicQris(QRIS_YAYASAN_STATIS, Number(amount));
      setQrisString(dynamicQris);

      const payloadManual = {
        campaign_id: campaign?.id || campaign?.campaign_code,
        campaign_name: campaign?.title || campaign?.name || "Donasi",
        sender_name: finalName,
        sender_phone: phone,
        sender_email: email,
        amount: Number(amount),
        transfer_notes: doa || "Tanpa pesan",
        payment_method: "QRIS",
        payment_code: dynamicQris
      };

      await fetch(`${GATEWAY_URL}/campaigns/create/v2/transaction-donasi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payloadManual),
      }).catch((err) => console.warn("Pencatatan background gagal", err));

      setCurrentView("qris");
      toast.success("Berhasil! Silakan scan QRIS", { id: loadingToast });
      // ====================================================================

    } catch (err: any) {
      console.error("Payment Error:", err);
      toast.error(err.message || "Terjadi kesalahan sistem", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {currentView === "nominal" && (
        <NominalView transactionType="donasi" campaign={campaign} amount={amount} setAmount={setAmount} onNext={handleNextToForm} onBack={handleBack} />
      )}
      
      {/* ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Buka comment MethodView di bawah ini */}
      {/* {currentView === "method" && (
        <MethodView transactionType="donasi" amount={amount} selectedMethod={selectedMethod} onSelectMethod={(m) => { setSelectedMethod(m); setCurrentView("form"); }} onBack={handleBack} />
      )} */}
      
      {currentView === "form" && (
        <FormView 
          campaign={campaign} amount={amount} selectedMethod={selectedMethod} 
          name={name} setName={setName} phone={phone} setPhone={setPhone} email={email} setEmail={setEmail} 
          isAnonymous={isAnonymous} setIsAnonymous={setIsAnonymous} doa={doa} setDoa={setDoa} 
          onSubmit={handleSubmitPayment} isProcessing={isProcessing} onBack={handleBack} 
          
          // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Ubah isi onChangeMethod menjadi () => setCurrentView("method")
          onChangeMethod={() => toast.success("Saat ini kami hanya menerima QRIS sementara.")} 
        />
      )}

      {/* ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Hapus QrisSementara, dan buka comment QrisView bawaan */}
      {currentView === "qris" && (
        <QrisSementara amount={amount} qrisString={qrisString} transactionType="donasi" onBack={handleBack} onCheckStatus={() => router.push("/HomePage")} />
      )}

      {/* {currentView === "qris" && (
        <QrisView transactionType="donasi" qrisData={transactionData} amount={amount} onBack={handleBack} onCheckStatus={() => router.push("/HomePage")} />
      )} */}

      {currentView === "va" && (
        <VaView transactionType="donasi" vaData={{ va_number: transactionData?.payment_code || transactionData?.va_number }} amount={amount} selectedMethod={selectedMethod} onBack={handleBack} onCheckStatus={() => router.push("/HomePage")} />
      )}
    </>
  );
}