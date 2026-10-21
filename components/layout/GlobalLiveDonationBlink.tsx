/**
 * components/layout/GlobalLiveDonationBlink.tsx
 *
 * Fungsi   : Menampilkan notifikasi donasi terbaru secara bergilir, hanya di beranda.
 * Ekspor   : default GlobalLiveDonationBlink
 * Dipakai  : app/layout.tsx
 * Catatan  : "use client"; fetch via AuthService/apiFetch setelah idle, refresh 10 menit; timer animasi dibersihkan.
 */
"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { AuthService } from "@/lib/auth.service";
//  1. Import usePathname dari Next.js
import { usePathname } from "next/navigation";

type CampaignTx = {
  sender_name?: string;
  amount?: string | number;
  mutation_date?: string;
};

type LiveDonation = {
  from_to: string;
  amount: string;
  date: string;
};

const MAX_CAMPAIGNS = 5;
const MAX_DONATIONS = 10;

export default function GlobalLiveDonationBlink() {
  const pathname = usePathname(); // 2. Inisialisasi usePathname

  const [history, setHistory] = useState<LiveDonation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch data dari API
  useEffect(() => {
    // Jika BUKAN di beranda, tidak perlu repot-repot nge-fetch data
    if (pathname !== "/") return;

    const fetchGlobalHistory = async () => {
      try {
        // Endpoint ringkasan global (/campaigns/transactions) selalu kosong,
        // jadi ambil donasi terbaru dari beberapa campaign aktif.
        const campaignsRes = await AuthService.getCampaigns();
        const campaigns = Array.isArray(campaignsRes?.data)
          ? campaignsRes.data
          : Array.isArray(campaignsRes)
            ? campaignsRes
            : [];

        const activeIds: string[] = campaigns
          .filter(
            (campaign: { id?: string; status?: string }) =>
              campaign?.id && campaign.status === "active",
          )
          .slice(0, MAX_CAMPAIGNS)
          .map((campaign: { id: string }) => campaign.id);

        const responses = await Promise.allSettled(
          activeIds.map((id) =>
            apiFetch(`/campaigns/transactions/latest/${id}`, { method: "GET" }),
          ),
        );

        const merged: LiveDonation[] = [];

        for (const response of responses) {
          if (response.status !== "fulfilled") continue;

          const list = response.value?.data;
          if (!Array.isArray(list)) continue;

          for (const tx of list as CampaignTx[]) {
            merged.push({
              from_to: tx.sender_name?.trim() || "Donatur",
              amount: String(tx.amount ?? 0),
              date: tx.mutation_date ?? "",
            });
          }
        }

        const seen = new Set<string>();
        const latest = merged
          .filter((tx) => Number(tx.amount) > 0)
          .sort(
            (a, b) =>
              new Date(b.date.replace(" ", "T")).getTime() -
              new Date(a.date.replace(" ", "T")).getTime(),
          )
          .filter((tx) => {
            const key = `${tx.from_to}|${tx.amount}|${tx.date}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, MAX_DONATIONS);

        setHistory(latest);
      } catch (err) {
        console.error("Gagal memuat donasi live global:", err);
      }
    };

    // Tunda fetch agar tidak berebut bandwidth/main thread dengan LCP
    let interval: ReturnType<typeof setInterval> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    const start = () => {
      fetchGlobalHistory();
      interval = setInterval(fetchGlobalHistory, 600000);
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(start, { timeout: 4000 });
    } else {
      timeout = setTimeout(start, 2500);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeout) clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [pathname]);

  const validHistory = history.filter((tx) => Number(tx.amount) > 0);

  // Logika Animasi
  useEffect(() => {
    if (validHistory.length === 0 || pathname !== "/") return;

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
  }, [currentIndex, validHistory.length, pathname]); 

  //  3. KUNCI UTAMA: Jika URL saat ini bukan "/", JANGAN render (munculkan) apa pun
  if (pathname !== "/" || validHistory.length === 0) return null;

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
