"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NavbarDetail() {
  const router = useRouter();

  return (
    // 'absolute' membuat navbar melayang di atas gambar hero
    <nav className="absolute top-0 left-0 w-full z-50 px-6 pt-8 pb-4 flex items-center justify-between pointer-events-none">
      
      {/* Tombol Back: Menggunakan router.back() agar dinamis ke halaman sebelumnya */}
      <button 
        onClick={() => router.back()} 
        className="w-10 h-10 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all active:scale-95 pointer-events-auto cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Judul: Diberi drop-shadow agar tetap terbaca meski gambar di belakangnya terang */}
      <h1 className="text-lg text-white font-bold tracking-wide drop-shadow-md pointer-events-auto">
        Detail Kampanye
      </h1>

      {/* Elemen kosong (dummy) untuk menyeimbangkan Flexbox agar judul benar-benar di tengah */}
      <div className="w-10 h-10" />
      
    </nav>
  );
}