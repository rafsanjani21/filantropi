/**
 * tests/unit/qrisSementara.leak.test.tsx
 *
 * Fungsi   : Memastikan QrisSementara tidak memakai setInterval/setTimeout dan tidak menampilkan countdown/masa berlaku.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Vitest saat `npm test` / `npx vitest`
 * Catatan  : Membaca source komponen secara statis untuk cek potensi memory leak timer, lalu merender QRIS tanpa elemen hitung mundur.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { render, screen } from "@testing-library/react";
import QrisSementara from "@/components/payment/QrisSementara";

/**
 * QA: QrisSementara — tidak ada masa berlaku/countdown QRIS.
 * Tanpa countdown: tidak ada setInterval, sehingga tidak ada risiko memory leak timer.
 */
describe("QrisSementara — tanpa masa berlaku", () => {
  const source = readFileSync(
    path.resolve(__dirname, "../../components/payment/QrisSementara.tsx"),
    "utf-8",
  );

  it("TIDAK menggunakan setInterval/setTimeout (tidak ada countdown)", () => {
    expect(source).not.toMatch(/setInterval\s*\(/);
    expect(source).not.toMatch(/setTimeout\s*\(/);
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
});
