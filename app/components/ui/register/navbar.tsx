import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NavbarRegister() {
  return (
    <nav className="w-full bg-transparent pt-6 pb-4 relative flex items-center justify-center">
      <button className="absolute left-6 flex items-center">
        <Link href="/LoginPage">
          <ArrowLeft className="text-white w-6 h-6 cursor-pointer" />
        </Link>
      </button>

      <p className="text-2xl text-white font-bold mb-6 text-center mt-6">Daftar</p>
    </nav>
  );
}