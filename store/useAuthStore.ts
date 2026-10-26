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

function isAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /\b(401|403)\b/.test(message) || /unauthori[sz]ed|forbidden/i.test(message);
}

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
      const res = await AuthService.getProfile("donor", { keepSession: true });
      set({ user: res.data || res, role: "donor", isAuthenticated: true, isInitialized: true });
    } catch (donorError) {
      try {
        // Jika gagal, coba sebagai penerima manfaat
        const res = await AuthService.getProfile("beneficiary", { keepSession: true });
        set({ user: res.data || res, role: "beneficiary", isAuthenticated: true, isInitialized: true });
      } catch (beneficiaryError) {
        set({ user: null, role: "guest", isAuthenticated: false, isInitialized: true });

        // Hanya hapus sesi jika server benar-benar menolak token. Error jaringan/timeout
        // tidak boleh membuat pengguna logout dan kehilangan sesi saat reload.
        if (isAuthError(donorError) || isAuthError(beneficiaryError)) {
          clearTokens();
          void signOutFirebase();
        }
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