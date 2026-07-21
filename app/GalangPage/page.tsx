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

export default function GalangPage() {
  const router = useRouter();
  const { createCampaign, getProfile, loading: authLoading } = useAuth(); 
  const { t } = useTranslation(); 

  const MAX_FILE_SIZE = 1048576; // Batas 1 MB

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
    donation_type: "donasi",
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
      
      // 🔥 Masukkan nilai is_donasi dan is_wakaf berdasarkan pilihan user
      const isWakaf = form.donation_type === "wakaf";
      const isDonasi = form.donation_type === "donasi";
      
      formData.append("is_wakaf", isWakaf ? "true" : "false");
      formData.append("is_donasi", isDonasi ? "true" : "false");

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
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col items-center justify-center bg-linear-to-b from-[#7C3996] to-[#b359d4]">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-white font-bold animate-pulse">{t("verifying_account", "Memeriksa Akun...")}</p>
      </div>
    );
  }

  if (isUnverified) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-amber-500 to-orange-500 shadow-2xl relative">
        <nav className="w-full px-6 pt-8 pb-4 flex items-center justify-between z-10">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-95 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10" /> 
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-20">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/30 relative">
             <Clock size={48} className="text-white" />
             <div className="absolute -bottom-2 -right-2 bg-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-orange-500">
                <Lock size={14} className="text-orange-500" />
             </div>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight mb-3">
            {t("account_not_verified", "Akun Belum Terverifikasi")}
          </h2>
          <p className="text-orange-50 text-sm leading-relaxed mb-8 bg-black/10 p-4 rounded-2xl border border-white/20 backdrop-blur-sm">
            Data profil Anda saat ini sedang dalam proses peninjauan atau belum disetujui oleh tim Admin. Anda baru bisa membuat kampanye setelah akun diverifikasi (Approved).
          </p>
          <button 
            onClick={() => router.push("/ProfilePage")} 
            className="bg-white text-orange-600 font-bold py-3.5 px-8 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            {t("check_profile", "Cek Profil Saya")}
          </button>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#b359d4] shadow-2xl relative">
        <nav className="w-full px-6 pt-8 pb-4 flex items-center justify-between z-10">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-95 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10" /> 
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center -mt-20">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/20 relative">
             <ShieldAlert size={48} className="text-white" />
             <div className="absolute -bottom-2 -right-2 bg-red-500 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#b55bd4]">
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
            className="bg-white text-purple-700 font-bold py-3.5 px-8 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            {t("manage_my_programs", "Kelola Program Saya")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#b359d4] shadow-2xl relative overflow-x-hidden">
      
      {toast && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 duration-300 border w-[90%] max-w-sm ${
          toast.type === "success" ? "bg-green-600/90 border-green-400 text-white" : 
          toast.type === "warning" ? "bg-amber-500/90 border-amber-400 text-white" : "bg-red-600/90 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={24} className="shrink-0" /> : <AlertCircle size={24} className="shrink-0" />}
          <span className="font-bold text-sm tracking-wide leading-snug">{toast.message}</span>
        </div>
      )}

      <nav className="w-full px-6 pt-8 pb-4 flex items-center justify-between z-10">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg text-white font-bold tracking-wide drop-shadow-md">
          {t("create_program", "Buat Program")}
        </h1>
        <div className="w-10 h-10" /> 
      </nav>

      <div className="px-8 mt-2 mb-6">
        <h2 className="text-2xl font-extrabold text-white leading-tight">
          {t("start_goodness_today", "Mulai Kebaikan")}
        </h2>
        <p className="text-purple-100 text-sm mt-2 opacity-90">
          {t("complete_details_desc", "Lengkapi detail program di bawah ini.")}
        </p>
      </div>

      <div className="flex-1 w-full bg-white/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 🔥 PILIHAN TIPE DONASI (DONASI / WAKAF) */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">Tipe Program</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange("donation_type", "donasi")}
                className={`py-3.5 px-4 rounded-2xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  form.donation_type === "donasi" 
                    ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm" 
                    : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                }`}
              >
                <Gift size={18} /> Donasi
              </button>

              <button
                type="button"
                onClick={() => handleChange("donation_type", "wakaf")}
                className={`py-3.5 px-4 rounded-2xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  form.donation_type === "wakaf" 
                    ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm" 
                    : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                }`}
              >
                <BookOpen size={18} /> Wakaf
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-gray-700">{t("campaign_banner_label", "Foto/Banner Kampanye")}</label>
              <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${previewUrls.length === 5 ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
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
                      <div className="absolute bottom-0 left-0 right-0 bg-purple-600/90 text-white text-[9px] font-bold text-center py-1.5 backdrop-blur-sm">
                        Cover Utama
                      </div>
                    )}
                  </div>
                ))}

                {previewUrls.length < 5 && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-2xl cursor-pointer hover:bg-purple-50 transition-colors aspect-square">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-600 mb-1">
                       <Plus size={18} />
                    </div>
                    <span className="text-[10px] text-purple-600 font-bold">Tambah</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                  </label>
                )}
              </div>
            )}

            {previewUrls.length === 0 && (
              <label className="relative flex flex-col items-center justify-center w-full min-h-[200px] bg-gray-50 border-2 border-dashed border-purple-200 rounded-3xl cursor-pointer hover:bg-purple-50/50 hover:border-purple-400 transition-all overflow-hidden group p-6">
                <div className="bg-white p-4 rounded-full shadow-sm border border-purple-100 mb-4 text-purple-500 group-hover:scale-110 transition-transform duration-300">
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

          {beneficiaryType === "individual" && (
            <div className="flex flex-col gap-1.5 w-full">
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

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">{t("category_label", "Kategori")}</label>
            <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
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
                <option value="5">{t("cat_general", "Umum")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("target_amount_label", "Target (Rp)")}</label>
              <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <div className="text-purple-600 font-bold text-base mr-2">Rp</div>
                <input
                  type="number"
                  value={form.target_amount}
                  onChange={(e) => handleChange("target_amount", e.target.value)}
                  placeholder="Kosongkan untuk Unlimited"
                  className="w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300"
                  min="1000"
                  step="1"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium ml-1 leading-tight">
                *Kosongkan jika tidak ada target dana
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
                *Kosongkan jika berjalan tanpa batas waktu
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">{t("short_desc_label", "Deskripsi Singkat")}</label>
            <div className="group flex items-start bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300 mt-1">
                <FileText size={18} />
              </div>
              <textarea 
                value={form.description} onChange={(e) => handleChange("description", e.target.value)} 
                placeholder={t("short_desc_placeholder", "Ceritakan ringkasan tujuan penggalangan dana ini...")} 
                rows={3} className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal resize-none leading-relaxed" 
                required 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">{t("objective_label", "Tujuan Lengkap")}</label>
            <div className="group flex items-start bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300 mt-1">
                <BookOpen size={18} />
              </div>
              <textarea 
                value={form.story} onChange={(e) => handleChange("story", e.target.value)} 
                placeholder={t("story_placeholder", "Tuliskan cerita detail mengapa orang harus membantu...")} 
                rows={8} className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal resize-none leading-relaxed" 
                required 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="group relative w-full mt-4 flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(124,57,150,0.7)] hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {authLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /> 
                <span className="text-lg">{t("publish_program", "Ajukan Kampanye")}</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, icon, placeholder, type = "text", required = false }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
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