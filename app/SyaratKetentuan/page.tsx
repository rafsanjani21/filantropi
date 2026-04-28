"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Scale, ShieldCheck, FileText, AlertTriangle } from "lucide-react";

export default function SyaratKetentuanPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 pb-12">
      
      {/* HEADER */}
      <div className="bg-white px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <button onClick={() => router.back()} className="hover:bg-gray-100 p-2 rounded-full transition cursor-pointer text-gray-700">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-base font-black text-gray-800 tracking-tight">Syarat & Ketentuan</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="px-6 pt-6 flex flex-col gap-6">
        
        {/* INFO UPDATE TERAKHIR */}
        <div className="flex items-center gap-3 bg-purple-50 text-purple-800 p-4 rounded-2xl border border-purple-100">
          <Scale size={24} className="text-purple-600 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Pembaruan Terakhir</p>
            <p className="text-sm font-bold">28 April 2026</p>
          </div>
        </div>

        {/* KONTEN DOKUMEN */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-sm text-gray-600 leading-relaxed space-y-6">
          
          <section>
            <h2 className="text-gray-800 font-bold flex items-center gap-2 mb-2">
              <FileText size={16} className="text-purple-500" /> 1. Pendahuluan
            </h2>
            <p>
              Dengan mengakses dan menggunakan platform donasi ini, Anda (Pengguna) dianggap telah membaca, memahami, dan menyetujui semua Syarat dan Ketentuan yang berlaku. Platform ini menggunakan teknologi Web3 dan *smart contract* di jaringan Polygon.
            </p>
          </section>

          <section>
            <h2 className="text-gray-800 font-bold flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-purple-500" /> 2. Peran & Tanggung Jawab
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Platform:</strong> Bertindak sebagai penyedia teknologi infrastruktur *smart contract* yang menghubungkan Donatur dan Penerima Manfaat. Platform tidak mengelola dana secara terpusat.</li>
              <li><strong>Donatur:</strong> Bertanggung jawab penuh atas kebenaran alamat tujuan, jumlah token, dan memastikan dompet digital (wallet) dalam keadaan aman.</li>
              <li><strong>Penerima Manfaat:</strong> Bertanggung jawab atas kebenaran data profil, kampanye, dan penggunaan dana yang terkumpul secara transparan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-gray-800 font-bold flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-orange-500" /> 3. Sifat Transaksi Web3
            </h2>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-800 text-xs mt-2">
              <strong>PENTING:</strong> Semua transaksi donasi yang tercatat di jaringan blockchain bersifat <strong>Final dan Tidak Dapat Dibatalkan (Irreversible)</strong>. Platform tidak memiliki akses ke dompet pengguna dan tidak dapat mengembalikan (refund) token FCC yang telah berhasil dikirim ke *smart contract* atau dompet penerima.
            </div>
          </section>

          <section>
            <h2 className="text-gray-800 font-bold flex items-center gap-2 mb-2">
              <FileText size={16} className="text-purple-500" /> 4. Biaya Jaringan (Gas Fee)
            </h2>
            <p>
              Setiap transaksi di dalam platform ini memerlukan biaya jaringan (*Gas Fee*) yang dibayarkan dalam bentuk koin MATIC langsung kepada validator jaringan Polygon, bukan kepada pihak Platform.
            </p>
          </section>

          <section>
            <h2 className="text-gray-800 font-bold flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-purple-500" /> 5. Penghentian Kampanye
            </h2>
            <p>
              Platform berhak sepenuhnya untuk menolak, membekukan, atau menghapus kampanye penggalangan dana apabila terindikasi adanya penipuan (scam), pelanggaran hukum, atau ketidaksesuaian data verifikasi tanpa pemberitahuan sebelumnya.
            </p>
          </section>

        </div>

        {/* TOMBOL PERSETUJUAN / KEMBALI */}
        <button 
          onClick={() => router.back()}
          className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold hover:bg-gray-900 active:scale-95 transition-all shadow-md"
        >
          Saya Mengerti & Setuju
        </button>

      </div>
    </div>
  );
}