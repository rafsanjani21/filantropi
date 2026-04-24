"use client";

import { useEffect, useRef, useState } from "react";

const items = [1, 2, 3, 4];

export default function Carousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 🔥 AUTO SCROLL (PAKAI scrollIntoView BIAR AKURAT)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!scrollRef.current || isDown || isHover) return;

      const nextIndex = (active + 1) % items.length;

      const container = scrollRef.current;
      const target = container.children[nextIndex] as HTMLElement;

      container.scrollTo({
        left: target.offsetLeft - container.offsetLeft,
        behavior: "smooth",
      });

      setActive(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [active, isDown, isHover]);

  //  UPDATE INDEX SAAT SCROLL MANUAL
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const children = Array.from(container.children);

    let closestIndex = 0;
    let closestDistance = Infinity;

    children.forEach((child, i) => {
      const el = child as HTMLElement;
      const box = el.getBoundingClientRect();
      const center = box.left + box.width / 2;

      const screenCenter = window.innerWidth / 2;

      const distance = Math.abs(center - screenCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    setActive(closestIndex);
  };

  // DRAG MOUSE
  const handleMouseDown = (e: any) => {
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current!.offsetLeft);
    setScrollLeft(scrollRef.current!.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    setIsHover(false);
  };

  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e: any) => {
    if (!isDown) return;
    e.preventDefault();

    const x = e.pageX - scrollRef.current!.offsetLeft;
    const walk = (x - startX) * 1.5;

    scrollRef.current!.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="mt-4">
      {/* CAROUSEL */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHover(true)}
        className="
          flex gap-4 overflow-x-auto scroll-smooth
          snap-x snap-mandatory
          px-[10%]
          cursor-grab active:cursor-grabbing
          no-scrollbar
        "
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="
              w-[80%] h-44
              bg-white rounded-xl
              shrink-0 snap-center
              shadow-md
              flex items-center justify-center text-xl font-bold
            "
          >
            Card {item}
          </div>
        ))}
      </div>

      {/* 🔥 DOT INDICATOR */}
      <div className="flex justify-center mt-3 gap-2">
        {items.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition ${
              active === i ? "bg-purple-600 scale-125" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
