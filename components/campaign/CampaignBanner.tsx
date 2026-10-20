import { useState } from "react";

export default function CampaignBanner({ images }: { images: string | string[] }) {
  const [activeImage, setActiveImage] = useState(0);
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const campaignImages = (Array.isArray(images) ? images : [images])
    .filter(Boolean)
    .map((img: string) => img.startsWith("http") ? img : `${IMAGE_BASE_URL}/${img.replace(/^\/+/, "")}`);
    
  if (campaignImages.length === 0) campaignImages.push("/bencana.png");

  return (
    <div className="relative w-full h-72 bg-[#2A1B33]">
      <div
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
        onScroll={(e) => setActiveImage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {campaignImages.map((img: string, i: number) => (
          <img key={i} src={img} alt="Banner" className="w-full h-full object-cover shrink-0 snap-center min-w-full" />
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