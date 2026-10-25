/**
 * components/campaign/CampaignBanner.tsx
 *
 * Fungsi   : Menampilkan banner program berupa slider gambar horizontal (scroll-snap) dengan indikator titik aktif.
 * Ekspor   : default CampaignBanner
 * Dipakai  : app/(main)/wakaf/[slug]/page.tsx, app/(main)/programs/[slug]/page.tsx
 * Catatan  : Gambar tanpa URL di-prefix NEXT_PUBLIC_IMAGE_BASE_URL; fallback "/bencana.webp"; gambar pertama priority.
 */
import { useState } from "react";
import Image from "next/image";
import { safeImageUrl } from "@/lib/safeUrl";

export default function CampaignBanner({ images }: { images?: string | string[] | null }) {
  const [activeImage, setActiveImage] = useState(0);
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const campaignImages = (Array.isArray(images) ? images : images ? [images] : [])
    .filter((img): img is string => typeof img === "string" && img.trim() !== "")
    .map((img) =>
      safeImageUrl(
        img.startsWith("http")
          ? img
          : `${IMAGE_BASE_URL}/${img.replace(/^\/+/, "")}`,
        "/bencana.webp",
      ),
    );

  if (campaignImages.length === 0) campaignImages.push("/bencana.webp");

  return (
    <div className="relative w-full h-72 bg-[#2A1B33]">
      <div
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
        onScroll={(e) => setActiveImage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {campaignImages.map((img: string, i: number) => (
          <div key={i} className="relative w-full h-full shrink-0 snap-center min-w-full">
            <Image
              src={img}
              alt={`Banner program ${i + 1}`}
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2A1B33]/60 to-transparent pointer-events-none" />
      {campaignImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {campaignImages.map((_: string, i: number) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-5 bg-[#E8B94A]" : "w-1.5 bg-white/50"}`} />
          ))}
        </div>
      )}
    </div>
  );
}