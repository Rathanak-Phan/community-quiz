import apiClient from "../config/api";

/**
 * Question Service
 * Handles creation of different question types.
 */

export const createMcq = (data) => {
  if (data instanceof FormData) {
    return apiClient.post("/questions/mcq", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.post("/questions/mcq", data);
};

export const createTrueFalse = (data) => {
  if (data instanceof FormData) {
    return apiClient.post("/questions/true-false", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.post("/questions/true-false", data);
};

export const createShortAnswer = (data) => {
  if (data instanceof FormData) {
    return apiClient.post("/questions/short-answer", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.post("/questions/short-answer", data);
};

export const getQuestions = (quizId) =>
  apiClient.get(`/quizzes/${quizId}/questions`);

export const updateQuestion = (id, data) => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    return apiClient.post(`/questions/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.put(`/questions/${id}`, data);
};

export const deleteQuestion = (id) =>
  apiClient.delete(`/questions/${id}`);

// Options
export const getQuestionOptions = (questionId) =>
  apiClient.get(`/questions/${questionId}/options`);

export const createOption = (data) =>
  apiClient.post("/options", data);

export const updateOption = (id, data) =>
  apiClient.put(`/options/${id}`, data);

export const deleteOption = (id) =>
  apiClient.delete(`/options/${id}`);
