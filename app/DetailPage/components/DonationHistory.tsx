import { History, ArrowDownRight } from "lucide-react";

export default function DonationHistory({ history }: { history: any[] }) {
  return (
    <div className="px-6 pb-6 pt-4 bg-[#FBF8F3]">
      <div className="flex items-center gap-2 mb-4">
        <History size={18} className="text-[#7C3996]" />
        <h2 className="text-lg font-bold text-[#2A1B33]">Donasi Masuk</h2>
      </div>
      <div className="flex flex-col gap-3">
        {history.length > 0 ? history.slice(0, 5).map((tx, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-[#7C3996]/8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ArrowDownRight size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{tx.from_to}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{new Date(tx.date).toLocaleDateString("id-ID")}</p>
              </div>
            </div>
            <p className="font-black text-sm text-emerald-600 tabular-nums">
              +Rp {parseFloat(tx.amount || "0").toLocaleString("id-ID")}
            </p>
          </div>
        )) : <p className="text-sm text-gray-500 text-center py-4">Belum ada donasi masuk.</p>}
      </div>
      {history.length > 0 && <p className="text-xs text-gray-400 mt-3 justify-center text-center">5 donasi terakhir ditampilkan.</p>}
    </div>
  );
}