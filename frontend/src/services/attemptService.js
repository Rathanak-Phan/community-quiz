import apiClient from "../config/api";

/**
 * Attempt Service
 * Handles quiz attempts, answers, and grading.
 */

export const startAttempt = (quizId, data = { mode: 'practice', is_anonymous: false }) =>
  apiClient.post(`/quizzes/${quizId}/start`, data);

export const getAttempt = (attemptId) =>
  apiClient.get(`/attempts/${attemptId}`);

export const submitAnswer = (attemptId, data) =>
  apiClient.post(`/attempts/${attemptId}/answer`, data);

export const submitAttempt = (attemptId, data = {}) =>
  apiClient.post(`/attempts/${attemptId}/submit`, data);

export const getReview = (attemptId) =>
  apiClient.get(`/attempts/${attemptId}/review`);

export const gradeAnswer = (answerId, data) =>
  apiClient.put(`/answers/${answerId}/grade`, data);

export const getPendingReviews = () =>
  apiClient.get("/reviews/pending");
