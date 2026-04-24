import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NavbarDetail() {
  return (
    // 'absolute' membuat navbar melayang di atas gambar hero
    <nav className="absolute top-0 left-0 w-full z-50 px-6 pt-8 pb-4 flex items-center justify-between pointer-events-none">
      
      {/* Tombol Back: Dibuat melingkar dengan efek kaca (glassmorphism) agar elegan */}
      <Link 
        href="/DonasiPage" 
        className="w-10 h-10 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all active:scale-95 pointer-events-auto"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Judul: Diberi drop-shadow agar tetap terbaca meski gambar di belakangnya terang */}
      <h1 className="text-lg text-white font-bold tracking-wide drop-shadow-md">
        Detail Kampanye
      </h1>

      {/* Elemen kosong (dummy) untuk menyeimbangkan Flexbox agar judul benar-benar di tengah */}
      <div className="w-10 h-10" />
      
    </nav>
  );
}