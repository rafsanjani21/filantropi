"use client";

import "@/lib/i18n"; // 🔥 Proteksi i18n
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, MessageSquare, Hash, User, CheckCircle2, AlertCircle, Coins, QrCode, Copy } from "lucide-react";
import QRCode from "react-qr-code";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api"; 
import { AuthService } from "@/lib/auth.service"; 
import { useTranslation } from "react-i18next"; // 🔥 Import Hook Terjemahan

export default function FormDonasiPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation(); // 🔥 Panggil fungsi t
  
  // Fleksibel: Bisa menangkap ?id=... ataupun ?slug=...
  const campaignIdentifier = searchParams.get("id") || searchParams.get("slug");

  const { getProfile } = useAuth();
  const [userWallet, setUserWallet] = useState("");
  const [campaign, setCampaign] = useState<any>(null);

  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "warning" | "error" | "success" } | null>(null);

  const showToast = (msg: string, type: "warning" | "error" | "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // 1. Fetch User Login
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        setUserWallet(data.wallet_address || "");
      } catch (err) {
        showToast(t("login_required_donate"), "error");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    // 2. Fetch Detail Campaign
    const fetchCampaign = async () => {
      if (!campaignIdentifier) {
        showToast(t("campaign_not_found_url"), "error");
        return;
      }

      try {
        const res = await AuthService.getCampaignDetail(campaignIdentifier);
        const dataKampanye = res.data || res;
        setCampaign(dataKampanye);

        // ========================================================
        // 🔍 AREA DEBUGGING: LIHAT HASILNYA DI CONSOLE BROWSER ANDA
        // ========================================================
        console.log("🔍 CEK DATA DARI GOLANG:", dataKampanye);
        console.log("💳 Apakah ada wallet_address?", dataKampanye.wallet_address);
        console.log("👤 Apakah ada di dalam user?", dataKampanye.user?.wallet_address);
        console.log("🏢 Apakah ada di dalam beneficiary?", dataKampanye.beneficiary?.wallet_address);
        // ========================================================

      } catch (err) {
        console.error("Gagal mengambil data kampanye", err);
      }
    };

    fetchUser();
    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignIdentifier, t]);

  // ALAMAT PENERIMA (Mencari di berbagai kemungkinan tempat dari Golang)
  const receiverWallet = 
    campaign?.wallet_address || 
    campaign?.user?.wallet_address || 
    campaign?.User?.wallet_address || 
    campaign?.beneficiary?.wallet_address || 
    t("no_wallet_backend");

  const handleCopyWallet = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (receiverWallet && receiverWallet !== t("no_wallet_backend")) {
      navigator.clipboard.writeText(receiverWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast(t("wallet_not_available_copy"), "warning");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaign || !campaign.id) return showToast(t("campaign_data_not_ready"), "error");
    if (!amount || Number(amount) <= 0) return showToast(t("invalid_donation_amount"), "warning");
    if (!txHash) return showToast(t("txhash_required"), "warning");

    setLoading(true);

    const payload = {
      campaign_id: campaign.id,
      wallet_address: userWallet,
      amount: Number(amount),
      message: message || t("default_prayer"),
      transaction_hash: txHash,
      is_anonymous: isAnonymous
    };

    try {
      const res = await apiFetch("/donations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Anggap berhasil jika tidak masuk catch
      showToast(t("donation_verified_success"), "success");
      
      setTimeout(() => {
        router.push(`/ProgramPage/DetailPage?id=${campaign.id}`);
      }, 2000);

    } catch (err: any) {
      showToast(err.message || t("server_error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = ["10", "50", "100", "500"];

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-gray-50 flex flex-col relative pb-10">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 duration-300 border w-[90%] max-w-sm ${
          toast.type === "success" ? "bg-green-600/95 border-green-400 text-white" :
          toast.type === "warning" ? "bg-orange-600/95 border-orange-400 text-white" : 
          "bg-red-600/95 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={24} className="shrink-0" /> : <AlertCircle size={24} className="shrink-0" />}
          <span className="font-semibold text-sm leading-snug">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white px-6 pt-8 pb-4 flex items-center gap-4 sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <button type="button" onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition active:scale-95 cursor-pointer">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-black text-gray-800">{t("donation_payment")}</h1>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* INFO KAMPANYE SINGKAT */}
        <div className="bg-purple-600 rounded-3xl p-5 text-white shadow-lg shadow-purple-200">
          <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">{t("donation_purpose")}</p>
          <h2 className="font-bold text-lg line-clamp-2 leading-snug">{campaign.title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* 1. NOMINAL DONASI */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <label className="text-sm font-bold text-gray-800 mb-3 block">{t("donation_amount_fcc")}</label>
            <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-purple-500 transition-all">
              <Coins className="text-purple-500 mr-3 shrink-0" size={24} />
              <input 
                type="number" 
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent outline-none text-2xl font-black text-gray-800 placeholder:text-gray-300"
              />
              <span className="text-gray-400 font-bold ml-2">FCC</span>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    amount === val 
                      ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200" 
                      : "bg-white text-gray-600 border-gray-200 hover:bg-purple-50 hover:border-purple-200"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* 2. AREA QR CODE WALLET PENERIMA */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <QrCode size={24} />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{t("transfer_here")}</h3>
            <p className="text-xs text-gray-500 mb-6 px-4 leading-relaxed">
              {t("scan_qr_metamask")}
            </p>

            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm mb-6 inline-block">
              <QRCode value={receiverWallet} size={160} fgColor="#4c1d95" />
            </div>

            <div className="w-full text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t("or_copy_manual")}</p>
              <button 
                type="button"
                onClick={handleCopyWallet}
                className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-colors active:scale-95"
              >
                <span className="text-xs font-mono text-gray-600 truncate mr-3">{receiverWallet}</span>
                {copied ? <CheckCircle2 size={16} className="text-green-500 shrink-0" /> : <Copy size={16} className="text-purple-600 shrink-0" />}
              </button>
            </div>
          </div>

          {/* 3. TRANSACTION HASH */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Hash size={16} className="text-purple-600" /> {t("tx_proof_hash")}
            </label>
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">
              {t("paste_tx_hash_desc")}
            </p>
            <input 
              type="text" 
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0xabc123..."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 outline-none focus:bg-white focus:border-purple-500 transition-all font-mono text-sm text-gray-700"
            />
          </div>

          {/* 4. PESAN / DOA */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare size={16} className="text-purple-600" /> {t("write_prayer_support")}
            </label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("default_prayer")}
              rows={3}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 outline-none focus:bg-white focus:border-purple-500 transition-all text-sm text-gray-700 mt-2 resize-none"
            />
          </div>

          {/* 5. TOGGLE ANONIM */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isAnonymous ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-400"}`}>
                <User size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">{t("hide_my_name")}</span>
                <span className="text-[10px] text-gray-500">{t("donate_as_anonymous")}</span>
              </div>
            </div>
            
            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${isAnonymous ? "bg-purple-600" : "bg-gray-200"}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isAnonymous ? "translate-x-6" : "translate-x-0"}`} />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-purple-600 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <><div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> {t("processing")}</>
            ) : (
              <><Heart className="fill-white/20" size={20} /> {t("confirm_donation")}</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}