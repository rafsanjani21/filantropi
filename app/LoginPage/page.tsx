"use client";

import { ArrowRight, UserCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSelectRole = (role: string) => {
    // Simpan pilihan ke browser secara sementara
    sessionStorage.setItem("selected_role", role);
    // Arahkan ke halaman tombol Google
    router.push("/LoginPage/Masuk");
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#FFFFFF] to-[#E5AFE7] items-center overflow-x-hidden relative">
      <div className="w-full max-w-md flex flex-col mt-20 mx-auto px-6">
        <h1 className="text-3xl text-purple-700 font-bold mb-6 text-center">
          Pilih Peran Akun
        </h1>

        <img
          src="/logo.png"
          alt="Login Illustration"
          className="w-55.25 h-auto mb-10 mx-auto"
        />

        {/* Tombol Penerima Manfaat */}
        <button
          onClick={() => handleSelectRole("penerima_manfaat")}
          className="relative z-10 group flex items-center w-full justify-between bg-white border-2 border-purple-500 p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50 hover:border-purple-600 active:bg-purple-100 active:scale-95 touch-manipulation mb-4 cursor-pointer select-none"
        >
          <div className="flex items-center gap-4 pointer-events-none">
            <div className="bg-purple-100 p-2.5 rounded-xl transition-colors">
              <UserCircle className="w-7 h-7 text-purple-600" />
            </div>
            <span className="font-bold text-lg text-purple-700">
              Penerima Manfaat
            </span>
          </div>
          <ArrowRight className="w-6 h-6 text-purple-400 pointer-events-none" />
        </button>

        {/* Tombol Pengguna Umum */}
        <button
          onClick={() => handleSelectRole("user")}
          className="relative z-10 group flex items-center w-full justify-between bg-white border-2 border-purple-500 p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50 hover:border-purple-600 active:bg-purple-100 active:scale-95 touch-manipulation cursor-pointer select-none"
        >
          <div className="flex items-center gap-4 pointer-events-none">
            <div className="bg-purple-100 p-2.5 rounded-xl transition-colors">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <span className="font-bold text-lg text-purple-700">
              Pengguna Umum
            </span>
          </div>
          <ArrowRight className="w-6 h-6 text-purple-400 pointer-events-none" />
        </button>
      </div>
    </div>
  );
}