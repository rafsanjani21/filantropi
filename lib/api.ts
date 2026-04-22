const BASE_URL = "http://192.168.52.29:8080/api";

export async function apiFetch(endpoint: string, options: RequestInit) {
  let access_token = localStorage.getItem("access_token");

  const noAuthEndpoints = [
    "/auth/login",
    "/auth/register",
    "/auth/refresh-token",
    "/auth/logout",
  ];

  const isNoAuth = noAuthEndpoints.some((url) => endpoint.includes(url));
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
    const refresh_token = localStorage.getItem("refresh_token");

    if (!refresh_token) {
      window.location.href = "/LoginPage/Masuk";
      return;
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

      localStorage.setItem("access_token", newToken);

      // 🔥 retry request
      res = await doFetch(newToken);
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/LoginPage/Masuk";
      return;
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
    throw new Error(data.message || "API Error");
  }

  return data;
}