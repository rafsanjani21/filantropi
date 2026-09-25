"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCampaignDetail } from "../../DetailPage/hooks/useCampaignDetail";

import NameSelectionView from "./components/NameSelectionView";
import PledgeView from "./components/PledgeView";
import NominalView from "./components/NominalView";
import MethodView from "./components/MethodView"; 
import FormView from "./components/FormView";
import QrisView from "./components/QrisView"; 

function FormWakafContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug");

  const { campaign, loading, user } = useCampaignDetail(slug);

  const [currentView, setCurrentView] = useState<"name" | "pledge" | "nominal" | "form" | "method" | "qris">("name");
  
  // States Wakaf
  const [wakafFor, setWakafFor] = useState<"self" | "other">("self");
  const [representativeName, setRepresentativeName] = useState("");
  const [wakafName, setWakafName] = useState("");
  
  const [amount, setAmount] = useState<number | "">("");
  const [selectedMethod, setSelectedMethod] = useState({ id: "QRIS", name: "QRIS", type: "instan" });
  const [doa, setDoa] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrisData, setQrisData] = useState<any>(null);

  const handleBack = () => {
    if (currentView === "name" || currentView === "qris") router.back();
    else if (currentView === "pledge") setCurrentView("name");
    else if (currentView === "nominal") setCurrentView("pledge");
    else if (currentView === "form") setCurrentView("nominal");
    else if (currentView === "method") setCurrentView("form");
  };

  const handlePledgeSubmit = () => {
    setWakafName(wakafFor === "other" && representativeName ? representativeName : (user?.full_name || "Hamba Allah"));
    setCurrentView("nominal");
  };

  const handleSubmitPayment = async () => {
    if (!amount || amount < 1000) return toast.error("Minimal wakaf Rp 1.000");

    setIsProcessing(true);
    const loadingToast = toast.loading("Memproses wakaf...");

    try {
      const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;

      if (selectedMethod.id === "QRIS") {
        const payload = {
          campaign_id: campaign?.id || campaign?.campaign_code,
          campaign_name: campaign?.title || "Wakaf",
          sender_name: wakafName,
          sender_phone: user?.phone_number || user?.phone || "081234567890",
          amount: Number(amount),
          transfer_notes: doa || "Tanpa pesan",
          payment_method: "QRIS",
        };

        const res = await fetch(`${GATEWAY_URL}/campaigns/create/v2/transaction-wakaf`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Idempotency-Key": idempotencyKey, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
          campaign_name: campaign?.title || "Wakaf",
          campaign_id: campaign?.id || campaign?.campaign_code,
          sender_name: wakafName,
          transfer_notes: doa || "Tanpa pesan",
          user_email: user?.email || "hamba@allah.com",
        };

        const res = await fetch(`${GATEWAY_URL}/campaigns/create/transaction-wakaf`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Idempotency-Key": idempotencyKey, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>;

  return (
    <>
      {currentView === "name" && <NameSelectionView wakafFor={wakafFor} setWakafFor={setWakafFor} representativeName={representativeName} setRepresentativeName={setRepresentativeName} onNext={() => setCurrentView("pledge")} onBack={handleBack} />}
      {currentView === "pledge" && <PledgeView userName={user?.full_name || "Hamba Allah"} wakafFor={wakafFor} representativeName={representativeName} onNext={handlePledgeSubmit} onBack={handleBack} />}
      {currentView === "nominal" && <NominalView amount={amount} setAmount={setAmount} onNext={() => { if (!amount || amount < 1000) return toast.error("Minimal Rp 1.000"); setCurrentView("form"); }} onBack={handleBack} />}
      {currentView === "method" && <MethodView amount={amount} selectedMethod={selectedMethod} onSelectMethod={(m) => { setSelectedMethod(m); setCurrentView("form"); }} onBack={handleBack} />}
      {currentView === "form" && <FormView wakafName={wakafName} amount={amount} selectedMethod={selectedMethod} doa={doa} setDoa={setDoa} onSubmit={handleSubmitPayment} isProcessing={isProcessing} onBack={handleBack} onChangeMethod={() => setCurrentView("method")} user={user} />}
      {currentView === "qris" && <QrisView qrisData={qrisData} amount={amount} onBack={handleBack} />}
    </>
  );
}

export default function FormWakafPage() {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}><FormWakafContent /></Suspense>;
}