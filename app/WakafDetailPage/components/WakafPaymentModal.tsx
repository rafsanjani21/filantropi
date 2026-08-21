"use client";

import { X, Copy, Landmark, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

type WakafPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  wakafName?: string;
  isProcessing?: boolean;
  campaignCode?: string; 
};

export default function WakafPaymentModal({
  isOpen,
  onClose,
  wakafName,
  isProcessing,
  campaignCode,
}: WakafPaymentModalProps) {
  if (!isOpen) return null;

  const bankName = "BSI (Bank Syariah Indonesia)";
  const accountNumber = "881 118 888 4";
  const accountName = "YAYASAN GERAKAN WAKAF INDONESIA";

  const handleCopyBank = () => {
    navigator.clipboard.writeText(accountNumber);
    toast.success("Nomor rekening wakaf berhasil disalin!", {
      icon: '✨',
      style: {
        background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0',
        borderRadius: '16px', fontSize: '13px', fontWeight: '600',
        padding: '12px 16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    });
  };

  const handleCopyCode = () => {
    if (campaignCode) {
      navigator.clipboard.writeText(campaignCode);
      toast.success("Kode campaign berhasil disalin!", {
        icon: '📋',
        style: {
          background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A',
          borderRadius: '16px', fontSize: '13px', fontWeight: '600',
          padding: '12px 16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />

      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex flex-col">
            <h2 className="text-base font-black text-gray-800">
              Transfer Rekening
            </h2>
            <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded w-max mt-0.5 border border-emerald-200">
              Niat: Wakaf {wakafName && `(a.n ${wakafName})`}
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center">
          
          <div className="bg-emerald-100 p-3 rounded-full mb-3 text-emerald-600">
            <Landmark size={24} />
          </div>

          <p className="text-xs font-medium text-gray-500 mb-4 text-center px-2">
            Silakan transfer dana wakaf Anda ke rekening resmi di bawah ini.
          </p>

          <div className="w-full bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-3 text-left">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Bank Tujuan</span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{bankName}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Atas Nama</span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{accountName}</p>
            </div>
            <div className="pt-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nomor Rekening</span>
              <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-lg p-2 mt-1.5 shadow-sm">
                <span className="text-lg font-black text-emerald-700 tracking-widest pl-2">{accountNumber}</span>
                <button
                  onClick={handleCopyBank}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-colors text-xs font-bold active:scale-95"
                >
                  <Copy size={14} /> Salin
                </button>
              </div>
            </div>
          </div>

          {/* Kotak ini sekarang SELALU MUNCUL */}
          <div className="w-full bg-amber-50 p-4 rounded-xl border border-amber-200 mt-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Penting: Berita Transfer
              </span>
              <p className="text-xs text-amber-700 mt-1 mb-2.5 leading-relaxed">
                Wajib cantumkan kode di bawah ini pada <b>Catatan/Berita Transfer</b> di aplikasi bank Anda.
              </p>
              
              <div className="flex items-center justify-between bg-white border border-amber-200 rounded-lg p-2 shadow-sm w-full">
                <span className="text-sm font-black text-amber-900 pl-2 tracking-wide truncate">
                  {campaignCode ? campaignCode : "KODE-TIDAK-DITEMUKAN"}
                </span>
                <button
                  onClick={handleCopyCode}
                  disabled={!campaignCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md transition-colors text-xs font-bold active:scale-95 shrink-0 disabled:opacity-50"
                >
                  <Copy size={14} /> Salin
                </button>
              </div>
            </div>
          </div>

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