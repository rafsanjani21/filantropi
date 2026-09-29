import { ArrowLeft, User, Mail, Heart, Check } from "lucide-react"; // Tambahkan Check

type FormWakafViewProps = {
  amount: number | "";
  selectedMethod: any;
  wakafName: string;
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  doa: string;
  setDoa: (val: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  onBack: () => void;
  onChangeMethod: () => void;
};

export default function FormWakafView({
  amount,
  selectedMethod,
  wakafName,
  name,
  setName,
  email,
  setEmail,
  doa,
  setDoa,
  onSubmit,
  isProcessing,
  onBack,
  onChangeMethod,
}: FormWakafViewProps) {
  const formatRp = (num: number) => new Intl.NumberFormat("id-ID").format(num);
  const defaultQrisLogo =
    "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg";

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col relative animate-in slide-in-from-right-4 duration-300">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md px-5 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-slate-100">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-slate-800 text-[15px] tracking-wide">
          Konfirmasi Wakaf
        </h1>
      </div>

      <div className="p-5 flex-1 overflow-y-auto pb-40 space-y-5">
        {/* KARTU SUMMARY UTAMA */}
        <div className="bg-linear-to-b from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="kawung-profile"
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
            <rect width="100%" height="100%" fill="url(#kawung-profile)" />
          </svg>
          <div className="absolute -right-10 -top-10 bg-emerald-500 w-32 h-32 rounded-full opacity-50 blur-2xl"></div>

          <p className="text-emerald-100 text-[12px] font-medium uppercase tracking-wider mb-1 relative z-10">
            Total Penyaluran
          </p>
          <p className="text-3xl font-black mb-6 relative z-10">
            Rp {formatRp(Number(amount))}
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/20 relative z-10">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-14 h-9 bg-white rounded-lg flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                <img
                  src={selectedMethod?.logo || defaultQrisLogo}
                  alt={selectedMethod?.name || "QRIS"}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-[13px] truncate">
                {selectedMethod?.name || "QRIS Pay"}
              </span>
            </div>
            <button
              onClick={onChangeMethod}
              disabled={isProcessing}
              className="text-[11px] font-bold bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors shrink-0"
            >
              UBAH
            </button>
          </div>
        </div>

        {/* KARTU ATAS NAMA (READ-ONLY) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-50 p-2 rounded-full text-emerald-600">
              <Check size={16} />
            </div>
            <p className="text-[13px] font-bold text-slate-800">
              Nama Wakif
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="font-black text-slate-700 text-[15px]">{wakafName}</p>
          </div>
        </div>

        {/* KARTU DATA DIRI (RESI) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-50 p-2 rounded-full text-emerald-600">
              <User size={16} />
            </div>
            <p className="text-[13px] font-bold text-slate-800">
              Kontak Anda (Untuk Resi)
            </p>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap Anda"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Alamat Email Anda"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* KARTU PESAN/DOA */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-50 p-2 rounded-full text-emerald-600">
              <Heart size={16} />
            </div>
            <p className="text-[13px] font-bold text-slate-800">
              Sertakan Doa (Opsional)
            </p>
          </div>
          <textarea
            value={doa}
            onChange={(e) => setDoa(e.target.value)}
            placeholder="Tuliskan harapan dan doa dari wakaf ini..."
            rows={3}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none placeholder-slate-400 transition-all"
          ></textarea>
        </div>
      </div>

      {/* FLOATING ACTION BOTTOM */}
      <div className="fixed bottom-0 w-full max-w-md bg-white p-5 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-30">
        <button
          onClick={onSubmit}
          disabled={isProcessing}
          className="w-full bg-emerald-600 text-white font-bold text-[15px] py-4 rounded-2xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-70 transition-all flex justify-center items-center gap-2"
        >
          {isProcessing ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Memproses...
            </>
          ) : (
            "Lanjutkan Pembayaran"
          )}
        </button>
      </div>
    </div>
  );
}