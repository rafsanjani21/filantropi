import { apiFetch } from "./api";

export const AuthService = {
  async login(id_token: string) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ id_token }),
    });
  },

  async updateProfile(formData: FormData) {
  const res = await fetch("http://192.168.52.29:8080/api/user/profile/update-donors", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: formData,
  });

  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || "Update gagal");
  }

  return data;
},

  async register({
    id_token,
    name,
    wallet_address,
  }: {
    id_token: string;
    name: string;
    wallet_address: string;
  }) {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        id_token,
        name,
        role: "user",
        wallet_address,
      }),
    });
  },

  async refresh(refresh_token: string) {
    return apiFetch("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    });
  },

async logout(refresh_token: string) {
  return apiFetch("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`, // 🔥 WAJIB
    },
    body: JSON.stringify({
      refresh_token,
    }),
  });
},

  getProfile: () =>
  apiFetch("/user/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }),
};

