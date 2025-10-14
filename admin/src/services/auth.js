import { apiRequest, setAuthToken } from "../api/client.js";

export async function login(credentials) {
  const payload = await apiRequest("/users/login", {
    method: "POST",
    body: credentials,
  });
  setAuthToken(payload.token);
  return payload;
}

export async function fetchCurrentUser(signal) {
  return apiRequest("/users/me", { signal });
}

export function logout() {
  setAuthToken(null);
}
