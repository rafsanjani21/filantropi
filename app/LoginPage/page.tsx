"use client";

import "@/lib/i18n"; // 🔥 Pastikan i18n menyala lebih dulu
import { ArrowRight, ArrowLeft, UserCircle, Users, Globe } from "lucide-react"; // Tambahkan icon Globe
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next"; // 🔥 Import hook terjemahan

export default function LoginPage() {
  const router = useRouter();

  // Panggil fungsi translator (t) dan objek i18n
  const { t, i18n } = useTranslation();

  const handleSelectRole = (role: string) => {
    // Simpan pilihan ke browser secara sementara
    sessionStorage.setItem("selected_role", role);
    // Arahkan ke halaman tombol Google
    router.push("/LoginPage/Masuk");
  };

  // FUNGSI GANTI BAHASA
  const toggleLanguage = () => {
    const newLang = i18n.language === "id" ? "en" : "id";

    // 1. Ubah bahasa di layar saat ini
    i18n.changeLanguage(newLang);

    // 2. 🔥 INI YANG PALING PENTING: Simpan ke memori browser!
    // Jika baris ini tidak ada, maka I18nProvider tidak punya data untuk dibaca saat di-refresh
    localStorage.setItem("app_lang", newLang);
  };

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] shadow-2xl pb-32 overflow-hidden">
      {/* Signature: motif kawung tipis, konsisten dengan seluruh app */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
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

      {/* TOMBOL KEMBALI DI POJOK KIRI ATAS */}
      <button
        onClick={() => router.push("/HomePage")}
        className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all cursor-pointer z-50 border border-white/30"
      >
        <ArrowLeft size={18} />
      </button>

      {/* TOMBOL GANTI BAHASA DI POJOK KANAN ATAS */}
      <button 
        onClick={toggleLanguage}
        className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-white transition-all cursor-pointer z-50 border border-white/30"
      >
        <Globe size={16} />
        <span className="font-bold text-xs">{i18n.language === "id" ? "ID" : "EN"}</span>
      </button>

      <div className="w-full max-w-md flex flex-col mt-20 mx-auto px-6">
        <h1 className="text-3xl text-white font-bold mb-8 text-center drop-shadow-md">
          {t("choose_role")} {/* Teks dinamis */}
        </h1>

        {/* LOGO DENGAN MODIFIKASI EFEK */}
        <div className="relative flex justify-center items-center mb-12 mx-auto w-full group">
          {/* Efek Cahaya (Glow) Berdenyut di Belakang */}
          <div className="absolute w-36 h-36 bg-white rounded-full blur-xl animate-pulse"></div>
          
          {/* Gambar Logo Utama */}
          <img
            src="/logo.png"
            alt="Logo Filantropi"
            className="relative z-10 w-48 h-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.3)] group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300"
          />
        </div>

        {/* Tombol Penerima Manfaat */}
        <button
          onClick={() => handleSelectRole("penerima_manfaat")}
          className="relative z-10 group flex items-center w-full justify-between bg-white border-2 border-purple-500 p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50 hover:border-purple-600 active:bg-purple-100 active:scale-95 touch-manipulation mb-4 cursor-pointer select-none shadow-lg"
        >
          <div className="flex items-center gap-4 pointer-events-none">
            <div className="bg-purple-100 p-2.5 rounded-xl transition-colors group-hover:bg-purple-200">
              <UserCircle className="w-7 h-7 text-purple-600" />
            </div>
            <span className="font-bold text-lg text-purple-700">
              {t("beneficiary")} {/* Teks dinamis */}
            </span>
          </div>
          <ArrowRight className="w-6 h-6 text-purple-400 pointer-events-none group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Tombol Pengguna Umum */}
        <button
          onClick={() => handleSelectRole("user")}
          className="relative z-10 group flex items-center w-full justify-between bg-white border-2 border-purple-500 p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50 hover:border-purple-600 active:bg-purple-100 active:scale-95 touch-manipulation cursor-pointer select-none shadow-lg"
        >
          <div className="flex items-center gap-4 pointer-events-none">
            <div className="bg-purple-100 p-2.5 rounded-xl transition-colors group-hover:bg-purple-200">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <span className="font-bold text-lg text-purple-700">
              {t("general_user")} {/* Teks dinamis */}
            </span>
          </div>
          <ArrowRight className="w-6 h-6 text-purple-400 pointer-events-none group-hover:translate-x-1 transition-transform" />
        </button>
        
      </div>
    </div>
  );
}