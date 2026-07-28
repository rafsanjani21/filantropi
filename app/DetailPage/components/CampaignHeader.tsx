import { CheckCircle2, Clock, XCircle, Infinity } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CampaignHeader({ campaign, totalCollected }: { campaign: any, totalCollected: number | null }) {
  const { t } = useTranslation();
  
  const isUnlimitedTarget = !campaign.target_amount;
  const target = isUnlimitedTarget ? 1 : parseFloat(String(campaign.target_amount).replace(/[^\d.-]/g, ""));
  const collected = parseFloat(String((totalCollected ?? campaign.current_amount_idr) || 0).replace(/[^\d.-]/g, ""));
  const progress = isUnlimitedTarget || target === 0 ? 0 : Math.min(100, Math.floor((collected / target) * 100));

  const isUnlimitedTime = !campaign?.end_date;
  const daysLeft = isUnlimitedTime ? null : Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000));

  function getCategoryName(category_id: number) {
    const map: Record<number, string> = { 1: "Pendidikan", 2: "Kesehatan", 3: "Bencana Alam", 4: "Ekonomi", 5: "Umum" };
    return map[category_id] || "Umum";
  }

  function renderStatusBadge() {
    if (campaign?.status === "active" && daysLeft !== null && daysLeft <= 0) {
      return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 uppercase border flex items-center gap-1 shrink-0"><Clock size={12} /> Berakhir</span>;
    }
    if (campaign?.status === "rejected") {
      return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-50 text-red-700 uppercase border flex items-center gap-1 shrink-0"><XCircle size={12} /> Ditolak</span>;
    }
    if (campaign?.status !== "active") {
      return <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 uppercase border flex items-center gap-1 shrink-0"><Clock size={12} /> Menunggu</span>;
    }
    return null;
  }

  return (
    <div className="p-6 border-b border-gray-100 mt-2">
      <div className="flex flex-wrap items-start justify-between gap-y-2 gap-x-3 mb-4">
        <div className="flex-1 min-w-[130px] pr-2">
          <span className="text-sm font-semibold text-[#5B2A73] leading-tight">
            {campaign.full_name || "Penerima Manfaat"}
            <CheckCircle2 className="inline-block w-4 h-4 text-[#7C3996] ml-1 mb-0.5 align-middle" />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 justify-end">
          {renderStatusBadge()}
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#E8B94A]/15 text-[#8A6413] uppercase border border-[#E8B94A]/30 shrink-0">
            {getCategoryName(campaign.category_id)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 font-medium">Terkumpul</span>
          <span className="text-xl font-bold text-[#2A1B33] tabular-nums">
            Rp {collected.toLocaleString("id-ID")}{" "}
            {!isUnlimitedTarget && <span className="text-xs font-normal text-gray-400"> / Rp {target.toLocaleString("id-ID")}</span>}
          </span>
        </div>
        {!isUnlimitedTarget && <span className="text-sm font-black text-[#5B2A73] bg-[#E8B94A]/15 border border-[#E8B94A]/30 px-2 py-0.5 rounded-md">{progress}%</span>}
      </div>

      {!isUnlimitedTarget && (
        <div className="w-full h-2.5 bg-[#7C3996]/10 rounded-full overflow-hidden mt-2">
          <div className="h-full rounded-full bg-gradient-to-r from-[#7C3996] to-[#E8B94A] transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${isUnlimitedTime || daysLeft as number > 0 ? "text-orange-600 bg-orange-50 border-orange-100" : "text-gray-500 bg-gray-100 border-gray-200"}`}>
          {isUnlimitedTime ? <><Infinity size={16} /> Tanpa Batas Waktu</> : <><Clock size={14} /> {(daysLeft as number) > 0 ? `Sisa ${daysLeft} Hari` : "Program Berakhir"}</>}
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-[#2A1B33] leading-snug my-4">{campaign.title}</h1>
      {campaign.description && <p className="text-gray-600 text-sm leading-relaxed">{campaign.description}</p>}
    </div>
  );
}