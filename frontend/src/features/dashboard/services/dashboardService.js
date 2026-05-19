import apiClient from "../../../config/api";

/**
 * Dashboard Service
 * Fetches quiz-maker dashboard statistics.
 */

export const getQuizMakerDashboard = () =>
  apiClient.get("/dashboard/quiz-maker");

export const getStudentDashboard = () =>
  apiClient.get("/dashboard/student");

export const getAdminDashboard = () =>
  apiClient.get("/dashboard/admin");
