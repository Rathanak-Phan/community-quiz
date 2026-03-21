import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const getCategories = () =>
  axios.get(`${BASE_URL}/api/categories`, { headers: getAuthHeaders() });

export const createCategory = (data) =>
  axios.post(`${BASE_URL}/api/categories`, data, { headers: getAuthHeaders() });

export const updateCategory = (id, data) =>
  axios.put(`${BASE_URL}/api/categories/${id}`, data, {
    headers: getAuthHeaders(),
  });

export const deleteCategory = (id) =>
  axios.delete(`${BASE_URL}/api/categories/${id}`, {
    headers: getAuthHeaders(),
  });
