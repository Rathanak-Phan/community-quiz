import axios from "axios";

/**
 * PRODUCTION-GRADE CONFIGURATION
 * 
 * We use import.meta.env for Vite environment variables.
 * We've removed hardcoded localhost fallbacks to prevent accidental 
 * leaks of development URLs into production.
 */

const getEnv = (key) => {
    const value = import.meta.env[key];
    if (!value) {
        if (import.meta.env.PROD) {
            throw new Error(`CRITICAL: Environment variable ${key} is missing! Application cannot start in production.`);
        }
        // Development default
        if (key === "VITE_API_URL") return "http://localhost:8000";
    }
    return value;
};

// Base URLs
// In production, these MUST be set in .env.production
export const BASE_URL = getEnv("VITE_API_URL");
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
      // Token expired or invalid – clear storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Use relative path for redirect
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
          window.location.href = "/login?error=session_expired";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
