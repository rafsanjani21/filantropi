/**
 * store/useAuthStore.ts
 *
 * Fungsi   : Store Zustand untuk menyimpan user, role, status login, dan status inisialisasi autentikasi.
 * Ekspor   : useAuthStore
 * Dipakai  : hooks/useAuth.ts, hooks/useCampaignDetail.ts, components/providers/AuthProvider.tsx
 * Catatan  : checkAuth mencoba profil donor lalu beneficiary, menghapus token jika gagal, dan fallback
 *            ke guest; isInitialized mencegah UI berkedip.
 */
import { create } from "zustand";
import { AuthService } from "@/lib/auth.service";
import { clearTokens, getAccessToken, getRefreshToken } from "@/lib/authTokens";
import { signOutFirebase } from "@/lib/firebaseSession";
import type { UserProfile } from "@/types";

interface AuthState {
  user: UserProfile | null;
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
    const token = getAccessToken() || getRefreshToken();

    if (!token) {
      set({ user: null, role: "guest", isAuthenticated: false, isInitialized: true });
      return;
    }

    try {
      // Coba panggil sebagai donatur dulu
      const res = await AuthService.getProfile("donor");
      set({ user: res.data || res, role: "donor", isAuthenticated: true, isInitialized: true });
    } catch {
      try {
        // Jika gagal, coba sebagai penerima manfaat
        const res = await AuthService.getProfile("beneficiary");
        set({ user: res.data || res, role: "beneficiary", isAuthenticated: true, isInitialized: true });
      } catch {
        // Jika dua-duanya gagal (misal token tidak valid), jangan simpan sesi basi.
        clearTokens();
        void signOutFirebase();
        set({ user: null, role: "guest", isAuthenticated: false, isInitialized: true });
      }
    }
  },

  // Fungsi untuk logout dengan bersih
  logout: () => {
    clearTokens();
    void signOutFirebase();
    sessionStorage.clear();
    set({ user: null, role: "guest", isAuthenticated: false });
  }
}));