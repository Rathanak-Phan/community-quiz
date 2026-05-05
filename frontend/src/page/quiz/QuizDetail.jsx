import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, Users, Play, ArrowLeft, BookOpen, 
  Sparkles, ShieldCheck, TrendingUp, Info, Globe, Lock
} from 'lucide-react';
import { getQuizById } from '../../services/quizService';
import { startAttempt } from '../../services/attemptService';
import { STORAGE_URL } from '../../config/api';
import Toast from '../ui/Toast';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await getQuizById(id);
        setQuiz(res.data);
      } catch (err) {
        setToast({ message: 'Failed to load quiz details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await startAttempt(id, 'scored', false);
      // Backend returns the attempt object
      const attemptId = res.data.data?.id || res.data.id;
      navigate(`/attempts/${attemptId}`);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to start quiz', type: 'error' });
    } finally {
      setStarting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!quiz) return null;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12 pb-32">
      {/* Header / Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {quiz.category?.name || 'General'}
            </span>
            {quiz.community && (
                <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {quiz.community.name}
                </span>
            )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row">
        {/* Visual Side */}
        <div className="md:w-2/5 relative h-[300px] md:h-auto bg-slate-50">
          {quiz.cover_image ? (
            <img src={`${STORAGE_URL}/${quiz.cover_image}`} className="w-full h-full object-cover" alt={quiz.title} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <BookOpen size={64} className="text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
        </div>

        {/* Info Side */}
        <div className="md:w-3/5 p-12 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 leading-tight uppercase tracking-tight">{quiz.title}</h1>
            <p className="text-slate-500 font-medium leading-relaxed italic">
                "{quiz.description || "No description provided for this module."}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-50">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Clock size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                    <p className="text-sm font-black text-slate-900 uppercase">{quiz.time_limit || 30} Minutes</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Rate</p>
                    <p className="text-sm font-black text-slate-900 uppercase">{quiz.attempts_count || 0} Attempts</p>
                </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                    {quiz.creator?.name?.charAt(0) || 'U'}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created By</p>
                    <p className="text-xs font-bold text-slate-900">{quiz.creator?.name || 'Community Member'}</p>
                </div>
            </div>
            
            <button
              onClick={handleStart}
              disabled={starting}
              className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl active:scale-95 flex items-center gap-3"
            >
              {starting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  Start Challenge
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase text-xs">Integrity Shield</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                This quiz follows standard community guidelines for fair play and learning.
            </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase text-xs">Knowledge Boost</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                Earn points and improve your ranking on the community leaderboard.
            </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Info size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase text-xs">Quick Support</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                Encountered an issue? Report the quiz for review by our administrators.
            </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default QuizDetail;
