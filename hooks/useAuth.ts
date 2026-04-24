"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth.service";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // FUNGSI PINTAR: Mengatur alur Login & Pendaftaran User Baru
  const smartAuth = async (id_token: string, name: string, fallbackRole: string) => {
    try {
      setLoading(true);

      try {
        // ==========================================
        // 1. COBA LOGIN (UNTUK USER YANG SUDAH ADA)
        // ==========================================
        const res = await AuthService.login(id_token);
        
        // Jika berhasil login, simpan token
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);
        sessionStorage.removeItem("selected_role");

        // Langsung arahkan ke Halaman Utama (Home)
        router.replace("/"); 

      } catch (err: any) {
        // ==========================================
        // 2. JIKA GAGAL (USER BARU / BELUM TERDAFTAR)
        // ==========================================
        if (err.message.includes("user not found") || err.message.includes("belum terdaftar")) {
          
          if (fallbackRole === "penerima_manfaat") {
             // ---> PENERIMA MANFAAT BARU <---
             // Jangan langsung didaftarkan! Simpan tokennya saja
             sessionStorage.setItem("id_token", id_token); 
             
             // Arahkan ke halaman Pilih Tipe Organisasi/Individu
             // PASTIKAN FOLDER INI ADA. Jika tidak ada, ganti path ini menjadi "/ProfilePage/PagePenerima"
             router.replace("/ProfilePage/PagePenerima/Tipe"); 

          } else {
             // ---> PENGGUNA UMUM BARU <---
             // Boleh langsung didaftarkan karena tidak butuh NIK/NPWP
             const resReg = await AuthService.register({
               id_token,
               name,
               wallet_address: "", 
               role: "user",
             });
             
             localStorage.setItem("access_token", resReg.data.access_token);
             localStorage.setItem("refresh_token", resReg.data.refresh_token);
             sessionStorage.removeItem("selected_role");
             
             // Arahkan ke form profil umum agar dia bisa edit nama/wallet
             router.replace("/ProfilePage/UserPage");
          }

        } else {
          // Jika error karena hal lain (misal koneksi server mati)
          throw err;
        }
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
      sessionStorage.clear(); // Bersihkan semua memori browser
      window.location.href = "/LoginPage";
    }
  };

  // --- PERUBAHAN DI SINI ---
  // Tambahkan parameter type dengan nilai default "donor"
  const getProfile = async (type: "donor" | "beneficiary" = "donor") => {
    try {
      // Teruskan type ke AuthService
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

  const updateProfile = async (formData: FormData, role: string) => {
    try {
      setLoading(true);
      // Teruskan parameter role ke AuthService
      return await AuthService.updateProfile(formData, role);
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
  };
}