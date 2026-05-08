"use client";

import "@/lib/i18n";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useTranslation } from "react-i18next"; // 🔥 IMPORT I18N
import { ArrowLeft, Clock, FileText, CheckCircle2, Image as ImageIcon, Banknote, Loader2, CircleDashed, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

function ProgressContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation(); // 🔥 INISIALISASI I18N
  
  // 🔥 AMBIL ID DARI URL BUKAN SLUG
  const campaignId = searchParams.get("id"); 
  
  const [stepperData, setStepperData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!campaignId) return;
      try {
        setLoading(true);
        // Tembak API menggunakan campaignId (UUID)
        const res = await apiFetch(`/campaigns/stepper/${campaignId}?t=${new Date().getTime()}`, { method: "GET" });
        if (res && res.data) {
          // Urutkan berdasarkan phase dan tipe agar urutannya selalu benar
          const sorted = res.data.sort((a: any, b: any) => {
             if (a.phase !== b.phase) return a.phase - b.phase;
             // Jika phase sama, PENCAIRAN harus di atas LAPORAN
             return a.type === "PENCAIRAN" ? -1 : 1;
          });
          setStepperData(sorted);
        }
      } catch (error) {
        console.error("Gagal mengambil progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [campaignId]);

  const formatDate = (isoString: string) => {
    if (!isoString) return "-";
    // Bisa disesuaikan dengan locale aktif jika diperlukan, misal i18n.language
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="relative min-h-screen w-full max-w-lg mx-auto flex flex-col bg-gray-50 pb-20">
      
      {/* Navbar Simple */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black text-gray-800">{t("progress_distribution_title", "Progress Penyaluran")}</h1>
      </div>

      <div className="p-6 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-600 font-bold animate-pulse mt-2">{t("loading_goodness_trail", "Memuat jejak kebaikan...")}</p>
          </div>
        ) : stepperData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Clock size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">{t("no_progress_yet", "Belum Ada Progress")}</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">{t("no_progress_desc", "Data riwayat penyaluran dana tidak ditemukan.")}</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-200 ml-3 md:ml-4 space-y-8 pb-8 mt-4">
            
            {stepperData.map((step, index) => {
              // 🔥 LOGIKA STATUS YANG MENDUKUNG "NOT_STARTED" & "REJECTED"
              const stepType = String(step.type || "").toUpperCase().trim();
              const stepStatus = String(step.status || "").toUpperCase().trim();

              const isPencairan = stepType.includes("PENCAIRAN");
              const isNotStarted = stepStatus === "NOT_STARTED";
              const isApproved = stepStatus.includes("APPROVE") || stepStatus.includes("SUCCESS");
              const isRejected = stepStatus.includes("REJECT") || stepStatus === "DITOLAK";
              const isPending = !isApproved && !isNotStarted && !isRejected;
              
              // WARNA INDIKATOR TIMELINE
              const dotColor = isApproved 
                ? "bg-blue-500" 
                : isRejected ? "bg-red-500" 
                : isNotStarted ? "bg-gray-300" 
                : "bg-amber-400";
              
              // WARNA KOTAK (CARD)
              let bgColor = "bg-white border-gray-100";
              if (isNotStarted) bgColor = "bg-gray-50 border-gray-200 opacity-60";
              else if (isRejected) bgColor = "bg-red-50/40 border-red-100";
              else if (isPencairan) bgColor = "bg-blue-50/50 border-blue-100";
              
              const Icon = isPencairan ? Banknote : FileText;

              // TEKS & WARNA LABEL STATUS
              let statusLabel = t("status_processing", "Diproses");
              let badgeStyle = "bg-amber-50 text-amber-600 border-amber-100";
              if (isApproved) {
                statusLabel = t("status_completed", "Selesai");
                badgeStyle = "bg-green-50 text-green-600 border-green-100";
              } else if (isRejected) {
                statusLabel = t("status_rejected", "Ditolak");
                badgeStyle = "bg-red-50 text-red-600 border-red-100";
              } else if (isNotStarted) {
                statusLabel = t("status_not_started", "Belum Dimulai");
                badgeStyle = "bg-gray-200 text-gray-500 border-gray-300";
              }

              // TEKS DESKRIPSI OTOMATIS
              let descText = "";
              if (isNotStarted) {
                descText = t("desc_not_started", "Tahapan ini belum dimulai oleh pihak penggalang dana.");
              } else if (isRejected) {
                descText = isPencairan 
                  ? t("desc_disbursement_rejected", "Pengajuan pencairan dana untuk tahap ini ditolak oleh tim admin. Silakan hubungi admin untuk info lebih lanjut.")
                  : t("desc_report_rejected", "Laporan bukti penggunaan dana ditolak oleh admin. Mohon unggah ulang bukti yang valid.");
              } else if (isPencairan) {
                descText = isApproved 
                  ? t("desc_disbursement_approved", "Dana untuk tahap ini telah disetujui dan berhasil dicairkan ke wallet penerima manfaat.") 
                  : t("desc_disbursement_processing", "Pengajuan pencairan dana untuk tahap ini sedang menunggu persetujuan dari tim admin.");
              } else {
                descText = isApproved 
                  ? t("desc_report_approved", "Laporan bukti penggunaan dana telah diverifikasi dan disetujui oleh admin.") 
                  : t("desc_report_processing", "Laporan bukti penggunaan dana telah diunggah dan sedang ditinjau.");
              }

              return (
                <div key={index} className="relative pl-6 md:pl-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  
                  {/* Timeline Dot Indicator */}
                  <div className={`absolute -left-[11px] top-1.5 w-5 h-5 ${dotColor} rounded-full border-4 border-gray-50 flex items-center justify-center shadow-sm z-10`}>
                    {isApproved ? <CheckCircle2 size={10} className="text-white" /> 
                     : isRejected ? <XCircle size={10} className="text-white" />
                     : isNotStarted ? <CircleDashed size={10} className="text-white" /> 
                     : <Clock size={10} className="text-white" />}
                  </div>

                  <div className={`${bgColor} p-5 rounded-2xl shadow-sm border transition-shadow ${!isNotStarted && "hover:shadow-md"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${isNotStarted ? 'bg-gray-200 text-gray-500' : isPencairan ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {t("phase_prefix", "Tahap")} {step.phase}
                        </span>
                        
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase border ${badgeStyle}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    <h3 className={`font-bold text-sm flex items-center gap-2 mb-1 ${isNotStarted ? 'text-gray-500' : isRejected ? 'text-red-700' : 'text-gray-800'}`}>
                      <Icon size={16} className={isNotStarted ? "text-gray-400" : isRejected ? "text-red-500" : isPencairan ? "text-blue-500" : "text-purple-500"} />
                      {step.title}
                    </h3>
                    
                    {!isNotStarted && (
                      <p className={`text-[10px] font-bold mb-3 flex items-center gap-1.5 ${isRejected ? 'text-red-400' : 'text-gray-400'}`}>
                        <Clock size={12} /> {formatDate(step.date)}
                      </p>
                    )}

                    {/* Deskripsi Otomatis */}
                    <p className={`text-xs leading-relaxed p-3 rounded-xl border ${isNotStarted ? 'text-gray-500 bg-gray-100/50 border-gray-200/50 mt-3' : isRejected ? 'text-red-600 bg-white/60 border-red-100/50' : 'text-gray-600 bg-white/60 border-gray-100/50'}`}>
                      {descText}
                    </p>

                    {/* Render Foto Bukti (Hanya jika ada) */}
                    {step.proof_images && step.proof_images.length > 0 && !isNotStarted && (
                      <div className={`mt-4 pt-4 border-t ${isRejected ? 'border-red-100/60' : 'border-gray-100/60'}`}>
                        <p className={`text-[10px] font-bold uppercase mb-2 flex items-center gap-1 ${isRejected ? 'text-red-400' : 'text-gray-400'}`}>
                          <ImageIcon size={12} /> {t("proof_attachments", "Lampiran Bukti")} ({step.proof_images.length})
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {step.proof_images.map((img: string, idx: number) => {
                            const cleanPath = img.replace(/^(public\/|\/+)/, '');
                            const fullUrl = img.startsWith('http') ? img : `${IMAGE_BASE_URL}/${cleanPath}`;
                            return (
                              <a 
                                key={idx} 
                                href={fullUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border block ${isRejected ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-100'}`}
                              >
                                <img 
                                  src={fullUrl} 
                                  alt={`${t("proof_text", "Bukti")} ${idx+1}`} 
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error';
                                  }}
                                />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* Garis Ujung Bawah */}
            {stepperData.length > 0 && (
              <div className="absolute -bottom-2 -left-[9px] w-4 h-4 bg-gray-200 rounded-full border-4 border-gray-50"></div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}>
      <ProgressContent />
    </Suspense>
  );
}