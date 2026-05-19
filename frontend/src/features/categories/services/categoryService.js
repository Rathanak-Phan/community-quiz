import apiClient from "../../../config/api";

/**
 * Category Service
 * Handles CRUD operations for quiz categories.
 */

export const getCategories = () =>
  apiClient.get("/categories");

export const getCategoryById = (id) =>
  apiClient.get(`/categories/${id}`);

export const createCategory = (data) =>
  apiClient.post("/categories", data);

export const updateCategory = (id, data) =>
  apiClient.put(`/categories/${id}`, data);

export const deleteCategory = (id) =>
  apiClient.delete(`/categories/${id}`);
