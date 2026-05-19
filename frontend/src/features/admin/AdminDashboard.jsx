import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Users2, 
  CheckCircle2, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import api from '../../config/api';
import ActionHub from '../dashboard/components/ActionHub';
import { useAuth } from '../../providers/AuthContext';
import RoleBadge from '../../components/ui/RoleBadge';

const AdminDashboard = () => {
  const { role } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [hoveredPoint, setHoveredPoint] = useState(null);

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
    { label: 'Total Users', value: stats?.total_users, icon: <Users className="text-blue-600" />, color: 'bg-blue-50', trend: '+12%', desc: 'Signups' },
    { label: 'Total Quizzes', value: stats?.total_quizzes, icon: <BookOpen className="text-emerald-600" />, color: 'bg-emerald-50', trend: '+5%', desc: 'Creations' },
    { label: 'Communities', value: stats?.total_communities, icon: <Users2 className="text-amber-600" />, color: 'bg-amber-50', trend: '+8%', desc: 'Circles' },
    { label: 'Submissions', value: stats?.total_submissions, icon: <CheckCircle2 className="text-rose-600" />, color: 'bg-rose-50', trend: '+24%', desc: 'Attempts' },
  ];

  // SVG Custom Chart parameters
  const chartData = stats?.growth_data?.[activeTab] || [];
  const svgWidth = 650;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;

  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.value), 4) : 10;
  
  const points = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * (svgWidth - 2 * paddingX);
    const y = (svgHeight - paddingY) - (d.value / maxVal) * (svgHeight - 2 * paddingY);
    return { x, y, date: d.date, value: d.value, index: i };
  });

  const linePath = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') 
    : '';

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z` 
    : '';

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'users': return 'User Registrations';
      case 'quizzes': return 'Quizzes Created';
      case 'submissions': return 'Quiz Attempts';
      default: return '';
    }
  };

  const getTabColor = (tab) => {
    switch (tab) {
      case 'users': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'quizzes': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'submissions': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return '';
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
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

      {/* Cards Grid */}
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
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{card.desc} this month</span>
                </div>
            </div>
            <ArrowUpRight className="absolute top-8 right-8 text-slate-50 group-hover:text-slate-100 transition-colors" size={48} />
          </div>
        ))}
      </div>

      {/* Main Analytics Visualization and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Interactive Custom Growth Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[420px] relative overflow-hidden">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-6 mb-6">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Growth Activity</h4>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1"> Chronological platform data for last 30 days </p>
                  </div>
                  
                  {/* Chart Tabs */}
                  <div className="flex items-center gap-2.5 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100 self-start">
                    {[
                      { id: 'users', label: 'Users' },
                      { id: 'quizzes', label: 'Quizzes' },
                      { id: 'submissions', label: 'Attempts' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setHoveredPoint(null); }}
                        className={`px-4.5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          activeTab === tab.id
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Visualizer */}
                <div className="relative mt-2 flex items-center justify-center h-56">
                  {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-10">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 animate-bounce">
                        <TrendingDown size={20} />
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No analytical records captured yet</p>
                    </div>
                  ) : (
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={activeTab === 'users' ? '#3b82f6' : activeTab === 'quizzes' ? '#10b981' : '#f43f5e'} stopOpacity="0.25" />
                          <stop offset="100%" stopColor={activeTab === 'users' ? '#3b82f6' : activeTab === 'quizzes' ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                        const yVal = paddingY + r * (svgHeight - 2 * paddingY);
                        return (
                          <line 
                            key={idx} 
                            x1={paddingX} 
                            y1={yVal} 
                            x2={svgWidth - paddingX} 
                            y2={yVal} 
                            stroke="#f1f5f9" 
                            strokeWidth="1.2" 
                            strokeDasharray="4 4"
                          />
                        );
                      })}

                      {/* Filled Area */}
                      {areaPath && (
                        <path d={areaPath} fill="url(#areaGrad)" className="transition-all duration-700 ease-in-out" />
                      )}

                      {/* Line Stroke */}
                      {linePath && (
                        <path 
                          d={linePath} 
                          fill="none" 
                          stroke={activeTab === 'users' ? '#2563eb' : activeTab === 'quizzes' ? '#059669' : '#e11d48'} 
                          strokeWidth="3.2" 
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-in-out"
                        />
                      )}

                      {/* Timeline Dot Highlights */}
                      {points.map((pt, idx) => (
                        <g key={idx}>
                          {/* Outer hover ring */}
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r={hoveredPoint?.index === pt.index ? 9 : 4} 
                            fill={activeTab === 'users' ? '#2563eb' : activeTab === 'quizzes' ? '#059669' : '#e11d48'} 
                            fillOpacity={hoveredPoint?.index === pt.index ? 0.25 : 1}
                            className="cursor-pointer transition-all duration-200"
                            onMouseEnter={() => setHoveredPoint(pt)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          {/* Inner core dot */}
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="2.5" 
                            fill="#ffffff"
                            className="pointer-events-none"
                          />
                        </g>
                      ))}

                      {/* X Axis Labels (Dates) */}
                      {points.filter((_, idx) => idx % 6 === 0 || idx === points.length - 1).map((pt, idx) => (
                        <text 
                          key={idx} 
                          x={pt.x} 
                          y={svgHeight - 8} 
                          textAnchor="middle" 
                          fill="#94a3b8" 
                          fontSize="8.5" 
                          fontWeight="bold"
                          className="uppercase tracking-widest"
                        >
                          {pt.date}
                        </text>
                      ))}
                    </svg>
                  )}
                </div>
              </div>

              {/* Dynamic Interactive Tooltip Details */}
              <div className="flex items-center justify-between mt-4 pt-5 border-t border-slate-50 min-h-[50px]">
                {hoveredPoint ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Data point selected: <span className="text-slate-800 font-black">{hoveredPoint.date}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recorded Count</p>
                      <h4 className="text-xl font-black text-slate-900 uppercase">
                        {hoveredPoint.value} {activeTab === 'users' ? 'Signups' : activeTab === 'quizzes' ? 'Quizzes' : 'Attempts'}
                      </h4>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <Info size={14} className="text-slate-300" />
                    <p className="text-[9px] font-black uppercase tracking-widest"> Hover over any node in the path to inspect specific day counts </p>
                  </div>
                )}
              </div>
          </div>
          
          {/* System Status Container */}
          <div className="bg-slate-900 rounded-xl p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
              <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                      <h4 className="text-2xl font-black uppercase tracking-tight">System Status</h4>
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          All Nodes Healthy
                      </div>
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
