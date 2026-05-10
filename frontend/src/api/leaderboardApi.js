/**
 * leaderboardApi.js – thin re-export of leaderboardService using the shared axios instance.
 * Kept for backward-compatibility with components that import from here.
 */
export {
  getQuizLeaderboard,
  getLeaderboard,
  getTopUsers,
  getTrendingQuizzes,
  getMyRank,
} from "../services/leaderboardService";
