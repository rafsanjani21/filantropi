import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import toast from "react-hot-toast";

type MethodViewProps = { 
  amount: number | ""; // 🔥 Terima data amount dari halaman utama
  selectedMethod: any; 
  onSelectMethod: (method: any) => void; 
  onBack: () => void; 
};

export default function MethodView({ amount, selectedMethod, onSelectMethod, onBack }: MethodViewProps) {
  const paymentCategories = [
    {
      title: "Pembayaran Instan",
      methods: [
        { id: "QRIS", name: "QRIS Pay", logo: "/logo/qris.png" },
        { id: "ASTRAPAY", name: "AstraPay", logo: "/logo/astrapay.png" },
      ]
    },
    {
      title: "Virtual Account",
      methods: [
        { id: "BNI", name: "BNI Virtual", logo: "/logo/bni.png" },
        { id: "BRI", name: "BRI Virtual", logo: "/logo/bri.png" },
        { id: "BSI", name: "BSI Virtual", logo: "/logo/bsi.png" },
        { id: "BSS", name: "BSS Virtual", logo: "/logo/bss.png" },
        { id: "CIMB", name: "CIMB Niaga", logo: "/logo/cimb.png" },
        { id: "MANDIRI", name: "Mandiri Virtual", logo: "/logo/mandiri.png" },
        { id: "PERMATA", name: "Permata Virtual", logo: "/logo/permata.png" },
      ]
    },
    {
      title: "Gerai Retail & Paylater",
      methods: [
        { id: "INDOMARET", name: "Indomaret", logo: "/logo/indomaret.png" },
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
          // 🔥 Kategori VA dan Retail dibatasi minimum 10.000
          const isVAMethods = category.title !== "Pembayaran Instan";

          return (
            <div key={idx} className="mb-8">
              <div className="flex items-center justify-between mb-3 pl-2">
                <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{category.title}</h2>
                {isVAMethods && <span className="text-[10px] font-bold text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full">Min. Rp 10.000</span>}
              </div>

              <div className="flex flex-col gap-3">
                {category.methods.map((m) => {
                  const isSelected = selectedMethod.id === m.id;
                  
                  // 🔥 Cek apakah metode ini terkunci karena nominal kurang dari 10.000
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
                          ? "bg-slate-100 border-transparent opacity-60 cursor-not-allowed" // Mode Terkunci
                          : isSelected 
                            ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10" 
                            : "bg-white border-transparent shadow-sm hover:border-emerald-500/30"
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
                      
                      <span className={`flex-1 text-left text-[14px] font-bold ${isLocked ? "text-slate-400" : isSelected ? "text-emerald-500" : "text-emerald-700"}`}>
                        {m.name}
                      </span>
                      
                      {isLocked && <Lock size={18} className="text-slate-400" />}
                      {!isLocked && isSelected && <CheckCircle2 size={22} className="text-emerald-700 fill-emerald-700/20"/>}
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