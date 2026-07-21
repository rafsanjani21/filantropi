"use client";

import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  donationType: string;
  wakafName: string;
  currentUser: any;
  onSubmit: (amount: number, guestName: string) => void;
  isProcessing: boolean;
  onLoginRedirect: () => void;
};

export default function PaymentModal({
  isOpen, onClose, donationType, wakafName, currentUser, onSubmit, isProcessing, onLoginRedirect
}: PaymentModalProps) {
  const [donationAmount, setDonationAmount] = useState<number | "">("");
  const [guestName, setGuestName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!donationAmount || Number(donationAmount) < 1000) {
      return toast.error("Minimal donasi adalah Rp 1.000");
    }
    if (!currentUser && !guestName.trim()) {
      return toast.error("Nama wajib diisi jika tidak login!");
    }
    onSubmit(Number(donationAmount), guestName);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => !isProcessing && onClose()} />
      <div className="relative bg-gray-50 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-y-0 overflow-hidden">
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-gray-800">Detail Pembayaran</h2>
            {donationType && (
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded w-max mt-0.5 border border-purple-100">
                Niat: {donationType} {donationType === "Wakaf" && `(a.n ${wakafName})`}
              </span>
            )}
          </div>
          <button onClick={onClose} disabled={isProcessing} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[10000, 20000, 50000, 100000].map((amount) => (
              <button key={amount} onClick={() => setDonationAmount(amount)} className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 active:scale-95 ${donationAmount === amount ? "bg-purple-50 border-purple-500 text-purple-800" : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50/50"}`}>
                Rp {amount.toLocaleString("id-ID")}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Atau masukkan nominal lainnya</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rp</span>
              <input type="number" min="1000" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value ? Number(e.target.value) : "")} placeholder="0" className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 pl-12 pr-4 text-base font-black text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all" />
            </div>
          </div>

          {!currentUser && (
            <div className="flex flex-col gap-2.5 mt-2 border-t border-gray-100 pt-4">
              <div className="flex justify-between items-end mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lanjut Sebagai Tamu</label>
                <button onClick={onLoginRedirect} className="text-xs font-bold text-purple-600 hover:underline">Masuk / Login</button>
              </div>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Nama Lengkap" className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all" />
            </div>
          )}

          <button onClick={handleSubmit} disabled={!donationAmount || isProcessing} className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold text-lg py-4 rounded-xl mt-2 hover:bg-purple-800 active:scale-95 transition-all disabled:bg-gray-300 disabled:text-gray-500 shadow-[0_10px_20px_-10px_rgba(147,51,234,0.5)]">
            {isProcessing ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <>Lanjutkan Pembayaran</>}
          </button>
        </div>
      </div>
    </div>
  );
}