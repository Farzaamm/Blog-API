import { apiRequest } from "../api/client.js";

export function fetchAllPosts(signal) {
  return apiRequest("/posts/admin", { signal });
}

export function createPost(payload, signal) {
  return apiRequest("/posts", { method: "POST", body: payload, signal });
}

export function publishPost(id, signal) {
  return apiRequest(`/posts/${id}/publish`, { method: "POST", signal });
}

export function unpublishPost(id, signal) {
  return apiRequest(`/posts/${id}/unpublish`, { method: "POST", signal });
}

export function deletePost(id, signal) {
  return apiRequest(`/posts/${id}`, { method: "DELETE", signal });
}
