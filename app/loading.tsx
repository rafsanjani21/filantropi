/**
 * app/loading.tsx
 *
 * Fungsi   : UI loading fallback global berupa spinner.
 * Ekspor   : default Loading
 * Dipakai  : File khusus Next.js, tampil otomatis saat route memuat.
 */

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3]">
      <div className="relative w-11 h-11">
        <div className="absolute inset-0 border-[3px] border-[#7C3996]/15 rounded-full" />
        <div className="absolute inset-0 border-[3px] border-transparent border-t-[#7C3996] rounded-full animate-spin" />
      </div>
    </div>
  );
}
