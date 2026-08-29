"use client";

import { X, Copy, Landmark, AlertCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

type WakafPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  wakafName?: string;
  isProcessing?: boolean;
  campaignCode?: string; 
  transactionData?: any; // Data dari respons backend
};

export default function WakafPaymentModal({
  isOpen,
  onClose,
  wakafName,
  isProcessing,
  campaignCode,
  transactionData
}: WakafPaymentModalProps) {
  if (!isOpen) return null;

  const bankName = "BSI (Bank Syariah Indonesia)";
  const accountNumber = "881 118 888 4";
  const accountName = "YAYASAN GERAKAN WAKAF INDONESIA";

  const totalTransfer = transactionData?.totalTransfer || 0;
  
  // Memisahkan 3 digit terakhir untuk di-highlight
  const formatAmountWithUniqueCode = (amount: number) => {
    const strAmount = amount.toString();
    if (strAmount.length <= 3) return strAmount;
    
    // Format standar Rupiah tanpa 3 digit terakhir
    const mainPart = strAmount.slice(0, -3);
    const uniquePart = strAmount.slice(-3);
    
    const formattedMain = new Intl.NumberFormat('id-ID').format(Number(mainPart + "000")).slice(0, -3);
    
    return (
      <>
        {formattedMain}<span className="text-amber-500 bg-amber-50 px-1 rounded-sm">{uniquePart}</span>
      </>
    );
  };

  const handleCopyText = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message, {
      icon: '✨',
      style: {
        background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0',
        borderRadius: '16px', fontSize: '13px', fontWeight: '600',
        padding: '12px 16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />

      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header Modal */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex flex-col">
            <h2 className="text-base font-black text-gray-800">
              Transfer Wakaf
            </h2>
            <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded w-max mt-0.5 border border-emerald-200">
              Niat: Wakaf {wakafName && `(a.n ${wakafName})`}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center">
          
          {/* INFO NOMINAL TRANSFER (PALING PENTING) */}
          <div className="w-full mb-5 bg-white border-2 border-emerald-500 rounded-2xl p-4 text-center shadow-lg shadow-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Wakaf</p>
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-lg font-bold text-gray-400">Rp</span>
              <span className="text-3xl font-black text-emerald-700 tracking-tight">
                {transactionData ? formatAmountWithUniqueCode(totalTransfer) : "0"}
              </span>
            </div>
            <button
              onClick={() => handleCopyText(totalTransfer.toString(), "Nominal berhasil disalin!")}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold hover:bg-emerald-100 active:scale-95 transition-all"
            >
              <Copy size={13} /> Salin Nominal
            </button>
            {/* <p className="text-[10px] text-amber-600 font-medium mt-3 leading-tight px-2">
              *Penting: Transfer hingga <b>3 digit terakhir</b> agar wakaf diverifikasi.
            </p> */}
          </div>

          {/* Info Batas Waktu */}
          {transactionData?.expiredAt && (
             <div className="w-full flex items-center justify-center gap-2 mb-4 bg-gray-50 border border-gray-100 py-2 rounded-lg text-xs font-medium text-gray-500">
                <Clock size={14} className="text-gray-400" />
                Transfer sebelum: <b className="text-gray-700">{transactionData.expiredAt}</b>
             </div>
          )}

          {/* Info Rekening Bank */}
          <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2 mb-1">
               <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600"><Landmark size={16} /></div>
               <span className="text-sm font-bold text-gray-700">Bank Tujuan</span>
            </div>
            
            <div className="pl-8">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bank</span>
              <p className="text-xs font-bold text-gray-800 mt-0.5">{bankName}</p>
            </div>
            <div className="pl-8">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Atas Nama</span>
              <p className="text-xs font-bold text-gray-800 mt-0.5">{accountName}</p>
            </div>
            <div className="pl-8 pt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nomor Rekening</span>
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 mt-1.5 shadow-sm">
                <span className="text-base font-black text-emerald-700 tracking-widest pl-2">{accountNumber}</span>
                <button
                  onClick={() => handleCopyText(accountNumber, "Nomor rekening berhasil disalin!")}
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-md transition-colors"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Info Berita Transfer */}
          {campaignCode && (
            <div className="w-full bg-amber-50 p-4 rounded-xl border border-amber-200 mt-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="flex flex-col w-full">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Berita Transfer (Wajib)
                </span>
                <p className="text-[11px] text-amber-700 mt-1 mb-2.5 leading-relaxed">
                  Tambahkan kode berikut di berita transfer agar wakaf Anda dapat diverifikasi. Jangan lupa untuk menyalin kode ini dengan benar.
                </p>
                <div className="flex items-center justify-between bg-white border border-amber-200 rounded-lg p-2 shadow-sm w-full">
                  <span className="text-xs font-black text-amber-900 pl-2 tracking-wide truncate">
                    {campaignCode}
                  </span>
                  <button
                    onClick={() => handleCopyText(campaignCode, "Kode campaign berhasil disalin!")}
                    className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-emerald-600 text-white font-bold text-sm py-3.5 rounded-xl mt-5 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-200"
          >
            Saya Sudah Transfer
          </button>
        </div>
      </div>
    </div>
  );
}