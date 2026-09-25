import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Copy, CheckCircle2, ChevronDown, ChevronUp, Wallet, Landmark } from "lucide-react";
import toast from "react-hot-toast";

type VaViewProps = {
  vaData: any; 
  amount: number | "";
  selectedMethod: any;
  transactionType: "donasi" | "wakaf"; // Penentu Tema UI
  onBack: () => void;
  onCheckStatus: () => void;
};

export default function VaView({ vaData, amount, selectedMethod, transactionType, onBack, onCheckStatus }: VaViewProps) {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 Jam
  const [isCopied, setIsCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // KONFIGURASI TEMA DINAMIS (Donasi: Ungu, Wakaf: Emerald)
  const uiConfig = {
    donasi: {
      title: "Donasi",
      gradient: "from-[#7C3996] to-[#5a2a6d]",
      textMain: "text-[#7C3996]",
      bgMain: "bg-[#7C3996]",
      bgLight: "bg-[#7C3996]/10",
      btnHover: "hover:bg-[#6b2e88]",
      toastColor: "#7C3996"
    },
    wakaf: {
      title: "Wakaf",
      gradient: "from-emerald-600 to-emerald-800",
      textMain: "text-emerald-600",
      bgMain: "bg-emerald-600",
      bgLight: "bg-emerald-50",
      btnHover: "hover:bg-emerald-700",
      toastColor: "#10B981"
    }
  };

  const theme = uiConfig[transactionType];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatRp = (num: number) => new Intl.NumberFormat("id-ID").format(num);
  const isTimeUp = timeLeft <= 0;

  const handleCopy = () => {
    const vaNumber = vaData?.va_number || "Menunggu nomor VA..."; 
    navigator.clipboard.writeText(vaNumber);
    setIsCopied(true);
    toast.success("Nomor Virtual Account disalin!", { 
      icon: "📋",
      style: { borderRadius: "12px", background: theme.toastColor, color: "#fff", fontWeight: "bold" } 
    });
    setTimeout(() => setIsCopied(false), 3000);
  };

  const getDeadlineDate = () => {
    const date = new Date(Date.now() + timeLeft * 1000);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short"
    }).format(date).replace("pukul", "").trim();
  };

  const getInstructions = (bankId: string) => {
    const id = (bankId || "").toUpperCase();
    if (id.includes("MANDIRI")) return ["Buka aplikasi Livin' by Mandiri dan login.", "Pilih menu 'Bayar' kemudian pilih 'Multi Payment'.", "Pilih penyedia jasa (Xendit/Midtrans) atau masukkan nomor VA.", "Masukkan Nomor Virtual Account yang disalin.", "Periksa detail nama & nominal pembayaran, konfirmasi dengan PIN."];
    if (id.includes("BNI")) return ["Buka BNI Mobile Banking dan login.", "Pilih menu 'Transfer' > 'Virtual Account Billing'.", "Pilih 'Input Baru' dan tempel Nomor Virtual Account.", "Periksa kesesuaian tagihan dan masukkan Password."];
    if (id.includes("BRI")) return ["Buka aplikasi BRImo dan login.", "Pilih menu 'Tagihan' > 'BRIVA'.", "Pilih 'Tambah Transaksi Baru' dan tempel Nomor VA.", "Pastikan detail benar, masukkan PIN BRImo."];
    if (id.includes("BCA")) return ["Buka aplikasi BCA mobile dan pilih m-BCA.", "Pilih menu 'm-Transfer' > 'BCA Virtual Account'.", "Tempel Nomor Virtual Account dan klik 'Send'.", "Periksa nominal dan masukkan PIN m-BCA."];
    if (id.includes("BSI")) return ["Buka BSI Mobile dan login.", "Pilih menu 'Bayar' > 'Institusi' atau 'Virtual Account'.", "Masukkan Nomor Virtual Account di atas.", "Layar akan menampilkan detail tagihan, konfirmasi dengan PIN."];
    return [`Buka aplikasi Mobile Banking / ATM dari ${selectedMethod?.name || "Bank"} Anda.`, "Pilih menu Pembayaran > Virtual Account.", "Masukkan Nomor Virtual Account di atas.", "Pastikan nominal sesuai, konfirmasi dengan PIN."];
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#F8FAFC] min-h-screen flex flex-col relative animate-in fade-in duration-500 overflow-hidden">
      
      {/* BACKGROUND HEADER */}
      <div className={`absolute top-0 left-0 w-full h-[280px] bg-gradient-to-b ${theme.gradient} rounded-b-[2.5rem] z-0`}>
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* NAVBAR */}
      <div className="px-5 py-5 flex items-center gap-4 relative z-20">
        <button onClick={onBack} className="p-2.5 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-white text-[16px] tracking-wide">Instruksi Pembayaran</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 relative z-20">
        
        {/* TIMER */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 text-white shadow-sm">
           <div>
             <p className="text-[11px] font-medium opacity-80 uppercase tracking-widest mb-1">Batas Waktu Pembayaran</p>
             <p className="text-[13px] font-bold">{isTimeUp ? "Waktu Habis" : getDeadlineDate()}</p>
           </div>
           <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[13px] ${isTimeUp ? "bg-red-500" : "bg-white/20"}`}>
             <Clock size={14} className={!isTimeUp ? "animate-pulse" : ""} />
             {isTimeUp ? "00:00:00" : formatTime(timeLeft)}
           </div>
        </div>

        {/* VA CARD */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-6 mb-6 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5 p-4 pointer-events-none"><Landmark size={100} /></div>

          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 relative z-10">
            <h2 className="font-bold text-slate-800 text-[14px] flex items-center gap-2">
              <span className={`w-2 h-6 ${theme.bgMain} rounded-full`}></span>
              {selectedMethod?.name || "Virtual Account"}
            </h2>
            {selectedMethod?.logo && <img src={selectedMethod.logo} alt="bank logo" className="h-6 object-contain" />}
          </div>

          <div className="mb-6 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Nomor Virtual Account</p>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className={`text-[20px] font-black ${theme.textMain} tracking-wider font-mono`}>
                {vaData?.va_number || "Memuat..."}
              </p>
              <button onClick={handleCopy} disabled={!vaData?.va_number} className={`flex items-center justify-center w-10 h-10 ${theme.bgLight} ${theme.textMain} rounded-xl active:scale-95 transition-all shrink-0`}>
                {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-slate-100 pt-5 relative z-10">
            <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Total {theme.title}</p>
            <p className={`text-xl font-black ${theme.textMain}`}>Rp {formatRp(Number(amount))}</p>
          </div>
        </div>

        {/* INSTRUCTIONS ACCORDION */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-6">
          <button onClick={() => setShowInstructions(!showInstructions)} className="w-full p-5 flex justify-between items-center text-slate-800 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`${theme.bgLight} p-2 rounded-xl ${theme.textMain}`}><Wallet size={18} /></div>
              <span className="font-black text-[14px]">Cara Pembayaran</span>
            </div>
            {showInstructions ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${showInstructions ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="p-5 pt-0 border-t border-slate-50">
              <div className="space-y-4 mt-4">
                {getInstructions(selectedMethod?.id || "").map((step, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start">
                    <div className={`w-6 h-6 rounded-full ${theme.bgLight} ${theme.textMain} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                      <span className="text-[11px] font-black">{idx + 1}</span>
                    </div>
                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION */}
      <div className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-xl p-5 border-t border-slate-100 z-30 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.05)]">
        <button onClick={onCheckStatus} className={`w-full ${theme.bgMain} text-white font-bold text-[15px] py-4 rounded-full shadow-lg ${theme.btnHover} active:scale-95 transition-all`}>
          Selesai & Cek Status {theme.title}
        </button>
      </div>

    </div>
  );
}