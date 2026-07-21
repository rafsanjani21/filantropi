"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type WakafPledgeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wakafName: string) => void;
};

export default function WakafPledgeModal({ isOpen, onClose, onSubmit }: WakafPledgeModalProps) {
  const [wakafName, setWakafName] = useState("");
  const [wakafAgree, setWakafAgree] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!wakafAgree) {
      return toast.error("Anda harus menyetujui ikrar wakaf terlebih dahulu!");
    }
    onSubmit(wakafName);
    setWakafName("");
    setWakafAgree(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Aksen Atas */}
        <div className="h-2 w-full bg-gradient-to-r from-purple-600 to-purple-400"></div>

        <div className="p-6 flex flex-col">
          {/* Header Bismillah & Judul */}
          <div className="flex flex-col items-center text-center mb-6">
            {/* Kaligrafi Bismillah Text - Jauh lebih aman dan tajam di berbagai layar */}
            <div className="mb-4 text-purple-700 select-none">
               <span className="text-3xl font-arabic leading-relaxed" style={{ fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif" }}>
                 بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
               </span>
            </div>
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest border-b-2 border-purple-100 pb-2">
              Ikrar Wakaf
            </h2>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed px-2">
              Niatkan harta ini sebagai sedekah jariyah yang pahalanya terus mengalir abadi.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {/* Kotak Ikrar */}
            <div className="relative bg-purple-50/50 p-4 rounded-2xl border border-purple-100 mt-2">
              <div className="absolute -top-3 left-4 bg-purple-100 text-purple-700 text-[10px] font-black uppercase px-2 py-0.5 rounded">Pernyataan</div>
              <div className="flex items-start gap-3 mt-1">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    id="wakafAgree" 
                    checked={wakafAgree}
                    onChange={(e) => setWakafAgree(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-purple-200 rounded text-purple-600 bg-white checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer shadow-sm" 
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <label htmlFor="wakafAgree" className="text-xs text-gray-700 leading-relaxed cursor-pointer select-none font-medium italic">
                  "Saya berikrar menyerahkan sebagian harta ini sebagai wakaf. Semoga Allah SWT menerima dan menjadikannya pahala jariyah."
                </label>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3 mt-2">
              <button onClick={onClose} className="w-1/3 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-sm">
                Kembali
              </button>
              <button onClick={handleSubmit} className="w-2/3 py-3.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all text-sm shadow-[0_10px_20px_-10px_rgba(147,51,234,0.5)] flex justify-center items-center gap-2">
                Setuju & Lanjut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}