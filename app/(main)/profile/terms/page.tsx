"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Scale, ShieldCheck, FileText, AlertTriangle } from "lucide-react";

export default function SyaratKetentuanPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 pb-12">
      
      {/* HEADER */}
      <div className="bg-gradient-to-b from-[#3E1854] via-[#6B2E88] to-[#8A45A8] px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
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
        <button onClick={() => router.back()} className="hover:bg-gray-100 p-2 rounded-full transition cursor-pointer text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-base font-bold text-white tracking-tight">Syarat & Ketentuan</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* INFO UPDATE TERAKHIR */}
        <div className="flex items-center gap-3 bg-purple-50 text-purple-800 p-4 rounded-2xl border border-purple-100">
          <Scale size={24} className="text-purple-600 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Pembaruan Terakhir</p>
            <p className="text-sm font-bold">31 Agustus 2026</p>
          </div>
        </div>

        {/* KONTEN DOKUMEN */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-sm text-gray-600 leading-relaxed space-y-6">
          
          <section>
            <h2 className="text-gray-800 font-bold flex items-center gap-2 mb-2">
              <FileText size={16} className="text-purple-500" /> 1. Pendahuluan
            </h2>
            <p>
              Dengan mengakses dan menggunakan platform donasi ini, Anda (Pengguna) dianggap telah membaca, memahami, dan menyetujui semua Syarat dan Ketentuan yang berlaku. Platform ini merupakan sarana perantara digital yang memfasilitasi penggalangan dana sosial dan wakaf.
            </p>
          </section>

          <section>
            <h2 className="text-gray-800 font-bold flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-purple-500" /> 2. Peran & Tanggung Jawab
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Platform:</strong> Bertindak sebagai penyedia layanan sistem digital yang menghubungkan Donatur dengan Penerima Manfaat atau Yayasan resmi.</li>
              <li><strong>Donatur:</strong> Bertanggung jawab penuh atas kebenaran nominal transfer, keabsahan bukti transfer, dan memastikan sumber dana yang digunakan sah secara hukum.</li>
              <li><strong>Penerima Manfaat:</strong> Bertanggung jawab atas kebenaran profil kampanye, pencairan dana, serta penyaluran dana yang terkumpul secara transparan dan akuntabel.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-gray-800 font-bold flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-orange-500" /> 3. Kebijakan Pengembalian Dana
            </h2>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-800 text-xs mt-2">
              <strong>PENTING:</strong> Semua transaksi donasi dan wakaf yang telah berhasil diverifikasi dan disalurkan ke rekening program bersifat <strong>Final dan Tidak Dapat Dibatalkan</strong>. Kami tidak dapat memproses pengembalian dana (refund) untuk donasi yang sudah berstatus berhasil.
            </div>
          </section>

          <section>
            <h2 className="text-gray-800 font-bold flex items-center gap-2 mb-2">
              <FileText size={16} className="text-purple-500" /> 4. Biaya Administrasi Bank
            </h2>
            <p>
              Setiap transaksi donasi yang melibatkan transfer antar bank yang berbeda mungkin akan dikenakan biaya administrasi oleh bank terkait. Biaya ini dipotong langsung oleh pihak bank dari saldo Pengguna, dan tidak dikelola oleh Platform.
            </p>
          </section>

          <section>
            <h2 className="text-gray-800 font-bold flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-purple-500" /> 5. Penghentian Kampanye
            </h2>
            <p>
              Platform berhak sepenuhnya untuk menolak, membekukan, atau menghapus kampanye penggalangan dana apabila terindikasi adanya penipuan (scam), pelanggaran hukum, atau ketidaksesuaian verifikasi dokumen tanpa pemberitahuan sebelumnya.
            </p>
          </section>

        </div>

        {/* TOMBOL PERSETUJUAN / KEMBALI */}
        <button 
          onClick={() => router.back()}
          className="w-full bg-purple-800 text-white py-4 rounded-2xl font-bold hover:bg-purple-900 active:scale-95 transition-all shadow-md"
        >
          Saya Mengerti & Setuju
        </button>

      </div>
    </div>
  );
}