/**
 * app/(main)/berita/[slug]/page.tsx
 *
 * Fungsi   : Halaman detail berita; menampilkan judul dari slug dan placeholder konten.
 * Ekspor   : default BeritaDetailPage (async)
 * Dipakai  : Route /berita/[slug]; tautan kembali ke /berita
 * Catatan  : Server Component; parameter slug di-decode sebagai judul sementara
 */

import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = decodeURIComponent(slug).replace(/-/g, " ");

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[#FBF8F3] pb-12">
      <div className="bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] text-white px-6 pt-8 pb-10 rounded-b-[2.5rem] shadow-md">
        <Link
          href="/berita"
          className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="mt-6 text-xl font-bold capitalize leading-snug">
          {title}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center mt-16">
        <div className="w-24 h-24 rounded-full bg-[#7C3996]/10 flex items-center justify-center mb-5 text-[#7C3996]">
          <Newspaper size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-[#2A1B33] font-bold text-lg mb-2">
          Detail Berita
        </h2>
        <p className="text-slate-500 text-[13px] leading-relaxed max-w-[280px]">
          Detail berita ini akan tampil setelah data berita tersedia dari
          layanan konten.
        </p>
        <Link
          href="/berita"
          className="mt-5 px-6 py-2.5 bg-[#7C3996] text-white text-sm font-bold rounded-full shadow-sm hover:bg-[#6B2E88] transition-colors"
        >
          Kembali ke Berita
        </Link>
      </div>
    </div>
  );
}
