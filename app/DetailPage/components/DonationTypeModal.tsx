"use client";

import { X, ChevronRight, BookOpen, Gift } from "lucide-react";

type DonationTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  allowedTypes?: string[];
};

export default function DonationTypeModal({
  isOpen,
  onClose,
  onSelect,
}: DonationTypeModalProps) {
  if (!isOpen) return null;

  const donationTypes = [
    {
      name: "Wakaf",
      icon: BookOpen,
      desc: "Pahala jariyah yang manfaatnya abadi",
      color: "text-[#7C3996]",
      bg: "bg-[#7C3996]/10",
      borderHover: "group-hover:border-[#7C3996]/30",
      bgHover: "group-hover:bg-[#7C3996]/[0.03]",
      shadowHover: "hover:shadow-[0_4px_20px_-10px_rgba(124,57,150,0.3)]",
    },
    {
      name: "Donasi",
      icon: Gift,
      desc: "Dukungan langsung untuk program ini",
      color: "text-[#D99A1C]", // Warna emas disesuaikan agar kontras terbaca
      bg: "bg-[#E8B94A]/15",
      borderHover: "group-hover:border-[#E8B94A]/50",
      bgHover: "group-hover:bg-[#E8B94A]/[0.05]",
      shadowHover: "hover:shadow-[0_4px_20px_-10px_rgba(232,185,74,0.4)]",
    },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl shadow-2xl flex flex-col transform transition-transform duration-300 p-6 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        {/* Mobile Handle (Pill) */}
        <div className="mx-auto w-12 h-1.5 bg-gray-200 rounded-full mb-5 sm:hidden" />

        {/* Header Modal */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">
            Niat Penyaluran
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Pilih niat donasi Anda agar penyaluran dana dapat dilakukan dengan
          tepat sasaran sesuai akad.
        </p>

        {/* List Jenis Donasi */}
        <div className="flex flex-col gap-3.5 max-h-[60vh] overflow-y-auto no-scrollbar pb-4 sm:pb-2">
          {donationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.name}
                onClick={() => onSelect(type.name)}
                className={`group flex items-center justify-between w-full p-4 border-2 border-gray-100/80 rounded-2xl transition-all duration-300 text-left active:scale-[0.98] ${type.borderHover} ${type.bgHover} ${type.shadowHover}`}
              >
                <div className="flex items-center gap-4">
                  {/* Ikon Kiri */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${type.bg} ${type.color} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon size={24} strokeWidth={2.5} />
                  </div>

                  {/* Teks */}
                  <div className="flex flex-col">
                    <span className="font-extrabold text-gray-800 group-hover:text-gray-900 text-base tracking-wide transition-colors">
                      {type.name}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5 font-medium leading-relaxed">
                      {type.desc}
                    </span>
                  </div>
                </div>

                {/* Chevron Kanan */}
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-gray-600 transition-all duration-300 shrink-0 border border-gray-100 group-hover:border-gray-200 group-hover:shadow-sm group-hover:translate-x-1">
                  <ChevronRight size={18} strokeWidth={2.5} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
