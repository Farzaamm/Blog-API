const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

function buildHeaders(additionalHeaders = {}) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = window.localStorage.getItem("blog_admin_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return headers;
}

export async function apiRequest(path, { method = "GET", body, headers, signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(headers),
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload;
}

export function setAuthToken(token) {
  if (token) {
    window.localStorage.setItem("blog_admin_token", token);
  } else {
    window.localStorage.removeItem("blog_admin_token");
  }
}
