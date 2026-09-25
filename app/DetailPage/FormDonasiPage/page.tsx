"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCampaignDetail } from "../hooks/useCampaignDetail";

// Impor komponen yang sudah dipecah
import NominalView from "./components/NominalView";
import MethodView from "./components/MethodView";
import FormView from "./components/FormView";
import QrisView from "./components/QrisView";

function FormDonasiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug");

  const { campaign, loading, user } = useCampaignDetail(slug);

  const [currentView, setCurrentView] = useState<"nominal" | "form" | "method" | "qris">("nominal");
  const [amount, setAmount] = useState<number | "">("");
  const [selectedMethod, setSelectedMethod] = useState({ id: "QRIS", name: "QRIS", type: "instan" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [doa, setDoa] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrisData, setQrisData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setName(user.full_name || user.name || "");
      setEmail(user.email || user.phone_number || "");
    }
  }, [user]);

  const handleBack = () => {
    if (currentView === "nominal" || currentView === "qris") {
      router.back();
    } else if (currentView === "form") {
      setCurrentView("nominal");
    } else if (currentView === "method") {
      setCurrentView("form");
    }
  };

  const handleNextToForm = () => {
    if (!amount || amount < 1000) return toast.error("Minimal donasi Rp 1.000");
    setCurrentView("form");
  };

  const handleSubmitPayment = async () => {
    if (!name && !isAnonymous) return toast.error("Nama wajib diisi");
    if (!email) return toast.error("Email/No.HP wajib diisi");
    if (!amount || amount < 1000) return toast.error("Minimal donasi Rp 1.000");
    const instanMethods = ["QRIS", "ASTRAPAY"];
    if (!instanMethods.includes(selectedMethod.id) && amount < 10000) {
      return toast.error(`Minimal nominal untuk metode ${selectedMethod.name} adalah Rp 10.000`);
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Memproses pembayaran...");

    try {
      const finalName = isAnonymous ? "Hamba Allah" : name;
      const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;

      if (selectedMethod.id === "QRIS") {
        const payload = {
          campaign_id: campaign?.id || campaign?.campaign_code,
          campaign_name: campaign?.title || "Donasi",
          sender_name: finalName,
          sender_phone: user?.phone || email,
          amount: Number(amount),
          transfer_notes: doa || "Tanpa pesan",
          payment_method: "QRIS",
        };

        const res = await fetch(`${GATEWAY_URL}/campaigns/create/v2/transaction-donasi`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Idempotency-Key": idempotencyKey,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok || result.error) throw new Error(result.message);

        toast.dismiss(loadingToast);
        setQrisData(result.data);
        setCurrentView("qris");
      } else {
        const payload = {
          amount: Number(amount),
          campaign_name: campaign?.title || "Donasi",
          campaign_id: campaign?.id || campaign?.campaign_code,
          sender_name: finalName,
          transfer_notes: doa || "Tanpa pesan",
          user_email: email,
        };

        const res = await fetch(`${GATEWAY_URL}/campaigns/create/transaction-donasi`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Idempotency-Key": idempotencyKey,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok || result.error) throw new Error(result.message);

        toast.dismiss(loadingToast);
        window.location.href = result.data.payment_url;
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses transaksi", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="animate-spin w-8 h-8 border-4 border-[#00AEEF] border-t-transparent rounded-full" /></div>;

  return (
    <>
      {currentView === "nominal" && <NominalView campaign={campaign} amount={amount} setAmount={setAmount} onNext={handleNextToForm} onBack={handleBack} />}
      {currentView === "method" && <MethodView amount={amount} selectedMethod={selectedMethod} onSelectMethod={(m) => { setSelectedMethod(m); setCurrentView("form"); }} onBack={handleBack} />}
      {currentView === "form" && <FormView campaign={campaign} amount={amount} selectedMethod={selectedMethod} name={name} setName={setName} email={email} setEmail={setEmail} isAnonymous={isAnonymous} setIsAnonymous={setIsAnonymous} doa={doa} setDoa={setDoa} onSubmit={handleSubmitPayment} isProcessing={isProcessing} onBack={handleBack} onChangeMethod={() => setCurrentView("method")} />}
      {currentView === "qris" && <QrisView qrisData={qrisData} amount={amount} onBack={handleBack} />}
    </>
  );
}

export default function FormDonasiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <FormDonasiContent />
    </Suspense>
  );
}