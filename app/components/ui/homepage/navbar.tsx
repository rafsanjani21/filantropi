import Image from "next/image";
import { Bell, User } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full bg-transparent px-6 py-4 flex items-center justify-between">
      {/* Logo (Kiri) */}
      <Link href="/" className="active:scale-95 transition-transform">
        <Image
          src="/filantropi.png"
          alt="Logo Filantropi"
          width={120}
          height={40}
          priority
          className="w-auto h-8 object-contain"
        />
      </Link>

      {/* Ikon (Kanan) */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all active:scale-95 cursor-pointer">
          <Bell className="w-5 h-5 text-white" />

          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-purple-800"></span>
        </button>

        <Link
          href="/ProfilePage"
          className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all active:scale-95 cursor-pointer"
        >
          <User className="w-5 h-5 text-white" />
        </Link>
      </div>
    </header>
  );
}
