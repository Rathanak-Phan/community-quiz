import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  Trash2,
  Mail,
  UserCheck,
  UserPlus
} from 'lucide-react';
import api from '../../config/api';
import Toast from '../../components/ui/Toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      // If backend uses pagination, the array is in res.data.data
      setUsers(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, roleId) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role_id: roleId });
      setToast({ message: 'Role updated', type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: 'Failed to update role', type: 'error' });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setToast({ message: 'User deleted', type: 'success' });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Delete failed', type: 'error' });
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">User <span className="text-blue-600">Management</span></h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Users size={12} className="text-blue-500" /> Control System Access & Roles
          </p>
        </div>
        <div className="flex gap-4">
            <div className="relative">
                <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="pl-14 pr-10 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-600 transition min-w-[300px]"
                />
            </div>
            <button className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-blue-600 transition">
                <UserPlus size={16} /> Add User
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-slate-50/50">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Role</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {users.map((user) => (
                      <tr key={user.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors group">
                          <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition shadow-inner">
                                      <Users size={24} />
                                  </div>
                                  <div>
                                      <p className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">{user.name}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                          <Mail size={12} className="text-slate-300" />
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-10 py-8">
                              <select 
                                  value={user.role_id}
                                  onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border transition-all ${
                                      user.role?.name === 'admin' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                                      user.role?.name === 'quiz_maker' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                      'bg-blue-50 border-blue-100 text-blue-600'
                                  }`}
                              >
                                  <option value="1">Admin</option>
                                  <option value="2">Quiz Maker</option>
                                  <option value="3">User</option>
                              </select>
                          </td>
                          <td className="px-10 py-8">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(user.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="px-10 py-8">
                              <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                      onClick={() => handleDelete(user.id)}
                                      className="w-10 h-10 bg-white border border-rose-100 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition shadow-sm"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                                  <button className="w-10 h-10 bg-white border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition shadow-sm">
                                      <MoreVertical size={16} />
                                  </button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
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

export default UserManagement;
