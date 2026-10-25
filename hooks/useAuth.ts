/**
 * hooks/useAuth.ts
 *
 * Fungsi   : Hook autentikasi Google (id_token) yang memilih redirect donor/penerima, plus logout dan operasi profil/kampanye.
 * Ekspor   : useAuth
 * Dipakai  : app/(auth)/login/page.tsx, app/(main)/page.tsx, app/(main)/profile/page.tsx, app/(main)/profile/user/page.tsx, app/(main)/profile/beneficiary/page.tsx, app/(main)/programs/new/page.tsx, app/(main)/programs/manage/page.tsx, components/layout/BottomNav.tsx
 * Catatan  : Menyimpan access token di memori dan refresh token di sessionStorage, memakai
 *            useAuthStore.checkAuth, dan fallback ke halaman pendaftaran jika user belum terdaftar.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth.service";
import { clearTokens, getRefreshToken, setTokens } from "@/lib/authTokens";
import { signOutFirebase } from "@/lib/firebaseSession";
import { useAuthStore } from "@/store/useAuthStore";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

    const smartAuth = async (id_token: string, name: string, fallbackRole: string) => {
    try {
      setLoading(true);

      const res = await AuthService.login(id_token);
      
      if (res && (res.error === true || res.message?.includes("not found") || res.message?.includes("tidak ditemukan"))) {
        throw new Error("User belum terdaftar");
      }

      const accessToken = res.data.access_token || res.access_token;
      const refreshToken = res.data.refresh_token || res.refresh_token;

      if (!accessToken) {
        throw new Error("Token akses tidak diterima");
      }

      setTokens(accessToken, refreshToken);
      sessionStorage.removeItem("selected_role");

      const rawRedirect = sessionStorage.getItem("redirect_after_login");
      const redirectPath =
        rawRedirect &&
        rawRedirect.startsWith("/") &&
        !rawRedirect.startsWith("//") &&
        !rawRedirect.startsWith("/\\")
          ? rawRedirect
          : "/";
      if (rawRedirect) {
        sessionStorage.setItem("auto_open_donate", "true");
        sessionStorage.removeItem("redirect_after_login");
      }
      await useAuthStore.getState().checkAuth();
      router.replace(redirectPath);
      router.refresh();

    } catch {
      sessionStorage.setItem("id_token", id_token); 
      sessionStorage.setItem("temp_name", name); 
      
      if (fallbackRole && fallbackRole.toLowerCase().includes("penerima")) {
         router.replace("/profile/beneficiary/type"); 
      } else {
         router.replace("/profile/user");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const refresh_token = getRefreshToken();
      if (refresh_token) {
        try {
          await AuthService.logout(refresh_token);
        } catch {
          console.warn("Logout API gagal (diabaikan)");
        }
      }
    } finally {
      clearTokens();
      await signOutFirebase();
      sessionStorage.clear();
      window.location.replace("/login");
    }
  };

  const getProfile = async (type: "donor" | "beneficiary" = "donor") => {
    try {
      const res = await AuthService.getProfile(type);
      return res.data;
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message.includes("401") ||
          err.message.toLowerCase().includes("unauthorized"))
      ) {
        clearTokens();
        void signOutFirebase();
        window.location.replace("/login");
      }
      throw err;
    }
  };


  const updateProfile = async (formData: FormData, role: string) => {
    try {
      setLoading(true);
      return await AuthService.updateProfile(formData, role);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (formData: FormData) => {
    try {
      setLoading(true);
      return await AuthService.createCampaign(formData);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    smartAuth,
    handleLogout,
    getProfile,
    updateProfile,
    createCampaign,
  };
}