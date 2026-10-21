/**
 * app/(main)/wakaf/[slug]/donate/page.tsx
 *
 * Fungsi   : Alur wakaf bertahap (niat/nama -> nominal -> ikrar -> form -> QRIS/VA) dengan validasi nama dan minimal Rp 1.000.
 * Ekspor   : default FormWakafPage
 * Dipakai  : Route /wakaf/[slug]/donate; dari tombol WakafBottomBar pada halaman detail wakaf.
 * Catatan  : "use client"; mengirim extraPayload NIK; MethodView dinonaktifkan sehingga QRIS menjadi default.
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCampaignDetail } from "@/hooks/useCampaignDetail";
import { useTransactionSubmit } from "@/hooks/useTransactionSubmit";

import NameSelectionView from "./_components/NameSelectionView";
import PledgeView from "./_components/PledgeView";
import NominalView from "@/components/payment/NominalView";
import FormWakafView from "./_components/FormView";
import VaView from "@/components/payment/VaView";
import QrisSementara from "@/components/payment/QrisSementara";

// ⚠️ CARA KEMBALI KE PAYMENT GATEWAY: Buka comment di bawah ini
// import MethodView from "@/components/payment/MethodView";
// import QrisView from "@/components/payment/QrisView";

export default function FormWakafPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { campaign, loading, error, user } = useCampaignDetail(slug);

  // Logika transaksi (guard, validasi, QRIS, pencatatan gateway) — lihat hooks/useTransactionSubmit.ts
  const { isProcessing, qrisString, transactionData, submit, resetProcessing } = useTransactionSubmit();

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
    else if (currentView === "qris" || currentView === "va") {
      resetProcessing();
      setCurrentView("form");
    }
  };

  const handleSubmitPayment = () => {
    submit({
      transactionType: "wakaf",
      campaignId: campaign?.id || campaign?.campaign_code,
      campaignName: campaign?.title || campaign?.name || "Wakaf",
      senderName: wakafFor === "other" && representativeName.trim() !== "" ? representativeName : name,
      email,
      phone,
      amount,
      transferNotes: doa,
      extraPayload: { nik: nik || "" },
      validateExtra: () => (!name.trim() ? "Nama wajib diisi" : null),
      onShowQris: () => setCurrentView("qris"),
    });
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
        <QrisSementara amount={amount} qrisString={qrisString} transactionType="wakaf" onBack={handleBack} onCheckStatus={() => router.push("/")} />
      )}

      {/* {currentView === "qris" && (
        <QrisView transactionType="wakaf" qrisData={transactionData} amount={amount} onBack={handleBack} onCheckStatus={() => router.push("/")} />
      )} */}

      {currentView === "va" && (
        <VaView transactionType="wakaf" vaData={{ va_number: transactionData?.payment_code || transactionData?.va_number }} amount={amount} selectedMethod={selectedMethod} onBack={handleBack} onCheckStatus={() => router.push("/")} />
      )}
    </>
  );
}
