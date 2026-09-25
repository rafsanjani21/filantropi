import { ArrowLeft } from "lucide-react";

type NominalViewProps = { amount: number | ""; setAmount: (val: number | "") => void; onNext: () => void; onBack: () => void; };

export default function NominalView({ amount, setAmount, onNext, onBack }: NominalViewProps) {
  const formatRp = (num: number) => new Intl.NumberFormat("id-ID").format(num);
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setAmount(val ? Number(val) : "");
  };

  const presetNominals = [50000, 100000, 250000, 500000, 1000000, 5000000];

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col relative animate-in slide-in-from-right-4 duration-300">
      
      <div className="bg-white/80 backdrop-blur-md px-5 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-slate-100">
        <button onClick={onBack} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-slate-800 text-[15px] tracking-wide">Nominal Wakaf</h1>
      </div>

      <div className="p-6 flex-1 overflow-y-auto pb-32">
        {/* INPUT NOMINAL CUSTOM (Ditengah Besar) */}
        <div className="flex flex-col items-center justify-center pt-8 pb-10">
          <span className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Ketik Nominal</span>
          <div className="flex items-center gap-1 justify-center border-b-2 focus-within:border-emerald-500 transition-colors pb-2 min-w-[200px]">
            <span className="text-3xl font-black text-slate-400">Rp</span>
            <input 
              type="text" 
              inputMode="numeric" 
              value={amount ? formatRp(Number(amount)) : ""} 
              onChange={handleCustomAmountChange} 
              className="bg-transparent text-center font-black text-4xl outline-none text-emerald-800 placeholder-slate-200 w-full max-w-[200px]" 
              placeholder="0" 
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium bg-slate-50 px-3 py-1 rounded-full">Minimum Rp 1.000</p>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Atau Pilih Cepat</h3>
          {/* GRID NOMINAL PRESET */}
          <div className="grid grid-cols-2 gap-3">
            {presetNominals.map((val) => (
              <button 
                key={val} 
                onClick={() => setAmount(val)} 
                className={`py-4 px-2 rounded-2xl border-2 font-bold text-[14px] transition-all duration-200 ${
                  amount === val 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" 
                    : "border-slate-100 bg-white text-slate-600 hover:border-emerald-200"
                }`}
              >
                {formatRp(val)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-gradient-to-t from-white via-white to-transparent p-6 pt-12 z-10 pointer-events-none">
        <button 
          onClick={onNext} 
          disabled={!amount || Number(amount) < 1000}
          className={`w-full font-bold text-[15px] py-4 rounded-2xl transition-all pointer-events-auto ${
            !amount || Number(amount) < 1000
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98]"
          }`}
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
}