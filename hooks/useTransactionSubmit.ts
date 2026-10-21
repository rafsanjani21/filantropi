/**
 * hooks/useTransactionSubmit.ts
 *
 * Fungsi   : Alur submit Donasi/Wakaf bersama: guard anti double-submit, validasi input, pembuatan QRIS Dinamis lokal, dan pencatatan gateway fire-and-forget.
 * Ekspor   : useTransactionSubmit, tipe TransactionType
 * Dipakai  : app/(main)/programs/[slug]/donate/page.tsx, app/(main)/wakaf/[slug]/donate/page.tsx
 * Catatan  : Membaca NEXT_PUBLIC_API_BASE_URL dan NEXT_PUBLIC_QRIS_STATIS; QRIS lokal tetap tampil walau POST gateway gagal/timeout.
 */
// Hook bersama alur submit transaksi Donasi & Wakaf (QRIS Dinamis manual).
// Menangani: guard anti double-submit, validasi umum, generate QRIS, dan
// pencatatan gateway fire-and-forget — agar logika tidak drift antar flow.

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { generateDynamicQris } from "@/lib/qrisDinamis";
import { QRIS_YAYASAN_STATIS } from "@/lib/qrisConfig";
import { isValidEmail, isValidPhone, isValidAmount } from "@/lib/validation";

export type TransactionType = "donasi" | "wakaf";

type SubmitQrisArgs = {
  transactionType: TransactionType;
  campaignId?: number | string;
  campaignName: string;
  /** Nama final yang dikirim ke gateway (sudah memperhitungkan anonim/perwakilan). */
  senderName: string;
  email: string;
  phone: string;
  amount: number | "";
  transferNotes?: string;
  /** Field tambahan khusus flow (mis. { nik } untuk wakaf). */
  extraPayload?: Record<string, unknown>;
  /** Validasi khusus flow (mis. nama wajib) — kembalikan pesan error atau null. */
  validateExtra?: () => string | null;
  /** Callback navigasi setelah QRIS berhasil dibuat (mis. setCurrentView("qris")). */
  onShowQris: (qris: string) => void;
};


export function useTransactionSubmit() {
  const [isProcessing, setIsProcessing] = useState(false);
  // Ref sinkron: menutup celah klik ganda dalam satu task JS (state React belum sempat re-render)
  const processingRef = useRef(false);
  const [qrisString, setQrisString] = useState("");
  const [transactionData, setTransactionData] = useState<any>(null);

  const resetProcessing = () => {
    processingRef.current = false;
    setIsProcessing(false);
  };

  const submit = ({
    transactionType,
    campaignId,
    campaignName,
    senderName,
    email,
    phone,
    amount,
    transferNotes,
    extraPayload,
    validateExtra,
    onShowQris,
  }: SubmitQrisArgs) => {
    // Guard anti double-submit: ref sinkron + state (klik ganda dalam satu task JS tertutup)
    if (processingRef.current || isProcessing) return;

    const label = transactionType === "donasi" ? "donasi" : "wakaf";

    const extraError = validateExtra?.();
    if (extraError) return void toast.error(extraError);
    if (!isValidEmail(email)) return void toast.error("Format email tidak valid");
    if (!isValidPhone(phone)) return void toast.error("Nomor telepon tidak valid (9–15 digit)");
    if (!isValidAmount(amount)) return void toast.error(`Minimal ${label} Rp 1.000`);
    if (!QRIS_YAYASAN_STATIS) return void toast.error("Konfigurasi QRIS yayasan belum diatur");

    processingRef.current = true;
    setIsProcessing(true);
    const loadingToast = toast.loading(
      transactionType === "donasi" ? "Memproses donasi..." : "Memproses ikrar wakaf...",
    );

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
        : null;
    const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const idempotencyKey =
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`;

    try {
      /* ====================================================================
         ⚠️ CARA KEMBALI KE PAYMENT GATEWAY (pindahkan logika await-fetch dari blok ini
         ke handler lama di page, atau kembangkan mode gateway di sini):
         - cek response.ok / result.error, throw jika gagal
         - setTransactionData(result.data); navigasi ke "qris"/"va" berdasarkan selectedMethod
         ==================================================================== */

      // ====================================================================
      // 🔥 LOGIKA SEMENTARA: QRIS DINAMIS MANUAL (HAPUS INI JIKA KEMBALI KE PAYMENT GATEWAY)
      // ====================================================================
      const dynamicQris = generateDynamicQris(QRIS_YAYASAN_STATIS, Number(amount));
      setQrisString(dynamicQris);

      // Tampilkan QRIS lebih dulu — pencatatan gateway fire-and-forget agar tidak menunda user
      onShowQris(dynamicQris);
      toast.success("Berhasil! Silakan scan QRIS", { id: loadingToast });

      const payload = {
        campaign_id: campaignId,
        campaign_name: campaignName,
        sender_name: senderName,
        sender_email: email,
        sender_phone: phone,
        amount: Number(amount),
        transfer_notes: transferNotes || (transactionType === "donasi" ? "Tanpa pesan" : "Semoga berkah"),
        payment_method: "QRIS",
        payment_code: dynamicQris,
        ...extraPayload,
      };

      const endpoint =
        transactionType === "donasi"
          ? `${GATEWAY_URL}/campaigns/create/v2/transaction-donasi`
          : `${GATEWAY_URL}/campaigns/create/v2/transaction-wakaf`;

      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }).catch((err) => console.warn("Pencatatan background gagal", err));
      // ====================================================================
    } catch (err: any) {
      console.error("Payment Error:", err);
      toast.error(err.message || "Terjadi kesalahan sistem", { id: loadingToast });
    } finally {
      // Tunda reset guard ke tick berikutnya: handler fire-and-forget selesai sinkron
      // dalam satu task JS, sehingga reset sinkron akan membuka celah klik ganda.
      setTimeout(resetProcessing, 0);
    }
  };

  return { isProcessing, qrisString, transactionData, setTransactionData, submit, resetProcessing };
}
