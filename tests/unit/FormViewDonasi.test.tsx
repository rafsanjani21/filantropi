/**
 * tests/unit/FormViewDonasi.test.tsx
 *
 * Fungsi   : Unit test rendering dan interaksi FormView Donasi (nominal, anonim, sanitasi telepon, tombol).
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Vitest saat `npm test` / `npx vitest`
 * Catatan  : Memverifikasi toggle anonim, penghapusan huruf telepon, disabled saat isProcessing, dan safeRp untuk amount negatif.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormView from "@/app/(main)/programs/[slug]/donate/_components/FormView";

const baseProps = {
  campaign: { id: 1, title: "Program Tes" },
  amount: 50000 as number | "",
  selectedMethod: { id: "QRIS", name: "QRIS Dinamis", logo: "" },
  name: "Budi Santoso",
  setName: vi.fn(),
  phone: "081234567890",
  setPhone: vi.fn(),
  email: "budi@mail.com",
  setEmail: vi.fn(),
  isAnonymous: false,
  setIsAnonymous: vi.fn(),
  doa: "",
  setDoa: vi.fn(),
  onSubmit: vi.fn(),
  isProcessing: false,
  onBack: vi.fn(),
  onChangeMethod: vi.fn(),
};

describe("FormView (Donasi) — rendering & interaksi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("merender judul, total donasi terformat, dan nama pengguna", () => {
    render(<FormView {...baseProps} />);
    expect(screen.getByText("Konfirmasi Donasi")).toBeInTheDocument();
    expect(screen.getAllByText("Rp 50.000").length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText("Nama Lengkap")).toHaveValue("Budi Santoso");
  });

  it("toggle Anonim memanggil setIsAnonymous(true) — input nama hilang jika prop isAnonymous=true", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FormView {...baseProps} />);
    expect(screen.getByPlaceholderText("Nama Lengkap")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox"));
    expect(baseProps.setIsAnonymous).toHaveBeenCalledWith(true);
    // Komponen controlled: simulasi parent menerapkan state baru
    rerender(<FormView {...baseProps} isAnonymous={true} />);
    expect(screen.queryByPlaceholderText("Nama Lengkap")).not.toBeInTheDocument();
  });

  it("input nama tidak dirender saat isAnonymous=true (controlled prop)", () => {
    render(<FormView {...baseProps} isAnonymous={true} />);
    expect(screen.queryByPlaceholderText("Nama Lengkap")).not.toBeInTheDocument();
    expect(screen.getByText("Sembunyikan nama (Anonim)")).toBeInTheDocument();
  });

  it("input telepon MENGHAPUS huruf (sanitasi regex \\D)", () => {
    const setPhone = vi.fn();
    const { getByPlaceholderText } = render(
      <FormView {...baseProps} phone="" setPhone={setPhone} />,
    );
    const phoneInput = getByPlaceholderText("08xxxxxxxxxx");
    fireEvent.change(phoneInput, { target: { value: "08ab12!" } });
    expect(setPhone).toHaveBeenLastCalledWith("0812");
    fireEvent.change(phoneInput, { target: { value: "abc" } });
    expect(setPhone).toHaveBeenLastCalledWith("");
    fireEvent.change(phoneInput, { target: { value: "+62 812-3456" } });
    expect(setPhone).toHaveBeenLastCalledWith("628123456");
  });

  it("tombol submit DISABLED dan label 'Memproses...' saat isProcessing=true (anti double-submit)", () => {
    render(<FormView {...baseProps} isProcessing={true} />);
    const btn = screen.getByRole("button", { name: /Memproses/ });
    expect(btn).toBeDisabled();
  });

  it("tombol submit aktif dan memanggil onSubmit saat diklik", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FormView {...baseProps} onSubmit={onSubmit} />);
    const btn = screen.getByRole("button", { name: "Lanjut Pembayaran" });
    expect(btn).toBeEnabled();
    await user.click(btn);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("tombol Back DAN UBAH juga DISABLED saat isProcessing=true (sama dengan Wakaf)", () => {
    render(<FormView {...baseProps} isProcessing={true} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
    expect(screen.getByRole("button", { name: "UBAH" })).toBeDisabled();
  });

  it("tombol UBAH memanggil onChangeMethod", async () => {
    const user = userEvent.setup();
    const onChangeMethod = vi.fn();
    render(<FormView {...baseProps} onChangeMethod={onChangeMethod} />);
    await user.click(screen.getByRole("button", { name: "UBAH" }));
    expect(onChangeMethod).toHaveBeenCalledTimes(1);
  });

  it("memformat amount kosong menjadi Rp 0 (Number('') === 0)", () => {
    render(<FormView {...baseProps} amount={""} />);
    expect(screen.getAllByText("Rp 0").length).toBeGreaterThan(0);
  });

  it("FIXED: amount negatif dirender AMAN sebagai Rp 0 (safeRp guard)", () => {
    render(<FormView {...baseProps} amount={-5000} />);
    expect(screen.getAllByText("Rp 0").length).toBeGreaterThan(0);
  });
});
