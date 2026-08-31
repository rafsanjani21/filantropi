"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Mail, HelpCircle, ShieldAlert, Phone, MapPin } from "lucide-react";

export default function PusatBantuanPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Bagaimana cara melakukan donasi/wakaf?",
      answer: "Pilih program donasi atau wakaf yang Anda inginkan, masukkan nominal, dan pilih metode pembayaran (Transfer Bank). Setelah itu, Anda akan mendapatkan rincian nomor rekening tujuan. Pastikan Anda melengkapi profil Anda sebelum berdonasi."
    },
    {
      question: "Apa perbedaan Donasi dan Wakaf di platform ini?",
      answer: "Donasi sosial (Sedekah) digunakan untuk bantuan langsung habis pakai seperti bencana alam atau pangan. Sedangkan Wakaf (Amal Jariyah) digunakan untuk pembangunan aset permanen seperti masjid atau fasilitas umum yang manfaatnya berkelanjutan."
    },
    {
      question: "Mengapa saya diarahkan untuk mengisi profil sebelum berdonasi?",
      answer: "Sebagai bentuk kepatuhan terhadap prinsip transparansi dan regulasi keamanan (KYC), kami mewajibkan donatur untuk melengkapi data dasar seperti Nama, NIK, dan Nomor Rekening. Data ini dijamin kerahasiaannya."
    },
    {
      question: "Berapa lama proses verifikasi pembayaran?",
      answer: "Proses verifikasi pembayaran biasanya memakan waktu 1x24 jam hari kerja. Sistem kami akan melakukan pengecekan mutasi bank secara otomatis. Status donasi Anda dapat dilihat di riwayat profil Anda."
    },
    {
      question: "Apakah donasi bisa dibatalkan atau dikembalikan?",
      answer: "Donasi yang telah berhasil masuk ke rekening yayasan tidak dapat ditarik kembali (refund) karena dana tersebut akan langsung disalurkan atau dicatat sesuai akad program yang dipilih."
    }
  ];

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 pb-10">
      
      {/* HEADER */}
      <div className="bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] px-6 pt-8 pb-6 flex items-center gap-4 sticky top-0 z-50 text-white shadow-md rounded-b-3xl">
        <svg
            className="absolute inset-0 w-full h-full opacity-[0.09] pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="kawung"
                width="56"
                height="56"
                patternUnits="userSpaceOnUse"
              >
                <g fill="none" stroke="#F3D48A" strokeWidth="1.1">
                  <ellipse
                    cx="14"
                    cy="14"
                    rx="12"
                    ry="8"
                    transform="rotate(45 14 14)"
                  />
                  <ellipse
                    cx="42"
                    cy="14"
                    rx="12"
                    ry="8"
                    transform="rotate(-45 42 14)"
                  />
                  <ellipse
                    cx="14"
                    cy="42"
                    rx="12"
                    ry="8"
                    transform="rotate(-45 14 42)"
                  />
                  <ellipse
                    cx="42"
                    cy="42"
                    rx="12"
                    ry="8"
                    transform="rotate(45 42 42)"
                  />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#kawung)" />
          </svg>
        <button onClick={() => router.back()} className="hover:bg-white/20 p-2 rounded-full transition cursor-pointer">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Pusat Bantuan</h1>
          <p className="text-xs text-purple-100 mt-0.5">Ada yang bisa kami bantu?</p>
        </div>
      </div>

      {/* KONTEN */}
      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* INFORMASI KONTAK */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-gray-800 px-1 mb-1">Hubungi Kami</h2>
          
          {/* Telepon */}
          <a href="tel:+6281234567890" className="flex items-center gap-4 p-3.5 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition cursor-pointer group border border-emerald-100">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-200 transition">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Telepon / WhatsApp</p>
              <p className="text-sm font-semibold text-emerald-900 mt-0.5">+62 812-3456-7890</p>
            </div>
          </a>

          {/* Email */}
          <a href="mailto:support@filantropi.net" className="flex items-center gap-4 p-3.5 bg-sky-50 rounded-2xl hover:bg-sky-100 transition cursor-pointer group border border-sky-100">
            <div className="p-3 bg-sky-100 text-sky-600 rounded-xl group-hover:bg-sky-200 transition">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-sky-800 uppercase tracking-wide">Email</p>
              <p className="text-sm font-semibold text-sky-900 mt-0.5">support@filantropi.net</p>
            </div>
          </a>

          {/* Alamat */}
          <div className="flex items-start gap-4 p-3.5 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl mt-1">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wide mt-1">Kantor Pusat</p>
              <p className="text-xs font-medium text-purple-900 mt-1 leading-relaxed pr-2">
                Jl. Rawamangun Muka Timur No.78, RT.6/RW.12, Rawamangun, Kec. Pulo Gadung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13220
              </p>
            </div>
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

        {/* PERINGATAN KEAMANAN (DIUBAH DARI WEB3 MENJADI KEAMANAN TRANSAKSI UMUM) */}
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-3xl p-5 flex gap-3">
          <ShieldAlert size={24} className="text-orange-500 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-orange-800 mb-1">Peringatan Keamanan Transaksi</h3>
            <p className="text-[10px] text-orange-700 leading-relaxed">
              Kami tidak pernah meminta PIN, kata sandi (password), atau kode OTP Anda. Pastikan Anda hanya mentransfer dana ke rekening resmi atas nama platform kami.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}