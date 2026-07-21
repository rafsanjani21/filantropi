"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import QRCode from "react-qr-code";
import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  ShieldCheck,
  Wallet,
  CreditCard,
  Landmark,
} from "lucide-react";
import toast from "react-hot-toast";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const amountParam = searchParams.get("amount");
  const campaignId = searchParams.get("campaignId"); // 🔥 Tangkap ID Kampanye
  const donaturName = searchParams.get("name") || "Orang Baik"; // 🔥 Tangkap Nama

  const amount = amountParam ? parseInt(amountParam) : 0;
  const orderId = `TRX-${Math.floor(Math.random() * 1000000000)}`;

  const [selectedMethod, setSelectedMethod] = useState<string>("qris");
  const [timeLeft, setTimeLeft] = useState(900);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success">(
    "pending",
  );

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSimulateSuccess = () => {
    setPaymentStatus("success");
    toast.success("Pembayaran Berhasil!");

    // 🔥 SIMULASI: Simpan riwayat donasi ke localStorage agar terbaca di DetailPage
    if (campaignId && amount > 0) {
      const newDonation = {
        tx_hash: orderId,
        date: new Date().toISOString(),
        amount: amount.toString(),
        from_to: donaturName,
      };

      const storageKey = `sim_donations_${campaignId}`;
      const existingDonations = JSON.parse(
        localStorage.getItem(storageKey) || "[]",
      );
      localStorage.setItem(
        storageKey,
        JSON.stringify([newDonation, ...existingDonations]),
      );
    }

    setTimeout(() => {
      router.back();
    }, 3000);
  };

  if (amount <= 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-gray-500 font-bold mb-4">Nominal tidak valid.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-gray-800 text-sm">Filantropi</h1>
            <p className="text-[10px] text-gray-400">Order ID: {orderId}</p>
          </div>
          <div className="w-10"></div>
        </div>

        {paymentStatus === "success" ? (
          <div className="flex flex-col items-center justify-center p-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              Pembayaran Berhasil
            </h2>
            <p className="text-gray-500 mb-6">
              Terima kasih atas donasi Anda. Dana telah diterima.
            </p>
            <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Total Bayar</p>
              <p className="text-xl font-bold text-green-600">
                Rp {amount.toLocaleString("id-ID")}
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-8 animate-pulse">
              Mengalihkan halaman...
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-6 bg-blue-50/50 flex flex-col items-center justify-center border-b border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">
                Total Tagihan
              </p>
              <p className="text-3xl font-black text-gray-800">
                Rp {amount.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="bg-red-50 py-2 px-4 flex items-center justify-center gap-2 text-red-600 text-sm font-bold border-b border-red-100">
              <Clock size={16} />
              Selesaikan pembayaran dalam {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </div>

            <div className="p-6 flex-1 bg-white">
              <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">
                Pilih Metode Pembayaran
              </h3>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setSelectedMethod("qris")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedMethod === "qris" ? "border-blue-500 bg-blue-50/30" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                      <QRCode value="qris" size={20} />
                    </div>
                    <span className="font-bold text-gray-700">
                      QRIS (Gopay, Dana, dll)
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === "qris" ? "border-blue-500" : "border-gray-300"}`}
                  >
                    {selectedMethod === "qris" && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod("va")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedMethod === "va" ? "border-blue-500 bg-blue-50/30" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                      <Landmark size={20} />
                    </div>
                    <span className="font-bold text-gray-700">
                      Virtual Account Bank
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === "va" ? "border-blue-500" : "border-gray-300"}`}
                  >
                    {selectedMethod === "va" && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </button>
              </div>

              {selectedMethod === "qris" && (
                <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center border border-gray-200 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg"
                      alt="QRIS"
                      className="h-6"
                    />
                  </div>
                  <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-sm mb-4">
                    <QRCode
                      value={`00020101021126670016ID.CO.TELKOMSEL.WWW011893600911001123456702150000000000000000303UME51440014ID.CO.QRIS.WWW0215ID10200210108930303UME5204541153033605405${amount}5802ID5919Filantropi Foundation6007Jakarta61051234562070703A016304${orderId}`}
                      size={180}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Scan QR code menggunakan aplikasi E-Wallet atau M-Banking
                    Anda.
                  </p>
                </div>
              )}

              {selectedMethod === "va" && (
                <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center border border-gray-200 animate-in fade-in slide-in-from-top-4 text-center">
                  <Landmark size={40} className="text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 mb-2">
                    Nomor Virtual Account Anda:
                  </p>
                  <p className="text-2xl font-black text-blue-600 tracking-widest mb-4">
                    8800 1234 5678
                  </p>
                  <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100">
                    Salin Nomor
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 mt-auto">
              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 mb-3">
                <ShieldCheck size={12} /> Pembayaran aman & terenkripsi
                (Simulasi)
              </div>
              <button
                onClick={handleSimulateSuccess}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
              >
                (Dev) Simulasikan Bayar Berhasil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSimulationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
