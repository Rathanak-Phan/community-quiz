import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, ListChecks, Trophy, LayoutDashboard, Star, TrendingUp,
  UserPlus, Network, Edit3, BarChart3, ArrowRight, Play, CheckCircle2,
  Zap, Globe, Shield, Sparkles, Flame, Clock, ChevronRight, BookOpen, Heart
} from 'lucide-react';
import api from "../../config/api";
import { useAuth } from "../../providers/AuthContext";
import { getCommunities } from "../../services/communityService";
import { getTopUsers, getSystemStats } from "../../services/leaderboardService";
import { getTrendingQuizzes } from "../../services/quizService";
import { toggleFavorite } from "../../services/favoriteService";
import Toast from "../../components/ui/Toast";
import { getSettings } from "../../services/settingService";
import { STORAGE_URL } from "../../config/api";

const Home = () => {
  const navigate = useNavigate();
  const { user, token: authToken, refreshProfile, isAdmin } = useAuth();
  const [makerStatus, setMakerStatus] = useState(user?.maker_status || 'none');
  const [applying, setApplying] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [trendingQuizzes, setTrendingQuizzes] = useState([]);
  const [systemStats, setSystemStats] = useState({
    total_users: '124k',
    total_quizzes: '850k',
    total_communities: '12k',
    users_this_week: '10k+',
    active_countries: '142',
    recent_users: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (user) {
      setMakerStatus(user.maker_status || 'none');
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commRes, topRes, trendRes, statsRes] = await Promise.all([
          getCommunities(),
          getTopUsers(4),
          getTrendingQuizzes(),
          getSystemStats()
        ]);

        const rawComms = commRes.data?.data ?? commRes.data ?? [];
        setCommunities(rawComms.slice(0, 4));

        const rawTop = topRes.data?.data ?? topRes.data ?? [];
        setTopPerformers(rawTop.slice(0, 4));

        const rawTrend = trendRes.data?.data ?? trendRes.data ?? [];
        setTrendingQuizzes(rawTrend.slice(0, 6));

        if (statsRes.data?.data) {
          const stats = statsRes.data.data;
          setSystemStats({
            total_users: stats.total_users > 1000 ? `${(stats.total_users / 1000).toFixed(0)}k+` : stats.total_users,
            total_quizzes: stats.total_quizzes > 1000 ? `${(stats.total_quizzes / 1000).toFixed(0)}k+` : stats.total_quizzes,
            total_communities: stats.total_communities > 1000 ? `${(stats.total_communities / 1000).toFixed(0)}k+` : stats.total_communities,
            users_this_week: stats.users_this_week > 1000 ? `${(stats.users_this_week / 1000).toFixed(0)}k+` : stats.users_this_week,
            active_countries: stats.active_countries,
            recent_users: stats.recent_users || []
          });
        }

      } catch (err) {
        console.error("Home Data Fetch Error:", err);
        setError(err.response?.data?.message || "Failed to load dynamic content");
      } finally {
        setLoading(false);
      }
    };
    const fetchSettings = async () => {
      try {
        const res = await getSettings();
        setSettings(res.data);
      } catch (err) {}
    };
    fetchData();
    fetchSettings();
  }, []);

  const handleApply = async () => {
    if (!authToken) {
      navigate("/login");
      return;
    }
    setApplying(true);
    try {
      await api.post('/maker-request');
      await refreshProfile();
      setToast({ message: 'Application submitted successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Failed to submit application', type: 'error' });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white text-slate-900 max-w-full overflow-x-hidden">
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        {settings.hero_background ? (
          <div className="absolute inset-0 z-0">
             <img src={`${STORAGE_URL}/${settings.hero_background}`} className="w-full h-full object-cover opacity-40" alt="Hero Background" />
             <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-white"></div>
          </div>
        ) : (
          /* OLD BACKGROUND BLOBS */
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[150px] opacity-80 animate-pulse"></div>
            <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-80 animate-pulse-slow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-purple-50 rounded-full blur-[100px] opacity-40"></div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="space-y-8 md:space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 mx-auto lg:mx-0">
               <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">New: Real-time multiplayer mode</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter text-slate-900">
              Learning is <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Better Together.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg font-medium mx-auto lg:mx-0">
              Join the world's most interactive community-driven quiz platform. 
              Create, share, and compete with friends in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 justify-center lg:justify-start">
                <button 
                    onClick={() => {
                      if (!authToken) navigate("/register");
                      else if (isAdmin) navigate("/dashboard");
                      else if (user?.role?.name === 'quiz_maker') navigate("/dashboard");
                      else navigate("/quizzes"); 
                    }}
                    className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-slate-900 text-white rounded-xl font-black text-base md:text-lg hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3"
                >
                    {!authToken ? "Get Started" : "Go to Dashboard"}
                    <ArrowRight size={20} />
                </button>
                <button 
                    onClick={() => navigate("/communities")}
                    className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-xl font-black text-base md:text-lg hover:bg-slate-50 transition-all duration-300 active:scale-95"
                >
                    Join Community
                </button>
            </div>

            <div className="flex items-center gap-6 pt-4 md:pt-8 flex-wrap justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {systemStats.recent_users.length > 0 ? (
                  systemStats.recent_users.map((u, i) => (
                    <img 
                      key={i} 
                      src={u.avatar || `https://i.pravatar.cc/100?u=${u.name}`} 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white shadow-sm object-cover" 
                      alt={u.name} 
                      title={u.name}
                    />
                  ))
                ) : (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white bg-slate-100 shadow-sm animate-pulse"></div>
                  ))
                )}
              </div>
              <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">
                <span className="text-slate-900">{systemStats.users_this_week}</span> students joined this week
              </p>
            </div>
          </div>

          <div className="relative lg:block hidden">
            <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-xl p-10 shadow-2xl border border-white/50 rotate-2 hover:rotate-0 transition-transform duration-700">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                      <Star size={24} fill="white" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">Quiz of the Day</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Quantum Mechanics</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600 tracking-tighter">84% SCORE</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Top 5% Globally</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white transition-colors cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-black text-xs">1</div>
                      <span className="font-bold text-slate-700">Newtonian Physics</span>
                    </div>
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  </div>
                  <div className="p-5 rounded-xl bg-blue-600 border border-blue-500 flex items-center justify-between shadow-xl shadow-blue-600/20 scale-105">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-xs">2</div>
                      <span className="font-bold text-white">String Theory</span>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30"></div>
                  </div>
                  <div className="p-5 rounded-xl bg-white border border-slate-100 flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-xs">3</div>
                      <span className="font-bold text-slate-400">Black Hole Dynamics</span>
                    </div>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2.4k Active Attempts</span>
                  </div>
                  <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">View Rankings</button>
               </div>
            </div>
            {/* Decorative Background Image (Subtle) */}
            <div className="absolute -top-20 -right-20 w-80 h-80 opacity-10 blur-2xl">
                <img src="/assets/hero.png" alt="" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR (Light Version) */}
      <section className="bg-slate-900 py-12 md:py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
            <StatItem icon={<Users className="text-blue-400"/>} value={systemStats.total_users} label="Active Learners" light />
            <StatItem icon={<ListChecks className="text-indigo-400"/>} value={systemStats.total_quizzes} label="Quizzes Solved" light />
            <StatItem icon={<Globe className="text-purple-400"/>} value={systemStats.total_communities} label="Learning Hubs" light />
            <StatItem icon={<Zap className="text-amber-400"/>} value={`${systemStats.active_countries}+`} label="Global Reach" light />
          </div>
        </div>
      </section>

      {/* 3. TRENDING QUIZZES (Light Mode) */}
      <section className="py-20 md:py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8 text-center md:text-left">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Trending <br/><span className="text-blue-600">Now.</span></h2>
              <p className="text-slate-500 font-medium max-w-md mx-auto md:mx-0">The most popular challenges being tackled by the community right now.</p>
            </div>
            <Link to="/quizzes" className="inline-flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest text-blue-600 hover:text-indigo-600 transition-all group mx-auto md:mx-0">
              Browse All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-[400px] bg-white rounded-xl border border-slate-100 animate-pulse"></div>)
            ) : trendingQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} navigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. COMMUNITIES (Light Version) */}
      <section className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-10 md:space-y-12 order-2 lg:order-1 text-center lg:text-left">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-slate-900">
                Connect with <br/>
                <span className="text-blue-600">Global Mindsets.</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
                Join niche groups where members share specific quiz collections, 
                host live tournaments, and help each other master complex subjects.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                <FeatureItem icon={<Users size={20}/>} title="Private Groups" desc="Study circles for your team." />
                <FeatureItem icon={<Trophy size={20}/>} title="Tournaments" desc="Win exclusive badges." />
                <FeatureItem icon={<LayoutDashboard size={20}/>} title="Resources" desc="Curated study material." />
                <FeatureItem icon={<Sparkles size={20}/>} title="Live Chat" desc="Real-time collaboration." />
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => navigate("/communities")}
                  className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-xl font-black text-lg hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                  Join the Network
                </button>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
               <div className="relative rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-8 border-white">
                <img 
                  src="/assets/community.png" 
                  alt="Community Learning" 
                  className="w-full h-auto"
                />
               </div>
               {/* Floating Elements */}
               <div className="absolute -top-10 -left-10 p-6 bg-white rounded-xl shadow-2xl border border-slate-50 animate-float hidden sm:block">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Weekly Growth</p>
                      <p className="text-lg font-black text-slate-900">+24%</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURES BENTO (Light Mode) */}
      <section className="py-20 md:py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-16 md:mb-20 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900">Built for the <br/> <span className="text-indigo-600">Modern Creator.</span></h2>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">Tools designed to help you share knowledge and track student growth with precision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <BentoCard 
              icon={<Edit3 size={24}/>} 
              title="Advanced Editor" 
              desc="MCQs, True/False, and Short Answer questions with full markdown and image support."
              className="md:col-span-2 bg-white border-slate-100"
            />
            <BentoCard 
              icon={<BarChart3 size={24}/>} 
              title="Deep Analytics" 
              desc="Visualize learning curves with detailed heatmaps."
              className="bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/20"
            />
            <BentoCard 
              icon={<Shield size={24}/>} 
              title="Secure Testing" 
              desc="Anti-cheat measures for formal assessments."
              className="bg-white border-slate-100"
            />
            <BentoCard 
              icon={<Sparkles size={24}/>} 
              title="AI Integration" 
              desc="Automate quiz generation from existing notes or external articles."
              className="md:col-span-2 bg-slate-900 text-white border-slate-800"
            />
          </div>
        </div>
      </section>

      {/* 6. BECOME A CREATOR (CTA Light) */}
      {authToken && user?.role?.name === 'user' && (
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-2xl md:rounded-3xl p-8 md:p-16 lg:p-24 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 md:gap-16 shadow-2xl shadow-blue-600/20">
              <div className="flex-1 space-y-6 md:space-y-8 relative z-10 text-center lg:text-left text-white">
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none">
                  Ready to share <br /> your wisdom?
                </h2>
                <p className="text-lg md:text-xl opacity-80 font-medium max-w-xl mx-auto lg:mx-0">
                  Join our elite group of verified Quiz Makers. Build your brand while helping others learn.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6 pt-4">
                   <div className="flex items-center gap-3 font-bold text-sm md:text-base">
                    <CheckCircle2 size={20} />
                    <span>Verified Creator Badge</span>
                  </div>
                  <div className="flex items-center gap-3 font-bold text-sm md:text-base">
                    <CheckCircle2 size={20} />
                    <span>Advanced Dashboards</span>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-xl shadow-2xl relative z-10">
                 {makerStatus === 'pending' ? (
                  <div className="text-center space-y-6">
                    <Clock size={48} className="text-amber-500 mx-auto animate-pulse" />
                    <h3 className="text-2xl font-black text-slate-900">Application Pending</h3>
                    <p className="text-slate-500 font-medium">Reviewing your profile. Expect an update in 24h.</p>
                  </div>
                ) : (
                  <div className="space-y-6 md:space-y-8">
                    <h3 className="text-2xl font-black text-slate-900 text-center">Start Creating</h3>
                    <p className="text-slate-500 text-center font-medium">Submit your application to become a certified instructor.</p>
                    <button 
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full py-5 md:py-6 bg-blue-600 text-white rounded-xl font-black text-lg md:text-xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                    >
                      {applying ? "Applying..." : "Apply Now"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. LEADERBOARD (Light Version) */}
      <section className="py-20 md:py-32 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="relative group lg:block hidden">
                <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-[100px]"></div>
                <img 
                  src="/assets/trophy.png" 
                  alt="Success Trophy" 
                  className="w-full h-auto relative z-10 animate-float"
                />
             </div>

             <div className="space-y-8 md:space-y-10 text-center lg:text-left">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 mx-auto lg:mx-0">
                  <Trophy size={40} />
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-slate-900">The Global <br/><span className="text-blue-600">Arena.</span></h2>
                <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                  Climb the global rankings, earn legendary badges, 
                  and establish yourself as a subject matter expert.
                </p>
                <div className="space-y-4">
                  {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse"></div>)
                  ) : topPerformers.map((perf, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                      <div className="flex items-center gap-4 md:gap-6">
                        <span className={`text-xl md:text-2xl font-black ${idx === 0 ? 'text-amber-500' : 'text-slate-300'}`}>0{idx + 1}</span>
                        <div className="flex items-center gap-3 md:gap-4 text-left">
                          <img src={`https://i.pravatar.cc/100?img=${idx + 40}`} className="w-8 h-8 md:w-10 md:h-10 rounded-xl" alt={perf.name} />
                          <div>
                            <p className="font-black text-xs md:text-sm text-slate-900">{perf.name || 'User'}</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{perf.total_score || perf.score || '0'} Points</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 bg-blue-50 rounded-full text-blue-600 font-black text-[9px] md:text-[10px] uppercase">
                        Active
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6">
                  <button onClick={() => navigate("/leaderboard")} className="text-base md:text-lg font-black text-blue-600 hover:text-indigo-600 flex items-center gap-3 group transition-all mx-auto lg:mx-0">
                    View Full Rankings
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
             </div>
          </div>
      </section>

      {/* 8. TESTIMONIALS (Light Mode) */}
      <section className="py-20 md:py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center mb-12 md:mb-24">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 md:mb-8 text-slate-900">What they <span className="text-blue-600">say.</span></h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">Join 100k+ learners already improving their skills.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <TestimonialCard name="Alex Rivera" role="Student @ MIT" text="The real-time feedback and community aspect make Quizly feel like a game." avatar="44" />
          <TestimonialCard name="Sarah J. Wilson" role="Senior Educator" text="The creator tools are lightyears ahead. I build media-rich quizzes in minutes." avatar="32" />
          <TestimonialCard name="Marcus Chen" role="Self-Taught Dev" text="Joined for the quizzes, stayed for the communities. Best way to test skills." avatar="58" />
        </div>
      </section>

      {/* 9. FINAL CTA (Light Version) */}
      <section className="py-20 md:py-32 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center space-y-8 md:space-y-12 relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mx-auto border border-blue-100 shadow-inner">
            <Sparkles size={40} />
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black leading-none tracking-tighter text-slate-900">Ready to level up?</h2>
          <p className="text-xl md:text-2xl text-slate-500 font-medium">Join Quizly today and master any subject through social learning.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <button 
               onClick={() => navigate("/register")}
               className="w-full sm:w-auto px-10 md:px-12 py-5 md:py-6 bg-blue-600 text-white rounded-xl font-black text-xl md:text-2xl hover:bg-slate-900 transition-all shadow-2xl shadow-blue-600/30"
            >
              Get Started for Free
            </button>
          </div>
        </div>
        {/* Decorative Blobs for Final Section */}
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
      </section>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

/* --- UI COMPONENTS --- */

const StatItem = ({ icon, value, label, light = false }) => (
  <div className="flex items-center gap-4 md:gap-6 group">
    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl border transition-transform duration-500 group-hover:scale-110 ${
        light ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'
    }`}>
      {icon}
    </div>
    <div>
      <p className={`text-4xl font-black tracking-tighter ${light ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${light ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
    </div>
  </div>
);

const QuizCard = ({ quiz, navigate }) => {
  const isGuest = !localStorage.getItem("token");
  const [isFavorited, setIsFavorited] = useState(quiz.is_favorited);
  const [favLoading, setFavLoading] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (isGuest) return;
    setFavLoading(true);
    try {
      const res = await toggleFavorite('quiz', quiz.id);
      setIsFavorited(res.data.is_favorite);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/quizzes/${quiz.id}`)}
      className="group bg-white hover:shadow-2xl hover:-translate-y-2 border border-slate-100 rounded-xl p-8 transition-all duration-500 cursor-pointer flex flex-col h-full"
    >
      <div className="mb-8 relative rounded-xl overflow-hidden aspect-video bg-slate-50 border border-slate-100">
        {quiz.cover_image ? (
          <img src={`${STORAGE_URL}/${quiz.cover_image}`} alt={quiz.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <BookOpen size={64} />
          </div>
        )}
        <div className="absolute top-4 left-4">
           {!isGuest && (
             <button 
               onClick={handleToggleFavorite}
               disabled={favLoading}
               className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-lg border backdrop-blur-md ${isFavorited ? 'bg-rose-500 text-white border-rose-400' : 'bg-white/90 text-slate-400 border-white/50 hover:text-rose-500'}`}
             >
               <Heart size={16} fill={isFavorited ? "currentColor" : "none"} className={favLoading ? 'animate-pulse' : ''} />
             </button>
           )}
        </div>
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 border border-white/50 shadow-sm">
          {quiz.category?.name || 'General'}
        </div>
      </div>
      <h3 className="text-xl font-black mb-4 line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors">{quiz.title}</h3>
      <p className="text-slate-500 text-sm font-medium mb-8 line-clamp-2 flex-grow">{quiz.description || 'No description provided.'}</p>
      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <Users size={16} className="text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{quiz.attempts_count || '0'} Plays</span>
        </div>
        <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
          Start <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div className="flex gap-5 group">
    <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
      {icon}
    </div>
    <div>
      <h4 className="font-black text-slate-900 mb-1">{title}</h4>
      <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

const BentoCard = ({ icon, title, desc, className }) => (
  <div className={`p-10 rounded-xl border transition-all duration-500 hover:shadow-2xl group ${className}`}>
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-8 border group-hover:scale-110 transition-transform ${
        className.includes('bg-white') ? 'bg-slate-50 border-slate-100 text-slate-900' : 'bg-white/20 border-white/20 text-white'
    }`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{title}</h3>
    <p className="opacity-70 leading-relaxed font-medium">{desc}</p>
  </div>
);

const TestimonialCard = ({ name, role, text, avatar }) => (
  <div className="p-10 bg-white border border-slate-100 rounded-xl space-y-10 hover:shadow-2xl transition-all duration-500 group">
    <p className="text-lg text-slate-600 font-medium leading-relaxed italic">"{text}"</p>
    <div className="flex items-center gap-5">
      <img src={`https://i.pravatar.cc/100?img=${avatar}`} className="w-12 h-12 rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500" alt={name} />
      <div className="text-left">
        <p className="font-black text-sm text-slate-900">{name}</p>
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">{role}</p>
      </div>
    </div>
  </div>
);

export default Home;