"use client";

import { Home, Heart, HandCoins, User, Lock, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function BottomNav() {
  const pathname = usePathname();
  const { getProfile } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState<"donor" | "beneficiary" | "guest" | null>(
    null,
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkUserRole = async () => {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (!token) {
        setRole("guest");
        return;
      }

      try {
        await getProfile();
        setRole("donor");
      } catch {
        try {
          await getProfile("beneficiary");
          setRole("beneficiary");
        } catch {
          setRole("guest");
        }
      }
    };

    checkUserRole();
  }, []);

  if (!mounted) return null;

  const isDonasiLocked = role === "beneficiary";
  const isGalangLocked = role === "donor" || role === "guest";

  const themeColor = "#7C3996";

  const menus = [
    {
      name: "Beranda",
      path: "/",
      icon: Home,
      isLocked: false,
    },
    {
      name: "Kampanye",
      path: "/AllProgramsPage",
      icon: Heart,
      isLocked: isDonasiLocked,
    },
    {
      name: "Galang",
      path: "/GalangPage",
      icon: HandCoins,
      isLocked: isGalangLocked,
    },
    {
      name: "Profil",
      path: "/ProfilePage",
      icon: User,
      isLocked: false,
      requiresAuth: true,
    },
  ];

  const activeIndex =
    menus.findIndex((m) => pathname === m.path) !== -1
      ? menus.findIndex((m) => pathname === m.path)
      : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-lg px-3 pb-3">
        <div className="relative h-[72px] rounded-[28px] bg-white shadow-[0_-8px_25px_rgba(0,0,0,0.12)]">
          {/* Floating Active Button */}
          <div
            className="absolute z-30 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white shadow-lg transition-all duration-500"
            style={{
              background: themeColor,
              left: `calc(${activeIndex * 25}% + 12.5%)`,
              transform: "translateX(-50%)",
              top: "-26px",
            }}
          >
            {(() => {
              const ActiveIcon = menus[activeIndex].icon;
              return (
                <ActiveIcon
                  size={24}
                  className="text-white"
                  strokeWidth={2.5}
                />
              );
            })()}
          </div>

          <div className="grid h-full grid-cols-4">
            {menus.map((menu, index) => {
              const Icon = menu.icon;
              const isActive = activeIndex === index;

              const targetPath =
                menu.requiresAuth && role === "guest"
                  ? "/LoginPage"
                  : menu.path;

              const handleClick = (e: React.MouseEvent) => {
                if (menu.isLocked) {
                  e.preventDefault();

                  // 1. Tentukan pesan berdasarkan menu (Tetap menggunakan bahasa yang sopan & profesional)
                  const message =
                    menu.name === "Kampanye"
                      ? t(
                          "lock_donate_beneficiary",
                          "Mohon maaf, fitur donasi hanya dapat diakses oleh akun Dermawan.",
                        )
                      : t(
                          "lock_galang_user",
                          "Mohon maaf, fitur penggalangan dana khusus diperuntukkan bagi Penerima Manfaat.",
                        );

                  toast.custom(
                    (t) => (
                      <div
                        className={`${
                          t.visible
                            ? "animate-in slide-in-from-top-5 fade-in"
                            : "animate-out fade-out slide-out-to-top-5"
                        } max-w-[90vw] sm:max-w-sm w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl flex items-start border border-gray-100 p-4 gap-3 pointer-events-auto duration-300`}
                      >
                        {/* Bagian Ikon */}
                        <div className="flex-shrink-0 pt-0.5">
                          <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                            <Lock
                              className="h-5 w-5 text-amber-500"
                              strokeWidth={2.5}
                            />
                          </div>
                        </div>

                        {/* Bagian Teks */}
                        <div className="flex-1 w-0">
                          <p className="text-[13px] font-bold text-gray-900 font-jakarta tracking-wide">
                            Akses Dibatasi
                          </p>
                          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                            {message}
                          </p>
                        </div>

                        
                        <div className="ml-2 flex flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                          <button
                            onClick={() => toast.dismiss(t.id)}
                            className="p-1 rounded-full bg-gray-50 hover:bg-gray-100 focus:outline-none transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ),
                    {
                      duration: 4000, // Hilang otomatis dalam 4 detik
                      position: "top-center", // Muncul dari atas
                    },
                  );
                }
              };

              return (
                <Link
                  key={menu.name}
                  href={menu.isLocked ? "#" : targetPath}
                  onClick={handleClick}
                  className="relative flex flex-col items-center justify-center"
                >
                  {/* Icon biasa */}
                  <div
                    className={`relative transition-all duration-300 ${
                      isActive
                        ? "opacity-0 scale-50"
                        : "opacity-100 scale-100 text-gray-400"
                    }`}
                  >
                    <Icon size={22} />

                    {menu.isLocked && (
                      <Lock className="absolute -right-2 -top-1 h-3 w-3 rounded-full bg-white p-[1px] text-gray-400" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`mt-2 text-[11px] transition-all duration-300 ${
                      isActive
                        ? "-translate-y-3 font-bold"
                        : "translate-y-0 font-medium text-gray-400"
                    }`}
                    style={{
                      color: isActive ? themeColor : undefined,
                    }}
                  >
                    {menu.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
