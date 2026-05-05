import React from 'react';
import { Clock, Users, ChevronRight, Sparkles, Heart, Edit3, Trash2 } from 'lucide-react';
import { STORAGE_URL } from '../../config/api';

export default function QuizCard({ quiz, isAdmin, userId, onEdit, onDelete, onClick }) {
    const isGuest = !localStorage.getItem("token");
    
    const handleAction = (e) => {
        if (isGuest) {
            e.stopPropagation();
            window.location.href = '/login';
            return;
        }
        onClick();
    };

    return (
        <div 
            onClick={handleAction}
            className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 group cursor-pointer relative flex flex-col"
        >
            <div className="h-48 relative bg-slate-50 overflow-hidden">
                {quiz.cover_image ? (
                    <img src={`${STORAGE_URL}/${quiz.cover_image}`} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt={quiz.title} />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                        <Sparkles size={48} className="text-blue-200" />
                    </div>
                )}
                
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="px-4 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-lg border border-white/50">
                        {quiz.category?.name || "General"}
                    </span>
                    {quiz.community?.name && (
                      <span className="px-4 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest shadow-lg border border-white/10">
                          {quiz.community.name}
                      </span>
                    )}
                </div>

                <div className="absolute top-6 right-6 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                        onClick={(e) => { e.stopPropagation(); }}
                        className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition shadow-lg"
                    >
                        <Heart size={16} fill={quiz.is_favorite ? "currentColor" : "none"} />
                    </button>
                    {(isAdmin || quiz.created_by === userId) && (
                        <>
                            <button 
                                onClick={(e) => onEdit(e, quiz)}
                                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-lg"
                            >
                                <Edit3 size={16} />
                            </button>
                            <button 
                                onClick={(e) => onDelete(e, quiz.id)}
                                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-lg"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-3 uppercase tracking-tight">
                    {quiz.title}
                </h3>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-[10px] uppercase">
                        {quiz.creator?.name?.charAt(0) || "U"}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        By {quiz.creator?.name || "Anonymous"}
                    </span>
                </div>
                <p className="text-slate-500 text-sm font-medium line-clamp-2 min-h-[40px] leading-relaxed mb-8">
                    {quiz.description || "Challenge your knowledge with this community-contributed module."}
                </p>
                
                <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Clock size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz.time_limit || 30}M</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Users size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz.attempts_count || 0} ATTEMPTS</span>
                        </div>
                    </div>
                    
                    <button className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-slate-900/10 group-hover:shadow-blue-600/20 active:scale-90">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
