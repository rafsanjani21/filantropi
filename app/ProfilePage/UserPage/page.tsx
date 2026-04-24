"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/app/components/ui/user/navbar";
import { Upload, User, Wallet, Save, Camera } from "lucide-react";

export default function UserPage() {
  const router = useRouter();
  const { getProfile, updateProfile } = useAuth();

  const BASE_URL = "http://192.168.52.29:8080";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", wallet: "" });
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const id_token = typeof window !== "undefined" ? sessionStorage.getItem("id_token") : null;

  // 🔥 LOAD DATA AWAL
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();

        setForm({
          name: data.full_name || "",
          wallet: data.wallet_address || "",
        });

        if (data.photo_profile) {
          const fullUrl = data.photo_profile.startsWith("http")
            ? data.photo_profile
            : `${BASE_URL}/${data.photo_profile}`;

          setPreview(`${fullUrl}?t=${Date.now()}`);
        } else {
          setPreview(null);
        }
      } catch {
        console.error("Gagal ambil profile");
      }
    };

    fetchProfile();
  }, []);

  // 🔥 HANDLE FILE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // 🔥 SUBMIT
  // 🔥 SUBMIT
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("full_name", form.name);
      formData.append("wallet_address", form.wallet);

      if (file) {
        formData.append("photo_profile", file);
      }

      // KODE SEBELUMNYA YANG ERROR:
      // await updateProfile(formData);

      // KODE YANG BENAR:
      await updateProfile(formData, "donor"); 

      router.replace("/ProfilePage");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#E5AFE7] shadow-2xl">
      <Navbar />

      <main className="flex-1 px-8 pt-8 pb-12 flex flex-col items-center">
        
        <div className="w-full mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit Profil</h1>
          <p className="text-purple-200 text-sm mt-2">Sesuaikan data diri dan dompet digital Anda</p>
        </div>

        {/* Card Container */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/40">
          
          {/* FOTO UPLOAD SECTION */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group cursor-pointer">
              {/* Cincin Gradasi */}
              <div className="absolute -inset-1.5 bg-linear-to-tr from-purple-500 to-[#E5AFE7] rounded-full blur-sm opacity-50 group-hover:opacity-100 transition duration-300"></div>
              
              <div className="relative w-36 h-36 rounded-full p-1.5 bg-white shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={preview || "/profile.png"}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/profile.png";
                    }}
                  />
                </div>
              </div>

              {/* Tombol Kamera */}
              <label className="absolute bottom-1 right-1 bg-purple-600 hover:bg-purple-700 p-3 rounded-full text-white shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-white">
                <Camera size={18} />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* INPUT FIELDS */}
          <div className="space-y-5">
            <InputField
              label="Nama Lengkap"
              value={form.name}
              onChange={(e: any) => setForm({ ...form, name: e.target.value })}
              icon={<User size={18} />}
              placeholder="Masukkan nama Anda"
            />

            <InputField
              label="Wallet Address"
              value={form.wallet}
              onChange={(e: any) => setForm({ ...form, wallet: e.target.value })}
              icon={<Wallet size={18} />}
              placeholder="0x..."
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="group relative w-full mt-10 flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(124,57,150,0.7)] hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={20} className="transition-transform group-hover:scale-110" /> 
                <span className="text-lg">Simpan Perubahan</span>
              </>
            )}
          </button>

        </div>
      </main>
    </div>
  );
}

// Komponen Input yang Diperbagus
function InputField({ label, value, onChange, icon, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      {/* Container dengan efek focus-within */}
      <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        
        {/* Ikon yang berubah warna saat difokuskan */}
        <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
          {icon}
        </div>
        
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal"
        />
      </div>
    </div>
  );
}