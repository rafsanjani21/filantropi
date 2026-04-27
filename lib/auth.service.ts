
import { apiFetch } from "./api";

export const AuthService = {
  async login(id_token: string) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ id_token }),
    });
  },

  // PASTIKAN FUNGSI INI MENERIMA DAN MENGIRIM ROLE
  // Di dalam AuthService (file auth.service.ts)

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
    // Tentukan URL berdasarkan peran (role)
    const endpoint =
      role === "user"
        ? "/auth/register/donor"
        : "/auth/register/beneficiary";

    // Karena di useAuth kita otomatis mendaftarkan Pengguna Umum,
    // endpoint yang akan terpanggil adalah /auth/register/donor
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
    let access_token = localStorage.getItem("access_token");

    // 🔥 helper request logout
    const doLogout = async (token: string | null) => {
      return fetch("http://192.168.52.29:8080/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ refresh_token }),
      });
    };

    let res = await doLogout(access_token);

    // 🔥 kalau token expired → refresh dulu
    if (res.status === 401) {
      const refreshRes = await fetch(
        "http://192.168.52.29:8080/api/auth/refresh-token",
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

      // 🔥 simpan token baru
      access_token = refreshData.data.access_token;
      if (access_token !== null) {
        localStorage.setItem("access_token", access_token);
      } else {
        localStorage.removeItem("access_token");
      }

      // 🔥 retry logout
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

  // Ubah fungsi ini di dalam auth.service.ts
  async updateProfile(formData: FormData, role: string) {
    // Tentukan endpoint berdasarkan role
    const endpoint = (role === "beneficiary" || role === "penerima_manfaat") 
      ? "/user/profile/update-beneficiaries" 
      : "/user/profile/update-donors";

    return apiFetch(endpoint, {
      method: "PUT", // CATATAN: Pastikan ini PUT atau POST sesuai dengan backend Anda
      body: formData,
    });
  },

  async getProfile(type: "donor" | "beneficiary" = "donor") {
  // Menentukan endpoint berdasarkan argumen yang dikirim
  const endpoint = type === "beneficiary" 
    ? "/user/profile/beneficiaries" 
    : "/user/profile/donors";

  return apiFetch(endpoint, {
    method: "GET",
  });
},

// 1. GET ALL (Rute Publik: /api/campaigns/)
  async getCampaigns() {
    return apiFetch("/campaigns/", { 
      method: "GET",
    });
  },

  // 2. GET DETAIL (Rute Publik: /api/campaigns/:slug)
  // Ganti parameter id menjadi slug
  async getCampaignDetail(slug: string) {
    return apiFetch(`/campaigns/${slug}`, {
      method: "GET",
    });
  },

  // 3. CREATE (Rute Privat: /api/campaigns)
  async createCampaign(formData: FormData) {
    return apiFetch("/campaigns/", {
      method: "POST",
      body: formData,
    });
  },

  // 4. GET MY CAMPAIGNS (Rute Privat: /api/campaigns/me)
  async getMyCampaigns() {
    return apiFetch("/campaigns/me", {
      method: "GET",
    });
  },
};
