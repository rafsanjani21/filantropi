"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, RefreshCw, AlertCircle } from "lucide-react";

type FccBalanceCardProps = {
  walletAddress: string;
};

export default function FccBalanceCard({ walletAddress }: FccBalanceCardProps) {
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🔥 UBAH: Sesuaikan nama variabel dengan yang ada di .env.local
  // Tambahkan || "" agar TypeScript tahu ini pasti string, bukan undefined
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""; 
  
  // URL Public RPC Polygon (Gratis, tidak butuh API Key)
  const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-rpc.com";

  const fetchBalance = async () => {
    // 🔥 UBAH: Jangan lanjut jika alamat wallet kosong ATAU alamat contract belum diset di .env
    if (!walletAddress || !CONTRACT_ADDRESS) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      // 1. Konek ke jaringan Polygon sebagai "Tamu" (Read-Only)
      const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);

      // 2. ABI minimal untuk membaca saldo ERC-20
      const minABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      // 3. Panggil Smart Contract Token FCC
      const contract = new ethers.Contract(CONTRACT_ADDRESS, minABI, provider);

      // 4. Ambil saldo mentah dan jumlah desimal token
      const rawBalance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();

      // 5. Format angka (contoh: dari 1000000000000000000 menjadi 1.0)
      const formattedBalance = ethers.formatUnits(rawBalance, decimals);
      
      // Bulatkan ke 2 angka di belakang koma untuk UI
      setBalance(parseFloat(formattedBalance).toFixed(2));
    } catch (err) {
      console.error("Gagal mengambil saldo dari blockchain:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  if (!walletAddress) return null;

  return (
    <div className="bg-linear-to-r from-purple-600 to-[#7C3996] rounded-3xl p-5 text-white shadow-lg shadow-purple-200 mt-5 w-full max-w-sm mx-auto relative overflow-hidden">
      {/* Efek Lingkaran Dekoratif */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-purple-100 opacity-90">
          <Wallet size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Saldo Dompet</span>
        </div>
        <button 
          onClick={fetchBalance} 
          disabled={loading}
          className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 active:scale-95 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="h-10 w-32 bg-white/20 animate-pulse rounded-lg"></div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-200 text-sm font-medium">
            <AlertCircle size={16} /> Gagal memuat saldo
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight">{balance}</span>
            <span className="text-lg font-bold text-purple-200">FCC</span>
          </div>
        )}
      </div>
    </div>
  );
}