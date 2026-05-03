import { Users, Lock, Globe, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { STORAGE_URL } from "../../config/api";

export default function CommunityCard({ community, onJoin, onViewMore, onApprove }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isGuest = !localStorage.getItem("token");
  const isOwner = community.owner_id === user?.id;

  const getStatusColor = (status) => {
    switch (status) {
      case "public": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "private": return "bg-orange-50 text-orange-700 border-orange-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "private": return <Lock size={12} />;
      case "public": return <Globe size={12} />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col">
      {/* Banner */}
      <div className="h-40 relative bg-slate-50 overflow-hidden">
        {community.cover_image ? (
          <img 
            src={`${STORAGE_URL}/${community.cover_image}`} 
            className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
            alt={community.name} 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 opacity-10 flex items-center justify-center">
            <Users size={64} className="text-blue-600 opacity-10" />
          </div>
        )}
        <div className="absolute top-6 right-6">
           <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg border backdrop-blur-md bg-white/90 ${getStatusColor(community.status)}`}>
             {getStatusIcon(community.status)}
             {community.status}
           </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-3">{community.name}</h3>
        <p className="text-sm text-slate-500 font-medium line-clamp-2 min-h-[40px] leading-relaxed mb-8">
          {community.description || "A dedicated space for community members to share knowledge and quizzes."}
        </p>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
               <Users size={16} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                <span className="text-slate-900 block text-sm mb-0.5">{community.members}</span>
                Members
            </p>
          </div>
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <img key={i} src={`https://i.pravatar.cc/100?img=${i + 20}`} className="w-8 h-8 rounded-xl border-2 border-white shadow-sm" alt="Member" />
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-slate-50 flex gap-4">
          {isGuest ? (
             <button 
                onClick={() => window.location.href = '/login'}
                className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition flex items-center justify-center gap-2"
              >
                Login to Join
              </button>
          ) : community.isMember ? (
            <button 
              onClick={() => onViewMore(community)}
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition flex items-center justify-center gap-2"
            >
              <CheckCircle size={14} className="text-emerald-500" />
              Member
            </button>
          ) : community.join_status === 'pending' ? (
            <button 
              disabled
              className="flex-1 py-4 px-6 rounded-2xl bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Clock size={14} />
              Pending
            </button>
          ) : (
            <button
              onClick={() => onJoin(community)}
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95"
            >
              Join Group
            </button>
          )}
          
          <button
            onClick={() => onViewMore(community)}
            className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center shadow-inner"
          >
            <ChevronRight size={20} />
          </button>

          {!isGuest && isOwner && (
             <button
               onClick={() => onApprove(community)}
               className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-sm flex items-center justify-center border border-emerald-100"
               title="Approve Members"
             >
               <Users size={18} />
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
