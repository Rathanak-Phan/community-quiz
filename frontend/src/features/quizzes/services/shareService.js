import apiClient from "../../../config/api";

/**
 * Share Service
 * Handles generating shareable links for quizzes and results.
 */

export const getQuizShareLink = (quizId) =>
  apiClient.get(`/quizzes/${quizId}/share`);

export const getResultShareLink = (submissionId) =>
  apiClient.get(`/submissions/${submissionId}/share`);
