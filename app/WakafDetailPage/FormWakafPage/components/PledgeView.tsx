import { ArrowLeft, Quote } from "lucide-react";

type PledgeViewProps = {
  userName: string;
  wakafFor: string;
  representativeName: string;
  onNext: () => void;
  onBack: () => void;
};

export default function PledgeView({ userName, wakafFor, representativeName, onNext, onBack }: PledgeViewProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col relative animate-in slide-in-from-right-4 duration-300">
      
      <div className="bg-white/80 backdrop-blur-md px-5 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-slate-100">
        <button onClick={onBack} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-slate-800 text-[15px] tracking-wide">Ikrar Wakaf</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto pb-32 flex flex-col justify-center">
        {/* KARTU IKRAR ELEGAN */}
        <div className="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.1)] relative overflow-hidden">
          
          {/* Aksen Hiasan */}
          <div className="absolute top-0 right-0 p-6 opacity-10 text-emerald-600 pointer-events-none">
            <Quote size={80} />
          </div>

          <h2 className="text-xl font-black text-emerald-800 mb-8 text-center italic font-serif">
            "Bismillaahirrahmaanirrahiim"
          </h2>
          
          <div className="text-[14px] text-slate-600 leading-loose space-y-4 relative z-10">
            <p>Saya <b className="text-slate-800 border-b-2 border-emerald-200">{userName}</b>,</p>
            <p>
              Dengan ini mewakafkan sebagian harta saya untuk program kebaikan ini, 
              {wakafFor === "other" ? (
                <span> yang pahalanya ditujukan atas nama <b className="text-slate-800 border-b-2 border-emerald-200">{representativeName || "Orang Lain"}</b>.</span>
              ) : (
                <span> atas nama diri saya sendiri.</span>
              )}
            </p>
            <p className="font-medium text-emerald-900 bg-emerald-50 p-4 rounded-2xl italic mt-6 border border-emerald-100/50">
              Semoga Allah SWT menerima wakaf ini, memberkahinya, dan menjadikannya amal jariyah yang mengalirkan kebaikan tiada henti. Amin.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent p-6 pt-10 z-10 pointer-events-none">
        <button 
          onClick={onNext} 
          className="w-full bg-emerald-700 text-white font-bold text-[15px] py-4 rounded-2xl shadow-xl shadow-emerald-700/20 hover:bg-emerald-800 active:scale-[0.98] transition-all pointer-events-auto"
        >
          Ya, Saya Berikrar
        </button>
      </div>
    </div>
  );
}