import { create } from "zustand";
import { AuthService } from "@/lib/auth.service";

interface AuthState {
  user: any | null;
  role: "donor" | "beneficiary" | "guest" | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Mencegah UI berkedip saat pertama kali load
  checkAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isInitialized: false,

  // Fungsi ini menggantikan logika try-catch berulang di BottomNav
  checkAuth: async () => {
    const token = typeof window !== "undefined" 
      ? (localStorage.getItem("access_token") || sessionStorage.getItem("access_token")) 
      : null;

    if (!token) {
      set({ user: null, role: "guest", isAuthenticated: false, isInitialized: true });
      return;
    }

    try {
      // Coba panggil sebagai donatur dulu
      const res = await AuthService.getProfile("donor");
      set({ user: res.data || res, role: "donor", isAuthenticated: true, isInitialized: true });
    } catch (error) {
      try {
        // Jika gagal, coba sebagai penerima manfaat
        const res = await AuthService.getProfile("beneficiary");
        set({ user: res.data || res, role: "beneficiary", isAuthenticated: true, isInitialized: true });
      } catch (error2) {
        // Jika dua-duanya gagal (misal token tidak valid)
        set({ user: null, role: "guest", isAuthenticated: false, isInitialized: true });
      }
    }
  },

  // Fungsi untuk logout dengan bersih
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.clear();
    set({ user: null, role: "guest", isAuthenticated: false });
  }
}));