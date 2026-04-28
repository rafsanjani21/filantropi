"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth"; 
import { ethers } from "ethers"; // <-- IMPORT ETHERS UNTUK VALIDASI WALLET
import { 
  ArrowLeft, ImageIcon, Type, Tag, Calendar, FileText, Send, CheckCircle2, AlertCircle, BookOpen, Wallet 
} from "lucide-react";

export default function GalangPage() {
  const router = useRouter();
  
  // Panggil createCampaign dan status loading dari useAuth Anda
  const { createCampaign, loading } = useAuth(); 

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // State form disesuaikan persis dengan parameter Database
  const [form, setForm] = useState({
    title: "",
    category_id: "1", 
    target_amount: "",
    end_date: "",     
    description: "",
    story: "",        
    wallet_address: "", // <-- TAMBAHKAN STATE WALLET DI SINI
  });

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

  // --- LOGIKA SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      showToast("Mohon unggah Gambar Banner Kampanye!", "error");
      return;
    }

    // --- VALIDASI WALLET MENGGUNAKAN ETHERS.JS ---
    if (!ethers.isAddress(form.wallet_address.trim())) {
      showToast("Alamat Wallet tidak valid! Pastikan formatnya 0x...", "error");
      return;
    }

    try {
      // Susun FormData
      const formData = new FormData();
      formData.append("category_id", form.category_id);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("story", form.story);
      formData.append("target_amount", form.target_amount);
      formData.append("end_date", form.end_date); 
      formData.append("wallet_address", form.wallet_address.trim()); // <-- KIRIM WALLET KE BACKEND
      formData.append("image_banner", selectedFile);

      // Lempar ke useAuth (Token & Fetch diurus otomatis)
      await createCampaign(formData);
      
      showToast("Program Galang Dana berhasil ditayangkan! 🎉, Tunggu Verifikasi Admin!", "success");
      
      // Arahkan ke halaman daftar program setelah berhasil
      setTimeout(() => {
        router.push("/ProgramPage"); 
      }, 2000);

    } catch (error: any) {
      console.error("Error submit campaign:", error);
      showToast(error.message || "Gagal membuat program. Cek koneksi Anda.", "error");
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#E5AFE7] shadow-2xl relative overflow-x-hidden">
      
      {/* Toast Notification Modern */}
      {toast && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 duration-300 border w-[90%] max-w-sm ${
          toast.type === "success" ? "bg-green-600/90 border-green-400 text-white" : "bg-red-600/90 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={24} className="shrink-0" /> : <AlertCircle size={24} className="shrink-0" />}
          <span className="font-bold text-sm tracking-wide leading-snug">{toast.message}</span>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="w-full px-6 pt-8 pb-4 flex items-center justify-between z-10">
        <Link 
          href="/" 
          className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg text-white font-bold tracking-wide drop-shadow-md">
          Buat Program
        </h1>
        <div className="w-10 h-10" /> 
      </nav>

      {/* HEADER TEXT */}
      <div className="px-8 mt-2 mb-6">
        <h2 className="text-2xl font-extrabold text-white leading-tight">
          Mulai Kebaikan <br/> Hari Ini
        </h2>
        <p className="text-purple-100 text-sm mt-2 opacity-90">
          Lengkapi detail di bawah ini agar donatur mengerti tujuan penggalangan dana Anda.
        </p>
      </div>

      {/* FORM CONTAINER */}
      <div className="flex-1 w-full bg-white/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. UPLOAD BANNER */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Gambar Banner Kampanye *</label>
            <label className="relative flex flex-col items-center justify-center w-full h-48 bg-gray-50 border-2 border-dashed border-purple-200 rounded-2xl cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all overflow-hidden group">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-semibold text-sm bg-black/50 px-4 py-2 rounded-full">Ganti Foto</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="bg-purple-100 p-3 rounded-full mb-3 text-purple-600">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm text-gray-500 font-semibold">Klik untuk unggah foto</p>
                  <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG (Rekomendasi 16:9)</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>

          {/* 2. INPUT JUDUL */}
          <InputField 
            label="Judul Kampanye *" 
            value={form.title} onChange={(e: any) => handleChange("title", e.target.value)} 
            icon={<Type size={18} />} placeholder="Contoh: Bantu Korban Gempa..." 
            required 
          />

          {/* 3. INPUT WALLET ADDRESS (BARU) */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">Wallet Penerima Donasi (Polygon) *</label>
            <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
                <Wallet size={18} />
              </div>
              <input
                type="text"
                value={form.wallet_address}
                onChange={(e) => handleChange("wallet_address", e.target.value)}
                placeholder="0x..."
                required
                className="ml-3 w-full bg-transparent outline-none text-gray-800 font-mono text-sm placeholder:text-gray-300 placeholder:font-sans"
              />
            </div>
            <p className="text-[10px] text-orange-600 font-medium ml-1">
              * Pastikan alamat ini benar. Donasi (Token FCC) akan dikirim langsung ke sini.
            </p>
          </div>

          {/* 4. PILIH KATEGORI */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">Kategori *</label>
            <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
                <Tag size={18} />
              </div>
              <select 
                value={form.category_id} 
                onChange={(e) => handleChange("category_id", e.target.value)} 
                className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium cursor-pointer"
              >
                <option value="1">Pendidikan</option>
                <option value="2">Kesehatan</option>
                <option value="3">Bencana Alam</option>
                <option value="4">Pembangunan Masjid</option>
              </select>
            </div>
          </div>

          {/* 5. TARGET & BATAS WAKTU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-bold text-gray-700 ml-1">Target Dana *</label>
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
              label="Batas Waktu *" type="date"
              value={form.end_date} onChange={(e: any) => handleChange("end_date", e.target.value)} 
              icon={<Calendar size={18} />} placeholder="" 
              required 
            />
          </div>

          {/* 6. TEXTAREA DESKRIPSI SINGKAT */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">Deskripsi Singkat *</label>
            <div className="group flex items-start bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300 mt-1">
                <FileText size={18} />
              </div>
              <textarea 
                value={form.description} onChange={(e) => handleChange("description", e.target.value)} 
                placeholder="Tuliskan rangkuman singkat kampanye ini..." 
                rows={3} className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal resize-none leading-relaxed" 
                required 
              />
            </div>
          </div>

          {/* 7. TEXTAREA STORY (CERITA LENGKAP) */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">Cerita Detail Kampanye *</label>
            <div className="group flex items-start bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300 mt-1">
                <BookOpen size={18} />
              </div>
              <textarea 
                value={form.story} onChange={(e) => handleChange("story", e.target.value)} 
                placeholder="Ceritakan latar belakang, kondisi saat ini, dan rincian penggunaan dana secara lengkap..." 
                rows={8} className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal resize-none leading-relaxed" 
                required 
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full mt-4 flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(124,57,150,0.7)] hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /> 
                <span className="text-lg">Tayangkan Program</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

// Komponen Input Lokal (Agar file mandiri dan rapi)
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