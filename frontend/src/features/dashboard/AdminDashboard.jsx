import React, { useState, useEffect } from 'react';
import { 
  Users, Grid2X2, BookOpen, BarChart3, 
  ShieldCheck, UserPlus, AlertCircle, TrendingUp, ChevronRight, Activity, Search,
  Check, X, UserCheck
} from 'lucide-react';
import apiClient from '../../config/api';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalCommunities: 0,
    totalCategories: 0,
  });
  const [users, setUsers] = useState([]);
  const [makerRequests, setMakerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'requests'

  const fetchAdminData = async () => {
    try {
      const [usersRes, quizzesRes, communitiesRes, categoriesRes, requestsRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/quizzes'),
        apiClient.get('/communities'),
        apiClient.get('/categories'),
        adminService.getMakerRequests(),
      ]);

      setUsers(usersRes.data?.data || []);
      setMakerRequests(requestsRes.data || []);
      setStats({
        totalUsers: usersRes.data?.total || usersRes.data?.data?.length || 0,
        totalQuizzes: quizzesRes.data?.total || quizzesRes.data?.data?.length || 0,
        totalCommunities: communitiesRes.data?.total || communitiesRes.data?.data?.length || 0,
        totalCategories: categoriesRes.data?.total || categoriesRes.data?.data?.length || 0,
      });
    } catch (err) {
      console.error("Failed to load platform overview", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveRequest = async (id) => {
    try {
      await adminService.approveMakerRequest(id);
      fetchAdminData(); // Refresh data
    } catch (err) {
      console.error("Failed to approve request:", err);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await adminService.rejectMakerRequest(id);
      fetchAdminData(); // Refresh data
    } catch (err) {
      console.error("Failed to reject request:", err);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform <span className="text-blue-600">Control</span></h1>
            <p className="text-slate-500 font-medium max-w-lg">Manage users, communities, and monitor global activity in real-time</p>
        </div>
        <div className="flex gap-4">
           <button className="bg-white border-2 border-slate-200 text-slate-900 px-6 py-3 rounded-lg font-black text-xs tracking-widest hover:border-slate-200 transition-all">Export Logs</button>
           <button className="bg-slate-900 text-white px-6 py-3 rounded-lg font-black text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20">System Status</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard icon={<Users size={24}/>} label="Total Users" value={stats.totalUsers} color="blue" trend="+12% growth" />
        <StatCard icon={<BookOpen size={24}/>} label="Total Quizzes" value={stats.totalQuizzes} color="emerald" trend="+54 today" />
        <StatCard icon={<Grid2X2 size={24}/>} label="Categories" value={stats.totalCategories} color="violet" trend="Updated" />
        <StatCard icon={<Activity size={24}/>} label="System Load" value="2.4ms" color="orange" trend="Healthy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* User Management Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-8">
               <button 
                 onClick={() => setActiveTab('users')}
                 className={`text-xl font-black uppercase tracking-tight transition-all ${activeTab === 'users' ? 'text-slate-900 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 User Directory
               </button>
               <button 
                 onClick={() => setActiveTab('requests')}
                 className={`text-xl font-black uppercase tracking-tight transition-all flex items-center gap-3 ${activeTab === 'requests' ? 'text-slate-900 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Creator Requests
                 {makerRequests.length > 0 && (
                   <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                     {makerRequests.length}
                   </span>
                 )}
               </button>
            </div>
            <div className="relative flex-1 max-w-xs group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
               <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white transition-all text-xs font-bold" />
            </div>
          </div>
          <div className="overflow-x-auto">
            {activeTab === 'users' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] border-b border-slate-50">
                    <th className="px-10 py-5">Identities</th>
                    <th className="px-10 py-5">Access Role</th>
                    <th className="px-10 py-5">Presence</th>
                    <th className="px-10 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.slice(0, 10).map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-black uppercase border border-slate-200 group-hover:scale-110 transition-transform">
                            {user.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight">{user.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${
                        user.role?.name === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                        user.role?.name === 'quiz_maker' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {user.role?.name || 'user'}
                      </span>
                    </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                          Connected
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition shadow-inner">
                          <ShieldCheck size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] border-b border-slate-50">
                    <th className="px-10 py-5">Applicant</th>
                    <th className="px-10 py-5">Email</th>
                    <th className="px-10 py-5">Date</th>
                    <th className="px-10 py-5 text-right">Decisions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {makerRequests.length > 0 ? makerRequests.map(request => (
                    <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-black uppercase border border-blue-100 group-hover:scale-110 transition-transform">
                            {request.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight">{request.name}</p>
                            <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-widest">Wants to Create</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{request.email}</p>
                      </td>
                      <td className="px-10 py-6">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           {new Date(request.created_at).toLocaleDateString()}
                         </p>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => handleRejectRequest(request.id)}
                            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-400 hover:text-white hover:bg-rose-500 transition shadow-inner flex items-center justify-center"
                          >
                            <X size={18} />
                          </button>
                          <button 
                            onClick={() => handleApproveRequest(request.id)}
                            className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-400 hover:text-white hover:bg-emerald-500 transition shadow-inner flex items-center justify-center"
                          >
                            <Check size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-10 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                             <UserCheck size={32} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 uppercase">Clear Inbox</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No pending creator applications found</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <div className="p-8 border-t border-slate-50 text-center">
             <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View all system users</button>
          </div>
        </div>

        {/* System Activity */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-2xl p-10 text-white relative overflow-hidden shadow-2xl">
              <Activity size={120} className="absolute -bottom-10 -right-10 text-white opacity-5 rotate-12" />
              <h3 className="text-xl font-black mb-10 leading-tight uppercase tracking-tight">System <br/><span className="text-blue-400">Activity</span></h3>
              <div className="space-y-8 relative z-10">
                <ActivityItem icon={<UserPlus size={16}/>} text="New user onboarded" time="2 MINS AGO" />
                <ActivityItem icon={<BookOpen size={16}/>} text="Database migration" time="15 MINS AGO" />
                <ActivityItem icon={<AlertCircle size={16}/>} text="API Key rotated" time="1 HOUR AGO" color="rose" />
                <ActivityItem icon={<TrendingUp size={16}/>} text="Traffic peak reached" time="3 HOURS AGO" color="emerald" />
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-xl shadow-slate-200/40">
              <h3 className="font-black text-slate-900 uppercase tracking-tight mb-6">Environment</h3>
              <div className="space-y-6">
                 <EnvStat label="Production Server" value="ONLINE" status="success" />
                 <EnvStat label="Database Cluster" value="SYNCED" status="success" />
                 <EnvStat label="Redis Cache" value="WAKING" status="warning" />
              </div>
              <button className="w-full mt-10 py-4 border-2 border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-slate-200 transition-all">Open Maintenance Console</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, trend }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-56 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className="flex justify-between items-start">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-slate-900 group-hover:text-white ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global</span>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{label}</p>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
          <TrendingUp size={12} />
          {trend}
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, text, time, color = "blue" }) => (
  <div className="flex gap-5 group">
    <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-blue-600 transition-colors duration-300 shadow-inner`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-black tracking-tight leading-tight mb-1">{text}</p>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{time}</p>
    </div>
  </div>
);

const EnvStat = ({ label, value, status }) => (
  <div className="flex justify-between items-center">
     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
     <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
        status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
     }`}>{value}</span>
  </div>
);

export default AdminDashboard;
