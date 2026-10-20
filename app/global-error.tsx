"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8F3] gap-3 px-6 text-center">
          <h2 className="text-xl font-bold text-[#2A1B33]">
            Terjadi Kesalahan
          </h2>
          <p className="text-sm text-gray-500">
            {error.message || "Silakan muat ulang halaman."}
          </p>
          <button
            onClick={reset}
            className="mt-2 px-6 py-2.5 bg-[#7C3996] text-white text-sm font-bold rounded-full shadow-sm hover:bg-[#6B2E88] transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </body>
    </html>
  );
}
