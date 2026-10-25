/**
 * hooks/useTransactionSubmit.ts
 *
 * Fungsi   : Alur submit Donasi/Wakaf, guard anti double-submit, validasi input,
 *            pencatatan transaksi ke gateway (Midtrans), dan idempotency per payload.
 * Ekspor   : useTransactionSubmit, TransactionType, RecordStatus, FormField, FieldErrors
 * Catatan  : Menggunakan Pessimistic UI (menunggu respons backend sebelum pindah halaman).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getAccessToken } from "@/lib/authTokens";
import {
  isValidEmail,
  isValidPhone,
  getAmountError,
} from "@/lib/validation";
import type { TransactionDetail } from "@/types";

export type TransactionType = "donasi" | "wakaf";
export type RecordStatus = "idle" | "recording" | "recorded" | "failed";
export type FormField = "name" | "email" | "phone" | "amount" | "nik" | "form";
export type FieldErrors = Partial<Record<FormField, string>>;

type ExtraValidation = { field: FormField; message: string } | null;

type SubmitQrisArgs = {
  transactionType: TransactionType;
  campaignId?: number | string;
  campaignName: string;
  senderName: string;
  email: string;
  phone: string;
  amount: number | "";
  transferNotes?: string;
  paymentMethod?: string | null;
  extraPayload?: Record<string, unknown>;
  validateExtra?: () => ExtraValidation;
  onShowQris: (qris: string) => void;
};

const RECORD_TIMEOUT_MS = 20_000;

export function useTransactionSubmit() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrisString, setQrisString] = useState("");
  const [transactionData, setTransactionData] = useState<TransactionDetail | null>(null);
  const [recordStatus, setRecordStatus] = useState<RecordStatus>("idle");
  const [recordError, setRecordError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const processingRef = useRef(false);
  const mountedRef = useRef(true);
  const idempotencyRef = useRef<{ signature: string; key: string } | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const resetProcessing = useCallback(() => {
    processingRef.current = false;
    setIsProcessing(false);
  }, []);

  const clearFieldError = useCallback((field: FormField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const submit = ({
    transactionType,
    campaignId,
    campaignName,
    senderName,
    email,
    phone,
    amount,
    transferNotes,
    paymentMethod,
    extraPayload,
    validateExtra,
    onShowQris,
  }: SubmitQrisArgs) => {
    // Guard anti double-submit
    if (processingRef.current || isProcessing) return;

    const label = transactionType === "donasi" ? "donasi" : "wakaf";
    const isQris = !paymentMethod || paymentMethod === "qris";

    const errors: FieldErrors = {};
    const extraError = validateExtra?.();
    if (extraError) errors[extraError.field] = extraError.message;
    if (!isValidEmail(email)) errors.email = "Format email tidak valid";
    if (!isValidPhone(phone)) {
      errors.phone = "Nomor telepon tidak valid (9–15 digit)";
    }
    const amountError = getAmountError(amount, label);
    if (amountError) errors.amount = amountError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstMessage = Object.values(errors)[0];
      if (firstMessage) toast.error(firstMessage);
      return;
    }

    setFieldErrors({});
    processingRef.current = true;
    setIsProcessing(true);

    try {
      setTransactionData(null);
      setRecordStatus("recording");
      setRecordError(null);
    } catch (err) {
      resetProcessing();
      console.error("Payment Error:", err);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
      setFieldErrors({ form: message });
      toast.error(message);
      return;
    }

    const token = getAccessToken();
    const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Idempotency check
    const signature = JSON.stringify({
      transactionType,
      campaignId,
      amount: Number(amount),
      senderName,
      email: email.trim(),
      phone,
      paymentMethod,
      nik: extraPayload?.nik ?? "",
    });
    
    if (idempotencyRef.current?.signature !== signature) {
      idempotencyRef.current = {
        signature,
        key: typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `idemp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      };
    }

    const payload = {
      campaign_id: campaignId,
      campaign_name: campaignName,
      sender_name: senderName,
      sender_email: email,
      sender_phone: phone,
      amount: Number(amount),
      transfer_notes: transferNotes || (transactionType === "donasi" ? "Tanpa pesan" : "Semoga berkah"),
      payment_method: paymentMethod || "qris",
      ...extraPayload,
    };

    const endpoint = transactionType === "donasi"
        ? `${GATEWAY_URL}/campaigns/create/v2/transaction-donasi`
        : `${GATEWAY_URL}/campaigns/create/v2/transaction-wakaf`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RECORD_TIMEOUT_MS);

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyRef.current.key,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then(async (res) => {
        const text = await res.text();
        let data: unknown = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { message: text };
        }

        const body = (data ?? {}) as {
          error?: boolean;
          message?: string;
          data?: TransactionDetail;
        };

        // Jika error dari backend, lempar pesan error ke blok catch
        if (!res.ok || body.error === true) {
          throw new Error(body.message || `Gateway menolak transaksi (${res.status})`);
        }

        const tx = ((body.data ?? data) || {}) as TransactionDetail;
        if (!mountedRef.current) return;
        
        setTransactionData(tx);
        setRecordStatus("recorded");
        setRecordError(null);

        const finalQris = isQris ? String(tx.qris_url || "") : "";
        
        if (finalQris) {
          setQrisString(finalQris);
        }
        
        // Pindah halaman / tampilkan QRIS HANYA jika backend sukses memproses
        onShowQris(finalQris);
      })
      .catch((err: unknown) => {
        if (!mountedRef.current) return;
        
        const message = err instanceof DOMException && err.name === "AbortError"
            ? "Pencatatan transaksi melebihi batas waktu"
            : err instanceof Error
              ? err.message
              : "Gagal mencatat transaksi";
        
        setRecordStatus("failed");
        setRecordError(message);
        console.warn("Transaksi gagal diteruskan ke Midtrans", err);
        
        // Tampilkan pesan asli dari backend (seperti limit 3 menit)
        toast.error(message, { duration: 4000 });
      })
      .finally(() => {
        clearTimeout(timeoutId);
        // Reset processing agar tombol bisa diklik kembali
        resetProcessing(); 
      });
  };

  const transactionId = transactionData?.id ?? transactionData?.transaction_code ?? null;
  const isRecorded = recordStatus === "recorded";
  const isRecordFailed = recordStatus === "failed";
  const isRecording = recordStatus === "recording";

  return {
    isProcessing,
    qrisString,
    transactionData,
    recordStatus,
    recordError,
    isRecording,
    isRecorded,
    isRecordFailed,
    fieldErrors,
    clearFieldError,
    transactionId,
    submit,
    resetProcessing,
  };
}