"use client";

import "@/lib/i18n"; // Proteksi i18n
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth"; 
import { ethers } from "ethers"; 
import { AuthService } from "@/lib/auth.service"; 
import { useTranslation } from "react-i18next"; 
import { 
  ArrowLeft, ImageIcon, Type, Tag, Calendar, FileText, Send, 
  CheckCircle2, AlertCircle, BookOpen, Wallet, Lock, ShieldAlert,
  Clock 
} from "lucide-react";

export default function GalangPage() {
  const router = useRouter();
  const { createCampaign, getProfile, loading: authLoading } = useAuth(); 
  const { t } = useTranslation(); 

  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // 🔥 STATE BARU: Untuk mengecek is_verified (0 atau 1)
  const [isUnverified, setIsUnverified] = useState(false);

  const [beneficiaryType, setBeneficiaryType] = useState<string>("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
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
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const profile = await getProfile("beneficiary");
        
        // 🔥 LOGIKA BARU: Cek is_verified (0 = belum, 1 = sudah)
        const isVerified = Number(profile?.is_verified || 0);
        
        // Jika is_verified adalah 0, blokir akses!
        if (isVerified === 0) {
          setIsUnverified(true);
          setIsCheckingAccess(false);
          return; // Hentikan fungsi di sini
        }

        // Lanjut eksekusi normal jika sudah terverifikasi
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      showToast(t("upload_banner_error", "Banner kampanye wajib diunggah!"), "error");
      return;
    }

    // 🔥 VALIDASI WALLET HANYA UNTUK INDIVIDU
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
      formData.append("target_amount", form.target_amount);
      formData.append("end_date", form.end_date); 
      
      // 🔥 JIKA INDIVIDU, KIRIM WALLET. JIKA LEMBAGA, KOSONGKAN.
      if (beneficiaryType === "individual") {
        formData.append("wallet_address", form.wallet_address.trim()); 
      } else {
        formData.append("wallet_address", ""); 
      }
      
      formData.append("image_banner", selectedFile);

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

  // 1. LAYAR LOADING
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col items-center justify-center bg-linear-to-b from-[#7C3996] to-[#b359d4]">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-white font-bold animate-pulse">{t("verifying_account", "Memeriksa Akun...")}</p>
      </div>
    );
  }

  // 2. LAYAR JIKA AKUN BELUM DIVERIFIKASI ADMIN (is_verified === 0)
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

  // 3. LAYAR JIKA INDIVIDU SUDAH MENCAPAI LIMIT KAMPANYE
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

  // 4. LAYAR UTAMA PEMBUATAN KAMPANYE
  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#b359d4] shadow-2xl relative overflow-x-hidden">
      
      {toast && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 duration-300 border w-[90%] max-w-sm ${
          toast.type === "success" ? "bg-green-600/90 border-green-400 text-white" : "bg-red-600/90 border-red-400 text-white"
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-1">{t("campaign_banner_label", "Banner Kampanye")}</label>
            <label className="relative flex flex-col items-center justify-center w-full h-48 bg-gray-50 border-2 border-dashed border-purple-200 rounded-2xl cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all overflow-hidden group">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-semibold text-sm bg-black/50 px-4 py-2 rounded-full">{t("change_photo", "Ganti Foto")}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="bg-purple-100 p-3 rounded-full mb-3 text-purple-600">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm text-gray-500 font-semibold">{t("click_to_upload", "Klik untuk upload")}</p>
                  <p className="text-xs text-gray-400 mt-1">{t("format_recommendation", "Rekomendasi format: JPG, PNG")}</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>

          <InputField 
            label={t("campaign_title_label", "Judul Kampanye")} 
            value={form.title} onChange={(e: any) => handleChange("title", e.target.value)} 
            icon={<Type size={18} />} placeholder={t("campaign_title_placeholder", "Cth: Bantuan Korban Bencana")} 
            required 
          />

          {/* 🔥 HANYA TAMPILKAN INPUT WALLET JIKA INDIVIDU (READONLY/LOCKED) 🔥 */}
          {beneficiaryType === "individual" && (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("wallet_address_label", "Alamat Wallet")}</label>
              <div className="flex items-center bg-gray-100 border-2 border-gray-200 rounded-2xl px-4 py-3.5 opacity-80 cursor-not-allowed">
                <div className="text-gray-400">
                  <Wallet size={18} />
                </div>
                <input
                  type="text"
                  value={form.wallet_address}
                  readOnly
                  placeholder="Memuat wallet dari profil..."
                  className="ml-3 w-full bg-transparent outline-none text-gray-600 font-mono text-sm cursor-not-allowed"
                />
                {/* Ikon Gembok sebagai indikator terkunci */}
                <Lock size={16} className="text-gray-400 ml-2 shrink-0" />
              </div>
              <p className="text-[10px] text-gray-500 font-medium ml-1 flex items-center gap-1 mt-1">
                <AlertCircle size={12} className="shrink-0" />
                {t("wallet_address_locked", "Alamat dompet ini otomatis terhubung dari profil Anda dan tidak dapat diubah di sini.")}
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
                <option value="3">{t("cat_disaster", "Bencana")}</option>
                <option value="4">{t("cat_mosque", "Tempat Ibadah")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("target_amount_label", "Target (FCC)")}</label>
              <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <div className="text-purple-600 font-bold text-sm mr-2">FCC</div>
                <input 
                  type="number" 
                  value={form.target_amount} onChange={(e) => handleChange("target_amount", e.target.value)} 
                  placeholder="1000" className="w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal" 
                  required min="1" step="0.01" 
                />
              </div>
            </div>

            <InputField 
              label={t("end_date_label", "Berakhir")} type="date"
              value={form.end_date} onChange={(e: any) => handleChange("end_date", e.target.value)} 
              icon={<Calendar size={18} />} placeholder="" 
              required 
            />
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
            <label className="text-sm font-bold text-gray-700 ml-1">{t("story_label", "Cerita Lengkap")}</label>
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