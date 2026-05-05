import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Clock, Play, ArrowLeft, 
  Globe, Lock, ShieldCheck, TrendingUp, Sparkles, AlertCircle, Settings
} from 'lucide-react';
import apiClient, { STORAGE_URL } from '../../config/api';
import Toast from '../../components/ui/Toast';
import CommunityFormModal from '../../components/community/CommunityFormModal';
import QuizCard from '../../components/quiz/QuizCard';
import { useAuth } from '../../context/AuthContext';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const { user, isAdmin } = useAuth();
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
    fetchData();
  }, [fetchData]);

  const handleJoin = async () => {
    if (isGuest) {
      navigate("/login");
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

  const handleAttemptQuiz = (quizId) => {
    if (isGuest) {
      setToast({ show: true, message: "Please login to attempt this quiz", type: "warning" });
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
    <div className="space-y-12 pb-20">
      {/* Hero Header */}
      <div className="relative h-[300px] rounded-[3rem] overflow-hidden shadow-2xl">
        {community.cover_image ? (
          <img src={`${STORAGE_URL}/${community.cover_image}`} className="w-full h-full object-cover" alt={community.name} />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600"></div>
        )}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
        
        <div className="absolute inset-0 p-12 flex flex-col justify-end">
          <button 
            onClick={() => navigate("/communities")}
            className="absolute top-8 left-8 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition shadow-lg"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border border-white/20 ${
                  community.visibility === 'public' ? 'bg-emerald-500/90 text-white' : 'bg-orange-500/90 text-white'
                }`}>
                  {community.visibility === 'public' ? <Globe size={12} className="inline mr-2" /> : <Lock size={12} className="inline mr-2" />}
                  {community.visibility} Community
                </span>
                <span className="px-4 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest shadow-lg border border-white/10">
                  <Users size={12} className="inline mr-2" />
                  {community.members?.length || 0} Members
                </span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight uppercase leading-none">{community.name}</h1>
              <p className="text-white/80 font-bold uppercase tracking-widest text-[10px] max-w-2xl">{community.description}</p>
            </div>

            <div className="flex gap-4">
              {!community.is_member && (
                <button 
                  onClick={handleJoin}
                  className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95"
                >
                  {isGuest ? "Login to Join" : "Request Access"}
                </button>
              )}

              {user?.id === community.created_by && (
                <>
                  <button 
                    onClick={() => navigate(`/communities/${community.id}/requests`)}
                    className="bg-emerald-500 text-white px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 flex items-center gap-2"
                  >
                    <Users size={18} />
                    Requests
                  </button>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-blue-600 text-white px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl active:scale-95 flex items-center gap-2"
                  >
                    <Settings size={18} />
                    Edit
                  </button>
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
           <button 
              onClick={() => navigate(`/communities/${id}/quizzes`)}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
           >
              See Full Library →
           </button>
        </div>

        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {quizzes.slice(0, 6).map((quiz) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                isAdmin={isAdmin}
                userId={user?.id}
                onClick={() => handleAttemptQuiz(quiz.id)}
                onEdit={() => {}} // Handle if needed
                onDelete={() => {}}
              />
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
