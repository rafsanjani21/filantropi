import { ArrowRight, Share2, Wallet } from "lucide-react";
import NavbarDetail from "../components/ui/detail/navbar";

export default function DetailPage() {
  return (
    <div className="min-h-screen w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#E5AFE7]  items-center">
      <NavbarDetail />
      <img
        src="/bencana.png"
        alt="Detail Illustration"
        className="w-full h-auto justify-center items-center mx-auto"
      />
      <div className="w-full bg-white flex flex-col mx-auto p-6 mb-6">
        <p className="text-start text-sm text-gray-400 mb-2">
          Kemas Foundation
        </p>
        <p className="text-start text-xl mb-2 font-bold">
          Donasi Untuk Sumatra
        </p>
        <p className="text-start text-sm mb-4">
          Bencana ini bukan sekadar statistik tentang kehilangan, melainkan
          pengingat nyata betapa Sumatra berdiri tepat di atas Cincin Api
          Pasifik yang sangat dinamis. Namun, dari balik puing-puing duka yang
          mendalam, muncul narasi lain yang tak kalah kuat: ketangguhan
          masyarakatnya.
        </p>

        <div className="mt-4 mx-6">
          <div className="flex justify-between text-sm font-bold">
            <span>100 fcc</span>
            <span>1000 fcc</span>
          </div>

          <div className="mt-3 w-full h-3 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-700 rounded-full"
              style={{ width: `10%` }}
            />
          </div>
        </div>
      </div>
      <div className="w-full bg-white flex flex-col mx-auto p-6">
        <p className="text-start text-xl mb-4 font-bold">
          Informasi Penggalangan Dana
        </p>
        <div className="flex items-center gap-4 mb-4">
          <img
            src="/kemas.png"
            alt="Detail Illustration"
            className="w-1/4 border border-gray-300 rounded-full p-4 h-auto justify-start items-start"
          />
          <div className="flex flex-col">
            <p className="text-start text-gray-400">Kemas Foundation</p>
            <p className="text-start text-xs font-bold"> Yayasan Indonesia</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 border border-gray-300 rounded-xl p-4">
          <Wallet className="w-6 h-6 text-black" />
          <div className="flex flex-col">
            <p className="text-start text-gray-400">Rincian Penggunaan Dana</p>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-400 ml-auto" />
        </div>
      </div>

      <div className="w-full bg-white flex flex-col mx-auto p-6 mt-6">
        <p className="text-start text-xl font-bold">Cerita Penggalangan Dana</p>
        <p className="text-start text-sm mb-4">8 Feb 2026</p>
        <p className="text-start text-sm mb-2">
          Bencana ini bukan sekadar statistik tentang kehilangan, melainkan
          pengingat nyata betapa Sumatra berdiri tepat di atas Cincin Api
          Pasifik yang sangat dinamis. Namun, dari balik puing-puing duka yang
          mendalam, muncul narasi lain yang tak kalah kuat: ketangguhan
          masyarakatnya.
        </p>
        <p className="text-start text-sm mb-4 hover:underline cursor-pointer text-purple-500">
          Baca selengkapnya
        </p>
      </div>

      <div className="w-full bg-white flex flex-col mx-auto p-6 mt-6">
        <p className="text-start text-xl font-bold">Doa Orang Baik</p>
        <div className="flex items-center gap-4 mb-4 border p-6 rounded-2xl mt-4">
          <img
            src="/kemas.png"
            alt="Detail Illustration"
            className="w-1/4 border border-gray-300 rounded-full p-4 h-auto justify-start items-start"
          />
          <div className="flex flex-col">
            <p className="text-start text-gray-400">Nama Orang Baik</p>
            <p className="text-start text-xs font-bold"> 5 mnt yang lalu</p>
            <p className="text-start text-sm mb-2 flex flex-col">
              Semoga bantuan ini bisa meringankan beban saudara-saudara kita di
              Sumatra. Tetap kuat dan semangat!
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full flex justify-center z-50">
      
      <div className="w-full max-w-lg bg-white px-4 py-3 shadow-lg flex gap-3">
        
        <button className="flex items-center justify-center gap-2 border rounded-xl px-4 py-2 text-gray-700 w-[35%] font-medium cursor-pointer hover:bg-gray-100">
          <Share2 className="w-5 h-5" />
          Share
        </button>

        <button className="bg-purple-600 text-white rounded-xl px-4 py-2 w-[65%] font-medium cursor-pointer hover:bg-purple-700 flex items-center justify-center gap-2">
          Donasi Sekarang
        </button>

      </div>
    </div>
    </div>
  );
}
