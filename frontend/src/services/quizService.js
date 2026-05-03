import apiClient from "../config/api";

/**
 * Quiz Service
 * Handles CRUD for quizzes.
 */

export const getQuizzes = (params = {}) =>
  apiClient.get("/quizzes", { params });

export const getQuizById = (id) =>
  apiClient.get(`/quizzes/${id}`);

export const createQuiz = (data) => {
  if (data instanceof FormData) {
    return apiClient.post("/quizzes", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.post("/quizzes", data);
};

export const updateQuiz = (id, data) => {
  if (data instanceof FormData) {
    // Laravel multipart/form-data with PUT requires POST + _method: PUT
    data.append("_method", "PUT");
    return apiClient.post(`/quizzes/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.put(`/quizzes/${id}`, data);
};

export const deleteQuiz = (id) =>
  apiClient.delete(`/quizzes/${id}`);

export const getQuizLeaderboard = (quizId) =>
  apiClient.get(`/quizzes/${quizId}/leaderboard`);
