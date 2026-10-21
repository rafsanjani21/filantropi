/**
 * components/providers/I18nProvider.tsx
 *
 * Fungsi   : Membungkus aplikasi dengan I18nextProvider (single-locale bahasa Indonesia).
 * Ekspor   : default I18nProvider
 * Dipakai  : app/layout.tsx
 * Catatan  : "use client"; tidak ada pemulihan bahasa dari localStorage karena hanya "id".
 */
"use client";

import { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

export default function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
