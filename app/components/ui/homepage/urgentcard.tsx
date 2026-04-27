import Link from "next/link";
import { Clock } from "lucide-react";

type UrgentCardProps = {
  id: string | number;
  image: string;
  foundation: string;
  title: string;
  collected: string;
  target: string;
  progress: number;
  daysLeft: number;
  category: string; // <--- Tambahkan ini
};

export default function UrgentCard({
  id,
  image,
  foundation,
  title,
  collected,
  target,
  progress,
  daysLeft,
  category, // <--- Terima ini
}: UrgentCardProps) {
  
  return (
    <Link 
      href={`/DetailPage?id=${id}`} 
      className="min-w-[85%] sm:min-w-[280px] shrink-0 block snap-center transition-transform active:scale-95"
    >
      <div className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all flex flex-col">
        
        <div className="relative w-full h-40">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm animate-pulse">
            URGENT
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          {/* Header Kartu: Yayasan dan Kategori */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-medium">
              <span className="truncate max-w-[100px]">{foundation}</span>
              <div className="w-3 h-3 rounded-full bg-sky-500 flex items-center justify-center text-white text-[7px]">✓</div>
            </div>
            {/* BADGE KATEGORI */}
            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 uppercase">
              {category}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 leading-snug">
            {title}
          </h3>

          <div className="mt-auto pt-5 border-t border-gray-50">
            {/* Progress Info tetap sama... */}
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-medium mb-0.5 uppercase tracking-wider">Terkumpul</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-purple-700">{collected}</span>
                  <span className="text-[10px] text-gray-400 font-normal">dari {target}</span>
                </div>
              </div>
              <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{progress}%</span>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="text-[10px] font-bold text-gray-400">Target Tercapai?</span>
              <div className="flex items-center gap-1 bg-red-50 border border-red-100 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3 text-red-500" />
                <span className="text-[10px] font-bold text-red-600">Sisa {daysLeft} Hari</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}