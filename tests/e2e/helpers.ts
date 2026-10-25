/**
 * tests/e2e/helpers.ts
 *
 * Fungsi   : Menyediakan data campaign dummy, tipe perilaku POST, dan mockCampaignApis untuk mencegat request /campaigns/**.
 * Ekspor   : CAMPAIGN_MOCK, PostBehavior, mockCampaignApis, mockTransactionDetail, SLUG, DONASI_URL, WAKAF_URL
 * Dipakai  : tests/e2e/donasi.spec.ts, tests/e2e/wakaf.spec.ts
 * Catatan  : Mendukung respons POST sukses, status error, delay-abort (timeout), dan delay-ok agar E2E tidak butuh backend.
 */
import type { Page } from "@playwright/test";

export const CAMPAIGN_MOCK = {
  data: {
    id: 42,
    slug: "program-tes-qa",
    title: "Program Tes QA",
    name: "Program Tes QA",
    status: "active",
    current_amount: 12_500_000,
    image_banner: "",
    end_date: null,
    wallet_address: "",
    user: { wallet_address: "" },
  },
};

export type PostBehavior =
  | { kind: "ok" }
  | { kind: "status"; status: number }
  | { kind: "delay-abort"; delayMs: number }
  | { kind: "delay-ok"; delayMs: number };

/**
 * Mencegat SELURUH request ke /campaigns/... (tanpa bergantung prefix /api):
 * - GET  /campaigns/transactions/...  -> riwayat kosong
 * - GET  /campaigns/{slug}            -> data campaign dummy (useCampaignDetail)
 * - POST /campaigns/create/v2/...     -> perilaku bisa dikonfigurasi (ok/500/timeout)
 */
export async function mockCampaignApis(
  page: Page,
  post: PostBehavior = { kind: "ok" },
) {
  await page.route("**/campaigns/**", async (route) => {
    const req = route.request();
    const url = req.url();

    if (req.method() === "GET") {
      if (url.includes("/campaigns/transactions/")) {
        return route.fulfill({ json: { data: [] } });
      }
      return route.fulfill({ json: CAMPAIGN_MOCK });
    }

    if (req.method() === "POST") {
      if (post.kind === "delay-abort") {
        await new Promise((r) => setTimeout(r, post.delayMs));
        return route.abort("timedout");
      }
      if (post.kind === "delay-ok") {
        await new Promise((r) => setTimeout(r, post.delayMs));
        return route.fulfill({
          status: 200,
          json: {
            error: false,
            data: { id: 123, status: "pending", payment_code: "MOCK-QRIS" },
          },
        });
      }
      if (post.kind === "status") {
        return route.fulfill({
          status: post.status,
          json: { error: true, message: "Gateway error" },
        });
      }
      return route.fulfill({
        status: 200,
        json: {
          error: false,
          data: { id: 123, status: "pending", payment_code: "MOCK-QRIS" },
        },
      });
    }

    return route.fallback();
  });
}

/**
 * Mencegat GET /transactions/:id untuk halaman pending/success.
 * Status dikembalikan berurutan; entri terakhir diulang untuk polling berikutnya.
 */
export async function mockTransactionDetail(
  page: Page,
  statuses: string[],
  trxId = "123",
) {
  let call = 0;

  await page.route("**/transactions/**", async (route) => {
    if (route.request().method() !== "GET") return route.fallback();

    const status = statuses[Math.min(call, statuses.length - 1)];
    call += 1;

    if (route.request().url().includes(`/transactions/${trxId}`)) {
      return route.fulfill({
        json: {
          data: {
            id: Number(trxId),
            transaction_code: `TRX-${trxId}`,
            status,
            amount: 50_000,
            campaign_name: "Program Tes QA",
            sender_name: "Budi QA",
          },
        },
      });
    }

    return route.fulfill({ json: { data: [] } });
  });
}

export const SLUG = "program-tes-qa";
export const DONASI_URL = `/programs/${SLUG}/donate`;
export const WAKAF_URL = `/wakaf/${SLUG}/donate`;
