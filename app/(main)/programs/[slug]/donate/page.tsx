/**
 * app/(main)/programs/[slug]/donate/page.tsx
 *
 * Fungsi   : Mengatur alur donasi (nominal -> method -> form -> QRIS/VA) dan mengirim transaksi lewat useTransactionSubmit.
 * Ekspor   : default FormDonasiPage
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCampaignDetail } from "@/hooks/useCampaignDetail";
import { useTransactionSubmit } from "@/hooks/useTransactionSubmit";
import { getAmountError } from "@/lib/validation";
import type { PaymentMethod } from "@/types";

// Import komponen View
import NominalView from "@/components/payment/NominalView";
import FormView from "./_components/FormView";
import VaView from "@/components/payment/VaView";
import MethodView from "@/components/payment/MethodView";
import QrisView from "@/components/payment/QrisView";

export default function FormDonasiPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { campaign, loading, error, user } = useCampaignDetail(slug);

  const {
    isProcessing,
    transactionData,
    fieldErrors,
    clearFieldError,
    transactionId,
    submit,
    resetProcessing,
  } = useTransactionSubmit();

  // State Navigasi
  const [currentView, setCurrentView] = useState<"nominal" | "method" | "form" | "qris" | "va">("nominal");

  // State Form Data
  const [amount, setAmount] = useState<number | "">("");

  // Mengizinkan state awal null agar pemilihan metode di MethodView diwajibkan
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const [name, setName] = useState(user?.full_name || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [doa, setDoa] = useState("");
  const prefilled = useRef(false);

  useEffect(() => {
    if (user && !prefilled.current) {
      setName(user.full_name || user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone_number || user.phone || "");
      prefilled.current = true;
    }
  }, [user]);

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
        <p className="text-slate-500 font-medium">Data program tidak ditemukan.</p>
      </div>
    );
  }

  const handleBack = () => {
    if (currentView === "nominal") router.back();
    else if (currentView === "method") setCurrentView("nominal");
    else if (currentView === "form") setCurrentView("method");
    else if (currentView === "qris" || currentView === "va") {
      resetProcessing();
      setCurrentView("form");
    }
  };

  const handleNextToForm = () => {
    const amountError = getAmountError(amount, "donasi");
    if (amountError) return toast.error(amountError);
    // Masuk ke tahap pemilihan metode pembayaran
    setCurrentView("method");
  };

  const handleSubmitPayment = () => {
    submit({
      transactionType: "donasi",
      campaignId: campaign?.id || campaign?.campaign_code,
      campaignName: campaign?.title || campaign?.name || "Donasi",
      senderName: isAnonymous ? "Hamba Allah" : name.trim(),
      email,
      phone,
      amount,
      transferNotes: doa,
      // Pass the selected method payload if required by backend
      paymentMethod: selectedMethod?.id, 
      validateExtra: () =>
        !name.trim() && !isAnonymous
          ? { field: "name", message: "Nama wajib diisi" }
          : null,
      onShowQris: () => {
        if (selectedMethod?.id === "qris" || transactionData?.payment_method === "qris") {
          setCurrentView("qris");
        } else {
          setCurrentView("va");
        }
      },
    });
  };

  const handleCheckStatus = () => {
    const query = new URLSearchParams({ type: "donasi" });
    if (transactionId) query.set("trx_id", String(transactionId));
    if (amount !== "") query.set("amount", String(amount));
    router.push(`/payment/pending?${query.toString()}`);
  };

  return (
    <>
      {currentView === "nominal" && (
        <NominalView
          transactionType="donasi"
          campaign={campaign}
          amount={amount}
          setAmount={(v) => { clearFieldError("amount"); setAmount(v); }}
          onNext={handleNextToForm}
          onBack={handleBack}
        />
      )}

      {currentView === "method" && (
        <MethodView 
          transactionType="donasi" 
          amount={amount} 
          selectedMethod={selectedMethod} 
          onSelectMethod={(m) => { setSelectedMethod(m); setCurrentView("form"); }} 
          onBack={handleBack} 
        />
      )}

      {/* Gunakan operator and (&& selectedMethod) untuk mencegah error TS null */}
      {currentView === "form" && selectedMethod && (
        <FormView
          amount={amount} 
          selectedMethod={selectedMethod}
          name={name} setName={(v) => { clearFieldError("name"); setName(v); }}
          phone={phone} setPhone={(v) => { clearFieldError("phone"); setPhone(v); }}
          email={email} setEmail={(v) => { clearFieldError("email"); setEmail(v); }}
          isAnonymous={isAnonymous}
          setIsAnonymous={(v) => { if (v) clearFieldError("name"); setIsAnonymous(v); }}
          doa={doa} setDoa={setDoa}
          onSubmit={handleSubmitPayment} 
          isProcessing={isProcessing} 
          onBack={handleBack}
          errors={fieldErrors}
          onChangeMethod={() => setCurrentView("method")}
        />
      )}

      {currentView === "qris" && (
        <QrisView 
          transactionType="donasi" 
          qrisData={{ ...transactionData, qris_url: transactionData?.qris_url }} 
          amount={amount} 
          onBack={handleBack} 
          onCheckStatus={handleCheckStatus} 
        />
      )}

      {currentView === "va" && selectedMethod && (
        <VaView 
          transactionType="donasi" 
          vaData={{ 
            // Parsing khusus untuk Mandiri VA vs VA Lainnya
            va_number: transactionData?.payment_method === "mandiri_va" 
              ? `${transactionData?.biller_code || ""}${transactionData?.bill_key || ""}`
              : transactionData?.va_number,
            expiry_time: transactionData?.expiry_time
          }} 
          amount={amount} 
          selectedMethod={selectedMethod} 
          onBack={handleBack} 
          onCheckStatus={handleCheckStatus} 
        />
      )}
    </>
  );
}