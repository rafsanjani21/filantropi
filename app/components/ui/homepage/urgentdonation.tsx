// components/ui/homepage/urgent-donation.tsx
import UrgentCard from "./urgentcard";

const donations = [
  {
    image: "/bencana.png",
    foundation: "Kemas Foundation",
    title: "Donasi Untuk Sumatera",
    collected: "685 fcc",
    target: "1000 fcc",
    progress: 68,
  },
  {
    image: "/bencana.png",
    foundation: "Peduli Negeri",
    title: "Bantu Korban Bencana",
    collected: "120 fcc",
    target: "300 fcc",
    progress: 40,
  },
  {
    image: "/bencana.png",
    foundation: "Peduli Negeri",
    title: "Bantu Korban Bencana",
    collected: "685 fcc",
    target: "10000 fcc",
    progress: 40,
  },
];

export default function UrgentDonation() {
  return (
    <div className="bg-white mt-6 w-full">
      <h2 className="text-xl font-bold mb-6 ml-6">
        Penggalangan Dana Mendesak
      </h2>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 w-full">
        {donations.map((donation, index) => (
          <UrgentCard
            key={index}
            image={donation.image}
            foundation={donation.foundation}
            title={donation.title}
            collected={donation.collected}
            target={donation.target}
            progress={donation.progress}
          />
        ))}
      </div>
    </div>
  );
}