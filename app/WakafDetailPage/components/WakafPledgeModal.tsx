"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";

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
      return toast("Silakan centang persetujuan ikrar terlebih dahulu.", {
        icon: '📝',
        style: {
          background: '#FFFBEB', 
          color: '#92400E', 
          border: '1px solid #FDE68A', 
          borderRadius: '16px',
          fontSize: '13px',
          fontWeight: '600',
          padding: '12px 16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
      });
    }
    onSubmit(wakafName);
    setWakafName("");
    setWakafAgree(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Aksen Hijau di Atas */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-800"></div>

        <div className="p-6 flex flex-col">
          {/* Header Bismillah & Judul */}
          <div className="flex flex-col items-center text-center mb-6">
            {/* Kaligrafi Bismillah */}
            <div className="mb-3 text-emerald-800 select-none opacity-90">
               <span className="text-3xl font-arabic leading-relaxed" style={{ fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif" }}>
                 بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
               </span>
            </div>
            
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest border-b-2 border-emerald-100 pb-2 inline-block">
              Ikrar Wakaf
            </h2>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed px-2">
              Niatkan harta ini sebagai sedekah jariyah yang pahalanya terus mengalir abadi.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Kotak Pernyataan Ikrar */}
            <div className="relative bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-inner">
              <div className="absolute -top-3 left-5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm border border-emerald-200">
                Pernyataan
              </div>
              
              <div className="flex items-start gap-3 mt-2">
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input 
                    type="checkbox" 
                    id="wakafAgree" 
                    checked={wakafAgree}
                    onChange={(e) => setWakafAgree(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-emerald-300 rounded text-emerald-600 bg-white checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-pointer shadow-sm" 
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <label 
                  htmlFor="wakafAgree" 
                  className="text-sm text-emerald-950 leading-relaxed cursor-pointer select-none font-medium italic"
                >
                  "Saya berikrar menyerahkan sebagian harta ini sebagai wakaf. Semoga Allah SWT menerima dan menjadikannya pahala jariyah."
                </label>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="w-1/3 py-3 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 active:scale-95 transition-all text-sm"
              >
                Batal
              </button>
              
              <button 
                onClick={handleSubmit} 
                className="w-2/3 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-sm shadow-[0_8px_16px_-6px_rgba(5,150,105,0.5)] flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={18} className={wakafAgree ? "opacity-100" : "opacity-50"} />
                Setuju & Lanjut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}