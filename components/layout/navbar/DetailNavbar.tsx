"use client";

import "@/lib/i18n";

import { useRouter } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function NavbarDetail() {
  const router = useRouter();
  const { t } = useTranslation();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          url: window.location.href,
        });
      } catch {}
    }
  };

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 pointer-events-none">

      <nav
        className={`mx-4 mt-4 rounded-2xl transition-all duration-500
        ${
          isScrolled
            ? "bg-white/80 backdrop-blur-2xl border border-white/30 shadow-xl"
            : "bg-transparent"
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between">

          {/* BACK */}
          <button
            onClick={() => router.back()}
            className={`pointer-events-auto
            w-11
            h-11
            rounded-full
            flex
            items-center
            justify-center
            transition-all
            duration-300
            active:scale-90
            ${
              isScrolled
                ? "bg-white text-gray-800 shadow-lg"
                : "bg-black/30 backdrop-blur-md text-white border border-white/20"
            }`}
          >
            <ArrowLeft size={20} />
          </button>

          {/* TITLE */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500
            ${
              isScrolled
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-3"
            }`}
          >
            <h2 className="font-bold text-gray-800 text-base">
              {t("campaign_detail", "Detail Kampanye")}
            </h2>
          </div>

        </div>
      </nav>

    </div>
  );
}