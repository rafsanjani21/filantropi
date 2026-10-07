"use client";

import { ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function PartnerWakaf() {
  const partners = [
    {
      id: 1,
      name: "Gerakan Wakaf Indonesia",
      // Ganti URL logo ini dengan file asli Anda nantinya
      logo: "gwi.png",
      url: "https://gerakanwakaf.id/tentang-kami/",
      description: "Mitra resmi pengelolaan wakaf",
    },
  ];

  return (
    <div className="w-full py-6 mt-2">
      {/* Header Bagian */}
      <div className="px-6 mb-4">
        
        <h2 className="text-lg font-bold text-white leading-tight">
          Mitra Wakaf Resmi
        </h2>
      </div>

      {/* Daftar Logo Partner (Mode List Vertikal) */}
      <div className="flex flex-col gap-3 px-6 w-full">
        {partners.map((partner) => {
          const CardContent = (
            <div
              className={`bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 p-4 group transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_8px_20px_-4px_rgba(16,185,129,0.15)] ${
                partner.url ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {/* Logo Partner */}
              <div className="w-[70px] h-[45px] shrink-0 flex items-center justify-center transition-all duration-300">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              {/* Teks & Info */}
              <div className="flex flex-col flex-1">
                <h3 className="text-sm font-bold text-[#2A1B33] group-hover:text-emerald-600 transition-colors">
                  {partner.name}
                </h3>
                {partner.description && (
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {partner.description}
                  </p>
                )}
              </div>

              {/* Ikon Panah/Link */}
              {partner.url && (
                <div className="text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0">
                  <ExternalLink size={18} />
                </div>
              )}
            </div>
          );

          return partner.url ? (
            <Link
              key={partner.id}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              {CardContent}
            </Link>
          ) : (
            <div key={partner.id} className="w-full">
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}