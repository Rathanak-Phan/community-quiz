import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Trophy,
  TrendingUp,
  Clock,
  Star,
  Award,
  Crown,
  Medal,
  ChevronRight
} from "lucide-react";
import Toast from "../components/ui/Toast";
import { getLeaderboard, getTopUsers, getTrendingQuizzes } from "../api/leaderboardApi";

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("All Time");
  const [sortBy, setSortBy] = useState("Score");
  const [leaderboard, setLeaderboard] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [trendingQuizzes, setTrendingQuizzes] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [boardRes, topRes, trendsRes] = await Promise.all([
          getLeaderboard(),
          getTopUsers(),
          getTrendingQuizzes()
        ]);
        
        setLeaderboard(boardRes.data?.data ?? boardRes.data ?? []);
        setTopUsers(topRes.data?.data ?? topRes.data ?? []);
        setTrendingQuizzes(trendsRes.data?.data ?? trendsRes.data ?? []);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        setToast({ show: true, message: "Failed to load dynamic rankings", type: "error" });
      } finally {
        setLoading(false);
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
          entry.name?.toLowerCase().includes(normalizedQuery) ||
          entry.quizName?.toLowerCase().includes(normalizedQuery)
      );
    }

    return [...filtered].sort((a, b) => (sortBy === "Score" ? b.score - a.score : a.rank - b.rank));
  }, [searchQuery, sortBy, leaderboard]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
            <Trophy size={14} />
            Global Rankings
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Hall of <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Fame</span></h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Celebrating the top achievers and most dedicated learners in our global community.</p>
        </div>

        {/* Podium Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto">
            {topUsers.slice(0, 3).sort((a, b) => {
              if (a.rank === 1) return 0;
              if (b.rank === 1) return 1;
              return a.rank - b.rank;
            }).map((user, idx) => {
              const isFirst = user.rank === 1;
              const isSecond = user.rank === 2;
              const isThird = user.rank === 3;
              
              return (
                <div 
                  key={user.id} 
                  className={`relative flex flex-col items-center group transition-all duration-500 ${isFirst ? 'order-2 z-10 scale-110' : isSecond ? 'order-1' : 'order-3'}`}
                >
                  {isFirst && <Crown className="text-yellow-400 absolute -top-10 animate-bounce w-10 h-10" fill="currentColor" />}
                  
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl relative mb-5 border-4 border-white ${
                    isFirst ? 'bg-gradient-to-tr from-yellow-400 to-amber-600' : 
                    isSecond ? 'bg-gradient-to-tr from-slate-300 to-slate-500' : 
                    'bg-gradient-to-tr from-orange-400 to-orange-700'
                  }`}>
                    {user.avatar || user.name?.[0]}
                    <div className="absolute -bottom-1.5 -right-1.5 bg-white rounded-lg w-8 h-8 flex items-center justify-center text-slate-900 shadow-lg border border-slate-100">
                      <span className="text-xs font-bold">#{user.rank}</span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-slate-900 uppercase tracking-tight text-base">{user.name}</h3>
                    <p className="text-blue-600 font-bold text-xs tracking-widest">{user.score.toLocaleString()} PTS</p>
                  </div>

                  <div className={`w-full rounded-t-3xl bg-white border border-slate-100 shadow-lg flex flex-col items-center justify-center p-5 ${isFirst ? 'h-48' : isSecond ? 'h-36' : 'h-28'}`}>
                     <div className={`w-10 h-1 bg-slate-100 rounded-full mb-3 ${isFirst ? 'bg-yellow-400' : ''}`}></div>
                     <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Global Rank</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row items-center gap-5">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search performers..." 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-600/30 transition-all text-sm font-medium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Dropdown label={filterBy} options={["All Time", "This Month", "This Week"]} />
                    <Dropdown label={sortBy} options={["Score", "Recent"]} />
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Quiz</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievement</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Recency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredLeaderboard.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <span className={`font-black text-sm ${entry.rank <= 3 ? 'text-blue-600' : 'text-slate-300'}`}>#{entry.rank}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-200 group-hover:scale-110 transition-transform">
                                {entry.is_anonymous ? "?" : (entry.avatar || entry.name?.[0])}
                              </div>
                              <span className="font-black text-slate-900 tracking-tight">{entry.is_anonymous ? "Anonymous Learner" : entry.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-bold text-slate-500">{entry.quizName || "General Knowledge"}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black tracking-tight">
                                {entry.score.toLocaleString()} PTS
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {entry.time || "Recently"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-slate-900 rounded-3xl p-7 text-white relative overflow-hidden shadow-xl">
                <Medal size={100} className="absolute -bottom-8 -right-8 text-white opacity-10 rotate-12" />
                <h3 className="text-lg font-bold mb-6 leading-tight">Trending <br/><span className="text-blue-400">Knowledge</span></h3>
                <div className="space-y-5">
                   {trendingQuizzes.map((quiz, idx) => (
                     <div key={quiz.id} className="flex gap-3 group cursor-pointer">
                        <div className="text-xl shrink-0 group-hover:scale-125 transition-transform">{quiz.icon}</div>
                        <div>
                           <p className="text-sm font-bold group-hover:text-blue-400 transition-colors line-clamp-1">{quiz.title}</p>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{quiz.attempts.toLocaleString()} Attempts</p>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-8 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">View Trends</button>
             </div>

             <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
                <h3 className="font-bold text-slate-900 uppercase tracking-tight mb-5 text-sm">Hall of Fame</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  The leaderboard reset occurs every Monday at 00:00 UTC. Top 3 performers receive exclusive profile badges.
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600"><Star size={14} fill="currentColor" /></div>
                      <span className="text-[10px] font-bold text-slate-700">Gold Badge for Rank #1</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Award size={14} fill="currentColor" /></div>
                      <span className="text-[10px] font-bold text-slate-700">Silver Badge for Rank #2</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dropdown({ label, options }) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-2xl text-xs font-black text-slate-700 uppercase tracking-widest hover:border-blue-600 transition-all">
        {label}
        <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
      </button>
    </div>
  );
}
