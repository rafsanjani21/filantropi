"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth.service";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (id_token: string) => {
    try {
      setLoading(true);

      const res = await AuthService.login(id_token);

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (
    id_token: string,
    name: string,
    wallet_address: string
  ) => {
    try {
      setLoading(true);

      const res = await AuthService.register({
        id_token,
        name,
        wallet_address,
      });

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
  try {
    setLoading(true);

    const refresh_token = localStorage.getItem("refresh_token");

    if (refresh_token) {
      try {
        await AuthService.logout(refresh_token);
      } catch (err) {
        console.warn("Logout API gagal (diabaikan)");
      }
    }
  } finally {
    // 🔥 WAJIB clear semua
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("id_token");

    window.location.href = "/LoginPage/Masuk";
  }
};

  const getProfile = async () => {
    try {
      const res = await AuthService.getProfile();
      return res.data;
    } catch (err: any) {
      if (err.message.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("access_token");
        window.location.href = "/LoginPage/Masuk";
      }
      throw err;
    }
  };

  const updateProfile = async (formData: FormData) => {
    try {
      setLoading(true);
      return await AuthService.updateProfile(formData);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
    getProfile,
    updateProfile,
  };
}