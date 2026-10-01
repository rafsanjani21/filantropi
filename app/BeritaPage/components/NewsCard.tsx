import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";

type NewsCardProps = {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl: string;
  slug: string;
};

export default function NewsCard({ title, excerpt, date, category, imageUrl, slug }: NewsCardProps) {
  return (
    <Link 
      href={`/BeritaPage/${slug}`} 
      className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-[0_8px_25px_-6px_rgba(124,57,150,0.15)]"
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-100"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#7C3996] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
          {category}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-2">
          <Calendar size={12} />
          <span>{date}</span>
        </div>

        <h3 className="text-[15px] font-bold text-slate-800 leading-snug mb-2 group-hover:text-[#7C3996] transition-colors line-clamp-2">
          {title}
        </h3>

        <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-4">
          {excerpt}
        </p>

        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between text-[#7C3996]">
          <span className="text-[11px] font-bold">Baca selengkapnya</span>
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}