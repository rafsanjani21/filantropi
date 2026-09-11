"use client";

import "@/lib/i18n";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/app/components/ui/user/navbar";
import { useTranslation } from "react-i18next";
import {
  User, Save, Camera, Edit3, X, CheckCircle2, AlertCircle, Phone, CreditCard,
  MapPin, Map, Landmark, FileText, Image as ImageIcon, Users
} from "lucide-react";

// ================= DATA & KONSTANTA =================
const BANK_OPTIONS = [
  "BANK BSI", "BANK MANDIRI", "BANK BCA", "BANK BNI", "BANK BRI",
  "BANK MUAMALAT", "BANK MEGA SYARIAH", "CIMB NIAGA", "BANK JAGO", "SEABANK",
];

const GENDER_OPTIONS = ["Laki-Laki", "Perempuan"];

type Region = { id: string; name: string };
const REGION_API = "https://www.emsifa.com/api-wilayah-indonesia/api";

// ================= FUNGSI UTILITY =================
const base64ToFile = (base64Data: string, filename: string): File => {
  const arr = base64Data.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) { u8arr[n] = bstr.charCodeAt(n); }
  return new File([u8arr], filename, { type: mime });
};

// ================= KOMPONEN UTAMA =================
export default function UserPage() {
  const router = useRouter();
  const { getProfile, updateProfile } = useAuth();
  const { t } = useTranslation();

  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "";

  // STATE HALAMAN
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isBankLainnya, setIsBankLainnya] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // STATE DATA WILAYAH
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  // 🔥 STATE FORM DIPERBARUI (Tambah gender)
  const [form, setForm] = useState({
    name: "", gender: "", nik: "", phone_number: "", address: "",
    domicile_province: "", domicile_city: "", domicile_district: "", domicile_village: "",
    bank_name: "", no_req: "", bank_account_name: "",
  });
  const [originalForm, setOriginalForm] = useState({ ...form });

  // STATE FOTO & FILE
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);

  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [originalKtpPreview, setOriginalKtpPreview] = useState<string | null>(null);

  // STATE LIVE KAMERA (NATIVE)
  const [activeCamera, setActiveCamera] = useState<"profile" | "ktp" | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const idToken = sessionStorage.getItem("id_token");
    const tempName = sessionStorage.getItem("temp_name");

    if (idToken) {
      setIsNew(true);
      setIsEditing(true);
      setForm((prev) => ({ ...prev, name: tempName || "" }));
      loadRegionData();
    } else {
      fetchProfile();
    }

    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRegionData = async (provName?: string, cityName?: string, distName?: string) => {
    try {
      const pRes = await fetch(`${REGION_API}/provinces.json`);
      const pData = await pRes.json();
      setProvinces(pData);

      if (provName) {
        const pId = pData.find((p: Region) => p.name === provName)?.id;
        if (pId) {
          const cRes = await fetch(`${REGION_API}/regencies/${pId}.json`);
          const cData = await cRes.json();
          setCities(cData);

          if (cityName) {
            const cId = cData.find((c: Region) => c.name === cityName)?.id;
            if (cId) {
              const dRes = await fetch(`${REGION_API}/districts/${cId}.json`);
              const dData = await dRes.json();
              setDistricts(dData);

              if (distName) {
                const dId = dData.find((d: Region) => d.name === distName)?.id;
                if (dId) {
                  const vRes = await fetch(`${REGION_API}/villages/${dId}.json`);
                  setVillages(await vRes.json());
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Gagal memuat data wilayah", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      
      // 🔥 Data gender ditangkap dari backend
      const loadedForm = {
        name: data.full_name || "", gender: data.gender || "", nik: data.nik || "", phone_number: data.phone_number || "", address: data.address || "",
        domicile_province: data.domicile_province || "", domicile_city: data.domicile_city || "",
        domicile_district: data.domicile_district || "", domicile_village: data.domicile_village || "",
        bank_name: data.bank_name || "", no_req: data.no_req || "", bank_account_name: data.bank_account_name || "",
      };

      setForm(loadedForm);
      setOriginalForm(loadedForm);
      setIsBankLainnya(!!data.bank_name && !BANK_OPTIONS.includes(data.bank_name));
      
      loadRegionData(data.domicile_province, data.domicile_city, data.domicile_district);

      const cleanBaseUrl = BASE_URL.replace(/\/+$/, "");
      if (data.profile_image_url) {
        let cleanPhotoUrl = data.profile_image_url.startsWith("http")
          ? data.profile_image_url
          : `${cleanBaseUrl}/${data.profile_image_url.replace(/^\/+/, "").startsWith("public/") ? data.profile_image_url.replace(/^\/+/, "") : `public/${data.profile_image_url.replace(/^\/+/, "")}`}`;
        const imgUrl = `${cleanPhotoUrl}?t=${Date.now()}`;
        setPreview(imgUrl); setOriginalPreview(imgUrl);
      }

      if (data.ktp_image_url) {
        let cleanKtpUrl = data.ktp_image_url.startsWith("http")
          ? data.ktp_image_url
          : `${cleanBaseUrl}/${data.ktp_image_url.replace(/^\/+/, "").startsWith("public/") ? data.ktp_image_url.replace(/^\/+/, "") : `public/${data.ktp_image_url.replace(/^\/+/, "")}`}`;
        const imgUrlKtp = `${cleanKtpUrl}?t=${Date.now()}`;
        setKtpPreview(imgUrlKtp); setOriginalKtpPreview(imgUrlKtp);
      }
    } catch (err) {
      console.error("Gagal mengambil profile:", err);
    }
  };

  const handleProvinceChange = async (val: string) => {
    setForm({ ...form, domicile_province: val, domicile_city: "", domicile_district: "", domicile_village: "" });
    setCities([]); setDistricts([]); setVillages([]);
    const provId = provinces.find((p) => p.name === val)?.id;
    if (provId) {
      const res = await fetch(`${REGION_API}/regencies/${provId}.json`);
      setCities(await res.json());
    }
  };

  const handleCityChange = async (val: string) => {
    setForm({ ...form, domicile_city: val, domicile_district: "", domicile_village: "" });
    setDistricts([]); setVillages([]);
    const cityId = cities.find((c) => c.name === val)?.id;
    if (cityId) {
      const res = await fetch(`${REGION_API}/districts/${cityId}.json`);
      setDistricts(await res.json());
    }
  };

  const handleDistrictChange = async (val: string) => {
    setForm({ ...form, domicile_district: val, domicile_village: "" });
    setVillages([]);
    const distId = districts.find((d) => d.name === val)?.id;
    if (distId) {
      const res = await fetch(`${REGION_API}/villages/${distId}.json`);
      setVillages(await res.json());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "ktp") => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (type === "profile") {
        setFile(selectedFile); setPreview(URL.createObjectURL(selectedFile));
      } else {
        setKtpFile(selectedFile); setKtpPreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  const startCamera = async (type: "profile" | "ktp") => {
    setActiveCamera(type);
    try {
      const constraints = {
        video: { facingMode: type === "profile" ? "user" : "environment" },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (error) {
      console.error("Gagal mengakses kamera:", error);
      showToast("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser.", "error");
      setActiveCamera(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setActiveCamera(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return;

      const containerWidth = video.clientWidth;
      const containerHeight = video.clientHeight;
      const containerRatio = containerWidth / containerHeight;

      const nativeWidth = video.videoWidth;
      const nativeHeight = video.videoHeight;
      const videoRatio = nativeWidth / nativeHeight;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = nativeWidth;
      let sourceHeight = nativeHeight;

      if (videoRatio > containerRatio) {
        sourceWidth = nativeHeight * containerRatio;
        sourceX = (nativeWidth - sourceWidth) / 2;
      } else {
        sourceHeight = nativeWidth / containerRatio;
        sourceY = (nativeHeight - sourceHeight) / 2;
      }

      canvas.width = sourceWidth;
      canvas.height = sourceHeight;

      if (activeCamera === "profile") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL("image/jpeg", 0.90);
      const capturedFile = base64ToFile(imageUrl, `capture_${Date.now()}.jpg`);

      if (activeCamera === "profile") {
        setFile(capturedFile);
        setPreview(imageUrl);
      } else {
        setKtpFile(capturedFile);
        setKtpPreview(imageUrl);
      }
      stopCamera();
    }
  };

  const handleCancel = () => {
    setForm(originalForm); setPreview(originalPreview); setFile(null);
    setKtpPreview(originalKtpPreview); setKtpFile(null); setIsEditing(false);
    setIsBankLainnya(!!originalForm.bank_name && !BANK_OPTIONS.includes(originalForm.bank_name));
    loadRegionData(originalForm.domicile_province, originalForm.domicile_city, originalForm.domicile_district);
  };

  const handleSubmit = async () => {
    if (!form.name) return showToast(t("name_required", "Nama wajib diisi"), "error");
    if (!isNew) {
      if (form.nik && form.nik.length !== 16) return showToast("Periksa kembali NIK Anda (harus 16 angka)", "error");
      if (form.phone_number && (form.phone_number.length < 9 || form.phone_number.length > 13))
        return showToast("Nomor WhatsApp harus 9 - 13 angka", "error");
    }

    setLoading(true);

    try {
      if (isNew) {
        const idToken = sessionStorage.getItem("id_token");
        if (!idToken) throw new Error(t("access_denied_relogin"));

        const regData = new FormData();
        regData.append("full_name", form.name); 
        regData.append("gender", form.gender); // 🔥 Tambah gender saat daftar
        regData.append("role", "user"); 
        regData.append("id_token", idToken);
        if (file) regData.append("profile_image_url", file);

        const res = await fetch(`${BASE_URL}/api/auth/register/donor`, { method: "POST", body: regData });
        const text = await res.text();
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { message: text }; }

        if (!res.ok) throw new Error(data.message || `Error Server: ${res.status}`);

        const newToken = data.data?.access_token || data.access_token;
        localStorage.setItem("access_token", newToken);
        localStorage.setItem("refresh_token", data.data?.refresh_token || data.refresh_token);
        sessionStorage.removeItem("id_token"); sessionStorage.removeItem("temp_name");

        showToast("Menyiapkan akun Anda... Mohon tunggu sebentar.", "success");

        let attempts = 0; const maxAttempts = 6; 
        const pingBackend = async () => {
          try {
            const checkRes = await fetch(`${BASE_URL}/api/user/profile/donors`, { headers: { Authorization: `Bearer ${newToken}` } });
            if (checkRes.ok) window.location.href = "/";
            else throw new Error("Backend belum siap (404)");
          } catch (err) {
            attempts++;
            if (attempts < maxAttempts) setTimeout(pingBackend, 1500);
            else window.location.href = "/";
          }
        };
        setTimeout(pingBackend, 1000);

      } else {
        const updateData = new FormData();
        updateData.append("full_name", form.name); 
        updateData.append("gender", form.gender); // 🔥 Tambah gender saat update
        updateData.append("nik", form.nik); 
        updateData.append("phone_number", form.phone_number);
        updateData.append("address", form.address); 
        updateData.append("domicile_province", form.domicile_province);
        updateData.append("domicile_city", form.domicile_city); 
        updateData.append("domicile_district", form.domicile_district);
        updateData.append("domicile_village", form.domicile_village); 
        updateData.append("bank_name", form.bank_name);
        updateData.append("no_req", form.no_req); 
        updateData.append("bank_account_name", form.bank_account_name);
        
        if (file) updateData.append("profile_image_url", file);
        if (ktpFile) updateData.append("ktp_image_url", ktpFile);

        await updateProfile(updateData, "donor");
        setIsEditing(false);
        showToast("Data profil berhasil disimpan dengan aman!", "success");
        setTimeout(() => { window.location.reload(); }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || t("fail_process_data"), "error");
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
            {isNew ? t("complete_profile", "Lengkapi Profil") : t("my_profile", "Profil Saya")}
          </h1>
        </div>

        <div className="w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/40">
          
          {/* TOMBOL EDIT KANAN ATAS */}
          {!isEditing && !isNew && (
            <div className="flex justify-end mb-2 -mt-2 -mr-2">
              <button onClick={() => setIsEditing(true)} className="group relative inline-flex items-center gap-2 px-5 py-2 bg-white border border-purple-200 text-purple-700 rounded-full font-bold shadow-sm hover:shadow-md hover:border-purple-300 hover:text-purple-800 transition-all duration-300 active:scale-95 overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Edit3 size={15} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10 text-sm">Edit Profil</span>
              </button>
            </div>
          )}

          {/* AREA FOTO PROFIL */}
          <div className={`flex flex-col items-center justify-center mb-8 ${!isEditing && !isNew ? "-mt-4" : ""}`}>
            <div className="relative">
              {isEditing && <div className="absolute -inset-1.5 bg-gradient-to-tr from-purple-500 to-[#E5AFE7] rounded-full blur-sm opacity-50"></div>}
              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gray-50 flex items-center justify-center shadow-md relative transition-all ${!isEditing && "opacity-90 grayscale-[10%]"}`}>
                {preview ? (
                  <img key={preview} src={preview} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                  <User size={50} className="text-gray-300" />
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                <button type="button" onClick={() => startCamera("profile")} className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200 transition-colors shadow-sm cursor-pointer">
                  <Camera size={14} /> Ambil Foto
                </button>
                <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200 transition-colors shadow-sm">
                  <ImageIcon size={14} /> Galeri
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "profile")} />
                </label>
              </div>
            )}
          </div>

          {/* FORM DATA */}
          <div className="space-y-5">
            <InputField label={t("full_name_label", "Nama Lengkap")} value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} icon={<User size={18} />} placeholder={t("full_name_placeholder", "Masukkan nama lengkap")} disabled={!isEditing} />
            
            {/* FORM GENDER */}
            <SelectField 
              label="Jenis Kelamin" 
              value={form.gender} 
              onChange={(val: string) => setForm({ ...form, gender: val })} 
              icon={<Users size={18} />} 
              options={GENDER_OPTIONS} 
              disabled={!isEditing} 
            />

            {!isNew && (
              <div className="animate-in slide-in-from-top-4 fade-in duration-500 space-y-5">
                <InputField label="Nomor Induk Kependudukan (NIK)" value={form.nik} onChange={(e: any) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "").slice(0, 16) })} icon={<CreditCard size={18} />} placeholder="Masukkan 16 digit NIK Anda" disabled={!isEditing} maxLength={16} errorMessage={nikError} />
                
                <InputField label="Nomor WhatsApp / HP" value={form.phone_number} onChange={(e: any) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.startsWith("62")) val = "0" + val.slice(2);
                    else if (val.length > 0 && val[0] !== "0") val = "0" + val;
                    setForm({ ...form, phone_number: val.slice(0, 13) });
                  }} icon={<Phone size={18} />} placeholder="Contoh: 081234567890" disabled={!isEditing} maxLength={13} errorMessage={waError} />

                  <InputField label="Alamat Lengkap Sesuai KTP" value={form.address} onChange={(e: any) => setForm({ ...form, address: e.target.value })} icon={<MapPin size={18} />} placeholder="Jl. Jendral Sudirman No.1" disabled={!isEditing} />

                <div className={`p-4 rounded-2xl space-y-4 transition-all duration-300 border ${!isEditing ? "bg-gray-50/80 border-transparent opacity-80" : "bg-gray-50 border-gray-100"}`}>
                  <p className={`text-sm font-bold transition-colors ${!isEditing ? "text-gray-400" : "text-gray-800"}`}>
                    Informasi Domisili
                  </p>
                  <SelectField label="Provinsi" value={form.domicile_province} onChange={handleProvinceChange} icon={<Map size={18} />} options={provinces.map(p => p.name)} disabled={!isEditing} />
                  <SelectField label="Kota/Kabupaten" value={form.domicile_city} onChange={handleCityChange} icon={<Map size={18} />} options={cities.map(c => c.name)} disabled={!isEditing || !form.domicile_province} />
                  <SelectField label="Kecamatan" value={form.domicile_district} onChange={handleDistrictChange} icon={<Map size={18} />} options={districts.map(d => d.name)} disabled={!isEditing || !form.domicile_city} />
                  <SelectField label="Kelurahan/Desa" value={form.domicile_village} onChange={(val: string) => setForm({ ...form, domicile_village: val })} icon={<Map size={18} />} options={villages.map(v => v.name)} disabled={!isEditing || !form.domicile_district} />
                  
                </div>

                <SelectField label="Nama Bank" value={isBankLainnya ? "Lainnya" : form.bank_name} onChange={(val: string) => {
                    if (val === "Lainnya") { setIsBankLainnya(true); setForm({ ...form, bank_name: "" }); }
                    else { setIsBankLainnya(false); setForm({ ...form, bank_name: val }); }
                  }} icon={<Landmark size={18} />} options={[...BANK_OPTIONS, "Lainnya"]} disabled={!isEditing} />

                {isBankLainnya && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <InputField label="Ketik Nama Bank (Lainnya)" value={form.bank_name} onChange={(e: any) => setForm({ ...form, bank_name: e.target.value.toUpperCase() })} icon={<Landmark size={18} />} placeholder="Misal: BANK BJB" disabled={!isEditing} />
                  </div>
                )}

                <InputField label="Nomor Rekening" value={form.no_req} onChange={(e: any) => setForm({ ...form, no_req: e.target.value.replace(/\D/g, "") })} icon={<CreditCard size={18} />} placeholder="Contoh: 12121212" disabled={!isEditing} />
                <InputField label="Atas Nama Rekening" value={form.bank_account_name} onChange={(e: any) => setForm({ ...form, bank_account_name: e.target.value })} icon={<User size={18} />} placeholder="Nama Pemilik Rekening" disabled={!isEditing} />

                {/* AREA FOTO KTP */}
                <div className="flex flex-col gap-1.5 w-full mt-4">
                  <label className="text-sm font-bold ml-1 text-gray-700">Foto KTP</label>
                  <div className={`relative w-full h-40 rounded-2xl border-2 overflow-hidden flex items-center justify-center bg-gray-50 ${isEditing ? "border-purple-200 border-dashed" : "border-gray-100 border-solid opacity-90"}`}>
                    {ktpPreview ? (
                      <img src={ktpPreview} alt="KTP Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <FileText size={28} className="mb-1 opacity-60" />
                        <span className="text-[11px] font-medium">Belum ada foto KTP</span>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex justify-center gap-2 mt-2 animate-in fade-in">
                      <button type="button" onClick={() => startCamera("ktp")} className="flex items-center justify-center gap-1.5 w-1/2 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition-colors shadow-sm cursor-pointer">
                        <Camera size={15} /> Ambil Foto
                      </button>
                      <label className="cursor-pointer flex items-center justify-center gap-1.5 w-1/2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition-colors shadow-sm">
                        <ImageIcon size={15} /> Galeri
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "ktp")} />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BUTTON SIMPAN / BATAL */}
          {isEditing && (
            <div className="flex gap-3 mt-10">
              {!isNew && (
                <button onClick={handleCancel} disabled={loading} className="w-1/3 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-60 cursor-pointer">
                  <X size={20} className="mr-1" /> Batal
                </button>
              )}
              <button onClick={handleSubmit} disabled={loading} className={`${isNew ? "w-full" : "w-2/3"} flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-60 cursor-pointer`}>
                {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {isNew ? "Selesai Daftar" : "Simpan Data"}</>}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 🔥 MODAL OVERLAY UNTUK LIVE WEBCAM (TAMPILAN MOBILE) 🔥 */}
      {activeCamera && (
        <div className="fixed inset-0 z-[150] flex justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg h-full bg-slate-900 flex flex-col relative overflow-hidden shadow-2xl">
            <div className="w-full flex justify-between items-center p-5 absolute top-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
              <h3 className="text-white font-bold text-lg drop-shadow-md">
                {activeCamera === "profile" ? "Foto Profil" : "Foto KTP Fisik"}
              </h3>
              <button type="button" onClick={stopCamera} className="bg-white/20 p-2 rounded-full backdrop-blur-md active:scale-90 transition-transform text-white cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <div className="w-full h-full bg-black relative flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover ${activeCamera === 'profile' ? 'scale-x-[-1]' : ''}`} 
              />
              
              {activeCamera === "ktp" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                  <div className="w-full max-w-sm aspect-[1.58/1] border-2 border-dashed border-purple-400 rounded-xl bg-purple-500/10 flex flex-col items-center justify-center">
                    <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                      Posisikan KTP di Dalam Kotak
                    </span>
                  </div>
                </div>
              )}
              
              {activeCamera === "profile" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                  <div className="w-48 h-64 border-2 border-dashed border-purple-400 rounded-[100px] bg-purple-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 w-full p-8 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center">
              <button 
                type="button" 
                onClick={capturePhoto} 
                className="w-20 h-20 rounded-full bg-white border-8 border-gray-400 flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= KOMPONEN REUSABLE =================
function InputField({ label, value, onChange, icon, placeholder, disabled, maxLength, errorMessage }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className={`text-sm font-bold ml-1 transition-colors ${disabled ? "text-gray-400" : errorMessage ? "text-red-500" : "text-gray-700"}`}>
        {label}
      </label>
      <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 border-2 ${disabled ? "bg-gray-50/80 border-transparent cursor-not-allowed opacity-80" : errorMessage ? "bg-red-50/50 border-red-300 focus-within:bg-white focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] group" : "bg-gray-50 border-gray-100 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] group"}`}>
        <div className={`transition-colors duration-300 ${disabled ? "text-gray-300" : errorMessage ? "text-red-400 group-focus-within:text-red-500" : "text-gray-400 group-focus-within:text-purple-600"}`}>
          {icon}
        </div>
        <input 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          disabled={disabled} 
          maxLength={maxLength} 
          className={`ml-3 w-full bg-transparent outline-none font-medium placeholder:font-normal ${disabled ? "text-gray-400 cursor-not-allowed" : "text-gray-800 placeholder:text-gray-300"}`} 
        />
      </div>
      {errorMessage && !disabled && <p className="text-[11px] font-bold text-red-500 ml-2 mt-0.5 animate-in fade-in">{errorMessage}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, icon, options, disabled }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <label className={`text-sm font-bold ml-1 transition-colors ${disabled ? "text-gray-400" : "text-gray-700"}`}>
        {label}
      </label>
      <div onClick={() => !disabled && setIsOpen(!isOpen)} className={`flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all duration-300 border-2 ${disabled ? "bg-gray-50/80 border-transparent cursor-not-allowed opacity-80" : isOpen ? "bg-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer" : "bg-gray-50 border-gray-100 hover:border-purple-200 cursor-pointer"}`}>
        <div className="flex items-center w-full min-w-0">
          <div className={`shrink-0 transition-colors duration-300 ${disabled ? "text-gray-300" : isOpen ? "text-purple-600" : "text-gray-400"}`}>
            {icon}
          </div>
          <span className={`ml-3 font-medium truncate ${disabled ? "text-gray-400 cursor-not-allowed" : !value ? "text-gray-400" : "text-gray-800"}`}>
            {value || `Pilih ${label}`}
          </span>
        </div>
        {!disabled && (
          <div className="shrink-0 text-gray-400 ml-2">
            <svg className={`w-4 h-4 fill-current transition-transform duration-300 ${isOpen ? "rotate-180 text-purple-600" : ""}`} viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[84px] left-0 w-full bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
              {options.length > 0 ? options.map((option: string) => (
                <div key={option} onClick={() => { onChange(option); setIsOpen(false); }} className={`px-5 py-3 cursor-pointer transition-colors text-sm font-bold tracking-wide truncate ${value === option ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50 hover:text-purple-600"}`}>
                  {option}
                </div>
              )) : (
                <div className="px-5 py-3 text-sm text-gray-400 text-center italic">Tidak ada opsi tersedia</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}