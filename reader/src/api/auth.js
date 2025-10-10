import { apiRequest, setAuthToken } from "./client.js";

export async function registerUser(payload) {
  const response = await apiRequest("/users/register", {
    method: "POST",
    body: payload,
  });
  setAuthToken(response.token);
  return response;
}

export async function loginUser(credentials) {
  const response = await apiRequest("/users/login", {
    method: "POST",
    body: credentials,
  });
  setAuthToken(response.token);
  return response;
}

export async function fetchCurrentUser(signal) {
  return apiRequest("/users/me", { signal });
}

export function logoutUser() {
  setAuthToken(null);
}
