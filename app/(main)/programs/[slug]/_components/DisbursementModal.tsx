"use client";

import { Banknote } from "lucide-react";

type DisbursementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  currentPhase: number;
};

export default function DisbursementModal({ isOpen, onClose, onSubmit, isSubmitting, currentPhase }: DisbursementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl flex flex-col items-center p-6 text-center shadow-2xl animate-in zoom-in-95">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-5 border-4 border-green-100 shadow-inner">
          <Banknote size={36} />
        </div>
        <h2 className="text-xl font-black text-gray-800 mb-2">Pencairan Tahap {currentPhase}</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Anda akan mengajukan pencairan dana. Permintaan ini akan diteruskan ke Admin untuk disetujui sebelum dikirim ke rekening Anda.
        </p>
        <div className="flex w-full gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="w-1/2 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50">Batal</button>
          <button onClick={onSubmit} disabled={isSubmitting} className="w-1/2 flex justify-center items-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-2xl hover:bg-green-600 active:scale-95 transition-all shadow-[0_10px_20px_-10px_rgba(34,197,94,0.5)] disabled:opacity-50">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Ajukan"}
          </button>
        </div>
      </div>
    </div>
  );
}