import React, { useState } from "react";
import { Users, Lock, Globe, CheckCircle, Clock, ChevronRight, Trash2, Settings, LogOut, Heart, ArrowRight } from "lucide-react";
import { STORAGE_URL } from "../../../config/api";
import { toggleFavorite } from "../../../services/favoriteService";

export default function CommunityCard({ community, onJoin, onLeave, onViewMore, onApprove, onEdit, onDelete, onFavoriteToggle }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isGuest = !localStorage.getItem("token");
  const isOwner = community.created_by === user?.id;

  const [isFavorited, setIsFavorited] = useState(community.is_favorited);
  const [favLoading, setFavLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  React.useEffect(() => {
    setIsFavorited(community.is_favorited);
  }, [community.is_favorited]);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (isGuest) return;
    setFavLoading(true);
    try {
      const res = await toggleFavorite('community', community.id);
      const newStatus = res.data.is_favorite;
      setIsFavorited(newStatus);
      if (onFavoriteToggle) {
        onFavoriteToggle(community.id, newStatus);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setFavLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "public": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "private": return "bg-orange-50 text-orange-700 border-orange-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "private": return <Lock size={11} className="sm:w-3 sm:h-3" />;
      case "public": return <Globe size={11} className="sm:w-3 sm:h-3" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 group flex flex-col relative">
      {/* Banner */}
      <div className="h-36 sm:h-40 relative bg-slate-900 overflow-hidden">
        {community.cover_image ? (
          <>
            <img 
              src={`${STORAGE_URL}/${community.cover_image}`} 
              className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
              alt={community.name} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <Users size={40} className="text-blue-400 opacity-20 animate-pulse sm:w-12 sm:h-12" />
          </div>
        )}
        
        {/* Heart Favorite Button */}
        <div className="absolute top-4 left-4 z-10">
           {!isGuest && (
             <button 
               onClick={handleToggleFavorite}
               disabled={favLoading}
               className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all shadow-md border backdrop-blur-md active:scale-90 ${isFavorited ? 'bg-rose-500 text-white border-rose-400' : 'bg-white/85 text-slate-600 border-white/40 hover:bg-white hover:text-rose-500'}`}
             >
               <Heart size={16} fill={isFavorited ? "currentColor" : "none"} className={favLoading ? 'animate-pulse' : ''} />
             </button>
           )}
        </div>

        {/* Status Badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md border backdrop-blur-md bg-white/85 ${getStatusColor(community.visibility)}`}>
             {getStatusIcon(community.visibility)}
             {community.visibility}
           </span>
           {community.status === 'draft' && (
             <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md border backdrop-blur-md bg-slate-900/85 text-white border-slate-800">
               Draft
             </span>
           )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">{community.name}</h3>
          <p className="text-xs text-slate-500 font-medium line-clamp-2 min-h-[32px] leading-relaxed">
            {community.description || "A dedicated space for community members to share knowledge and quizzes."}
          </p>
        </div>

        {/* Member Overlap Stats Widget */}
        <div className="flex items-center justify-between mb-5 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
               <Users size={14} />
            </div>
            <div className="leading-tight">
                <span className="text-slate-900 block text-xs font-black tracking-tight">{community.members}</span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Members</p>
            </div>
          </div>
          
          <div className="flex -space-x-2">
            {community.memberAvatars?.slice(0, 3).map((member, i) => (
              <img 
                key={i} 
                src={member.avatar || `https://i.pravatar.cc/100?u=${member.name}`} 
                className="w-7 h-7 rounded-full border border-white shadow-sm object-cover hover:-translate-y-0.5 transition-transform" 
                alt={member.name} 
                title={member.name}
              />
            ))}
            {community.members > 3 && (
              <div className="w-7 h-7 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 shadow-sm leading-none shrink-0">
                +{community.members - 3}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Deck */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2.5 relative">
          {/* Main Primary Action Button */}
          {isGuest ? (
             <button 
                onClick={() => window.location.href = '/'}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 active:scale-95 border border-slate-100"
              >
                <span>Login to Join</span> <ArrowRight size={12} />
              </button>
          ) : community.isMember ? (
             <button 
                onClick={() => onViewMore(community)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 active:scale-95 border border-blue-100/50"
              >
                <CheckCircle size={12} className="text-blue-600" />
                <span>Enter Circle</span>
              </button>
          ) : community.joinStatus === 'pending' ? (
            <button 
              disabled
              className="flex-1 py-2.5 px-4 rounded-xl bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border border-orange-100"
            >
              <Clock size={12} />
              <span>Pending</span>
            </button>
          ) : (
            <button
              onClick={() => onJoin(community)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-md hover:shadow-blue-600/10 active:scale-95"
            >
              Join Circle
            </button>
          )}

          {/* Context Options or Leaving Actions */}
          {!isGuest && isOwner ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${showMenu ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                title="Circle Controls"
              >
                <Settings size={14} className={showMenu ? 'rotate-45 transition-transform duration-300' : 'transition-transform duration-300'} />
              </button>

              {/* Absolute dropdown menu floating above footer */}
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  ></div>
                  <div className="absolute right-0 bottom-11 w-48 bg-white border border-slate-200/80 rounded-xl shadow-xl p-1.5 z-30 space-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onApprove(community);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Users size={14} className="text-slate-400" />
                      <span>Manage Requests</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit(community);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Settings size={14} className="text-slate-400" />
                      <span>Edit Settings</span>
                    </button>

                    <div className="h-px bg-slate-100 my-1"></div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete(community.id);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={14} className="text-rose-400" />
                      <span>Delete Circle</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : !isGuest && community.isMember && !isOwner && onLeave ? (
            <button
              onClick={() => onLeave(community)}
              className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition flex items-center justify-center active:scale-95 shrink-0"
              title="Leave Circle"
            >
              <LogOut size={14} />
            </button>
          ) : (
            <button
              onClick={() => onViewMore(community)}
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition flex items-center justify-center active:scale-95 shrink-0"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
