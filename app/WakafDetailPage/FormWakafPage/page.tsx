"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useCampaignDetail } from "../../DetailPage/hooks/useCampaignDetail";
import { generateDynamicQris } from "@/lib/qrisDinamis";

import NameSelectionView from "./components/NameSelectionView";
import PledgeView from "./components/PledgeView";
import NominalView from "../../components/ui/sharedpayment/NominalView";
import FormWakafView from "./components/FormView";
import VaView from "../../components/ui/sharedpayment/VaView"; 
import QrisSementara from "../../components/ui/sharedpayment/QrisSementara";

// ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Buka comment di bawah ini
// import MethodView from "../../components/ui/sharedpayment/MethodView";
// import QrisView from "../../components/ui/sharedpayment/QrisView";

export default function FormWakafPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const { campaign, loading, error, user } = useCampaignDetail(slug);

  const QRIS_YAYASAN_STATIS = "00020101021126570011ID.DANA.WWW011893600915348406432302094840643230303UMI51440014ID.CO.QRIS.WWW0215ID10232809145820303UMI5204839853033605802ID5918www.filantropi.net6015Kota Jakarta Ti61051322063049E94";

  // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Pastikan ada opsi "method"
  const [currentView, setCurrentView] = useState<"name" | "nominal" | "pledge" | "method" | "form" | "qris" | "va">("name");

  const [wakafFor, setWakafFor] = useState<"self" | "other">("self");
  const [representativeName, setRepresentativeName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  
  // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Ubah nilai default ini jadi null
  const [selectedMethod, setSelectedMethod] = useState<any>({
    id: "QRIS", name: "QRIS Dinamis", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg"
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nik, setNik] = useState("");
  const [doa, setDoa] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrisString, setQrisString] = useState<string>("");
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.full_name || user.name || "");
      if (!email) setEmail(user.email || "");
      if (!phone) setPhone(user.phone_number || user.phone || "");
    }
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-[3px] border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" /></div>;
  if (error || !campaign) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Data program tidak ditemukan.</p></div>;

  const handleBack = () => {
    if (currentView === "name") router.back();
    else if (currentView === "nominal") setCurrentView("name");
    else if (currentView === "pledge") setCurrentView("nominal");
    // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Aktifkan "method" -> "pledge" dan "form" -> "method"
    // else if (currentView === "method") setCurrentView("pledge");
    // else if (currentView === "form") setCurrentView("method");
    else if (currentView === "form") setCurrentView("pledge");
    else if (currentView === "qris" || currentView === "va") setCurrentView("form");
  };

  const handleSubmitPayment = async () => {
    if (!name.trim()) return toast.error("Nama wajib diisi");
    if (!email.trim() || !email.includes("@")) return toast.error("Email wajib diisi");
    if (!phone.trim()) return toast.error("Nomor telepon wajib diisi");
    if (!amount) return toast.error("Nominal wajib diisi");
    
    setIsProcessing(true);
    const loadingToast = toast.loading("Memproses ikrar wakaf...");

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || sessionStorage.getItem("access_token") : null;
    const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;
    const finalSenderName = wakafFor === "other" && representativeName.trim() !== "" ? representativeName : name;

    try {
      /* ====================================================================
         ⚠️ CARA KEMBALI KE PAYMENT GATEWAY (HAPUS COMMENT BLOK INI, HAPUS BLOK MANUAL DI BAWAHNYA)
         ====================================================================
      const isRetailOrQR = ["QRIS", "ASTRAPAY", "INDOMARET", "AKULAKU"].includes(selectedMethod.id);
      const apiPaymentMethod = isRetailOrQR ? selectedMethod.id : `${selectedMethod.id}_VA`;

      const payload = {
        campaign_id: campaign?.id || campaign?.campaign_code,
        campaign_name: campaign?.title || campaign?.name || "Wakaf",
        sender_name: finalSenderName,
        sender_email: email,
        sender_phone: phone, 
        nik: nik || "",
        amount: Number(amount),
        transfer_notes: doa || "Semoga berkah", 
        payment_method: apiPaymentMethod 
      };

      const response = await fetch(`${GATEWAY_URL}/campaigns/create/v2/transaction-wakaf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.message || "Gagal membuat transaksi Wakaf");

      toast.success("Checkout Wakaf berhasil!", { id: loadingToast });
      setTransactionData(result.data);
      setCurrentView(selectedMethod.id === "QRIS" ? "qris" : "va");
      ==================================================================== */

      // ====================================================================
      // 🔥 LOGIKA SEMENTARA: QRIS DINAMIS MANUAL
      // ====================================================================
      const dynamicQris = generateDynamicQris(QRIS_YAYASAN_STATIS, Number(amount));
      setQrisString(dynamicQris);

      const payloadManual = {
        campaign_id: campaign?.id || campaign?.campaign_code,
        campaign_name: campaign?.title || campaign?.name || "Wakaf",
        sender_name: finalSenderName,
        sender_email: email,
        sender_phone: phone, 
        nik: nik || "",
        amount: Number(amount),
        transfer_notes: doa || "Semoga berkah", 
        payment_method: "QRIS",
        payment_code: dynamicQris, 
      };

      await fetch(`${GATEWAY_URL}/campaigns/create/v2/transaction-wakaf`, {
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
      {currentView === "name" && (
        <NameSelectionView wakafFor={wakafFor} setWakafFor={setWakafFor} representativeName={representativeName} setRepresentativeName={setRepresentativeName} name={name} setName={setName} onNext={() => { if (wakafFor === "self" && !name.trim()) return toast.error("Nama lengkap wajib diisi"); if (wakafFor === "other" && !representativeName.trim()) return toast.error("Nama almarhum/keluarga wajib diisi"); setCurrentView("nominal"); }} onBack={handleBack} />
      )}
      
      {currentView === "nominal" && (
        <NominalView transactionType="wakaf" amount={amount} setAmount={setAmount} onNext={() => { if (!amount || amount < 1000) return toast.error("Minimal wakaf Rp 1.000"); setCurrentView("pledge"); }} onBack={handleBack} />
      )}

      {currentView === "pledge" && (
        // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Ubah onNext menjadi setCurrentView("method")
        <PledgeView userName={name || "Hamba Allah"} wakafFor={wakafFor} representativeName={representativeName} onNext={() => setCurrentView("form")} onBack={handleBack} />
      )}
      
      {/* ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Buka comment MethodView */}
      {/* {currentView === "method" && (
        <MethodView transactionType="wakaf" amount={amount} selectedMethod={selectedMethod} onSelectMethod={(m) => { setSelectedMethod(m); setCurrentView("form"); }} onBack={handleBack} />
      )} */}
      
      {currentView === "form" && (
        <FormWakafView amount={amount} selectedMethod={selectedMethod} wakafName={wakafFor === "other" && representativeName ? representativeName : (name || "Hamba Allah")} name={name} setName={setName} email={email} setEmail={setEmail} doa={doa} setDoa={setDoa} phone={phone} setPhone={setPhone} nik={nik} setNik={setNik} onSubmit={handleSubmitPayment} isProcessing={isProcessing} onBack={handleBack} 
          // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Ubah menjadi () => setCurrentView("method")
          onChangeMethod={() => toast.success("Saat ini kami hanya menerima QRIS sementara.")} 
        />
      )}

      {/* ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Hapus QrisSementara, aktifkan QrisView Asli */}
      {currentView === "qris" && (
        <QrisSementara amount={amount} qrisString={qrisString} transactionType="wakaf" onBack={handleBack} onCheckStatus={() => router.push("/HomePage")} />
      )}

      {/* {currentView === "qris" && (
        <QrisView transactionType="wakaf" qrisData={transactionData} amount={amount} onBack={handleBack} onCheckStatus={() => router.push("/HomePage")} />
      )} */}

      {currentView === "va" && (
        <VaView transactionType="wakaf" vaData={{ va_number: transactionData?.payment_code || transactionData?.va_number }} amount={amount} selectedMethod={selectedMethod} onBack={handleBack} onCheckStatus={() => router.push("/HomePage")} />
      )}
    </>
  );
}