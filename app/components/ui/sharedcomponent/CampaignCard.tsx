import Link from "next/link";
import { Clock, Infinity, BookOpen, Gift } from "lucide-react";

type Campaign = {
  id: string | number;
  slug?: string;
  title: string;
  campaign_code?: string;
  status?: string;
  target_amount?: number | null;
  current_amount?: number | null;
  end_date?: string | null;
  created_at?: string | null;
  image_banner?: string | string[];
  full_name?: string;
  category_id?: number;
  is_wakaf?: string | number | boolean;
};

type CampaignCardProps = {
  campaign: Campaign;
  variant: "list" | "grid" | "carousel";
  getCategoryLabel: (id: number) => string;
  t: any;
  IMAGE_BASE_URL?: string;
};

export default function CampaignCard({
  campaign,
  variant,
  getCategoryLabel,
  t,
  IMAGE_BASE_URL,
}: CampaignCardProps) {
  // 1. LOGIKA STATUS & PERHITUNGAN
  const isWakafProgram =
    campaign.is_wakaf === true ||
    campaign.is_wakaf === 1 ||
    String(campaign.is_wakaf).toLowerCase() === "true" ||
    String(campaign.is_wakaf) === "1";

  const isUnlimitedTarget = !campaign.target_amount || campaign.target_amount === 0;
  const target = isUnlimitedTarget ? 1 : Number(campaign.target_amount);
  const collected = Number(campaign.current_amount) || 0;

  const progressRaw = (collected / target) * 100;
  const progress = progressRaw > 100 ? 100 : Math.round(progressRaw);

  let daysLeft: number | null = null;
  if (campaign.end_date) {
    const diff = new Date(campaign.end_date).getTime() - Date.now();
    daysLeft = diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }
  const isUnlimitedTime = daysLeft === null;
  const safeDaysLeft = daysLeft ?? 0;

  const banner = Array.isArray(campaign.image_banner) ? campaign.image_banner[0] : campaign.image_banner;
  const imageUrl =
    typeof banner === "string" && banner.trim() !== ""
      ? banner.startsWith("http") ? banner : `${IMAGE_BASE_URL}/${banner.replace(/^\/+/, "")}?t=${Date.now()}`
      : "/placeholder.png";

  const targetUrl = isWakafProgram
    ? `/WakafDetailPage?slug=${campaign.slug || campaign.id}`
    : `/DetailPage?slug=${campaign.slug || campaign.id}`;

  // 2. TEMA OTOMATIS BERDASARKAN JENIS KAMPANYE (WAKAF / DONASI)
  const theme = isWakafProgram
    ? {
        textMain: "text-emerald-700",
        textHover: "group-hover:text-emerald-600",
        bgProgress: "bg-emerald-100",
        fillProgress: "from-emerald-400 to-emerald-600",
        badgeBg: "bg-emerald-50",
        badgeText: "text-emerald-700",
        badgeBorder: "border-emerald-200",
        shadowHover: "hover:shadow-[0_8px_25px_-6px_rgba(16,185,129,0.25)]",
        iconColor: "text-emerald-500",
        checkBg: "bg-emerald-500",
      }
    : {
        textMain: "text-[#5B2A73]",
        textHover: "group-hover:text-[#7C3996]",
        bgProgress: "bg-[#7C3996]/10",
        fillProgress: "from-[#7C3996] to-[#E8B94A]",
        badgeBg: "bg-purple-50",
        badgeText: "text-purple-700",
        badgeBorder: "border-purple-200",
        shadowHover: "hover:shadow-[0_8px_25px_-6px_rgba(124,57,150,0.25)]",
        iconColor: "text-[#7C3996]",
        checkBg: "bg-[#7C3996]",
      };

  // VARIANT 1: LIST
  if (variant === "list") {
    return (
      <div className="bg-white border-b border-gray-100 last:border-b-0 overflow-hidden flex flex-col group transition-colors hover:bg-slate-50/50">
        <Link href={targetUrl} className="flex flex-row p-3 gap-3.5 items-center">
          <div className="relative w-[130px] h-[85px] shrink-0 rounded-xl overflow-hidden">
            <img src={imageUrl} alt={campaign.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-100" />
          </div>
          <div className="flex flex-col flex-1 min-w-0 py-0.5">
            <h3 className={`text-[13px] font-bold line-clamp-2 leading-snug text-[#2A1B33] mb-1 ${theme.textHover} transition-colors`}>{campaign.title}</h3>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
              <span className="font-medium truncate">{campaign.full_name || t("beneficiary", "Penerima Manfaat")}</span>
              <div className={`w-3 h-3 rounded-full flex items-center justify-center text-white text-[7px] shrink-0 ${theme.checkBg}`}>✓</div>
            </div>
            {campaign.status === "active" ? (
              <div className="mt-auto">
                {!isUnlimitedTarget && (
                  <div className={`w-full h-1 rounded-full overflow-hidden mb-1.5 ${theme.bgProgress}`}>
                    <div className={`h-full rounded-full bg-gradient-to-r ${theme.fillProgress}`} style={{ width: `${progress}%` }} />
                  </div>
                )}
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 mb-0.5">{t("collected_label", "Terkumpul")}</span>
                    <span className="text-[11px] font-bold text-gray-800">Rp {collected.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-400 mb-0.5">{isUnlimitedTime ? "" : "Sisa hari"}</span>
                    <span className="text-[11px] font-bold text-gray-800">{isUnlimitedTime ? "Selamanya" : safeDaysLeft > 0 ? safeDaysLeft : "0"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-auto"><p className="text-[10px] text-amber-600 font-medium">Sedang ditinjau</p></div>
            )}
          </div>
        </Link>
      </div>
    );
  }

  // VARIANT 2: CAROUSEL
  if (variant === "carousel") {
    return (
      <Link href={targetUrl} className={`w-[75vw] max-w-[280px] shrink-0 snap-center bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden flex flex-col group transition-shadow ${theme.shadowHover} cursor-pointer`}>
        {/* Gambar tanpa label kategori */}
        <div className="relative w-full h-[130px] shrink-0 overflow-hidden bg-gray-100">
          <img src={imageUrl} alt={campaign.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        
        <div className="p-4 flex flex-col justify-between flex-1 relative z-20 bg-white">
          <div>
            {/* Label Kategori dipindah ke sini, berdampingan dengan Wakaf/Donasi */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <div className={`w-max ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder} text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm`}>
                {isWakafProgram ? <BookOpen size={10} /> : <Gift size={10} />} {isWakafProgram ? "Wakaf" : "Donasi"}
              </div>
              
              {!isWakafProgram && (
                <div className="bg-gray-50 text-gray-500 border border-gray-200 text-[8px] px-1.5 py-0.5 font-extrabold rounded-md uppercase tracking-wider shadow-sm">
                  {getCategoryLabel(campaign.category_id || 5)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mb-1.5">
              <span className="font-medium text-gray-600 truncate max-w-[150px]">{campaign.full_name || t("beneficiary", "Penerima Manfaat")}</span>
              <div className={`w-3 h-3 rounded-full flex items-center justify-center text-white text-[7px] shrink-0 ${theme.checkBg}`}>✓</div>
            </div>
            <h3 className={`text-sm font-bold line-clamp-2 leading-snug text-[#2A1B33] ${theme.textHover} transition-colors`}>{campaign.title}</h3>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50">
            <div className="flex justify-between items-end mb-1.5">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-medium mb-0.5">{t("collected_label", "Terkumpul")}</span>
                <span className={`text-[13px] font-bold ${theme.textMain}`}>Rp {collected.toLocaleString("id-ID")}</span>
              </div>
              {!isUnlimitedTarget && <span className={`text-[11px] font-black ${theme.badgeText} ${theme.badgeBg} px-1.5 py-0.5 rounded border ${theme.badgeBorder}`}>{progress}%</span>}
            </div>
            {!isUnlimitedTarget && (
              <div className={`w-full h-1.5 rounded-full overflow-hidden mt-1 ${theme.bgProgress}`}>
                <div className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${theme.fillProgress}`} style={{ width: `${progress}%` }} />
              </div>
            )}
            <div className="flex justify-between items-center mt-3">
              <span className="text-[10px] text-gray-400 font-medium">{t("time_limit", "Batas Waktu")}</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBF8F3] text-gray-600 border border-gray-100">
                {isUnlimitedTime ? (
                  <><Infinity size={10} className={theme.iconColor} /><span className={theme.iconColor}>{t("unlimited_time", "Tanpa Batas")}</span></>
                ) : (
                  <><Clock size={10} className={safeDaysLeft <= 5 && safeDaysLeft > 0 ? "text-red-500" : "text-gray-400"} />
                  {(safeDaysLeft as number) > 0 ? `${t("remaining", "Sisa")} ${safeDaysLeft} ${t("days", "Hari")}` : t("has_ended", "Berakhir")}</>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // VARIANT 3: GRID
  return (
    <div className={`bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden flex flex-col group transition-all duration-300 h-full ${theme.shadowHover}`}>
      <Link href={targetUrl} className="block cursor-pointer flex-1 flex flex-col h-full">
        <div className="relative h-28 w-full shrink-0">
          <img src={imageUrl} alt={campaign.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-100" />
        </div>
        <div className="flex flex-col flex-1 p-3">
          <div className="flex flex-wrap items-center gap-1 mb-1.5">
            <div className={`${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder} text-[8px] px-1.5 py-0.5 font-extrabold rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm`}>
              {isWakafProgram ? <BookOpen size={10} /> : <Gift size={10} />} {isWakafProgram ? "Wakaf" : "Donasi"}
            </div>
            {!isWakafProgram && (
              <div className="bg-gray-50 text-gray-500 border border-gray-200 text-[8px] px-1.5 py-0.5 font-extrabold rounded-md uppercase tracking-wider shadow-sm">
                {getCategoryLabel(campaign.category_id || 5)}
              </div>
            )}
          </div>
          <h3 className={`text-[12px] mb-1 leading-snug font-bold line-clamp-2 text-[#2A1B33] transition-colors ${theme.textHover}`}>{campaign.title}</h3>
          <div className="mt-auto">
            {campaign.status === "active" ? (
              <div className="pt-1">
                <div className="flex justify-between items-end mb-1.5">
                  <span className={`text-[11px] font-bold ${theme.textMain}`}>Rp {collected.toLocaleString("id-ID")}</span>
                  {!isUnlimitedTarget && <span className={`font-black rounded-md border text-[9px] px-1.5 py-0.5 ${theme.badgeText} ${theme.badgeBg} ${theme.badgeBorder}`}>{progress}%</span>}
                </div>
                {!isUnlimitedTarget && (
                  <div className={`w-full rounded-full overflow-hidden h-1 ${theme.bgProgress}`}>
                    <div className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${theme.fillProgress}`} style={{ width: `${progress}%` }} />
                  </div>
                )}
                <div className="mt-2 text-[9px] font-medium text-gray-400 flex items-center gap-1">
                  {isUnlimitedTime ? (
                    <><Infinity size={10} className={theme.iconColor}/> <span className={theme.iconColor}>Selamanya</span></>
                  ) : (
                    <><Clock size={10} className={safeDaysLeft <= 5 && safeDaysLeft > 0 ? "text-red-500" : ""} />
                    <span className={safeDaysLeft <= 5 && safeDaysLeft > 0 ? "text-red-500" : ""}>{safeDaysLeft > 0 ? `${safeDaysLeft} Hari lagi` : "Berakhir"}</span></>
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-2"><div className="p-2 bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-center gap-1.5"><Clock size={10} className="text-amber-500 shrink-0" /><p className="text-[9px] text-amber-700 font-medium leading-tight">Sedang ditinjau</p></div></div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}