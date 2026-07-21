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
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />
      <div className="relative bg-gray-50 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-y-0 overflow-hidden">
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-gray-800">
              Instruksi Pembayaran
            </h2>
            {donationType && (
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded w-max mt-0.5 border border-purple-100">
                Niat: {donationType}{" "}
                {donationType === "Wakaf" && `(a.n ${wakafName})`}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
            <Landmark size={48} className="text-purple-600 mb-4" />
            <p className="text-sm font-medium text-gray-600 mb-5 leading-relaxed">
              Silakan transfer donasi Anda ke rekening di bawah ini. Semoga menjadi amal jariyah untuk Anda.
            </p>

            <div className="w-full bg-purple-50 p-5 rounded-xl border border-purple-100 flex flex-col items-center gap-1.5 mb-2">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                Bank Tujuan
              </span>
              <span className="text-base font-bold text-gray-800">
                {bankName}
              </span>

              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mt-3">
                Atas Nama
              </span>
              <span className="text-base font-bold text-gray-800">
                {accountName}
              </span>

              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mt-3">
                Nomor Rekening
              </span>
              <span className="text-2xl font-black text-purple-700 tracking-widest mt-1">
                {accountNumber}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-white border-2 border-purple-200 text-purple-700 font-bold py-3 rounded-xl hover:bg-purple-50 active:scale-95 transition-all"
            >
              <Copy size={18} />
              Salin Nomor Rekening
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold text-lg py-4 rounded-xl mt-2 hover:bg-purple-800 active:scale-95 transition-all shadow-[0_10px_20px_-10px_rgba(147,51,234,0.5)]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}