import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit3, Trash2, HelpCircle, ArrowLeft, 
  CheckCircle2, XCircle, Type, List, Check,
  AlertCircle, Sparkles, MessageSquare, Clock, ShieldCheck
} from 'lucide-react';
import { getQuestions, deleteQuestion } from '../../services/questionService';
import { getQuizById } from '../../services/quizService';
import QuestionFormModal from '../../components/quiz/QuestionFormModal';
import Toast from '../../components/ui/Toast';

const QuestionList = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const [quizRes, questionRes] = await Promise.all([
        getQuizById(quizId),
        getQuestions(quizId)
      ]);
      setQuiz(quizRes.data);
      setQuestions(questionRes.data?.data || questionRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(id);
      setToast({ message: 'Question removed', type: 'success' });
      fetchQuestions();
    } catch (err) {
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const handleEdit = (question) => {
    setEditData(question);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/quizzes')}
              className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight line-clamp-1 max-w-md">
                {quiz?.title} <span className="text-blue-600">Questions</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" /> 
                Question Management Module
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition shadow-xl shadow-slate-900/10 flex items-center gap-3 active:scale-95"
          >
            <Plus size={16} />
            Add Question
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {error ? (
          <div className="p-20 bg-white rounded-[3rem] border border-slate-100 text-center space-y-6 shadow-sm">
             <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle size={32} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Configuration Error</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{error}</p>
             </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-32 bg-white rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center space-y-8 shadow-sm">
             <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                <Sparkles size={64} />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Questions Yet</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-loose">
                    This quiz is currently empty. Start by adding your first challenge to engage your audience.
                </p>
             </div>
             <button
               onClick={handleCreate}
               className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition shadow-2xl shadow-blue-600/20 active:scale-95"
             >
                Create First Question
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div 
                key={q.id}
                className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 flex items-start gap-8 relative overflow-hidden"
              >
                {/* Index & Type Icon */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 font-black text-xl shadow-inner">
                        {idx + 1}
                    </div>
                    <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        {q.question_type === 'multiple_choice' && <List size={10} />}
                        {q.question_type === 'true_false' && <CheckCircle2 size={10} />}
                        {q.question_type === 'short_answer' && <Type size={10} />}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight pr-24">
                        {q.question_text}
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} className="text-blue-500" />
                            {q.points || 1} Points
                        </span>
                        {q.image && (
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={12} />
                                Image Attached
                            </span>
                        )}
                    </div>
                  </div>

                  {/* Answers Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                    {q.question_type === 'multiple_choice' && q.options?.map((opt, i) => (
                      <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${opt.is_correct ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50/50 border-slate-50 text-slate-400'}`}>
                        {opt.is_correct ? <Check size={14} className="font-black" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-200" />}
                        <span className="text-xs font-bold truncate">{opt.option_text}</span>
                      </div>
                    ))}
                    {q.question_type === 'true_false' && (
                        <div className="col-span-2 flex gap-4">
                             <div className={`flex-1 px-5 py-3 rounded-2xl border text-center font-black uppercase text-[10px] tracking-widest ${q.correct_answer === 'true' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-50 text-slate-300'}`}>True</div>
                             <div className={`flex-1 px-5 py-3 rounded-2xl border text-center font-black uppercase text-[10px] tracking-widest ${q.correct_answer === 'false' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-50 text-slate-300'}`}>False</div>
                        </div>
                    )}
                    {q.question_type === 'short_answer' && (
                        <div className="col-span-2 flex items-center gap-4 px-6 py-4 bg-amber-50/30 border border-amber-100 rounded-2xl">
                             <MessageSquare size={16} className="text-amber-500" />
                             <div>
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Expected Key</p>
                                <p className="text-sm font-black text-amber-900">{q.short_answer?.answer_text || 'No answer provided'}</p>
                             </div>
                             {q.short_answer?.is_manual_grading && (
                                 <span className="ml-auto px-3 py-1 bg-amber-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">Manual Grading</span>
                             )}
                        </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => handleEdit(q)}
                      className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(q.id)}
                      className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center hover:bg-rose-600 transition shadow-lg shadow-rose-500/20"
                    >
                      <Trash2 size={18} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: 'success' });
          fetchQuestions();
        }}
        quizId={quizId}
        editData={editData}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default QuestionList;
