"use client";

import { X, Copy, Landmark } from "lucide-react";
import toast from "react-hot-toast";

type WakafPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  wakafName?: string;
  isProcessing?: boolean;
};

export default function WakafPaymentModal({
  isOpen,
  onClose,
  wakafName,
  isProcessing,
}: WakafPaymentModalProps) {
  if (!isOpen) return null;

  const bankName = "BSI (Bank Syariah Indonesia)";
  const accountNumber = "7001234567";
  const accountName = "GERAKAN WAKAF INDONESIA";


  const handleCopyBank = () => {
    navigator.clipboard.writeText(accountNumber);
    toast.success("Nomor rekening wakaf berhasil disalin!");
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />

      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header Modal (Tema Hijau) */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex flex-col">
            <h2 className="text-base font-black text-gray-800">
              Transfer Rekening Wakaf
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

        {/* Isi Body Modal */}
        <div className="p-5 flex flex-col items-center">
          
          <div className="bg-emerald-100 p-3 rounded-full mb-3 text-emerald-600">
            <Landmark size={24} />
          </div>

          <p className="text-xs font-medium text-gray-500 mb-4 text-center px-2">
            Silakan transfer dana wakaf Anda ke rekening resmi di bawah ini.
          </p>

          <div className="w-full bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-3 text-left">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Bank Tujuan
              </span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">
                {bankName}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Atas Nama
              </span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">
                {accountName}
              </p>
            </div>

            <div className="pt-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Nomor Rekening
              </span>
              <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-lg p-2 mt-1.5 shadow-sm">
                <span className="text-lg font-black text-emerald-700 tracking-widest pl-2">
                  {accountNumber}
                </span>
                <button
                  onClick={handleCopyBank}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-colors text-xs font-bold active:scale-95"
                >
                  <Copy size={14} />
                  Salin
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