import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, XCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import api from '../../config/api';
import adminService from '../../services/adminService';
import Toast from '../../components/ui/Toast';

const MakerRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await adminService.getMakerRequests();
            setRequests(res.data.data || res.data || []);
        } catch (err) {
            console.error(err);
            setToast({ message: 'Failed to load requests', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const res = action === 'approve' 
                ? await adminService.approveMakerRequest(id)
                : await adminService.rejectMakerRequest(id);
                
            setToast({ message: res.data.message, type: 'success' });
            setRequests(requests.filter(r => r.id !== id));
        } catch (err) {
            setToast({ message: err.response?.data?.message || `Failed to ${action} request`, type: 'error' });
        }
    };

    const filteredRequests = requests.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Maker <span className="text-blue-600">Applications</span></h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Clock size={12} className="text-blue-500" /> Review and approve creator status
                    </p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search applicants..." 
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Role</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="3" className="px-10 py-8"><div className="h-12 bg-slate-100 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <UserPlus size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No pending applications</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                                {user.role?.name || 'User'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => handleAction(user.id, 'reject')}
                                                    className="flex items-center gap-2 px-5 py-3 bg-rose-50 text-rose-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(user.id, 'approve')}
                                                    className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-emerald-600/10"
                                                >
                                                    <CheckCircle2 size={14} /> Approve
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
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

export default MakerRequestsPage;
