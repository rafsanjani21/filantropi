import { Receipt } from "lucide-react";

export default function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center flex flex-col items-center justify-center mt-4 shadow-sm">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Receipt size={32} className="text-gray-300" />
      </div>
      <p className="text-gray-800 font-bold mb-1">Belum Ada Riwayat</p>
      <p className="text-xs text-gray-500 mb-5">Anda belum menunaikan wakaf atau donasi apapun.</p>
      <button 
        onClick={onAction}
        className="bg-purple-50 text-purple-700 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-purple-100 transition"
      >
        Mulai Berwakaf/donasi
      </button>
    </div>
  );
}