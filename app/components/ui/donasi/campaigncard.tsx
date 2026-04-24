import Link from "next/link";

type CampaignCardProps = {
  image: string;
  foundation: string;
  title: string;
  collected: string;
  target: string;
  progress: number;
};

export default function CampaignCard({
  image,
  foundation,
  title,
  collected,
  target,
  progress,
}: CampaignCardProps) {
  
  // --- TAMBAHKAN INI: Membungkus data kartu menjadi URL Query ---
  const queryParams = new URLSearchParams({
    title,
    image,
    foundation,
    collected,
    target,
    progress: progress.toString(),
    daysLeft: "30", // Angka default sementara jika belum ada di database
  }).toString();
  // --------------------------------------------------------------

  return (
    <Link 
      // --- UBAH INI: Kirim data lewat URL ---
      href={`/DetailPage?${queryParams}`} 
      className="w-full block transition-transform active:scale-95" 
    >
      <div className="w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col">
        <img src={image} alt={title} className="w-full h-44 object-cover" />

        <div className="p-5 flex flex-col">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>{foundation}</span>
            <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
          </div>

          <h3 className="mt-2 text-lg font-bold line-clamp-2 leading-snug text-gray-800">{title}</h3>

          {/* --- BAGIAN PROGRESS YANG DIPERBARUI --- */}
          <div className="mt-5">
            {/* Baris Nominal & Persentase */}
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium mb-0.5">Terkumpul</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-purple-700">{collected}</span>
                  <span className="text-[10px] text-gray-400 font-normal">dari {target}</span>
                </div>
              </div>
              
              {/* Badge Teks Persentase */}
              <span className="text-sm font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                {progress}%
              </span>
            </div>

            {/* Progress Bar dengan animasi */}
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
              <div
                className="h-full bg-purple-700 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* --- AKHIR BAGIAN PROGRESS --- */}

        </div>
      </div>
    </Link>
  );
} 