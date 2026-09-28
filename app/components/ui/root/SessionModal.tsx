"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export default function SessionModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Mendengarkan sinyal "sessionExpired" dari api.ts
    const handleSessionExpired = () => {
      setIsOpen(true);
      document.body.style.overflow = "hidden"; // Kunci scroll
    };

    window.addEventListener("sessionExpired", handleSessionExpired);

    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
    };
  }, []);

  if (!isOpen) return null;

  const handleRelogin = () => {
    document.body.style.overflow = "auto";
    window.location.href = "/LoginPage/Masuk"; // Gunakan window.location agar benar-benar me-refresh state aplikasi
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"></div>

      {/* Modal Card */}
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 text-center shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
        <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 shadow-sm border border-red-100">
          <AlertCircle size={32} strokeWidth={2.5} />
        </div>
        
        <h3 className="text-[18px] font-black text-red-600 mb-2 tracking-tight">Sesi Telah Berakhir</h3>
        <p className="text-[13px] text-slate-500 font-medium mb-7 leading-relaxed">
          Demi keamanan akun Anda, sesi login telah habis. Silakan masuk kembali untuk melanjutkan aktivitas.
        </p>
        
        <button 
          onClick={handleRelogin}
          className="w-full bg-gradient-to-r from-[#7C3996] to-[#5B2A73] text-white font-bold text-[14px] py-3.5 rounded-2xl hover:bg-[#6b2e88] active:scale-95 transition-all shadow-lg shadow-slate-200"
        >
          Masuk Kembali
        </button>
      </div>
    </div>
  );
}