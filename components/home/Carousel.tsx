/**
 * components/home/Carousel.tsx
 *
 * Fungsi   : Carousel banner beranda dengan autoplay 5 detik dan navigasi titik; berhenti saat hover/interaksi/tab tidak aktif.
 * Ekspor   : default Carousel
 * Dipakai  : app/(main)/page.tsx
 * Catatan  : "use client"; resume 8 detik (2 detik setelah pointer leave), menghormati prefers-reduced-motion.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const AUTOPLAY_INTERVAL = 5000;
const RESUME_DELAY = 8000;

const items = [
  {
    id: 1,
    src: "/gwi.webp",
    title: "Gerakan Wakaf Indonesia",
    subtitle: "Wakaf untuk pahala abadi",
  },
  {
    id: 2,
    src: "/bandang.jpg",
    title: "Bantu Korban Bencana",
    subtitle: "Ringankan beban mereka hari ini",
  },
  {
    id: 3,
    src: "/donate.jpg",
    title: "Sedekah Setiap Hari",
    subtitle: "Mulai dari Rp1.000",
  },
  {
    id: 4,
    src: "/banjir.jpg",
    title: "Peduli Sesama",
    subtitle: "Kebaikanmu memberi harapan",
  },
  {
    id: 5,
    src: "/donasi.jpg",
    title: "Filantropi Indonesia",
    subtitle: "Mari berbagi bersama",
  },
  
];

export default function Carousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const child = container.children[index] as HTMLElement | undefined;
    if (!child) return;

    // Kalkulasi agar elemen selalu berada tepat di tengah layar
    const scrollLeft = child.offsetLeft - container.clientWidth / 2 + child.clientWidth / 2;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    container.scrollTo({
      left: scrollLeft,
      behavior: reduceMotion ? "auto" : "smooth",
    });
    activeRef.current = index;
    setActive(index);
  }, []);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Hentikan autoplay saat tab tidak aktif
  useEffect(() => {
    const handleVisibility = () => setIsTabVisible(!document.hidden);
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Autoplay: maju tiap 5 detik, berhenti saat user berinteraksi
  useEffect(() => {
    if (isPaused || !isTabVisible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      scrollToIndex((activeRef.current + 1) % items.length);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, isTabVisible, scrollToIndex]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const scheduleResume = (delay = RESUME_DELAY) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setIsPaused(false), delay);
  };

  const pauseForInteraction = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setIsPaused(true);
  };

  const handlePointerDown = () => pauseForInteraction();
  const handlePointerUp = () => scheduleResume();
  const handlePointerEnter = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") setIsPaused(true);
  };
  const handlePointerLeave = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") scheduleResume(2000);
  };

  //  Membaca elemen mana yang paling dekat dengan titik tengah layar
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    
    // Titik tengah layar carousel saat ini
    const scrollCenter = container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let minDiff = Infinity;

    // Cek setiap item, mana yang titik tengahnya paling dekat dengan tengah layar
    Array.from(container.children).forEach((child, index) => {
      // Abaikan elemen spacer transparan di akhir jika ada
      if ((child as HTMLElement).getAttribute("aria-hidden") === "true") return;

      const childCenter = (child as HTMLElement).offsetLeft + child.clientWidth / 2;
      const diff = Math.abs(scrollCenter - childCenter);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    if (active !== closestIndex) {
      setActive(closestIndex);
    }
  };

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-[7%] pb-2 scroll-smooth"
      >
        {items.map((item, index) => {
          const isActive = active === index;

          return (
            <div
              key={item.id}
              onClick={() => scrollToIndex(index)}
              className={`relative shrink-0 w-[86%] h-[215px] mx-2 rounded-[32px] overflow-hidden snap-center transition-all duration-500 cursor-pointer ${
                isActive ? "scale-100 opacity-100" : "scale-90 opacity-60"
              }`}
            >
              <Image
                src={item.src}
                alt={item.title}
                fill 
                sizes="(max-width: 512px) 86vw, 440px" 
                quality={index === 0 ? 75 : 60}
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "low"}
                className={`object-cover transition-transform duration-700 ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute left-6 bottom-6 text-white">
                <h2 className="text-2xl font-extrabold mt-3 leading-tight max-w-[220px]">
                  {item.title}
                </h2>
                <p className="text-sm text-white/90 mt-2">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
        
        <div className="shrink-0 w-[4vw]" aria-hidden="true" />
      </div>

      <div
        className="flex justify-center gap-2 mt-5"
        onFocusCapture={pauseForInteraction}
        onBlurCapture={() => scheduleResume(2000)}
      >
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            onPointerDown={pauseForInteraction}
            onPointerUp={() => scheduleResume()}
            aria-label={`Ke slide ${index + 1}`}
            aria-current={active === index}
            className="group flex items-center justify-center w-6 h-6"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                active === index
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/60 group-hover:bg-white/90"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}