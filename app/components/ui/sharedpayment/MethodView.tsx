import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import toast from "react-hot-toast";

type MethodViewProps = { 
  amount: number | ""; 
  selectedMethod: any; 
  transactionType: "donasi" | "wakaf";
  onSelectMethod: (method: any) => void; 
  onBack: () => void; 
};

export default function MethodView({ amount, selectedMethod, transactionType, onSelectMethod, onBack }: MethodViewProps) {
  // KONFIGURASI TEMA
  const uiConfig = {
    donasi: {
      textMain: "text-[#7C3996]",
      bgLight: "bg-[#7C3996]/10",
      borderMain: "border-[#7C3996]",
      borderHover: "hover:border-[#7C3996]/30",
      shadowLight: "shadow-[#7C3996]/10",
      fillIcon: "fill-[#7C3996]/20"
    },
    wakaf: {
      textMain: "text-emerald-600",
      bgLight: "bg-emerald-50",
      borderMain: "border-emerald-600",
      borderHover: "hover:border-emerald-200",
      shadowLight: "shadow-emerald-600/10",
      fillIcon: "fill-emerald-600/20"
    }
  };

  const theme = uiConfig[transactionType];

  const paymentCategories = [
    {
      title: "Pembayaran Instan",
      methods: [
        { id: "QRIS", name: "QRIS Pay", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" },
        { id: "ASTRAPAY", name: "AstraPay", logo: "/logo/astrapay.png" },
      ]
    },
    {
      title: "Virtual Account",
      methods: [
        { id: "BNI", name: "BNI Virtual", logo: "/logo/bni.png" },
        { id: "BRI", name: "BRI Virtual", logo: "https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_BRI.png" },
        { id: "BSI", name: "BSI Virtual", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg" },
        { id: "BSS", name: "BSS Virtual", logo: "/logo/bss.png" },
        { id: "CIMB", name: "CIMB Niaga", logo: "https://upload.wikimedia.org/wikipedia/commons/3/38/CIMB_Niaga_logo.svg" },
        { id: "MANDIRI", name: "Mandiri Virtual", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg" },
        { id: "PERMATA", name: "Permata Virtual", logo: "/logo/permata.png" },
      ]
    },
    {
      title: "Gerai Retail & Paylater",
      methods: [
        { id: "INDOMARET", name: "Indomaret", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Indomaret.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" },
        { id: "AKULAKU", name: "Akulaku Paylater", logo: "/logo/akulaku.png" },
      ]
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col relative animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-white/80 backdrop-blur-md px-5 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-slate-100">
        <button onClick={onBack} className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-slate-800 text-[15px] tracking-wide">Pilih Pembayaran</h1>
      </div>

      <div className="p-5 overflow-y-auto pb-10">
        {paymentCategories.map((category, idx) => {
          const isVAMethods = category.title !== "Pembayaran Instan";

          return (
            <div key={idx} className="mb-8">
              <div className="flex items-center justify-between mb-3 pl-2">
                <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{category.title}</h2>
                {isVAMethods && <span className="text-[10px] font-bold text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full">Min. Rp 10.000</span>}
              </div>

              <div className="flex flex-col gap-3">
                {category.methods.map((m) => {
                  const isSelected = selectedMethod?.id === m.id;
                  const isLocked = isVAMethods && Number(amount) < 10000;

                  return (
                    <button 
                      key={m.id} 
                      onClick={() => {
                        if (isLocked) {
                          toast.error(`Nominal kurang dari Rp 10.000. Metode ${m.name} tidak dapat digunakan.`);
                        } else {
                          onSelectMethod(m);
                        }
                      }} 
                      className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 border-2 ${
                        isLocked 
                          ? "bg-slate-100 border-transparent opacity-60 cursor-not-allowed" 
                          : isSelected 
                            ? `${theme.bgLight} ${theme.borderMain} shadow-md${theme.shadowLight}` 
                            : `bg-white border-transparent shadow-sm ${theme.borderHover}`
                      }`}
                    >
                      <div className="w-14 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center p-1.5 mr-4 shrink-0">
                        <img 
                          src={m.logo} 
                          alt={m.name} 
                          className={`w-full h-full object-contain ${isLocked ? "grayscale opacity-50" : ""}`} 
                          onError={(e) => { 
                            e.currentTarget.style.display = 'none'; 
                            e.currentTarget.parentElement!.innerHTML = `<span class="text-[10px] font-black text-slate-400">${m.id}</span>`; 
                          }}
                        />
                      </div>
                      
                      <span className={`flex-1 text-left text-[14px] font-bold ${isLocked ? "text-slate-400" : isSelected ? theme.textMain : "text-slate-700"}`}>
                        {m.name}
                      </span>
                      
                      {isLocked && <Lock size={18} className="text-slate-400" />}
                      {!isLocked && isSelected && <CheckCircle2 size={22} className={`${theme.textMain} ${theme.fillIcon}`}/>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}