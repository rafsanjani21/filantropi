import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-transparent pt-6 pb-4 relative flex items-center justify-center">
      <button className="absolute left-6 flex items-center">
        <Link href="/">
          <ArrowLeft className="text-white w-6 h-6 cursor-pointer" />
        </Link>
      </button>

      <img
        src="/filantropi.png"
        alt="Logo"
        width={100}
        height={40}
        className="w-40 h-16 object-contain"
      />
    </nav>
  );
}