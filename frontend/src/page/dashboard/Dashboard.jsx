import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  FileQuestion, BarChart2, Network, Award, 
  Microscope, Sigma, FlaskConical, BookOpen, 
  UserPlus, TrendingUp, Calculator
} from 'lucide-react';
import { getQuizMakerDashboard } from "../../services/dashboardService";
import api from "../../config/api";
import { useAuth } from "../../context/AuthContext";
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
    if (role === 'admin' || role === 'user') return; // Admin has its own logic, Learner (user) doesn't have maker stats
    
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const res = await getQuizMakerDashboard();
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

  const stats = dashboardData?.stats || {
    totalQuizzes: 0,
    avgScore: "0%",
    activeCommunities: 0,
    globalRank: "N/A",
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#0f172a] mb-2">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-gray-500 text-lg">Ready to manage your quizzes today?</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FileQuestion size={20}/>} label="Total Quizzes" value={stats.totalQuizzes} trend="+12%" />
        <StatCard icon={<BarChart2 size={20}/>} label="Avg. Score" value={stats.avgScore} trend="Top 5%" />
        <StatCard icon={<Network size={20}/>} label="Communities" value={stats.activeCommunities} trend="Active" />
        <StatCard icon={<Award size={20}/>} label="Global Rank" value={stats.globalRank} trend="#422" />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Recent Quizzes</h2>
              <button onClick={() => navigate("/quizzes")} className="text-blue-600 text-sm font-bold hover:text-blue-700">View All</button>
            </div>
            <div className="space-y-4">
              {dashboardData?.recentQuizzes?.length > 0 ? dashboardData.recentQuizzes.map(quiz => (
                <RecentActivityCard key={quiz.id} title={quiz.title} meta={quiz.category?.name} progress={quiz.completion || 0} icon={<Microscope size={28}/>}/>
              )) : (
                <p className="text-slate-400 text-sm italic py-8 border-2 border-dashed border-slate-100 rounded-2xl text-center">No recent quizzes found.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Communities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <CommunityActionCard title="Quantum Physics Club" members="2.4k" icon={<FlaskConical size={24}/>} color="blue" />
               <CommunityActionCard title="Modern History Forum" members="1.8k" icon={<BookOpen size={24}/>} color="teal" />
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Leaderboard Activity</h2>
            <div className="space-y-6 mb-6">
                <ActivityRow name="Sarah Chen" action='Earned "Quick Learner" Badge' points="+150 pts" img="https://i.pravatar.cc/150?img=47" />
                <ActivityRow name="Mike Ross" action="Climbed to #15 in Biology" points="+2 ranks" img="https://i.pravatar.cc/150?img=11" />
            </div>
            <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition">View All Activity</button>
          </div>

          <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-600/20">
            <Calculator size={120} className="absolute -bottom-6 -right-6 text-white opacity-10" />
            <div className="relative z-10">
              <span className="inline-block bg-white/20 px-2.5 py-1 rounded text-xs font-bold tracking-wider mb-4 border border-white/10">WEEKLY CHALLENGE</span>
              <h3 className="text-xl font-bold mb-1">Mathematics Marathon</h3>
              <p className="text-blue-100 text-sm mb-6">50 questions • 30 mins</p>
              <button className="w-full bg-white text-blue-600 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm">Join Now</button>
            </div>
          </div>

          {/* Become a Creator Section for Users */}
          {role === 'user' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Become a Creator</h3>
                  <p className="text-xs text-slate-500 mt-1">Want to create and share your own quizzes? Apply to become a Quiz Maker!</p>
                </div>
                
                {makerStatus === 'pending' ? (
                  <div className="flex items-center gap-2 py-3 px-4 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold uppercase tracking-wider">
                    <TrendingUp size={14} className="animate-pulse" /> Request Pending Review
                  </div>
                ) : makerStatus === 'rejected' ? (
                  <div className="space-y-3">
                    <div className="py-3 px-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider">
                      Request Rejected
                    </div>
                    <button 
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition shadow-sm disabled:opacity-50"
                    >
                      {applying ? "Submitting..." : "Apply Again"}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition shadow-sm disabled:opacity-50"
                  >
                    {applying ? "Submitting..." : "Send Application"}
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

const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">{icon}</div>
      <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{trend}</span>
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const RecentActivityCard = ({ title, meta, progress, icon }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
    <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 shrink-0">{icon}</div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        <span className="text-xs font-semibold text-gray-400">{progress}% Complete</span>
      </div>
      <p className="text-sm text-gray-500 mb-3">{meta}</p>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full" style={{width: `${progress}%`}}></div>
      </div>
    </div>
    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition ml-2">Resume</button>
  </div>
);

const CommunityActionCard = ({ title, members, icon, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-${color === 'blue' ? 'blue-600' : 'teal-500'} flex items-center justify-center text-white shrink-0 shadow-md`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{members} Members</p>
      </div>
    </div>
    <button className="w-10 h-10 rounded-full hover:bg-blue-50 text-blue-600 flex items-center justify-center transition"><UserPlus size={20}/></button>
  </div>
);

const ActivityRow = ({ name, action, points, img }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <img src={img} alt={name} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
      <div>
        <h4 className="text-sm font-bold text-gray-900">{name}</h4>
        <p className="text-xs text-gray-500">{action}</p>
      </div>
    </div>
    <span className="text-xs font-bold text-green-500">{points}</span>
  </div>
);

export default Dashboard;
