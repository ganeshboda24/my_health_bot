// API client with JWT auth header and consistent error handling.
// Uses VITE_API_URL if set, otherwise falls back to the Vite dev proxy (/api).

const configuredApiUrl = import.meta.env.VITE_API_URL || "";
const API_BASE = configuredApiUrl
  ? /^https?:\/\//i.test(configuredApiUrl)
    ? configuredApiUrl
    : `https://${configuredApiUrl}`
  : import.meta.env.PROD
    ? "https://my-health-bot-dnsu.onrender.com"
    : "";

function getToken() {
  return localStorage.getItem("arogya_token") || "";
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  };
}

async function request(method, path, body) {
  const options = {
    method,
    headers: authHeaders()
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, options);

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body)
};

export function setToken(token) {
  if (token) {
    localStorage.setItem("arogya_token", token);
  } else {
    localStorage.removeItem("arogya_token");
  }
}

export function getStoredMember() {
  try {
    const raw = localStorage.getItem("arogya_member");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredMember(member) {
  if (member) {
    localStorage.setItem("arogya_member", JSON.stringify(member));
  } else {
    localStorage.removeItem("arogya_member");
  }
}

export function clearAuth() {
  localStorage.removeItem("arogya_token");
  localStorage.removeItem("arogya_member");
}