/**
 * components/payment/QrisSementara.tsx
 *
 * Fungsi   : Tampilan QRIS lokal (react-qr-code) sebagai fallback saat payment gateway bermasalah, dengan unduh QR ke PNG.
 * Ekspor   : default QrisSementara
 * Dipakai  : app/(main)/programs/[slug]/donate/page.tsx, app/(main)/wakaf/[slug]/donate/page.tsx, tests/unit/qrisSementara.leak.test.tsx
 * Catatan  : Tidak ada countdown/timer berulang; setTimeout hanya untuk revoke object URL
 *            setelah unduhan. Tombol unduh nonaktif bila qrisString kosong.
 */
//dipakai saat payment gateway bermasalah

import NextImage from "next/image";
import { ArrowLeft, ShieldCheck, Wallet, Scan, CheckCircle2, Download, Loader2, AlertTriangle } from "lucide-react";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";
import { safeRp } from "@/lib/format";
import type { RecordStatus } from "@/hooks/useTransactionSubmit";

type QrisSementaraProps = {
  amount: number | "";
  qrisString: string;
  transactionType: "donasi" | "wakaf";
  onBack: () => void;
  onCheckStatus: () => void;
  recordStatus?: RecordStatus;
  recordError?: string | null;
};

export default function QrisSementara({
  amount,
  qrisString,
  transactionType,
  onBack,
  onCheckStatus,
  recordStatus,
  recordError,
}: QrisSementaraProps) {

  // Logika Mengunduh QR Code (SVG -> PNG) tanpa API deprecated (unescape/atob).
  const handleDownloadQris = () => {
    const svgElement = document.querySelector<SVGSVGElement>(
      "#qris-container svg",
    );
    if (!svgElement) {
      toast.error("Gagal memuat gambar QRIS");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const qrSize = 400;
    const padding = 24;

    if (!ctx) {
      URL.revokeObjectURL(svgUrl);
      toast.error("Browser tidak mendukung unduh QRIS");
      return;
    }

    img.onload = () => {
      canvas.width = qrSize + padding * 2;
      canvas.height = qrSize + padding * 2;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding, qrSize, qrSize);

      canvas.toBlob((pngBlob) => {
        URL.revokeObjectURL(svgUrl);
        if (!pngBlob) {
          toast.error("Gagal membuat gambar QRIS");
          return;
        }
        const pngUrl = URL.createObjectURL(pngBlob);
        const downloadLink = document.createElement("a");
        downloadLink.download = `QRIS_${transactionType.toUpperCase()}_Rp${safeRp(amount)}.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
        toast.success("QRIS berhasil disimpan!");
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      toast.error("Gagal memuat gambar QRIS");
    };
    img.src = svgUrl;
  };

  // Konfigurasi Tema
  const isWakaf = transactionType === "wakaf";
  const themeText = isWakaf ? "text-emerald-600" : "text-[#7C3996]";
  const themeBg = isWakaf ? "bg-emerald-600" : "bg-[#7C3996]";
  const themeLightBg = isWakaf ? "bg-emerald-50" : "bg-[#7C3996]/10";
  const themeBorder = isWakaf ? "border-emerald-200" : "border-[#7C3996]/20";
  const btnBg = isWakaf 
    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30" 
    : "bg-gradient-to-r from-[#7C3996] to-[#5B2A73] hover:from-[#6b2e88] hover:to-[#4a225e] shadow-[#7C3996]/30";
  
  const titleLabel = isWakaf ? "Wakaf" : "Donasi";
  const qrisLogo = "/logo/qris.svg";

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col relative animate-in zoom-in-95 duration-300">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md px-5 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-slate-100">
        <button
          onClick={onBack}
          aria-label="Kembali ke form"
          className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors active:scale-95"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-bold text-slate-800 text-[15px] tracking-wide">Pembayaran QRIS</h1>
          <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
            <ShieldCheck size={12} className={themeText} /> Transaksi Aman
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center pt-5 px-5 pb-32">

        {recordStatus && recordStatus !== "idle" && (
          <div
            role="status"
            aria-live="polite"
            className={`w-full mb-4 rounded-2xl border px-4 py-3 text-[12px] font-semibold flex items-start gap-2 ${
              recordStatus === "failed"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : recordStatus === "recorded"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            {recordStatus === "recording" && (
              <Loader2 size={16} className="mt-0.5 shrink-0 animate-spin" />
            )}
            {recordStatus === "recorded" && (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            )}
            {recordStatus === "failed" && (
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            )}
            <span>
              {recordStatus === "recording" &&
                "Mencatat transaksi... QRIS sudah dapat dipindai."}
              {recordStatus === "recorded" &&
                "Transaksi tercatat. Pembayaran akan diverifikasi oleh sistem."}
              {recordStatus === "failed" && (
                <>
                  Pencatatan otomatis gagal. QRIS tetap dapat dibayar, simpan
                  bukti pembayaran Anda.
                  {recordError ? ` (${recordError})` : ""}
                </>
              )}
            </span>
          </div>
        )}

        {/* KARTU QRIS UTAMA */}
        <div className="w-full bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col items-center relative overflow-hidden border border-slate-100 mb-6">
          
          <div className={`absolute top-0 left-0 w-full h-1.5 ${themeBg}`}></div>

          <div className="mt-8 mb-6">
            <NextImage src={qrisLogo} alt="QRIS" width={96} height={32} unoptimized style={{ width: 96, height: 32 }} className="object-contain" />
          </div>

          {/* Container QR Code dengan ID agar bisa diunduh */}
          <div id="qris-container" className="relative p-5 bg-white border border-slate-100 rounded-3xl shadow-sm mb-6">
            <div className={`absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 rounded-tl-xl ${themeBorder}`}></div>
            <div className={`absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 rounded-tr-xl ${themeBorder}`}></div>
            <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 rounded-bl-xl ${themeBorder}`}></div>
            <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 rounded-br-xl ${themeBorder}`}></div>
            
            {qrisString ? (
              <QRCode value={qrisString} size={200} level="H" />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium text-sm">Gagal memuat QRIS</span>
              </div>
            )}
          </div>

          <div className="w-full relative flex items-center justify-center mb-6">
            <div className="absolute left-[-10px] w-5 h-5 bg-slate-50 rounded-full border-r border-slate-100"></div>
            <div className="w-full border-t-[2px] border-dashed border-slate-200 mx-4"></div>
            <div className="absolute right-[-10px] w-5 h-5 bg-slate-50 rounded-full border-l border-slate-100"></div>
          </div>

          <div className="text-center w-full px-6 pb-6">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Total {titleLabel}
            </p>
            <p className={`text-[32px] font-black ${themeText} tracking-tight`}>
              Rp {safeRp(amount)}
            </p>
          </div>

          {/* TOMBOL UNDUH QRIS */}
          <div className="w-full px-6 pb-6">
            <button 
              onClick={handleDownloadQris}
              disabled={!qrisString}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all active:scale-95 ${qrisString ? `${themeLightBg} ${themeBorder} ${themeText} hover:bg-white` : 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed'}`}
            >
              <Download size={18} />
              <span className="text-[13px] font-bold">Simpan QRIS ke Galeri</span>
            </button>
          </div>
        </div>

        {/* INSTRUKSI PEMBAYARAN */}
        <div className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-[13px] font-bold text-slate-800 mb-4">Cara Membayar</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-start">
              <div className={`mt-0.5 p-1.5 rounded-full ${themeLightBg} ${themeText} shrink-0`}>
                <Wallet size={16} />
              </div>
              <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                Buka aplikasi M-Banking atau e-Wallet (Gopay, OVO, ShopeePay, Dana).
              </p>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className={`mt-0.5 p-1.5 rounded-full ${themeLightBg} ${themeText} shrink-0`}>
                <Scan size={16} />
              </div>
              <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                Pilih menu <b>Scan QRIS</b>, lalu arahkan kamera ke kode QR di atas (atau unggah dari galeri jika Anda sudah menyimpan gambar QRIS).
              </p>
            </div>

            <div className="flex gap-3 items-start">
              <div className={`mt-0.5 p-1.5 rounded-full ${themeLightBg} ${themeText} shrink-0`}>
                <CheckCircle2 size={16} />
              </div>
              <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                Periksa detail nominal, lalu klik <b>Bayar</b> atau masukkan PIN Anda.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* FLOATING TOMBOL BAWAH */}
      <div className="fixed bottom-0 w-full max-w-md bg-white p-5 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-30">
        <button 
          onClick={onCheckStatus} 
          className={`w-full text-white font-bold text-[15px] py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 ${btnBg}`}
        >
          Saya Sudah Membayar
        </button>
      </div>

    </div>
  );
}