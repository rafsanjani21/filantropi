"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { apiFetch } from "@/lib/api";
// 🔥 1. Import usePathname dari Next.js
import { usePathname } from "next/navigation";

export default function GlobalLiveDonationBlink() {
  const pathname = usePathname(); // 🔥 2. Inisialisasi usePathname

  const [history, setHistory] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch data dari API
  useEffect(() => {
    // Jika BUKAN di beranda, tidak perlu repot-repot nge-fetch data
    if (pathname !== "/HomePage") return;

    const fetchGlobalHistory = async () => {
      try {
        const res = await apiFetch(`/campaigns/transactions`, {
          method: "GET",
        });
        const apiData = res?.data || [];

        if (Array.isArray(apiData)) {
          const mappedHistory = apiData.map((tx: any) => ({
            from_to: tx.sender_name || "Donatur",
            amount: String(tx.amount ?? 0),
          }));

          setHistory(mappedHistory);
        }
      } catch (err) {
        console.error("Gagal memuat donasi live global:", err);
      }
    };

    fetchGlobalHistory();
    const interval = setInterval(fetchGlobalHistory, 600000);

    return () => clearInterval(interval);
  }, [pathname]);

  const validHistory = history.filter((tx) => Number(tx.amount) > 0);

  // Logika Animasi
  useEffect(() => {
    if (validHistory.length === 0 || pathname !== "/HomePage") return;

    setIsVisible(true);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % validHistory.length);
    }, 4000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, validHistory.length, pathname]); // 🔥 Pantau perubahan URL

  // 🔥 3. KUNCI UTAMA: Jika URL saat ini bukan "/HomePage", JANGAN render (munculkan) apa pun
  if (pathname !== "/HomePage" || validHistory.length === 0) return null;

  const donation = validHistory[currentIndex];
  const donor = donation.from_to;
  const amount = Number(donation.amount).toLocaleString("id-ID");

  return (
    <div className="fixed top-5 left-1/2 z-[99999] w-full max-w-sm -translate-x-1/2 px-4 pointer-events-none">
      <div
        className={`transition-all duration-500 ease-in-out transform ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-10 opacity-0 scale-95"
        }`}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-2xl">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500" />

          <div className="flex items-center gap-3 p-4">
            <div className="relative shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
                <Heart className="h-5 w-5 fill-white text-white animate-pulse" />
              </div>
              <span className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-gray-900">
                    {donor}
                  </div>
                  <div className="text-xs text-gray-500">Berdonasi</div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                Nominal
              </div>
              <div className="text-base font-extrabold text-purple-700 whitespace-nowrap">
                Rp {amount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
