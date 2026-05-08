"use client";

import "@/lib/i18n"; // Proteksi i18n
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next"; // Import Hook Terjemahan

export default function PilihTipePenerima() {
  const router = useRouter();
  const { t } = useTranslation(); // Panggil fungsi t
  
  // State untuk menyimpan pilihan ('perorangan' atau 'organisasi')
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLanjutkan = () => {
    if (!selectedType) return;
    
    setLoading(true);

    // Simpan pilihan ke sessionStorage agar bisa dibaca di halaman Edit Profil nanti
    sessionStorage.setItem("tipe_penerima", selectedType);

    // Simulasi loading sebentar agar transisi terasa mulus
    setTimeout(() => {
      // Arahkan ke halaman pengisian form profil penerima
      router.push("/ProfilePage/PagePenerima");
    }, 800);
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#b359d4] shadow-2xl overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 mt-10">
        
        <div className="w-full max-w-md text-center mb-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            {t("who_you_represent")}
          </h1>
          <p className="text-purple-100 text-sm px-4">
            {t("choose_account_type")}
          </p>
        </div>

        <div className="w-full space-y-4">
          
          {/* PERORANGAN */}
          <button
            onClick={() => setSelectedType("perorangan")}
            className={`w-full group relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer text-left
              ${
                selectedType === "perorangan"
                  ? "bg-white border-purple-500 shadow-[0_10px_25px_-5px_rgba(124,57,150,0.4)] scale-[1.02]"
                  : "bg-white/90 border-transparent hover:bg-white hover:scale-[1.01]"
              }
            `}
          >
            <div className="flex w-full items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl transition-colors duration-300 ${selectedType === "perorangan" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-500"}`}>
                <User size={28} />
              </div>
              {selectedType === "perorangan" && (
                <CheckCircle2 size={24} className="text-purple-600 animate-in zoom-in" />
              )}
            </div>
            <h3 className={`text-xl font-bold mb-1 ${selectedType === "perorangan" ? "text-purple-800" : "text-gray-800"}`}>
              {t("individual")}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              {t("individual_desc")}
            </p>
          </button>

          {/* ORGANISASI */}
          <button
            onClick={() => setSelectedType("organisasi")}
            className={`w-full group relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer text-left
              ${
                selectedType === "organisasi"
                  ? "bg-white border-purple-500 shadow-[0_10px_25px_-5px_rgba(124,57,150,0.4)] scale-[1.02]"
                  : "bg-white/90 border-transparent hover:bg-white hover:scale-[1.01]"
              }
            `}
          >
            <div className="flex w-full items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl transition-colors duration-300 ${selectedType === "organisasi" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"}`}>
                <Building2 size={28} />
              </div>
              {selectedType === "organisasi" && (
                <CheckCircle2 size={24} className="text-blue-600 animate-in zoom-in" />
              )}
            </div>
            <h3 className={`text-xl font-bold mb-1 ${selectedType === "organisasi" ? "text-purple-800" : "text-gray-800"}`}>
              {t("organization")}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              {t("organization_desc")}
            </p>
          </button>

        </div>

        <div className="w-full mt-10">
          <button
            onClick={handleLanjutkan}
            disabled={!selectedType || loading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all duration-300
              ${
                selectedType
                  ? "bg-white text-purple-700 hover:bg-purple-50 hover:shadow-xl active:scale-95 cursor-pointer"
                  : "bg-white/30 text-white/50 cursor-not-allowed"
              }
            `}
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {t("continue_next")}
                <ArrowRight size={20} className={selectedType ? "text-purple-500" : "opacity-50"} />
              </>
            )}
          </button>
        </div>

      </main>
    </div>
  );
}