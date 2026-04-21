"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NavbarLogin from "@/app/components/ui/login/navbar";
import { AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { handleLogin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const id_token = await result.user.getIdToken();

      try {
        await handleLogin(id_token);
        router.replace("/");
      } catch (err: any) {
        if (err.message.includes("user not found")) {
          sessionStorage.setItem("id_token", id_token);
          setMessage("Akun belum terdaftar. Silakan lengkapi profil.");
          
          setTimeout(() => {
            router.replace("/ProfilePage/UserPage");
          }, 1500);
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("Gagal login. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-lg mx-auto flex flex-col bg-linear-to-b from-[#E5AFE7] to-[#7C3996] shadow-2xl overflow-hidden">
      <NavbarLogin />

      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-12">
        {/* Kontainer Kartu Utama */}
        <div className="w-full bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl p-10 flex flex-col items-center border border-white/20">
          
          {/* Section Logo */}
          <div className="relative mb-8 group">
            <div className="absolute -inset-1 bg-purple-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <img
              src="/logo.png"
              alt="Logo"
              className="relative w-32 h-auto drop-shadow-md"
            />
          </div>

          {/* Header Text */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center justify-center gap-2">
              <ShieldCheck className="text-purple-600 w-6 h-6" /> Masuk Akun
            </h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              Akses cepat melalui jaringan aman Google
            </p>
          </div>

          {/* Notifikasi Message */}
          {message && (
            <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-6 text-sm animate-in fade-in zoom-in-95 duration-300 ${
              message.includes("Gagal") 
                ? "bg-red-50 text-red-600 border border-red-100" 
                : "bg-purple-50 text-purple-700 border border-purple-100"
            }`}>
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Tombol Google Premium */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 py-4 px-6 rounded-2xl font-bold text-gray-700 transition-all duration-300 
              hover:border-purple-500 
              hover:text-purple-700
              hover:shadow-[0_15px_30px_-10px_rgba(124,57,150,0.3)] 
              hover:-translate-y-1
              active:scale-95 
              disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <img
                  src="/google.png"
                  alt="Google"
                  className="w-6 h-6 transition-all duration-300 group-hover:scale-125 group-hover:rotate-[12deg]"
                />
                <span className="text-md">Lanjutkan dengan Google</span>
              </>
            )}
          </button>

          {/* Informasi Tambahan */}
          <div className="mt-10 pt-6 border-t border-gray-100 w-full text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
              Secure Cloud Authentication
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}