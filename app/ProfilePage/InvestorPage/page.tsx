"use client";

import "@/lib/i18n";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/app/components/ui/user/navbar"; // Sesuaikan path navbar Anda
import { useTranslation } from "react-i18next";
import { 
  User, MapPin, Mail, Phone, CreditCard, 
  Landmark, ShieldCheck, ShieldAlert, ArrowLeft
} from "lucide-react";

export default function InvestorPage() {
  const router = useRouter();
  const { getInvestorProfile } = useAuth();
  const { t } = useTranslation();

  const [investor, setInvestor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getInvestorProfile();
        if (data) {
          setInvestor(data);
        } else {
          // Jika ternyata bukan investor, kembalikan ke profil awal
          router.replace("/ProfilePage");
        }
      } catch (err) {
        console.error("Gagal mengambil data investor", err);
        router.replace("/ProfilePage");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#3E1854] to-[#8A45A8]">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const profilePhoto = investor?.profile_image_url
    ? `${BASE_URL}/${investor.profile_image_url.replace(/^\/+/, '')}?t=${Date.now()}`
    : "/profile.png";

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] shadow-2xl pb-12 overflow-hidden">
      {/* Background Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="kawung-investor" width="56" height="56" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
              <ellipse cx="14" cy="14" rx="12" ry="8" transform="rotate(45 14 14)" />
              <ellipse cx="42" cy="14" rx="12" ry="8" transform="rotate(-45 42 14)" />
              <ellipse cx="14" cy="42" rx="12" ry="8" transform="rotate(-45 14 42)" />
              <ellipse cx="42" cy="42" rx="12" ry="8" transform="rotate(45 42 42)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kawung-investor)" />
      </svg>

      {/* Gunakan Navbar yang sudah ada, atau buat tombol back manual jika tidak ada */}
      <Navbar />

      <main className="flex-1 px-6 pt-6 flex flex-col items-center z-10">
        
        

        {/* HEADER PROFIL */}
        <div className="w-full mb-6">
          <div className="flex flex-col items-center">
            
            <div className="relative mb-4">
              <div className={`absolute -inset-1.5 rounded-full blur-md opacity-60 ${investor?.is_verified ? "bg-emerald-400" : "bg-orange-400"}`}></div>
              <img
                src={profilePhoto}
                alt="Profile"
                className="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-md bg-gray-50"
                onError={(e) => (e.currentTarget.src = "/profile.png")}
              />
            </div>

            <h1 className="text-2xl font-extrabold text-white text-center mb-2">
              {investor?.full_name || "Investor"}
            </h1>
            
            {/* STATUS VERIFIKASI */}
            {investor?.is_verified ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-200">
                <ShieldCheck size={14} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Terverifikasi</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full border border-orange-200">
                <ShieldAlert size={14} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Menunggu Verifikasi</span>
              </div>
            )}
          </div>
        </div>

        {/* INFORMASI DATA DIRI */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/40 space-y-6">
          
          <h3 className="text-purple-800 font-bold mb-4 border-b border-gray-100 pb-2">Informasi Pribadi</h3>
          
          <DataField icon={<Mail size={20} />} label="Email" value={investor?.email} />
          <DataField icon={<Phone size={20} />} label="Nomor Telepon" value={investor?.phone_number} />
          <DataField icon={<MapPin size={20} />} label="Alamat" value={investor?.address} />
          <DataField icon={<CreditCard size={20} />} label="NIK (Nomor Induk Kependudukan)" value={investor?.nik} isSecret />

          <h3 className="text-purple-800 font-bold mb-4 border-b border-gray-100 pb-2 mt-8">Informasi Rekening Bank</h3>
          
          <DataField icon={<Landmark size={20} />} label="Nama Bank" value={investor?.bank_name} />
          <DataField icon={<CreditCard size={20} />} label="Nomor Rekening" value={investor?.no_req} />
          <DataField icon={<User size={20} />} label="Nama Pemilik Rekening" value={investor?.account_bank_name} />

        </div>

      </main>
    </div>
  );
}

// Komponen Pembantu untuk Menampilkan Data (Read-Only)
function DataField({ icon, label, value, isSecret = false }: { icon: React.ReactNode, label: string, value?: string, isSecret?: boolean }) {
  
  // Format NIK jadi bintang-bintang sebagian agar lebih aman
  const displayValue = isSecret && value && value.length > 4 
    ? `${value.substring(0, 4)}********${value.substring(value.length - 4)}` 
    : value;

  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 text-purple-400 bg-purple-50 p-2.5 rounded-xl">
        {icon}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 break-words">
          {displayValue || <span className="text-gray-300 italic">Belum diisi</span>}
        </p>
      </div>
    </div>
  );
}