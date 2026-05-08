import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Trophy,
  Star,
  Medal,
  Crown,
  ChevronDown
} from "lucide-react";
import { getLeaderboard, getTopUsers, getTrendingQuizzes } from "../../api/leaderboardApi";

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [trendingQuizzes, setTrendingQuizzes] = useState([]);
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

    return [...filtered].sort((a, b) => b.score - a.score);
  }, [searchQuery, leaderboard]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="relative mb-20 text-center space-y-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-full bg-blue-600/5 blur-[120px] rounded-full -z-10"></div>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-xl shadow-blue-600/5 border border-slate-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
            <Trophy size={14} className="animate-bounce" />
            Elite Performers
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">
            Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Fame.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Celebrating the legends of our community. Compete with the best and earn your spot among the masters.
          </p>
        </div>

        {/* Podium Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto mb-24 px-4">
          {topUsers.slice(0, 3).sort((a, b) => {
            if (a.rank === 1) return 0;
            if (a.rank === 2) return -1;
            return 1;
          }).map((user) => {
            const isFirst = user.rank === 1;
            const isSecond = user.rank === 2;
            const isThird = user.rank === 3;
            
            return (
              <div 
                key={user.id} 
                className={`relative flex flex-col items-center group ${isFirst ? 'order-2 z-10' : isSecond ? 'order-1' : 'order-3'}`}
              >
                {isFirst && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-yellow-400/20 blur-3xl rounded-full"></div>
                )}
                
                <div className={`relative mb-8 transition-all duration-500 group-hover:-translate-y-4`}>
                  <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl relative border-4 border-white ${
                    isFirst ? 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 scale-125' : 
                    isSecond ? 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 scale-110' : 
                    'bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700'
                  }`}>
                    {user.avatar || user.name?.[0]}
                    {isFirst && <Crown className="absolute -top-8 -right-4 w-10 h-10 text-yellow-400 drop-shadow-xl rotate-12" fill="currentColor" />}
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white rounded-full shadow-lg border border-slate-50 whitespace-nowrap">
                    <span className="text-xs font-black text-slate-900">RANK #{user.rank}</span>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg mb-1">{user.name}</h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/5 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                    <Star size={10} fill="currentColor" /> {user.score.toLocaleString()} Points
                  </div>
                </div>

                <div className={`w-full rounded-t-[3rem] bg-white border border-slate-100 shadow-2xl flex flex-col items-center justify-start p-8 transition-all duration-500 group-hover:shadow-blue-600/5 ${isFirst ? 'h-64' : isSecond ? 'h-48' : 'h-36'}`}>
                   <div className={`w-12 h-1.5 rounded-full mb-4 ${isFirst ? 'bg-yellow-400' : isSecond ? 'bg-slate-300' : 'bg-orange-400'}`}></div>
                   <div className="flex flex-col items-center gap-2">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Achievements</p>
                     <div className="flex -space-x-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full bg-slate-50 border border-white flex items-center justify-center">
                            <Medal size={12} className={isFirst ? 'text-yellow-500' : 'text-slate-300'} />
                          </div>
                        ))}
                     </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global List & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
             <div className="bg-white rounded-[3rem] border border-slate-50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                         <Search size={20} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Search legends..." 
                        className="bg-transparent border-none outline-none font-bold text-slate-900 placeholder:text-slate-300 w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <div className="flex gap-3">
                     <TabFilter label="Global" active />
                     <TabFilter label="Monthly" />
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead>
                        <tr className="text-left bg-slate-50/50">
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Score</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Activity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredLeaderboard.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50/30 transition-all group">
                            <td className="px-10 py-8">
                               <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                                 entry.rank === 1 ? 'bg-yellow-400 text-white' : 
                                 entry.rank === 2 ? 'bg-slate-300 text-white' :
                                 entry.rank === 3 ? 'bg-orange-400 text-white' :
                                 'text-slate-300'
                               }`}>
                                 {entry.rank}
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-black text-sm shadow-inner group-hover:scale-110 transition-transform uppercase">
                                     {entry.avatar || entry.name?.[0]}
                                  </div>
                                  <div>
                                     <p className="font-black text-slate-900 uppercase tracking-tight">{entry.name}</p>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.quizName || 'Universal Learner'}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-right font-black text-slate-900">{entry.score.toLocaleString()}</td>
                            <td className="px-10 py-8 text-right">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.time || 'Today'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

          <aside className="lg:col-span-1 space-y-8">
             <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 blur-3xl rounded-full"></div>
                <h3 className="text-2xl font-black mb-8 leading-none uppercase">Trending<br/><span className="text-blue-500">Topics.</span></h3>
                <div className="space-y-6">
                   {trendingQuizzes.map((quiz) => (
                     <div key={quiz.id} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 transition-colors">{quiz.icon}</div>
                        <div>
                           <p className="font-bold text-sm group-hover:text-blue-400 transition-colors">{quiz.title}</p>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{quiz.attempts?.toLocaleString() || 0} Attempts</p>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Explore All</button>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 -translate-y-12 translate-x-12 rounded-full transition-transform group-hover:scale-150"></div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-6 text-left">Pro Tips</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mb-8 text-left">
                   Consistency is key. Earn <span className="text-blue-600 font-bold">Bonus Multipliers</span> by completing quizzes daily.
                </p>
                <div className="space-y-4">
                   <BadgeItem icon={<Medal size={14} className="text-yellow-500" />} text="Weekly Champion Badge" />
                   <BadgeItem icon={<Medal size={14} className="text-blue-500" />} text="Rapid Fire Achievement" />
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TabFilter({ label, active }) {
  return (
    <button className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
    }`}>
      {label}
    </button>
  );
}

function BadgeItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shadow-inner">{icon}</div>
      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{text}</span>
    </div>
  );
}
