/**
 * app/(main)/programs/[slug]/donate/page.tsx
 *
 * Fungsi   : Mengatur alur donasi (nominal -> form -> QRIS/VA) dan mengirim transaksi lewat useTransactionSubmit dengan validasi minimal Rp 1.000.
 * Ekspor   : default FormDonasiPage
 * Dipakai  : Route /programs/[slug]/donate; dari halaman detail program dan alur auto-open donasi.
 * Catatan  : "use client"; MethodView dinonaktifkan sehingga metode default QRIS; kembali dari QRIS memanggil resetProcessing.
 */

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCampaignDetail } from "@/hooks/useCampaignDetail";
import { useTransactionSubmit } from "@/hooks/useTransactionSubmit";

// Import komponen View
import NominalView from "@/components/payment/NominalView";
import FormView from "./_components/FormView";
import VaView from "@/components/payment/VaView";
import QrisSementara from "@/components/payment/QrisSementara";

// ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Buka comment di bawah ini
// import MethodView from "@/components/payment/MethodView";
// import QrisView from "@/components/payment/QrisView";

export default function FormDonasiPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { campaign, loading, error, user } = useCampaignDetail(slug);

  // Logika transaksi (guard, validasi, QRIS, pencatatan gateway) — lihat hooks/useTransactionSubmit.ts
  const { isProcessing, qrisString, transactionData, submit, resetProcessing } = useTransactionSubmit();

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
    else if (currentView === "qris" || currentView === "va") {
      resetProcessing();
      setCurrentView("form");
    }
  };

  const handleNextToForm = () => {
    if (!amount || amount < 1000) return toast.error("Minimal donasi Rp 1.000");
    // ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Ubah "form" menjadi "method"
    setCurrentView("form");
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
      validateExtra: () => (!name.trim() && !isAnonymous ? "Nama wajib diisi" : null),
      onShowQris: () => setCurrentView("qris"),
    });
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
        <QrisSementara amount={amount} qrisString={qrisString} transactionType="donasi" onBack={handleBack} onCheckStatus={() => router.push("/")} />
      )}

      {/* {currentView === "qris" && (
        <QrisView transactionType="donasi" qrisData={transactionData} amount={amount} onBack={handleBack} onCheckStatus={() => router.push("/")} />
      )} */}

      {currentView === "va" && (
        <VaView transactionType="donasi" vaData={{ va_number: transactionData?.payment_code || transactionData?.va_number }} amount={amount} selectedMethod={selectedMethod} onBack={handleBack} onCheckStatus={() => router.push("/")} />
      )}
    </>
  );
}
