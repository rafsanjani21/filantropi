"use client";

import "@/lib/i18n"; // 🔥 Proteksi i18n
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; // 🔥 Import Hook

export default function NavbarDetail() {
  const router = useRouter();
  const { t } = useTranslation(); // 🔥 Panggil fungsi t
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed max-w-lg w-full top-0 left-1/2 -translate-x-1/2 z-50 px-6 pt-8 pb-4 flex items-center justify-between transition-all duration-300 ${
      isScrolled 
        ? "bg-[#7C3996] shadow-md pointer-events-auto" 
        : "bg-transparent pointer-events-none"
    }`}>
      
      <button 
        onClick={() => router.back()} 
        className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition-all active:scale-95 pointer-events-auto cursor-pointer ${
          isScrolled 
            ? "bg-white/20 hover:bg-white/30" 
            : "bg-black/20 backdrop-blur-md hover:bg-black/40" 
        }`}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <h1 className={`text-lg text-white font-bold tracking-wide pointer-events-auto transition-all duration-300 ${
        isScrolled ? "drop-shadow-none" : "drop-shadow-md"
      }`}>
        {t("campaign_detail")}
      </h1>

      <div className="w-10 h-10" />
      
    </nav>
  );
}