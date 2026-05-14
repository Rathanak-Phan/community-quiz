import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Trash2,
  Globe,
  Lock,
  User as OwnerIcon,
  Calendar,
  AlertTriangle,
  BarChart3,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import adminService from '../../services/adminService';
import Toast from '../../components/ui/Toast';

const AdminCommunitiesPage = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const res = await adminService.getCommunities();
      setCommunities(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to fetch communities', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('SEVERE MODERATION ACTION: You are about to PERMANENTLY DELETE this community and all its associated quizzes, members, and data. This action is irreversible. Proceed?')) return;
    try {
      await adminService.deleteCommunity(id);
      setToast({ message: 'Community terminated for moderation', type: 'success' });
      fetchCommunities();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Moderation action failed', type: 'error' });
    }
  };

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.creator?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = activeTab === 'All' || c.visibility.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesVisibility;
  });

  const stats = [
    { label: 'Total Communities', value: communities.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Public Hubs', value: communities.filter(c => c.visibility === 'public').length, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Private Groups', value: communities.filter(c => c.visibility === 'private').length, icon: Lock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Reports', value: 0, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Community Oversight</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight uppercase">Group <span className="text-indigo-600">Moderation</span></h2>
          <p className="text-slate-400 font-bold text-sm mt-3 flex items-center gap-2">
             Monitor community growth and enforce platform conduct policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={fetchCommunities}
             className="px-6 py-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition shadow-sm"
           >
             Sync Communities
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl transition-transform group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
              <ArrowUpRight size={16} className="text-slate-200" />
            </div>
            <div className="mt-6">
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-50 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-xl group">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by community name or owner..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-bold"
          />
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0">
          {['All', 'Public', 'Private'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Community Hub</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Privacy Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Owner / Creator</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-10 py-10"><div className="h-20 bg-slate-50 rounded-[2rem]"></div></td>
                  </tr>
                ))
              ) : filteredCommunities.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-10 py-24 text-center">
                     <div className="flex flex-col items-center max-w-sm mx-auto">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-100 mb-6">
                           <Users size={48} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase">No Hubs Found</h3>
                        <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">There are no communities matching your current filters or search criteria.</p>
                     </div>
                  </td>
                </tr>
              ) : filteredCommunities.map((c) => (
                <tr key={c.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-100 rounded-md overflow-hidden relative group-hover:shadow-xl transition-all border border-transparent group-hover:border-indigo-100">
                        {c.cover_image ? (
                          <img 
                            src={c.cover_image.startsWith('http') ? c.cover_image : `http://localhost:8000/storage/${c.cover_image}`} 
                            alt={c.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <Users size={32} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors"></div>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{c.name}</p>
                        <div className="flex items-center gap-3 mt-2">
                           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                              <Calendar size={12} className="text-slate-400" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Established {new Date(c.created_at).toLocaleDateString()}
                              </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex items-center">
                       {c.visibility === 'public' ? (
                         <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm shadow-emerald-600/5">
                            <Globe size={14} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Public Access</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 shadow-sm shadow-amber-600/5">
                            <Lock size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Restricted</span>
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                       <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                          <OwnerIcon size={16} />
                       </div>
                       <div className="text-left">
                          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{c.creator?.name}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Community Owner</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="flex items-center gap-2 px-6 py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:shadow-rose-600/20"
                      >
                        <Trash2 size={14} /> Terminate Hub
                      </button>
                      <button className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition shadow-sm">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

export default AdminCommunitiesPage;
