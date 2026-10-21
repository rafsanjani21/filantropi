/**
 * components/layout/AuthProvider.tsx
 *
 * Fungsi   : Provider tipis yang memanggil checkAuth sekali saat aplikasi pertama dimuat, lalu merender children.
 * Ekspor   : default AuthProvider
 * Dipakai  : app/layout.tsx
 * Catatan  : "use client"; status autentikasi berasal dari useAuthStore.
 */
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Mengecek token HANYA SEKALI saat web pertama kali dibuka
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}