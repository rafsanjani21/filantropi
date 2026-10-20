import React, { useState } from "react";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  icon: React.ReactNode;
  options: string[];
  disabled?: boolean;
}

export default function SelectField({ label, value, onChange, icon, options, disabled }: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <label className={`text-sm font-bold ml-1 transition-colors ${disabled ? "text-gray-500" : "text-gray-700"}`}>
        {label}
      </label>

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all duration-300 border-2 cursor-pointer ${
          disabled
            ? "bg-gray-50/50 border-transparent"
            : isOpen
            ? "bg-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            : "bg-gray-50 border-gray-100 hover:border-purple-200"
        }`}
      >
        <div className="flex items-center w-full min-w-0">
          <div
            className={`shrink-0 transition-colors duration-300 ${
              disabled ? "text-gray-300" : isOpen ? "text-purple-600" : "text-gray-400"
            }`}
          >
            {icon}
          </div>
          <span className={`ml-3 font-medium truncate ${!value ? "text-gray-400" : "text-gray-800"}`}>
            {value || `Pilih ${label}`}
          </span>
        </div>
        {!disabled && (
          <div className="shrink-0 text-gray-400 ml-2">
            <svg
              className={`w-4 h-4 fill-current transition-transform duration-300 ${
                isOpen ? "rotate-180 text-purple-600" : ""
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[84px] left-0 w-full bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
              {options.length > 0 ? (
                options.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`px-5 py-3 cursor-pointer transition-colors text-sm font-bold tracking-wide truncate ${
                      value === option
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-purple-600"
                    }`}
                  >
                    {option}
                  </div>
                ))
              ) : (
                <div className="px-5 py-3 text-sm text-gray-400 text-center italic">Tidak ada opsi tersedia</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}