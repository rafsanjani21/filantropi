import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type AuthNavbarProps = {
  title: string;
  backHref: string;
};

export default function AuthNavbar({ title, backHref }: AuthNavbarProps) {
  return (
    <nav className="w-full bg-transparent pt-6 pb-4 relative flex items-center justify-center">
      <Link href={backHref} className="absolute left-6 flex items-center">
        <ArrowLeft className="text-white w-6 h-6 cursor-pointer" />
      </Link>

      <p className="text-2xl text-white font-bold mb-6 text-center mt-6">
        {title}
      </p>
    </nav>
  );
}
