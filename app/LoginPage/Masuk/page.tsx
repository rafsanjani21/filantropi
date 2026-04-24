"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, ShieldCheck } from "lucide-react";
import NavbarLogin from "@/app/components/ui/login/navbar";

export default function MasukPage() {
  const { smartAuth, loading } = useAuth();
  const [message, setMessage] = useState("");

  const handleGoogleAuth = async () => {
    setMessage("");

    try {
      const result = await signInWithPopup(auth, provider);
      const id_token = await result.user.getIdToken();
      const name = result.user.displayName || "User";
      
      // Ambil role yang dipilih di halaman sebelumnya.
      const fallbackRole = sessionStorage.getItem("selected_role") || "user";

      try {
        // Jalankan fungsi auth otomatis
        await smartAuth(id_token, name, fallbackRole);
      } catch (err: any) {
        setMessage(err.message || "Gagal memproses autentikasi. Coba lagi nanti.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Autentikasi Google dibatalkan atau gagal.");
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#E5AFE7] to-[#7C3996] shadow-2xl overflow-hidden">
      <NavbarLogin />

      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-12 mt-10">
        <div className="w-full bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl p-10 flex flex-col items-center border border-white/20">
          
          <div className="relative mb-8 group">
            <img src="/logo.png" alt="Logo" className="relative w-32 h-auto drop-shadow-md" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center justify-center gap-2">
              <ShieldCheck className="text-purple-600 w-6 h-6" /> Autentikasi
            </h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              Satu langkah lagi untuk masuk ke akun Anda
            </p>
          </div>

          {message && (
            <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-6 text-sm bg-red-50 text-red-600 border border-red-100">
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-medium">{message}</span>
            </div>
          )}

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="group relative w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 py-4 px-6 rounded-2xl font-bold text-gray-700 transition-all duration-300 hover:border-purple-500 hover:text-purple-700 hover:-translate-y-1 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <img src="/google.png" alt="Google" className="w-6 h-6" />
                <span className="text-md">Lanjutkan dengan Google</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}