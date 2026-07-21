import type { Metadata } from "next";
// 🔥 1. Tambahkan Rubik di dalam import
import { Inter, Plus_Jakarta_Sans, Rubik } from "next/font/google"; 
import "./globals.css";
import I18nProvider from "./I18nProvider"; 
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", 
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

// 🔥 2. Inisialisasi font Rubik
const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "Filantropi",
  description: "Web kebaikan berbasis blockchain",
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
      style={{ colorScheme: "light" }}
      // 🔥 3. Tambahkan rubik.variable ke dalam class HTML
      className={`${inter.variable} ${jakarta.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className={`${rubik.className} min-h-full flex flex-col`}>
        <Toaster position="top-right" reverseOrder={false} />
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}