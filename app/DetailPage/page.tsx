"use client";

import "@/lib/i18n";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import {
  Share2, CheckCircle2, Heart, Clock, AlertCircle, XCircle, 
  Wallet, Copy, QrCode, X, History, ArrowDownRight, ExternalLink,
  Edit3, Banknote, UploadCloud, Trash2, FileImage, FileText, Loader2,
  Send, Eye 
} from "lucide-react";
import QRCode from "react-qr-code";
import NavbarDetail from "../components/ui/detail/navbar";
import Link from "next/link";
import { AuthService } from "@/lib/auth.service";
import { useAuth } from "@/hooks/useAuth"; 
import { apiFetch } from "@/lib/api";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

function DetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("slug");
  const { t } = useTranslation();
  
  const { getProfile } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [totalCollected, setTotalCollected] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // 🔥 STATE UNTUK MILESTONE STATUS
  const [milestone, setMilestone] = useState<{
    current_phase: number;
    action_required: string;
    message: string;
  } | null>(null);
  const [isFetchingMilestone, setIsFetchingMilestone] = useState(true);

  // 🔥 STATE UNTUK MODAL
  const [showDisburseConfirmModal, setShowDisburseConfirmModal] = useState(false); 
  const [showReportModal, setShowReportModal] = useState(false); 
  const [reportDescription, setReportDescription] = useState("");
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const showToast = (msg: string, type: "warning" | "error" | "success") => {
    if (type === "warning") toast(msg, { icon: '⚠️' });
    else toast[type](msg);
  };

  // 🔥 FUNGSI FETCH MILESTONE STATUS
  const fetchMilestoneStatus = useCallback(async (campaignId: string) => {
    setIsFetchingMilestone(true);
    try {
      const res = await apiFetch(`/campaigns/milestone-status/${campaignId}`, { method: "GET" });
      if (res && res.data) {
        setMilestone(res.data);
      }
    } catch (err) {
      console.error("Gagal menarik status milestone:", err);
    } finally {
      setIsFetchingMilestone(false);
    }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        try {
          let profileData;
          try {
            profileData = await getProfile();
          } catch (err) {
            profileData = await getProfile("beneficiary");
          }
          setCurrentUser(profileData);
        } catch (err) {}

        if (!id) throw new Error(t("campaign_id_not_found", "ID Kampanye tidak ditemukan"));
        
        const res = await AuthService.getCampaignDetail(id);
        const campaignData = res.data || res;
        setCampaign(campaignData);

        // Langsung tembak API Milestone jika ID kampanye sudah didapat
        if (campaignData && campaignData.id) {
          fetchMilestoneStatus(campaignData.id);
        }
        
      } catch (err: any) {
        setError(err.message || t("fail_fetch_data", "Gagal mengambil data"));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fetchMilestoneStatus]);

  const receiverWallet = 
    campaign?.wallet_address || 
    campaign?.user?.wallet_address || 
    campaign?.beneficiary?.wallet_address || 
    t("not_set", "Belum Diatur");

  const handleCopyWallet = (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); 
    if (receiverWallet && receiverWallet !== t("not_set", "Belum Diatur")) {
      navigator.clipboard.writeText(receiverWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast(t("copied_wallet_success", "Wallet berhasil disalin!"), "success");
    } else {
      showToast(t("wallet_not_available", "Wallet tidak tersedia"), "error");
    }
  };

  useEffect(() => {
    const fetchCampaignHistory = async () => {
      if (!receiverWallet || receiverWallet === t("not_set", "Belum Diatur")) return;
      
      setLoadingHistory(true);
      try {
        // 🔥 UBAH: Menggunakan endpoint gabungan /donations/in/:wallet
        const resIn = await apiFetch(`/donations/in/${receiverWallet}`, { method: "GET" }).catch(() => null);
        
        if (resIn && resIn.data && Array.isArray(resIn.data.history)) {
          // Format data history sesuai yang dibutuhkan UI
          const incomingDonations = resIn.data.history.map((tx: any) => ({
            tx_hash: tx.tx_hash,
            date: tx.created_at,
            type: "In",
            amount: tx.amount.toString(),
            from_to: tx.donatur_address || t("anonymous", "Anonim"),
          }));

          // Urutkan dari yang terbaru
          incomingDonations.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setWalletHistory(incomingDonations);

          // 🔥 Ambil total donasi terkumpul dari total_balance
          if (resIn.data.total_balance !== undefined) {
            setTotalCollected(parseFloat(resIn.data.total_balance));
          } else {
            setTotalCollected(0);
          }
        } else {
          setWalletHistory([]);
          setTotalCollected(0);
        }

      } catch (err) {
        console.error("Gagal menarik riwayat donasi kampanye:", err);
        setWalletHistory([]);
        setTotalCollected(0);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchCampaignHistory();
  }, [receiverWallet, t]);

  // 🔥 FUNGSI EKSEKUSI PENCAIRAN
  const handleDisbursementSubmit = async () => {
    setIsSubmittingReport(true);
    const loadingToast = toast.loading("Mengajukan pencairan dana...");

    try {
      await apiFetch(`/campaigns/disbursements/${campaign.id}`, { method: "POST" });
      
      toast.success("Pencairan berhasil diajukan!", { id: loadingToast });
      setShowDisburseConfirmModal(false);

      // Refresh Milestone Status
      fetchMilestoneStatus(campaign.id);
      
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : (err.message || "Gagal mengajukan pencairan.");
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // 🔥 FUNGSI EKSEKUSI LAPORAN
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setReportFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setReportFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReportSubmit = async () => {
    if (!reportDescription.trim()) return toast.error("Deskripsi penggunaan dana wajib diisi!");
    if (reportFiles.length === 0) return toast.error("Minimal lampirkan 1 foto bukti (nota/kegiatan)!");

    setIsSubmittingReport(true);
    const loadingToast = toast.loading("Mengirim laporan...");
    
    const formData = new FormData();
    formData.append("description", reportDescription);
    reportFiles.forEach(file => formData.append("proof_images", file));

    try {
      await apiFetch(`/campaigns/report/${campaign.id}`, {
        method: "POST",
        body: formData,
      });

      toast.success("Laporan berhasil dikirim!", { id: loadingToast });
      setShowReportModal(false);
      setReportDescription("");
      setReportFiles([]);

      // Refresh Milestone Status
      fetchMilestoneStatus(campaign.id);

    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : (err.message || "Gagal mengirim laporan.");
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta"
    });
  };

  const formatSenderWallet = (text: string) => {
    if (!text) return t("anonymous", "Anonim");
    const match = text.match(/(0x[a-fA-F0-9]+)/);
    if (match) {
      const addr = match[0];
      if (addr.length >= 8) return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    }
    return text;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-purple-600 font-bold animate-pulse">{t("preparing_data", "Menyiapkan Data...")}</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3 px-6 text-center">
        <AlertCircle size={48} className="text-red-400 mb-2" />
        <h2 className="text-xl font-bold text-gray-800">{t("oops_error", "Oops! Terjadi Kesalahan")}</h2>
        <p className="text-gray-500">{error || t("campaign_data_not_available", "Data tidak tersedia")}</p>
        <Link href="/" className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full font-bold">
          {t("back_to_home", "Kembali")}
        </Link>
      </div>
    );
  }

  const title = campaign?.title;
  const foundation = campaign?.full_name || t("beneficiary", "Penerima Manfaat");
  const story = campaign?.story || campaign?.description || t("no_story_yet", "Belum ada cerita"); 
  
  const rawTarget = campaign?.target_amount || 1;
  const target = typeof rawTarget === 'string' ? parseFloat(rawTarget.replace(/[^\d.-]/g, '')) : rawTarget;
  
  // Menggunakan totalCollected dari API backend (total_balance)
  const rawCollected = totalCollected !== null ? totalCollected : (campaign?.current_amount || 0);
  const collected = typeof rawCollected === 'string' ? parseFloat(rawCollected.replace(/[^\d.-]/g, '')) : rawCollected;
  
  const calculateProgress = () => {
    if (target === 0) return 0;
    const percent = (collected / target) * 100;
    if (percent >= 100) return 100;
    if (percent > 99) return Number(percent.toFixed(1));
    return Math.floor(percent);
  };
  const progress = calculateProgress();

  const getCategoryName = (catId: number) => {
    const map: Record<number, string> = { 1: t("cat_education", "Pendidikan"), 2: t("cat_health", "Kesehatan"), 3: t("cat_disaster", "Bencana"), 4: t("cat_humanity", "Kemanusiaan"), 5: t("cat_orphanage", "Panti Asuhan") };
    return map[catId] || t("cat_general", "Umum");
  };

  const calculateDaysLeft = (date: string) => {
    if (!date) return 0;
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
  const daysLeft = calculateDaysLeft(campaign?.end_date);

  const isTargetReached = progress >= 100;

  const renderStatusBadge = (status: string, sisaHari: number) => {
    if (status === 'active' && sisaHari <= 0) {
      return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 uppercase border border-gray-200 flex items-center gap-1"><Clock size={12} /> {t("ended_badge", "Berakhir")}</span>;
    }
    if (status === 'active' && isTargetReached) {
      return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 uppercase border border-blue-200 flex items-center gap-1 shadow-sm"><CheckCircle2 size={12} /> {t("target_reached_badge", "Target Tercapai")}</span>;
    }
    switch (status?.toLowerCase()) {
      case "active": return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-100 text-green-700 uppercase border border-green-200 flex items-center gap-1 shadow-sm"><CheckCircle2 size={12} /> {t("active_badge", "Aktif")}</span>;
      case "rejected": return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-100 text-red-700 uppercase border border-red-200 flex items-center gap-1 shadow-sm"><XCircle size={12} /> {t("rejected_badge", "Ditolak")}</span>;
      default: return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 uppercase border border-amber-200 flex items-center gap-1 shadow-sm"><Clock size={12} /> {t("waiting_badge", "Menunggu")}</span>;
    }
  };

  // 🔥 PENGECEKAN KEAMANAN: APAKAH USER INI BENAR-BENAR PEMILIK KAMPANYE?
  const isBeneficiaryRole = currentUser?.role === "beneficiary" || currentUser?.role === "penerima_manfaat";
  
  // Mencocokkan ID User Login dengan ID Pembuat Kampanye
  const isCampaignOwner = !!(
    currentUser && campaign && (
      currentUser.id === campaign.user_id || 
      currentUser.id === campaign.beneficiary_id || 
      (currentUser.wallet_address && currentUser.wallet_address === receiverWallet)
    )
  );

  // MENGIDENTIFIKASI JIKA CURRENT USER ADALAH INDIVIDU
  const isIndividualBeneficiary = 
    currentUser?.beneficiary_type?.toLowerCase() === "individu" || 
    currentUser?.beneficiary_type?.toLowerCase() === "individual";

  // MENGIDENTIFIKASI TIPE KAMPANYE
  const campaignTypeStr = String(
    campaign?.beneficiary?.beneficiary_type || 
    campaign?.beneficiary?.type || 
    campaign?.user?.beneficiary_type || 
    campaign?.user?.type || 
    campaign?.beneficiary_type || 
    campaign?.type || 
    ""
  ).toLowerCase().trim();

  const isCampaignIndividual = campaignTypeStr.includes("individu") || campaignTypeStr.includes("personal");

  // 🔥 RENDER TOMBOL BOTTOM BAR BERDASARKAN STATUS MILESTONE API (KHUSUS ORGANISASI PEMILIK)
  const renderActionButtons = () => {
    if (!isTargetReached) return null; 

    if (isFetchingMilestone) {
      return (
        <div className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold bg-gray-100 text-gray-400 border border-gray-200 cursor-wait">
          <Loader2 className="w-5 h-5 animate-spin" /> Memuat Status...
        </div>
      );
    }

    if (!milestone) return null;

    switch (milestone.action_required) {
      case "REQUEST_DISBURSEMENT":
        return (
          <button
            onClick={() => setShowDisburseConfirmModal(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all active:scale-95 text-center bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200"
          >
            <Banknote className="w-5 h-5" /> Cairkan Dana
          </button>
        );

      case "UPLOAD_REPORT":
        return (
          <button
            onClick={() => setShowReportModal(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all active:scale-95 text-center bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200"
          >
            <FileText className="w-5 h-5" /> {milestone.current_phase === 4 ? "Laporan Final" : "Ajukan Laporan"}
          </button>
        );

      case "WAITING_DISBURSEMENT_APPROVAL":
      case "WAITING_REPORT_APPROVAL":
        return (
          <div className="flex-1 flex flex-col items-center justify-center rounded-xl px-2 py-2 font-bold text-center bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed">
            <span className="flex items-center gap-1.5 text-sm"><Clock className="w-4 h-4" /> Menunggu Admin</span>
            <span className="text-[10px] font-medium opacity-80 mt-0.5 px-2 text-center line-clamp-1">{milestone.message}</span>
          </div>
        );

      case "COMPLETED":
        return (
          <div className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-center bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed">
            <CheckCircle2 className="w-5 h-5 text-green-500" /> Program Selesai
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50">
      
      <NavbarDetail />

      {/* 🔥 MODAL PENCAIRAN */}
      {showDisburseConfirmModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-3xl flex flex-col items-center p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-5 border-4 border-green-100 shadow-inner">
              <Banknote size={36} />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2">Pencairan Tahap {milestone?.current_phase || 1}</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Anda akan mengajukan pencairan dana. Permintaan ini akan diteruskan ke Admin untuk disetujui sebelum dikirim ke wallet Anda.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowDisburseConfirmModal(false)}
                disabled={isSubmittingReport}
                className="w-1/2 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDisbursementSubmit}
                disabled={isSubmittingReport}
                className="w-1/2 flex justify-center items-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-2xl hover:bg-green-600 active:scale-95 transition-all shadow-[0_10px_20px_-10px_rgba(34,197,94,0.5)] disabled:opacity-50"
              >
                {isSubmittingReport ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Ajukan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 MODAL LAPORAN */}
      {showReportModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh]">
            
            <div className="bg-green-50 px-6 py-4 flex items-center justify-between border-b border-green-100 shrink-0">
              <div className="flex items-center gap-2 text-green-600">
                <FileText size={20} className="shrink-0" />
                <h2 className="text-lg font-black text-gray-800">
                  {milestone?.current_phase === 4 ? "Laporan Final (Tahap 4)" : `Laporan Penggunaan Tahap ${milestone?.current_phase || ""}`}
                </h2>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors"><X size={18} /></button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              <p className="text-sm text-gray-500 font-medium">
                {milestone?.current_phase === 4 
                  ? "Mohon lampirkan laporan penggunaan dana tahap akhir (ke-4) beserta bukti pendukungnya." 
                  : "Mohon lampirkan laporan penggunaan dana serta bukti pendukung untuk mengajukan pencairan dana tahap selanjutnya."}
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Deskripsi Laporan</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Ceritakan penggunaan dana yang telah dilakukan..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-32"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bukti Lampiran (Foto/Nota)</label>
                <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-green-400 cursor-pointer transition-colors">
                  <UploadCloud size={32} className="mb-2 text-green-500" />
                  <span className="text-sm font-bold">Pilih File Bukti</span>
                  <span className="text-[10px] mt-1 text-gray-400">Bisa memilih lebih dari 1 file (JPG, PNG)</span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />

                {reportFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {reportFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileImage size={16} className="text-purple-500 shrink-0" />
                          <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(index)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
              <button onClick={() => setShowReportModal(false)} disabled={isSubmittingReport} className="w-1/3 bg-white text-gray-600 font-bold py-3.5 border border-gray-200 rounded-xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 text-sm">Batal</button>
              <button onClick={handleReportSubmit} disabled={isSubmittingReport} className="w-2/3 flex justify-center items-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 active:scale-95 transition-all shadow-md shadow-green-200 disabled:opacity-50 text-sm">
                {isSubmittingReport ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send size={16} /> Kirim Laporan</>}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Konten Halaman Detail Utama */}
      <div className="relative w-full h-72 bg-gray-200">
        <img src={campaign?.image_banner?.startsWith("http") ? campaign.image_banner : `${IMAGE_BASE_URL}/${campaign?.image_banner?.replace(/^\/+/, "")}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
      </div>

      <div className="relative -mt-8 w-full bg-white rounded-t-4xl flex flex-col z-10 pb-28 shadow-xl">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2" />

        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-purple-600">{foundation}</span>
              <CheckCircle2 className="w-4 h-4 text-sky-500" />
            </div>
            <div className="flex items-center gap-2">
              {renderStatusBadge(campaign?.status, daysLeft)}
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 uppercase border border-purple-200 shadow-sm shrink-0">
                {getCategoryName(campaign.category_id)}
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-800 leading-snug mb-4">{title}</h1>

          <div className="w-full">
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium mb-0.5">{t("collected", "Terkumpul")}</span>
                <span className="text-lg font-bold text-purple-700">{collected} FCC <span className="text-xs text-gray-400 font-normal">/ {target} FCC</span></span>
              </div>
              <span className="text-sm font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${daysLeft > 0 ? 'text-orange-600 bg-orange-50 border border-orange-100' : 'text-gray-500 bg-gray-100 border border-gray-200'}`}>
                <Clock size={14} className="shrink-0" />
                {daysLeft > 0 ? `${t("remaining", "Sisa")} ${daysLeft} ${t("days", "Hari")}` : t("program_has_ended", "Program Berakhir")}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t("fundraiser_info", "Info Penggalang")}</h2>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl border border-purple-200 uppercase">
                {foundation.charAt(0)}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                  {foundation} <CheckCircle2 className="w-3 h-3 text-sky-500" />
                </p>
                <p className="text-xs text-gray-500">
                  {isCampaignIndividual ? "Penerima Terverifikasi" : t("verified_organization", "Organisasi Terverifikasi")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100 bg-purple-50/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{t("receiver_wallet_address", "Wallet Penerima")}</h3>
              <p className="text-[10px] text-purple-600 font-medium italic">{t("supported_by_polygon", "Didukung oleh Polygon")}</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white border border-purple-100 p-3.5 rounded-2xl shadow-sm">
            <code className="text-xs font-mono text-gray-600 truncate mr-3">{receiverWallet}</code>
            <button type="button" onClick={() => handleCopyWallet()} className="bg-purple-50 p-2 rounded-lg text-purple-600 hover:bg-purple-600 hover:text-white transition-colors active:scale-95 shrink-0">
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t("fundraising_story", "Cerita")}</h2>
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{story}</div>
        </div>

        <div className="px-6 pb-6 pt-4 bg-gray-50/50 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <History size={20} className="text-purple-600" /> {t("incoming_donations", "Donasi Masuk")}
          </h2>
          
          <div className="flex flex-col gap-3">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-6 text-purple-400">
                <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : walletHistory.length === 0 ? (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 text-center">
                <Heart size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-500">{t("be_first_hero", "Jadilah pahlawan pertama")}</p>
                <p className="text-[10px] text-gray-400 mt-1">{t("no_donation_recorded", "Belum ada donasi")}</p>
              </div>
            ) : (
              walletHistory.map((tx, index) => (
                <div key={`${tx.tx_hash}-${index}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <ArrowDownRight size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{t("good_person", "Orang Baik")}</p>
                      <p className="text-[10px] font-mono text-gray-500 mt-0.5" title={tx.from_to}>{formatSenderWallet(tx.from_to)}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-black text-sm text-green-600">+{parseFloat(tx.amount || "0").toFixed(2)} FCC</p>
                    <a href={`https://polygonscan.com/tx/${tx.tx_hash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-purple-500 font-bold mt-1 hover:underline">
                      {t("view_tx", "Lihat")} <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 🔥 BOTTOM BAR - DIPERBAIKI HAK AKSESNYA 🔥 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40">
        <div className="bg-white/90 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex gap-2 shadow-2xl">
          
          <button
            onClick={() => navigator.share ? navigator.share({ title, url: window.location.href }) : alert(t("link_copied", "Link disalin"))}
            className={`flex items-center justify-center gap-2 border-2 border-gray-200 rounded-xl py-3 text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-95 shrink-0 ${
              (isBeneficiaryRole && isCampaignOwner) ? (isTargetReached && !isIndividualBeneficiary ? "px-3" : "w-1/2 px-4") : "w-1/3 px-4" 
            }`}
            title={t("share", "Bagikan")}
          >
            <Share2 className="w-5 h-5" />
            {(!(isBeneficiaryRole && isCampaignOwner) || !(isTargetReached && !isIndividualBeneficiary)) && t("share", "Bagikan")}
          </button>

          {/* HANYA TAMPILKAN MENU INI JIKA USER LOGIN ADALAH BENAR-BENAR PEMILIK KAMPANYE INI */}
          {(isBeneficiaryRole && isCampaignOwner) ? (
            <>
              <Link
                href={`/ProgramPage/EditProgram?id=${campaign?.slug || campaign?.id}`}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 font-bold transition-all active:scale-95 text-center bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shrink-0 ${
                  isTargetReached && !isIndividualBeneficiary ? "px-3" : "w-1/2 px-4"
                }`}
                title={t("edit_program", "Edit")}
              >
                <Edit3 className="w-5 h-5" />
                {(!isTargetReached || isIndividualBeneficiary) && t("edit_program", "Edit")}
              </Link>

              {isTargetReached && !isIndividualBeneficiary && (
                <Link
                  href={`/ProgressPage?id=${campaign?.id}`}
                  className="flex items-center justify-center rounded-xl py-3 px-3 font-bold transition-all active:scale-95 text-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shrink-0"
                  title="Lihat Progress"
                >
                  <Eye className="w-5 h-5" />
                </Link>
              )}
              
              {!isIndividualBeneficiary && renderActionButtons()}
            </>
          ) : (
            // LOGIKA UNTUK USER BIASA (DONATUR) ATAU PENERIMA MANFAAT LAIN YANG BUKAN PEMILIK
            isTargetReached ? (
              isCampaignIndividual ? (
                <div className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-center bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Target Tercapai
                </div>
              ) : (
                <Link
                  href={`/ProgressPage?id=${campaign?.id}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all active:scale-95 text-center bg-purple-600 text-white hover:bg-purple-900 shadow-lg shadow-blue-200"
                >
                  <Eye className="w-5 h-5" />
                  {t("view_progress", "Lihat Progress")}
                </Link>
              )
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={campaign?.status !== 'active' || daysLeft <= 0}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 w-2/3 font-bold transition-all active:scale-95 text-center cursor-pointer ${
                  campaign?.status === 'active' && daysLeft > 0
                    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200" 
                    : "bg-gray-200 text-gray-400 pointer-events-none"
                }`}
              >
                <Heart className={`w-5 h-5 ${campaign?.status === 'active' && daysLeft > 0 ? "fill-white/20" : "fill-gray-300"}`} />
                {campaign?.status !== 'active' 
                   ? t("not_active_yet", "Belum Aktif") 
                   : daysLeft > 0 
                     ? t("send_donation", "Donasi") 
                     : t("program_has_ended", "Berakhir")}
              </button>
            )
          )}
        </div>
      </div>
      
      {/* 👇 🔥 MODAL DONASI 👇 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-gray-50 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-y-0">
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 rounded-t-3xl">
              <h2 className="text-lg font-black text-gray-800">{t("send_donation", "Donasi")}</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 pb-10 flex flex-col gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                  <QrCode size={24} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{t("scan_qr_code", "Scan QR")}</h3>
                <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm mb-6 inline-block mt-4">
                  <QRCode value={receiverWallet} size={180} fgColor="#4c1d95" />
                </div>

                <div className="w-full text-left">
                  <button 
                    type="button"
                    onClick={() => handleCopyWallet()}
                    className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 p-4 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-colors active:scale-95"
                  >
                    <span className="text-xs font-mono text-gray-600 truncate mr-3">{receiverWallet}</span>
                    {copied ? <CheckCircle2 size={18} className="text-green-500 shrink-0" /> : <Copy size={18} className="text-purple-600 shrink-0" />}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    }>
      <DetailContent />
    </Suspense>
  );
}