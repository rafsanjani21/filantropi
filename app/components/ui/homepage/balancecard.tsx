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

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""; 

  const fetchBalance = async () => {
    if (!walletAddress || !CONTRACT_ADDRESS) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      // 🔥 LOGIKA BARU: Fallback Multi-RPC agar kebal dari error CORS
      const rpcUrls = [
        process.env.NEXT_PUBLIC_RPC_URL,
        "https://polygon.rpc.thirdweb.com",
        "https://polygon-bor-rpc.publicnode.com",
        "https://rpc-mainnet.maticvigil.com"
      ].filter(Boolean) as string[];

      const minABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      let rawBalance;
      let decimals;

      // Coba satu per satu sampai ada yang berhasil
      for (const url of rpcUrls) {
        try {
          const provider = new ethers.JsonRpcProvider(url);
          const contract = new ethers.Contract(CONTRACT_ADDRESS, minABI, provider);
          
          rawBalance = await contract.balanceOf(walletAddress);
          decimals = await contract.decimals();
          break; // Jika berhasil, hentikan loop
        } catch (err) {
          console.warn(`RPC ${url} gagal, mencoba cadangan...`);
        }
      }

      // Jika semua RPC gagal
      if (rawBalance === undefined || decimals === undefined) {
        throw new Error("Semua koneksi RPC gagal merespon.");
      }

      const formattedBalance = ethers.formatUnits(rawBalance, decimals);
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