import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

type NominalViewProps = {
  campaign?: any;
  amount: number | "";
  setAmount: (val: number | "") => void;
  transactionType: "donasi" | "wakaf";
  onNext: () => void;
  onBack: () => void;
};

export default function NominalView({ campaign, amount, setAmount, transactionType, onNext, onBack }: NominalViewProps) {
  const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 200000, 500000];
  
  const uiConfig = {
    donasi: {
      title: "Donasi",
      textMain: "text-[#7C3996]",
      bgMain: "bg-[#7C3996]",
      bgLight: "bg-[#7C3996]/10",
      borderMain: "border-[#7C3996]",
      btnHover: "hover:bg-[#6b2e88]"
    },
    wakaf: {
      title: "Wakaf",
      textMain: "text-emerald-600",
      bgMain: "bg-emerald-600",
      bgLight: "bg-emerald-50",
      borderMain: "border-emerald-600",
      btnHover: "hover:bg-emerald-700"
    }
  };

  const theme = uiConfig[transactionType];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setAmount(val ? Number(val) : "");
  };

  const handleNext = () => {
    if (!amount || amount < 1000) {
      toast.error(`Minimal ${theme.title.toLowerCase()} Rp 1.000`);
      return;
    }
    onNext();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col relative animate-in fade-in duration-300">
      
      <div className="px-5 py-4 flex items-center gap-4 border-b border-slate-100 sticky top-0 bg-white z-20">
        <button onClick={onBack} className="p-2 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-slate-800 text-[15px] tracking-wide">Pilih Nominal</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-32">
        {campaign && (
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Penyaluran {theme.title}</p>
            <h2 className="text-[15px] font-black text-slate-800 leading-snug line-clamp-2">
              {campaign.title || campaign.name}
            </h2>
          </div>
        )}

        <div className="mb-8 relative">
          <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Nominal {theme.title}
          </label>
          <div className="relative flex items-center">
            <span className={`absolute left-0 text-3xl font-black ${amount ? "text-slate-800" : "text-slate-300"} transition-colors`}>
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amount ? new Intl.NumberFormat("id-ID").format(Number(amount)) : ""}
              onChange={handleInputChange}
              placeholder="0"
              className={`w-full pl-12 pr-4 py-2 text-4xl font-black bg-transparent border-b-2 border-slate-200 outline-none focus:${theme.borderMain} text-slate-800 placeholder-slate-200 transition-colors rounded-none`}
            />
          </div>
        </div>

        <div>
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-4">Pilihan Cepat</p>
          <div className="grid grid-cols-2 gap-3">
            {PRESET_AMOUNTS.map((preset) => {
              const isSelected = amount === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-3.5 px-2 rounded-2xl text-[14px] font-bold border-2 transition-all active:scale-95 ${
                    isSelected 
                      ? `${theme.bgLight} ${theme.borderMain}${theme.textMain}` 
                      : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 shadow-sm"
                  }`}
                >
                  Rp {new Intl.NumberFormat("id-ID").format(preset)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-white p-5 border-t border-slate-100 z-30">
        <button 
          onClick={handleNext}
          className={`w-full ${theme.bgMain} text-white font-bold text-[15px] py-4 rounded-full shadow-lg ${theme.btnHover} active:scale-95 transition-all`}
        >
          Lanjut Pembayaran
        </button>
      </div>

    </div>
  );
}