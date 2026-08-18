import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth.service";

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

      localStorage.setItem("access_token", res.data.access_token || res.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token || res.refresh_token);
      sessionStorage.removeItem("selected_role");

      router.replace("/"); 

    } catch (err: any) {
      sessionStorage.setItem("id_token", id_token); 
      sessionStorage.setItem("temp_name", name); 
      
      if (fallbackRole && fallbackRole.toLowerCase().includes("penerima")) {
         router.replace("/ProfilePage/PagePenerima/Tipe"); 
      } else {
         router.replace("/ProfilePage/UserPage");
      }
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
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      sessionStorage.clear(); 
      window.location.href = "/LoginPage";
    }
  };

  const getProfile = async (type: "donor" | "beneficiary" = "donor") => {
    try {
      const res = await AuthService.getProfile(type);
      return res.data;
    } catch (err: any) {
      if (err.message.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("access_token");
        window.location.href = "/LoginPage";
      }
      throw err;
    }
  };

  const getInvestorProfile = async () => {
    try {
      const res = await AuthService.getInvestorProfile();
      return res.data; 
    } catch (err) {
      return null;
    }
  };

  const getInvestments = async () => {
    try {
      const res = await AuthService.getInvestments();
      return res.data;
    } catch (err: any) {
      console.error("Gagal mengambil data investasi:", err);
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
    getInvestorProfile,
    getInvestments,
  };
}