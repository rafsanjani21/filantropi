"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, MessageCircle, Mail, HelpCircle, ShieldAlert } from "lucide-react";

export default function PusatBantuanPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Apa itu Token FCC?",
      answer: "FCC adalah token kripto berbasis jaringan Polygon (Matic) yang digunakan sebagai alat tukar utama di platform donasi kami. Transaksi menjadi lebih transparan, cepat, dan terdesentralisasi."
    },
    {
      question: "Bagaimana cara melakukan donasi?",
      answer: "Anda harus memiliki dompet digital (seperti MetaMask) yang terhubung ke jaringan Polygon. Pastikan Anda memiliki saldo FCC dan sedikit MATIC untuk biaya gas (gas fee), lalu klik tombol 'Donasi' pada program yang Anda pilih."
    },
    {
      question: "Apakah donasi bisa dibatalkan/dikembalikan?",
      answer: "Tidak. Sesuai dengan sifat dasar teknologi Blockchain, semua transaksi yang sudah berhasil dicatat di dalam blok bersifat permanen dan tidak dapat dibatalkan (irreversible)."
    },
    {
      question: "Bagaimana cara mencairkan dana (Penerima)?",
      answer: "Dana FCC akan otomatis masuk ke alamat dompet (wallet address) yang telah Anda daftarkan di profil. Anda bisa menukarnya menjadi uang fiat melalui bursa kripto (exchange) lokal."
    },
    {
      question: "Kenapa transaksi saya gagal?",
      answer: "Penyebab paling umum adalah: (1) Saldo MATIC Anda tidak cukup untuk membayar gas fee. (2) Jaringan Polygon sedang sangat sibuk. (3) Anda menolak konfirmasi transaksi di dalam dompet digital Anda."
    }
  ];

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 pb-10">
      
      {/* HEADER (Diperbaiki: z-50, pb-6, dan rounded-b-3xl agar scroll aman) */}
      <div className="bg-linear-to-r from-[#7C3996] to-[#E5AFE7] px-6 pt-8 pb-6 flex items-center gap-4 sticky top-0 z-50 text-white shadow-md rounded-b-3xl">
        <button onClick={() => router.back()} className="hover:bg-white/20 p-2 rounded-full transition cursor-pointer">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Pusat Bantuan</h1>
          <p className="text-xs text-purple-100 mt-0.5">Ada yang bisa kami bantu?</p>
        </div>
      </div>

      {/* KONTEN (Diperbaiki: Diberi padding-top wajar, margin negatif dihapus) */}
      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* KOTAK KONTAK CEPAT */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex gap-4">
          <div className="flex-1 bg-purple-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-purple-100 transition active:scale-95">
            <MessageCircle size={24} className="text-purple-600 mb-2" />
            <span className="text-[10px] font-bold text-purple-800 uppercase">Live Chat</span>
          </div>
          <div className="flex-1 bg-sky-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-sky-100 transition active:scale-95">
            <Mail size={24} className="text-sky-600 mb-2" />
            <span className="text-[10px] font-bold text-sky-800 uppercase">Email Kami</span>
          </div>
        </div>

        {/* DAFTAR FAQ */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 px-1">
            <HelpCircle size={18} className="text-purple-600" /> Pertanyaan Populer (FAQ)
          </h2>
          
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${activeFaq === index ? 'border-purple-300 shadow-md' : 'border-gray-100 shadow-sm hover:border-purple-200'}`}
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer outline-none"
                >
                  <span className={`font-bold text-sm pr-4 ${activeFaq === index ? 'text-purple-700' : 'text-gray-700'}`}>
                    {faq.question}
                  </span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-180 text-purple-600' : 'text-gray-400'}`} />
                </button>
                
                <div 
                  className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === index ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-xs text-gray-600 leading-relaxed pt-2 border-t border-gray-50">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PERINGATAN BLOCKCHAIN */}
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-3xl p-5 flex gap-3">
          <ShieldAlert size={24} className="text-orange-500 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-orange-800 mb-1">Peringatan Keamanan Web3</h3>
            <p className="text-[10px] text-orange-700 leading-relaxed">
              Kami tidak akan pernah meminta Private Key atau Seed Phrase Anda. Pastikan Anda hanya bertransaksi di dalam aplikasi resmi ini.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}