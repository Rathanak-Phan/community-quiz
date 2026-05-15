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
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import api, { STORAGE_URL } from '../../config/api';
import adminService from '../../services/adminService';
import Toast from '../../components/ui/Toast';
import Pagination from './components/Pagination';

const AdminCommunitiesPage = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCommunities();
  }, [page, activeTab]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        if (page === 1) fetchCommunities();
        else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search: searchQuery,
        visibility: activeTab !== 'All' ? activeTab.toLowerCase() : undefined,
        per_page: 10
      };
      const res = await api.get('/admin/communities', { params });
      setCommunities(res.data.data);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to fetch communities', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('SEVERE MODERATION ACTION: You are about to PERMANENTLY DELETE this community. This action is irreversible. Proceed?')) return;
    try {
      await api.delete(`/admin/communities/${id}`);
      setToast({ message: 'Community terminated for moderation', type: 'success' });
      fetchCommunities();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Moderation action failed', type: 'error' });
    }
  };

  const stats = [
    { label: 'Total Communities', value: communities.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Public Hubs', value: '...', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Private Groups', value: '...', icon: Lock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Reports', value: 0, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16 py-8 md:py-16 pb-32 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm">
              <Users size={22} />
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.25em]">Community Oversight</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight uppercase leading-none">Group <span className="text-indigo-600">Moderation</span></h1>
            <p className="text-slate-500 font-bold text-sm md:text-lg max-w-2xl leading-relaxed">
               Monitor community growth and enforce platform conduct policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
           <button 
             onClick={() => { setPage(1); fetchCommunities(); }}
             className="w-full lg:w-auto px-10 py-5 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition shadow-xl active:scale-95 flex items-center justify-center gap-4"
           >
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Sync Hubs
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="flex items-start justify-between relative z-10">
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl transition-transform group-hover:scale-110 shadow-sm`}>
                <stat.icon size={24} />
              </div>
              <ArrowUpRight size={18} className="text-slate-200" />
            </div>
            <div className="mt-10 relative z-10">
              <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-10">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by community name or owner..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-full outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/5 transition-all text-xs font-black uppercase tracking-widest"
          />
        </div>

        <div className="flex bg-slate-100 p-2 rounded-2xl shrink-0 overflow-x-auto scrollbar-hide">
          {['All', 'Public', 'Private'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 active:scale-95 ${
                activeTab === tab 
                ? 'bg-white text-indigo-600 shadow-xl' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Community Hub</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Security Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ownership</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && communities.length === 0 ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-10 py-12"><div className="h-24 bg-slate-50 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : communities.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-10 py-40 text-center">
                     <div className="flex flex-col items-center max-w-sm mx-auto">
                        <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-8">
                           <Users size={48} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Hubs Found</h4>
                        <p className="text-slate-400 font-bold text-[10px] mt-3 uppercase tracking-widest text-center leading-relaxed">There are no communities matching your current filters.</p>
                     </div>
                  </td>
                </tr>
              ) : communities.map((c) => (
                <tr key={c.id} className="group hover:bg-slate-50/40 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden relative group-hover:shadow-xl transition-all border border-transparent group-hover:border-indigo-100 shadow-inner">
                        {c.cover_image ? (
                          <img 
                            src={c.cover_image.startsWith('http') ? c.cover_image : `${STORAGE_URL}/${c.cover_image}`} 
                            alt={c.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <Users size={32} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase">{c.name}</p>
                        <div className="flex items-center gap-3 mt-3">
                           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                              <Calendar size={12} className="text-slate-400" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Est. {new Date(c.created_at).toLocaleDateString()}
                              </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex items-center">
                       {c.visibility === 'public' ? (
                          <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-600/5">
                             <Globe size={14} className="animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Public Hub</span>
                          </div>
                       ) : (
                          <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 shadow-sm shadow-amber-600/5">
                             <Lock size={14} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Restricted</span>
                          </div>
                       )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex items-center gap-4 px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                       <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                          <OwnerIcon size={20} />
                       </div>
                       <div className="text-left">
                          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{c.creator?.name}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Community Owner</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-end gap-3 lg:opacity-0 group-hover:opacity-100 transition-all lg:translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="flex items-center gap-2 px-7 py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 shadow-rose-600/5"
                      >
                        <Trash2 size={16} /> Terminate Hub
                      </button>
                      <button className="w-14 h-14 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="border-t border-slate-50 px-10 py-6">
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
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
