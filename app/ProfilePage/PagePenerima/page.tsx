"use client";

import "@/lib/i18n"; // 🔥 Proteksi i18n
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/app/components/ui/user/navbar";
import { useTranslation } from "react-i18next"; // 🔥 Import Hook
import { 
  User, Wallet, Save, Phone, MapPin, 
  FileText, CreditCard, Calendar, Briefcase, Building, Camera, Edit3, X,
  CheckCircle2, AlertCircle, Scale, ShieldCheck, AlertTriangle, Image as ImageIcon
} from "lucide-react";

const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export default function PagePenerima() {
  const router = useRouter();
  const { getProfile, updateProfile } = useAuth();
  const { t } = useTranslation(); // 🔥 Panggil fungsi t

  const [loading, setLoading] = useState(false);
  const [tipePenerima, setTipePenerima] = useState<string>("perorangan"); 
  const [isNewUser, setIsNewUser] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [agreed, setAgreed] = useState(false);
  const [showTnC, setShowTnC] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [originalPreview, setOriginalPreview] = useState<string>(""); 

  const [selectedKtp, setSelectedKtp] = useState<File | null>(null);
  const [previewKtp, setPreviewKtp] = useState<string>("");
  const [originalKtpPreview, setOriginalKtpPreview] = useState<string>("");

  const [form, setForm] = useState({
    name: "",
    wallet: "",
    phone_number: "",
    alamat: "",
    bio_description: "",
    nik: "",
    jenis_kelamin: "Laki-laki",
    tempat_lahir: "",
    tanggal_lahir: "",
    pekerjaan: "",
    registration_number: "",
    npwp: "",
    pic: "", 
  });

  const [errors, setErrors] = useState({
    nik: "",
    phone_number: "",
    npwp: "",
    registration_number: ""
  });

  const [originalForm, setOriginalForm] = useState(form);
  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  useEffect(() => {
    const idToken = sessionStorage.getItem("id_token");
    
    if (idToken) {
      setIsNewUser(true);
      setIsEditing(true); 
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
    return `${BASE_URL}/${path.replace(/^\/+/, '')}?t=${Date.now()}`; 
  };

  const fetchExistingProfile = async () => {
    try {
      const response = await getProfile("beneficiary");
      const data = response.data || response; 
      
      if (data.beneficiary_type === "individual" || data.beneficiary_type === "individu") {
        setTipePenerima("perorangan");
      } else if (data.beneficiary_type === "organization" || data.beneficiary_type === "organisasi") {
        setTipePenerima("organisasi");
      }

      const loadedForm = {
        name: data.full_name || "",
        wallet: data.wallet_address || "",
        phone_number: data.phone_number || "",
        alamat: data.alamat || "",
        bio_description: data.bio_description || "",
        nik: data.nik || "",
        jenis_kelamin: data.jenis_kelamin || "Laki-laki",
        tempat_lahir: data.tempat_lahir || "",
        tanggal_lahir: data.tanggal_lahir ? data.tanggal_lahir.split("T")[0] : "",
        pekerjaan: data.pekerjaan || "",
        registration_number: data.registration_number || "",
        npwp: data.npwp || "",
        pic: data.pic || "",
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

      let ktpUrl = "";
      if (data.url_ktp) {
        ktpUrl = formatImageUrl(data.url_ktp);
      } else if (data.ktp_url) {
        ktpUrl = formatImageUrl(data.ktp_url);
      }
      setPreviewKtp(ktpUrl);
      setOriginalKtpPreview(ktpUrl);

    } catch (error) {
      console.error("Gagal sinkronisasi data profil:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    let newVal = value;
    let newErrors = { ...errors };

    const textFields = ["name", "alamat", "tempat_lahir", "pekerjaan", "pic"];
    if (textFields.includes(field)) {
      newVal = toTitleCase(value);
    }
    if (field === "bio_description" && value.length > 0) {
      newVal = value.charAt(0).toUpperCase() + value.slice(1);
    }

    if (field === "nik") {
      newVal = value.replace(/\D/g, "").slice(0, 16); 
      if (newVal.length > 0 && newVal.length < 16) {
        newErrors.nik = t("err_nik_length");
      } else {
        newErrors.nik = "";
      }
    }

    if (field === "phone_number") {
      newVal = value.replace(/\D/g, "").slice(0, 13);
      if (newVal.length > 0) {
        if (!newVal.startsWith("0")) {
          newErrors.phone_number = t("err_phone_start");
        } else if (newVal.length < 11) {
          newErrors.phone_number = t("err_phone_length");
        } else {
          newErrors.phone_number = "";
        }
      } else {
        newErrors.phone_number = "";
      }
    }

    if (field === "npwp") {
      newVal = value.replace(/\D/g, "").slice(0, 16);
      if (newVal.length > 0 && newVal.length < 15) {
        newErrors.npwp = t("err_npwp_length");
      } else {
        newErrors.npwp = "";
      }
    }

    if (field === "registration_number") {
      newVal = value.toUpperCase();
      if (newVal.length > 0 && newVal.length < 5) {
        newErrors.registration_number = t("err_reg_length");
      } else {
        newErrors.registration_number = "";
      }
    }

    setErrors(newErrors);
    setForm((prev) => ({ ...prev, [field]: newVal }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file); 
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleKtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedKtp(file); 
      setPreviewKtp(URL.createObjectURL(file)); 
    }
  };

  const handleCancel = () => {
    setForm(originalForm);
    setPreviewUrl(originalPreview);
    setSelectedFile(null);
    setPreviewKtp(originalKtpPreview);
    setSelectedKtp(null);
    setErrors({ nik: "", phone_number: "", npwp: "", registration_number: "" });
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    const hasErrors = Object.values(errors).some(err => err !== "");
    if (hasErrors) {
      showToast(t("fix_red_errors"), "error");
      return;
    }

    if (isNewUser && !agreed) {
      showToast(t("must_agree_tnc"), "error");
      return;
    }

    setLoading(true);

    try {
      const typeStr = tipePenerima === "perorangan" ? "individual" : "organization";

      const formData = new FormData();
      formData.append("full_name", form.name);
      formData.append("wallet_address", form.wallet);
      formData.append("role", "beneficiary");
      formData.append("beneficiary_type", typeStr);
      formData.append("phone_number", form.phone_number);
      formData.append("alamat", form.alamat);
      formData.append("bio_description", form.bio_description);
      formData.append("nik", form.nik); 

      if (selectedFile) formData.append("photo_profile", selectedFile);
      if (selectedKtp) formData.append("url_ktp", selectedKtp);

      if (tipePenerima === "perorangan") {
        formData.append("jenis_kelamin", form.jenis_kelamin);
        formData.append("tempat_lahir", form.tempat_lahir);
        formData.append("tanggal_lahir", form.tanggal_lahir);
        formData.append("pekerjaan", form.pekerjaan);
      } else {
        formData.append("registration_number", form.registration_number);
        formData.append("npwp", form.npwp);
        formData.append("pic", form.pic); 
      }

      if (isNewUser) {
        const idToken = sessionStorage.getItem("id_token");
        if (!idToken) throw new Error(t("access_denied_relogin"));
        
        formData.append("id_token", idToken);

        const res = await fetch(`${BASE_URL}/api/auth/register/beneficiary`, {
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
        sessionStorage.removeItem("tipe_penerima");

        router.replace("/");

      } else {
        await updateProfile(formData, "beneficiary");
        
        setOriginalForm(form);
        setOriginalPreview(previewUrl);
        setOriginalKtpPreview(previewKtp);
        
        showToast(t("profile_updated_success"), "success");
        setIsEditing(false); 
      }

    } catch (err: any) {
      console.error(err);
      showToast(err.message || t("fail_process_data"), "error");
    } finally {
      setLoading(false);
    }
  };

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

      {/* POPUP (MODAL) SYARAT & KETENTUAN */}
      {showTnC && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-black text-gray-800">{t("tnc_title")}</h2>
              <button onClick={() => setShowTnC(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-6">
              <div className="flex items-center gap-3 bg-purple-50 text-purple-800 p-3 rounded-xl border border-purple-100">
                <Scale size={20} className="text-purple-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">{t("last_update")}</p>
                  <p className="text-xs font-bold">28 April 2026</p>
                </div>
              </div>

              <section>
                <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-2"><FileText size={16} className="text-purple-500" /> {t("tnc_intro_title")}</h3>
                <p>{t("tnc_intro_desc")}</p>
              </section>

              <section>
                <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-2"><ShieldCheck size={16} className="text-purple-500" /> {t("tnc_resp_title")}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>{t("tnc_transparency")}</strong> {t("tnc_transparency_desc")}</li>
                  <li><strong>{t("tnc_security")}</strong> {t("tnc_security_desc")}</li>
                </ul>
              </section>

              <section>
                <h3 className="text-gray-800 font-bold flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-orange-500" /> {t("tnc_freeze_title")}</h3>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-orange-800 text-xs">
                  <strong>{t("tnc_important")}</strong> {t("tnc_freeze_desc")}
                </div>
              </section>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button onClick={() => { setAgreed(true); setShowTnC(false); }} className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700 active:scale-95 transition-all">
                {t("i_understand_agree")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <main className="flex-1 px-8 pt-8 pb-12 flex flex-col items-center">
        
        <div className="w-full mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isNewUser ? t("complete_profile") : t("my_profile")}
          </h1>
          <p className="text-purple-200 text-sm mt-2">
            {isNewUser 
              ? t("complete_registration_desc") 
              : isEditing ? t("edit_mode_active") : (tipePenerima === "perorangan" ? t("your_individual_data") : t("your_organization_data"))}
          </p>
        </div>

        <div className="w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/40">
          
          <div className="space-y-5">

            {/* FOTO PROFIL */}
            <div className="flex flex-col items-center justify-center mb-8">
              <label htmlFor="photo-upload" className={`relative group ${isEditing ? "cursor-pointer" : ""}`}>
                {isEditing && (
                  <div className="absolute -inset-1.5 bg-linear-to-tr from-purple-500 to-[#E5AFE7] rounded-full blur-sm opacity-50 group-hover:opacity-100 transition duration-300"></div>
                )}
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gray-50 flex items-center justify-center shadow-md relative transition-all ${!isEditing && "opacity-90 grayscale-[10%]"}`}>
                  {previewUrl ? (
                    <img key={previewUrl} src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <User size={50} className="text-gray-300" />
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white mb-1" />
                      <span className="text-white text-[10px] font-bold text-center px-2">{t("change_photo")}</span>
                    </div>
                  )}
                </div>
              </label>
              {isEditing && (
                <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              )}
            </div>

            <InputField 
              label={tipePenerima === "perorangan" ? t("full_name_label") : t("org_name_label")} 
              value={form.name} onChange={(e: any) => handleChange("name", e.target.value)} 
              icon={tipePenerima === "perorangan" ? <User size={18} /> : <Building size={18} />} 
              placeholder={tipePenerima === "perorangan" ? t("full_name_ktp_placeholder") : t("org_name_placeholder")} 
              disabled={!isEditing}
            />
            
            <InputField 
              label={t("phone_number_label")} value={form.phone_number} onChange={(e: any) => handleChange("phone_number", e.target.value)} 
              icon={<Phone size={18} />} placeholder="0812xxxxxxxx" 
              disabled={!isEditing}
              error={errors.phone_number} 
            />

            <InputField 
              label={t("wallet_address_polygon_label")} value={form.wallet} onChange={(e: any) => handleChange("wallet", e.target.value)} 
              icon={<Wallet size={18} />} placeholder="0x..." 
              disabled={!isEditing}
            />

            <TextAreaField 
              label={tipePenerima === "perorangan" ? t("home_address_label") : t("office_address_label")} 
              value={form.alamat} onChange={(e: any) => handleChange("alamat", e.target.value)} 
              icon={<MapPin size={18} />} placeholder={t("address_placeholder")} 
              disabled={!isEditing}
            />

            <TextAreaField 
              label={tipePenerima === "perorangan" ? t("short_story_label") : t("vision_mission_label")} 
              value={form.bio_description} onChange={(e: any) => handleChange("bio_description", e.target.value)} 
              icon={<FileText size={18} />} placeholder={t("short_desc_placeholder_2")} 
              disabled={!isEditing}
            />

            {/* SEKSI IDENTITAS */}
            <div className="h-px bg-gray-200 my-6"></div>
            <h3 className={`font-bold mb-2 transition-colors ${isEditing ? "text-purple-800" : "text-gray-500"}`}>
              {tipePenerima === "perorangan" ? t("personal_data") : t("pic_identity")}
            </h3>

            {tipePenerima === "organisasi" && (
               <InputField 
                 label={t("pic_name_label")} value={form.pic} onChange={(e: any) => handleChange("pic", e.target.value)} 
                 icon={<User size={18} />} placeholder={t("pic_name_placeholder")} 
                 disabled={!isEditing}
               />
            )}
            
            <InputField 
              label={t("nik_label")} value={form.nik} onChange={(e: any) => handleChange("nik", e.target.value)} 
              icon={<CreditCard size={18} />} placeholder={t("nik_placeholder")} 
              disabled={!isEditing}
              error={errors.nik} 
            />

            {/* FOTO KTP */}
            <div className="flex flex-col gap-1 w-full mt-2">
              <label className={`text-sm font-bold ml-1 transition-colors ${!isEditing ? "text-gray-500" : "text-gray-700"}`}>
                {t("upload_ktp_image")}
              </label>
              <label className={`relative flex flex-col items-center justify-center w-full h-40 bg-gray-50 border-2 border-dashed rounded-2xl transition-all overflow-hidden ${!isEditing ? "border-transparent cursor-not-allowed opacity-70" : "border-purple-200 cursor-pointer hover:bg-purple-50 hover:border-purple-400 group"}`}>
                {previewKtp ? (
                  <>
                    <img 
                      src={previewKtp} 
                      alt="Preview KTP" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-semibold text-sm bg-black/50 px-4 py-2 rounded-full">{t("change_ktp")}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="bg-purple-100 p-3 rounded-full mb-3 text-purple-600">
                      <ImageIcon size={24} />
                    </div>
                    <p className={`text-sm font-semibold ${!isEditing ? "text-gray-400" : "text-gray-500"}`}>
                      {!isEditing ? t("no_ktp_uploaded") : t("click_upload_ktp")}
                    </p>
                  </div>
                )}
                {isEditing && (
                  <input type="file" accept="image/*" className="hidden" onChange={handleKtpChange} />
                )}
              </label>
            </div>

            {tipePenerima === "perorangan" && (
              <>
                <div className="flex flex-col gap-1.5 w-full mt-4">
                  <label className={`text-sm font-bold ml-1 transition-colors ${!isEditing ? "text-gray-500" : "text-gray-700"}`}>
                    {t("gender_label")}
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
                    <option value="Laki-laki">{t("male")}</option>
                    <option value="Perempuan">{t("female")}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <InputField label={t("birth_place_label")} value={form.tempat_lahir} onChange={(e: any) => handleChange("tempat_lahir", e.target.value)} icon={<MapPin size={18} />} placeholder={t("birth_place_placeholder")} disabled={!isEditing} />
                  <InputField label={t("birth_date_label")} type="date" value={form.tanggal_lahir} onChange={(e: any) => handleChange("tanggal_lahir", e.target.value)} icon={<Calendar size={18} />} placeholder="" disabled={!isEditing} />
                </div>

                <div className="mt-4">
                  <InputField 
                    label={t("job_label")} value={form.pekerjaan} onChange={(e: any) => handleChange("pekerjaan", e.target.value)} 
                    icon={<Briefcase size={18} />} placeholder={t("job_placeholder")} 
                    disabled={!isEditing}
                  />
                </div>
              </>
            )}

            {tipePenerima === "organisasi" && (
              <>
                <div className="h-px bg-gray-200 my-6"></div>
                <h3 className={`font-bold mb-2 transition-colors ${isEditing ? "text-purple-800" : "text-gray-500"}`}>{t("org_legality")}</h3>
                
                <InputField 
                  label={t("reg_number_label")} value={form.registration_number} onChange={(e: any) => handleChange("registration_number", e.target.value)} 
                  icon={<FileText size={18} />} placeholder="REG-123..." 
                  disabled={!isEditing}
                  error={errors.registration_number} 
                />

                <InputField 
                  label={t("npwp_org_label")} value={form.npwp} onChange={(e: any) => handleChange("npwp", e.target.value)} 
                  icon={<CreditCard size={18} />} placeholder="01.234.567.8-910.000" 
                  disabled={!isEditing}
                  error={errors.npwp} 
                />
              </>
            )}
          </div>

          {/* CHECKBOX SYARAT & KETENTUAN */}
          {isEditing && isNewUser && (
            <div className="mt-8 flex items-start gap-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
              <input 
                type="checkbox" 
                id="tnc" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
                className="mt-1 w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
              />
              <label htmlFor="tnc" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                {t("tnc_checkbox_1")} <button type="button" onClick={(e) => { e.preventDefault(); setShowTnC(true); }} className="text-purple-600 font-bold hover:underline">{t("tnc_title")}</button>{t("tnc_checkbox_2")}
              </label>
            </div>
          )}

          {/* AREA TOMBOL */}
          {isNewUser ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="relative w-full mt-6 flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><Save size={20} /> <span className="text-lg">{t("finish_registration")}</span></>
              )}
            </button>
          ) : isEditing ? (
            <div className="flex gap-3 mt-10">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="w-1/3 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                <X size={20} className="mr-1" /> {t("cancel")}
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-2/3 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] transition-all duration-300 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><Save size={20} /> {t("save_data")}</>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full mt-10 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200 py-4 px-6 rounded-2xl font-bold transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <Edit3 size={20} /> {t("edit_my_profile")}
            </button>
          )}

        </div>
      </main>
    </div>
  );
}

function InputField({ label, value, onChange, icon, placeholder, type = "text", disabled, error }: any) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className={`text-sm font-bold ml-1 transition-colors ${disabled ? "text-gray-500" : error ? "text-red-500" : "text-gray-700"}`}>
        {label}
      </label>
      <div className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 border-2 ${
        disabled 
          ? "bg-gray-50/50 border-transparent" 
          : error 
            ? "bg-red-50 border-red-200 focus-within:bg-white focus-within:border-red-400"
            : "bg-gray-50 border-gray-100 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] group"
      }`}>
        {icon && (
          <div className={`mr-3 transition-colors duration-300 ${disabled ? "text-gray-300" : error ? "text-red-400" : "text-gray-400 group-focus-within:text-purple-600"}`}>
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
      {error && !disabled && (
        <p className="text-[10px] text-red-500 font-bold ml-2 mt-0.5 animate-in slide-in-from-top-1">
          * {error}
        </p>
      )}
    </div>
  );
}

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