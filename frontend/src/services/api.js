import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach token + entity context ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // JWT token
    const token =
      localStorage.getItem("blt_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Entity ID — try several storage patterns your app might use
    const entityId =
      localStorage.getItem("entityId") ||
      (() => {
        try {
          return JSON.parse(localStorage.getItem("entity") || "{}")._id;
        } catch {
          return null;
        }
      })() ||
      (() => {
        try {
          return JSON.parse(localStorage.getItem("currentEntity") || "{}")._id;
        } catch {
          return null;
        }
      })() ||
      (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "{}").entityId;
        } catch {
          return null;
        }
      })() ||
      (() => {
        try {
          const user = JSON.parse(localStorage.getItem("blt_user") || "{}");
          return user.entityId || user.entityIds?.[0] || null;
        } catch {
          return null;
        }
      })();

    if (entityId) {
      config.headers["x-entity-id"] = entityId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response: global error handling ──────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — redirect to login once
      localStorage.removeItem("blt_token");
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
