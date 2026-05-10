import apiClient from "../config/api";

/**
 * Leaderboard Service
 * Provides endpoints for leaderboard data.
 */

/**
 * Get global leaderboard across all quizzes
 * @param {string} period - week, month, or all
 * @param {Object} params - Optional query parameters
 * @returns {Promise<AxiosResponse>} Response containing leaderboard entries
 */
export const getLeaderboard = (period = 'all', params = {}) =>
  apiClient.get("/leaderboard", { params: { ...params, period } });

/**
 * Get top users globally (all-time best)
 * @param {number} limit - Number of top users to fetch
 * @param {string} period - week, month, or all
 * @returns {Promise<AxiosResponse>} Response containing top users
 */
export const getTopUsers = (limit = 3, period = 'all') =>
  apiClient.get("/leaderboard/top-users", { params: { limit, period } });

/**
 * Get current user's rank
 * @param {string} period - week, month, or all
 * @returns {Promise<AxiosResponse>} Response containing user's rank
 */
export const getMyRank = (period = 'all') =>
  apiClient.get("/leaderboard/my-rank", { params: { period } });

/**
 * Get trending quizzes
 * @param {number} limit - Number of quizzes to fetch
 * @returns {Promise<AxiosResponse>} Response containing trending quizzes
 */
export const getTrendingQuizzes = (limit = 5) =>
  apiClient.get("/quizzes/trending", { params: { limit } });

/**
 * Get leaderboard for a specific quiz
 * @param {number|string} quizId - Quiz ID
 * @param {Object} params - Optional query parameters
 * @returns {Promise<AxiosResponse>} Response containing quiz leaderboard
 */
export const getQuizLeaderboard = (quizId, params = {}) =>
  apiClient.get(`/quizzes/${quizId}/leaderboard`, { params });

/**
 * Get system-wide statistics
 * @returns {Promise<AxiosResponse>} Response containing system stats
 */
export const getSystemStats = () =>
  apiClient.get("/system-stats");
