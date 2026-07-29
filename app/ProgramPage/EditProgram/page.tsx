"use client";

import "@/lib/i18n"; // Proteksi i18n
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";
import { AuthService } from "@/lib/auth.service";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ImageIcon,
  Type,
  Tag,
  Calendar,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Wallet,
  Lock,
  X,
} from "lucide-react";

function KelolaProgramContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { getProfile } = useAuth();
  const { t } = useTranslation();

  const MAX_FILE_SIZE = 1048576; // Batas 1 MB
  const MAX_IMAGES = 5; // Batas maksimal foto

  const [loadingData, setLoadingData] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [beneficiaryType, setBeneficiaryType] = useState<string>("");
  const [toastAlert, setToastAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // STATE FOTO: Pisahkan foto dari API (Lama) dan File lokal (Baru)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);

  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const showToast = (message: string, type: "success" | "error") => {
    setToastAlert({ message, type });
    setTimeout(() => setToastAlert(null), 3000);
  };

  const [form, setForm] = useState({
    title: "",
    category_id: "1",
    target_amount: "",
    end_date: "",
    description: "",
    story: "",
    wallet_address: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id || id === "undefined" || id === "null") {
        showToast(
          t(
            "invalid_program_id",
            "ID Program tidak valid atau hilang dari URL.",
          ),
          "error",
        );
        setLoadingData(false);
        return;
      }

      try {
        const profile = await getProfile("beneficiary");
        const type = profile?.beneficiary_type?.toLowerCase() || "";
        const isIndividual = type === "individu" || type === "individual";
        setBeneficiaryType(isIndividual ? "individual" : "organization");

        const res = await AuthService.getCampaignDetail(id);
        const data = res.data?.data ?? res.data ?? res;

        if (!data || !data.id) {
          throw new Error(
            t("empty_campaign_data", "Data kampanye kosong dari server."),
          );
        }

        let formattedDate = "";
        if (data.end_date) {
          const dateObj = new Date(data.end_date);
          formattedDate = dateObj.toISOString().split("T")[0];
        }

        setForm({
          title: data.title || "",
          category_id: data.category_id?.toString() || "1",
          target_amount: data.target_amount?.toString() || "",
          end_date: formattedDate,
          description: data.description || "",
          story: data.story || "",
          wallet_address:
            data.wallet_address || data.user?.wallet_address || "",
        });

        // Parse foto dari API
        const rawImages =
          data.images ??
          data.image_banners ??
          data.campaign_images ??
          data.image_banner ??
          [];
        const imageList = Array.isArray(rawImages) ? rawImages : [rawImages];
        const images = imageList
          .filter((item) => typeof item === "string")
          .map((image: string) =>
            image.startsWith("http")
              ? image
              : `${IMAGE_BASE_URL}/${image.replace(/^\/+/, "")}`,
          );

        setExistingImages(images);
      } catch (error: any) {
        console.error("Gagal mengambil data:", error);
        showToast(
          error.message ||
            t(
              "load_campaign_failed",
              "Gagal memuat data program. Pastikan ID benar.",
            ),
          "error",
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, t]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // --- LOGIKA UPLOAD & HAPUS FOTO ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Hitung slot tersisa
    const currentTotal = existingImages.length + newFiles.length;
    const availableSlots = MAX_IMAGES - currentTotal;

    if (availableSlots <= 0) {
      showToast("Maksimal 5 foto telah tercapai!", "error");
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);
    const validFiles: File[] = [];

    // Validasi ukuran
    filesToAdd.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`Ukuran ${file.name} melebihi 1MB!`, "error");
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setNewFiles((prev) => [...prev, ...validFiles]);
      setNewFilePreviews((prev) => [
        ...prev,
        ...validFiles.map((f) => URL.createObjectURL(f)),
      ]);
    }

    e.target.value = ""; // Reset input
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const removeNewFile = (indexToRemove: number) => {
    setNewFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setNewFilePreviews((prev) => {
      const urlToRevoke = prev[indexToRemove];
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  // --- LOGIKA SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (beneficiaryType === "individual") {
      if (!ethers.isAddress(form.wallet_address.trim())) {
        showToast(
          t(
            "invalid_wallet_error",
            "Alamat Wallet tidak valid! Pastikan formatnya 0x...",
          ),
          "error",
        );
        return;
      }
    }

    setSubmitLoading(true);

    try {
      const formData = new FormData();
      formData.append("category_id", form.category_id);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("story", form.story);

      // Tetap kirim string kosong jika target_amount dan end_date kosong (berarti unlimited)
      formData.append("target_amount", form.target_amount);
      formData.append("end_date", form.end_date);

      if (beneficiaryType === "individual") {
        formData.append("wallet_address", form.wallet_address.trim());
      }

      // Kirim foto lama yang tidak dihapus
      existingImages.forEach((url) =>
        formData.append("existing_images[]", url),
      );

      // Kirim foto baru
      newFiles.forEach((file) => formData.append("image_banner", file));

      await apiFetch(`/campaigns/${id}`, {
        method: "PUT",
        body: formData,
      });

      showToast(
        t("campaign_updated_success", "Perubahan program berhasil disimpan!"),
        "success",
      );

      setTimeout(() => {
        router.push("/ProgramPage");
      }, 2000);
    } catch (error: any) {
      console.error("Error update campaign:", error);
      showToast(
        error.message ||
          t(
            "campaign_update_error",
            "Gagal memperbarui program. Cek koneksi Anda.",
          ),
        "error",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col items-center justify-center bg-linear-to-b from-[#7C3996] to-[#b359d4]">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-white font-bold animate-pulse">
          {t("loading_program_data", "Memuat data program...")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-linear-to-b from-[#7C3996] to-[#b359d4] shadow-2xl relative overflow-x-hidden">
      {toastAlert && (
        <div
          className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 duration-300 border w-[90%] max-w-sm ${
            toastAlert.type === "success"
              ? "bg-green-600/90 border-green-400 text-white"
              : "bg-red-600/90 border-red-400 text-white"
          }`}
        >
          {toastAlert.type === "success" ? (
            <CheckCircle2 size={24} className="shrink-0" />
          ) : (
            <AlertCircle size={24} className="shrink-0" />
          )}
          <span className="font-bold text-sm tracking-wide leading-snug">
            {toastAlert.message}
          </span>
        </div>
      )}

      <nav className="w-full px-6 pt-8 pb-4 flex items-center justify-between z-10">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg text-white font-bold tracking-wide drop-shadow-md">
          {t("edit_program", "Edit Program")}
        </h1>
        <div className="w-10 h-10" />
      </nav>

      <div className="flex-1 w-full bg-white/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-8 mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION GAMBAR KAMPANYE */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-gray-700">
                {t("campaign_banner_label", "Gambar Banner Kampanye")}
              </label>
              <span className="text-[10px] text-gray-400 font-medium">
                {existingImages.length + newFiles.length}/5 (Maks. 1MB/foto)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full bg-gray-50 border-2 border-dashed border-purple-200 rounded-2xl p-4">
              {/* Render Foto Lama */}
              {existingImages.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-white shadow-md group"
                >
                  <img
                    src={url}
                    alt={`Existing ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Render Foto Baru */}
              {newFilePreviews.map((url, index) => (
                <div
                  key={`new-${index}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-purple-300 shadow-md group"
                >
                  <img
                    src={url}
                    alt={`New Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-purple-500/80 text-white text-[9px] text-center py-0.5">
                    Baru
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Tombol Tambah Foto */}
              {existingImages.length + newFiles.length < MAX_IMAGES && (
                <label className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:bg-purple-100 hover:border-purple-500 transition-all">
                  <ImageIcon size={24} className="text-purple-400 mb-1" />
                  <span className="text-[10px] text-purple-600 font-semibold">
                    Tambah
                  </span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          <InputField
            label={`${t("campaign_title_label", "Judul Kampanye")} *`}
            value={form.title}
            onChange={(e: any) => handleChange("title", e.target.value)}
            icon={<Type size={18} />}
            placeholder={t(
              "campaign_title_placeholder",
              "Cth: Bantuan Korban Gempa...",
            )}
            required
          />

          {beneficiaryType === "individual" && (
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("wallet_address_label", "Alamat Wallet")}
              </label>
              <div className="flex items-center bg-gray-100 border-2 border-gray-200 rounded-2xl px-4 py-3.5 opacity-80 cursor-not-allowed">
                <div className="text-gray-400">
                  <Wallet size={18} />
                </div>
                <input
                  type="text"
                  value={form.wallet_address}
                  readOnly
                  placeholder="Memuat wallet dari profil..."
                  className="ml-3 w-full bg-transparent outline-none text-gray-600 font-mono text-sm cursor-not-allowed"
                />
                <Lock size={16} className="text-gray-400 ml-2 shrink-0" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">
              {t("category_label_req", "Kategori *")}
            </label>
            <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
                <Tag size={18} />
              </div>
              <select
                value={form.category_id}
                onChange={(e) => handleChange("category_id", e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium cursor-pointer"
              >
                <option value="1">{t("cat_education", "Pendidikan")}</option>
                <option value="2">{t("cat_health", "Kesehatan")}</option>
                <option value="3">{t("cat_disaster", "Bencana Alam")}</option>
                <option value="4">{t("cat_mosque", "Ekonomi")}</option>
                <option value="5">{t("cat_general", "Umum")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-bold text-gray-700 ml-1">
                {t("target_amount_label", "Target Dana")}{" "}
                <span className="text-gray-400 text-[10px] font-medium">
                  (Opsional)
                </span>
              </label>
              <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <div className="text-purple-600 font-bold text-sm mr-2">Rp</div>
                <input
                  type="number"
                  value={form.target_amount}
                  onChange={(e) =>
                    handleChange("target_amount", e.target.value)
                  }
                  placeholder="Tanpa batas"
                  className="w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal text-sm"
                />
              </div>
            </div>

            <InputField
              label={`${t("end_date_label", "Batas Waktu")} (Opsional)`}
              type="date"
              value={form.end_date}
              onChange={(e: any) => handleChange("end_date", e.target.value)}
              icon={<Calendar size={18} />}
              placeholder=""
              required={false}
            />
          </div>

          <div className="flex items-start gap-2 bg-purple-50/80 border border-purple-100 rounded-xl p-3 -mt-2">
            <AlertCircle
              size={16}
              className="text-purple-600 shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
              Biarkan kosong jika tidak ada{" "}
              <span className="font-bold text-purple-700">Target Dana</span>{" "}
              atau{" "}
              <span className="font-bold text-purple-700">
                Tanggal Berakhir
              </span>{" "}
              (program berjalan tanpa batas).
            </p>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">
              {t("short_desc_label_req", "Deskripsi Singkat *")}
            </label>
            <div className="group flex items-start bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300 mt-1">
                <FileText size={18} />
              </div>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder={t(
                  "short_desc_placeholder",
                  "Tuliskan rangkuman singkat kampanye ini...",
                )}
                rows={5} 
                className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal resize-y min-h-[100px] leading-relaxed" 
                
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">
              {t("objective_label_req", "Tujuan Detail Kampanye *")}
            </label>
            <div className="group flex items-start bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300 mt-1">
                <BookOpen size={18} />
              </div>
              <textarea
                value={form.story}
                onChange={(e) => handleChange("story", e.target.value)}
                placeholder={t(
                  "story_placeholder",
                  "Ceritakan latar belakang, kondisi saat ini, dan rincian penggunaan dana secara lengkap...",
                )}
                rows={12} 
                className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal resize-y min-h-[200px] leading-relaxed"
                
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="group relative w-full mt-4 flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-2xl font-bold shadow-[0_10px_20px_-10px_rgba(124,57,150,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(124,57,150,0.7)] hover:-translate-y-1 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {submitLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save
                  size={20}
                  className="transition-transform group-hover:scale-110"
                />
                <span className="text-lg">
                  {t("save_changes", "Simpan Perubahan")}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  icon,
  placeholder,
  type = "text",
  required = false,
}: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      <div className="group flex items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3.5 transition-all duration-300 focus-within:bg-white focus-within:border-purple-400 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <div className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="ml-3 w-full bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal"
        />
      </div>
    </div>
  );
}

export default function KelolaProgramPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#7C3996] to-[#b359d4]">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      }
    >
      <KelolaProgramContent />
    </Suspense>
  );
}
