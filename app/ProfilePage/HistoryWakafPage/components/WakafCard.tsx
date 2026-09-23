import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";

export type WakafRecord = {
  id: string;
  campaign_title: string;
  amount: number;
  date: string;
  status: string;
  contact_number: string;
};

export default function WakafCard({ item }: { item: WakafRecord }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // 🔥 Deteksi apakah ini transaksi Donasi berdasarkan ID
  const isDonasi = item.id.toUpperCase().includes("DNS");

  const renderStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();

    if (lowerStatus === "success") {
      return (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isDonasi ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
          <CheckCircle2 size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {status}
          </span>
        </div>
      );
    } else if (lowerStatus === "ditolak") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full border border-red-200">
          <XCircle size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {status}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
          <Clock size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {status}
          </span>
        </div>
      );
    }
  };

  const lowerStatus = item.status.toLowerCase();

  // Ubah format string bawaan menjadi tanggal dan jam
  const dateObj = new Date(item.date); 
  const formattedDate = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const formattedTime = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group transition-colors ${isDonasi ? "hover:border-purple-200" : "hover:border-emerald-200"}`}>
      
      {/* Garis Penanda di Kiri (Berubah warna sesuai tipe dan status) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          lowerStatus === "success"
            ? isDonasi ? "bg-purple-500" : "bg-emerald-500"
            : lowerStatus === "ditolak"
              ? "bg-red-400"
              : "bg-amber-400"
        }`}
      />

      <div className="flex justify-between items-start mb-3">
        <div className="pr-4">
          <p className="text-[10px] font-bold text-gray-400 mb-1">
            ID: {item.id}
          </p>
          <h4 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
            {item.campaign_title}
          </h4>
        </div>
        {renderStatusBadge(item.status)}
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          {formattedDate}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          {formattedTime} WIB
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Total
        </span>
        <span className={`text-lg font-black ${isDonasi ? "text-purple-700" : "text-emerald-700"}`}>
          {formatCurrency(item.amount)}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="text-[10px] leading-tight flex-1">
          {lowerStatus === "ditolak" ? (
            <span className="text-red-700">
              {isDonasi ? "Donasi ditolak." : "Wakaf ditolak."} Silakan hubungi admin.
            </span>
          ) : lowerStatus === "success" ? (
            <span className={isDonasi ? "text-purple-700" : "text-emerald-700"}>
              {isDonasi ? "Ada pertanyaan terkait donasi ini?" : "Ada pertanyaan terkait wakaf ini?"}
            </span>
          ) : (
            <span className="text-amber-700">
              Sedang diverifikasi. Butuh bantuan?
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-0.5 text-end">
            Hubungi Nomor
          </p>
          <p className={`text-sm font-bold ${isDonasi ? "text-purple-700" : "text-emerald-700"}`}>
            {isDonasi ? "087770145898" : item.contact_number}
          </p>
        </div>
      </div>
    </div>
  );
}