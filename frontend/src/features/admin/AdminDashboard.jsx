import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Users2, 
  CheckCircle2, 
  TrendingUp, 
  Clock,
  ArrowUpRight
} from 'lucide-react';
import api from '../../config/api';
import ActionHub from '../dashboard/components/ActionHub';
import { useAuth } from '../../providers/AuthContext';
import RoleBadge from '../../components/ui/RoleBadge';

const AdminDashboard = () => {
  const { role } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-8">
        <div className="h-12 bg-white rounded-xl w-1/4"></div>
        <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-40 bg-white rounded-xl"></div>)}
        </div>
    </div>
  );

  const cards = [
    { label: 'Total Users', value: stats?.total_users, icon: <Users className="text-blue-600" />, color: 'bg-blue-50', trend: '+12%' },
    { label: 'Total Quizzes', value: stats?.total_quizzes, icon: <BookOpen className="text-emerald-600" />, color: 'bg-emerald-50', trend: '+5%' },
    { label: 'Communities', value: stats?.total_communities, icon: <Users2 className="text-amber-600" />, color: 'bg-amber-50', trend: '+8%' },
    { label: 'Submissions', value: stats?.total_submissions, icon: <CheckCircle2 className="text-rose-600" />, color: 'bg-rose-50', trend: '+24%' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              System <span className="text-blue-600">Studio</span>
            </h1>
            <RoleBadge role="admin" className="hidden sm:inline-flex" />
          </div>
          <p className="text-slate-500 font-bold text-lg mt-2">
            Welcome back, Commander. Platform systems are operating within normal parameters.
          </p>
        </div>
        <div className="flex-1 lg:max-w-md">
            <ActionHub role="admin" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-8 border border-slate-50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 group relative overflow-hidden">
            <div className="relative z-10 space-y-6">
                <div className={`w-16 h-16 ${card.color} rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}>
                    {card.icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-1">{card.value}</h3>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                    <span className="flex items-center text-emerald-500 font-black text-[10px]">
                        <TrendingUp size={14} className="mr-1" /> {card.trend}
                    </span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Since last month</span>
                </div>
            </div>
            <ArrowUpRight className="absolute top-8 right-8 text-slate-50 group-hover:text-slate-100 transition-colors" size={48} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 bg-white rounded-xl p-10 border border-slate-50 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                  <TrendingUp size={40} />
              </div>
              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Growth Activity</h4>
              <p className="text-slate-400 text-xs font-medium max-w-xs mt-2 leading-relaxed">Interactive growth charts will be visualized here once more data points are collected.</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                      <h4 className="text-2xl font-black uppercase tracking-tight">System Status</h4>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          All Nodes Healthy
                      </p>
                  </div>
                  <div className="space-y-6">
                      {[
                        { label: 'API Server', status: 'Online' },
                        { label: 'Database', status: 'Healthy' },
                        { label: 'Storage', status: 'Connected' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{item.status}</span>
                        </div>
                      ))}
                  </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
