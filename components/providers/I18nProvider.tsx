"use client";

import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n"; 

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Baca bahasa yang tersimpan di browser saat web pertama dimuat
    const savedLang = localStorage.getItem("app_lang");
    
    // 2. Jika ada bahasa tersimpan yang berbeda, langsung terapkan
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
    
    // 3. Tandai bahwa web sudah siap ditampilkan
    setMounted(true);
  }, []);

  // Cegah error "Hydration Mismatch" (Server vs Client) dari Next.js
  if (!mounted) {
    return null; // Halaman ditahan sejenak sampai bahasa yang benar diterapkan
  }

  // Jika sudah siap, bungkus aplikasi dengan I18nextProvider bawaan Anda
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}