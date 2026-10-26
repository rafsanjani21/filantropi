/**
 * lib/auth.service.ts
 *
 * Fungsi   : Kumpulan panggilan API autentikasi, profil pengguna, dan CRUD campaign melalui apiFetch.
 * Ekspor   : AuthService
 * Dipakai  : hooks/useAuth.ts, hooks/useCampaignDetail.ts, store/useAuthStore.ts, components/home/LatestPrograms.tsx, components/layout/GlobalLiveDonationBlink.tsx, app/(main)/programs/page.tsx, app/(main)/programs/new/page.tsx, app/(main)/programs/manage/page.tsx, app/(main)/programs/manage/[id]/edit/page.tsx
 * Catatan  : Logout memakai fetch langsung (bukan apiFetch) agar bisa refresh token sekali saat 401.
 */
import { apiFetch, BASE_URL } from "./api";
import { getAccessToken, setAccessToken, setTokens } from "./authTokens";

export const AuthService = {
  async login(id_token: string) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ id_token }),
    });
  },

  async register({
    id_token,
    name,
    wallet_address,
    role,
  }: {
    id_token: string;
    name: string;
    wallet_address: string;
    role: string;
  }) {
    const endpoint =
      role === "user"
        ? "/auth/register/donor"
        : "/auth/register/beneficiary";

    return apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        id_token,
        name,
        role,
        wallet_address,
      }),
    });
  },

  async logout(refresh_token: string) {
    let access_token = getAccessToken();

    const doLogout = async (token: string | null) => {
      return fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ refresh_token }),
      });
    };

    let res = await doLogout(access_token);

    if (res.status === 401) {
      const refreshRes = await fetch(
        `${BASE_URL}/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token }),
        },
      );

      const refreshData = await refreshRes.json();

      if (!refreshRes.ok) {
        throw new Error("Refresh token gagal saat logout");
      }

      access_token =
        refreshData?.data?.access_token ?? refreshData?.access_token ?? null;
      const nextRefreshToken =
        refreshData?.data?.refresh_token ?? refreshData?.refresh_token;

      if (access_token && typeof nextRefreshToken === "string" && nextRefreshToken) {
        setTokens(access_token, nextRefreshToken);
      } else if (access_token) {
        setAccessToken(access_token);
      }

      res = await doLogout(access_token);
    }

    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!res.ok) {
      console.error("LOGOUT ERROR:", data);
      throw new Error(data.message || "Logout gagal");
    }

    return data;
  },

  async updateProfile(formData: FormData, role: string) {
    const endpoint = (role === "beneficiary" || role === "penerima_manfaat") 
      ? "/user/profile/update-beneficiaries" 
      : "/user/profile/update-donors";

    return apiFetch(endpoint, {
      method: "PUT",
      body: formData,
    });
  },

  async getProfile(
    type: "donor" | "beneficiary" = "donor",
    options: { keepSession?: boolean } = {},
  ) {
    const endpoint = type === "beneficiary" 
      ? "/user/profile/beneficiaries" 
      : "/user/profile/donors";

    return apiFetch(
      endpoint,
      {
        method: "GET",
      },
      options,
    );
  },

  // 1. GET ALL
  async getCampaigns() {
    return apiFetch("/campaigns/", { 
      method: "GET",
    });
  },

  // 2. GET DETAIL (Mencari berdasarkan Slug)
  async getCampaignDetail(slug: string) {
    return apiFetch(`/campaigns/${encodeURIComponent(slug)}`, {
      method: "GET",
    });
  },

  // 3. CREATE
  async createCampaign(formData: FormData) {
    return apiFetch("/campaigns/", {
      method: "POST",
      body: formData,
    });
  },

  // 4. GET MY CAMPAIGNS
  async getMyCampaigns() {
    return apiFetch("/campaigns/me", {
      method: "GET",
    });
  },

  // 5. UPDATE CAMPAIGN (FUNGSI BARU UNTUK EDIT)
  async updateCampaign(identifier: string, formData: FormData) {
    return apiFetch(`/campaigns/${encodeURIComponent(identifier)}`, {
      method: "PUT", 
      body: formData,
    });
  },
};