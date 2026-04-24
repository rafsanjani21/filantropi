"use client";

import { HandCoins, Heart, Search, Lock, AlertCircle } from "lucide-react"; // Tambahkan AlertCircle
import Navbar from "../components/ui/homepage/navbar";
import Carousel from "../components/ui/homepage/carousel";
import UrgentDonation from "../components/ui/homepage/urgentdonation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const { getProfile } = useAuth();
  
  // State untuk menyimpan role pengguna
  const [role, setRole] = useState<"donor" | "beneficiary" | "guest" | null>(null);

  // --- STATE UNTUK CUSTOM ALERT (TOAST) ---
  const [toast, setToast] = useState<{ message: string; type: "warning" | "error" | "success" } | null>(null);

  const showToast = (message: string, type: "warning" | "error" | "success") => {
    setToast({ message, type });
    // Otomatis hilangkan toast setelah 4 detik (lebih lama sedikit karena teksnya panjang)
    setTimeout(() => setToast(null), 4000);
  };
  // ----------------------------------------

  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      
      if (!token) {
        setRole("guest"); 
        return;
      }

      try {
        await getProfile();
        setRole("donor");
      } catch (err) {
        try {
          await getProfile("beneficiary");
          setRole("beneficiary");
        } catch (err) {
          setRole("guest"); 
        }
      }
    };

    checkUserRole();
  }, []);

  // --- LOGIKA AKSES FITUR ---
  const isDonasiLocked = role === "beneficiary"; 
  const isGalangLocked = role === "donor";       

  const handleDonasiClick = (e: React.MouseEvent) => {
    if (isDonasiLocked) {
      e.preventDefault();
      // Mengganti alert() bawaan browser dengan Toast kustom
      showToast("Akun Penerima Manfaat tidak dapat berdonasi. Silakan pakai akun Pengguna Umum.", "warning");
    }
  };

  const handleGalangClick = (e: React.MouseEvent) => {
    if (isGalangLocked) {
      e.preventDefault();
      // Mengganti alert() bawaan browser dengan Toast kustom
      showToast("Fitur khusus Penerima Manfaat. Pengguna Umum tidak dapat menggalang dana.", "warning");
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen relative pb-10">
      
      {/* --- CUSTOM ALERT (TOAST NOTIFICATION) --- */}
      {toast && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 duration-300 border w-[90%] max-w-sm ${
          toast.type === "warning" 
            ? "bg-orange-600/95 border-orange-400 text-white" 
            : "bg-red-600/95 border-red-400 text-white"
        }`}>
          <AlertCircle size={24} className="shrink-0" />
          <span className="font-semibold text-sm leading-snug">{toast.message}</span>
        </div>
      )}
      {/* ----------------------------------------- */}

      {/* Latar Belakang Ungu Melengkung di Atas */}
      <div className="absolute top-0 left-0 w-full h-85 bg-linear-to-b from-[#7C3996] to-[#b359d4] rounded-b-[3rem] z-0 shadow-lg" />

      {/* Konten Utama */}
      <div className="relative z-10 flex flex-col w-full pt-4">
        <Navbar />

        {/* Teks Sambutan & Kolom Pencarian */}
        <div className="px-6 mt-6 mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1 drop-shadow-sm">
            Halo, Orang Baik! 👋
          </h1>
          <p className="text-purple-100 text-sm mb-6 font-medium">
            Mari wujudkan kebaikan bersama hari ini.
          </p>

          <div className="flex bg-white/20 backdrop-blur-md border border-white/30 items-center px-4 py-3.5 rounded-2xl shadow-sm focus-within:bg-white/30 transition-all">
            <Search className="w-5 h-5 text-white mr-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari program filantropi..."
              className="flex-1 outline-none text-white placeholder-purple-100 text-sm bg-transparent"
            />
          </div>
        </div>

        {/* Carousel */}
        <div className="px-6 mb-8">
          <Carousel />
        </div>

        {/* Body Putih (Wadah Menu & Donasi) */}
        <div className="bg-white rounded-t-[2.5rem] flex-1 pt-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex flex-col gap-8">
          
          {/* Menu Program Filantropi */}
          <div className="px-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Program Filantropi
            </h2>

            <div className="grid grid-cols-2 gap-4">
              
              {/* CARD MENU DONASI */}
              <Link
                href={isDonasiLocked ? "#" : "/DonasiPage"}
                onClick={handleDonasiClick}
                className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl border transition-all duration-300 ${
                  isDonasiLocked 
                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-75" 
                    : "bg-purple-50 border-purple-100 hover:bg-purple-600 hover:shadow-xl hover:shadow-purple-200 active:scale-95 cursor-pointer" 
                }`}
              >
                {isDonasiLocked && <Lock className="absolute top-3 right-3 w-4 h-4 text-gray-400" />}
                
                <div className={`p-3.5 rounded-2xl shadow-sm mb-3 transition-transform duration-300 ${isDonasiLocked ? "bg-gray-200" : "bg-white group-hover:scale-110"}`}>
                  <Heart className={`w-7 h-7 ${isDonasiLocked ? "text-gray-400" : "text-purple-600"}`} />
                </div>
                <span className={`font-bold text-sm transition-colors ${isDonasiLocked ? "text-gray-400" : "text-gray-700 group-hover:text-white"}`}>
                  Donasi
                </span>
              </Link>

              {/* CARD MENU GALANG DANA */}
              <Link
                href={isGalangLocked ? "#" : "/GalangPage"}
                onClick={handleGalangClick}
                className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl border transition-all duration-300 ${
                  isGalangLocked 
                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-75" 
                    : "bg-blue-50 border-blue-100 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 active:scale-95 cursor-pointer" 
                }`}
              >
                {isGalangLocked && <Lock className="absolute top-3 right-3 w-4 h-4 text-gray-400" />}

                <div className={`p-3.5 rounded-2xl shadow-sm mb-3 transition-transform duration-300 ${isGalangLocked ? "bg-gray-200" : "bg-white group-hover:scale-110"}`}>
                  <HandCoins className={`w-7 h-7 ${isGalangLocked ? "text-gray-400" : "text-blue-600"}`} />
                </div>
                <span className={`font-bold text-sm transition-colors ${isGalangLocked ? "text-gray-400" : "text-gray-700 group-hover:text-white"}`}>
                  Galang Dana
                </span>
              </Link>

            </div>
          </div>

          {/* List Donasi Mendesak */}
          <UrgentDonation />

        </div>
      </div>
    </div>
  );
}