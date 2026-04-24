"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Share2, Wallet, CheckCircle2, Heart, Clock } from "lucide-react";
import NavbarDetail from "../components/ui/detail/navbar";
import Link from "next/link"; // Wajib di-import untuk navigasi

// Komponen utama dipisah agar bisa dibungkus Suspense (Aturan Next.js)
function DetailContent() {
  const searchParams = useSearchParams();

  // Tangkap data dari URL. Beri nilai default jika URL dibuka langsung tanpa klik kartu
  const title = searchParams.get("title") || "Donasi Kemanusiaan";
  const foundation = searchParams.get("foundation") || "Yayasan Kebaikan";
  const image = searchParams.get("image") || "/bencana.png";
  const collected = searchParams.get("collected") || "0 fcc";
  const target = searchParams.get("target") || "0 fcc";
  const progress = searchParams.get("progress") || "0";
  const daysLeft = searchParams.get("daysLeft") || "0";

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50">
      <NavbarDetail />

      {/* --- HERO IMAGE DINAMIS --- */}
      <div className="relative w-full h-72 sm:h-80 bg-gray-200">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="relative -mt-8 w-full bg-white rounded-t-[2rem] flex flex-col z-10 pb-28 shadow-[-0_-10px_40px_rgba(0,0,0,0.1)]">
        
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2" />

        {/* 1. SEKSI HEADER & PROGRESS DINAMIS */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-sm font-semibold text-purple-600">{foundation}</span>
            <CheckCircle2 className="w-4 h-4 text-sky-500" />
          </div>
          
          <h1 className="text-2xl font-extrabold text-gray-800 leading-snug mb-4">
            {title}
          </h1>
          
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Bantuan Anda sangat berarti untuk mewujudkan harapan mereka. Mari berdonasi bersama untuk perubahan yang lebih baik.
          </p>

          <div className="w-full">
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium mb-0.5">Terkumpul</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-purple-700">{collected}</span>
                  <span className="text-xs text-gray-400 font-normal">dari {target}</span>
                </div>
              </div>
              <span className="text-sm font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                {progress}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs font-semibold text-gray-500">
              <span>124 Donatur</span>
              <span className="flex items-center gap-1"><Clock size={12}/> Sisa {daysLeft} Hari</span>
            </div>
          </div>
        </div>

        {/* 2. SEKSI INFORMASI PENGGALANG DANA DINAMIS */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Informasi Penggalang Dana</h2>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl border border-purple-200">
                {/* Ambil huruf pertama yayasan untuk logo */}
                {foundation.charAt(0)}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                  {foundation} <CheckCircle2 className="w-3 h-3 text-sky-500" />
                </p>
                <p className="text-xs text-gray-500">Organisasi Terverifikasi</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SEKSI CERITA */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Cerita Penggalangan Dana</h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-3">
            <p>Bantuan dari berbagai pihak kini sangat dibutuhkan untuk membangun kembali harapan yang sempat runtuh. Setiap donasi yang Anda berikan akan disalurkan secara transparan.</p>
          </div>
        </div>
      </div>

      {/* --- FIXED BOTTOM BAR --- */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="h-6 bg-gradient-to-t from-white to-transparent" />
        <div className="bg-white/90 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <button className="flex items-center justify-center gap-2 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 w-1/3 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95">
            <Share2 className="w-5 h-5" />
            Share
          </button>
          
          {/* --- TOMBOL DONASI YANG SUDAH DINAMIS MENGIRIM DATA KE DONASIPAGE --- */}
          <Link 
            href={`/DonasiPage?title=${title}&image=${image}&foundation=${foundation}`}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white rounded-xl px-4 py-3 w-2/3 font-bold hover:bg-purple-700 transition-all active:scale-95 text-center"
          >
            <Heart className="w-5 h-5 fill-white/20" />
            Donasi Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}

// Wrapper Suspense (Wajib di Next.js App Router jika menggunakan useSearchParams)
export default function DetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    }>
      <DetailContent />
    </Suspense>
  );
}