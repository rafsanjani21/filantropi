/**
 * app/layout.tsx
 *
 * Fungsi   : Root layout: metadata, font, provider Auth/I18n/Toaster, dan komponen global.
 * Ekspor   : metadata, viewport, default RootLayout
 * Dipakai  : File khusus Next.js, membungkus seluruh route di app/.
 * Catatan  : Server component; connection() membuat semua route dynamic agar nonce CSP dari proxy.ts tersedia.
 */

import type { Metadata } from "next";
import { connection } from "next/server";
import { preconnect } from "react-dom";
import { Plus_Jakarta_Sans, Rubik } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/providers/I18nProvider";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import GlobalLiveDonationBlink from "@/components/layout/GlobalLiveDonationBlink";
import SessionModal from "@/components/layout/SessionModal";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "Filantropi",
  description: "Website donasi dan wakaf untuk berbagai program sosial dan kemanusiaan.",
};

export const viewport = {
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  const assetOrigins = [
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ].filter(Boolean) as string[];

  for (const origin of new Set(assetOrigins.map((url) => new URL(url).origin))) {
    preconnect(origin);
  }

  return (
    <html lang="id" style={{ colorScheme: "light" }} className={`${jakarta.variable} ${rubik.variable} h-full antialiased`}>
      <body className={`${rubik.className} min-h-full flex flex-col`}>
        <Toaster position="top-right" reverseOrder={false} />
        <AuthProvider>
          <I18nProvider>
            <GlobalLiveDonationBlink />
            {children}
            <WhatsAppButton />
          </I18nProvider>
        </AuthProvider>
        <SessionModal />
      </body>
    </html>
  );
}