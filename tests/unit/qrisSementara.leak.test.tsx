/**
 * tests/unit/qrisSementara.leak.test.tsx
 *
 * Fungsi   : Memastikan QrisSementara tidak memiliki countdown berulang (setInterval) dan
 *            menampilkan status pencatatan transaksi dengan benar.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Vitest saat `npm test` / `npx vitest`
 * Catatan  : setTimeout satu kali untuk revoke object URL hasil unduhan bukan timer berulang,
 *            sehingga aman dari memory leak saat komponen di-unmount.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { render, screen } from "@testing-library/react";
import QrisSementara from "@/components/payment/QrisSementara";

describe("QrisSementara — tanpa countdown & status transaksi", () => {
  const source = readFileSync(
    path.resolve(__dirname, "../../components/payment/QrisSementara.tsx"),
    "utf-8",
  );

  it("TIDAK memakai setInterval (tidak ada countdown berulang)", () => {
    expect(source).not.toMatch(/setInterval\s*\(/);
  });

  it("TIDAK menampilkan teks masa berlaku/kedaluwarsa", () => {
    expect(source).not.toMatch(/kedaluwarsa/i);
    expect(source).not.toMatch(/Berlaku /);
  });

  it("merender QRIS dan total tanpa elemen hitungan mundur", () => {
    render(
      <QrisSementara
        amount={50000}
        qrisString="000201010212TEST"
        transactionType="donasi"
        onBack={() => {}}
        onCheckStatus={() => {}}
      />,
    );
    expect(screen.getByText("Total Donasi")).toBeInTheDocument();
    expect(screen.getByText("Rp 50.000")).toBeInTheDocument();
    expect(screen.getByText("Saya Sudah Membayar")).toBeEnabled();
  });

  it("menampilkan peringatan saat pencatatan transaksi gagal", () => {
    render(
      <QrisSementara
        amount={50000}
        qrisString="000201010212TEST"
        transactionType="donasi"
        onBack={() => {}}
        onCheckStatus={() => {}}
        recordStatus="failed"
        recordError="500"
      />,
    );
    expect(
      screen.getByText(/Pencatatan otomatis gagal/i),
    ).toBeInTheDocument();
  });
});
