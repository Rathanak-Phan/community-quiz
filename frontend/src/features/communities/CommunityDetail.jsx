import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Users, BookOpen, Clock, Play, ArrowLeft, 
  Globe, Lock, ShieldCheck, TrendingUp, Sparkles, AlertCircle, Settings, Plus, Share2, Hash, LogOut, Trophy
} from 'lucide-react';
import { joinByCode } from '../../services/communityService';
import InviteModal from './components/InviteModal';
import apiClient, { STORAGE_URL } from '../../config/api';
import Toast from '../../components/ui/Toast';
import CommunityFormModal from './components/CommunityFormModal';
import QuizFormModal from '../quizzes/components/QuizFormModal';
import JoinModal from './components/JoinModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import SEO from '../../components/common/SEO';

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
  const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' or 'members'

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
        <div className="w-20 h-20 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mx-auto">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-20 pb-32 overflow-x-hidden">
      <SEO 
        title={community.name} 
        description={community.description || `Join the ${community.name} community on QuizSphere and participate in interactive quizzes!`}
        image={community.cover_image ? `${STORAGE_URL}/${community.cover_image}` : null}
        url={`/communities/${id}`}
      />
      {/* Hero Header */}
      <div className="relative min-h-[380px] md:h-[450px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-end pt-20">
        {community.cover_image ? (
          <img src={`${STORAGE_URL}/${community.cover_image}`} className="absolute inset-0 w-full h-full object-cover" alt={community.name} />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600"></div>
        )}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]"></div>
        
        <div className="relative p-6 md:p-10 lg:p-16 space-y-6 md:space-y-8">
          <button 
            onClick={() => navigate("/communities")}
            className="absolute top-6 left-6 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition shadow-lg z-30"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="space-y-4 md:space-y-6 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border border-white/20 ${
                  community.visibility === 'public' ? 'bg-emerald-500/90 text-white' : 'bg-orange-500/90 text-white'
                }`}>
                  {community.visibility === 'public' ? <Globe size={12} className="inline mr-2" /> : <Lock size={12} className="inline mr-2" />}
                  {community.visibility} Community
                </span>
                {community.status === 'draft' && (
                  <span className="px-4 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest shadow-lg border border-white/10">
                    Draft
                  </span>
                )}
                <span className="px-4 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest shadow-lg border border-white/10">
                  <Users size={12} className="inline mr-2" />
                  {community.members?.length || 0} Members
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tight uppercase leading-tight">{community.name}</h1>
              <p className="text-white/80 font-bold uppercase tracking-widest text-[9px] md:text-xs max-w-3xl leading-relaxed line-clamp-3">{community.description}</p>
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              {!community.is_member && (
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button 
                    onClick={handleJoin}
                    disabled={community.join_status === 'pending'}
                    className={`w-full sm:w-auto px-10 py-5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${
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
                      className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Hash size={18} />
                      Code
                    </button>
                  )}
                </div>
              )}
              {community.is_member && user?.id !== community.created_by && (
                <button 
                  onClick={() => setIsConfirmLeaveOpen(true)}
                  className="w-full sm:w-auto bg-rose-50 text-rose-500 px-8 py-5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-rose-100 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Leave Community
                </button>
              )}

              {user?.id === community.created_by && (
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 md:gap-4 w-full lg:w-auto">
                  <button 
                    onClick={() => navigate(`/communities/${community.id}/requests`)}
                    className="bg-emerald-500 text-white px-4 md:px-8 py-5 rounded-xl font-black text-[10px] md:text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Users size={18} />
                    Requests
                  </button>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-blue-600 text-white px-4 md:px-8 py-5 rounded-xl font-black text-[10px] md:text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Settings size={18} />
                    Edit
                  </button>
                  {community.status !== 'draft' && (
                    <button 
                      onClick={() => setIsInviteModalOpen(true)}
                      className="col-span-2 sm:col-span-1 bg-slate-900 text-white px-4 md:px-8 py-5 rounded-xl font-black text-[10px] md:text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Share2 size={18} />
                      Invite
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center border-b border-slate-100 sticky top-20 bg-white/80 backdrop-blur-xl z-20 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex gap-8 md:gap-12 py-4">
          <button 
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center gap-3 pb-4 -mb-4 transition-all relative group ${
              activeTab === 'quizzes' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen size={20} className={activeTab === 'quizzes' ? 'animate-pulse' : ''} />
            <div className="flex flex-col items-start">
               <span className="font-black text-[10px] md:text-[11px] uppercase tracking-widest">Quizzes</span>
               <span className="text-[8px] font-bold opacity-60 hidden sm:inline">{quizzes.length} Items</span>
            </div>
            <span className={`absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full transition-all duration-300 ${
              activeTab === 'quizzes' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-30 group-hover:scale-x-50'
            }`}></span>
          </button>
          
          {community.is_member && (
            <button 
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-3 pb-4 -mb-4 transition-all relative group ${
                activeTab === 'members' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Users size={20} className={activeTab === 'members' ? 'animate-pulse' : ''} />
              <div className="flex flex-col items-start">
                 <span className="font-black text-[10px] md:text-[11px] uppercase tracking-widest">Members</span>
                 <span className="text-[8px] font-bold opacity-60 hidden sm:inline">{community.members?.length || 0} People</span>
              </div>
              <span className={`absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full transition-all duration-300 ${
                activeTab === 'members' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-30 group-hover:scale-x-50'
              }`}></span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'quizzes' ? (
        <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                Knowledge Pool
            </h2>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {community.is_member && (isAdmin || isQuizMaker) && (
                    <button 
                      onClick={() => setIsQuizModalOpen(true)}
                      className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-2xl active:scale-95 group"
                    >
                      <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                      Publish Quiz
                    </button>
                )}
              </div>
          </div>

          {quizzes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {quizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full"
                >
                  <div className="space-y-6 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-inner">
                        <BookOpen size={24} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {quiz.category?.name}
                        </span>
                        {quiz.status === 'draft' && (
                          <span className="px-3 py-1 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 uppercase tracking-tight leading-tight">
                      {quiz.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 md:gap-6">
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

                  <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-slate-50 flex flex-col gap-3">
                    <button 
                      onClick={() => handleAttemptQuiz(quiz.id)}
                      className="w-full bg-slate-900 text-white py-4.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition shadow-2xl active:scale-95"
                    >
                      <Play size={16} />
                      {isGuest ? "Login to Attempt" : "Attempt Quiz"}
                    </button>

                    {(isAdmin || user?.id === quiz.created_by) && (
                      <button 
                        onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                        className="w-full bg-white text-slate-900 border border-slate-100 py-4.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition shadow-sm active:scale-95"
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
            <div className="py-24 md:py-40 bg-slate-50 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-center space-y-6 px-6">
               <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-sm">
                  <Sparkles size={40} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase">Empty Library</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No quizzes have been shared here yet.</p>
                  {community.is_member && (isAdmin || isQuizMaker) && (
                    <button 
                      onClick={() => setIsQuizModalOpen(true)}
                      className="mt-8 px-8 py-4 bg-white text-blue-600 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:shadow-md transition-all flex items-center gap-2 mx-auto"
                    >
                      <Plus size={14} />
                      Be the first to add a quiz
                    </button>
                  )}
               </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4 uppercase">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                Member Circle
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
            {community.members?.filter(m => m.user?.role !== 'admin' && m.user?.role?.name !== 'admin').map((member) => (
              <Link 
                key={member.id} 
                to={`/profile/${member.user?.id}`}
                className="flex flex-col items-center gap-6 p-6 md:p-10 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group text-center relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                 
                 <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-2xl border-4 border-white shadow-lg relative group-hover:rotate-6 transition-transform overflow-hidden">
                       {member.user?.avatar ? (
                         <img src={member.user.avatar} className="w-full h-full object-cover" alt={member.user.name} />
                       ) : (
                         member.user?.name?.charAt(0).toUpperCase()
                       )}
                       {member.role === 'owner' && (
                         <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-1.5 rounded-xl shadow-xl border-2 border-white transform -rotate-12">
                           <Trophy size={14} fill="currentColor" />
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="relative z-10 space-y-2">
                    <p className="font-black text-slate-900 text-[11px] md:text-xs uppercase tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                      {member.user?.name}
                    </p>
                    <div className="flex flex-col items-center gap-2">
                       <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                         member.role === 'owner' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                       }`}>
                         {member.role}
                       </span>
                       <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Profile</p>
                    </div>
                 </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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

      <ConfirmModal
        isOpen={isConfirmLeaveOpen}
        title="Leave Community"
        message={`Are you sure you want to leave ${community?.name}? You will lose access to member-only quizzes and discussions.`}
        onConfirm={async () => {
          setIsLeaving(true);
          try {
            await apiClient.post(`/communities/${id}/leave`);
            setToast({ show: true, message: "You have left the community.", type: "success" });
            setIsConfirmLeaveOpen(false);
            fetchData();
          } catch (err) {
            setToast({ show: true, message: err.response?.data?.message || "Failed to leave", type: "error" });
          } finally {
            setIsLeaving(false);
          }
        }}
        onCancel={() => setIsConfirmLeaveOpen(false)}
        loading={isLeaving}
        confirmText="Leave"
        type="warning"
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
