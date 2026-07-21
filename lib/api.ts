// 🔥 UBAH: Mengambil URL dari .env.local dan menjadikannya 'export'
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(endpoint: string, options: RequestInit) {
  const access_token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token") || localStorage.getItem("admin_token");

  const noAuthEndpoints = [
    "/auth/login",
    "/auth/register",
    "/auth/refresh-token",
    "/auth/logout",
  ];

  const isPublicCampaignRead = options.method === "GET" && (endpoint === "/campaigns/" || (/^\/campaigns\/[^/]+$/.test(endpoint) && endpoint !== "/campaigns/me"));
  const isPublicDonationRead = options.method === "GET" && (endpoint.startsWith("/donations/in/") || endpoint.startsWith("/donations/amount/"));
  const isNoAuth = isPublicCampaignRead || isPublicDonationRead || noAuthEndpoints.some((url) => endpoint.includes(url));
  const isFormData = options.body instanceof FormData;

  const doFetch = async (token: string | null) => {
    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...( !isFormData && { "Content-Type": "application/json" }),
        ...( !isNoAuth && token
          ? { Authorization: `Bearer ${token}` }
          : {}
        ),
      },
    });
  };

  let res = await doFetch(access_token);

  // 🔥 HANDLE TOKEN EXPIRED
  if (res.status === 401 && !isNoAuth) {
    const refresh_token = localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token") || localStorage.getItem("admin_refresh_token");

    // 🔥 FUNGSI BANTUAN UNTUK LOGOUT PAKSA + NOTIFIKASI
    const forceLogout = () => {
  // 1. DAFTARKAN HALAMAN YANG BOLEH TANPA TOKEN
  const allowedPaths = [
    "/LoginPage", 
    "/LoginPage/Masuk", 
    "/ProfilePage/PagePenerima/Tipe", // 🔥 TAMBAHKAN INI
    "/ProfilePage/UserPage"            // 🔥 TAMBAHKAN INI
  ];

  // 2. CEK APAKAH USER SEDANG DI HALAMAN PENDAFTARAN
  const isAllowed = allowedPaths.some(path => window.location.pathname.startsWith(path));

  // 3. JIKA SEDANG DI HALAMAN PENDAFTARAN, JANGAN LOGOUT!
  if (isAllowed) return;

  // 4. LOGOUT HANYA JIKA BUKAN DI HALAMAN PENDAFTARAN
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  sessionStorage.clear();
  
  alert("Sesi Anda telah habis. Silakan login kembali.");
  window.location.href = "/LoginPage/Masuk";
};

    // Jika tidak ada refresh token sama sekali
    if (!refresh_token) {
      forceLogout();
      return Promise.reject("Sesi habis");
    }

    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token }),
      });

      const refreshData = await refreshRes.json();

      if (!refreshRes.ok) throw new Error();

      const newToken = refreshData.data.access_token;

      // Cek nyimpannya harus sebagai admin_token atau access_token
      if (localStorage.getItem("admin_token")) {
        localStorage.setItem("admin_token", newToken);
      } else if (sessionStorage.getItem("access_token")) {
        sessionStorage.setItem("access_token", newToken);
      } else {
        localStorage.setItem("access_token", newToken);
      }

      // 🔥 retry request dengan token yang baru
      res = await doFetch(newToken);
      
    } catch {
      // 🔥 JIKA REFRESH TOKEN GAGAL/HABIS, EKSEKUSI ALERT & LOGOUT
      forceLogout();
      return Promise.reject("Sesi habis");
    }
  }

  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(`${res.status} ${endpoint}: ${data.message || data.error || "API Error"}`);
  }

  return data;
}