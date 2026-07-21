"use client";

import { X, Landmark, Copy } from "lucide-react";
import toast from "react-hot-toast";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  donationType: string;
  wakafName: string;
  currentUser?: any;
  onSubmit?: (amount: number, guestName: string) => void;
  isProcessing?: boolean;
  onLoginRedirect?: () => void;
};

export default function PaymentModal({
  isOpen,
  onClose,
  donationType,
  wakafName,
  isProcessing,
}: PaymentModalProps) {
  if (!isOpen) return null;

  const bankName = "BCA (Bank Central Asia)";
  const accountNumber = "7001086972";
  const accountName = "KOLABORASI EKOSISTEM MASYARAKAT INDONESIA";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    toast.success("Nomor rekening berhasil disalin!");
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />
      
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex flex-col">
            <h2 className="text-base font-black text-gray-800">
              Instruksi Pembayaran
            </h2>
            {donationType && (
              <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded w-max mt-0.5 border border-purple-100">
                Niat: {donationType}{" "}
                {donationType === "Wakaf" && `(a.n ${wakafName})`}
              </span>
            )}
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
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
            <Landmark size={24} className="text-purple-600" />
          </div>
          
          <p className="text-xs font-medium text-gray-500 mb-5 text-center leading-relaxed px-2">
            Silakan transfer donasi Anda ke rekening di bawah ini.
          </p>

          {/* Kartu Detail Bank  */}
          <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3 text-left">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Bank Tujuan
              </span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">
                {bankName}
              </p>
            </div>
            
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Atas Nama
              </span>
              <p className="text-sm font-bold text-gray-800 mt-0.5">
                {accountName}
              </p>
            </div>

            <div className="pt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Nomor Rekening
              </span>
              
              {/* Box Nomor Rekening & Tombol Copy */}
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 mt-1.5 shadow-sm">
                <span className="text-lg font-black text-purple-700 tracking-widest pl-2">
                  {accountNumber}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md transition-colors text-xs font-bold active:scale-95"
                >
                  <Copy size={14} />
                  Salin
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-purple-600 text-white font-bold text-sm py-3.5 rounded-xl mt-5 hover:bg-purple-800 active:scale-[0.98] transition-all shadow-md shadow-purple-200"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}