"use client";

import { Clock, CheckCircle2 } from "lucide-react";

type WakafSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function WakafSuccessModal({ isOpen, onClose }: WakafSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Latar belakang gelap */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Kotak Modal */}
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Clock size={48} className="animate-pulse" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Sedang Diproses</h3>
        <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
          Terima kasih, sistem kami sedang memverifikasi transfer wakaf Anda. Silakan tunggu beberapa saat dan refresh halaman secara berkala.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg flex justify-center items-center gap-2"
        >
          <CheckCircle2 size={24} /> Oke
        </button>
      </div>
    </div>
  );
}