"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/app/components/ui/user/navbar";
import { 
  User, Wallet, Save, Phone, MapPin, 
  FileText, CreditCard, Calendar, Briefcase, Building, Camera, Edit3, X
} from "lucide-react";

export default function PagePenerima() {
  const router = useRouter();
  const { getProfile, updateProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [tipePenerima, setTipePenerima] = useState<string>("perorangan"); 
  const [isNewUser, setIsNewUser] = useState(false);
  
  // State untuk Mode Edit
  const [isEditing, setIsEditing] = useState(false);

  // State untuk Foto Profil
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [originalPreview, setOriginalPreview] = useState<string>(""); // Backup preview

  const [form, setForm] = useState({
    name: "",
    wallet: "",
    phone_number: "",
    alamat: "",
    bio_description: "",
    nik: "",
    jenis_kelamin: "Laki-laki",
    agama: "Islam",
    tempat_lahir: "",
    tanggal_lahir: "",
    pekerjaan: "",
    registration_number: "",
    npwp: "",
  });

  // Backup form data untuk fitur Cancel
  const [originalForm, setOriginalForm] = useState(form);

  const BASE_URL = "http://192.168.52.29:8080";

  useEffect(() => {
    const idToken = sessionStorage.getItem("id_token");
    
    if (idToken) {
      setIsNewUser(true);
      setIsEditing(true); // User baru otomatis masuk mode edit
      const savedType = sessionStorage.getItem("tipe_penerima");
      if (savedType === "perorangan" || savedType === "individual") {
        setTipePenerima("perorangan");
      } else if (savedType === "organisasi" || savedType === "organization") {
        setTipePenerima("organisasi");
      }
    } else {
      setIsNewUser(false);
      fetchExistingProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatImageUrl = (path: string) => {
    if (!path) return "";
    return `${BASE_URL}/${path}?t=${Date.now()}`; 
  };

  const fetchExistingProfile = async () => {
    try {
      const data = await getProfile("beneficiary");
      
      if (data.beneficiary_type === "individual") {
        setTipePenerima("perorangan");
      } else if (data.beneficiary_type === "organization") {
        setTipePenerima("organisasi");
      }

      const p = data.profile || data; 
      
      const loadedForm = {
        name: p.full_name || data.full_name || "",
        wallet: data.wallet_address || "",
        phone_number: p.phone_number || "",
        alamat: p.alamat || "",
        bio_description: p.bio_description || "",
        nik: p.nik || "",
        jenis_kelamin: p.jenis_kelamin || "Laki-laki",
        agama: p.agama || "Islam",
        tempat_lahir: p.tempat_lahir || "",
        tanggal_lahir: p.tanggal_lahir ? p.tanggal_lahir.split("T")[0] : "",
        pekerjaan: p.pekerjaan || "",
        registration_number: p.registration_number || "",
        npwp: p.npwp || "",
      };

      setForm(loadedForm);
      setOriginalForm(loadedForm);

      let imgUrl = "";
      if (data.photo_profile) {
        imgUrl = formatImageUrl(data.photo_profile);
      } else if (data.avatar_url) {
        imgUrl = data.avatar_url;
      }
      
      setPreviewUrl(imgUrl);
      setOriginalPreview(imgUrl);

    } catch (error) {
      console.error("Gagal sinkronisasi data profil:", error);
    }
  };

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

  // Fungsi untuk membatalkan editan
  const handleCancel = () => {
    setForm(originalForm);
    setPreviewUrl(originalPreview);
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const typeStr = tipePenerima === "perorangan" ? "individual" : "organization";

      if (isNewUser) {
        // ==========================================
        // 1. LOGIKA REGISTER (USER BARU)
        // ==========================================
        const userPayload: any = {
          role: "beneficiary",
          beneficiary_type: typeStr,
          wallet_address: form.wallet,
          full_name: form.name, 
        };

        let profilePayload: any = {
          phone_number: form.phone_number,
          alamat: form.alamat,
          bio_description: form.bio_description,
        };

        if (tipePenerima === "perorangan") {
          profilePayload = {
            ...profilePayload,
            beneficiary_type: "individual",
            full_name: form.name,
            nik: form.nik,
            jenis_kelamin: form.jenis_kelamin,
            agama: form.agama,
            tempat_lahir: form.tempat_lahir,
            tanggal_lahir: form.tanggal_lahir, 
            pekerjaan: form.pekerjaan,
          };
        } else {
          profilePayload = {
            ...profilePayload,
            registration_number: form.registration_number,
            npwp: form.npwp,
          };
        }

        const idToken = sessionStorage.getItem("id_token");
        if (!idToken) throw new Error("Akses ditolak. Silakan login ulang.");

        userPayload.id_token = idToken; 

        const finalPayload = {
          user: userPayload,
          profile: profilePayload
        };

        const res = await fetch(`${BASE_URL}/api/auth/register/beneficiary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalPayload) 
        });

        const text = await res.text();
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          data = { message: text };
        }

        if (!res.ok) {
          throw new Error(data.message || `Error Server: ${res.status}`);
        }

        localStorage.setItem("access_token", data.data?.access_token || data.access_token);
        localStorage.setItem("refresh_token", data.data?.refresh_token || data.refresh_token);

        sessionStorage.removeItem("id_token");
        sessionStorage.removeItem("tipe_penerima");

        if (selectedFile) {
          const formDataFoto = new FormData();
          formDataFoto.append("photo_profile", selectedFile);
          try {
            await updateProfile(formDataFoto, "beneficiary");
          } catch (fotoErr) {
            console.warn("Registrasi berhasil, tapi gagal upload foto:", fotoErr);
          }
        }

        router.replace("/");

      } else {
        // ==========================================
        // 2. LOGIKA UPDATE PROFIL (USER LAMA)
        // ==========================================
        const formData = new FormData();
        
        formData.append("beneficiary_type", typeStr);
        formData.append("full_name", form.name);
        formData.append("wallet_address", form.wallet);
        formData.append("phone_number", form.phone_number);
        formData.append("alamat", form.alamat);
        formData.append("bio_description", form.bio_description);

        if (selectedFile) {
          formData.append("photo_profile", selectedFile);
        }

        if (tipePenerima === "perorangan") {
          formData.append("nik", form.nik);
          formData.append("jenis_kelamin", form.jenis_kelamin);
          formData.append("agama", form.agama);
          formData.append("tempat_lahir", form.tempat_lahir);
          formData.append("tanggal_lahir", form.tanggal_lahir);
          formData.append("pekerjaan", form.pekerjaan);
        } else {
          formData.append("registration_number", form.registration_number);
          formData.append("npwp", form.npwp);
        }

        await updateProfile(formData, "beneficiary");
        
        // Perbarui data backup
        setOriginalForm(form);
        setOriginalPreview(previewUrl);
        
        alert("Profil berhasil diperbarui!");
        setIsEditing(false); // Kunci kembali form
      }

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal memproses pendaftaran/pembaruan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#E5AFE7] shadow-2xl relative overflow-x-hidden">
      <Navbar />

      <main className="flex-1 px-8 pt-8 pb-12 flex flex-col items-center">
        
        <div className="w-full mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isNewUser ? "Lengkapi Profil" : "Profil Saya"}
          </h1>
          <p className="text-purple-200 text-sm mt-2">
            {isNewUser 
              ? "Isi data di bawah ini untuk menyelesaikan pendaftaran sebagai penerima manfaat" 
              : isEditing ? "Mode edit aktif. Silakan ubah data Anda." : `Data ${tipePenerima === "perorangan" ? "Individu" : "Organisasi"} Anda`}
          </p>
        </div>

        <div className="w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/40">
          
          <div className="space-y-5">

            {/* --- UI UNGGAH FOTO PROFIL --- */}
            <div className="flex flex-col items-center justify-center mb-8">
              <label htmlFor="photo-upload" className={`relative group ${isEditing ? "cursor-pointer" : ""}`}>
                
                {/* Efek Cincin saat Edit Mode */}
                {isEditing && (
                  <div className="absolute -inset-1.5 bg-linear-to-tr from-purple-500 to-[#E5AFE7] rounded-full blur-sm opacity-50 group-hover:opacity-100 transition duration-300"></div>
                )}

                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gray-50 flex items-center justify-center shadow-md relative transition-all ${!isEditing && "opacity-90 grayscale-[10%]"}`}>
                  {previewUrl ? (
                    <img 
                      key={previewUrl} 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }} 
                    />
                  ) : (
                    <User size={50} className="text-gray-300" />
                  )}
                  {/* Overlay Hitam Transparan (Hanya muncul saat edit mode) */}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white mb-1" />
                      <span className="text-white text-[10px] font-bold text-center px-2">Ganti Foto</span>
                    </div>
                  )}
                </div>
              </label>
              {/* Input file hanya aktif jika isEditing = true */}
              {isEditing && (
                <input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange} 
                />
              )}
            </div>
            {/* ----------------------------- */}

            {/* --- FIELD UMUM (MUNCUL DI KEDUANYA) --- */}
            <InputField 
              label={tipePenerima === "perorangan" ? "Nama Lengkap" : "Nama Yayasan/Organisasi"} 
              value={form.name} onChange={(e: any) => handleChange("name", e.target.value)} 
              icon={tipePenerima === "perorangan" ? <User size={18} /> : <Building size={18} />} 
              placeholder={tipePenerima === "perorangan" ? "Sesuai KTP" : "Sesuai Akta Pendirian"} 
              disabled={!isEditing}
            />
            
            <InputField 
              label="Nomor Telepon" value={form.phone_number} onChange={(e: any) => handleChange("phone_number", e.target.value)} 
              icon={<Phone size={18} />} placeholder="0812xxxxxxxx" 
              disabled={!isEditing}
            />

            <InputField 
              label="Wallet Address" value={form.wallet} onChange={(e: any) => handleChange("wallet", e.target.value)} 
              icon={<Wallet size={18} />} placeholder="0x..." 
              disabled={!isEditing}
            />

            <TextAreaField 
              label={tipePenerima === "perorangan" ? "Alamat Rumah Lengkap" : "Alamat Kantor Yayasan"} 
              value={form.alamat} onChange={(e: any) => handleChange("alamat", e.target.value)} 
              icon={<MapPin size={18} />} placeholder="Jalan, RT/RW, Kelurahan..." 
              disabled={!isEditing}
            />

            <TextAreaField 
              label={tipePenerima === "perorangan" ? "Cerita Singkat / Latar Belakang" : "Visi Misi Organisasi"} 
              value={form.bio_description} onChange={(e: any) => handleChange("bio_description", e.target.value)} 
              icon={<FileText size={18} />} placeholder="Jelaskan secara singkat..." 
              disabled={!isEditing}
            />

            {/* --- KHUSUS INDIVIDU --- */}
            {tipePenerima === "perorangan" && (
              <>
                <div className="h-px bg-gray-200 my-6"></div>
                <h3 className={`font-bold mb-2 transition-colors ${isEditing ? "text-purple-800" : "text-gray-500"}`}>Data Pribadi</h3>
                
                <InputField 
                  label="Nomor Induk Kependudukan (NIK)" value={form.nik} onChange={(e: any) => handleChange("nik", e.target.value)} 
                  icon={<CreditCard size={18} />} placeholder="16 digit angka KTP" 
                  disabled={!isEditing}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-sm font-bold ml-1 transition-colors ${!isEditing ? "text-gray-500" : "text-gray-700"}`}>
                      Jenis Kelamin
                    </label>
                    <select 
                      value={form.jenis_kelamin} 
                      onChange={(e) => handleChange("jenis_kelamin", e.target.value)} 
                      disabled={!isEditing}
                      className={`w-full border-2 rounded-2xl px-4 py-3.5 outline-none transition-colors ${
                        !isEditing 
                          ? "bg-gray-50/50 border-transparent text-gray-500 appearance-none cursor-not-allowed" 
                          : "bg-gray-50 border-gray-100 focus:bg-white focus:border-purple-400 text-gray-800"
                      }`}
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  
                  <InputField label="Agama" value={form.agama} onChange={(e: any) => handleChange("agama", e.target.value)} icon={null} placeholder="Agama" disabled={!isEditing} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Tempat Lahir" value={form.tempat_lahir} onChange={(e: any) => handleChange("tempat_lahir", e.target.value)} icon={<MapPin size={18} />} placeholder="Kota lahir" disabled={!isEditing} />
                  <InputField label="Tanggal Lahir" type="date" value={form.tanggal_lahir} onChange={(e: any) => handleChange("tanggal_lahir", e.target.value)} icon={<Calendar size={18} />} placeholder="" disabled={!isEditing} />
                </div>

                <InputField 
                  label="Pekerjaan" value={form.pekerjaan} onChange={(e: any) => handleChange("pekerjaan", e.target.value)} 
                  icon={<Briefcase size={18} />} placeholder="Contoh: Buruh Harian, Petani..." 
                  disabled={!isEditing}
                />
              </>
            )}

            {/* --- KHUSUS ORGANISASI --- */}
            {tipePenerima === "organisasi" && (
              <>
                <div className="h-px bg-gray-200 my-6"></div>
                <h3 className={`font-bold mb-2 transition-colors ${isEditing ? "text-purple-800" : "text-gray-500"}`}>Legalitas Organisasi</h3>
                
                <InputField 
                  label="Nomor Registrasi / SK Kemenkumham" value={form.registration_number} onChange={(e: any) => handleChange("registration_number", e.target.value)} 
                  icon={<FileText size={18} />} placeholder="REG-123..." 
                  disabled={!isEditing}
                />

                <InputField 
                  label="NPWP Organisasi" value={form.npwp} onChange={(e: any) => handleChange("npwp", e.target.value)} 
                  icon={<CreditCard size={18} />} placeholder="01.234.567.8-910.000" 
                  disabled={!isEditing}
                />
              </>
            )}
          </div>

          {/* AREA TOMBOL (Berubah sesuai state isEditing & isNewUser) */}
          {isNewUser ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="relative w-full mt-10 flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><Save size={20} /> <span className="text-lg">Selesaikan Pendaftaran</span></>
              )}
            </button>
          ) : isEditing ? (
            <div className="flex gap-3 mt-10">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="w-1/3 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                <X size={20} className="mr-1" /> Batal
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-2/3 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] transition-all duration-300 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><Save size={20} /> Simpan Data</>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-10 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200 py-4 px-6 rounded-2xl font-bold transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <Edit3 size={20} /> Edit Profil Saya
            </button>
          )}

        </div>
      </main>
    </div>
  );
}

// Komponen InputField yang Mendukung Read-Only
function InputField({ label, value, onChange, icon, placeholder, type = "text", disabled }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className={`text-sm font-bold ml-1 transition-colors ${disabled ? "text-gray-500" : "text-gray-700"}`}>
        {label}
      </label>
      <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 border-2 ${
        disabled 
          ? "bg-gray-50/50 border-transparent" 
          : "bg-gray-50 border-gray-100 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] group"
      }`}>
        {icon && (
          <div className={`mr-3 transition-colors duration-300 ${disabled ? "text-gray-300" : "text-gray-400 group-focus-within:text-purple-600"}`}>
            {icon}
          </div>
        )}
        <input 
          type={type} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          disabled={disabled}
          className={`w-full bg-transparent outline-none font-medium placeholder:font-normal ${
            disabled ? "text-gray-500 cursor-not-allowed" : "text-gray-800 placeholder:text-gray-300"
          }`} 
        />
      </div>
    </div>
  );
}

// Komponen TextAreaField yang Mendukung Read-Only
function TextAreaField({ label, value, onChange, icon, placeholder, disabled }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className={`text-sm font-bold ml-1 transition-colors ${disabled ? "text-gray-500" : "text-gray-700"}`}>
        {label}
      </label>
      <div className={`flex items-start rounded-2xl px-4 py-3.5 transition-all duration-300 border-2 ${
        disabled 
          ? "bg-gray-50/50 border-transparent" 
          : "bg-gray-50 border-gray-100 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] group"
      }`}>
        {icon && (
          <div className={`mt-1 mr-3 transition-colors duration-300 ${disabled ? "text-gray-300" : "text-gray-400 group-focus-within:text-purple-600"}`}>
            {icon}
          </div>
        )}
        <textarea 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          rows={3} 
          disabled={disabled}
          className={`w-full bg-transparent outline-none resize-none font-medium placeholder:font-normal ${
            disabled ? "text-gray-500 cursor-not-allowed" : "text-gray-800 placeholder:text-gray-300"
          }`} 
        />
      </div>
    </div>
  );
}