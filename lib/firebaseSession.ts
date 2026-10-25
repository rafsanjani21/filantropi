/**
 * lib/firebaseSession.ts
 *
 * Fungsi   : Mengatur persistensi Firebase Auth ke sesi tab dan menutup sesi Firebase dengan aman.
 * Ekspor   : ensureBrowserSessionPersistence, signOutFirebase
 * Dipakai  : app/(auth)/login/page.tsx, hooks/useAuth.ts, lib/api.ts
 * Catatan  : Firebase diimpor dinamis agar bundle halaman lain tidak bertambah.
 */

export async function ensureBrowserSessionPersistence() {
  try {
    const [{ browserSessionPersistence, setPersistence }, { auth }] =
      await Promise.all([import("firebase/auth"), import("@/lib/firebase")]);
    await setPersistence(auth, browserSessionPersistence);
  } catch {
    // Login tetap dapat dicoba walau persistensi gagal diatur.
  }
}

export async function signOutFirebase() {
  try {
    const [{ signOut }, { auth }] = await Promise.all([
      import("firebase/auth"),
      import("@/lib/firebase"),
    ]);
    await signOut(auth);
  } catch {
    // Firebase hanya dipakai untuk login Google; kegagalan signOut tidak fatal.
  }
}
