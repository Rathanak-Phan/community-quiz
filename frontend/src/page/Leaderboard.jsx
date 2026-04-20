import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Trophy,
  TrendingUp,
  Clock,
  Star,
  Award,
} from "lucide-react";
import Toast from "../components/ui/Toast";
import { getLeaderboard, getTopUsers, getTrendingQuizzes } from "../api/leaderboardApi";

const sampleTopUsers = [
  {
    id: 1,
    rank: 1,
    name: "Sarah Chen",
    score: 3100,
    avatar: "SC",
    color: "bg-yellow-400",
  },
  {
    id: 2,
    rank: 2,
    name: "Alex Johnson",
    score: 2840,
    avatar: "AJ",
    color: "bg-gray-400",
  },
  {
    id: 3,
    rank: 3,
    name: "Maya Rodriguez",
    score: 2610,
    avatar: "MR",
    color: "bg-orange-400",
  },
];

const sampleLeaderboard = [
  {
    id: 1,
    rank: 1,
    name: "Sarah Chen",
    avatar: "SC",
    quizName: "Advanced Python",
    score: 9850,
    time: "2 min ago",
  },
  {
    id: 2,
    rank: 2,
    name: "Marcus Chen",
    avatar: "MC",
    quizName: "Cloud Architecture",
    score: 8950,
    time: "5 min ago",
  },
  {
    id: 3,
    rank: 3,
    name: "Mike Peterson",
    avatar: "MP",
    quizName: "Data Structures 101",
    score: 8725,
    time: "10 min ago",
  },
  {
    id: 4,
    rank: 4,
    name: "Julia Reed",
    avatar: "JR",
    quizName: "Quantum Physics Quiz",
    score: 8542,
    time: "15 min ago",
  },
  {
    id: 5,
    rank: 5,
    name: "Anonymous",
    avatar: "A",
    quizName: "Machine Learning Basics",
    score: 8301,
    time: "1 hr ago",
  },
];

const sampleTrendingQuizzes = [
  {
    id: 1,
    title: "Python in Data Analysis",
    category: "Programming",
    attempts: 2543,
    icon: "📊",
  },
  {
    id: 2,
    title: "Climate Essentials",
    category: "Science",
    attempts: 1892,
    icon: "🌍",
  },
  {
    id: 3,
    title: "Organic Chemistry 101",
    category: "Science",
    attempts: 1456,
    icon: "⚗️",
  },
];

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("All Time");
  const [sortBy, setSortBy] = useState("Score");
  const [leaderboard, setLeaderboard] = useState(sampleLeaderboard);
  const [topUsers, setTopUsers] = useState(sampleTopUsers);
  const [trendingQuizzes, setTrendingQuizzes] = useState(sampleTrendingQuizzes);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    // Load leaderboard data from API
    const loadData = async () => {
      try {
        // Uncomment when backend is ready
        // const [boardRes, topRes, trendsRes] = await Promise.all([
        //   getLeaderboard(),
        //   getTopUsers(),
        //   getTrendingQuizzes()
        // ]);
        // setLeaderboard(boardRes.data);
        // setTopUsers(topRes.data);
        // setTrendingQuizzes(trendsRes.data);
        
        // For now, use sample data
        setLeaderboard(sampleLeaderboard);
        setTopUsers(sampleTopUsers);
        setTrendingQuizzes(sampleTrendingQuizzes);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        setToast({ show: true, message: "Failed to load leaderboard", type: "error" });
      }
    };
    loadData();
  }, []);

  const filteredLeaderboard = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let filtered = leaderboard;

    if (normalizedQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.name.toLowerCase().includes(normalizedQuery) ||
          entry.quizName.toLowerCase().includes(normalizedQuery)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "Score") {
        return b.score - a.score;
      }
      // Default by rank
      return a.rank - b.rank;
    });

    return sorted;
  }, [searchQuery, sortBy, leaderboard]);

  const getMedalColor = (rank) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-500";
    return "text-gray-300";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy size={32} className="text-blue-600" />
            Quiz Leaderboard
          </h1>
          <p className="mt-2 text-gray-600">
            Track quiz performance and see where you stand in the global academic community.
          </p>
        </div>

        {/* Top Users Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Top 3 Users */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                🏆 Top Performers
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {topUsers.map((user) => (
                  <div
                    key={user.id}
                    className="text-center p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
                  >
                    <div className="mb-3 flex justify-center">
                      <div
                        className={`${user.color} w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl relative`}
                      >
                        {user.avatar}
                        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          #{user.rank}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {user.name}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {user.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Why Compete? */}
          <div className="lg:col-span-1">
            <div className="bg-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Why Compete?</h3>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Push yourself to a new competitive level</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Climb to greater ranks and get rewards</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Showcase your expertise</span>
                </li>
              </ul>
              <button className="w-full bg-white text-blue-600 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition">
                Explore Leaderboards
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Leaderboard Table */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Filters */}
              <div className="border-b border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by user or quiz..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {filterBy}
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {sortBy}
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Quiz Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Score
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeaderboard.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-bold">
                          <div className="flex items-center gap-2">
                            {entry.rank <= 3 ? (
                              <Trophy
                                size={18}
                                className={getMedalColor(entry.rank)}
                              />
                            ) : (
                              <span className="text-gray-400 font-semibold">
                                #{entry.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                              {entry.avatar}
                            </div>
                            <span className="font-medium text-gray-900">
                              {entry.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {entry.quizName}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-right text-blue-600">
                          {entry.score.toLocaleString()} pts
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right">
                          {entry.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* View All Button */}
              <div className="border-t border-gray-200 px-6 py-4 text-center">
                <button className="text-blue-600 font-medium text-sm hover:text-blue-700">
                  View all rankings →
                </button>
              </div>
            </div>
          </div>

          {/* Trending Quizzes Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <TrendingUp size={20} className="text-orange-500" />
                Trending Quizzes
              </h3>
              <div className="space-y-4">
                {trendingQuizzes.map((quiz, idx) => (
                  <div
                    key={quiz.id}
                    className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{quiz.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {quiz.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {quiz.category}
                        </p>
                        <p className="text-xs text-orange-600 font-semibold mt-1">
                          {quiz.attempts.toLocaleString()} attempts
                        </p>
                      </div>
                      <div className="text-xl font-bold text-orange-500 flex-shrink-0">
                        {idx + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
