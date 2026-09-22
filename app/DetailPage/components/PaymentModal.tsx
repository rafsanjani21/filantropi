"use client";

import { useState, useEffect } from "react";
import { X, ReceiptText } from "lucide-react";
import toast from "react-hot-toast";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  onSubmit?: (amount: number, guestName: string, transferNotes: string, userEmail: string) => void;
  isProcessing?: boolean;
};

export default function PaymentModal({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
  isProcessing,
}: PaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [doa, setDoa] = useState("");

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDoa("");
      setName(currentUser?.full_name || currentUser?.name || "");
      setEmail(currentUser?.email || "");
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setAmount(rawValue);
  };

  const formattedAmount = amount
    ? new Intl.NumberFormat("id-ID").format(Number(amount))
    : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) < 1000) {
      return toast.error("Minimal donasi adalah Rp 1.000");
    }

    if (!currentUser && !email) {
      return toast.error("Mohon isi email Anda untuk pengiriman bukti donasi");
    }

    if (onSubmit) {
      onSubmit(
        Number(amount), 
        name || "Orang Baik", 
        doa || "Tanpa pesan", 
        email
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />

      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-800"></div>

        {/* Header Modal */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex flex-col">
            <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
              <ReceiptText size={18} className="text-purple-600" />
              Detail Donasi
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* Nominal Input */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
              Nominal (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-bold">Rp</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                required
                value={formattedAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 outline-none transition-all text-sm font-black text-gray-800"
              />
            </div>
          </div>

          {/* Nama Pengirim */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
              Nama Anda
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Orang Baik"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 outline-none transition-all text-sm text-gray-800"
            />
          </div>

          {/* Email Pengirim (Wajib untuk Xendit jika user non-login) */}
          {!currentUser && (
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@anda.com"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 outline-none transition-all text-sm text-gray-800"
              />
            </div>
          )}

          {/* Pesan / Doa */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
              Pesan / Doa (Opsional)
            </label>
            <textarea
              value={doa}
              onChange={(e) => setDoa(e.target.value)}
              placeholder="Tuliskan doa terbaik Anda di sini..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 outline-none text-sm text-gray-800 transition-all resize-none"
              rows={3}
            />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full mt-2 bg-purple-600 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-purple-600/20 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              "Lanjut ke Pembayaran"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}