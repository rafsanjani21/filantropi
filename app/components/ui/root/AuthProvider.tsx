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