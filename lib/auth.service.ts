import { apiFetch } from "./api";

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
      }
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

  async updateProfile(formData: FormData) {
    return apiFetch("/user/profile/update-donors", {
      method: "PUT",
      body: formData, // 🔥 penting: tanpa JSON
    });
  },

  getProfile: () =>
    apiFetch("/user/profile", {
      method: "GET",
    }),
};