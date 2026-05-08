"use client";

import "./globals.css";
import "@/lib/i18n"; // 🔥 FIX: Memastikan mesin bahasa menyala sebelum halaman dirender
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Globe } from "lucide-react";
import { useTranslation } from "react-i18next"; // Import hook i18n

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  // Panggil translator (t) dan pengatur bahasa (i18n)
  const { t, i18n } = useTranslation(); 

  // LOGIKA PENGECEKAN LOGIN
  useEffect(() => {
    // Cek apakah ada token akses di storage (menandakan user sudah login)
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    
    if (token) {
      // Jika sudah login, langsung arahkan ke route HomePage sesungguhnya
      router.replace("/HomePage");
    } else {
      // Jika belum login, matikan loading dan biarkan halaman awalan ini tampil
      setIsChecking(false);
    }
  }, [router]);

  // FUNGSI GANTI BAHASA
  const toggleLanguage = () => {
    const newLang = i18n.language === "id" ? "en" : "id";
    
    // 1. Ubah bahasa di layar saat ini
    i18n.changeLanguage(newLang);
    
    // 2. 🔥 INI YANG PALING PENTING: Simpan ke memori browser!
    // Jika baris ini tidak ada, maka I18nProvider tidak punya data untuk dibaca saat di-refresh
    localStorage.setItem("app_lang", newLang); 
  };

  // TAMPILAN LOADING SEMENTARA
  if (isChecking) {
    return (
      <main className="flex min-h-screen w-full max-w-lg justify-center items-center mx-auto bg-linear-to-b from-[#7C3996] to-[#b359d4] shadow-2xl">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </main>
    );
  }

  // TAMPILAN HALAMAN AWALAN (ONBOARDING)
  return (
    <main className="flex flex-col min-h-screen w-full max-w-lg mx-auto bg-white shadow-2xl relative overflow-x-hidden">
      
      {/* TOMBOL GANTI BAHASA DI POJOK KANAN ATAS */}
      <button 
        onClick={toggleLanguage}
        className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-white transition-all cursor-pointer z-50 border border-white/30"
      >
        <Globe size={16} />
        <span className="font-bold text-xs">{i18n.language === "id" ? "ID" : "EN"}</span>
      </button>

      {/* Background Ornament Atas */}
      <div className="absolute top-0 left-0 w-full h-[55%] bg-linear-to-b from-[#7C3996] to-[#b359d4] rounded-b-[4rem] z-0 shadow-lg" />
      
      {/* Dekorasi Lingkaran Abstrak */}
      <div className="absolute top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl z-0" />
      <div className="absolute top-40 -left-10 w-32 h-32 bg-purple-900/20 rounded-full blur-xl z-0" />

      {/* --- KONTEN UTAMA --- */}
      <div className="relative z-10 flex flex-col flex-1 px-8 pt-16 pb-12">
        
        {/* LOGO UTAMA APLIKASI */}
        <div className="flex justify-center mb-8 mt-2">
          {/* Wadah Kaca (Glassmorphism) */}
          <div className="relative flex items-center justify-center w-40 h-40 bg-white/20 backdrop-blur-md rounded-full shadow-2xl border-2 border-white/30">
            
            {/* Efek Gelombang Bersinar */}
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-20" />
            
            {/* Logo dengan padding sangat tipis (p-1.5) agar terlihat full */}
            <img 
              src="/logo.png" 
              alt="Logo Filantropi" 
              className="w-full h-full p-1.5 object-contain relative z-10 drop-shadow-xl"
            />
            
            {/* Ikon Sparkles Pemanis */}
            <Sparkles size={32} className="absolute -top-2 -right-2 text-yellow-300 animate-pulse z-20" />
          </div>
        </div>

        {/* Judul & Subtitle yang sudah dinamis */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white mb-3 tracking-tight drop-shadow-md">
            {t("welcome_headline")}
          </h1>
          <p className="text-purple-100 font-medium text-sm px-4">
            {t("welcome_subtitle")}
          </p>
        </div>

        {/* Kartu Penjelasan Filantropi */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex-1 flex flex-col justify-center animate-in slide-in-from-bottom-10 duration-700">
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
              <Globe size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">{t("what_is_philanthropy")}</h2>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {t("philanthropy_definition")}
          </p>

          <div className="flex flex-col gap-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-purple-600 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                <strong className="text-gray-800">{t("trust_bold")} </strong> 
                {t("trust_desc")}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* --- BOTTOM ACTION BAR --- */}
      <div className="relative z-10 p-8 pt-0 bg-white">
        <button
          onClick={() => router.push("/LoginPage")}
          className="group w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <span className="text-lg">{t("start_button")}</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </main>
  );
}