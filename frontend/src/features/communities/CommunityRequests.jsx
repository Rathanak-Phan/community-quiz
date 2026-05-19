import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { 
  Users, User, Check, X, ArrowLeft, ShieldCheck, 
  Clock, AlertCircle, Loader2, Mail
} from 'lucide-react';
import { getPendingMembers, approveMember, rejectMember, getCommunityById } from '../../api/communityApi';
import { useAuth } from '../../providers/AuthContext';
import Toast from '../../components/ui/Toast';

export default function CommunityRequests() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const userId = user?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [commRes, reqRes] = await Promise.all([
        getCommunityById(id),
        getPendingMembers(id)
      ]);
      
      const commData = commRes.data;
      
      // Access Restriction: Only owner or admin can access
      if (commData.created_by !== userId && !isAdmin) {
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
  }, [id, userId, isAdmin, navigate]);

  useEffect(() => {
    if (id && id !== 'undefined' && userId) {
      fetchData();
    }
  }, [id, userId, fetchData]);

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
    <div className="space-y-6 sm:space-y-8 pb-16">
      <SEO 
        title={`Join Requests - ${community?.name || 'Community'}`}
        description="Review and manage pending membership requests for your community hub on QuizSphere."
        url={`/communities/${id}/requests`}
      />
      {/* Header */}
      <div className="flex flex-col justify-between items-start gap-4">
        <button 
          onClick={() => navigate(`/communities/${id}`)}
          className="flex items-center gap-1.5 text-slate-400 font-black uppercase text-[9px] tracking-widest hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to Community
        </button>
        
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            Join <span className="text-blue-600">Requests.</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1.5 leading-none">
            <Users size={12} className="text-blue-600" />
            {community.name} • {requests.length} Pending
          </p>
        </div>
      </div>

      {/* Requests List Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-md shadow-slate-100/50 overflow-hidden">
        {requests.length === 0 ? (
          <div className="py-20 sm:py-28 flex flex-col items-center text-center space-y-4 p-4">
            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 border border-slate-100">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase">All Caught Up!</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] leading-relaxed max-w-xs">There are no pending join requests at this time.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((request) => (
              <div key={request.id} className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 border border-blue-100/50 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <User size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight truncate max-w-[200px] sm:max-w-none">{request.user?.name}</h4>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 truncate">
                        <Mail size={10} className="shrink-0 text-slate-350" />
                        {request.user?.email}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={10} className="shrink-0 text-slate-350" />
                        Req. {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0 border-t border-slate-50 pt-3.5 md:border-t-0 md:pt-0">
                  <button
                    disabled={actionLoading === request.id}
                    onClick={() => handleAction(request.id, 'approve')}
                    className="flex-1 md:flex-none bg-slate-900 text-white px-5 py-2.5 sm:px-6 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition shadow-md hover:shadow-blue-600/10 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    {actionLoading === request.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    Approve
                  </button>
                  <button
                    disabled={actionLoading === request.id}
                    onClick={() => handleAction(request.id, 'reject')}
                    className="flex-1 md:flex-none bg-slate-50 border border-slate-200 text-slate-500 px-5 py-2.5 sm:px-6 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <X size={12} />
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
