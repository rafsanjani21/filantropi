/**
 * components/layout/navbar/LogoNavbar.tsx
 *
 * Fungsi   : Navbar dengan logo Filantropi yang menaut ke beranda dan tombol kembali opsional.
 * Ekspor   : default LogoNavbar
 * Dipakai  : app/(main)/page.tsx, app/(main)/profile/page.tsx, app/(main)/profile/user/page.tsx, app/(main)/profile/beneficiary/page.tsx
 * Catatan  : Tombol kembali hanya tampil jika prop backHref diisi.
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type LogoNavbarProps = {
  backHref?: string;
};

export default function LogoNavbar({ backHref }: LogoNavbarProps) {
  return (
    <nav className="w-full bg-transparent px-6 py-4 relative flex items-center justify-center">
      {backHref && (
        <Link href={backHref} className="absolute left-6 flex items-center">
          <ArrowLeft className="text-white w-6 h-6 cursor-pointer" />
        </Link>
      )}

      <Link href="/" className="active:scale-95 transition-transform">
        <Image
          src="/filantropi.png"
          alt="Logo Filantropi"
          width={120}
          height={40}
          priority
          className="w-auto h-10 object-contain"
        />
      </Link>
    </nav>
  );
}
