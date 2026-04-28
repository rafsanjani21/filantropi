"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function NavbarDetail() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  // Deteksi scroll untuk mengubah background navbar
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
    // 'fixed' membuatnya menempel di layar. 
    // 'left-1/2 -translate-x-1/2 max-w-lg' memastikan ukurannya tidak melebihi layout aplikasi.
    <nav className={`fixed max-w-lg w-full top-0 left-1/2 -translate-x-1/2 w-full z-50 px-6 pt-8 pb-4 flex items-center justify-between transition-all duration-300 ${
      isScrolled 
        ? "bg-[#7C3996] shadow-md pointer-events-auto" 
        : "bg-transparent pointer-events-none"
    }`}>
      
      {/* Tombol Back */}
      <button 
        onClick={() => router.back()} 
        className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition-all active:scale-95 pointer-events-auto cursor-pointer ${
          isScrolled 
            ? "bg-white/20 hover:bg-white/30" // Gaya saat navbar ungu
            : "bg-black/20 backdrop-blur-md hover:bg-black/40" // Gaya saat transparan
        }`}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Judul */}
      <h1 className={`text-lg text-white font-bold tracking-wide pointer-events-auto transition-all duration-300 ${
        isScrolled ? "drop-shadow-none" : "drop-shadow-md"
      }`}>
        Detail Kampanye
      </h1>

      {/* Elemen kosong untuk penyeimbang Flexbox */}
      <div className="w-10 h-10" />
      
    </nav>
  );
}