/**
 * tests/e2e/donasi.spec.ts
 *
 * Fungsi   : Skenario E2E Donasi dari pilih nominal, isi form, sampai QRIS tampil, termasuk validasi, Back, dan error state.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Playwright saat `npx playwright test`
 * Catatan  : Menguji happy path, nominal < Rp 1.000, minus ditolak, email/nama invalid, anonim, fallback POST 500/timeout, anti double-submit, dan campaign error.
 */
import { test, expect } from "@playwright/test";
import {
  mockCampaignApis,
  mockTransactionDetail,
  DONASI_URL,
} from "./helpers";

test.describe("E2E Alur DONASI (QRIS Dinamis fallback)", () => {
  test("HAPPY PATH: nominal -> form -> QRIS muncul dengan nominal yang benar", async ({ page }) => {
    let postCount = 0;
    await page.route("**/campaigns/**", async (route) => {
      const req = route.request();
      if (req.method() === "GET") {
        if (req.url().includes("/campaigns/transactions/")) {
          return route.fulfill({ json: { data: [] } });
        }
        return route.fulfill({
          json: {
            data: {
              id: 42,
              slug: "program-tes-qa",
              title: "Program Tes QA",
              status: "active",
              current_amount: 12500000,
              image_banner: "",
              end_date: null,
            },
          },
        });
      }
      if (req.method() === "POST") {
        postCount++;
        return route.fulfill({ status: 200, json: { error: false, data: {} } });
      }
      return route.fallback();
    });

    await page.goto(DONASI_URL);
    await expect(page.getByText("Pilih Nominal")).toBeVisible();
    await expect(page.getByText("Program Tes QA")).toBeVisible();

    await page.getByRole("button", { name: "Rp 50.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Konfirmasi Donasi")).toBeVisible();
    await page.getByPlaceholder("Nama Lengkap").fill("Budi QA");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByPlaceholder("user@example.com").fill("budi@qa.id");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 20000 });
    await expect(page.locator("#qris-container svg")).toBeVisible();
    await expect(page.getByText("Rp 50.000")).toBeVisible();
    await expect.poll(() => postCount).toBe(1);
  });

  test("STATUS FLOW: 'Saya Sudah Membayar' -> pending -> sukses setelah status berubah", async ({
    page,
  }) => {
    await mockCampaignApis(page);
    await mockTransactionDetail(page, ["pending", "success"]);

    await page.goto(DONASI_URL);
    await page.getByRole("button", { name: "Rp 50.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();
    await page.getByPlaceholder("Nama Lengkap").fill("Budi QA");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByPlaceholder("user@example.com").fill("budi@qa.id");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({
      timeout: 20000,
    });
    await page.getByRole("button", { name: "Saya Sudah Membayar" }).click();

    await expect(page).toHaveURL(/\/payment\/pending\?/);
    expect(new URL(page.url()).searchParams.get("trx_id")).toBe("123");
    await expect(
      page.getByRole("heading", { name: "Menunggu Pembayaran" }),
    ).toBeVisible();

    await expect(page).toHaveURL(/\/payment\/success\?trx_id=123/, {
      timeout: 20000,
    });
    await expect(
      page.getByText("Transaksi Anda Telah Berhasil"),
    ).toBeVisible();
  });

  test("UNHAPPY: nominal di bawah Rp 1.000 ditolak", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(DONASI_URL);
    await expect(page.getByText("Pilih Nominal")).toBeVisible();

    await page.getByPlaceholder("0").fill("500");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Minimal donasi Rp 1.000")).toBeVisible();
    await expect(page.getByText("Konfirmasi Donasi")).not.toBeVisible();
  });

  test("UNHAPPY: input minus pada nominal tidak bisa dimasukkan (regex \\D)", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(DONASI_URL);
    await expect(page.getByText("Pilih Nominal")).toBeVisible();

    await page.getByPlaceholder("0").fill("-10000");
    const value = await page.getByPlaceholder("0").inputValue();
    expect(value).toBe("10.000");
  });

  test("UNHAPPY: submit dengan nama kosong (non-anonim) ditolak", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(DONASI_URL);
    await page.getByRole("button", { name: "Rp 100.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Konfirmasi Donasi")).toBeVisible();
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByPlaceholder("user@example.com").fill("budi@qa.id");
    // nama dikosongkan
    await page.getByPlaceholder("Nama Lengkap").fill("");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.locator("#donation-name-error")).toHaveText(
      "Nama wajib diisi",
    );
    await expect(page.getByText("Pembayaran QRIS")).not.toBeVisible();
  });

  test("FIXED: email TANPA format valid DITOLAK di donasi", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(DONASI_URL);
    await page.getByRole("button", { name: "Rp 100.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Konfirmasi Donasi")).toBeVisible();
    await page.getByPlaceholder("Nama Lengkap").fill("Budi");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByPlaceholder("user@example.com").fill("bukan-email-tanpa-titik");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    // Setelah perbaikan: email tidak valid harus DITOLAK
    await expect(page.locator("#donation-email-error")).toHaveText(
      "Format email tidak valid",
    );
    await expect(page.getByText("Pembayaran QRIS")).not.toBeVisible();
  });

  test("FITUR: toggle Anonim menyembunyikan input nama dan submit tetap bisa (Hamba Allah)", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(DONASI_URL);
    await page.getByRole("button", { name: "Rp 50.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Konfirmasi Donasi")).toBeVisible();
    const nameInput = page.getByPlaceholder("Nama Lengkap");
    await expect(nameInput).toBeVisible();
    // Checkbox berarsitektur "sr-only" — diklik paksa karena berada di belakang toggle visual
    await page.getByRole("checkbox").check({ force: true });
    await expect(nameInput).not.toBeVisible();

    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByPlaceholder("user@example.com").fill("anon@qa.id");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 20000 });
  });

  test("UNHAPPY: tombol Back di tengah form mengembalikan ke nominal dengan nilai terjaga", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(DONASI_URL);
    await page.getByRole("button", { name: "Rp 200.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();
    await expect(page.getByText("Konfirmasi Donasi")).toBeVisible();

    // Tombol Back (ArrowLeft) adalah tombol pertama di header form
    await page.getByRole("button").first().click();
    await expect(page.getByText("Pilih Nominal")).toBeVisible();
    // Amount tetap terpilih (state tidak reset)
    await expect(page.getByText("Rp 200.000").first()).toBeVisible();
  });

  test("UNHAPPY: tombol Back di layar QRIS kembali ke form (bukan reset)", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(DONASI_URL);
    await page.getByRole("button", { name: "Rp 50.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();
    await page.getByPlaceholder("Nama Lengkap").fill("Budi");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByPlaceholder("user@example.com").fill("budi@qa.id");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();
    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 20000 });

    await page.getByRole("button").first().click();
    await expect(page.getByText("Konfirmasi Donasi")).toBeVisible();
  });

  test("FALLBACK: POST transaksi 500 -> QRIS lokal TETAP tampil", async ({ page }) => {
    await mockCampaignApis(page, { kind: "status", status: 500 });
    await page.goto(DONASI_URL);
    await page.getByRole("button", { name: "Rp 50.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();
    await page.getByPlaceholder("Nama Lengkap").fill("Budi");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByPlaceholder("user@example.com").fill("budi@qa.id");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 20000 });
    await expect(page.locator("#qris-container svg")).toBeVisible();
    await expect(
      page.getByText(/Pencatatan otomatis gagal/i).last(),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "Saya Sudah Membayar" }).click();
    await expect(page).toHaveURL(/\/payment\/pending/);
    await expect(
      page.getByRole("heading", { name: "Verifikasi Pembayaran" }),
    ).toBeVisible();
  });

  test("FALLBACK: POST transaksi timeout/abort -> QRIS lokal TETAP tampil TANPA menunggu (fire-and-forget)", async ({ page }) => {
    await mockCampaignApis(page, { kind: "delay-abort", delayMs: 8000 });
    await page.goto(DONASI_URL);
    await page.getByRole("button", { name: "Rp 50.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();
    await page.getByPlaceholder("Nama Lengkap").fill("Budi");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByPlaceholder("user@example.com").fill("budi@qa.id");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    // Setelah perbaikan: QRIS tampil SEGERA, tidak menunggu POST settle (8 detik)
    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#qris-container svg")).toBeVisible();
  });

  test("FIXED ANTI DOUBLE-SUBMIT: klik ganda hanya menghasilkan 1 request POST", async ({ page }) => {
    let postCount = 0;
    await page.route("**/campaigns/**", async (route) => {
      const req = route.request();
      if (req.method() === "GET") {
        if (req.url().includes("/campaigns/transactions/")) {
          return route.fulfill({ json: { data: [] } });
        }
        return route.fulfill({
          json: {
            data: {
              id: 42,
              slug: "program-tes-qa",
              title: "Program Tes QA",
              status: "active",
              current_amount: 1,
              image_banner: "",
              end_date: null,
            },
          },
        });
      }
      if (req.method() === "POST") {
        postCount++;
        await new Promise((r) => setTimeout(r, 1500));
        return route.fulfill({ status: 200, json: { error: false, data: {} } });
      }
      return route.fallback();
    });

    await page.goto(DONASI_URL);
    await page.getByRole("button", { name: "Rp 50.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();
    await page.getByPlaceholder("Nama Lengkap").fill("Budi");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByPlaceholder("user@example.com").fill("budi@qa.id");

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find((b) => b.textContent?.includes("Lanjut Pembayaran"));
      (btn as HTMLButtonElement)?.click();
      (btn as HTMLButtonElement)?.click();
    });

    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 25000 });
    // Tunggu sampai request POST tercatat, lalu pastikan hanya 1
    await expect.poll(() => postCount, { timeout: 5000 }).toBe(1);
  });

  test("STATE MANIPULATION: nominal 9 digit (maksimum wajar) tetap menghasilkan QRIS", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(DONASI_URL);
    await page.getByPlaceholder("0").fill("999999999");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();
    await page.getByPlaceholder("Nama Lengkap").fill("Budi");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByPlaceholder("user@example.com").fill("budi@qa.id");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 20000 });
    await expect(page.getByText("Rp 999.999.999")).toBeVisible();
  });

  test("UNHAPPY: campaign API error -> pesan 'Data program tidak ditemukan'", async ({ page }) => {
    await page.route("**/campaigns/**", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({ status: 500, json: { message: "Server error" } });
      }
      return route.fallback();
    });
    await page.goto(DONASI_URL);
    await expect(page.getByText("Data program tidak ditemukan")).toBeVisible({ timeout: 20000 });
  });
});
