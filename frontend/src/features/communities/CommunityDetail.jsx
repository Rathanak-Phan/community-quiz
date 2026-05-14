import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Clock, Play, ArrowLeft, 
  Globe, Lock, ShieldCheck, TrendingUp, Sparkles, AlertCircle, Settings, Plus, Share2, Hash, LogOut
} from 'lucide-react';
import { joinByCode } from '../../services/communityService';
import InviteModal from './components/InviteModal';
import apiClient, { STORAGE_URL } from '../../config/api';
import Toast from '../../components/ui/Toast';
import CommunityFormModal from './components/CommunityFormModal';
import QuizFormModal from '../quizzes/components/QuizFormModal';
import JoinModal from './components/JoinModal';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role?.name === "admin" || Number(user?.role_id) === 1;
  const isQuizMaker = user?.role?.name === "quiz_maker" || Number(user?.role_id) === 2;
  const isGuest = !localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [commRes, quizRes] = await Promise.all([
        apiClient.get(`/communities/${id}`),
        apiClient.get(`/communities/${id}/quizzes`)
      ]);
      setCommunity(commRes.data);
      setQuizzes(quizRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load community details");
      if (err.response?.status === 403 || err.response?.status === 401) {
          setError("This is a private community. You need to be a member to view its content.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchData();
    }
  }, [id, fetchData]);

  const handleJoin = async () => {
    if (isGuest) {
      navigate("/");
      return;
    }
    try {
      await apiClient.post(`/communities/${id}/join`);
      setToast({ show: true, message: "Join request sent successfully!", type: "success" });
      fetchData();
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || "Failed to join", type: "error" });
    }
  };

  const handleJoinByCode = async (code) => {
    try {
      const res = await joinByCode(code);
      setToast({ show: true, message: res.data.message, type: "success" });
      if (res.data.community_id === Number(id)) {
        fetchData();
      } else {
        navigate(`/communities/${res.data.community_id}`);
      }
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || "Invalid code", type: "error" });
      throw err;
    }
  };

  const handleAttemptQuiz = (quizId) => {
    if (isGuest) {
      navigate("/");
      return;
    }
    navigate(`/quizzes/${quizId}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto py-20 px-6 text-center space-y-8">
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto">
            <AlertCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Access Restricted</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-loose">{error}</p>
        <button 
          onClick={() => navigate("/communities")}
          className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest mx-auto hover:underline"
        >
            <ArrowLeft size={14} />
            Back to Communities
        </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-8 md:space-y-12 pb-20">
      {/* Hero Header */}
      <div className="relative min-h-[300px] md:h-[350px] rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col justify-end pt-20">
        {community.cover_image ? (
          <img src={`${STORAGE_URL}/${community.cover_image}`} className="absolute inset-0 w-full h-full object-cover" alt={community.name} />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600"></div>
        )}
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>
        
        <div className="relative p-6 md:p-12 space-y-6">
          <button 
            onClick={() => navigate("/communities")}
            className="absolute top-[-40px] md:top-8 left-0 md:left-8 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center text-white transition shadow-lg"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="space-y-4 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border border-white/20 ${
                  community.visibility === 'public' ? 'bg-emerald-500/90 text-white' : 'bg-orange-500/90 text-white'
                }`}>
                  {community.visibility === 'public' ? <Globe size={12} className="inline mr-2" /> : <Lock size={12} className="inline mr-2" />}
                  {community.visibility} Community
                </span>
                {community.status === 'draft' && (
                  <span className="px-4 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest shadow-lg border border-white/10">
                    Draft Mode
                  </span>
                )}
                <span className="px-4 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest shadow-lg border border-white/10">
                  <Users size={12} className="inline mr-2" />
                  {community.members?.length || 0} Members
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-tight">{community.name}</h1>
              <p className="text-white/80 font-bold uppercase tracking-widest text-[10px] max-w-2xl line-clamp-3">{community.description}</p>
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              {!community.is_member && (
                <div className="flex gap-4 w-full sm:w-auto">
                  <button 
                    onClick={handleJoin}
                    disabled={community.join_status === 'pending'}
                    className={`flex-1 sm:flex-none px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${
                      community.join_status === 'pending' 
                        ? 'bg-orange-500 text-white cursor-not-allowed' 
                        : 'bg-white text-slate-900 hover:bg-blue-600 hover:text-white'
                    }`}
                  >
                    {isGuest ? "Login to Join" : community.join_status === 'pending' ? "Pending Approval" : "Request Access"}
                  </button>
                  {!isGuest && community.status !== 'draft' && (
                    <button 
                      onClick={() => setIsJoinModalOpen(true)}
                      className="flex-1 sm:flex-none bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Hash size={18} />
                      Code
                    </button>
                  )}
                </div>
              )}

              {community.is_member && user?.id !== community.created_by && (
                <button 
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to leave ${community.name}?`)) {
                      try {
                        await apiClient.post(`/communities/${id}/leave`);
                        setToast({ show: true, message: "You have left the community.", type: "success" });
                        fetchData();
                      } catch (err) {
                        setToast({ show: true, message: err.response?.data?.message || "Failed to leave", type: "error" });
                      }
                    }
                  }}
                  className="flex-1 sm:flex-none bg-rose-50 text-rose-500 px-8 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-rose-100 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Leave Community
                </button>
              )}

              {user?.id === community.created_by && (
                <>
                  <button 
                    onClick={() => navigate(`/communities/${community.id}/requests`)}
                    className="flex-1 sm:flex-none bg-emerald-500 text-white px-8 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Users size={18} />
                    Requests
                  </button>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex-1 sm:flex-none bg-blue-600 text-white px-8 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Settings size={18} />
                    Edit
                  </button>
                  {community.status !== 'draft' && (
                    <button 
                      onClick={() => setIsInviteModalOpen(true)}
                      className="flex-1 sm:flex-none bg-slate-900 text-white px-8 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Share2 size={18} />
                      Invite
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
              <BookOpen size={28} className="text-blue-600" />
              Community Quizzes
           </h2>
            <div className="flex items-center gap-4">
               {community.is_member && (isAdmin || isQuizMaker) && (
                  <button 
                    onClick={() => setIsQuizModalOpen(true)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95 group"
                  >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                    Add Quiz
                  </button>
               )}
               <div className="bg-slate-50 p-2 rounded-2xl flex gap-2">
                  <TabBtn label="All" active />
                  <TabBtn label="Newest" />
               </div>
            </div>
        </div>

        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {quizzes.map((quiz) => (
              <div 
                key={quiz.id} 
                className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group flex flex-col h-full"
              >
                <div className="space-y-6 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-inner">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {quiz.category?.name}
                      </span>
                      {quiz.status === 'draft' && (
                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 uppercase tracking-tight">
                    {quiz.title}
                  </h3>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-300" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz.time_limit || 30}M</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz.attempts_count || 0} PLAYS</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col gap-3">
                  <button 
                    onClick={() => handleAttemptQuiz(quiz.id)}
                    className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95"
                  >
                    <Play size={16} />
                    {isGuest ? "Login to Attempt" : "Attempt Quiz"}
                  </button>

                  {(isAdmin || user?.id === quiz.created_by) && (
                    <button 
                      onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                      className="w-full bg-white text-slate-900 border border-slate-100 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition shadow-sm active:scale-95"
                    >
                      <Settings size={16} />
                      Update Questions
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 bg-slate-50 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 shadow-sm">
                <Sparkles size={32} />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 uppercase">Empty Library</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No quizzes have been shared here yet.</p>
                {community.is_member && (isAdmin || isQuizMaker) && (
                  <button 
                    onClick={() => setIsQuizModalOpen(true)}
                    className="mt-6 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:underline flex items-center gap-2 mx-auto"
                  >
                    <Plus size={12} />
                    Be the first to add a quiz
                  </button>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CommunityFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={(msg) => {
          setToast({ show: true, message: msg, type: "success" });
          fetchData();
        }}
        editData={community}
      />

      <QuizFormModal 
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onSuccess={(msg) => {
          setToast({ show: true, message: msg, type: "success" });
          fetchData();
        }}
        preselectedCommunityId={id}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        community={community}
        onRegenerate={(newCode) => {
          setCommunity({ ...community, invite_code: newCode });
          setToast({ show: true, message: "Invite code regenerated!", type: "success" });
        }}
      />

      <JoinModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinByCode}
      />

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
};

const TabBtn = ({ label, active }) => (
  <button className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
    active ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'
  }`}>
    {label}
  </button>
);

export default CommunityDetail;
