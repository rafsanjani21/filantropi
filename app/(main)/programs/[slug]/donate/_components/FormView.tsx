/**
 * app/(main)/programs/[slug]/donate/_components/FormView.tsx
 *
 * Fungsi   : Form konfirmasi donasi: ringkasan nominal/metode, data donatur, toggle anonim, nomor telepon (digit saja), email, dan doa.
 * Ekspor   : default FormView
 * Dipakai  : app/(main)/programs/[slug]/donate/page.tsx dan tests/unit/FormViewDonasi.test.tsx
 * Catatan  : Nama disembunyikan saat anonim; submit disabled saat isProcessing; logo metode di-fallback ke label jika gagal dimuat.
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, User, Mail, Heart, Phone } from "lucide-react";
import { safeRp } from "@/lib/format";
import type { FieldErrors } from "@/hooks/useTransactionSubmit";
import type { PaymentMethod } from "@/types";

type FormViewProps = {
  amount: number | "";
  selectedMethod: PaymentMethod | null;
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (v: boolean) => void;
  doa: string;
  setDoa: (v: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  onBack: () => void;
  onChangeMethod: () => void;
  errors?: FieldErrors;
};

export default function FormView({
  amount, selectedMethod, name, setName, phone, setPhone, email, setEmail, 
  isAnonymous, setIsAnonymous, doa, setDoa, onSubmit, isProcessing, onBack, onChangeMethod,
  errors,
}: FormViewProps) {
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const logoSrc = selectedMethod?.logo || "/logo/qris.svg";

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col relative animate-in slide-in-from-right-4 duration-300">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md px-5 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-slate-100">
        <button
          onClick={onBack}
          disabled={isProcessing}
          aria-label="Kembali"
          className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-slate-800 text-[15px] tracking-wide">Konfirmasi Donasi</h1>
      </div>

      <div className="p-5 flex-1 overflow-y-auto pb-40 space-y-5">
        
        {/* KARTU SUMMARY UTAMA (UNGU) */}
        <div className="bg-gradient-to-br from-[#7C3996] to-[#9b49bc] rounded-3xl p-6 text-white shadow-lg shadow-[#7C3996]/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 bg-white/10 w-32 h-32 rounded-full opacity-50 blur-2xl"></div>
          
          <p className="text-white/80 text-[12px] font-medium uppercase tracking-wider mb-1 relative z-10">Total Donasi</p>
          <p className="text-3xl font-black mb-2 relative z-10">Rp {safeRp(amount)}</p>
          {errors?.amount && (
            <p id="donation-amount-error" role="alert" className="relative z-10 mb-4 text-[12px] font-medium text-rose-100">
              {errors.amount}
            </p>
          )}
          
          {/* AREA METODE PEMBAYARAN & LOGO */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/20 relative z-10">
            <div className="flex items-center gap-3 overflow-hidden">
              
              {/* LOGO METODE PEMBAYARAN */}
              <div className="w-14 h-9 bg-white rounded-lg flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                {failedLogo === logoSrc ? (
                  <span className="text-[10px] font-black text-slate-400 tracking-tighter">
                    {selectedMethod?.id || "QRIS"}
                  </span>
                ) : (
                  <Image
                    src={logoSrc}
                    alt={selectedMethod?.name || "QRIS"}
                    width={56}
                    height={36}
                    unoptimized
                    className="w-full h-full object-contain"
                    onError={() => setFailedLogo(logoSrc)}
                  />
                )}
              </div>
              
              <span className="font-bold text-[13px] truncate">{selectedMethod?.name || "QRIS Pay"}</span>
            </div>
            
            <button 
              onClick={onChangeMethod} 
              disabled={isProcessing}
              className="text-[11px] font-bold bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors shrink-0 disabled:opacity-50"
            >
              UBAH
            </button>
          </div>
        </div>

        {/* KARTU PROFIL PENGGUNA */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-[13px] font-bold text-slate-800">Lengkapi Profil Donatur</h2>
          
          {/* Custom Toggle Switch Anonim */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[12px] font-bold text-slate-600">Sembunyikan nama (Anonim)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                aria-label="Sembunyikan nama (Anonim)"
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C3996]"></div>
            </label>
          </div>

          {!isAnonymous && (
            <div>
              <div className={`flex items-center bg-slate-50 rounded-2xl px-4 py-1 border transition-colors ${errors?.name ? "border-rose-300" : "border-slate-100 focus-within:border-[#7C3996]"}`}>
                <User size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Nama Lengkap" 
                  name="name"
                  autoComplete="name"
                  aria-label="Nama Lengkap"
                  aria-invalid={errors?.name ? true : undefined}
                  aria-describedby={errors?.name ? "donation-name-error" : undefined}
                  className="w-full bg-transparent border-none p-3 text-[13px] font-bold text-slate-700 outline-none placeholder-slate-400"
                />
              </div>
              {errors?.name && (
                <p id="donation-name-error" role="alert" className="mt-1.5 px-2 text-[11px] font-semibold text-rose-600">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          <div>
            <div className={`flex items-center bg-slate-50 rounded-2xl px-4 py-1 border transition-colors ${errors?.phone ? "border-rose-300" : "border-slate-100 focus-within:border-[#7C3996]"}`}>
              <Phone size={18} className="text-slate-400" />
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPhone(val);
                  }} 
                placeholder="08xxxxxxxxxx" 
                name="phone"
                autoComplete="tel"
                aria-label="Nomor telepon"
                aria-invalid={errors?.phone ? true : undefined}
                aria-describedby={errors?.phone ? "donation-phone-error" : undefined}
                className="w-full bg-transparent border-none p-3 text-[13px] font-bold text-slate-700 outline-none placeholder-slate-400"
              />
            </div>
            {errors?.phone && (
              <p id="donation-phone-error" role="alert" className="mt-1.5 px-2 text-[11px] font-semibold text-rose-600">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <div className={`flex items-center bg-slate-50 rounded-2xl px-4 py-1 border transition-colors ${errors?.email ? "border-rose-300" : "border-slate-100 focus-within:border-[#7C3996]"}`}>
              <Mail size={18} className="text-slate-400" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="user@example.com" 
                name="email"
                autoComplete="email"
                aria-label="Email"
                aria-invalid={errors?.email ? true : undefined}
                aria-describedby={errors?.email ? "donation-email-error" : undefined}
                className="w-full bg-transparent border-none p-3 text-[13px] font-bold text-slate-700 outline-none placeholder-slate-400"
              />
            </div>
            {errors?.email && (
              <p id="donation-email-error" role="alert" className="mt-1.5 px-2 text-[11px] font-semibold text-rose-600">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* KARTU PESAN/DOA */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-[#7C3996] pointer-events-none"><Heart size={60}/></div>
          <p className="text-[13px] font-bold text-slate-800 mb-3 relative z-10">Tulis Doa (Opsional)</p>
          <textarea 
            value={doa} 
            onChange={(e) => setDoa(e.target.value)} 
            placeholder="Tuliskan dukungan atau doa agar diamini ribuan orang baik lainnya..." 
            rows={3} 
            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#7C3996]/20 resize-none placeholder-slate-400 relative z-10"
          ></textarea>
        </div>
      </div>

      {/* FLOATING ACTION BOTTOM BUTTON UNGU (#7C3996) */}
      <div className="fixed bottom-0 w-full max-w-md bg-white p-5 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-30">
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Total Pembayaran</span>
          <span className="font-black text-xl text-[#7C3996]">Rp {safeRp(amount)}</span>
        </div>
        {errors?.form && (
          <p role="alert" className="mb-3 px-2 text-[11px] font-semibold text-rose-600">
            {errors.form}
          </p>
        )}
        <button 
          onClick={onSubmit} 
          disabled={isProcessing} 
          className="w-full bg-gradient-to-r from-[#7C3996] to-[#5B2A73] text-white font-bold text-[15px] py-4 rounded-2xl shadow-lg shadow-[#7C3996]/30 hover:bg-[#6b2e88] active:scale-[0.98] disabled:opacity-70 transition-all flex justify-center items-center gap-2"
        >
          {isProcessing ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Memproses...
            </>
          ) : (
            "Lanjut Pembayaran"
          )}
        </button>
      </div>
    </div>
  );
}