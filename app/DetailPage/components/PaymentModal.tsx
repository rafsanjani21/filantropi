"use client";

import { X, Copy, Wallet } from "lucide-react";
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
  receiverWallet?: string;
};

export default function PaymentModal({
  isOpen,
  onClose,
  donationType,
  wakafName,
  isProcessing,
  receiverWallet,
}: PaymentModalProps) {
  if (!isOpen) return null;

  const handleCopyWallet = () => {
    if (receiverWallet) {
      navigator.clipboard.writeText(receiverWallet);
      toast.success("Alamat wallet berhasil disalin!");
    }
  };

  // Memotong alamat wallet menjadi 4 karakter awal dan 4 akhir[cite: 16]
  const formatWallet = (wallet?: string) => {
    if (!wallet) return "";
    if (wallet.length <= 8) return wallet; // Jaga-jaga jika format aneh[cite: 16]
    return `${wallet.slice(0, 4)}....${wallet.slice(-4)}`; //[cite: 16]
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />

      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex flex-col">
            <h2 className="text-base font-black text-gray-800">
              Transfer Kripto
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
          
          {/* Ikon Header */}
          <div className="bg-purple-100 p-3 rounded-full mb-3 text-purple-600">
            <Wallet size={24} />
          </div>

          {/* KONTEN KRIPTO (USDT) */}
          {receiverWallet ? (
            <div className="w-full flex flex-col items-center">
              <p className="text-xs font-medium text-gray-500 mb-4 text-center px-2">
                Kirim token <span className="font-bold text-gray-800">USDT</span> melalui jaringan <span className="font-bold text-purple-600">Polygon</span> atau <span className="font-bold text-gray-800">Ethereum (ERC-20)</span>.
              </p>
              
              {/* QR Code menggunakan API Publik bebas akses */}
              <div className="bg-white p-2 border-2 border-gray-100 rounded-2xl shadow-sm mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${receiverWallet}`} 
                  alt="QR Code Wallet" 
                  className="w-36 h-36 object-contain"
                />
              </div>

              <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col text-left">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Alamat Wallet Tujuan
                </span>
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 mt-2 shadow-sm">
          
                  <span className="text-sm font-black text-purple-700 tracking-wider pl-1 font-mono">
                    {formatWallet(receiverWallet)}
                  </span>
                  <button
                    onClick={handleCopyWallet}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md transition-colors text-xs font-bold active:scale-95 shrink-0"
                  >
                    <Copy size={14} />
                    Salin
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Tampilan jika wallet kosong */
            <div className="w-full py-10 flex flex-col items-center text-center">
              <p className="text-sm font-bold text-gray-700">Alamat Wallet Tidak Tersedia</p>
              <p className="text-xs text-gray-500 mt-1 px-4">Pembuat kampanye ini belum mendaftarkan dompet kripto untuk menerima donasi.</p>
            </div>
          )}

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