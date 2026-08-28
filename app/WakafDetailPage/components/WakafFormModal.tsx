"use client";

import { useState } from "react";
import { X, Wallet } from "lucide-react";
import toast from "react-hot-toast";

type WakafFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  isSubmitting: boolean;
  currentUser?: any; // Tambahkan prop ini untuk menerima data profil
};

export default function WakafFormModal({ isOpen, onClose, onSubmit, isSubmitting, currentUser }: WakafFormModalProps) {
  const [amount, setAmount] = useState(""); 

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setAmount(rawValue);
  };

  const formattedAmount = amount ? new Intl.NumberFormat("id-ID").format(Number(amount)) : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || Number(amount) < 1000) {
      return toast("Minimal wakaf adalah Rp 1.000", {
        icon: '⚠️',
        style: { background: '#FFFBEB', color: '#92400E', borderRadius: '16px', fontSize: '13px', fontWeight: '600' },
      });
    }

    // Tembak data profil secara otomatis tanpa perlu diketik manual
    onSubmit({
      amount: Number(amount),
      senderName: currentUser?.bank_account_name || currentUser?.full_name || currentUser?.name || "Hamba Allah",
      senderBank: currentUser?.bank_name || "-",
      senderAccountNumber: currentUser?.no_req || currentUser?.no_re || "-"
    });
  };

  // Variabel untuk ditampilkan di layar
  const displayName = currentUser?.bank_account_name || currentUser?.full_name || currentUser?.name || "-";
  const displayBank = currentUser?.bank_name || "-";
  const displayAccount = currentUser?.no_req || currentUser?.no_re || "-";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && onClose()} />
      
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-800"></div>

        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
          <h2 className="text-base font-black text-gray-800">Detail Wakaf</h2>
          <button onClick={onClose} disabled={isSubmitting} className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* Nominal Input */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
              Nominal Wakaf <span className="text-red-500">*</span>
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
                placeholder="100.000"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 outline-none transition-all text-sm font-black text-gray-800"
              />
            </div>
          </div>

          {/* Data Profil Otomatis (Read-Only) */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={14} className="text-emerald-600" />
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest">Data Rekening Anda</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2">
              <span className="text-xs font-medium text-gray-500">Pemilik</span>
              <span className="text-xs font-bold text-gray-800 text-right truncate max-w-[150px]">{displayName}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2">
              <span className="text-xs font-medium text-gray-500">Bank</span>
              <span className="text-xs font-bold text-gray-800 text-right uppercase">{displayBank}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">No. Rekening</span>
              <span className="text-xs font-bold text-gray-800 text-right">{displayAccount}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-emerald-600 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Lanjutkan Pembayaran"}
          </button>
        </form>
      </div>
    </div>
  );
}