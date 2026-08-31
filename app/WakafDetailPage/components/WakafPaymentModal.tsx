"use client";

import { useState } from "react";
import { X, Copy, Landmark, AlertCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import WakafSuccessModal from "./WakafSuccessModal"; 

type WakafPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  wakafName?: string;
  isProcessing?: boolean;
  campaignCode?: string;
  transactionData?: any;
};

export default function WakafPaymentModal({
  isOpen,
  onClose,
  wakafName,
  isProcessing,
  transactionData,
}: WakafPaymentModalProps) {
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  if (showConfirmation) {
    return (
      <WakafSuccessModal 
        isOpen={true} 
        onClose={() => {
          setShowConfirmation(false);
          setHasCopiedCode(false);
          onClose();
          window.location.reload();
        }} 
      />
    );
  }

  const bankName = "BSI (Bank Syariah Indonesia)";
  const accountNumber = "881 118 888 4";
  const accountName = "YAYASAN GERAKAN WAKAF INDONESIA";

  const totalTransfer = transactionData?.totalTransfer || 0;
  const transactionCode = transactionData?.transaction_code;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  const handleCopyText = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message, {
      icon: "✅",
      style: {
        background: "#F0FDF4",
        color: "#166534",
        border: "2px solid #BBF7D0",
        borderRadius: "12px",
        fontSize: "15px",
        fontWeight: "bold",
        padding: "16px",
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isProcessing) onClose();
        }}
      />

      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar overflow-x-hidden">
        
        {/* HEADER MODAL */}
        <div className="px-5 py-5 flex items-center justify-between border-b-2 border-gray-100 sticky top-0 bg-white z-10">
          <div className="pr-2">
            <h2 className="text-xl font-black text-gray-900 leading-tight">
              Panduan Transfer
            </h2>
            {wakafName && (
              <p className="text-xs font-bold text-emerald-700 mt-1 line-clamp-1">
                Wakaf a.n: {wakafName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center gap-5 w-full">
          {/* LANGKAH 1 */}
          <div className="w-full bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-center shadow-md relative">
            <p className="text-sm font-bold text-emerald-800 mb-2">
              1. Transfer Nominal Berikut:
            </p>
            <div className="flex items-center justify-center gap-1 mb-5">
              <span className="text-lg font-bold text-gray-600">Rp</span>
              <span className="text-3xl font-black text-gray-900 tracking-tight break-all">
                {transactionData ? formatCurrency(totalTransfer) : "0"}
              </span>
            </div>
            <button
              onClick={() => handleCopyText(totalTransfer.toString(), "Nominal berhasil disalin!")}
              className="w-full flex justify-center items-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Copy size={18} /> Salin Angka Ini
            </button>
          </div>

          {/* BATAS WAKTU */}
          {transactionData?.expiredAt && (
            <div className="w-full flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600">
              <Clock size={16} className="text-gray-500 shrink-0" />
              Transfer Sebelum: <span className="text-gray-900">{transactionData.expiredAt}</span>
            </div>
          )}

          {/* LANGKAH 2 */}
          <div className="w-full bg-white p-5 rounded-2xl border-2 border-gray-200 flex flex-col text-left">
            <p className="text-sm font-bold text-gray-800 mb-4">
              2. Kirim Ke Rekening Berikut:
            </p>
            <div className="flex items-start gap-3 mb-4 w-full">
              <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700 mt-1 shrink-0">
                <Landmark size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-500">Bank Tujuan:</p>
                <p className="text-sm font-black text-gray-900 leading-tight break-words">
                  {bankName}
                </p>
                <p className="text-xs font-bold text-gray-500 mt-2">
                  Atas Nama:
                </p>
                <p className="text-sm font-black text-gray-900 leading-tight break-words">
                  {accountName}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-2 w-full">
              <p className="text-xs font-bold text-gray-500 mb-2">
                Nomor Rekening:
              </p>
              {/* Box Rekening Dibuat Flex dengan Batasan */}
              <div className="flex items-center justify-between gap-2 w-full bg-white p-2 rounded-lg border border-gray-200">
                <span className="text-lg font-black text-emerald-700 tracking-widest truncate min-w-0">
                  {accountNumber}
                </span>
                <button
                  onClick={() => handleCopyText(accountNumber, "Nomor rekening berhasil disalin!")}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Copy size={14} />
                  <span className="text-[11px] font-bold">Salin</span>
                </button>
              </div>
            </div>
          </div>

          {/* LANGKAH 3 */}
          {transactionCode && (
            <div className="w-full bg-amber-50 p-5 rounded-2xl border-2 border-amber-300 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-amber-600 shrink-0" />
                <span className="text-sm font-bold text-amber-900">
                  3. Tulis Kode Ini (Wajib)
                </span>
              </div>
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                Salin kode di bawah ini dan tempel di kolom <b>"Berita / Catatan"</b> saat transfer.
              </p>
              
              {/* 🔥 PERBAIKAN: Kotak Kode Transaksi Ditumpuk Atas Bawah 🔥 */}
              <div className="flex flex-col items-center bg-white border-2 border-amber-200 rounded-xl p-3 shadow-sm gap-3 w-full">
                <span className="text-sm font-black text-amber-900 tracking-widest break-all text-center w-full">
                  {transactionCode}
                </span>
                <button
                  onClick={() => {
                    handleCopyText(transactionCode, "Kode berhasil disalin!");
                    setHasCopiedCode(true);
                  }}
                  className="w-full flex justify-center items-center gap-2 px-3 py-2.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-sm rounded-lg transition-colors"
                >
                  <Copy size={16} /> Salin Kode
                </button>
              </div>
            </div>
          )}

          {/* LANGKAH 4 */}
          <div className="w-full bg-white p-4 rounded-2xl border-2 border-gray-200 flex flex-col text-left">
            <p className="text-xs font-bold text-gray-800 leading-relaxed">
              4. Jika sudah transfer, tekan tombol selesai di bawah ini:
            </p>
          </div>

          <button
            onClick={() => {
              if (transactionCode && !hasCopiedCode) {
                toast.error("Harap Salin Kode (Langkah 3) terlebih dahulu!", {
                  icon: "⚠️",
                  style: {
                    background: "#FEF2F2",
                    color: "#991B1B",
                    border: "2px solid #FECACA",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    padding: "16px",
                  },
                });
              } else {
                setShowConfirmation(true);
              }
            }}
            className="w-full bg-gray-800 text-white font-black text-base py-4 rounded-2xl hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg mt-1"
          >
            Selesai / Saya Sudah Transfer
          </button>
        </div>
      </div>
    </div>
  );
}