import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit3, Trash2, HelpCircle, ArrowLeft, 
  CheckCircle2, XCircle, Type, List, Check,
  AlertCircle, Sparkles, MessageSquare, Clock, ShieldCheck,
  MoreVertical, Copy, Settings, Eye, Image as ImageIcon
} from 'lucide-react';
import { getQuestions, deleteQuestion } from './services/questionService';
import { getQuizById } from './services/quizService';
import QuestionFormModal from './components/QuestionFormModal';
import QuestionEditor from './components/QuestionEditor';
import QuizFormModal from './components/QuizFormModal';
import ShareQuizModal from './components/ShareQuizModal';
import Toast from '../../components/ui/Toast';
import SEO from '../../components/common/SEO';
import ConfirmModal from '../../components/ui/ConfirmModal';

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
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, loading: false });

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

  const handleDeleteClick = (id) => {
    setConfirmDelete({ isOpen: true, id, loading: false });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDelete.id;
    setConfirmDelete(prev => ({ ...prev, loading: true }));
    try {
      await deleteQuestion(id);
      setToast({ message: 'Question removed', type: 'success' });
      fetchQuestions();
      if (inlineEditingId === id) setInlineEditingId(null);
      setConfirmDelete({ isOpen: false, id: null, loading: false });
    } catch (err) {
      setToast({ message: 'Failed to delete', type: 'error' });
      setConfirmDelete(prev => ({ ...prev, loading: false }));
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
      <SEO 
        title={`Quiz Builder: ${quiz?.title || 'Quiz'}`}
        description={`Configure questions, time limits, categories, and settings for "${quiz?.title || 'Quiz'}" in the QuizSphere Quiz Builder.`}
        url={`/quizzes/${quizId}/questions`}
      />
      {/* Google Forms Style Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition text-slate-600 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base sm:text-xl font-medium text-slate-700 truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[300px]">{quiz?.title}</span>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300 shrink-0"></div>
              <span className="hidden sm:inline-block text-xs font-medium text-slate-400 uppercase tracking-widest shrink-0">Questions</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
             {/* Mode Toggle */}
             <div className="flex bg-slate-100 p-0.5 sm:p-1 rounded-xl">
                <button 
                  onClick={() => setIsInlineMode(false)}
                  className={`px-2 py-1 sm:px-4 sm:py-1.5 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${!isInlineMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Modal
                </button>
                <button 
                  onClick={() => setIsInlineMode(true)}
                  className={`px-2 py-1 sm:px-4 sm:py-1.5 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${isInlineMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Inline
                </button>
             </div>

             <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

             <div className="flex items-center gap-1.5 sm:gap-3">
                <button 
                    onClick={() => navigate(`/quizzes/${quizId}`)}
                    className="p-1.5 sm:p-2.5 hover:bg-slate-100 rounded-full text-slate-600 transition"
                    title="Preview Quiz"
                >
                    <Eye size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button 
                    onClick={() => setIsQuizModalOpen(true)}
                    className="p-1.5 sm:p-2.5 hover:bg-slate-100 rounded-full text-slate-600 transition"
                >
                    <Settings size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="bg-[#673ab7] hover:bg-[#5e35b1] text-white px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-md"
                >
                    Send
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto mt-4 sm:mt-8 px-3 sm:px-4 space-y-4">
        
        {/* Quiz Title Card */}
        <div className="bg-white rounded-xl border-t-[10px] border-[#673ab7] shadow-md p-4 sm:p-8 relative overflow-hidden group/header">
             <button 
                onClick={() => setIsQuizModalOpen(true)}
                className="absolute top-3 right-3 p-1.5 sm:p-2 bg-slate-50 text-slate-400 rounded-xl opacity-0 group-hover/header:opacity-100 transition hover:text-[#673ab7] hover:bg-white border border-transparent hover:border-slate-100"
             >
                <Edit3 size={16} />
             </button>
             <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-4xl font-normal text-slate-900 leading-tight">
                    {quiz?.title}
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm border-b border-slate-100 pb-3 sm:pb-4">
                    {quiz?.description || 'No description provided'}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 sm:pt-2">
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-100 rounded-md text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
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
                            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                                <Clock size={10} className="text-[#673ab7] sm:w-3 sm:h-3" />
                                {(() => {
                                    const mins = Math.floor(totalSeconds / 60);
                                    const secs = totalSeconds % 60;
                                    return mins > 0 ? `${mins}m ${secs > 0 ? secs + 's' : ''}` : `${secs}s`;
                                })()} Total Time
                            </span>
                        );
                    })()}
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 border-l border-slate-200 pl-2 sm:pl-4">
                        <HelpCircle size={10} className="text-[#673ab7] sm:w-3 sm:h-3" />
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
        ) : (
          <div className="space-y-4 pb-40">
            {questions.length === 0 && inlineEditingId !== 'new' ? (
              <div className="p-20 bg-white rounded-xl shadow-md border border-dashed border-slate-200 text-center space-y-6">
                 <Sparkles size={64} className="text-[#673ab7]/20 mx-auto" />
                 <h3 className="text-2xl font-medium text-slate-900">Start Building Your Quiz</h3>
                 <p className="text-slate-500 max-w-sm mx-auto">Create your first question using the floating menu on the right.</p>
              </div>
            ) : (
              <>
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
                        className={`bg-white rounded-xl shadow-md p-4 sm:p-8 transition-all duration-300 relative group border-l-4 ${
                          activeQuestionId === q.id ? 'border-blue-500 scale-[1.01]' : 'border-transparent'
                        }`}
                      >
                        {/* Active Sidebar Actions - Google Forms Style */}
                        {activeQuestionId === q.id && (
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1 z-10">
                                <button onClick={() => handleEdit(q)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full text-slate-400 transition" title="Edit">
                                    <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </button>
                                <button onClick={() => handleDeleteClick(q.id)} className="p-1.5 sm:p-2 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition" title="Delete">
                                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </button>
                                <button onClick={() => handleDuplicate(q)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full text-slate-400 transition" title="Duplicate">
                                    <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </button>
                            </div>
                        )}

                        <div className="space-y-4 sm:space-y-6">
                          {/* Question Header */}
                          <div className="flex items-start gap-3 sm:gap-6">
                            <span className="text-slate-400 font-medium text-base sm:text-lg pt-1">{idx + 1}.</span>
                            <div className="flex-1 space-y-4 pr-16 sm:pr-0">
                                <h3 className="text-base sm:text-xl font-normal text-slate-900 leading-snug">
                                    {q.question_text}
                                </h3>
                                
                                {/* Options Display */}
                                <div className="space-y-2.5 sm:space-y-3 pl-1 sm:pl-2">
                                    {q.question_type === 'multiple_choice' && q.options?.map((opt, i) => (
                                        <div key={i} className="flex items-start gap-3 sm:gap-4 group/opt">
                                            {(() => {
                                                const correctCount = q.options?.filter(o => o.is_correct).length || 0;
                                                const isMultiple = q.allow_multiple || correctCount > 1;
                                                return (
                                                    <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 ${isMultiple ? 'rounded-md' : 'rounded-full'} ${opt.is_correct ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                        {opt.is_correct && <Check size={12} className="text-white" strokeWidth={4} />}
                                                    </div>
                                                );
                                            })()}
                                            <span className={`text-xs sm:text-sm leading-normal ${opt.is_correct ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}>
                                                {opt.option_text}
                                            </span>
                                        </div>
                                    ))}
                                    
                                    {q.question_type === 'true_false' && (
                                        <div className="flex flex-wrap gap-4 sm:gap-8">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${q.correct_answer === 'true' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                    {q.correct_answer === 'true' && <Check size={12} className="text-white" />}
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium text-slate-600 uppercase tracking-widest">True</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${q.correct_answer === 'false' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                                    {q.correct_answer === 'false' && <Check size={12} className="text-white" />}
                                                </div>
                                                <span className="text-xs sm:text-sm font-medium text-slate-600 uppercase tracking-widest">False</span>
                                            </div>
                                        </div>
                                    )}

                                    {q.question_type === 'short_answer' && (
                                        <div className="max-w-md p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3 sm:gap-4">
                                            <Type size={16} className="text-slate-400 shrink-0" />
                                            <span className="text-xs sm:text-sm text-slate-500 italic">Expected: {q.short_answer?.answer_text}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                          </div>

                          {/* Question Footer Info */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-slate-100">
                             <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                <div className="px-2 py-0.5 bg-[#673ab7]/10 text-[#673ab7] rounded text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">
                                    {(() => {
                                        const correctCount = q.options?.filter(o => o.is_correct).length || 0;
                                        const isMultiple = q.allow_multiple || correctCount > 1;
                                        return isMultiple ? 'Checkboxes' : q.question_type.replace('_', ' ');
                                    })()}
                                </div>
                                <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{q.points || 1} Points</span>
                                <div className="hidden xs:block w-1 h-1 rounded-full bg-slate-200"></div>
                                {(() => {
                                    const limit = parseInt(q.time_limit) > 0 ? parseInt(q.time_limit) : (quiz?.has_timer ? (quiz?.default_time_limit || 30) : 0);
                                    if (limit <= 0) return null;
                                    return (
                                        <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 sm:gap-1.5">
                                            <Clock size={10} className="text-blue-500 sm:w-3 sm:h-3" />
                                            {limit}s Limit
                                        </span>
                                    );
                                })()}
                             </div>
                             {!activeQuestionId && (
                                 <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(q)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition">
                                        <Edit3 size={15} />
                                    </button>
                                    <button onClick={() => handleDeleteClick(q.id)} className="p-1.5 hover:bg-rose-50 rounded-full text-rose-300 hover:text-rose-500 transition">
                                        <Trash2 size={15} />
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
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Menu - Google Forms Style */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 md:top-1/2 md:-translate-y-1/2 flex flex-row md:flex-col items-center gap-2 p-2.5 bg-white/95 backdrop-blur-md rounded-2xl md:rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.15)] md:shadow-lg border border-slate-200/80 z-40 max-w-[calc(100vw-32px)] overflow-x-auto">
        <button 
            onClick={handleCreate}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm group relative shrink-0"
        >
            <Plus size={22} className="sm:w-6 sm:h-6" />
            <span className="hidden md:block absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none uppercase tracking-widest">Add Question</span>
        </button>
        <div className="hidden md:block w-full h-px bg-slate-100 my-1"></div>
        <div className="md:hidden w-px h-8 bg-slate-100 mx-1 shrink-0"></div>
        <button 
            onClick={() => handleActionStub('Import')}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-[#673ab7] transition shadow-sm group relative shrink-0"
        >
            <Copy size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden md:block absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none uppercase tracking-widest">Import Questions</span>
        </button>
        <button 
            onClick={() => handleActionStub('Title & Description')}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-[#673ab7] transition shadow-sm group relative shrink-0"
        >
            <Type size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden md:block absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none uppercase tracking-widest">Add Title/Description</span>
        </button>
        <button 
            onClick={handleCreate}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-[#673ab7] transition shadow-sm group relative shrink-0"
        >
            <ImageIcon size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden md:block absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none uppercase tracking-widest">Add Image</span>
        </button>
        <button 
            onClick={() => handleActionStub('Video')}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-[#673ab7] transition shadow-sm group relative shrink-0"
        >
            <Sparkles size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden md:block absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none uppercase tracking-widest">AI Generate</span>
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

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null, loading: false })}
        loading={confirmDelete.loading}
        confirmText="Delete Question"
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
