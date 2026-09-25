import { ArrowLeft, User, Users } from "lucide-react";

type NameSelectionViewProps = {
  wakafFor: "self" | "other";
  setWakafFor: (v: "self" | "other") => void;
  representativeName: string;
  setRepresentativeName: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function NameSelectionView({ wakafFor, setWakafFor, representativeName, setRepresentativeName, onNext, onBack }: NameSelectionViewProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col relative animate-in slide-in-from-right-4 duration-300">
      
      {/* HEADER MODERN (Glassmorphism) */}
      <div className="bg-white/80 backdrop-blur-md px-5 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-slate-100">
        <button onClick={onBack} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-slate-800 text-[15px] tracking-wide">Penyaluran Wakaf</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto pb-32">
        <div className="mb-8">
          <h2 className="text-xl font-black text-slate-800 mb-2">Niat Wakaf</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Pilih atas nama siapa pahala wakaf ini akan ditujukan.
          </p>
        </div>

        {/* OPSI GRID MODERN */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => setWakafFor("self")} 
            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 ${
              wakafFor === "self" 
                ? "border-emerald-500 bg-emerald-50/50 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.2)]" 
                : "border-slate-100 bg-white hover:border-emerald-200 hover:shadow-sm"
            }`}
          >
            <div className={`p-3 rounded-2xl mb-4 transition-colors ${wakafFor === "self" ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400"}`}>
              <User size={28} />
            </div>
            <span className={`font-bold text-[13px] ${wakafFor === "self" ? "text-emerald-700" : "text-slate-600"}`}>Diri Sendiri</span>
          </button>

          <button 
            onClick={() => setWakafFor("other")} 
            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 ${
              wakafFor === "other" 
                ? "border-emerald-500 bg-emerald-50/50 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.2)]" 
                : "border-slate-100 bg-white hover:border-emerald-200 hover:shadow-sm"
            }`}
          >
            <div className={`p-3 rounded-2xl mb-4 transition-colors ${wakafFor === "other" ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400"}`}>
              <Users size={28} />
            </div>
            <span className={`font-bold text-[13px] ${wakafFor === "other" ? "text-emerald-700" : "text-slate-600"}`}>Orang Lain</span>
          </button>
        </div>

        {/* INPUT NAMA ORANG LAIN (Muncul Lembut) */}
        {wakafFor === "other" && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <label className="text-[12px] font-bold text-slate-500 mb-2 block uppercase tracking-wider">Nama Lengkap (Almarhum/Keluarga)</label>
              <input 
                type="text" 
                value={representativeName} 
                onChange={(e) => setRepresentativeName(e.target.value)} 
                placeholder="Tulis nama lengkap..." 
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-[14px] font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-slate-400" 
              />
            </div>
          </div>
        )}
      </div>

      {/* FLOATING BOTTOM BUTTON */}
      <div className="fixed bottom-0 w-full max-w-md bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent p-6 pt-10 z-10 pointer-events-none">
        <button 
          onClick={onNext} 
          className="w-full bg-emerald-600 text-white font-bold text-[15px] py-4 rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/40 active:scale-[0.98] transition-all pointer-events-auto"
        >
          Lanjut ke Ikrar
        </button>
      </div>
    </div>
  );
}