import Image from "next/image";
import { History, User } from "lucide-react"; // Ikon Bell diganti jadi History
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
        
        {/* Tombol Riwayat Donasi (History) */}
        <Link 
          href="/HistoryPage" 
          className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all active:scale-95 cursor-pointer"
        >
          <History className="w-5 h-5 text-white" />
        </Link>

        {/* Tombol Profil (User) */}
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