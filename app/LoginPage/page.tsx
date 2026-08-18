"use client";

import "@/lib/i18n";
import { ArrowLeft, UserCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSelectRole = (role: string) => {
    sessionStorage.setItem("selected_role", role);
    router.push(`/LoginPage/Masuk?role=${role}`);
  };

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] shadow-2xl pb-32 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="kawung-profile" width="56" height="56" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
              <ellipse cx="14" cy="14" rx="12" ry="8" transform="rotate(45 14 14)" />
              <ellipse cx="42" cy="14" rx="12" ry="8" transform="rotate(-45 42 14)" />
              <ellipse cx="14" cy="42" rx="12" ry="8" transform="rotate(-45 14 42)" />
              <ellipse cx="42" cy="42" rx="12" ry="8" transform="rotate(45 42 42)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kawung-profile)" />
      </svg>

      <button
        onClick={() => router.push("/HomePage")}
        className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all cursor-pointer z-50 border border-white/30"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="w-full max-w-md flex flex-col mt-20 mx-auto px-6">
        <h1 className="text-3xl text-white font-bold mb-8 text-center drop-shadow-md">
          {t("choose_role")}
        </h1>

        <div className="relative flex justify-center items-center mb-12 mx-auto w-full group">
          <div className="absolute w-36 h-36 bg-white rounded-full blur-xl animate-pulse"></div>
          <img
            src="/logo.png"
            alt="Logo Filantropi"
            className="relative z-10 w-48 h-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.3)] group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300"
          />
        </div>

        {/* Tombol Penerima Manfaat */}
        <button
          onClick={() => handleSelectRole("penerima_manfaat")}
          className="relative z-10 group flex items-center w-full justify-between bg-white border-2 border-purple-500 p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50 hover:border-purple-600 active:bg-purple-100 active:scale-95 touch-manipulation mb-4 cursor-pointer select-none shadow-lg"
        >
          <div className="flex items-center gap-4 pointer-events-none">
            <div className="bg-purple-100 p-2.5 rounded-xl transition-colors group-hover:bg-purple-200">
              <UserCircle className="w-7 h-7 text-purple-600" />
            </div>
            <span className="font-bold text-lg text-purple-700">
              {t("beneficiary")}
            </span>
          </div>
        </button>

        {/* Tombol Pengguna Umum */}
        <button
          onClick={() => handleSelectRole("user")}
          className="relative z-10 group flex items-center w-full justify-between bg-white border-2 border-purple-500 p-4 rounded-2xl transition-all duration-200 hover:bg-purple-50 hover:border-purple-600 active:bg-purple-100 active:scale-95 touch-manipulation cursor-pointer select-none shadow-lg"
        >
          <div className="flex items-center gap-4 pointer-events-none">
            <div className="bg-purple-100 p-2.5 rounded-xl transition-colors group-hover:bg-purple-200">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <span className="font-bold text-lg text-purple-700">
              {t("general_user")}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}