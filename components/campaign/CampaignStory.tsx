/**
 * components/campaign/CampaignStory.tsx
 *
 * Fungsi   : Merender cerita/tujuan penggalangan dana dengan format baris baru dipertahankan.
 * Ekspor   : default CampaignStory
 * Dipakai  : app/(main)/wakaf/[slug]/page.tsx, app/(main)/programs/[slug]/page.tsx
 * Catatan  : Menampilkan "Belum ada cerita." bila story kosong.
 */
export default function CampaignStory({ story }: { story?: string | null }) {
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