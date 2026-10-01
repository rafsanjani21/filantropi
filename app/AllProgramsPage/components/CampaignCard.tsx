import Link from "next/link";
import { Clock, Infinity, BookOpen, Gift, Heart } from "lucide-react";

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
  isWakafTheme: boolean;
  theme: any;
  isGridView: boolean; // Prop untuk menyesuaikan ukuran elemen dalam mode grid
  getCategoryLabel: (id?: number) => string;
  t: any;
  IMAGE_BASE_URL?: string;
};

export default function CampaignCard({
  campaign,
  isWakafTheme,
  theme,
  isGridView,
  getCategoryLabel,
  t,
  IMAGE_BASE_URL,
}: CampaignCardProps) {
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

  const banner = Array.isArray(campaign.image_banner) ? campaign.image_banner[0] : campaign.image_banner;
  const imageUrl =
    typeof banner === "string" && banner.trim() !== ""
      ? banner.startsWith("http")
        ? banner
        : `${IMAGE_BASE_URL}/${banner.replace(/^\/+/, "")}?t=${Date.now()}`
      : "/placeholder.png";

  const campaignIdentifier = campaign.slug || campaign.id;
  const targetUrl = isWakafProgram
    ? `/WakafDetailPage?slug=${campaignIdentifier}`
    : `/DetailPage?slug=${campaignIdentifier}`;

  return (
    <div className={`bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col group transition-all duration-300 ${theme.cardHover}`}>
      <Link href={targetUrl} className="block cursor-pointer flex-1 flex flex-col">
        {/* Gambar Cover */}
        <div className={`relative ${isGridView ? "h-32" : "h-44"} w-full`}>
          <img
            src={imageUrl}
            alt={campaign.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-gray-100"
          />
        </div>

        {/* Konten Card */}
        <div className={`flex flex-col flex-1 ${isGridView ? "p-3" : "p-5"}`}>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {isWakafProgram ? (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <BookOpen size={10} /> Wakaf
              </div>
            ) : (
              <div className="bg-purple-50 text-purple-700 border border-purple-200 text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Gift size={10} /> Donasi
              </div>
            )}

            {!isWakafProgram && (
              <div className="bg-gray-50 text-gray-500 border border-gray-200 text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                {getCategoryLabel(campaign.category_id)}
              </div>
            )}
          </div>

          <h3 className={`${isGridView ? "text-sm" : "text-lg"} font-bold line-clamp-2 leading-snug text-[#2A1B33] transition-colors ${isWakafTheme ? "group-hover:text-emerald-600" : "group-hover:text-[#7C3996]"}`}>
            {campaign.title}
          </h3>

          <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-2 mb-1">
            <span className="font-medium text-gray-500 truncate max-w-[200px]">
              {campaign.full_name || t("beneficiary", "Penerima Manfaat")}
            </span>
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[8px] shrink-0 ${theme.primaryBg}`}>
              ✓
            </div>
          </div>

          {campaign.status === "active" ? (
            <div className="mt-auto pt-2">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-medium mb-0.5">{t("collected_label", "Terkumpul")}</span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5">
                    <span className={`${isGridView ? "text-xs" : "text-sm"} font-bold ${isWakafTheme ? "text-emerald-700" : "text-[#5B2A73]"}`}>
                      Rp {collected.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                {!isUnlimitedTarget && (
                  <span className={`text-xs font-black px-1.5 py-0.5 rounded-md border ${isWakafTheme ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-[#5B2A73] bg-[#E8B94A]/15 border-[#E8B94A]/30"}`}>
                    {progress}%
                  </span>
                )}
              </div>

              {!isUnlimitedTarget && (
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isWakafTheme ? "bg-emerald-100" : "bg-[#7C3996]/10"}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${isWakafTheme ? "from-emerald-400 to-emerald-600" : "from-[#7C3996] to-[#E8B94A]"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                {!isGridView && <span className="text-[10px] text-gray-400 font-medium">{t("time_limit", "Sisa Waktu")}</span>}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${!isUnlimitedTime && (daysLeft as number) <= 5 && (daysLeft as number) > 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-[#FBF8F3] text-gray-600 border border-gray-100"}`}>
                  {isUnlimitedTime ? (
                    <>
                      <Infinity size={12} className={theme.primaryText} />
                      <span className={theme.primaryText}>{t("unlimited_time", "Tanpa Batas")}</span>
                    </>
                  ) : (
                    <>
                      <Clock size={10} className={(daysLeft as number) <= 5 && (daysLeft as number) > 0 ? "text-red-500" : "text-gray-400"} />
                      {(daysLeft as number) > 0 ? `${daysLeft} ${t("days", "Hari")}` : t("has_ended", "Berakhir")}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-auto pt-2">
               <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-1.5">
                <Clock size={12} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 font-medium leading-tight">{t("under_review_desc", "Sedang ditinjau.")}</p>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}