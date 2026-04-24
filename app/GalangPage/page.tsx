"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Type, 
  Target, 
  Tag, 
  Calendar, 
  FileText, 
  Send,
  CheckCircle2, // Icon untuk sukses
  AlertCircle   // Icon untuk error
} from "lucide-react";

export default function GalangPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- STATE UNTUK CUSTOM ALERT (TOAST) ---
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    // Otomatis hilangkan toast setelah 3 detik
    setTimeout(() => setToast(null), 3000);
  };
  // ----------------------------------------

  const [form, setForm] = useState({
    title: "",
    category: "Bencana Alam",
    target_amount: "",
    end_date: "",
    description: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Nanti di sini Anda masukkan logika fetch API POST ke Golang Anda
      // Contoh: const formData = new FormData(); formData.append('image', selectedFile); ...
      
      // Simulasi loading 2 detik untuk UI
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // GANTI ALERT DENGAN TOAST SUKSES
      showToast("Program Galang Dana berhasil dibuat! 🎉", "success");
      
      // Beri jeda sedikit sebelum pindah halaman agar user sempat baca notifikasinya
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (error) {
      console.error(error);
      // GANTI ALERT DENGAN TOAST ERROR
      showToast("Terjadi kesalahan saat membuat program.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#E5AFE7] shadow-2xl relative overflow-x-hidden">
      
      {/* --- CUSTOM ALERT (TOAST NOTIFICATION) --- */}
      {toast && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 duration-300 border ${
          toast.type === "success" 
            ? "bg-green-600/90 border-green-400 text-white" 
            : "bg-red-600/90 border-red-400 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}
      {/* ----------------------------------------- */}

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
        <div className="w-10 h-10" /> {/* Spacer untuk keseimbangan flexbox */}
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

          {/* 1. UPLOAD BANNER KAMPANYE */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Foto Utama / Banner</label>
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
                  <p className="text-xs text-gray-400 mt-1">Rekomendasi rasio 16:9 (Landscape)</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
            </label>
          </div>

          {/* 2. INPUT JUDUL */}
          <InputField 
            label="Judul Kampanye" 
            value={form.title} onChange={(e: any) => handleChange("title", e.target.value)} 
            icon={<Type size={18} />} placeholder="Contoh: Bantu Korban Gempa..." 
            required 
          />

          {/* 3. PILIH KATEGORI */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">Kategori</label>
            <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
                <Tag size={18} />
              </div>
              <select 
                value={form.category} 
                onChange={(e) => handleChange("category", e.target.value)} 
                className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium cursor-pointer"
              >
                <option value="Bencana Alam">Bencana Alam</option>
                <option value="Medis & Kesehatan">Medis & Kesehatan</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Pembangunan Fasilitas">Pembangunan Fasilitas</option>
                <option value="Sosial & Kemanusiaan">Sosial & Kemanusiaan</option>
              </select>
            </div>
          </div>

          {/* 4. TARGET & BATAS WAKTU (2 KOLOM) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-bold text-gray-700 ml-1">Target Dana</label>
              <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <div className="text-purple-600 font-bold text-sm mr-2">FCC</div>
                <input 
                  type="number" 
                  value={form.target_amount} onChange={(e) => handleChange("target_amount", e.target.value)} 
                  placeholder="1000" className="w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal" 
                  required min="1"
                />
              </div>
            </div>

            <InputField 
              label="Batas Waktu" type="date"
              value={form.end_date} onChange={(e: any) => handleChange("end_date", e.target.value)} 
              icon={<Calendar size={18} />} placeholder="" 
              required 
            />
          </div>

          {/* 5. TEXTAREA CERITA */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">Cerita & Detail Lengkap</label>
            <div className="group flex items-start bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300 mt-1">
                <FileText size={18} />
              </div>
              <textarea 
                value={form.description} onChange={(e) => handleChange("description", e.target.value)} 
                placeholder="Ceritakan latar belakang, alasan, dan rincian penggunaan dana di sini..." 
                rows={6} className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal resize-none leading-relaxed" 
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

// Komponen Input Lokal (Agar file ini mandiri dan bisa di-copy paste utuh)
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