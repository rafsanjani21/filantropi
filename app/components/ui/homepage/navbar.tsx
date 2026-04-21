import Image from "next/image";
import { Menu, Bell, User } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-transparent py-4 px-2">
      
      <div className="flex justify-center mb-4">
        <Image 
          src="/filantropi.png" 
          alt="Logo" 
          width={100}
          height={40}
          className="w-auto h-auto"
        />
      </div>

      <div className="flex justify-between items-center mx-4">
        
        <Menu className="text-white w-7 h-7 cursor-pointer" />

        <div></div>

        <div className="flex gap-4">
          <Bell className="text-white w-6 h-6 cursor-pointer" />
          <Link href="/ProfilePage">
            <User className="text-white w-6 h-6 cursor-pointer" />
          </Link>
        </div>
      </div>
    </header>
  );
}