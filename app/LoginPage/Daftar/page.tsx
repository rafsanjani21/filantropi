"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import NavbarRegister from "@/app/components/ui/register/navbar";

export default function RegisterPage() {
  const { handleRegister } = useAuth();
  const router = useRouter();

  const [message, setMessage] = useState("");

  const handleGoogleRegister = async () => {
    setMessage("");

    try {
      const result = await signInWithPopup(auth, provider);

      const id_token = await result.user.getIdToken();
      const name = result.user.displayName || "User";

      try {
        await handleRegister(id_token, name, "0x123");
      } catch (err: any) {
        if (err.message.includes("email already exists")) {
          setMessage("Akun sudah ada, silakan login");

          setTimeout(() => {
            router.push("/LoginPage/Masuk");
          }, 1500);
        } else {
          setMessage(err.message);
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("Register gagal, coba lagi");
    }
  };

  return (
    <div className="min-h-screen w-lg mx-auto flex flex-col bg-linear-to-b from-[#E5AFE7] to-[#7C3996]  items-center">
      <NavbarRegister />

      {message && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4">
          {message}
        </div>
      )}
      
      <img
        src="/logo.png"
        alt="Login Illustration"
        className="w-[221px] h-auto mb-6 justify-center items-center mx-auto"
      />
      <button
        onClick={handleGoogleRegister}
        className="bg-gray-100 border border-gray-400 rounded-lg mt-6 mb-4 py-3 px-4 shadow-md flex justify-center items-center text-center w-1/2 mx-auto cursor-pointer hover:border-purple-500 text-sm"
      >
        <img
          src="/google.png"
          alt="Google Logo"
          className="w-6 h-auto mr-2 text-black"
        />
        Continue with Google
      </button>

      <p className="text-center text-sm">
        Sudah punya akun?{" "}
        <a
          href="/LoginPage/Masuk"
          className="text-purple-800 font-semibold hover:underline"
        >
          Masuk
        </a>
      </p>
    </div>
  );
}
