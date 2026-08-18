"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const items = [
  {
    id: 1,
    src: "/bandang.jpg",
    title: "Bantu Korban Bencana",
    subtitle: "Ringankan beban mereka hari ini",
  },
  {
    id: 2,
    src: "/donate.jpg",
    title: "Sedekah Setiap Hari",
    subtitle: "Mulai dari Rp1.000",
  },
  {
    id: 3,
    src: "/banjir.jpg",
    title: "Peduli Sesama",
    subtitle: "Kebaikanmu memberi harapan",
  },
  {
    id: 4,
    src: "/donasi.jpg",
    title: "Filantropi Indonesia",
    subtitle: "Mari berbagi bersama",
  },
  {
    id: 5,
    src: "/gwi.png",
    title: "Gerakan Wakaf Indonesia",
    subtitle: "Wakaf untuk pahala abadi",
  },
];

export default function Carousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);

    const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const child = container.children[index] as HTMLElement;
    
    if (!child) return;

    // Kalkulasi agar elemen selalu berada tepat di tengah layar
    const scrollLeft = child.offsetLeft - container.clientWidth / 2 + child.clientWidth / 2;

    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });
    setActive(index);
  };

  useEffect(() => {
    if (hover) return;

    const timer = setInterval(() => {
      scrollToIndex((active + 1) % items.length);
    }, 4500);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, hover]);

  // 🔥 PERBAIKAN 2: Membaca elemen mana yang paling dekat dengan titik tengah layar
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
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
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
                sizes="(max-width: 512px) 100vw, 512px" 
                priority={index === 0} 
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

      <div className="flex justify-center gap-2 mt-5">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full ${
              active === index ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}