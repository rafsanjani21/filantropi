"use client";

import { useState } from "react";
import { X, MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Link WhatsApp lengkap dengan pesan pembuka masing-masing
  const linkWakaf =
    "https://wa.me/6281330108688?text=Halo%20Admin%20Gerakan%20Wakaf%20Indonesia,%20saya%20butuh%20bantuan%20terkait%20wakaf.";
  const linkFilantropi =
    "https://wa.me/6287770145898?text=Halo%20Admin%20Filantropi,%20saya%20butuh%20bantuan%20terkait%20donasi/kampanye.";

  return (
    <div className="fixed inset-x-0 bottom-24 mx-auto w-full max-w-lg z-[999] pointer-events-none flex flex-col items-end px-6">
      {/* KOTAK MENU PILIHAN */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col w-64 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 origin-bottom-right">
          {/* Header Menu */}
          <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Pilih Layanan Bantuan
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>

          {/* Gerakan Wakaf */}
          <a
            href={linkWakaf}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="px-4 py-3.5 hover:bg-gray-50 flex flex-col transition-colors border-b border-gray-50 active:bg-gray-100"
          >
            <span className="text-sm font-bold text-gray-800">
              CS Gerakan Wakaf Indonesia
            </span>
            <span className="text-xs text-emerald-600 mt-0.5 font-medium">
              0813-3010-8688
            </span>
          </a>

          {/* Filantropi */}
          <a
            href={linkFilantropi}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="px-4 py-3.5 hover:bg-gray-50 flex flex-col transition-colors active:bg-gray-100"
          >
            <span className="text-sm font-bold text-gray-800">
              CS Filantropi
            </span>
            <span className="text-xs text-purple-600 mt-0.5 font-medium">
              0877-7014-5898
            </span>
          </a>
        </div>
      )}

      {/* UTAMA */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl hover:bg-[#20bd5a] hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
          </span>
        )}

        {isOpen ? (
          <X size={26} strokeWidth={2.5} />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="ml-0.5 mt-0.5"
          >
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
        )}
      </button>
    </div>
  );
}
