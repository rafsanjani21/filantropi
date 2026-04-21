"use client";

import Link from "next/link";
import Navbar from "@/app/components/ui/profile/navbar";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  User,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronRight,
  Copy,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const { handleLogout, loading, getProfile } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false); // State untuk melacak status copy

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  const BASE_URL = "http://192.168.52.29:8080";

  const userPhoto = user?.photo_profile
    ? `${BASE_URL}/${user.photo_profile}?t=${Date.now()}`
    : "/profile.png";

  // Fungsi untuk menyalin wallet
  const handleCopyWallet = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
      setCopied(true);

      // Kembalikan status icon setelah 2 detik
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <div className="relative min-h-screen w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#E5AFE7] shadow-2xl">
      <Navbar />

      {/* Floating Toast Notification (Muncul saat dicopy) */}
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
              alt="Profile Picture"
              referrerPolicy="no-referrer"
              className="w-32 h-32 rounded-full object-cover border-4 border-white"
              onError={(e) => {
                e.currentTarget.src = "/profile.png";
              }}
            />
          </div>
        </div>

        <div className="text-center mb-10 flex flex-col items-center">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {user?.full_name || "Nama Pengguna"}
          </h1>
          <p className="text-purple-100 text-sm opacity-90">
            {user?.email || "user@example.com"}
          </p>

          {/* Wallet Address Clickable Badge */}
          {user?.wallet_address ? (
            <button
              onClick={handleCopyWallet}
              className="group mt-3 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer active:scale-95 w-full max-w-lg"
              title="Klik untuk menyalin"
            >
              <p className="text-purple-50 text-xs sm:text-sm font-mono tracking-wide break-all text-left">
                {user.wallet_address}
              </p>
              {copied ? (
                <CheckCircle2 size={16} className="text-green-300 shrink-0" />
              ) : (
                <Copy
                  size={16}
                  className="text-purple-200 group-hover:text-white transition-colors shrink-0"
                />
              )}
            </button>
          ) : (
            <p className="text-purple-200/50 text-xs mt-3 italic">
              Belum ada wallet
            </p>
          )}
        </div>

        {/* Menu Card */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-4xl shadow-xl p-4 space-y-2 mb-6">
          <Link href="/ProfilePage/UserPage" className="group">
            <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <User size={22} />
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-purple-700">
                  Profil Saya
                </span>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all"
              />
            </div>
          </Link>

          <button className="group w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50 text-left cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShieldCheck size={22} />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-blue-700">
                Privacy Policy
              </span>
            </div>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:translate-x-1 transition-all"
            />
          </button>

          <button className="group w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50 text-left cursor-pointer">
            <div className="flex items-center gap-4 ">
              <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <FileText size={22} />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-orange-700">
                Terms of Service
              </span>
            </div>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:translate-x-1 transition-all"
            />
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
              <span className="font-bold text-red-600 group-hover:text-red-700">
                {loading ? "Keluar..." : "Keluar Akun"}
              </span>
            </div>
            {loading && (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
