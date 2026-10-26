/**
 * components/providers/AuthProvider.tsx
 *
 * Fungsi   : Provider tipis yang memanggil checkAuth saat aplikasi dimuat, lalu menyinkronkan
 *            status login/logout antar tab lewat event storage.
 * Ekspor   : default AuthProvider
 * Dipakai  : app/layout.tsx
 * Catatan  : "use client"; status autentikasi berasal dari useAuthStore.
 */
"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoggingOut = useRef(false);

  useEffect(() => {
    // Mengecek token saat web pertama kali dibuka / setelah reload.
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ACCESS_TOKEN_KEY && event.key !== REFRESH_TOKEN_KEY) {
        return;
      }

      // Logout di tab lain: bersihkan sesi tab ini juga (sekali saja).
      if (event.newValue === null) {
        if (isLoggingOut.current) return;
        isLoggingOut.current = true;
        useAuthStore.getState().logout();
        window.location.replace("/login");
        return;
      }

      // Login baru di tab lain: pulihkan sesi di tab ini.
      if (event.key === ACCESS_TOKEN_KEY && !event.oldValue) {
        void checkAuth();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [checkAuth]);

  return <>{children}</>;
}
