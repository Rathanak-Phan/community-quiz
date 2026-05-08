import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, User, Check, X, ArrowLeft, ShieldCheck, 
  Clock, AlertCircle, Loader2, Mail
} from 'lucide-react';
import { getPendingMembers, approveMember, rejectMember, getCommunityById } from '../../api/communityApi';
import Toast from '../../components/ui/Toast';

export default function CommunityRequests() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [commRes, reqRes] = await Promise.all([
        getCommunityById(id),
        getPendingMembers(id)
      ]);
      
      const commData = commRes.data;
      
      // Access Restriction: Only owner can access
      if (commData.created_by !== user?.id && user?.role !== 'admin') {
        navigate('/communities');
        return;
      }
      
      setCommunity(commData);
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      if (err.response?.status === 403) {
        navigate('/communities');
      }
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, user?.role, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (requestId, action) => {
    setActionLoading(requestId);
    try {
      if (action === 'approve') {
        await approveMember(requestId);
        setToast({ show: true, message: "Member approved successfully!", type: "success" });
      } else {
        await rejectMember(requestId);
        setToast({ show: true, message: "Request rejected.", type: "warning" });
      }
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || `Failed to ${action} request`, type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  );

  if (!community) return null;

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <button 
            onClick={() => navigate(`/communities/${id}`)}
            className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Community
          </button>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Join <span className="text-blue-600">Requests.</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Users size={14} className="text-blue-600" />
              {community.name} • {requests.length} Pending
            </p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        {requests.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
              <ShieldCheck size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase">All Caught Up!</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">There are no pending join requests at this time.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {requests.map((request) => (
              <div key={request.id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    <User size={28} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{request.user?.name}</h4>
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={12} />
                        {request.user?.email}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} />
                        Requested {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  <button
                    disabled={actionLoading === request.id}
                    onClick={() => handleAction(request.id, 'approve')}
                    className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {actionLoading === request.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    Approve
                  </button>
                  <button
                    disabled={actionLoading === request.id}
                    onClick={() => handleAction(request.id, 'reject')}
                    className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-400 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
}
