import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, XCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import api from '../../config/api';
import adminService from './services/adminService';
import Toast from '../../components/ui/Toast';
import Pagination from './components/Pagination';
import SEO from '../../components/common/SEO';

const MakerRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchRequests();
    }, [page]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/maker-requests', {
                params: { page, per_page: 10 }
            });
            setRequests(res.data.data || []);
            setTotalPages(res.data.last_page || 1);
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
                ? await api.post(`/admin/maker-requests/${id}/approve`)
                : await api.post(`/admin/maker-requests/${id}/reject`);
                
            setToast({ message: res.data.message, type: 'success' });
            setRequests(requests.filter(r => r.id !== id));
            if (requests.length === 1 && page > 1) setPage(page - 1);
        } catch (err) {
            setToast({ message: err.response?.data?.message || `Failed to ${action} request`, type: 'error' });
        }
    };

    const filteredRequests = requests.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16 py-8 md:py-12 overflow-x-hidden">
            <SEO 
                title="Maker Applications | Administrative Portal"
                description="Review and authorize creator permissions and applications on QuizSphere."
                url="/admin/maker-requests"
            />
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
                            <ShieldCheck size={22} />
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Access Control</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 uppercase tracking-tight leading-none">Maker <span className="text-blue-600">Applications</span></h2>
                    <p className="text-slate-500 font-bold text-sm md:text-base flex items-center gap-2">
                        <Clock size={16} className="text-blue-500" /> Review and authorize creator permissions.
                    </p>
                </div>

                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search applicants..." 
                        className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-full text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 md:px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Applicant Details</th>
                                <th className="px-8 md:px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Current Role</th>
                                <th className="px-8 md:px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Moderation Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && requests.length === 0 ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="3" className="px-8 md:px-12 py-10"><div className="h-20 bg-slate-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 md:px-12 py-32 text-center">
                                        <div className="flex flex-col items-center max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-8">
                                                <UserPlus size={40} />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Registry Empty</h4>
                                            <p className="text-slate-400 font-bold text-[10px] mt-3 uppercase tracking-widest leading-relaxed text-center">No pending creator applications found in the queue.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors group">
                                        <td className="px-8 md:px-12 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-blue-50 border border-blue-100/50 rounded-xl flex items-center justify-center text-blue-600 font-black text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-none">{user.name || user.email}</p>
                                                    <p className="text-[10px] font-black text-slate-400 lowercase tracking-widest mt-2">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 md:px-12 py-8 text-center">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                                <Clock size={12} /> {user.role?.name || 'Standard User'}
                                            </span>
                                        </td>
                                        <td className="px-8 md:px-12 py-8">
                                            <div className="flex items-center justify-end gap-3 lg:opacity-0 group-hover:opacity-100 transition-all lg:translate-x-4 group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => handleAction(user.id, 'reject')}
                                                    className="flex items-center gap-2 px-6 py-3.5 bg-white border border-rose-100 text-rose-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                                                >
                                                    <XCircle size={16} /> Discard
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(user.id, 'approve')}
                                                    className="flex items-center gap-2 px-6 py-3.5 bg-white border border-emerald-100 text-emerald-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 shadow-emerald-600/5"
                                                >
                                                    <CheckCircle2 size={16} /> Authorize
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-slate-50 px-8 py-6">
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

export default MakerRequestsPage;
