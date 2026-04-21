"use client";

import { HandCoins, Heart, Search } from "lucide-react";
import Navbar from "../components/ui/homepage/navbar";
import Carousel from "../components/ui/homepage/carousel";
import UrgentDonation from "../components/ui/homepage/urgentdonation";
import TentangList from "../components/ui/homepage/tentanglist";
import { useState } from "react";

export default function HomePage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col w-full py-2">
      <Navbar />
      <div className="flex bg-white items-center px-4 py-2 rounded-4xl mx-4 shadow-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari program filantropi..."
          className="flex-1 outline-none text-gray-700"
        />
        <Search className="w-5 h-5 text-gray-500" />
      </div>

      <Carousel />

      <div className="bg-white mt-4 w-full p-8 rounded-t-[2rem] shadow-sm">
        <h2 className="text-xl font-bold mb-8 text-gray-800">Program Filantropi</h2>

        <div className="grid grid-cols-2 gap-8">
          
          {/* Card Donasi */}
          <button className="group flex flex-col items-center cursor-pointer">
            <div className="w-24 h-24 rounded-3xl bg-purple-50 flex items-center justify-center transition-all duration-300 group-hover:bg-purple-600 group-hover:shadow-lg group-hover:shadow-purple-200 group-hover:-translate-y-2">
              <Heart className="w-10 h-10 text-purple-600 transition-all duration-300 group-hover:text-white group-hover:scale-110" />
            </div>
            <span className="mt-4 font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">Donasi</span>
          </button>

          {/* Card Penggalangan Dana */}
          <button className="group flex flex-col items-center cursor-pointer">
            <div className="w-24 h-24 rounded-3xl bg-purple-50 flex items-center justify-center transition-all duration-300 group-hover:bg-purple-600 group-hover:shadow-lg group-hover:shadow-purple-200 group-hover:-translate-y-2">
              <HandCoins className="w-10 h-10 text-purple-600 transition-all duration-300 group-hover:text-white group-hover:scale-110" />
            </div>
            <span className="mt-4 font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">Penggalangan Dana</span>
          </button>
        </div>
      </div>

      <div className="bg-white mt-4 w-full">
        <UrgentDonation />
      </div>
      <div className="bg-white mt-4 w-full">
      <TentangList />
      </div>
    </div>
  );
}
