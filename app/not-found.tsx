import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8F3] gap-3 px-6 text-center">
      <p className="text-7xl font-black text-[#7C3996]">404</p>
      <h2 className="text-xl font-bold text-[#2A1B33]">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-gray-500">
        Halaman yang Anda cari sudah dipindahkan atau tidak tersedia.
      </p>
      <Link
        href="/"
        className="mt-2 px-6 py-2.5 bg-[#7C3996] text-white text-sm font-bold rounded-full shadow-sm hover:bg-[#6B2E88] transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
