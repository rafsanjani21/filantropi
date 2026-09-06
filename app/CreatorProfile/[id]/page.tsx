"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  User, 
  Mail, 
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";

type Campaign = {
  id: string;
  campaign_code: string;
  title: string;
  slug: string;
  image_banner: string;
  target_amount: number;
  current_amount: number;
  status: string;
  is_wakaf: boolean | number | string;
};

type CreatorProfile = {
  user_id: string;
  beneficiary_type: string;
  full_name: string;
  email: string;
  is_verified: number;
  bio_description: string;
  alamat: string;
  photo_profile: string;
  campaigns: Campaign[];
};

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.id as string;

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      if (!creatorId) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
        
        const response = await fetch(`${API_BASE}/user/profile/campaign-creator/${creatorId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(result.message || "Gagal mengambil data kreator");
        }

        setCreator(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorProfile();
  }, [creatorId]);

  const resolveImageUrl = (path?: string) => {
    if (!path) return "/placeholder-image.jpg"; // Ganti dengan gambar default Anda
    if (path.startsWith("http")) return path;
    const API_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL
    let cleanPath = path.replace(/^\/+/, "");
    return `${API_BASE}/${cleanPath}?t=${Date.now()}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <User size={32} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Profil Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 mb-6">{error || "Kreator yang Anda cari tidak tersedia."}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-full text-sm">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 pb-12">
      {/* HEADER TEMA */}
      <div className="relative bg-emerald-700 px-6 pt-8 pb-20 shadow-md rounded-b-[2rem]">
        <button
          onClick={() => router.back()}
          className="hover:bg-white/20 p-2 rounded-full transition cursor-pointer text-white absolute top-6 left-4 z-10"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center w-full">
          <h1 className="text-lg font-bold tracking-tight text-white">Profil Penggalang Dana</h1>
        </div>
      </div>

      {/* PROFIL CARD */}
      <div className="px-5 -mt-14 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
              <img
                src={resolveImageUrl(creator.photo_profile)}
                alt={creator.full_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null; 
                  e.currentTarget.src = "/profile.png";
                }}
              />
            </div>
            {creator.is_verified === 1 && (
              <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Terverifikasi">
                <CheckCircle2 size={16} />
              </div>
            )}
          </div>

          <h2 className="text-xl font-black text-gray-900 mb-1">{creator.full_name}</h2>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 mb-4">
            {creator.beneficiary_type === "organization" ? <Building2 size={12} /> : <User size={12} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {creator.beneficiary_type === "organization" ? "Organisasi" : "Individu"}
            </span>
          </div>

          <div className="w-full flex flex-col gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
            {creator.email && (
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400 shrink-0" />
                <span className="truncate">{creator.email}</span>
              </div>
            )}
            {creator.alamat && (
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{creator.alamat}</span>
              </div>
            )}
          </div>

          {creator.bio_description && (
            <p className="text-sm text-gray-500 leading-relaxed italic border-t border-gray-100 pt-4 w-full">
              "{creator.bio_description}"
            </p>
          )}
        </div>
      </div>

      {/* DAFTAR KAMPANYE */}
      <div className="px-5 pt-8">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <LayoutDashboard size={18} className="text-emerald-600" />
          Kampanye oleh {creator.full_name}
        </h3>

        {creator.campaigns && creator.campaigns.length > 0 ? (
  <div className="flex flex-col gap-4">
    {creator.campaigns.map((camp) => {
      
      // 🔥 Deteksi program Wakaf berdasarkan field is_wakaf atau campaign_code
      const isWakafProgram = 
        camp.is_wakaf === true || 
        camp.is_wakaf === 1 || 
        String(camp.is_wakaf).toLowerCase() === "true" || 
        String(camp.is_wakaf) === "1" ||
        (camp.campaign_code && camp.campaign_code.toLowerCase().includes("wkf"));

      // 🔥 Tentukan URL dinamis
      const targetUrl = isWakafProgram 
        ? `/WakafDetailPage?slug=${camp.slug}` 
        : `/DetailPage?slug=${camp.slug}`;

      return (
        <Link 
          href={targetUrl}
          key={camp.id} 
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex gap-3 p-3"
        >
          <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
            <img
              src={resolveImageUrl(camp.image_banner)}
              alt={camp.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/profile.png"; 
              }}
            />
            {camp.status === "active" && (
              <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Aktif
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center flex-1 py-1 pr-2 min-w-0">
            <p className="text-[10px] text-gray-400 font-bold mb-0.5 uppercase tracking-wider">{camp.campaign_code}</p>
            <h4 className="text-sm font-bold text-gray-800 leading-tight mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
              {camp.title}
            </h4>
            <div>
              <p className="text-[10px] text-gray-500 mb-0.5">Terkumpul</p>
              <p className="text-sm font-black text-emerald-600">
                {formatCurrency(camp.current_amount)}
              </p>
            </div>
          </div>
        </Link>
      );
    })}
  </div>
) : (
  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
    <p className="text-sm font-medium text-gray-500">Belum ada kampanye yang dibuat.</p>
  </div>
)}
      </div>
    </div>
  );
}