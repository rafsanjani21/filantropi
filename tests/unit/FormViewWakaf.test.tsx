import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormWakafView from "@/app/(main)/wakaf/[slug]/donate/_components/FormView";

const baseProps = {
  amount: 1000000 as number | "",
  selectedMethod: { id: "QRIS", name: "QRIS Dinamis", logo: "" },
  wakafName: "Almarhum Ahmad",
  name: "Budi Santoso",
  setName: vi.fn(),
  email: "budi@mail.com",
  setEmail: vi.fn(),
  phone: "081234567890",
  setPhone: vi.fn(),
  nik: "",
  setNik: vi.fn(),
  doa: "",
  setDoa: vi.fn(),
  onSubmit: vi.fn(),
  isProcessing: false,
  onBack: vi.fn(),
  onChangeMethod: vi.fn(),
};

describe("FormWakafView (Wakaf) — rendering & interaksi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("merender judul Konfirmasi Wakaf, nama wakif read-only, dan total terformat", () => {
    render(<FormWakafView {...baseProps} />);
    expect(screen.getByText("Konfirmasi Wakaf")).toBeInTheDocument();
    expect(screen.getByText("Almarhum Ahmad")).toBeInTheDocument();
    expect(screen.getByText("Rp 1.000.000")).toBeInTheDocument();
  });

  it("input telepon MENGHAPUS huruf", () => {
    const setPhone = vi.fn();
    const { getByPlaceholderText } = render(
      <FormWakafView {...baseProps} phone="" setPhone={setPhone} />,
    );
    fireEvent.change(getByPlaceholderText("08xxxxxxxxxx"), {
      target: { value: "xyz0899" },
    });
    expect(setPhone).toHaveBeenLastCalledWith("0899");
  });

  it("NIK: huruf dihapus dan di-TRUNCATE ke 16 digit (input 20 digit -> 16 digit)", () => {
    const setNik = vi.fn();
    const { getByPlaceholderText } = render(
      <FormWakafView {...baseProps} nik="" setNik={setNik} />,
    );
    const nikInput = getByPlaceholderText("Nomor NIK (Opsional)");

    fireEvent.change(nikInput, { target: { value: "abcdefghij" } });
    expect(setNik).toHaveBeenCalledWith("");

    vi.clearAllMocks();
    fireEvent.change(nikInput, { target: { value: "12345678901234567890" } });
    // 20 digit -> di-truncate menjadi 16 digit
    expect(setNik).toHaveBeenCalledWith("1234567890123456");

    fireEvent.change(nikInput, { target: { value: "1234567890123456" } });
    expect(setNik).toHaveBeenCalledWith("1234567890123456");
  });

  it("tombol submit DISABLED saat isProcessing=true (anti double-submit)", () => {
    render(<FormWakafView {...baseProps} isProcessing={true} />);
    expect(screen.getByRole("button", { name: /Memproses/ })).toBeDisabled();
  });

  it("tombol Back DAN UBAH juga DISABLED saat isProcessing=true", () => {
    render(<FormWakafView {...baseProps} isProcessing={true} />);
    const ubah = screen.getByRole("button", { name: "UBAH" });
    expect(ubah).toBeDisabled();
    const buttons = screen.getAllByRole("button");
    // Tombol pertama (Back/ArrowLeft) harus disabled — berbeda dengan FormView Donasi
    expect(buttons[0]).toBeDisabled();
  });

  it("submit memanggil onSubmit jika semua field terisi", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FormWakafView {...baseProps} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Lanjutkan Pembayaran" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("menampilkan nama 'Hamba Allah' jika wakafName kosong-fallback sudah di-handle parent", () => {
    render(<FormWakafView {...baseProps} wakafName="Hamba Allah" />);
    expect(screen.getByText("Hamba Allah")).toBeInTheDocument();
  });

  it("FIXED: amount negatif dirender AMAN sebagai Rp 0 (safeRp guard)", () => {
    render(<FormWakafView {...baseProps} amount={-500000} />);
    expect(screen.getByText("Rp 0")).toBeInTheDocument();
  });
});
