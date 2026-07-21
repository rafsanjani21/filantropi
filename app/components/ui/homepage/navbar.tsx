import Image from "next/image";
import { History } from "lucide-react"; 
import Link from "next/link";

type NavbarProps = {
  isLoggedIn?: boolean;
};

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
  return (
    <header className="w-full bg-transparent px-6 py-4 flex items-center justify-center z-50">
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
    </header>
  );
}