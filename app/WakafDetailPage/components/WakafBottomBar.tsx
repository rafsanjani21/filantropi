"use client";

import { Share2, BookOpen } from "lucide-react";

export default function WakafBottomBar({ campaign, onWakafClick }: any) {
  const isUnlimitedTime = !campaign?.end_date;
  const daysLeft = isUnlimitedTime ? null : Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / 86400000));
  const isDonateDisabled = campaign?.status !== "active" || (!isUnlimitedTime && (daysLeft as number) <= 0);

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex gap-2.5 shadow-2xl overflow-visible">
      <button
        onClick={() => navigator.share && navigator.share({ url: window.location.href })}
        className="flex justify-center items-center p-3 border-2 border-emerald-600/15 text-emerald-600 rounded-xl w-14 shrink-0 hover:bg-emerald-50 transition-colors"
      >
        <Share2 size={20} />
      </button>

      <button
        onClick={onWakafClick}
        disabled={isDonateDisabled}
        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
      >
        <BookOpen size={20} className="text-emerald-100" /> 
        {campaign?.status !== "active" ? "Wakaf Ditutup" : "Tunaikan Wakaf"}
      </button>
    </div>
  );
}