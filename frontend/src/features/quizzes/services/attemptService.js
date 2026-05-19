import apiClient from "../../../config/api";

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

// Public / Guest attempt endpoints (Unauthenticated)
export const startAttemptPublic = (quizId, data = { mode: 'practice', anonymous_name: '' }) =>
  apiClient.post(`/public/quizzes/${quizId}/start`, data);

export const getAttemptPublic = (attemptId) =>
  apiClient.get(`/public/attempts/${attemptId}`);

export const submitAnswerPublic = (attemptId, data) =>
  apiClient.post(`/public/attempts/${attemptId}/answer`, data);

export const submitAttemptPublic = (attemptId, data = {}) =>
  apiClient.post(`/public/attempts/${attemptId}/submit`, data);

export const getReviewPublic = (attemptId) =>
  apiClient.get(`/public/attempts/${attemptId}/review`);

export const gradeAnswer = (answerId, data) =>
  apiClient.put(`/answers/${answerId}/grade`, data);

export const getPendingReviews = (page = 1) =>
  apiClient.get(`/reviews/pending?page=${page}`);
export const getShareResult = (submissionId) =>
  apiClient.get(`/submissions/${submissionId}/share`);
