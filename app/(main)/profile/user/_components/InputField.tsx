import React from "react";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  errorMessage?: string | null;
}

export default function InputField({
  label,
  value,
  onChange,
  icon,
  placeholder,
  disabled,
  maxLength,
  errorMessage,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        className={`text-sm font-bold ml-1 transition-colors ${
          disabled ? "text-gray-500" : errorMessage ? "text-red-500" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <div
        className={`flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 border-2 ${
          disabled
            ? "bg-gray-50/50 border-transparent"
            : errorMessage
            ? "bg-red-50/50 border-red-300 focus-within:bg-white focus-within:border-red-500 focus-within:shadow-[0_0_15px_rgba(239,68,68,0.15)] group"
            : "bg-gray-50 border-gray-100 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] group"
        }`}
      >
        <div
          className={`transition-colors duration-300 ${
            disabled
              ? "text-gray-300"
              : errorMessage
              ? "text-red-400 group-focus-within:text-red-500"
              : "text-gray-400 group-focus-within:text-purple-600"
          }`}
        >
          {icon}
        </div>
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`ml-3 w-full bg-transparent outline-none font-medium placeholder:font-normal ${
            disabled ? "text-gray-500 cursor-not-allowed" : "text-gray-800 placeholder:text-gray-300"
          }`}
        />
      </div>
      {errorMessage && !disabled && (
        <p className="text-[11px] font-bold text-red-500 ml-2 mt-0.5 animate-in fade-in">
          {errorMessage}
        </p>
      )}
    </div>
  );
}