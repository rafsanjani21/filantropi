"use client";

import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import CampaignCard from "../components/ui/donasi/campaigncard"; // Sesuaikan path jika berbeda
import { useState, useEffect } from "react";

export default function DonasiPage() {
  const [search, setSearch] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- MENGAMBIL DATA PROGRAM (DINAMIS) ---
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        // NANTINYA GANTI DENGAN FETCH API GOLANG ANDA
        // const res = await fetch("http://192.168.52.29:8080/api/campaigns");
        // const data = await res.json();
        // setCampaigns(data);

        // --- DATA DUMMY SEMENTARA AGAR UI TERLIHAT ---
        setTimeout(() => {
          setCampaigns([
            {
              id: 1,
              image: "/bencana.png",
              foundation: "Kemas Foundation",
              title: "Donasi Untuk Sumatera",
              collected: "685",
              target: "1000",
              progress: 68,
              daysLeft: 12,
            },
            {
              id: 2,
              image: "/bencana.png",
              foundation: "Peduli Negeri",
              title: "Bantu Pembangunan Masjid Desa",
              collected: "120",
              target: "300",
              progress: 40,
              daysLeft: 30,
            },
            {
              id: 3,
              image: "/bencana.png",
              foundation: "Yayasan Yatim Piatu",
              title: "Beasiswa Anak Asuh Berprestasi",
              collected: "5000",
              target: "10000",
              progress: 50,
              daysLeft: 7,
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Gagal mengambil data", err);
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // --- LOGIKA FILTER PENCARIAN ---
  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(search.toLowerCase()) ||
    campaign.foundation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-linear-to-b from-[#7C3996] to-[#E5AFE7] flex flex-col relative pb-10">
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#7C3996]/90 backdrop-blur-md px-6 py-5 flex items-center gap-4 shadow-sm">
        <Link
          href="/"
          className="p-2 -ml-2 text-white active:scale-95 transition rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-white">Program Donasi</h1>
      </div>

      {/* Kolom Pencarian */}
      <div className="px-6 py-4">
        <div className="flex bg-white items-center px-4 py-3 rounded-2xl shadow-sm border border-purple-100 focus-within:ring-2 focus-within:ring-purple-300 transition-all">
          <Search className="w-5 h-5 text-purple-400 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari yayasan atau judul program..."
            className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
          />
        </div>
      </div>

      {/* Daftar Campaign */}
      <div className="px-6 flex flex-col gap-5 mt-2">
        {loading ? (
          // Animasi Loading
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-white animate-pulse">Memuat program...</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          // List Program yang Ditemukan
          filteredCampaigns.map((campaign, index) => (
            <CampaignCard
              key={campaign.id || index}
              image={campaign.image}
              foundation={campaign.foundation}
              title={campaign.title}
              collected={`${campaign.collected} fcc`} // Tambahkan 'fcc' otomatis
              target={`${campaign.target} fcc`}       // Tambahkan 'fcc' otomatis
              progress={campaign.progress}
            />
          ))
        ) : (
          // Jika Pencarian Kosong / Tidak Ada Program
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 mt-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Search size={28} className="text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Tidak Ditemukan</h3>
            <p className="text-purple-100 text-sm px-4">Program atau yayasan yang Anda cari belum terdaftar.</p>
          </div>
        )}
      </div>
    </div>
  );
}