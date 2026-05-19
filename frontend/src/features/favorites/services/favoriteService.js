import apiClient from "../../../config/api";

/**
 * Favorites Service
 * Handles user favorites (quizzes and categories).
 */

export const getFavorites = () =>
  apiClient.get("/favorites");

export const addFavorite = (data) =>
  apiClient.post("/favorites", data);

export const removeFavorite = (id) =>
  apiClient.delete(`/favorites/${id}`);

export const toggleFavorite = (target_type, target_id) =>
  apiClient.post("/favorites/toggle", { target_type, target_id });
