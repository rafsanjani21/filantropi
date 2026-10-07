"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useCampaignDetail } from "../../DetailPage/hooks/useCampaignDetail";

// Import Komponen View
import NameSelectionView from "./components/NameSelectionView";
import PledgeView from "./components/PledgeView";
import NominalView from "../../components/ui/sharedpayment/NominalView";
import MethodView from "../../components/ui/sharedpayment/MethodView";
import FormWakafView from "./components/FormView";
import QrisView from "../../components/ui/sharedpayment/QrisView";
import VaView from "../../components/ui/sharedpayment/VaView"; 

export default function FormWakafPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const { campaign, loading, error, user } = useCampaignDetail(slug);

  // STATE NAVIGASI ALUR: Name -> Nominal -> Pledge -> Method -> Form -> Payment
  const [currentView, setCurrentView] = useState<"name" | "nominal" | "pledge" | "method" | "form" | "qris" | "va">("name");

  // STATE DATA WAKAF
  const [wakafFor, setWakafFor] = useState<"self" | "other">("self");
  const [representativeName, setRepresentativeName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  // STATE DATA KONTAK & DOA
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nik, setNik] = useState("");
  const [doa, setDoa] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);

  // Sinkronisasi data user jika sudah login
  useEffect(() => {
    if (user) {
      if (!name) setName(user.full_name || user.name || "");
      if (!email) setEmail(user.email || "");
      if (!phone) setPhone(user.phone_number || user.phone || "");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-[3px] border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-slate-500 font-medium">Data program Wakaf tidak ditemukan.</p>
      </div>
    );
  }

  // LOGIKA NAVIGASI TOMBOL KEMBALI
  const handleBack = () => {
    if (currentView === "name") router.back();
    else if (currentView === "nominal") setCurrentView("name");
    else if (currentView === "pledge") setCurrentView("nominal");
    else if (currentView === "method") setCurrentView("pledge");
    else if (currentView === "form") setCurrentView("method");
    else if (currentView === "qris" || currentView === "va") setCurrentView("form");
  };

  const handleSubmitPayment = async () => {
    // Validasi Form Akhir
    if (!name.trim()) return toast.error("Nama wajib diisi untuk bukti resi");
    if (!email.trim() || !email.includes("@")) return toast.error("Email yang valid wajib diisi");
    if (!phone.trim()) return toast.error("Nomor telepon wajib diisi");
    if (!amount) return toast.error("Nominal wakaf wajib diisi");
    if (!selectedMethod) return toast.error("Metode pembayaran wajib dipilih");
    
    setIsProcessing(true);
    const loadingToast = toast.loading("Memproses ikrar wakaf...");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || sessionStorage.getItem("access_token") : null;
      const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Mapping Format Bank Backend
      const isRetailOrQR = ["QRIS", "ASTRAPAY", "INDOMARET", "AKULAKU"].includes(selectedMethod.id);
      const apiPaymentMethod = isRetailOrQR ? selectedMethod.id : `${selectedMethod.id}_VA`;

      // Logika Penamaan Pengirim (Jika untuk orang lain, pakai nama representatif)
      const finalSenderName = wakafFor === "other" && representativeName.trim() !== "" ? representativeName : name;

      const payload = {
        campaign_id: campaign?.id || campaign?.campaign_code,
        campaign_name: campaign?.title || campaign?.name || "Wakaf",
        sender_name: finalSenderName,
        sender_email: email,
        sender_phone: phone, 
        amount: Number(amount),
        transfer_notes: doa || "Semoga berkah", 
        payment_method: apiPaymentMethod 
      };

      const response = await fetch(`${GATEWAY_URL}/campaigns/create/v2/transaction-wakaf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
          ...(token ? { Authorization: `Bearer ${token}` } : {}), // Opsional
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.error) throw new Error(result.message || "Gagal membuat transaksi Wakaf");

      toast.success("Checkout Wakaf berhasil!", { id: loadingToast });
      setTransactionData(result.data);
      
      // Arahkan ke Halaman QRIS atau VA
      setCurrentView(selectedMethod.id === "QRIS" ? "qris" : "va");

    } catch (err: any) {
      console.error("Payment Error:", err);
      toast.error(err.message || "Terjadi kesalahan sistem", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* 1. PEMILIHAN NIAT WAKAF */}
      {currentView === "name" && (
        <NameSelectionView 
          wakafFor={wakafFor} setWakafFor={setWakafFor} 
          representativeName={representativeName} setRepresentativeName={setRepresentativeName}
          name={name} setName={setName} 
          onNext={() => {
            if (wakafFor === "self" && !name.trim()) return toast.error("Nama lengkap wajib diisi");
            if (wakafFor === "other" && !representativeName.trim()) return toast.error("Nama almarhum/keluarga wajib diisi");
            setCurrentView("nominal"); 
          }} 
          onBack={handleBack} 
        />
      )}
      
      {/* 2. PEMILIHAN NOMINAL */}
      {currentView === "nominal" && (
        <NominalView 
          transactionType="wakaf" 
          amount={amount} setAmount={setAmount} 
          onNext={() => { 
            if (!amount || amount < 1000) return toast.error("Minimal wakaf Rp 1.000"); 
            setCurrentView("pledge"); 
          }} 
          onBack={handleBack} 
        />
      )}

      {/* 3. TAMPILAN IKRAR */}
      {currentView === "pledge" && (
        <PledgeView 
          userName={name || "Hamba Allah"} 
          wakafFor={wakafFor} 
          representativeName={representativeName} 
          onNext={() => setCurrentView("method")} 
          onBack={handleBack} 
        />
      )}
      
      {/* 4. PEMILIHAN METODE PEMBAYARAN */}
      {currentView === "method" && (
        <MethodView 
          transactionType="wakaf" 
          amount={amount} selectedMethod={selectedMethod} 
          onSelectMethod={(m) => { setSelectedMethod(m); setCurrentView("form"); }} 
          onBack={handleBack} 
        />
      )}
      
      {/* 5. FORM DATA DIRI DAN DOA */}
      {currentView === "form" && (
        <FormWakafView 
          amount={amount} selectedMethod={selectedMethod} 
          wakafName={wakafFor === "other" && representativeName ? representativeName : (name || "Hamba Allah")}
          name={name} setName={setName} 
          email={email} setEmail={setEmail} 
          doa={doa} setDoa={setDoa}
          phone={phone} setPhone={setPhone}
          nik={nik} setNik={setNik}
          onSubmit={handleSubmitPayment} isProcessing={isProcessing} onBack={handleBack} onChangeMethod={() => setCurrentView("method")}
        />
      )}

      {/* 6A. TAMPILAN QRIS */}
      {currentView === "qris" && (
        <QrisView 
          transactionType="wakaf" 
          qrisData={transactionData} amount={amount} 
          onBack={handleBack} onCheckStatus={() => router.push("/HomePage")} 
        />
      )}

      {/* 6B. TAMPILAN VIRTUAL ACCOUNT */}
      {currentView === "va" && (
        <VaView 
          transactionType="wakaf" 
          vaData={{ va_number: transactionData?.payment_code || transactionData?.va_number }} 
          amount={amount} selectedMethod={selectedMethod} 
          onBack={handleBack} onCheckStatus={() => router.push("/HomePage")} 
        />
      )}
    </>
  );
}