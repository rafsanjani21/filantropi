"use client";

import { Newspaper, ArrowLeft } from "lucide-react";
import BottomNav from "../components/ui/root/BottomNav";
import { useRef, useState, useEffect } from "react";
import NewsCard from "./components/NewsCard";
import Link from "next/link";

export default function BeritaPage() {
  const [news, setNews] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 5);
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) observer.observe(observerTarget.current);

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [observerTarget, news.length]);

  const displayedNews = news.slice(0, visibleCount);
  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[#FBF8F3] pb-32">
      {/* Header Statis */}
      <div className="bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] text-white p-6 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.09] pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="kawung"
              width="56"
              height="56"
              patternUnits="userSpaceOnUse"
            >
              <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
                <ellipse
                  cx="14"
                  cy="14"
                  rx="12"
                  ry="8"
                  transform="rotate(45 14 14)"
                />
                <ellipse
                  cx="42"
                  cy="14"
                  rx="12"
                  ry="8"
                  transform="rotate(-45 42 14)"
                />
                <ellipse
                  cx="14"
                  cy="42"
                  rx="12"
                  ry="8"
                  transform="rotate(-45 14 42)"
                />
                <ellipse
                  cx="42"
                  cy="42"
                  rx="12"
                  ry="8"
                  transform="rotate(45 42 42)"
                />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kawung)" />
        </svg>

        <div className="relative z-10 py-2 flex items-center justify-center min-h-[40px]">
          
          <Link
            href="/"
            className="absolute left-0 w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md rounded-full hover:bg-white/20 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="flex flex-col items-center text-center px-12">
            <h1 className="text-lg font-bold tracking-tight mb-1">
              Berita Kebaikan
            </h1>
            <p className="text-white/80 text-[10px] font-medium leading-relaxed">
              Transparansi dan kabar terbaru dari setiap amanah yang Anda
              titipkan.
            </p>
          </div>
        </div>
      </div>

      {/* RENDER KONTEN ATAU EMPTY STATE */}
      {news.length > 0 ? (
        <div className="flex-1 px-5 pt-6 flex flex-col gap-5">
          {displayedNews.map((item, index) => (
            <NewsCard
              key={index}
              title={item.title}
              excerpt={item.excerpt}
              date={item.date}
              category={item.category}
              imageUrl={item.imageUrl}
              slug={item.slug}
            />
          ))}

          {/* INDIKATOR LAZY SCROLL BAWAH */}
          {visibleCount < news.length ? (
            <div
              ref={observerTarget}
              className="w-full flex items-center justify-center py-8"
            >
              <div className="w-7 h-7 border-[3px] border-t-transparent border-[#7C3996]/20 border-t-[#7C3996] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-8 opacity-60">
              <div className="w-1 h-1 bg-gray-300 rounded-full mb-2"></div>
              <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
                Semua berita telah ditampilkan
              </p>
            </div>
          )}
        </div>
      ) : (
        /* KONTEN KOSONG (EMPTY STATE) */
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center mt-20">
          <div className="w-24 h-24 rounded-full bg-[#7C3996]/10 flex items-center justify-center mb-5 text-[#7C3996]">
            <Newspaper size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-[#2A1B33] font-bold text-lg mb-2">
            Belum Ada Berita
          </h2>
          <p className="text-slate-500 text-[13px] leading-relaxed max-w-[260px]">
            Nantikan kabar baik, laporan penyaluran, dan pembaruan program dari
            para pahlawan kebaikan di sini.
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
