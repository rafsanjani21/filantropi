"use client";

import { X, ArrowDownRight, Wallet, Coins, HandHeart, BookOpen, Gift } from "lucide-react";

type DonationTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  allowedTypes?: string[];
};

export default function DonationTypeModal({ isOpen, onClose, onSelect }: DonationTypeModalProps) {
  if (!isOpen) return null;

  // Menambahkan ikon dan deskripsi untuk mempercantik UI
  const donationTypes = [
    { name: "Zakat", icon: Wallet, desc: "Kewajiban membersihkan harta", color: "text-emerald-600", bg: "bg-emerald-50", hover: "group-hover:border-emerald-300 group-hover:bg-emerald-50/50" },
    { name: "Infaq", icon: Coins, desc: "Berbagi harta untuk kebaikan", color: "text-blue-600", bg: "bg-blue-50", hover: "group-hover:border-blue-300 group-hover:bg-blue-50/50" },
    { name: "Sedekah", icon: HandHeart, desc: "Amalan ringan berpahala besar", color: "text-rose-600", bg: "bg-rose-50", hover: "group-hover:border-rose-300 group-hover:bg-rose-50/50" },
    { name: "Wakaf", icon: BookOpen, desc: "Pahala jariyah yang abadi", color: "text-purple-600", bg: "bg-purple-50", hover: "group-hover:border-purple-300 group-hover:bg-purple-50/50" },
    { name: "Donasi Umum", icon: Gift, desc: "Dukungan untuk program ini", color: "text-orange-600", bg: "bg-orange-50", hover: "group-hover:border-orange-300 group-hover:bg-orange-50/50" },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-out p-6 animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-black text-gray-800">Niat Penyaluran</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors active:scale-95">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Pilih niat donasi Anda agar penyaluran dana lebih tepat sasaran.
        </p>

        {/* List Jenis Donasi */}
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto no-scrollbar pb-2">
          {donationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.name}
                onClick={() => onSelect(type.name)}
                className={`flex items-center justify-between w-full p-4 border-2 border-gray-100 rounded-2xl transition-all text-left group active:scale-[0.98] ${type.hover}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${type.bg} ${type.color} flex items-center justify-center shrink-0`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 group-hover:text-gray-900 text-base">{type.name}</span>
                    <span className="text-[11px] text-gray-500 font-medium">{type.desc}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gray-800 transition-colors shrink-0 shadow-sm border border-gray-100">
                  <ArrowDownRight size={16} className="-rotate-90" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}