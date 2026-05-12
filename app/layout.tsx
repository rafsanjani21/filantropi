import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 👇 1. IMPORT PROVIDER I18N
import I18nProvider from "./I18nProvider"; 
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Filantropi",
  description: "Web kebaikan berbasis blockchain",
  // 🔥 Tambahkan ini agar sistem Next.js mengirim meta tag light mode
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // 🔥 Kunci paksa style root ke light
      style={{ colorScheme: "light" }}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster position="top-right" reverseOrder={false} />
        {/* 👇 2. BUNGKUS DENGAN PROVIDER AGAR BAHASA BERLAKU GLOBAL */}
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}