import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  Trash2,
  Mail,
  UserCheck,
  UserPlus,
  ArrowUpRight,
  ShieldAlert,
  UserCircle,
  RefreshCw,
  Clock,
  ChevronDown
} from 'lucide-react';
import api from '../../config/api';
import Toast from '../../components/ui/Toast';
import UserFormModal from './components/UserFormModal';
import Pagination from './components/Pagination';
import ConfirmModal from '../../components/ui/ConfirmModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, userId: null, loading: false });
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchUsers();
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search,
        role_id: roleFilter || undefined,
        per_page: 10
      };
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data);
      setTotalPages(res.data.last_page);
      setTotalUsers(res.data.total);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to fetch users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/users/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRole = async (userId, roleId) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role_id: roleId });
      setToast({ message: 'Role updated successfully', type: 'success' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setToast({ message: 'Failed to update role', type: 'error' });
    }
  };

  const handleDeleteClick = (userId) => {
    setConfirmDelete({ isOpen: true, userId, loading: false });
  };

  const handleConfirmDelete = async () => {
    const userId = confirmDelete.userId;
    setConfirmDelete(prev => ({ ...prev, loading: true }));
    try {
      await api.delete(`/admin/users/${userId}`);
      setToast({ message: 'User deleted successfully', type: 'success' });
      fetchUsers();
      fetchStats();
      setConfirmDelete({ isOpen: false, userId: null, loading: false });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Delete failed', type: 'error' });
      setConfirmDelete(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    { label: 'Total Members', value: stats?.total || 0, icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Administrators', value: stats?.admins || 0, icon: <Shield size={24} />, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Quiz Makers', value: stats?.quiz_makers || 0, icon: <UserCheck size={24} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Regular Users', value: stats?.regular_users || 0, icon: <UserCircle size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16 py-8 md:py-16 pb-32 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
              <Shield size={22} />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Administrative Module</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight uppercase leading-none">User <span className="text-blue-600">Registry</span></h1>
            <p className="text-slate-500 font-bold text-sm md:text-lg max-w-2xl leading-relaxed">
               Monitor system access, manage permissions, and oversee platform participants.
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full lg:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-2xl active:scale-95"
        >
          <UserPlus size={18} /> Register New User
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="flex items-start justify-between relative z-10">
              <div className={`p-4 ${card.bg} ${card.color} rounded-2xl transition-transform duration-500 group-hover:scale-110 shadow-sm`}>
                {card.icon}
              </div>
              <ArrowUpRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
            </div>
            <div className="mt-10 relative z-10">
              <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">{card.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">{card.label}</p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-10">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or email address..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-full outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-black uppercase tracking-widest"
          />
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide -mx-2 px-2">
          <div className="flex items-center gap-2 px-5 py-4 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
          </div>
          {[
            { label: 'All', value: '' },
            { label: 'Admins', value: '1' },
            { label: 'Makers', value: '2' },
            { label: 'Members', value: '3' }
          ].map(role => (
            <button
              key={role.label}
              onClick={() => { setRoleFilter(role.value); setPage(1); }}
              className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 active:scale-95 ${
                roleFilter === role.value 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600 shadow-sm'
              }`}
            >
              {role.label}
            </button>
          ))}
          <button 
            onClick={() => { fetchUsers(); fetchStats(); }}
            className="p-4 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50 transition shadow-sm active:scale-90"
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
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Identity</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Access</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Join Date</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && users.length === 0 ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-10 py-12"><div className="h-20 bg-slate-50 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-10 py-40 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-8">
                         <Users size={48} />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Personnel Found</h4>
                      <p className="text-slate-400 font-bold text-[10px] mt-3 uppercase tracking-widest leading-relaxed">No participants match your current registry filters.</p>
                      <button 
                        onClick={() => { setSearch(''); setRoleFilter(''); setPage(1); }}
                        className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-xl active:scale-95"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/40 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-all shadow-inner relative overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black">{user.name[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors uppercase">{user.name || user.email}</p>
                        <div className="flex items-center gap-2 mt-3">
                           <Mail size={12} className="text-slate-300" />
                           <span className="text-[10px] font-black text-slate-400 lowercase tracking-widest">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="relative inline-block w-56">
                      <select 
                        value={user.role_id}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        className={`w-full appearance-none px-6 py-4.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border transition-all cursor-pointer shadow-sm ${
                          user.role?.name === 'admin' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                          user.role?.name === 'quiz_maker' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                          'bg-blue-50 border-blue-100 text-blue-600'
                        }`}
                      >
                        <option value="1">System Administrator</option>
                        <option value="2">Content Quiz Maker</option>
                        <option value="3">Verified Platform Member</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex flex-col items-center gap-1.5 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                      <Clock size={16} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-end gap-3 lg:opacity-0 group-hover:opacity-100 transition-all lg:translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleDeleteClick(user.id)}
                        className="w-14 h-14 bg-white border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Delete User"
                      >
                        <Trash2 size={20} />
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

      <UserFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: 'success' });
          fetchUsers();
          fetchStats();
        }}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will remove all their associated data."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, userId: null, loading: false })}
        loading={confirmDelete.loading}
        confirmText="Delete User"
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

export default UserManagement;
