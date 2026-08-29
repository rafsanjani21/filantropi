"use client";

import "@/lib/i18n";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/app/components/ui/user/navbar";
import { useTranslation } from "react-i18next";
import {
  User,
  Save,
  Camera,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  CreditCard,
  MapPin,
  Landmark,
  FileText,
  ArrowRight
} from "lucide-react";

const BANK_OPTIONS = [
  "BANK BSI",
  "BANK MANDIRI",
  "BANK BCA",
  "BANK BNI",
  "BANK BRI",
  "BANK MUAMALAT",
  "BANK MEGA SYARIAH",
  "CIMB NIAGA",
  "BANK JAGO",
  "SEABANK",
];

export default function UserPage() {
  const router = useRouter();
  const { getProfile, updateProfile } = useAuth();
  const { t } = useTranslation();

  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "";
  const MAX_FILE_SIZE = 1048576; // 1 MB

  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isFinishingReg, setIsFinishingReg] = useState(false);
  
  // 🔥 STATE BARU: Untuk melacak apakah user memilih bank "Lainnya"
  const [isBankLainnya, setIsBankLainnya] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    nik: "",
    phone_number: "",
    address: "",
    bank_name: "",
    no_req: "",
    bank_account_name: "",
  });

  const [originalForm, setOriginalForm] = useState({
    name: "",
    nik: "",
    phone_number: "",
    address: "",
    bank_name: "",
    no_req: "",
    bank_account_name: "",
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);

  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [originalKtpPreview, setOriginalKtpPreview] = useState<string | null>(null);

  useEffect(() => {
    const idToken = sessionStorage.getItem("id_token");
    const tempAccess = sessionStorage.getItem("temp_access_hidden");

    if (idToken) {
      setIsNew(true);
      setIsEditing(true);
      setForm((prev) => ({ ...prev, name: sessionStorage.getItem("temp_name") || "" }));
    } else if (tempAccess) {
      setIsNew(false);
      setIsFinishingReg(true);
      setIsEditing(true);
    } else {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();

      const loadedForm = {
        name: data.full_name || "",
        nik: data.nik || "",
        phone_number: data.phone_number || "",
        address: data.address || "",
        bank_name: data.bank_name || "",
        no_req: data.no_req || "",
        bank_account_name: data.bank_account_name || "",
      };

      setForm(loadedForm);
      setOriginalForm(loadedForm);
      
      // 🔥 Pengecekan Bank: Jika bank_name ada TAPI tidak ada di daftar BANK_OPTIONS, berarti "Lainnya"
      setIsBankLainnya(!!data.bank_name && !BANK_OPTIONS.includes(data.bank_name));

      const cleanBaseUrl = BASE_URL.replace(/\/+$/, "");

      if (data.profile_image_url) {
        if (data.profile_image_url.startsWith("http")) {
          const imgUrl = `${data.profile_image_url}?t=${Date.now()}`;
          setPreview(imgUrl);
          setOriginalPreview(imgUrl);
        } else {
          let cleanPhotoUrl = data.profile_image_url.replace(/^\/+/, "");
          if (!cleanPhotoUrl.startsWith("public/")) cleanPhotoUrl = `public/${cleanPhotoUrl}`;
          const imgUrl = `${cleanBaseUrl}/${cleanPhotoUrl}?t=${Date.now()}`;
          setPreview(imgUrl);
          setOriginalPreview(imgUrl);
        }
      }

      if (data.ktp_image_url) {
        if (data.ktp_image_url.startsWith("http")) {
          const imgUrlKtp = `${data.ktp_image_url}?t=${Date.now()}`;
          setKtpPreview(imgUrlKtp);
          setOriginalKtpPreview(imgUrlKtp);
        } else {
          let cleanKtpUrl = data.ktp_image_url.replace(/^\/+/, "");
          if (!cleanKtpUrl.startsWith("public/")) cleanKtpUrl = `public/${cleanKtpUrl}`;
          const imgUrlKtp = `${cleanBaseUrl}/${cleanKtpUrl}?t=${Date.now()}`;
          setKtpPreview(imgUrlKtp);
          setOriginalKtpPreview(imgUrlKtp);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil profile:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "ktp") => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        showToast("Ukuran maksimal foto adalah 1 MB!", "error");
        e.target.value = "";
        return;
      }
      if (type === "profile") {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setKtpFile(selectedFile);
        setKtpPreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleCancel = () => {
    setForm(originalForm);
    setPreview(originalPreview);
    setFile(null);
    setKtpPreview(originalKtpPreview);
    setKtpFile(null);
    setIsEditing(false);
    
    // Kembalikan state dropdown "Lainnya" sesuai data asli
    setIsBankLainnya(!!originalForm.bank_name && !BANK_OPTIONS.includes(originalForm.bank_name));
  };

  const handleSubmit = async () => {
    if (!form.name) return showToast(t("name_required", "Nama wajib diisi"), "error");
    
    if (!isNew) {
      if (form.nik && form.nik.length !== 16) return showToast("Periksa kembali NIK Anda (harus 16 angka)", "error");
      if (form.phone_number && (form.phone_number.length < 9 || form.phone_number.length > 13)) return showToast("Nomor WhatsApp harus 9 - 13 angka", "error");
    }

    setLoading(true);

    try {
      if (isNew) {
        const idToken = sessionStorage.getItem("id_token");
        if (!idToken) throw new Error(t("access_denied_relogin"));

        const regData = new FormData();
        regData.append("full_name", form.name);
        regData.append("role", "user");
        regData.append("id_token", idToken);
        if (file) regData.append("profile_image_url", file);

        const res = await fetch(`${BASE_URL}/api/auth/register/donor`, {
          method: "POST",
          body: regData,
        });

        const text = await res.text();
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { message: text }; }

        if (!res.ok) throw new Error(data.message || `Error Server: ${res.status}`);

        sessionStorage.setItem("temp_access_hidden", data.data?.access_token || data.access_token);
        sessionStorage.setItem("temp_refresh_hidden", data.data?.refresh_token || data.refresh_token);
        
        sessionStorage.removeItem("id_token");
        sessionStorage.removeItem("temp_name");

        setIsNew(false);
        setIsFinishingReg(true);
        setIsEditing(true);

        showToast("Langkah pertama berhasil! Silakan lengkapi sisa form di bawah ini.", "success");
        setTimeout(() => {
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }, 500);

      } else if (isFinishingReg) {
        const hiddenToken = sessionStorage.getItem("temp_access_hidden");
        const hiddenRefresh = sessionStorage.getItem("temp_refresh_hidden");

        if (!hiddenToken) throw new Error("Sesi habis, silakan muat ulang halaman.");

        localStorage.setItem("access_token", hiddenToken);
        if (hiddenRefresh) localStorage.setItem("refresh_token", hiddenRefresh);

        const updateData = new FormData();
        updateData.append("full_name", form.name);
        if (form.nik) updateData.append("nik", form.nik);
        if (form.phone_number) updateData.append("phone_number", form.phone_number);
        if (form.address) updateData.append("address", form.address);
        if (form.bank_name) updateData.append("bank_name", form.bank_name);
        if (form.no_req) updateData.append("no_req", form.no_req);
        if (form.bank_account_name) updateData.append("bank_account_name", form.bank_account_name);
        
        if (file) updateData.append("profile_image_url", file);
        if (ktpFile) updateData.append("ktp_image_url", ktpFile);

        await updateProfile(updateData, "donor");

        localStorage.setItem("access_token", hiddenToken);
        if (hiddenRefresh) localStorage.setItem("refresh_token", hiddenRefresh);
        sessionStorage.removeItem("temp_access_hidden");
        sessionStorage.removeItem("temp_refresh_hidden");

        showToast("Profil lengkap! Membawa Anda ke halaman utama...", "success");
        
        setTimeout(() => {
          window.location.href = "/"; 
        }, 1200);

      } else {
        const updateData = new FormData();
        updateData.append("full_name", form.name);
        updateData.append("nik", form.nik);
        updateData.append("phone_number", form.phone_number);
        updateData.append("address", form.address);
        updateData.append("bank_name", form.bank_name);
        updateData.append("no_req", form.no_req);
        updateData.append("bank_account_name", form.bank_account_name);

        if (file) updateData.append("profile_image_url", file);
        if (ktpFile) updateData.append("ktp_image_url", ktpFile);

        await updateProfile(updateData, "donor");
        await fetchProfile();
        
        setIsEditing(false);
        showToast("Data profil berhasil disimpan dengan aman!", "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || t("fail_process_data"), "error");
    } finally {
      setLoading(false);
    }
  };

  const nikError = form.nik && form.nik.length !== 16 ? "NIK harus tepat 16 angka" : null;
  const waError = form.phone_number && (form.phone_number.length < 9 || form.phone_number.length > 13) ? "Nomor WhatsApp harus 9 - 13 angka" : null;

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] shadow-2xl pb-32 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="kawung-profile" width="56" height="56" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
              <ellipse cx="14" cy="14" rx="12" ry="8" transform="rotate(45 14 14)" />
              <ellipse cx="42" cy="14" rx="12" ry="8" transform="rotate(-45 42 14)" />
              <ellipse cx="14" cy="42" rx="12" ry="8" transform="rotate(-45 14 42)" />
              <ellipse cx="42" cy="42" rx="12" ry="8" transform="rotate(45 42 42)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kawung-profile)" />
      </svg>

      {toast && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 duration-300 border w-[90%] max-w-sm ${toast.type === "success" ? "bg-green-600/90 border-green-400 text-white" : "bg-red-600/90 border-red-400 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 size={24} className="shrink-0" /> : <AlertCircle size={24} className="shrink-0" />}
          <span className="font-bold text-sm tracking-wide leading-snug">{toast.message}</span>
        </div>
      )}

      <Navbar />

      <main className="flex-1 px-8 pt-8 pb-12 flex flex-col items-center">
        <div className="w-full mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isNew || isFinishingReg ? t("complete_profile", "Lengkapi Profil") : t("my_profile", "Profil Saya")}
          </h1>
        </div>

        <div className="w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/40">
          
          <div className="flex flex-col items-center justify-center mb-8">
            <label htmlFor="photo-upload" className={`relative group ${isEditing ? "cursor-pointer" : ""}`}>
              {isEditing && <div className="absolute -inset-1.5 bg-gradient-to-tr from-purple-500 to-[#E5AFE7] rounded-full blur-sm opacity-50 group-hover:opacity-100 transition duration-300"></div>}
              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gray-50 flex items-center justify-center shadow-md relative transition-all ${!isEditing && "opacity-90 grayscale-[10%]"}`}>
                {preview ? <img key={preview} src={preview} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <User size={50} className="text-gray-300" />}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white mb-1" />
                    <span className="text-white text-[10px] font-bold text-center px-2">Ubah Foto</span>
                  </div>
                )}
              </div>
            </label>
            {isEditing && <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "profile")} />}
          </div>

          <div className="space-y-5">
            <InputField label={t("full_name_label", "Nama Lengkap")} value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} icon={<User size={18} />} placeholder={t("full_name_placeholder", "Masukkan nama lengkap")} disabled={!isEditing} />

            {!isNew && (
              <div className="animate-in slide-in-from-top-4 fade-in duration-500 space-y-5">
                <InputField label="Nomor Induk Kependudukan (NIK)" value={form.nik} onChange={(e: any) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "").slice(0, 16) })} icon={<CreditCard size={18} />} placeholder="Masukkan 16 digit NIK Anda" disabled={!isEditing} maxLength={16} errorMessage={nikError} />
                <InputField label="Nomor WhatsApp / HP" value={form.phone_number} onChange={(e: any) => { let val = e.target.value.replace(/\D/g, ""); if (val.startsWith("62")) val = "0" + val.slice(2); else if (val.length > 0 && val[0] !== "0") val = "0" + val; setForm({ ...form, phone_number: val.slice(0, 13) }); }} icon={<Phone size={18} />} placeholder="Contoh: 081234567890" disabled={!isEditing} maxLength={13} errorMessage={waError} />
                <InputField label="Alamat Lengkap" value={form.address} onChange={(e: any) => setForm({ ...form, address: e.target.value }) } icon={<MapPin size={18} />} placeholder="Jl. Jendral Sudirman, Palembang" disabled={!isEditing} />
                
                {/* 🔥 FORM NAMA BANK (PILIHAN & MANUAL) 🔥 */}
                <SelectField
                  label="Nama Bank"
                  value={isBankLainnya ? "Bank Lainnya" : form.bank_name}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (val === "Bank Lainnya") {
                      setIsBankLainnya(true);
                      setForm({ ...form, bank_name: "" }); // Kosongkan agar bisa diisi manual
                    } else {
                      setIsBankLainnya(false);
                      setForm({ ...form, bank_name: val });
                    }
                  }}
                  icon={<Landmark size={18} />}
                  options={[...BANK_OPTIONS, "Bank Lainnya"]} // Menambahkan "Lainnya" di opsi dropdown
                  disabled={!isEditing}
                />

                {isBankLainnya && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <InputField
                      label="Ketik Nama Bank (Lainnya)"
                      value={form.bank_name}
                      onChange={(e: any) => setForm({ ...form, bank_name: e.target.value.toUpperCase() })}
                      icon={<Landmark size={18} />}
                      placeholder="Misal: BANK BJB"
                      disabled={!isEditing}
                    />
                  </div>
                )}

                <InputField label="Nomor Rekening" value={form.no_req} onChange={(e: any) => setForm({ ...form, no_req: e.target.value.replace(/\D/g, ""), }) } icon={<CreditCard size={18} />} placeholder="Contoh: 12121212" disabled={!isEditing} />
                <InputField label="Atas Nama Rekening" value={form.bank_account_name} onChange={(e: any) => setForm({ ...form, bank_account_name: e.target.value }) } icon={<User size={18} />} placeholder="Nama Pemilik Rekening" disabled={!isEditing} />

                <div className="flex flex-col gap-1.5 w-full mt-2">
                  <label className="text-sm font-bold ml-1 text-gray-700">Foto KTP</label>
                  <div className={`relative w-full h-32 rounded-2xl border-2 overflow-hidden flex items-center justify-center bg-gray-50 ${isEditing ? "border-purple-200 border-dashed" : "border-gray-100 border-solid opacity-90"}`}>
                    {ktpPreview ? <img src={ktpPreview} alt="KTP Preview" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-gray-400"><FileText size={28} className="mb-1 opacity-60" /><span className="text-[11px] font-medium">Belum ada foto KTP</span></div>}
                    {isEditing && (
                      <label className="absolute inset-0 w-full h-full cursor-pointer flex flex-col items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity z-10">
                        <Camera size={24} className="text-white mb-1" />
                        <span className="text-white text-[10px] font-bold px-2">Upload KTP</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "ktp")} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="flex gap-3 mt-10">
              {!isNew && !isFinishingReg && (
                <button onClick={handleCancel} disabled={loading} className="w-1/3 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-60 cursor-pointer">
                  <X size={20} className="mr-1" /> Batal
                </button>
              )}
              <button onClick={handleSubmit} disabled={loading} className={`${isNew || isFinishingReg ? "w-full" : "w-2/3"} flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-60 cursor-pointer`}>
                {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <>{isNew ? <ArrowRight size={20}/> : <Save size={20} />} {isNew ? "Lanjutkan" : isFinishingReg ? "Selesai Daftar" : "Simpan Data"}</>}
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="w-full mt-10 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200 py-4 px-6 rounded-2xl font-bold transition-all duration-300 active:scale-95 cursor-pointer">
              <Edit3 size={20} /> Edit Profil
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function InputField({ label, value, onChange, icon, placeholder, disabled, maxLength, errorMessage }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className={`text-sm font-bold ml-1 transition-colors ${disabled ? "text-gray-500" : errorMessage ? "text-red-500" : "text-gray-700"}`}>{label}</label>
      <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 border-2 ${disabled ? "bg-gray-50/50 border-transparent" : errorMessage ? "bg-red-50/50 border-red-300 focus-within:bg-white focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] group" : "bg-gray-50 border-gray-100 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] group"}`}>
        <div className={`transition-colors duration-300 ${disabled ? "text-gray-300" : errorMessage ? "text-red-400 group-focus-within:text-red-500" : "text-gray-400 group-focus-within:text-purple-600"}`}>{icon}</div>
        <input value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} maxLength={maxLength} className={`ml-3 w-full bg-transparent outline-none font-medium placeholder:font-normal ${disabled ? "text-gray-500 cursor-not-allowed" : "text-gray-800 placeholder:text-gray-300"}`} />
      </div>
      {errorMessage && !disabled && <p className="text-[11px] font-bold text-red-500 ml-2 mt-0.5 animate-in fade-in">{errorMessage}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, icon, options, disabled }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className={`text-sm font-bold ml-1 transition-colors ${disabled ? "text-gray-500" : "text-gray-700"}`}>{label}</label>
      <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 border-2 ${disabled ? "bg-gray-50/50 border-transparent" : "bg-gray-50 border-gray-100 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] group"}`}>
        <div className={`transition-colors duration-300 ${disabled ? "text-gray-300" : "text-gray-400 group-focus-within:text-purple-600"}`}>{icon}</div>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`ml-3 w-full bg-transparent outline-none font-medium cursor-pointer appearance-none ${disabled ? "text-gray-500 cursor-not-allowed" : "text-gray-800"} ${!value ? "text-gray-400" : ""}`}
        >
          <option value="" disabled className="text-gray-400">Pilih Bank Anda</option>
          {options.map((option: string) => (
            <option key={option} value={option} className="text-gray-800">
              {option}
            </option>
          ))}
        </select>
        {!disabled && (
          <div className="pointer-events-none text-gray-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}