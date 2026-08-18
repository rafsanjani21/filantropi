"use client";

import "@/lib/i18n";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ethers } from "ethers";
import { AuthService } from "@/lib/auth.service";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft, Type, Tag, Calendar, FileText, Send,
  CheckCircle2, AlertCircle, BookOpen, Wallet, Lock, ShieldAlert,
  Clock, X, Plus, UploadCloud, Gift
} from "lucide-react";
import BottomNav from "../components/ui/root/BottomNav";

export default function GalangPage() {
  const router = useRouter();
  const { createCampaign, getProfile, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const MAX_FILE_SIZE = 1048576; 

  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);

  const [beneficiaryType, setBeneficiaryType] = useState<string>("");

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [form, setForm] = useState({
    title: "",
    category_id: "1",
    target_amount: "",
    end_date: "",
    description: "",
    story: "",
    wallet_address: "",
    donation_type: "donasi", // Default ke Donasi
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const profile = await getProfile("beneficiary");
        const isVerified = Number(profile?.is_verified || 0);

        if (isVerified === 0) {
          setIsUnverified(true);
          setIsCheckingAccess(false);
          return;
        }

        const type = profile?.beneficiary_type?.toLowerCase();
        const isIndividual = type === "individu" || type === "individual";

        setBeneficiaryType(isIndividual ? "individual" : "organization");

        if (isIndividual) {
          setForm(prev => ({ ...prev, wallet_address: profile?.wallet_address || "" }));

          const res = await AuthService.getMyCampaigns();
          const rawData = res.data || res;

          if (Array.isArray(rawData) && rawData.length >= 1) {
            setIsBlocked(true);
          }
        }
      } catch (err) {
        console.warn("Gagal mengecek akses pengguna:", err);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.some((file) => file.size > MAX_FILE_SIZE)) {
      showToast("Maksimal ukuran foto adalah 1 MB!", "error");
      e.target.value = "";
      return;
    }

    const availableSlots = 5 - selectedFiles.length;
    const allowedFiles = files.slice(0, availableSlots);

    if (allowedFiles.length < files.length) {
      showToast("Maksimal 5 foto yang dapat diunggah.", "warning");
    }

    const newSelected = [...selectedFiles, ...allowedFiles];
    setSelectedFiles(newSelected);
    setPreviewUrls(newSelected.map(file => URL.createObjectURL(file)));

    e.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== indexToRemove);
      URL.revokeObjectURL(prev[indexToRemove]);
      return newUrls;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showToast(t("upload_banner_error", "Banner kampanye wajib diunggah!"), "error");
      return;
    }

    if (beneficiaryType === "individual") {
      if (!ethers.isAddress(form.wallet_address.trim())) {
        showToast(t("invalid_wallet_error", "Alamat wallet tidak valid!"), "error");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("category_id", form.category_id);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("story", form.story);

      // 🔥 SESUAI GAMBAR DB: Mengirimkan Text "1" atau "0" ke backend
      const isWakaf = form.donation_type === "wakaf";
      const isDonasi = form.donation_type === "donasi";

      formData.append("is_wakaf", isWakaf ? "1" : "0");
      formData.append("is_donasi", isDonasi ? "1" : "0");

      if (form.target_amount.trim() !== "") {
        formData.append("target_amount", form.target_amount);
      }

      if (form.end_date.trim() !== "") {
        formData.append("end_date", form.end_date);
      }

      if (beneficiaryType === "individual") {
        formData.append("wallet_address", form.wallet_address.trim());
      } else {
        formData.append("wallet_address", "");
      }

      selectedFiles.forEach((file) => formData.append("image_banner", file));

      await createCampaign(formData);

      showToast(t("campaign_created_success", "Kampanye berhasil dibuat!"), "success");

      setTimeout(() => {
        router.push("/ProgramPage");
      }, 2000);

    } catch (error: any) {
      console.error("Error submit campaign:", error);
      showToast(error.message || t("campaign_created_error", "Gagal membuat kampanye."), "error");
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col items-center justify-center bg-gradient-to-b from-[#3E1854] to-[#8A45A8]">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 border-[3px] border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-transparent border-t-[#E8B94A] rounded-full animate-spin"></div>
        </div>
        <p className="text-white font-bold animate-pulse">{t("verifying_account", "Memeriksa Akun...")}</p>
      </div>
    );
  }

  if (isUnverified) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gradient-to-b from-[#8A6413] to-[#C9971F] shadow-2xl relative pb-24">
        <nav className="w-full px-6 pt-8 pb-4 flex items-center justify-between z-10">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-95 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10" />
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-20">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/30 relative">
             <Clock size={48} className="text-white" />
             <div className="absolute -bottom-2 -right-2 bg-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#C9971F]">
                <Lock size={14} className="text-[#C9971F]" />
             </div>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight mb-3">
            {t("account_not_verified", "Akun Belum Terverifikasi")}
          </h2>
          <p className="text-amber-50 text-sm leading-relaxed mb-8 bg-black/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm">
            Data profil Anda saat ini sedang dalam proses peninjauan atau belum disetujui oleh tim Admin. Anda baru bisa membuat kampanye setelah akun diverifikasi (Approved).
          </p>
          <button
            onClick={() => router.push("/ProfilePage")}
            className="bg-white text-[#8A6413] font-bold py-3.5 px-8 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            {t("check_profile", "Cek Profil Saya")}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gradient-to-b from-[#3E1854] to-[#8A45A8] shadow-2xl relative pb-24">
        <nav className="w-full px-6 pt-8 pb-4 flex items-center justify-between z-10">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-95 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10" />
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-20">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/20 relative">
             <ShieldAlert size={48} className="text-white" />
             <div className="absolute -bottom-2 -right-2 bg-red-500 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#8A45A8]">
                <Lock size={14} className="text-white" />
             </div>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight mb-3">
            {t("limit_reached", "Limit Tercapai")}
          </h2>
          <p className="text-purple-100 text-sm leading-relaxed mb-8 bg-black/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            {t("limit_reached_desc", "Anda sudah memiliki kampanye aktif. Sebagai akun individu, Anda hanya bisa memiliki satu kampanye dalam satu waktu.")}
          </p>
          <button
            onClick={() => router.push("/ProgramPage")}
            className="bg-white text-[#5B2A73] font-bold py-3.5 px-8 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            {t("manage_my_programs", "Kelola Program Saya")}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] shadow-2xl relative overflow-x-hidden pb-24">

      {toast && (
        <div
          role="status"
          className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm rounded-xl bg-white shadow-xl border-l-4 flex items-start gap-3 px-4 py-3.5 animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === "success" ? "border-emerald-500" : toast.type === "warning" ? "border-[#E8B94A]" : "border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-500" />
          ) : (
            <AlertCircle size={20} className={`shrink-0 mt-0.5 ${toast.type === "warning" ? "text-[#C9971F]" : "text-red-500"}`} />
          )}
          <span className="text-sm font-medium leading-snug text-[#2A1B33]">{toast.message}</span>
        </div>
      )}

      {/* Signature: motif kawung tipis */}
      <svg
        className="absolute inset-x-0 top-0 h-64 w-full opacity-[0.08] pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="kawung-galang" width="56" height="56" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
              <ellipse cx="14" cy="14" rx="12" ry="8" transform="rotate(45 14 14)" />
              <ellipse cx="42" cy="14" rx="12" ry="8" transform="rotate(-45 42 14)" />
              <ellipse cx="14" cy="42" rx="12" ry="8" transform="rotate(-45 14 42)" />
              <ellipse cx="42" cy="42" rx="12" ry="8" transform="rotate(45 42 42)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kawung-galang)" />
      </svg>

      <nav className="relative w-full px-6 pt-8 pb-4 flex items-center justify-between z-10">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg text-white font-bold tracking-wide">
          {t("create_program", "Buat Program")}
        </h1>
        <div className="w-10 h-10" />
      </nav>

      <div className="relative px-8 mt-2 mb-6 z-10">
        <h2 className="text-2xl font-extrabold text-white leading-tight">
          {t("start_goodness_today", "Mulai Kebaikan")}
        </h2>
        <p className="text-purple-100/80 text-sm mt-2">
          {t("complete_details_desc", "Lengkapi detail program di bawah ini.")}
        </p>
      </div>

      <div className="relative flex-1 w-full bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10">
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-[#7C3996]/15" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-8 pt-3">
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-gray-700">{t("campaign_banner_label", "Foto/Banner Kampanye")}</label>
              <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${previewUrls.length === 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-[#7C3996]/8 text-[#7C3996]'}`}>
                {previewUrls.length} / 5 Foto
              </span>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-2">
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative group rounded-2xl overflow-hidden shadow-sm border border-gray-200 aspect-square">
                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full backdrop-blur-sm transition-all scale-0 group-hover:scale-100 shadow-md"
                    >
                      <X size={14} />
                    </button>

                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#5B2A73]/90 text-white text-[9px] font-bold text-center py-1.5 backdrop-blur-sm">
                        Cover Utama
                      </div>
                    )}
                  </div>
                ))}

                {previewUrls.length < 5 && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#7C3996]/25 rounded-2xl cursor-pointer hover:bg-[#7C3996]/5 transition-colors aspect-square">
                    <div className="bg-[#7C3996]/10 p-2 rounded-full text-[#7C3996] mb-1">
                       <Plus size={18} />
                    </div>
                    <span className="text-[10px] text-[#7C3996] font-bold">Tambah</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                  </label>
                )}
              </div>
            )}

            {previewUrls.length === 0 && (
              <label className="relative flex flex-col items-center justify-center w-full min-h-[200px] bg-[#FBF8F3] border-2 border-dashed border-[#7C3996]/25 rounded-3xl cursor-pointer hover:bg-[#7C3996]/5 hover:border-[#7C3996]/50 transition-all overflow-hidden group p-6">
                <div className="bg-white p-4 rounded-full shadow-sm border border-[#7C3996]/15 mb-4 text-[#7C3996] group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud size={32} />
                </div>
                <p className="text-sm text-gray-700 font-bold mb-1">{t("click_to_upload", "Klik untuk mengunggah foto")}</p>
                <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
                  {t("format_recommendation", "Maks. 5 foto (Rekomendasi 16:9). Format JPG, PNG maksimal 1 MB/foto.")}
                </p>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
              </label>
            )}
          </div>

          <InputField
            label={t("campaign_title_label", "Judul Kampanye")}
            value={form.title} onChange={(e: any) => handleChange("title", e.target.value)}
            icon={<Type size={18} />} placeholder={t("campaign_title_placeholder", "Cth: Bantuan Korban Bencana")}
            required
          />

          {/* 🔥 UI BARU: PILIHAN DONASI ATAU WAKAF 🔥 */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">Jenis Kampanye</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              
              {/* Option Donasi */}
              <button
                type="button"
                onClick={() => handleChange("donation_type", "donasi")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 ${
                  form.donation_type === "donasi"
                    ? "border-[#7C3996] bg-[#7C3996]/5 shadow-[0_0_15px_rgba(124,57,150,0.15)]"
                    : "border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200 text-gray-400"
                }`}
              >
                <Gift size={26} className={form.donation_type === "donasi" ? "text-[#7C3996]" : ""} />
                <span className={`mt-2.5 text-[13px] font-bold tracking-wide ${form.donation_type === "donasi" ? "text-[#7C3996]" : "text-gray-500"}`}>
                  Donasi Sosial
                </span>
              </button>

              {/* Option Wakaf */}
              <button
                type="button"
                onClick={() => handleChange("donation_type", "wakaf")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 ${
                  form.donation_type === "wakaf"
                    ? "border-emerald-500 bg-emerald-50 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200 text-gray-400"
                }`}
              >
                <BookOpen size={26} className={form.donation_type === "wakaf" ? "text-emerald-500" : ""} />
                <span className={`mt-2.5 text-[13px] font-bold tracking-wide ${form.donation_type === "wakaf" ? "text-emerald-500" : "text-gray-500"}`}>
                  Program Wakaf
                </span>
              </button>
              
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">{t("category_label", "Kategori")}</label>
            <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-[#7C3996] focus-within:shadow-[0_0_15px_rgba(124,57,150,0.15)]">
              <div className="text-gray-400 group-focus-within:text-[#7C3996] transition-colors duration-300">
                <Tag size={18} />
              </div>
              <select
                value={form.category_id}
                onChange={(e) => handleChange("category_id", e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium cursor-pointer"
              >
                <option value="1">{t("cat_education", "Pendidikan")}</option>
                <option value="2">{t("cat_health", "Kesehatan")}</option>
                <option value="3">{t("cat_disaster", "Bencana Alam")}</option>
                <option value="4">{t("cat_mosque", "Ekonomi")}</option>
                <option value="5">{t("cat_social", "Sosial")}</option>
                <option value="6">{t("cat_environment", "Lingkungan")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("target_amount_label", "Target (Rp)")}</label>
              <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-[#7C3996] focus-within:shadow-[0_0_15px_rgba(124,57,150,0.15)]">
                <div className="text-[#7C3996] font-bold text-base mr-2">Rp</div>
                <input
                  type="number"
                  value={form.target_amount}
                  onChange={(e) => handleChange("target_amount", e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300"
                  min="1000"
                  step="1"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium ml-1 leading-tight">
                *Kosongkan jika tak ada target
              </p>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <InputField
                label={t("end_date_label", "Berakhir")}
                type="date"
                value={form.end_date}
                onChange={(e: any) => handleChange("end_date", e.target.value)}
                icon={<Calendar size={18} />}
              />
              <p className="text-[10px] text-gray-400 font-medium ml-1 leading-tight">
                *Kosongkan jika tanpa batas
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">{t("short_desc_label", "Deskripsi Singkat")}</label>
            <div className="group flex items-start bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-[#7C3996] focus-within:shadow-[0_0_15px_rgba(124,57,150,0.15)]">
              <div className="text-gray-400 group-focus-within:text-[#7C3996] transition-colors duration-300 mt-1">
                <FileText size={18} />
              </div>
              <textarea
                value={form.description} onChange={(e) => handleChange("description", e.target.value)}
                placeholder={t("short_desc_placeholder", "Ceritakan ringkasan tujuan penggalangan dana ini...")}
                rows={5}
                className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal resize-y min-h-[100px] leading-relaxed" 
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">{t("objective_label", "Tujuan Lengkap")}</label>
            <div className="group flex items-start bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-[#7C3996] focus-within:shadow-[0_0_15px_rgba(124,57,150,0.15)]">
              <div className="text-gray-400 group-focus-within:text-[#7C3996] transition-colors duration-300 mt-1">
                <BookOpen size={18} />
              </div>
              <textarea
                value={form.story} onChange={(e) => handleChange("story", e.target.value)}
                placeholder={t("story_placeholder", "Tuliskan cerita detail mengapa orang harus membantu...")}
                rows={12} 
                className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal resize-y min-h-[200px] leading-relaxed"
                required
              />
            </div>
          </div>

          {beneficiaryType === "individual" && (
            <div className="flex flex-col gap-1.5 w-full pt-2 border-t border-gray-100">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("wallet_address_label", "Alamat Pencairan (Wallet / Rekening)")}</label>
              <div className="flex items-center bg-gray-100 border-2 border-gray-200 rounded-2xl px-4 py-3.5 opacity-80 cursor-not-allowed">
                <div className="text-gray-400">
                  <Wallet size={18} />
                </div>
                <input
                  type="text"
                  value={form.wallet_address}
                  readOnly
                  placeholder="Memuat dari profil..."
                  className="ml-3 w-full bg-transparent outline-none text-gray-600 font-mono text-sm cursor-not-allowed"
                />
                <Lock size={16} className="text-gray-400 ml-2 shrink-0" />
              </div>
              <p className="text-[10px] text-gray-500 font-medium ml-1 flex items-center gap-1 mt-1">
                <AlertCircle size={12} className="shrink-0" />
                {t("wallet_address_locked", "Alamat ini otomatis terhubung dari profil Anda dan tidak dapat diubah di sini.")}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="group relative w-full mt-4 flex items-center justify-center gap-3 bg-gradient-to-r from-[#7C3996] to-[#5B2A73] hover:brightness-110 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(124,57,150,0.7)] hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {authLoading ? (
              <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={20} className="text-[#E8B94A] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                <span className="text-lg">{t("publish_program", "Ajukan Kampanye")}</span>
              </>
            )}
          </button>

        </form>
      </div>

      <BottomNav />
    </div>
  );
}

function InputField({ label, value, onChange, icon, placeholder, type = "text", required = false }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-[#7C3996] focus-within:shadow-[0_0_15px_rgba(124,57,150,0.15)]">
        <div className="text-gray-400 group-focus-within:text-[#7C3996] transition-colors duration-300">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal"
        />
      </div>
    </div>
  );
}