import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Trophy,
  Star,
  Medal,
  Crown,
  ChevronRight,
  TrendingUp,
  User as UserIcon,
  Calendar,
  Filter
} from "lucide-react";
import { getLeaderboard, getTopUsers, getTrendingQuizzes, getMyRank } from "../../api/leaderboardApi";
import { useAuth } from "../../providers/AuthContext";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState("all"); // all, month, week
  const [leaderboard, setLeaderboard] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [trendingQuizzes, setTrendingQuizzes] = useState([]);
  const [myRankData, setMyRankData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const promises = [
          getLeaderboard(period),
          getTopUsers(3, period),
          getTrendingQuizzes(6)
        ];

        if (user) {
          promises.push(getMyRank(period));
        }

        const [boardRes, topRes, trendsRes, rankRes] = await Promise.all(promises);
        
        setLeaderboard(boardRes.data?.data ?? boardRes.data ?? []);
        setTopUsers(topRes.data?.data ?? topRes.data ?? []);
        setTrendingQuizzes(trendsRes.data?.data ?? trendsRes.data ?? []);
        
        if (rankRes) {
          setMyRankData(rankRes.data?.data ?? rankRes.data);
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [period, user]);

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
    <div className="min-h-screen bg-[#f8fafc] pb-24 selection:bg-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="relative mb-24 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-full bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl -z-10 rounded-full"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 text-blue-600 text-[11px] font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Trophy size={14} className="text-yellow-500 fill-yellow-500" />
            Global Rankings
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight uppercase mb-6">
            Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">Fame.</span>
          </h1>
          
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Compete with the world's brightest minds. Rise through the ranks and etch your name into history.
          </p>
        </div>

        {/* Period Selector & User Rank */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="flex bg-slate-50 p-1.5 rounded-2xl w-full lg:w-auto">
             <PeriodButton active={period === 'all'} onClick={() => setPeriod('all')} label="All Time" />
             <PeriodButton active={period === 'month'} onClick={() => setPeriod('month')} label="This Month" />
             <PeriodButton active={period === 'week'} onClick={() => setPeriod('week')} label="This Week" />
           </div>

           {user && myRankData && (
             <div className="flex items-center gap-6 pr-4 border-l border-slate-100 pl-8 lg:pl-0 lg:border-l-0">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Position</p>
                  <p className="text-2xl font-black text-slate-900">Rank #{myRankData.rank}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-200">
                   {myRankData.rank <= 3 ? <Trophy size={20} /> : myRankData.avatar}
                </div>
             </div>
           )}
        </div>

        {/* Podium Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto mb-32 px-4">
          {topUsers.length > 0 ? (
            [...topUsers].sort((a, b) => {
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
                  className={`relative flex flex-col items-center group transition-all duration-500 ${isFirst ? 'order-2 z-10 scale-110' : isSecond ? 'order-1' : 'order-3'}`}
                >
                  {isFirst && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/20 blur-3xl rounded-full"></div>
                  )}
                  
                  <div className="relative mb-10 transition-transform duration-500 group-hover:-translate-y-4">
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl relative border-4 border-white overflow-hidden ${
                      isFirst ? 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600' : 
                      isSecond ? 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600' : 
                      'bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700'
                    }`}>
                      {user.avatar || user.name?.[0]}
                      {isFirst && <Crown className="absolute -top-8 -right-4 w-10 h-10 text-yellow-400 drop-shadow-xl rotate-12" fill="currentColor" />}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-white rounded-full shadow-xl border border-slate-50 whitespace-nowrap">
                      <span className="text-[10px] font-black text-slate-900 uppercase">RANK #{user.rank}</span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-8">
                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl mb-2">{user.name}</h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest border border-blue-100/50">
                      <Star size={12} fill="currentColor" className="text-yellow-500" /> {user.score.toLocaleString()} Points
                    </div>
                  </div>

                  <div className={`w-full rounded-t-[3rem] bg-white border border-slate-100 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.03)] flex flex-col items-center justify-start p-8 transition-all duration-500 group-hover:shadow-blue-200/20 ${isFirst ? 'h-64' : isSecond ? 'h-52' : 'h-40'}`}>
                     <div className={`w-12 h-1.5 rounded-full mb-6 ${isFirst ? 'bg-yellow-400' : isSecond ? 'bg-slate-300' : 'bg-orange-400'}`}></div>
                     <div className="flex flex-col items-center gap-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Collector Stats</p>
                       <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center shadow-sm">
                              <Medal size={14} className={isFirst ? 'text-yellow-500' : 'text-slate-300'} />
                            </div>
                          ))}
                       </div>
                     </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-20 bg-white rounded-[3rem] border border-slate-100">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <UserIcon size={32} />
               </div>
               <p className="font-black text-slate-400 uppercase tracking-widest">No rankings yet for this period</p>
            </div>
          )}
        </div>

        {/* Main List & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
             <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl w-full md:w-auto focus-within:ring-2 ring-blue-500/20 transition-all">
                      <Search size={18} className="text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search competitors..." 
                        className="bg-transparent border-none outline-none font-bold text-slate-900 placeholder:text-slate-400 w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        <Filter size={14} /> Filter
                      </div>
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead>
                        <tr className="text-left bg-slate-50/50">
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Learner</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Points</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time Ago</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {loading ? (
                          [1, 2, 3, 4, 5].map(i => <LoadingRow key={i} />)
                        ) : filteredLeaderboard.length > 0 ? (
                          filteredLeaderboard.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-50/50 transition-all group cursor-default">
                              <td className="px-10 py-8">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all group-hover:scale-110 ${
                                   entry.rank === 1 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : 
                                   entry.rank === 2 ? 'bg-slate-300 text-white shadow-lg shadow-slate-100' :
                                   entry.rank === 3 ? 'bg-orange-400 text-white shadow-lg shadow-orange-100' :
                                   'text-slate-400 bg-slate-50'
                                 }`}>
                                   {entry.rank}
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 font-black text-lg shadow-sm group-hover:shadow-md transition-all uppercase overflow-hidden relative">
                                       {entry.avatar || entry.name?.[0]}
                                       <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent"></div>
                                    </div>
                                    <div>
                                       <p className="font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{entry.name}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                          <Calendar size={10} /> {entry.quizName || 'Universal Learner'}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-right font-black text-slate-900 text-lg">
                                {entry.score.toLocaleString()}
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <span className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                   {entry.time || 'Today'}
                                 </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-20 text-center font-black text-slate-300 uppercase tracking-widest">No results found</td>
                          </tr>
                        )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
             {/* Trending Section */}
             <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full group-hover:bg-blue-600/30 transition-all duration-700"></div>
                
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-black leading-tight uppercase">
                     Hot<br/><span className="text-blue-500">Challenges.</span>
                   </h3>
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp size={24} className="text-blue-400" />
                   </div>
                </div>

                <div className="space-y-4">
                   {trendingQuizzes.map((quiz) => (
                     <div 
                        key={quiz.id} 
                        onClick={() => navigate(`/quizzes/${quiz.id}`)}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-3xl cursor-pointer transition-all border border-white/0 hover:border-white/10 group/item"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl group-hover/item:bg-blue-600 transition-colors">
                             {quiz.category?.icon || '🧩'}
                           </div>
                           <div>
                              <p className="font-bold text-sm group-hover/item:text-blue-400 transition-colors">{quiz.title}</p>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{quiz.attempts_count?.toLocaleString() || 0} Learners</p>
                           </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-600 group-hover/item:text-white transition-all transform group-hover/item:translate-x-1" />
                     </div>
                   ))}
                </div>
                
                <button 
                  onClick={() => navigate('/quizzes')}
                  className="w-full mt-10 py-5 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/20"
                >
                  Discover More
                </button>
             </div>

             {/* Tips Card */}
             <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 -translate-y-16 translate-x-16 rounded-full transition-transform group-hover:scale-150 duration-700"></div>
                <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px] mb-8">Master's Guide</h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-black text-slate-900 text-xs uppercase mb-3">Consistency Multiplier</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Maintain a 5-day streak to unlock <span className="text-blue-600 font-bold">XP Boosters</span> and climb faster.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <BadgeItem icon={<Medal size={16} className="text-yellow-500" />} title="Weekly Hero" text="Top 10 of the week" />
                    <BadgeItem icon={<Medal size={16} className="text-blue-500" />} title="Fast Learner" text="Finish quiz under 2m" />
                  </div>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PeriodButton({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
        active 
          ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
          : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
      }`}
    >
      {label}
    </button>
  );
}

function LoadingRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-10 py-8"><div className="w-8 h-8 bg-slate-100 rounded-lg"></div></td>
      <td className="px-10 py-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
          <div className="space-y-2">
            <div className="w-32 h-4 bg-slate-100 rounded"></div>
            <div className="w-20 h-2 bg-slate-50 rounded"></div>
          </div>
        </div>
      </td>
      <td className="px-10 py-8"><div className="w-16 h-4 bg-slate-100 rounded ml-auto"></div></td>
      <td className="px-10 py-8"><div className="w-20 h-3 bg-slate-100 rounded ml-auto"></div></td>
    </tr>
  );
}

function BadgeItem({ icon, title, text }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-default border border-transparent hover:border-slate-100">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{title}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{text}</p>
      </div>
    </div>
  );
}
