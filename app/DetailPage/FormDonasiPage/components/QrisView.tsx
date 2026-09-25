import { useState, useEffect } from "react";
import { ArrowLeft, Clock, AlertCircle, Download, CheckCircle2, ChevronRight, ScanLine } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type QrisViewProps = { 
  qrisData: any; 
  amount: number | ""; 
  onBack: () => void; 
};

export default function QrisView({ qrisData, amount, onBack }: QrisViewProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(3600);

  // LOGIKA HITUNG MUNDUR BERJALAN
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

  // FUNGSI DOWNLOAD QRIS 
  const handleDownloadQR = () => {
    const canvas = document.getElementById("qris-canvas") as HTMLCanvasElement;
    if (canvas) {
      const paddedCanvas = document.createElement("canvas");
      const padding = 40;
      paddedCanvas.width = canvas.width + padding * 2;
      paddedCanvas.height = canvas.height + padding * 2;
      const ctx = paddedCanvas.getContext("2d");
      
      if (ctx) {
        ctx.fillStyle = "#ffffff"; 
        ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
        ctx.drawImage(canvas, padding, padding);
        
        const pngUrl = paddedCanvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QRIS-Donasi-${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        toast.success("Kode QRIS berhasil disimpan ke galeri", {
          icon: "✓",
          style: { borderRadius: "12px", background: "#7C3996", color: "#fff", fontWeight: "bold" }
        });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#F8FAFC] min-h-screen flex flex-col relative animate-in fade-in duration-500 overflow-hidden">
      
      {/* BACKGROUND SPLASH MELENGKUNG (Tema Ungu Donasi) */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-b from-[#7C3996] to-[#5a2a6d] rounded-b-[2.5rem] z-0">
        {/* Ornamen Abstrak Halus */}
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[50px] left-[-50px] w-[150px] h-[150px] bg-[#9b49bc]/20 rounded-full blur-2xl"></div>
      </div>

      {/* HEADER TRANSPARAN */}
      <div className="px-5 py-5 flex items-center gap-4 relative z-20">
        <button onClick={onBack} className="p-2.5 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-white text-[16px] tracking-wide">Pembayaran QRIS</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 relative z-20">
        
        {/* KARTU UTAMA QRIS (Overlapping Design) */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-6 mb-6 mt-2 border border-slate-100 flex flex-col items-center">
          
          {/* Nominal & Timer */}
          <div className="w-full flex items-start justify-between border-b border-slate-100 pb-5 mb-6">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Donasi</p>
              <p className="text-2xl font-black text-slate-800 tracking-tight">Rp {formatRp(Number(amount))}</p>
            </div>
            
            <div className={`flex flex-col items-end`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sisa Waktu</p>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[13px] transition-colors ${
                isTimeUp ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
              }`}>
                {isTimeUp ? <AlertCircle size={14} /> : <Clock size={14} className="animate-pulse" />}
                {isTimeUp ? "HABIS" : formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* AREA SCAN QR (Minimalist Frame) */}
          <div className="relative group w-[220px] h-[220px] flex items-center justify-center">
            {/* Sudut-sudut Scan (Scan Finder UI - Warna Ungu) */}
            {!isTimeUp && (
              <>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#7C3996] rounded-tl-xl transition-all group-hover:scale-110"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#7C3996] rounded-tr-xl transition-all group-hover:scale-110"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#7C3996] rounded-bl-xl transition-all group-hover:scale-110"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#7C3996] rounded-br-xl transition-all group-hover:scale-110"></div>
              </>
            )}

            <div className="bg-white p-3 rounded-2xl shadow-sm z-10">
              {isTimeUp ? (
                <div className="w-[180px] h-[180px] flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
                  <AlertCircle size={40} className="mb-2 opacity-30" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Kedaluwarsa</span>
                </div>
              ) : (
                <div className="relative">
                  <QRCodeCanvas 
                    id="qris-canvas" 
                    value={qrisData?.payment_code || "https://qris.id"} 
                    size={180} 
                    level="Q" 
                  />
                  {/* Logo QRIS Kecil di Tengah */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-md shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" className="h-5 object-contain" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TOMBOL SIMPAN QRIS (Pill Shaped & Seamless) */}
          <button 
            onClick={handleDownloadQR}
            disabled={isTimeUp}
            className="mt-8 w-full flex justify-center items-center gap-2 bg-slate-50 border border-slate-100 text-slate-700 font-bold text-[14px] py-3.5 rounded-full hover:bg-[#7C3996]/5 hover:text-[#7C3996] hover:border-[#7C3996]/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Download size={18} className="text-slate-400 group-hover:text-[#7C3996] transition-colors" />
            Simpan ke Galeri
          </button>

        </div>

        {/* SECTION INFO & PANDUAN */}
        <div className="bg-white rounded-[2rem] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.02)] p-1 border border-slate-100">
          
          <div className="p-5 border-b border-slate-50 flex items-center gap-4">
            <div className="bg-[#7C3996]/10 p-2.5 rounded-2xl">
              <CheckCircle2 size={24} className="text-[#7C3996]" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-800">QRIS Terverifikasi</h3>
              <p className="text-[12px] font-medium text-slate-500">Mendukung Gopay, OVO, BCA, Livin, dll.</p>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">Cara Pembayaran</h3>
            <div className="space-y-4">
              {[
                "Simpan QR Code ke galeri HP Anda.",
                "Buka aplikasi E-Wallet atau Mobile Banking.",
                "Pilih menu Bayar / Scan QR.",
                "Tekan ikon galeri dan pilih gambar QRIS tadi.",
                "Periksa nominal dan klik Bayar."
              ].map((text, idx) => (
                <div key={idx} className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#7C3996]/10 text-[#7C3996] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[11px] font-black">{idx + 1}</span>
                  </div>
                  <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* FLOATING ACTION BOTTOM BAR */}
      <div className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-xl p-5 border-t border-slate-100 z-30 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => router.push("/ProfilePage/HistoryWakafPage")} 
          className="w-full bg-[#7C3996] text-white font-bold text-[15px] py-4 rounded-full shadow-lg shadow-[#7C3996]/30 hover:bg-[#6b2e88] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Selesai & Cek Status
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}