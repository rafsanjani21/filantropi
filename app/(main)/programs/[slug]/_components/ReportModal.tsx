"use client";

import { X, FileText, UploadCloud, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, files: File[]) => void;
  isSubmitting: boolean;
};

export default function ReportModal({ isOpen, onClose, onSubmit, isSubmitting }: ReportModalProps) {
  const [reportDescription, setReportDescription] = useState("");
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReportFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setReportFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!reportDescription.trim()) return toast.error("Deskripsi penggunaan dana wajib diisi!");
    if (reportFiles.length === 0) return toast.error("Minimal lampirkan 1 foto bukti (nota/kegiatan)!");
    
    onSubmit(reportDescription, reportFiles);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh]">
        <div className="bg-green-50 px-6 py-4 flex items-center justify-between border-b border-green-100 shrink-0">
          <div className="flex items-center gap-2 text-green-600">
            <FileText size={20} className="shrink-0" />
            <h2 className="text-lg font-black text-gray-800">Laporan Penggunaan</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Deskripsi Laporan</label>
            <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Ceritakan penggunaan dana..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-32" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bukti Lampiran (Foto/Nota)</label>
            <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-green-400 cursor-pointer transition-colors">
              <UploadCloud size={32} className="mb-2 text-green-500" />
              <span className="text-sm font-bold">Pilih File Bukti</span>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
            {reportFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {reportFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                    <button onClick={() => removeFile(index)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button onClick={onClose} disabled={isSubmitting} className="w-1/3 bg-white text-gray-600 font-bold py-3.5 border border-gray-200 rounded-xl hover:bg-gray-100 active:scale-95 text-sm">Batal</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="w-2/3 flex justify-center items-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 active:scale-95 text-sm">
            Kirim Laporan
          </button>
        </div>
      </div>
    </div>
  );
}