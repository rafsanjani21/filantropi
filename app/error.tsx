/**
 * app/error.tsx
 *
 * Fungsi   : UI error boundary segmen route app dengan tombol reset.
 * Ekspor   : default Error
 * Dipakai  : File khusus Next.js, dipakai otomatis oleh App Router.
 * Catatan  : "use client" wajib karena memakai prop reset dan onClick.
 */

"use client";

import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8F3] gap-3 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle size={28} className="text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-[#2A1B33]">Terjadi Kesalahan</h2>
      <p className="text-sm text-gray-500">
        {error.message || "Silakan coba lagi beberapa saat lagi."}
      </p>
      <button
        onClick={reset}
        className="mt-2 px-6 py-2.5 bg-[#7C3996] text-white text-sm font-bold rounded-full shadow-sm hover:bg-[#6B2E88] transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}
