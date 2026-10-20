import { Share2, Heart } from "lucide-react";

export default function BottomActionBar({ campaign, isCampaignOwner, onDonate, onDisburse, onReport }: any) {
  const isUnlimitedTime = !campaign?.end_date;
  const daysLeft = isUnlimitedTime ? null : Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000));
  const isDonateDisabled = campaign?.status !== "active" || (!isUnlimitedTime && (daysLeft as number) <= 0);

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex gap-2.5 shadow-2xl overflow-visible">
      <button
        onClick={() => navigator.share && navigator.share({ url: window.location.href })}
        className="flex justify-center items-center p-3 border-2 border-[#7C3996]/15 text-[#7C3996] rounded-xl w-14 shrink-0 hover:bg-[#7C3996]/5 transition-colors"
      >
        <Share2 size={20} />
      </button>

      {isCampaignOwner ? (
        <>
          <button onClick={onDisburse} className="flex-1 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors">
            Cairkan
          </button>
          <button onClick={onReport} className="flex-1 border-2 border-[#7C3996] text-[#7C3996] rounded-xl font-bold hover:bg-[#7C3996]/5 transition-colors">
            Laporan
          </button>
        </>
      ) : (
        <button
          onClick={onDonate}
          disabled={isDonateDisabled}
          className="flex-1 bg-gradient-to-r from-[#7C3996] to-[#5B2A73] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
        >
          <Heart size={20} className="text-[#E8B94A]" /> 
          {campaign?.status !== "active" ? "Belum Aktif" : "Donasi Sekarang"}
        </button>
      )}
    </div>
  );
}