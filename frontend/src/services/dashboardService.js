import apiClient from "../config/api";

/**
 * Dashboard Service
 * Fetches quiz-maker dashboard statistics.
 */

export const getQuizMakerDashboard = () =>
  apiClient.get("/dashboard/quiz-maker");
