import React, { useState } from "react";

interface NameSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  userName: string;
  wakafFor: "self" | "other";
  setWakafFor: (val: "self" | "other") => void;
  representativeName: string;
  setRepresentativeName: (val: string) => void;
}

export default function NameSelectionModal({
  isOpen,
  onClose,
  onProceed,
  userName,
  wakafFor,
  setWakafFor,
  representativeName,
  setRepresentativeName,
}: NameSelectionModalProps) {
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleProceed = () => {
    if (wakafFor === "other" && !representativeName.trim()) {
      setErrorMsg("Nama pewakif wajib diisi!");
      return;
    }
    setErrorMsg("");
    onProceed();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 sm:p-8">
          <h3 className="text-xl font-black text-slate-800 mb-2">Pilih Atas Nama</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">
            Wakaf ini akan ditunaikan atas nama siapa?
          </p>

          <div className="space-y-3 mb-6">
            {/* Pilihan Diri Sendiri */}
            <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${wakafFor === "self" ? "border-emerald-600 bg-emerald-50" : "border-slate-200 hover:border-emerald-200"}`}>
              <input 
                type="radio" 
                name="wakafFor" 
                checked={wakafFor === "self"} 
                onChange={() => {
                  setWakafFor("self");
                  setErrorMsg("");
                }} 
                className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
              />
              <div className="ml-3">
                <p className={`font-bold ${wakafFor === "self" ? "text-emerald-900" : "text-slate-700"}`}>Diri Sendiri</p>
                <p className="text-xs text-slate-500">{userName || "Nama Anda"}</p>
              </div>
            </label>

            {/* Pilihan Orang Lain */}
            <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${wakafFor === "other" ? "border-emerald-600 bg-emerald-50" : "border-slate-200 hover:border-emerald-200"}`}>
              <input 
                type="radio" 
                name="wakafFor" 
                checked={wakafFor === "other"} 
                onChange={() => setWakafFor("other")} 
                className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
              />
              <div className="ml-3">
                <p className={`font-bold ${wakafFor === "other" ? "text-emerald-900" : "text-slate-700"}`}>Wakilkan Orang Lain</p>
                <p className="text-xs text-slate-500">Orang tua, keluarga, atau kerabat</p>
              </div>
            </label>
          </div>

          {/* Input Nama Jika Pilih Orang Lain */}
          {wakafFor === "other" && (
            <div className="mb-6 animate-in slide-in-from-top-2 fade-in duration-300">
              <label className="block text-xs font-bold text-slate-700 mb-2">Nama Lengkap Pewakif *</label>
              <input 
                type="text" 
                value={representativeName}
                onChange={(e) => {
                  setRepresentativeName(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="Masukkan nama pewakif..." 
                className={`w-full px-4 py-3.5 rounded-xl border-2 focus:ring-2 outline-none transition-all font-medium text-slate-800 ${errorMsg ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-200"}`}
              />
              {errorMsg && <p className="text-xs font-bold text-red-500 mt-2 ml-1 animate-in fade-in">{errorMsg}</p>}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button 
              onClick={onClose} 
              className="w-1/3 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              onClick={handleProceed} 
              className="w-2/3 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md cursor-pointer"
            >
              Lanjut ke Ikrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}