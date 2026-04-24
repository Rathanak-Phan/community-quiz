import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const leaderboardApi = axios.create({
  baseURL: `${API_URL}/api/leaderboard`,
  withCredentials: true,
});

export const getLeaderboard = (filters = {}) => {
  return leaderboardApi.get("/", { params: filters });
};

export const getTopUsers = (limit = 3) => {
  return leaderboardApi.get("/top", { params: { limit } });
};

export const getTrendingQuizzes = (limit = 5) => {
  return leaderboardApi.get("/trending-quizzes", { params: { limit } });
};

export const getUserRank = (userId) => {
  return leaderboardApi.get(`/user/${userId}/rank`);
};

export default leaderboardApi;
