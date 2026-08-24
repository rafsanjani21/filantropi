"use client";

import { useState } from "react";
import { X, Wallet, User, Building, Hash } from "lucide-react";
import toast from "react-hot-toast";

type WakafFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  isSubmitting: boolean;
};

export default function WakafFormModal({ isOpen, onClose, onSubmit, isSubmitting }: WakafFormModalProps) {
  const [amount, setAmount] = useState(""); // Menyimpan angka murni (tanpa titik)
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [senderAccountNumber, setSenderAccountNumber] = useState("");

  if (!isOpen) return null;

  // Fungsi untuk menangani perubahan input nominal
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Hapus semua karakter selain angka (biar huruf/titik bawaan hilang)
    const rawValue = e.target.value.replace(/\D/g, "");
    // 2. Simpan angka murninya ke state
    setAmount(rawValue);
  };

  // Fungsi untuk memformat angka murni menjadi ada titiknya (misal: 1000000 -> 1.000.000)
  const formattedAmount = amount ? new Intl.NumberFormat("id-ID").format(Number(amount)) : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi nominal (menggunakan angka murni)
    if (!amount || Number(amount) < 10000) {
      return toast("Minimal wakaf adalah Rp 10.000", {
        icon: '⚠️',
        style: { background: '#FFFBEB', color: '#92400E', borderRadius: '16px', fontSize: '13px', fontWeight: '600' },
      });
    }

    // Kirim data ke parent (page.tsx)
    onSubmit({
      amount: Number(amount), // Pastikan yang dikirim ke API adalah angka aslinya
      senderName,
      senderBank,
      senderAccountNumber
    });
  };

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

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* Nominal Input (Wajib) */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
              Nominal Wakaf <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 font-bold">Rp</span>
              </div>
              <input
                type="text"          // <-- Ubah jadi text
                inputMode="numeric"  // <-- Memaksa keyboard HP menampilkan angka
                required
                value={formattedAmount} // <-- Gunakan variabel yang sudah diformat
                onChange={handleAmountChange}
                placeholder="100.000"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-sm font-bold text-gray-800"
              />
            </div>
          </div>

          <div className="my-2 border-t border-dashed border-gray-200 relative">
             <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Data Pengirim
             </span>
          </div>

          {/* Nama Pengirim */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Nama Pengirim</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Misal: Ahmad Subarjo"
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-sm text-gray-800"
              />
            </div>
          </div>

          {/* Bank Pengirim */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Bank Asal</label>
            <div className="relative">
              <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={senderBank}
                onChange={(e) => setSenderBank(e.target.value)}
                placeholder="Misal: Mandiri"
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-sm text-gray-800"
              />
            </div>
          </div>

          {/* No Rekening Pengirim */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">No. Rekening Asal</label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={senderAccountNumber}
                onChange={(e) => setSenderAccountNumber(e.target.value)}
                placeholder="Misal: 9998887771"
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-sm text-gray-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-emerald-600 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-200 flex justify-center items-center gap-2 disabled:opacity-70"
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