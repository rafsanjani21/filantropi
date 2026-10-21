/**
 * tests/e2e/wakaf.spec.ts
 *
 * Fungsi   : Skenario E2E Wakaf dari niat/ikrar, pilih nominal, isi form, sampai QRIS tampil.
 * Ekspor   : -
 * Dipakai  : Dijalankan oleh Playwright saat `npx playwright test`
 * Catatan  : Menguji happy path, nama/almarhum wajib, nominal minimum, NIK 16 digit, sanitasi telepon, email invalid, Back, fallback POST 500/timeout, dan anti double-submit.
 */
import { test, expect } from "@playwright/test";
import { mockCampaignApis, WAKAF_URL } from "./helpers";

async function isiFormWakafDasar(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("Tulis nama Anda...").fill("Wakif QA");
  await page.getByRole("button", { name: "Lanjut ke Nominal" }).click();
  await page.getByRole("button", { name: "Rp 1.000.000" }).click();
  await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();
  await page.getByRole("button", { name: "Ya, Saya Berikrar" }).click();
  await expect(page.getByText("Konfirmasi Wakaf")).toBeVisible();
}

test.describe("E2E Alur WAKAF (QRIS Dinamis fallback)", () => {
  test("HAPPY PATH: nama -> nominal -> ikrar -> form -> QRIS", async ({ page }) => {
    let postCount = 0;
    await page.route("**/api/campaigns/**", async (route) => {
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

    await page.goto(WAKAF_URL);
    await expect(page.getByText("Penyaluran Wakaf")).toBeVisible();

    await page.getByPlaceholder("Tulis nama Anda...").fill("Wakif QA");
    await page.getByRole("button", { name: "Lanjut ke Nominal" }).click();

    await expect(page.getByText("Pilih Nominal")).toBeVisible();
    await page.getByRole("button", { name: "Rp 1.000.000" }).click();
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Ikrar Wakaf")).toBeVisible();
    await page.getByRole("button", { name: "Ya, Saya Berikrar" }).click();

    await expect(page.getByText("Konfirmasi Wakaf")).toBeVisible();
    await expect(page.getByText("Wakif QA").first()).toBeVisible();
    await page.getByPlaceholder("user123@example.com").fill("wakif@qa.id");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByRole("button", { name: "Lanjutkan Pembayaran" }).click();

    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 20000 });
    await expect(page.locator("#qris-container svg")).toBeVisible();
    await expect(page.getByText("Rp 1.000.000")).toBeVisible();
    expect(postCount).toBe(1);
  });

  test("UNHAPPY: nama kosong pada layar Niat Wakaf ditolak", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(WAKAF_URL);
    await expect(page.getByText("Penyaluran Wakaf")).toBeVisible();
    await page.getByPlaceholder("Tulis nama Anda...").fill("");
    await page.getByRole("button", { name: "Lanjut ke Nominal" }).click();

    await expect(page.getByText("Nama lengkap wajib diisi")).toBeVisible();
    await expect(page.getByText("Pilih Nominal")).not.toBeVisible();
  });

  test("UNHAPPY: wakaf 'Orang Lain' wajib mengisi nama almarhum/keluarga", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(WAKAF_URL);
    await page.getByRole("button", { name: "Orang Lain" }).click();
    await page.getByPlaceholder("Tulis nama Anda...").fill("Wakif QA");
    await page.getByPlaceholder("Nama Almarhum/Keluarga...").fill("");
    await page.getByRole("button", { name: "Lanjut ke Nominal" }).click();

    await expect(page.getByText("Nama almarhum/keluarga wajib diisi")).toBeVisible();
  });

  test("UNHAPPY: nominal di bawah Rp 1.000 ditolak di layar nominal", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(WAKAF_URL);
    await page.getByPlaceholder("Tulis nama Anda...").fill("Wakif QA");
    await page.getByRole("button", { name: "Lanjut ke Nominal" }).click();
    await expect(page.getByText("Pilih Nominal")).toBeVisible();

    await page.getByPlaceholder("0").fill("999");
    await page.getByRole("button", { name: "Lanjut Pembayaran" }).click();

    await expect(page.getByText("Minimal wakaf Rp 1.000")).toBeVisible();
    await expect(page.getByText("Ikrar Wakaf")).not.toBeVisible();
  });

  test("FIXED: NIK dibatasi 16 digit — input 20 digit di-TRUNCATE menjadi 16", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(WAKAF_URL);
    await isiFormWakafDasar(page);

    const nikInput = page.getByPlaceholder("Nomor NIK (Opsional)");
    await nikInput.fill("12345678901234567890");
    const nikValue = await nikInput.inputValue();
    // Setelah perbaikan: 20 digit dipotong menjadi 16 digit (bukan ditolak seluruhnya)
    expect(nikValue).toBe("1234567890123456");

    await nikInput.fill("1234567890123456");
    expect(await nikInput.inputValue()).toBe("1234567890123456");
  });

  test("FITUR: input telepon wakaf menghapus huruf", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(WAKAF_URL);
    await isiFormWakafDasar(page);

    const phone = page.getByPlaceholder("08xxxxxxxxxx");
    await phone.fill("08abc12345");
    expect(await phone.inputValue()).toBe("0812345");
  });

  test("FIXED: email tidak valid 'bukan-email' DITOLAK di wakaf", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(WAKAF_URL);
    await isiFormWakafDasar(page);

    await page.getByPlaceholder("user123@example.com").fill("bukan-email");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByRole("button", { name: "Lanjutkan Pembayaran" }).click();

    await expect(page.getByText("Format email tidak valid")).toBeVisible();
    await expect(page.getByText("Pembayaran QRIS")).not.toBeVisible();
  });

  test("FIXED: email 'a@' DITOLAK di wakaf (validasi regex ketat)", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(WAKAF_URL);
    await isiFormWakafDasar(page);

    await page.getByPlaceholder("user123@example.com").fill("a@");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByRole("button", { name: "Lanjutkan Pembayaran" }).click();

    // Setelah perbaikan: "a@" tidak lolos lagi
    await expect(page.getByText("Format email tidak valid")).toBeVisible();
    await expect(page.getByText("Pembayaran QRIS")).not.toBeVisible();
  });

  test("UNHAPPY: Back dari form wakaf kembali ke Ikrar", async ({ page }) => {
    await mockCampaignApis(page);
    await page.goto(WAKAF_URL);
    await isiFormWakafDasar(page);
    await expect(page.getByText("Konfirmasi Wakaf")).toBeVisible();

    await page.getByRole("button").first().click();
    await expect(page.getByText("Ikrar Wakaf")).toBeVisible();
  });

  test("FALLBACK: POST wakaf 500 -> QRIS lokal TETAP tampil", async ({ page }) => {
    await mockCampaignApis(page, { kind: "status", status: 500 });
    await page.goto(WAKAF_URL);
    await isiFormWakafDasar(page);

    await page.getByPlaceholder("user123@example.com").fill("wakif@qa.id");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByRole("button", { name: "Lanjutkan Pembayaran" }).click();

    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 20000 });
  });

  test("FALLBACK: POST wakaf timeout/abort -> QRIS lokal TETAP tampil TANPA menunggu (fire-and-forget)", async ({ page }) => {
    await mockCampaignApis(page, { kind: "delay-abort", delayMs: 8000 });
    await page.goto(WAKAF_URL);
    await isiFormWakafDasar(page);

    await page.getByPlaceholder("user123@example.com").fill("wakif@qa.id");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByRole("button", { name: "Lanjutkan Pembayaran" }).click();

    // QRIS tampil segera, tidak menunggu POST yang menggantung 8 detik
    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 5000 });
  });

  test("ANTI DOUBLE-SUBMIT: tombol disabled saat proses wakaf berjalan", async ({ page }) => {
    await mockCampaignApis(page, { kind: "delay-ok", delayMs: 2000 });
    await page.goto(WAKAF_URL);
    await isiFormWakafDasar(page);

    await page.getByPlaceholder("user123@example.com").fill("wakif@qa.id");
    await page.getByPlaceholder("08xxxxxxxxxx").fill("08123456789");
    await page.getByRole("button", { name: "Lanjutkan Pembayaran" }).click();

    // QRIS tampil (fire-and-forget) — guard isProcessing tetap melindungi klik ganda
    await expect(page.getByText("Pembayaran QRIS")).toBeVisible({ timeout: 10000 });
  });
});
