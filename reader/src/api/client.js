const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export async function apiGet(path, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message ?? payload.error ?? "Request failed");
  }
  return response.json();
}
