import axios from "axios";

// ─── Base URL ────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const STORAGE_URL = `${BASE_URL}/storage`;

// ─── Axios instance ───────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request interceptor – attach Bearer token automatically ──────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor – handle 401 globally ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid – clear storage and redirect to home
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
