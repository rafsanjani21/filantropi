"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Bell, RefreshCw } from "lucide-react";

type HomeHeaderProps = {
  name: string;
  walletAddress: string;
};

export default function HomeHeader({ name, walletAddress }: HomeHeaderProps) {
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  const FCC_CONTRACT_ADDRESS = "0x5feE45dd5435C6D502753b94c412Df59ad209258"; 
  const POLYGON_RPC_URL = "https://polygon.llamarpc.com";

  const fetchBalance = async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
      const minABI = ["function balanceOf(address owner) view returns (uint256)", "function decimals() view returns (uint8)"];
      const contract = new ethers.Contract(FCC_CONTRACT_ADDRESS, minABI, provider);
      
      const rawBalance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      const formatted = ethers.formatUnits(rawBalance, decimals);
      setBalance(parseFloat(formatted).toFixed(2));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [walletAddress]);

  return (
    <div className="bg-linear-to-r from-[#7C3996] to-[#E5AFE7] px-6 pt-12 pb-10 rounded-b-[3rem] shadow-lg">
      <div className="flex justify-between items-start text-white mb-8">
        <div>
          <p className="text-purple-100 text-xs font-medium uppercase tracking-widest opacity-80">Selamat Datang,</p>
          <h1 className="text-2xl font-black tracking-tight">{name || "Pengguna"}</h1>
        </div>
        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-purple-500"></span>
        </button>
      </div>

      {/* MINI BALANCE CARD */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-purple-100 uppercase tracking-widest opacity-70">Saldo FCC Anda</p>
            <div className="flex items-baseline gap-1.5">
              {loading ? (
                <div className="h-6 w-20 bg-white/20 animate-pulse rounded-md mt-1"></div>
              ) : (
                <>
                  <span className="text-2xl font-black text-white tracking-tighter">{balance}</span>
                  <span className="text-xs font-bold text-purple-200">FCC</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button 
          onClick={fetchBalance}
          className="p-2 bg-white/10 rounded-xl hover:bg-white/20 active:scale-90 transition-all text-white"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}