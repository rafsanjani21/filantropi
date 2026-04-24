import Link from "next/link";
import UrgentCard from "./urgentcard";
import { ChevronRight } from "lucide-react";

const donations = [
  {
    image: "/bencana.png",
    foundation: "Kemas Foundation",
    title: "Donasi Untuk Sumatera",
    collected: "685 fcc",
    target: "1000 fcc",
    progress: 68,
    daysLeft: 3, 
  },
  {
    image: "/bencana.png",
    foundation: "Peduli Negeri",
    title: "Bantu Korban Bencana Tanah Longsor",
    collected: "120 fcc",
    target: "300 fcc",
    progress: 40,
    daysLeft: 5, 
  },
  {
    image: "/bencana.png",
    foundation: "Aksi Cepat",
    title: "Bantuan Medis Darurat Anak",
    collected: "685 fcc",
    target: "10000 fcc",
    progress: 7,
    daysLeft: 12,
  },
];

export default function UrgentDonation() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end px-6 mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Penggalangan Dana Mendesak
        </h2>
        <Link href="/DonasiPage" className="text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center transition-colors">
          Lihat Semua <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto no-scrollbar pb-8 px-6 w-full snap-x snap-mandatory">
        {donations.map((donation, index) => (
          <UrgentCard
            key={index}
            image={donation.image}
            foundation={donation.foundation}
            title={donation.title}
            collected={donation.collected}
            target={donation.target}
            progress={donation.progress}
            daysLeft={donation.daysLeft}
          />
        ))}
      </div>
    </div>
  );
}