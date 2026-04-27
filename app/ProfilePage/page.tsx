"use client";

import Link from "next/link";
import Navbar from "@/app/components/ui/profile/navbar"; 
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  User,
  History,
  FileText,
  LogOut,
  ChevronRight,
  Copy,
  CheckCircle2,
  Building2,
  ShieldCheck,
  MapPin,
  Mail,
  LayoutDashboard // <-- TAMBAHAN: Ikon untuk menu Program Saya
} from "lucide-react";

export default function ProfilePagePenerima() {
  const { handleLogout, loading, getProfile } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // --- SISTEM PENGECEKAN CERDAS (FALLBACK) ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let data;
        try {
          // 1. Coba ambil data sebagai Pengguna Umum
          data = await getProfile(); 
        } catch (err: any) {
          // 2. Jika gagal, tembak ke API Penerima Manfaat
          data = await getProfile("beneficiary");
        }
        
        setUser(data);
      } catch (err) {
        console.error("Gagal mengambil data profil sama sekali:", err);
      }
    };
    
    fetchProfileData();
  }, []);

  const BASE_URL = "http://192.168.52.29:8080";

  const userPhoto = user?.photo_profile
    ? `${BASE_URL}/${user.photo_profile}?t=${Date.now()}`
    : "/profile.png";

  // Fitur copy (Tetap menyalin alamat wallet full)
  const handleCopyWallet = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fitur penyingkat teks wallet untuk UI
  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#E5AFE7] shadow-2xl">
      <Navbar />

      {/* Toast Notification */}
      {copied && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full shadow-2xl text-sm font-medium flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <CheckCircle2 size={18} className="text-green-400" />
          Wallet berhasil disalin!
        </div>
      )}

      <main className="flex-1 flex flex-col items-center pt-10 px-6">
        
        {/* Profile Header Section */}
        <div className="relative mb-6">
          <div className="absolute -inset-1 bg-white/30 rounded-full blur-md"></div>
          <div className="relative p-1 bg-white rounded-full shadow-lg">
            <img
              src={userPhoto}
              alt="Profile"
              referrerPolicy="no-referrer"
              className="w-32 h-32 rounded-full object-cover border-4 border-white"
              onError={(e) => (e.currentTarget.src = "/profile.png")}
            />
            {/* Badge Tipe Akun (Hanya muncul jika Penerima Manfaat) */}
            {user?.role === "beneficiary" || user?.role === "penerima_manfaat" ? (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-purple-100 flex items-center gap-1.5 whitespace-nowrap">
                {user?.beneficiary_type === "organization" ? (
                  <Building2 size={12} className="text-blue-600" />
                ) : (
                  <User size={12} className="text-purple-600" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                  {user?.beneficiary_type === "organization" ? "Organisasi" : "Individu"}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="text-center mb-10 flex flex-col items-center w-full">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            {user?.name || user?.full_name || "Nama Pengguna"}
            {user?.beneficiary_type === "organization" && user?.registration_number && (
              <ShieldCheck size={20} className="text-blue-300" />
            )}
          </h1>
          
          {/* --- LOGIKA PERUBAHAN TAMPILAN EMAIL / ALAMAT --- */}
          <div className="flex items-center gap-2 mt-1 text-purple-100 opacity-90 text-sm">
            {user?.role === "beneficiary" || user?.role === "penerima_manfaat" ? (
              <>
                <MapPin size={14} />
                <span className="truncate max-w-[250px]">{user?.alamat || "Alamat belum diatur"}</span>
              </>
            ) : (
              <>
                <Mail size={14} />
                <span className="truncate max-w-[250px]">{user?.email || "Email belum tersedia"}</span>
              </>
            )}
          </div>

          {/* Wallet */}
          {user?.wallet_address ? (
            <button
              onClick={handleCopyWallet}
              className="group mt-5 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer active:scale-95 w-fit max-w-sm"
              title="Klik untuk menyalin"
            >
              <p className="text-purple-50 text-sm font-mono tracking-wide">
                {formatWalletAddress(user.wallet_address)}
              </p>
              {copied ? <CheckCircle2 size={16} className="text-green-300" /> : <Copy size={16} className="text-purple-200 group-hover:text-white" />}
            </button>
          ) : (
            <p className="text-purple-200/50 text-xs mt-5 italic">Belum ada wallet</p>
          )}
        </div>

        {/* Menu Utama */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-xl p-4 space-y-2 mb-8 border border-white/20">
          
          <Link 
            href={
              !user 
                ? "#" 
                : user.role === "beneficiary" || user.role === "penerima_manfaat" 
                ? "/ProfilePage/PagePenerima" 
                : "/ProfilePage/UserPage"
            } 
            className="group"
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                alert("Data profil belum siap atau terjadi error di server. Silakan muat ulang halaman.");
              }
            }}
          >
            <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <User size={22} />
                </div>
                <div>
                  <span className="font-bold text-gray-700 block text-sm">Detail Profil</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase">
                    {!user ? "Memuat data..." : user.role === "beneficiary" || user.role === "penerima_manfaat" ? "Data Penerima & Legalitas" : "Pengaturan Akun Umum"}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* --- MENU BARU: PROGRAM SAYA (HANYA MUNCUL UNTUK PENERIMA MANFAAT) --- */}
          {(user?.role === "beneficiary" || user?.role === "penerima_manfaat") && (
            <Link href="/ProgramPage" className="group">
              <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-emerald-50">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <LayoutDashboard size={22} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-700 block text-sm">Program Saya</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">
                      Pantau & Kelola Penggalangan
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          )}

          <Link href="/HistoryPage" className="group">
            <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-blue-50">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <History size={22} />
                </div>
                <span className="font-bold text-gray-700 text-sm">Riwayat Donasi</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <button className="group w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-orange-50 text-left cursor-pointer">
            <div className="flex items-center gap-4 ">
              <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <FileText size={22} />
              </div>
              <span className="font-bold text-gray-700 text-sm">Pusat Bantuan</span>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
          </button>

          <div className="h-px bg-gray-100 mx-4 my-2"></div>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="group w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-4 ">
              <div className="bg-red-100 p-2.5 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <LogOut size={22} />
              </div>
              <span className="font-bold text-red-600 text-sm">
                {loading ? "Keluar..." : "Keluar Akun"}
              </span>
            </div>
            {loading && <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
          </button>
        </div>

        <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-10">
          Kemas Foundation
        </p>
      </main>
    </div>
  );
}