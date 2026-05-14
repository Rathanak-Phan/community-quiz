import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit3, Trash2, HelpCircle, ArrowLeft, 
  CheckCircle2, XCircle, Type, List, Check,
  AlertCircle, Sparkles, MessageSquare, Clock, ShieldCheck,
  MoreVertical, Copy, Settings, Eye, Image as ImageIcon
} from 'lucide-react';
import { getQuestions, deleteQuestion } from '../../services/questionService';
import { getQuizById } from '../../services/quizService';
import QuestionFormModal from './components/QuestionFormModal';
import QuestionEditor from './components/QuestionEditor';
import QuizFormModal from './components/QuizFormModal';
import ShareQuizModal from './components/ShareQuizModal';
import Toast from '../../components/ui/Toast';

const QuestionList = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [isInlineMode, setIsInlineMode] = useState(true);
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
    if (quizId && quizId !== 'undefined') {
      fetchQuestions();
    }
  }, [quizId, fetchQuestions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(id);
      setToast({ message: 'Question removed', type: 'success' });
      fetchQuestions();
      if (inlineEditingId === id) setInlineEditingId(null);
    } catch (err) {
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const handleEdit = (question) => {
    if (isInlineMode) {
      setInlineEditingId(question.id);
      setActiveQuestionId(question.id);
    } else {
      setEditData(question);
      setIsModalOpen(true);
    }
  };

  const handleCreate = () => {
    if (isInlineMode) {
      setInlineEditingId('new');
      setActiveQuestionId('new');
      // Scroll to bottom
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } else {
      setEditData(null);
      setIsModalOpen(true);
    }
  };

  const handleDuplicate = (question) => {
    const { id, ...duplicateData } = question;
    if (isInlineMode) {
      setEditData({ ...duplicateData, isDuplicate: true });
      setInlineEditingId('new');
      setActiveQuestionId('new');
    } else {
      setEditData({ ...duplicateData, isDuplicate: true });
      setIsModalOpen(true);
    }
  };

  const handleActionStub = (action) => {
    setToast({ message: `${action} feature coming soon!`, type: 'success' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0ebf8]">
      <div className="w-16 h-16 border-4 border-[#673ab7] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0ebf8] pb-32">
      {/* Google Forms Style Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium text-slate-700">{quiz?.title}</span>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Questions</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             {/* Mode Toggle */}
             <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setIsInlineMode(false)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isInlineMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Modal
                </button>
                <button 
                  onClick={() => setIsInlineMode(true)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isInlineMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Inline
                </button>
             </div>

             <div className="h-6 w-px bg-slate-200"></div>

             <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate(`/quizzes/${quizId}`)}
                    className="p-2.5 hover:bg-slate-100 rounded-full text-slate-600 transition"
                    title="Preview Quiz"
                >
                    <Eye size={20} />
                </button>
                <button 
                    onClick={() => setIsQuizModalOpen(true)}
                    className="p-2.5 hover:bg-slate-100 rounded-full text-slate-600 transition"
                >
                    <Settings size={20} />
                </button>
                <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="bg-[#673ab7] hover:bg-[#5e35b1] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition shadow-md"
                >
                    Send
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto mt-8 px-4 space-y-4">
        
        {/* Quiz Title Card */}
        <div className="bg-white rounded-xl border-t-[10px] border-[#673ab7] shadow-md p-8 relative overflow-hidden group/header">
             <button 
                onClick={() => setIsQuizModalOpen(true)}
                className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-lg opacity-0 group-hover/header:opacity-100 transition hover:text-[#673ab7] hover:bg-white border border-transparent hover:border-slate-100"
             >
                <Edit3 size={18} />
             </button>
             <div className="space-y-4">
                <h1 className="text-4xl font-normal text-slate-900 leading-tight">
                    {quiz?.title}
                </h1>
                <p className="text-slate-600 text-sm border-b border-slate-100 pb-4">
                    {quiz?.description || 'No description provided'}
                </p>
                <div className="flex items-center gap-4 pt-2">
                    <span className="px-3 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {quiz?.category?.name || 'General'}
                    </span>
                    {(() => {
                        const defaultLimit = quiz?.has_timer ? (quiz?.default_time_limit || 30) : 0;
                        const totalSeconds = questions.reduce((sum, q) => {
                            const limit = parseInt(q.time_limit) > 0 ? parseInt(q.time_limit) : defaultLimit;
                            return sum + limit;
                        }, 0);
                        
                        if (totalSeconds <= 0) return null;

                        return (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={12} className="text-[#673ab7]" />
                                {(() => {
                                    const mins = Math.floor(totalSeconds / 60);
                                    const secs = totalSeconds % 60;
                                    return mins > 0 ? `${mins}m ${secs > 0 ? secs + 's' : ''}` : `${secs}s`;
                                })()} Total Time
                            </span>
                        );
                    })()}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-l border-slate-200 pl-4">
                        <HelpCircle size={12} className="text-[#673ab7]" />
                        {questions.length} Questions
                    </span>
                </div>
             </div>
        </div>

        {error ? (
          <div className="p-12 bg-white rounded-xl shadow-md border border-rose-100 text-center space-y-4">
             <XCircle size={48} className="text-rose-500 mx-auto" />
             <h3 className="text-xl font-bold text-slate-900">Configuration Error</h3>
             <p className="text-slate-500">{error}</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-20 bg-white rounded-xl shadow-md border border-dashed border-slate-200 text-center space-y-6">
             <Sparkles size={64} className="text-[#673ab7]/20 mx-auto" />
             <h3 className="text-2xl font-medium text-slate-900">Start Building Your Quiz</h3>
             <p className="text-slate-500 max-w-sm mx-auto">Create your first question using the floating menu on the right.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-40">
            {questions.map((q, idx) => (
              <React.Fragment key={q.id}>
                {inlineEditingId === q.id ? (
                  <QuestionEditor 
                    quizId={quizId}
                    editData={q}
                    onCancel={() => setInlineEditingId(null)}
                    onSuccess={(msg) => {
                      setToast({ message: msg, type: 'success' });
                      setInlineEditingId(null);
                      fetchQuestions();
                    }}
                    quizHasTimer={quiz?.has_timer}
                    defaultTimeLimit={quiz?.default_time_limit}
                  />
                ) : (
                  <div 
                    onClick={() => setActiveQuestionId(q.id)}
                    className={`bg-white rounded-xl shadow-md p-8 transition-all duration-300 relative group border-l-4 ${
                      activeQuestionId === q.id ? 'border-blue-500 scale-[1.01]' : 'border-transparent'
                    }`}
                  >
                    {/* Active Sidebar Actions - Google Forms Style */}
                    {activeQuestionId === q.id && (
                        <div className="absolute top-4 right-4 flex gap-1">
                            <button onClick={() => handleEdit(q)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition" title="Edit">
                                <Edit3 size={18} />
                            </button>
                            <button onClick={() => handleDelete(q.id)} className="p-2 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition" title="Delete">
                                <Trash2 size={18} />
                            </button>
                            <button onClick={() => handleDuplicate(q)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition" title="Duplicate">
                                <Copy size={18} />
                            </button>
                        </div>
                    )}

                    <div className="space-y-6">
                      {/* Question Header */}
                      <div className="flex items-start gap-6">
                        <span className="text-slate-400 font-medium text-lg pt-1">{idx + 1}.</span>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-xl font-normal text-slate-900">
                                {q.question_text}
                            </h3>
                            
                            {/* Options Display */}
                            <div className="space-y-3 pl-2">
                                {q.question_type === 'multiple_choice' && q.options?.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-4 group/opt">
                                        {(() => {
                                            const correctCount = q.options?.filter(o => o.is_correct).length || 0;
                                            const isMultiple = q.allow_multiple || correctCount > 1;
                                            return (
                                                <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${isMultiple ? 'rounded-md' : 'rounded-full'} ${opt.is_correct ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                    {opt.is_correct && <Check size={12} className="text-white" strokeWidth={4} />}
                                                </div>
                                            );
                                        })()}
                                        <span className={`text-sm ${opt.is_correct ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                                            {opt.option_text}
                                        </span>
                                    </div>
                                ))}
                                
                                {q.question_type === 'true_false' && (
                                    <div className="flex gap-8">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${q.correct_answer === 'true' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                {q.correct_answer === 'true' && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className="text-sm font-medium text-slate-600 uppercase tracking-widest">True</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${q.correct_answer === 'false' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                {q.correct_answer === 'false' && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className="text-sm font-medium text-slate-600 uppercase tracking-widest">False</span>
                                        </div>
                                    </div>
                                )}

                                {q.question_type === 'short_answer' && (
                                    <div className="max-w-md p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-4">
                                        <Type size={16} className="text-slate-400" />
                                        <span className="text-sm text-slate-500 italic">Expected: {q.short_answer?.answer_text}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                      </div>

                      {/* Question Footer Info */}
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                         <div className="flex items-center gap-4">
                            <div className="px-2.5 py-1 bg-[#673ab7]/10 text-[#673ab7] rounded text-[10px] font-bold uppercase tracking-widest">
                                {(() => {
                                    const correctCount = q.options?.filter(o => o.is_correct).length || 0;
                                    const isMultiple = q.allow_multiple || correctCount > 1;
                                    return isMultiple ? 'Checkboxes' : q.question_type.replace('_', ' ');
                                })()}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{q.points || 1} Points</span>
                            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                            {(() => {
                                const limit = parseInt(q.time_limit) > 0 ? parseInt(q.time_limit) : (quiz?.has_timer ? (quiz?.default_time_limit || 30) : 0);
                                if (limit <= 0) return null;
                                return (
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock size={12} className="text-blue-500" />
                                        {limit}s Limit
                                    </span>
                                );
                            })()}
                         </div>
                         {!activeQuestionId && (
                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(q)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => handleDelete(q.id)} className="p-2 hover:bg-rose-50 rounded-full text-rose-300 hover:text-rose-500 transition">
                                    <Trash2 size={16} />
                                </button>
                             </div>
                         )}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}

            {inlineEditingId === 'new' && (
              <QuestionEditor 
                quizId={quizId}
                editData={editData}
                onCancel={() => {
                    setInlineEditingId(null);
                    setEditData(null);
                }}
                onSuccess={(msg) => {
                  setToast({ message: msg, type: 'success' });
                  setInlineEditingId(null);
                  setEditData(null);
                  fetchQuestions();
                }}
                quizHasTimer={quiz?.has_timer}
                defaultTimeLimit={quiz?.default_time_limit}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating Action Menu - Google Forms Style */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 bg-white rounded-xl shadow-lg border border-slate-200 z-40">
        <button 
            onClick={handleCreate}
            className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm group relative"
        >
            <Plus size={24} />
            <span className="absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none uppercase tracking-widest">Add Question</span>
        </button>
        <div className="w-full h-px bg-slate-100 my-1"></div>
        <button 
            onClick={() => handleActionStub('Import')}
            className="w-12 h-12 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-[#673ab7] transition shadow-sm group relative"
        >
            <Copy size={20} />
            <span className="absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none uppercase tracking-widest">Import Questions</span>
        </button>
        <button 
            onClick={() => handleActionStub('Title & Description')}
            className="w-12 h-12 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-[#673ab7] transition shadow-sm group relative"
        >
            <Type size={20} />
            <span className="absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none uppercase tracking-widest">Add Title/Description</span>
        </button>
        <button 
            onClick={handleCreate}
            className="w-12 h-12 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-[#673ab7] transition shadow-sm group relative"
        >
            <ImageIcon size={20} />
            <span className="absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none uppercase tracking-widest">Add Image</span>
        </button>
        <button 
            onClick={() => handleActionStub('Video')}
            className="w-12 h-12 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-[#673ab7] transition shadow-sm group relative"
        >
            <Sparkles size={20} />
            <span className="absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none uppercase tracking-widest">AI Generate</span>
        </button>
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
        quizHasTimer={quiz?.has_timer}
        defaultTimeLimit={quiz?.default_time_limit}
      />

      <QuizFormModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onSuccess={(msg) => {
          setToast({ message: msg, type: 'success' });
          fetchQuestions();
        }}
        editData={quiz}
      />

      <ShareQuizModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        quizId={quizId}
        quizTitle={quiz?.title}
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
