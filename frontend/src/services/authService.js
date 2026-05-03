import apiClient from "../config/api";

/**
 * Auth Service
 * Handles login, register, logout, and profile fetching.
 */

export const login = (credentials) =>
  apiClient.post("/login", credentials);

export const register = (data) =>
  apiClient.post("/register", data);

export const logout = () =>
  apiClient.post("/logout");

export const getProfile = () =>
  apiClient.get("/profile");
