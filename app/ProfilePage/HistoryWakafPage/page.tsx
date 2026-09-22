"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";

import WakafCard, { WakafRecord } from "./components/WakafCard";
import LoadingSkeleton from "./components/LoadingSkeleton";
import EmptyState from "./components/EmptyState";

export default function HistoryWakafPage() {
  const router = useRouter();
  const [history, setHistory] = useState<WakafRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        
        if (!token) {
          setLoading(false);
          return;
        }

        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
        
        const response = await fetch(`${API_BASE}/user/profile/history`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          throw new Error(result.message || "Gagal mengambil data riwayat");
        }

        const formattedData: WakafRecord[] = result.data
          .filter((item: any) => 
            item.transaction_code && 
            (item.transaction_code.includes("fw") || item.transaction_code.includes("WKF"))
          )
          .map((item: any) => {
            
            // Format Tanggal
            const dateObj = new Date(item.created_at);
            const formattedDate = dateObj.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });


            return {
              id: item.transaction_code !== "-" ? item.transaction_code : item.id.substring(0, 8).toUpperCase(),
              campaign_title: item.campaign_name,
              amount: item.amount,
              date: formattedDate,
              status: item.status || "Diproses",
              contact_number: item.contact_number || "-",
            };
          });

        setHistory(formattedData);
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 pb-12">
      {/* HEADER */}
      <div className="bg-emerald-700 px-6 pt-8 pb-6 flex items-center gap-4 sticky top-0 z-50 text-white shadow-md rounded-b-[2rem]">
        <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="kawung-profile" width="56" height="56" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
              <ellipse cx="14" cy="14" rx="12" ry="8" transform="rotate(45 14 14)" />
              <ellipse cx="42" cy="14" rx="12" ry="8" transform="rotate(-45 42 14)" />
              <ellipse cx="14" cy="42" rx="12" ry="8" transform="rotate(-45 14 42)" />
              <ellipse cx="42" cy="42" rx="12" ry="8" transform="rotate(45 42 42)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kawung-profile)" />
      </svg>
        <button
          onClick={() => router.back()}
          className="hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Riwayat Wakaf</h1>
          <p className="text-xs text-emerald-100 mt-0.5 font-medium">Catatan amal jariyah Anda</p>
        </div>
      </div>

      <div className="px-5 pt-6 flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-4 px-1 flex items-center gap-2">
            <Receipt size={18} className="text-emerald-600" /> Daftar Transaksi
          </h3>

          {loading ? (
            <LoadingSkeleton />
          ) : history.length === 0 ? (
            <EmptyState onAction={() => router.push('/AllProgramsPage?type=wakaf')} />
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <WakafCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}