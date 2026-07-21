"use client";

import "@/lib/i18n"; 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/app/components/ui/user/navbar";
import { useTranslation } from "react-i18next"; 
import { 
  User, Save, Camera, Edit3, X,
  CheckCircle2, AlertCircle, Phone, CreditCard 
} from "lucide-react";

export default function UserPage() {
  const router = useRouter();
  const { getProfile, updateProfile } = useAuth();
  const { t } = useTranslation();

  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  const MAX_FILE_SIZE = 1048576;

  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", nik: "", whatsapp_number: "" });
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [originalForm, setOriginalForm] = useState({ name: "", nik: "", whatsapp_number: "" });
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);

  useEffect(() => {
    const idToken = sessionStorage.getItem("id_token");
    const tempName = sessionStorage.getItem("temp_name");

    if (idToken) {
      setIsNew(true);
      setIsEditing(true);
      setForm((prev) => ({ ...prev, name: tempName || "" }));
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
        whatsapp_number: data.whatsapp_number || "",
      };

      setForm(loadedForm);
      setOriginalForm(loadedForm); 

      if (data.photo_profile) {
        const fullUrl = data.photo_profile.startsWith("http")
          ? data.photo_profile
          : `${BASE_URL}/${data.photo_profile.replace(/^\/+/, '')}`;

        const imgUrl = `${fullUrl}?t=${Date.now()}`;
        setPreview(imgUrl);
        setOriginalPreview(imgUrl); 
      } else {
        setPreview(null);
        setOriginalPreview(null);
      }
    } catch {
      console.error("Gagal ambil profile");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > MAX_FILE_SIZE) {
        showToast("Maximum photo size is 1 MB!", "error");
        e.target.value = ""; 
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleCancel = () => {
    setForm(originalForm);
    setPreview(originalPreview);
    setFile(null);
    setIsEditing(false); 
  };

  const handleSubmit = async () => {
    if (!form.name) {
      showToast(t("name_required", "Nama wajib diisi"), "error");
      return;
    }

    if (!isNew) {
      if (form.nik && form.nik.length !== 16) {
        showToast("Periksa kembali NIK Anda (harus 16 angka)", "error");
        return;
      }
      if (form.whatsapp_number && (form.whatsapp_number.length < 9 || form.whatsapp_number.length > 13)) {
        showToast("Nomor WhatsApp harus 9 - 13 angka", "error");
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("full_name", form.name);
      formData.append("role", "user"); 

      if (!isNew) {
        formData.append("nik", form.nik);
        formData.append("whatsapp_number", form.whatsapp_number);
      }

      if (file) {
        formData.append("photo_profile", file);
      }

      if (isNew) {
        const idToken = sessionStorage.getItem("id_token");
        if (!idToken) throw new Error(t("access_denied_relogin"));

        formData.append("id_token", idToken);

        const res = await fetch(`${BASE_URL}/api/auth/register/donor`, {
          method: "POST",
          body: formData 
        });

        const text = await res.text();
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          data = { message: text };
        }

        if (!res.ok) throw new Error(data.message || `Error Server: ${res.status}`);
        
        localStorage.setItem("access_token", data.data?.access_token || data.access_token);
        localStorage.setItem("refresh_token", data.data?.refresh_token || data.refresh_token);

        sessionStorage.removeItem("id_token");
        sessionStorage.removeItem("temp_name");

        showToast(t("registration_success"), "success");
        
        setTimeout(() => {
          router.replace("/");
        }, 1500);

      } else {
        await updateProfile(formData, "donor"); 

        setOriginalForm(form);
        setOriginalPreview(preview);
        
        setIsEditing(false); 
        showToast(t("profile_updated_success"), "success");
      }
      
    } catch (err: any) {
      console.error(err);
      showToast(err.message || t("fail_process_data"), "error");
    } finally {
      setLoading(false);
    }
  };

  const nikError = form.nik && form.nik.length !== 16 
    ? "NIK harus tepat 16 angka" 
    : null;
    
  const waError = form.whatsapp_number && (form.whatsapp_number.length < 9 || form.whatsapp_number.length > 13) 
    ? "Nomor WhatsApp harus 9 - 13 angka" 
    : null;

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gradient-to-b from-[#7C3996] to-[#b359d4] shadow-2xl relative overflow-x-hidden">
      
      {toast && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 duration-300 border w-[90%] max-w-sm ${
          toast.type === "success" ? "bg-green-600/90 border-green-400 text-white" : "bg-red-600/90 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={24} className="shrink-0" /> : <AlertCircle size={24} className="shrink-0" />}
          <span className="font-bold text-sm tracking-wide leading-snug">{toast.message}</span>
        </div>
      )}

      <Navbar />

      <main className="flex-1 px-8 pt-8 pb-12 flex flex-col items-center">
        
        <div className="w-full mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isNew ? t("complete_profile", "Lengkapi Profil") : t("my_profile", "Profil Saya")}
          </h1>
        </div>

        <div className="w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/40">
          
          <div className="flex flex-col items-center justify-center mb-8">
            <label htmlFor="photo-upload" className={`relative group ${isEditing ? "cursor-pointer" : ""}`}>
              {isEditing && (
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-purple-500 to-[#E5AFE7] rounded-full blur-sm opacity-50 group-hover:opacity-100 transition duration-300"></div>
              )}
              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gray-50 flex items-center justify-center shadow-md relative transition-all ${!isEditing && "opacity-90 grayscale-[10%]"}`}>
                {preview ? (
                  <img key={preview} src={preview} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <User size={50} className="text-gray-300" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white mb-1" />
                    <span className="text-white text-[10px] font-bold text-center px-2">{t("change_photo", "Ubah Foto")}</span>
                  </div>
                )}
              </div>
            </label>
            {isEditing && (
              <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            )}
          </div>

          <div className="space-y-5">
            <InputField
              label={t("full_name_label", "Nama Lengkap")}
              value={form.name}
              onChange={(e: any) => setForm({ ...form, name: e.target.value })}
              icon={<User size={18} />}
              placeholder={t("full_name_placeholder", "Masukkan nama lengkap")}
              disabled={!isEditing} 
            />

            {!isNew && (
              <>
                <InputField
                  label="Nomor Induk Kependudukan (NIK)"
                  value={form.nik}
                  onChange={(e: any) => setForm({ ...form, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  icon={<CreditCard size={18} />}
                  placeholder="Masukkan 16 digit NIK Anda"
                  disabled={!isEditing} 
                  maxLength={16}
                  errorMessage={nikError}
                />

                <InputField
                  label="Nomor WhatsApp"
                  value={form.whatsapp_number}
                  onChange={(e: any) => {
                    // Hanya izinkan angka
                    let val = e.target.value.replace(/\D/g, '');
                    
                    // Otomatis ubah awalan 62 jadi 0, atau sisipkan 0 jika tidak ada
                    if (val.startsWith('62')) {
                      val = '0' + val.slice(2);
                    } else if (val.length > 0 && val[0] !== '0') {
                      val = '0' + val;
                    }
                    
                    // Batasi maksimal 13 karakter
                    setForm({ ...form, whatsapp_number: val.slice(0, 13) });
                  }}
                  icon={<Phone size={18} />}
                  placeholder="Contoh: 081234567890"
                  disabled={!isEditing} 
                  maxLength={13}
                  errorMessage={waError}
                />
              </>
            )}
          </div>

          {isEditing ? (
            <div className="flex gap-3 mt-10">
              {!isNew && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-1/3 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  <X size={20} className="mr-1" /> {t("cancel", "Batal")}
                </button>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`${isNew ? "w-full" : "w-2/3"} flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(124,57,150,0.7)] hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-60 cursor-pointer`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} /> {isNew ? t("finish_registration", "Selesai Daftar") : t("save_data", "Simpan Data")}
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-10 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200 py-4 px-6 rounded-2xl font-bold transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <Edit3 size={20} /> {t("edit_my_profile", "Edit Profil")}
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
      <label className={`text-sm font-bold ml-1 transition-colors ${
        disabled ? "text-gray-500" : errorMessage ? "text-red-500" : "text-gray-700"
      }`}>
        {label}
      </label>
      <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 border-2 ${
        disabled 
          ? "bg-gray-50/50 border-transparent" 
          : errorMessage
            ? "bg-red-50/50 border-red-300 focus-within:bg-white focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] group"
            : "bg-gray-50 border-gray-100 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] group"
      }`}>
        <div className={`transition-colors duration-300 ${
          disabled ? "text-gray-300" : errorMessage ? "text-red-400 group-focus-within:text-red-500" : "text-gray-400 group-focus-within:text-purple-600"
        }`}>
          {icon}
        </div>
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`ml-3 w-full bg-transparent outline-none font-medium placeholder:font-normal ${
            disabled ? "text-gray-500 cursor-not-allowed" : "text-gray-800 placeholder:text-gray-300"
          }`}
        />
      </div>
      
      {errorMessage && !disabled && (
        <p className="text-[11px] font-bold text-red-500 ml-2 mt-0.5 animate-in fade-in">
          {errorMessage}
        </p>
      )}
    </div>
  );
}