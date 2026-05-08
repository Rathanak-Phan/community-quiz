import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  FileQuestion, BarChart2, Network, Award, 
  Microscope, Sigma, FlaskConical, BookOpen, 
  UserPlus, TrendingUp, Calculator
} from 'lucide-react';
import { getQuizMakerDashboard, getStudentDashboard } from "../../services/dashboardService";
import api from "../../config/api";
import { useAuth } from "../../providers/AuthContext";
import AdminDashboard from "./AdminDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [makerStatus, setMakerStatus] = useState(user?.maker_status || 'none');
  const [applying, setApplying] = useState(false);
  const role = isAdmin ? 'admin' : (user?.role?.name || "user");

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'admin') return; 
    
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const res = role === 'quiz_maker' ? await getQuizMakerDashboard() : await getStudentDashboard();
        setDashboardData(res.data?.data || res.data || {});
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [role]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/maker-request');
      setMakerStatus('pending');
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  // Render AdminDashboard if role is admin
  if (role === 'admin') {
    return <AdminDashboard />;
  }

  const stats = dashboardData || {
    total_quizzes: 0,
    draft_quizzes_count: 0,
    total_submissions: 0,
    pending_reviews: 0,
    total_categories: 0,
    joined_communities_count: 0,
    total_attempts: 0,
    total_completed: 0,
    total_favorites: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             System Online
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
            Good Day, <span className="text-blue-600">{user?.name?.split(' ')[0]}!</span>
          </h1>
          <p className="text-slate-500 font-medium">Here's an overview of your knowledge progress today.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate("/")}
             className="hidden sm:flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
           >
             <BookOpen size={18} className="text-blue-600" />
             Browse Quizzes
           </button>
           <button className="flex items-center justify-center w-12 h-12 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
             <BarChart2 size={20} />
           </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {role === 'quiz_maker' ? (
          <>
            <StatCard icon={<FileQuestion size={24}/>} label="Published Quizzes" value={stats.total_quizzes} trend="Live" color="blue" />
            <StatCard icon={<BookOpen size={24}/>} label="Draft Quizzes" value={stats.draft_quizzes_count} trend="Editing" color="orange" />
            <StatCard icon={<TrendingUp size={24}/>} label="Total Submissions" value={stats.total_submissions} trend="Global" color="emerald" />
            <StatCard icon={<Network size={24}/>} label="Joined Circles" value={stats.joined_communities_count} trend="Active" color="violet" onClick={() => navigate("/communities")} />
          </>
        ) : (
          <>
            <StatCard icon={<Network size={24}/>} label="Joined Circles" value={stats.joined_communities_count} trend="Active" color="violet" onClick={() => navigate("/communities")} />
            <StatCard icon={<FileQuestion size={24}/>} label="Total Attempts" value={stats.total_attempts} trend="Quizzes" color="blue" />
            <StatCard icon={<Award size={24}/>} label="Completed" value={stats.total_completed} trend="Success" color="emerald" />
            <StatCard icon={<Sigma size={24}/>} label="Favorites" value={stats.total_favorites} trend="Personal" color="orange" onClick={() => navigate("/favorites")} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          {/* Recent Quizzes */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                Recent Activity
              </h2>
              <button onClick={() => navigate("/quizzes")} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Library</button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {dashboardData?.recentQuizzes?.length > 0 ? dashboardData.recentQuizzes.map(quiz => (
                <RecentActivityCard key={quiz.id} title={quiz.title} meta={quiz.category?.name} progress={quiz.completion || 0} icon={<Microscope size={28}/>}/>
              )) : (
                <div className="py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                      <FileQuestion size={32} />
                   </div>
                   <div>
                      <p className="text-sm font-black text-slate-900 uppercase">No Activity Detected</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start your first quiz to see stats</p>
                   </div>
                </div>
              )}
            </div>
          </section>

          {/* Communities */}
          <section className="space-y-6">
             <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                Suggested Circles
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CommunityActionCard title="Quantum Physics" members="2.4k" icon={<Sigma size={24}/>} color="blue" />
                <CommunityActionCard title="Modern History" members="1.8k" icon={<BookOpen size={24}/>} color="teal" />
             </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-12">
          {/* Leaderboard Activity */}
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-50">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-10 flex items-center justify-between">
               Wall of Fame
               <Award size={20} className="text-yellow-500" />
            </h2>
            <div className="space-y-8 mb-10">
                <ActivityRow name="Sarah Chen" action='Unlocked "Elite Master"' points="+250" img="https://i.pravatar.cc/100?img=47" />
                <ActivityRow name="James Wilson" action="New Personal Best" points="+180" img="https://i.pravatar.cc/100?img=12" />
                <ActivityRow name="Elena Rodriguez" action="Climbed to Rank #5" points="+42" img="https://i.pravatar.cc/100?img=32" />
            </div>
            <button 
              onClick={() => navigate("/leaderboard")}
              className="w-full py-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Explore Full Rankings
            </button>
          </div>

          {/* Become a Creator Widget */}
          {role === 'user' && (
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
              <div className="relative z-10 space-y-8">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
                  <UserPlus size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight">Become a Creator</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Join our inner circle of educators. Create, share, and earn recognition across the platform.</p>
                </div>
                
                {makerStatus === 'pending' ? (
                  <div className="flex items-center gap-3 py-4 px-6 bg-white/5 border border-white/10 text-amber-400 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                    <TrendingUp size={16} className="animate-pulse" /> Review in Progress
                  </div>
                ) : (
                  <button 
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {applying ? "Submitting..." : "Apply To Create"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --- UI Helper Components (Keeping JSX clean) --- */

const StatCard = ({ icon, label, value, trend, color, onClick }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between h-52 group hover:shadow-xl transition-all duration-500 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:bg-slate-900 group-hover:text-white ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{trend}</span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

const RecentActivityCard = ({ title, meta, progress, icon }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-lg transition-all duration-500">
    <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 shrink-0 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">{title}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{meta}</p>
        </div>
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{width: `${progress}%`}}></div>
      </div>
    </div>
    <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
      Resume <ChevronRight size={14} />
    </button>
  </div>
);

const CommunityActionCard = ({ title, members, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all duration-500">
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform ${color === 'blue' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-black text-slate-900 uppercase tracking-tight">{title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{members} Active Members</p>
      </div>
    </div>
    <button className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all active:scale-90 shadow-inner">
      <UserPlus size={20}/>
    </button>
  </div>
);

const ActivityRow = ({ name, action, points, img }) => (
  <div className="flex items-center justify-between gap-4 group">
    <div className="flex items-center gap-4">
      <div className="relative">
        <img src={img} alt={name} className="w-12 h-12 rounded-xl bg-slate-100 object-cover shadow-sm group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{name}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{action}</p>
      </div>
    </div>
    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">{points}</span>
  </div>
);

export default Dashboard;
