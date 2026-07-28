export default function CampaignStory({ story }: { story: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 rounded-full bg-[#E8B94A]" />
        <h2 className="text-lg font-bold text-[#2A1B33]">Tujuan Penggalangan Dana</h2>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
        {story || "Belum ada cerita."}
      </div>
    </div>
  );
}