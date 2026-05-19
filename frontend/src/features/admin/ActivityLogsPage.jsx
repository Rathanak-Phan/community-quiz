import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Trash2, 
  RefreshCw, 
  Clock, 
  User, 
  Terminal, 
  Globe, 
  Cpu, 
  Activity, 
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import api from '../../config/api';
import adminService from './services/adminService';
import Toast from '../../components/ui/Toast';
import SEO from '../../components/common/SEO';
import Pagination from './components/Pagination';
import ConfirmModal from '../../components/ui/ConfirmModal';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmClear, setConfirmClear] = useState({ isOpen: false, loading: false });
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchLogs();
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search,
        action: actionFilter || undefined,
        per_page: 15
      };
      const res = await adminService.getActivityLogs(params);
      setLogs(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalLogs(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to retrieve system logs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    setConfirmClear({ isOpen: true, loading: false });
  };

  const handleConfirmClear = async () => {
    setConfirmClear(prev => ({ ...prev, loading: true }));
    try {
      await adminService.clearActivityLogs();
      setToast({ message: 'All platform activity logs cleared', type: 'success' });
      fetchLogs();
      setConfirmClear({ isOpen: false, loading: false });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to clear activity logs', type: 'error' });
      setConfirmClear(prev => ({ ...prev, loading: false }));
    }
  };

  // Helper to format action names into user-friendly labels
  const getActionBadgeStyle = (action) => {
    switch (action) {
      case 'user_created':
        return 'bg-emerald-50 border-emerald-100 text-emerald-600';
      case 'user_deleted':
        return 'bg-rose-50 border-rose-100 text-rose-600';
      case 'role_updated':
        return 'bg-blue-50 border-blue-100 text-blue-600';
      case 'quiz_deleted_by_admin':
        return 'bg-amber-50 border-amber-100 text-amber-600';
      case 'community_deleted_by_admin':
        return 'bg-indigo-50 border-indigo-100 text-indigo-600';
      case 'maker_request_approved':
        return 'bg-teal-50 border-teal-100 text-teal-600';
      case 'maker_request_rejected':
        return 'bg-orange-50 border-orange-100 text-orange-600';
      case 'logs_cleared':
        return 'bg-slate-100 border-slate-200 text-slate-700';
      default:
        return 'bg-slate-50 border-slate-100 text-slate-500';
    }
  };

  const formatActionName = (action) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16 py-8 md:py-16 pb-32 overflow-x-hidden">
      <SEO 
        title="Audit Logs | Administrative Portal"
        description="Review system-wide actions, administrative activity, and platform audit logs."
        url="/admin/activity-logs"
      />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 shadow-sm border border-slate-200/50">
              <Terminal size={22} className="animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Audit Trails & Audits</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight uppercase leading-none">
              Activity <span className="text-blue-600">Logs</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm md:text-lg max-w-2xl leading-relaxed">
              Real-time monitoring of administrative operations, security incidents, and user moderation activities.
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleClearLogs}
          disabled={logs.length === 0}
          className="w-full lg:w-auto px-10 py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 hover:bg-rose-700 hover:-translate-y-1 transition-all shadow-2xl shadow-rose-600/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Trash2 size={18} /> Purge Audit Logs
        </button>
      </div>

      {/* Control / Filter Bar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-10">
        <div className="relative flex-1 group w-full">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by action, description, administrator, or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-full outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-black uppercase tracking-widest"
          />
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide -mx-2 px-2 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-5 py-4 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type:</span>
          </div>
          
          <select 
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 text-slate-600 outline-none focus:border-blue-600 hover:border-slate-300 transition-all shadow-sm shrink-0 min-w-[200px]"
          >
            <option value="">All Events</option>
            <option value="user_created">User Registrations</option>
            <option value="user_deleted">User Account Deletions</option>
            <option value="role_updated">User Role Updates</option>
            <option value="quiz_deleted_by_admin">Quiz Moderations</option>
            <option value="community_deleted_by_admin">Community Moderations</option>
            <option value="maker_request_approved">Creator Approvals</option>
            <option value="maker_request_rejected">Creator Rejections</option>
            <option value="logs_cleared">System Audits Cleared</option>
          </select>

          <button 
            onClick={() => { fetchLogs(); }}
            className="p-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50 transition shadow-sm active:scale-90"
            title="Refresh Logs"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[20%]">Timestamp</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[18%]">Triggered By</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[18%]">Event Type</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[30%]">Event Details</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[14%] text-right">Environment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && logs.length === 0 ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-10 py-12"><div className="h-16 bg-slate-50 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-40 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                         <Activity size={48} />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Events Recorded</h4>
                      <p className="text-slate-400 font-bold text-[10px] mt-3 uppercase tracking-widest leading-relaxed">No administrative events match your search/filter criteria.</p>
                      <button 
                        onClick={() => { setSearch(''); setActionFilter(''); setPage(1); }}
                        className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-xl active:scale-95"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="group hover:bg-slate-50/40 transition-colors">
                  {/* Timestamp */}
                  <td className="px-10 py-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm text-slate-700">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  
                  {/* Triggered By */}
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-all shadow-inner border border-slate-100">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">
                          {log.user ? log.user.name : 'System Scheduler'}
                        </p>
                        {log.user && (
                          <span className="text-[8px] font-bold text-slate-400 tracking-widest block mt-1">
                            {log.user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Event Type */}
                  <td className="px-10 py-8">
                    <span className={`inline-flex px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-sm ${getActionBadgeStyle(log.action)}`}>
                      {formatActionName(log.action)}
                    </span>
                  </td>

                  {/* Event Details */}
                  <td className="px-10 py-8">
                    <p className="text-xs text-slate-600 font-bold leading-relaxed max-w-sm">
                      {log.description}
                    </p>
                  </td>

                  {/* Environment */}
                  <td className="px-10 py-8">
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <Globe size={11} className="text-slate-300" />
                        {log.ip_address || '127.0.0.1'}
                      </div>
                      <div 
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[7px] font-bold text-slate-400 uppercase tracking-widest max-w-[120px] truncate"
                        title={log.user_agent}
                      >
                        <Cpu size={9} className="text-slate-300" />
                        {log.user_agent ? (log.user_agent.includes('Chrome') ? 'Chrome / Linux' : log.user_agent.split(' ')[0]) : 'API Client'}
                      </div>
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

      <ConfirmModal
        isOpen={confirmClear.isOpen}
        title="Purge Platform Logs"
        message="Are you sure you want to purge all system activity logs? This will delete all history forever. This action is irreversible."
        onConfirm={handleConfirmClear}
        onCancel={() => setConfirmClear({ isOpen: false, loading: false })}
        loading={confirmClear.loading}
        confirmText="Purge Logs"
      />

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

export default ActivityLogsPage;
