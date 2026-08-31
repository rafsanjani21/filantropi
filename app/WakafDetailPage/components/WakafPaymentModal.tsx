"use client";

import { useState } from "react";
import { X, Copy, Landmark, AlertCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import WakafSuccessModal from "./WakafSuccessModal"; // 🔥 Import Modal Baru

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

  // 🔥 Jika showConfirmation bernilai true, langsung tampilkan modal sukses (menggantikan modal ini)
  if (showConfirmation) {
    return (
      <WakafSuccessModal 
        isOpen={true} 
        onClose={() => {
          setShowConfirmation(false);
          setHasCopiedCode(false);
          onClose();
          window.location.reload(); // Refresh setelah klik Oke
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

      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="px-6 py-5 flex items-center justify-between border-b-2 border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Panduan Transfer
            </h2>
            {wakafName && (
              <p className="text-sm font-semibold text-emerald-700 mt-1">
                Wakaf a.n: {wakafName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          {/* LANGKAH 1 */}
          <div className="w-full bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 text-center shadow-md relative overflow-hidden">
            <p className="text-sm font-bold text-emerald-800 mb-2">
              1. Transfer Nominal Berikut:
            </p>
            <div className="flex items-center justify-center gap-1 mb-5">
              <span className="text-xl font-bold text-gray-600">Rp</span>
              <span className="text-4xl font-black text-gray-900 tracking-tight">
                {transactionData ? formatCurrency(totalTransfer) : "0"}
              </span>
            </div>
            <button
              onClick={() =>
                handleCopyText(
                  totalTransfer.toString(),
                  "Nominal berhasil disalin!"
                )
              }
              className="w-full flex justify-center items-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-base font-bold hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Copy size={20} /> Salin Angka Ini
            </button>
          </div>

          {/* BATAS WAKTU */}
          {transactionData?.expiredAt && (
            <div className="w-full flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">
              <Clock size={18} className="text-gray-500" />
              Transfer Sebelum:{" "}
              <span className="text-gray-900">{transactionData.expiredAt}</span>
            </div>
          )}

          {/* LANGKAH 2 */}
          <div className="w-full bg-white p-5 rounded-2xl border-2 border-gray-200 flex flex-col text-left">
            <p className="text-sm font-bold text-gray-800 mb-4">
              2. Kirim Ke Rekening Berikut:
            </p>
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700 mt-1">
                <Landmark size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Bank Tujuan:</p>
                <p className="text-base font-black text-gray-900 leading-tight">
                  {bankName}
                </p>
                <p className="text-sm font-bold text-gray-500 mt-3">
                  Atas Nama:
                </p>
                <p className="text-base font-black text-gray-900 leading-tight">
                  {accountName}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-2">
              <p className="text-sm font-bold text-gray-500 mb-2">
                Nomor Rekening:
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-emerald-700 tracking-widest">
                  {accountNumber}
                </span>
                <button
                  onClick={() =>
                    handleCopyText(
                      accountNumber,
                      "Nomor rekening berhasil disalin!"
                    )
                  }
                  className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Copy size={18} />
                  <span className="text-xs font-bold">Salin</span>
                </button>
              </div>
            </div>
          </div>

          {/* LANGKAH 3 */}
          {transactionCode && (
            <div className="w-full bg-amber-50 p-5 rounded-2xl border-2 border-amber-300 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={24} className="text-amber-600 shrink-0" />
                <span className="text-sm font-bold text-amber-900">
                  3. Tulis Kode Ini di Catatan (Wajib)
                </span>
              </div>
              <p className="text-sm font-medium text-amber-800 leading-relaxed">
                Silakan salin kode ini dan tempel (paste) di kolom <b>"Berita / Catatan"</b> saat Anda mentransfer.
              </p>
              <div className="flex items-center justify-between bg-white border-2 border-amber-200 rounded-xl p-3 shadow-sm">
                <span className="text-lg font-black text-amber-900 tracking-wider">
                  {transactionCode}
                </span>
                <button
                  onClick={() => {
                    handleCopyText(transactionCode, "Kode berhasil disalin!");
                    setHasCopiedCode(true); // Membuka status tombol
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs rounded-lg transition-colors"
                >
                  <Copy size={16} /> Salin Kode
                </button>
              </div>
            </div>
          )}

          {/* LANGKAH 4 */}
          <div className="w-full bg-white p-5 rounded-2xl border-2 border-gray-200 flex flex-col text-left">
            <p className="text-sm font-bold text-gray-800">
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
                setShowConfirmation(true); // 🔥 Mengubah tampilan menjadi modal sukses
              }
            }}
            className="w-full bg-gray-800 text-white font-black text-lg py-4 rounded-2xl hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg mt-2"
          >
            Selesai / Saya Sudah Transfer
          </button>
        </div>
      </div>
    </div>
  );
}