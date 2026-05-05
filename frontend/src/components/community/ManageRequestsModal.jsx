import { useState, useEffect } from "react";
import { getPendingMembers, approveMember, rejectMember } from "../../api/communityApi";
import { Check, X, User, Loader2 } from "lucide-react";

export default function ManageRequestsModal({ isOpen, onClose, communityId, communityName }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isOpen && communityId) {
      fetchPendingMembers();
    }
  }, [isOpen, communityId]);

  const fetchPendingMembers = async () => {
    setLoading(true);
    try {
      const res = await getPendingMembers(communityId);
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pending members:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (memberId, action) => {
    setActionLoading(memberId);
    try {
      if (action === "approve") {
        await approveMember(memberId);
      } else {
        await rejectMember(memberId);
      }
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      console.error(`Failed to ${action} member:`, err);
      alert(`Failed to ${action} member.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Join Requests</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{communityName}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Requests...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="py-12 text-center space-y-4">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto">
                  <User size={32} />
               </div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-blue-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{member.user?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      disabled={actionLoading === member.id}
                      onClick={() => handleAction(member.id, "approve")}
                      className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {actionLoading === member.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} />}
                    </button>
                    <button
                      disabled={actionLoading === member.id}
                      onClick={() => handleAction(member.id, "reject")}
                      className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition shadow-sm disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
