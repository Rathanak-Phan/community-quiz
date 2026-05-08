import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Layout, Settings, Trash2, ArrowRight } from "lucide-react";
import api from "../../config/api";
import CommunityCard from "../../components/community/CommunityCard";
import CommunityFormModal from "../../components/community/CommunityFormModal";
import Toast from "../../components/ui/Toast";
import { deleteCommunity } from "../../api/communityApi";
import { useAuth } from "../../context/AuthContext";

export default function MyCommunities() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const loadMyCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/my-communities");
      const list = res.data?.data || [];
      setCommunities(list.map(c => ({
        ...c,
        members: c.members_count || 0,
        isOwner: true
      })));
    } catch (error) {
      console.error("Failed to load your communities", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyCommunities();
  }, [loadMyCommunities]);

  const handleSuccess = (message) => {
    setToast({ show: true, message, type: "success" });
    loadMyCommunities();
  };

  const handleDelete = async (id) => {
    try {
      await deleteCommunity(id);
      setToast({ show: true, message: "Community disbanded", type: "success" });
      loadMyCommunities();
    } catch (err) {
      setToast({ show: true, message: "Failed to delete", type: "error" });
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <Users size={14} />
              Social Circles
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
             My <span className="text-blue-600">Communities.</span>
           </h1>
           <p className="text-slate-500 font-medium max-w-lg">The hubs you've joined or created. Stay connected and keep learning with your peers.</p>
        </div>
        
        {(user?.role?.name === 'admin' || user?.role?.name === 'quiz_maker') && (
          <button 
            onClick={() => { setEditData(null); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95 group"
          >
            <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform">
              <Plus size={16} />
            </div>
            New Community
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse border border-slate-100"></div>
           ))}
        </div>
      ) : communities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {communities.map(community => (
             <div key={community.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 -translate-y-16 translate-x-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="flex items-start justify-between relative z-10 mb-8">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:rotate-6 transition-transform">
                         <Users size={28} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight line-clamp-1">{community.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${community.status === 'public' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                               {community.status}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">• {community.members} Members</span>
                         </div>
                      </div>
                   </div>
                </div>

                <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-8 leading-relaxed">
                   {community.description || "No description provided for this community."}
                </p>

                <div className="flex items-center gap-3 relative z-10">
                   <button 
                     onClick={() => navigate(`/communities/${community.id}`)}
                     className="flex-1 py-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                   >
                     <ArrowRight size={14} />
                     Enter Hub
                   </button>
                   {community.created_by === user?.id && (
                     <>
                       <button 
                         onClick={() => navigate(`/communities/${community.id}/requests`)}
                         className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-100 transition-all"
                         title="Members"
                       >
                         <Users size={18} />
                       </button>
                       <button 
                         onClick={() => { setEditData(community); setIsModalOpen(true); }}
                         className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-all"
                         title="Settings"
                       >
                         <Settings size={20} />
                       </button>
                       <button 
                         onClick={() => handleDelete(community.id)}
                         className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-100 transition-all"
                         title="Delete"
                       >
                         <Trash2 size={20} />
                       </button>
                     </>
                   )}
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6">
           <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
              <Users size={48} />
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase">Start a community</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Build a home for your specialized quizzes</p>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-2 transition-transform"
           >
             Create your first group <ArrowRight size={14} />
           </button>
        </div>
      )}

      <CommunityFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
        editData={editData}
      />

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
}
