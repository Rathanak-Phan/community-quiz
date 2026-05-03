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
                  {isFirst && <Crown className="text-yellow-400 absolute -top-12 animate-bounce w-12 h-12" fill="currentColor" />}
                  
                  <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl shadow-2xl relative mb-6 border-4 border-white ${
                    isFirst ? 'bg-gradient-to-tr from-yellow-400 to-amber-600' : 
                    isSecond ? 'bg-gradient-to-tr from-slate-300 to-slate-500' : 
                    'bg-gradient-to-tr from-orange-400 to-orange-700'
                  }`}>
                    {user.avatar || user.name?.[0]}
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-xl w-10 h-10 flex items-center justify-center text-slate-900 shadow-lg border border-slate-100">
                      <span className="text-sm font-black">#{user.rank}</span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">{user.name}</h3>
                    <p className="text-blue-600 font-black text-sm tracking-widest">{user.score.toLocaleString()} PTS</p>
                  </div>

                  <div className={`w-full rounded-t-[2.5rem] bg-white border border-slate-100 shadow-xl flex flex-col items-center justify-center p-6 ${isFirst ? 'h-52' : isSecond ? 'h-40' : 'h-32'}`}>
                     <div className={`w-12 h-1 bg-slate-100 rounded-full mb-4 ${isFirst ? 'bg-yellow-400' : ''}`}></div>
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global Rank</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center gap-6">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search performers..." 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
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
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <Medal size={120} className="absolute -bottom-10 -right-10 text-white opacity-10 rotate-12" />
                <h3 className="text-xl font-black mb-6 leading-tight">Trending <br/><span className="text-blue-400">Knowledge</span></h3>
                <div className="space-y-6">
                   {trendingQuizzes.map((quiz, idx) => (
                     <div key={quiz.id} className="flex gap-4 group cursor-pointer">
                        <div className="text-2xl shrink-0 group-hover:scale-125 transition-transform">{quiz.icon}</div>
                        <div>
                           <p className="text-sm font-black group-hover:text-blue-400 transition-colors line-clamp-1">{quiz.title}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{quiz.attempts.toLocaleString()} Attempts</p>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">View Trends</button>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
                <h3 className="font-black text-slate-900 uppercase tracking-tight mb-6">Hall of Fame</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-8">
                  The leaderboard reset occurs every Monday at 00:00 UTC. Top 3 performers receive exclusive profile badges.
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600"><Star size={16} fill="currentColor" /></div>
                      <span className="text-xs font-bold text-slate-700">Gold Badge for Rank #1</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Award size={16} fill="currentColor" /></div>
                      <span className="text-xs font-bold text-slate-700">Silver Badge for Rank #2</span>
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
