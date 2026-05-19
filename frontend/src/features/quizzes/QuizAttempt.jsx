import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAttempt, submitAnswer, submitAttempt, getAttemptPublic, submitAnswerPublic, submitAttemptPublic } from "./services/attemptService";
import { Clock, ChevronRight, ChevronLeft, Send, Save, ShieldCheck, Users, AlertCircle, CheckCircle2, XCircle, CheckSquare, Circle, Square } from "lucide-react";
import Toast from "../../components/ui/Toast";
import { STORAGE_URL } from "../../config/api";
import ConfirmModal from "../../components/ui/ConfirmModal";
import SEO from "../../components/common/SEO";

export default function QuizAttempt({ isPublic = false }) {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [totalTimeLeft, setTotalTimeLeft] = useState(null);
    const [questionTimeLeft, setQuestionTimeLeft] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        const fetchAttempt = async () => {
            if (!attemptId || attemptId === 'undefined') return;
            try {
                const res = isPublic ? await getAttemptPublic(attemptId) : await getAttempt(attemptId);
                const data = res.data.data || res.data;
                setAttempt(data);
                setIsAnonymous(data.is_anonymous || false);
                const initialAnswers = {};
                data.answers?.forEach(ans => {
                    if (ans.answer_boolean !== null) {
                        initialAnswers[ans.question_id] = ans.answer_boolean ? 'True' : 'False';
                    } else if (Array.isArray(ans.selected_options) && ans.selected_options.length > 0) {
                        initialAnswers[ans.question_id] = ans.selected_options;
                    } else if (ans.selected_option_id) {
                        initialAnswers[ans.question_id] = ans.selected_option_id;
                    } else {
                        initialAnswers[ans.question_id] = ans.answer_text;
                    }
                });
                setAnswers(initialAnswers);

                // Calculate Total Quiz Time
                if (res.data.expires_at) {
                    const expiry = new Date(res.data.expires_at);
                    const now = new Date();
                    setTotalTimeLeft(Math.max(0, Math.floor((expiry - now) / 1000)));
                } else {
                    const totalSeconds = data.quiz?.questions?.reduce((sum, q) => sum + (parseInt(q.time_limit) || 30), 0) || 0;
                    setTotalTimeLeft(totalSeconds > 0 ? totalSeconds : null);
                }
            } catch (error) {
                setToast({ show: true, message: "Failed to load session", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchAttempt();
    }, [attemptId]);

    // Question Timer Reset Effect
    useEffect(() => {
        if (!attempt?.quiz?.questions) return;
        const currentQ = attempt.quiz.questions[currentQuestionIdx];
        if (currentQ && currentQ.time_limit > 0) {
            setQuestionTimeLeft(currentQ.time_limit);
        } else {
            setQuestionTimeLeft(null);
        }
    }, [currentQuestionIdx, attempt]);

    // Main Timer Loop
    useEffect(() => {
        const timer = setInterval(() => {
            setTotalTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
            setQuestionTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Handling Timeouts
    useEffect(() => {
        // Total Quiz Timeout
        if (totalTimeLeft === 0 && attempt && !submitting) {
            setToast({ show: true, message: "Quiz time is up! Submitting...", type: "warning" });
            handleSubmit(true);
        }
    }, [totalTimeLeft, attempt, submitting]);

    useEffect(() => {
        // Individual Question Timeout
        if (questionTimeLeft === 0) {
            if (currentQuestionIdx < (attempt.quiz?.questions?.length - 1)) {
                setToast({ show: true, message: "Question time's up! Next question...", type: "warning" });
                setCurrentQuestionIdx(prev => prev + 1);
            } else if (!submitting) {
                setToast({ show: true, message: "Time's up! Submitting quiz...", type: "warning" });
                handleSubmit(true);
            }
        }
    }, [questionTimeLeft, currentQuestionIdx, attempt, submitting]);

    const formatTime = (seconds) => {
        if (seconds === null) return "--";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleAnswerChange = async (questionId, value, isMultiple = false) => {
        let newValue = value;
        
        if (isMultiple) {
            const currentAnswers = Array.isArray(answers[questionId]) ? answers[questionId] : [];
            newValue = currentAnswers.includes(value)
                ? currentAnswers.filter(v => v !== value)
                : [...currentAnswers, value];
        }

        setAnswers(prev => ({ ...prev, [questionId]: newValue }));
        
        try {
            const payload = { 
                question_id: questionId,
                selected_option_id: null,
                selected_options: null,
                answer_boolean: null,
                answer_text: null
            };

            if (isMultiple) {
                payload.selected_options = newValue;
                // Keep answer_text for fallback/human readable logs
                payload.answer_text = currentQuestion.options
                    .filter(opt => newValue.includes(opt.id))
                    .map(opt => opt.option_text)
                    .join(', ');
            } else if (currentQuestion?.question_type === 'multiple_choice') {
                payload.selected_option_id = value; // value is the ID here
                payload.answer_text = currentQuestion.options.find(o => o.id === value)?.option_text;
            } else if (currentQuestion?.question_type === 'true_false') {
                payload.answer_boolean = value === 'True' || value === true;
                payload.answer_text = value.toString();
            } else {
                payload.answer_text = value;
            }
            
            if (isPublic) {
                await submitAnswerPublic(attemptId, payload);
            } else {
                await submitAnswer(attemptId, payload);
            }
        } catch (error) {
            console.error("Cloud sync failed");
        }
    };

    const handleSubmit = async (bypassConfirm = false) => {
        if (!bypassConfirm) {
            setIsConfirmModalOpen(true);
            return;
        }
        setSubmitting(true);
        try {
            if (isPublic) {
                await submitAttemptPublic(attemptId, { is_anonymous: isAnonymous });
                const searchParams = new URLSearchParams(window.location.search);
                const challengeToken = searchParams.get("challenge");
                const nextPath = challengeToken 
                    ? `/public/attempts/${attemptId}/review?challenge=${challengeToken}`
                    : `/public/attempts/${attemptId}/review`;
                navigate(nextPath);
            } else {
                await submitAttempt(attemptId, { is_anonymous: isAnonymous });
                navigate(`/attempts/${attemptId}/review`);
            }
        } catch (error) {
            setToast({ show: true, message: "Cloud submission failed", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing Session...</p>
        </div>
    );

    if (!attempt) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="space-y-4">
                <XCircle size={48} className="text-rose-500 mx-auto" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Session Expired</h3>
                <p className="text-sm text-slate-500 max-w-xs">This quiz attempt is no longer active or could not be found.</p>
                <button onClick={() => navigate("/quizzes")} className="text-blue-600 font-bold uppercase text-[10px] tracking-widest hover:underline">Back to Quizzes</button>
            </div>
        </div>
    );

    const questions = attempt.quiz?.questions || [];
    const currentQuestion = questions[currentQuestionIdx];

    if (questions.length === 0) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="space-y-6">
                <div className="w-20 h-20 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 mx-auto">
                    <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Empty Quiz</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">This quiz doesn't have any questions yet. Please check back later!</p>
                </div>
                <button 
                    onClick={() => navigate("/quizzes")} 
                    className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition shadow-xl shadow-slate-900/10"
                >
                    Back to Library
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            <SEO 
                title={`Attempting: ${attempt.quiz?.title || 'Quiz'}`}
                description={`You are currently attempting the quiz "${attempt.quiz?.title || 'Quiz'}" on QuizSphere. Complete the questions and check your ranking.`}
                url={`/public/attempts/${attemptId}`}
            />
            {/* Ultra-Modern Fixed Header */}
            <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-4 py-3 sm:px-8 sm:py-5">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    {/* Left side: Back and Title */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button 
                            onClick={() => navigate(isPublic ? `/quizzes/${attempt?.quiz_id || attempt?.quiz?.id}` : "/dashboard")} 
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shadow-inner shrink-0"
                            title={isPublic ? "Save and exit to quiz" : "Save and exit to dashboard"}
                        >
                            <Save size={16} />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-base font-black text-slate-900 truncate tracking-tight leading-none mb-1">{attempt.quiz?.title}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Question {currentQuestionIdx + 1} / {questions.length}</span>
                                <span className="text-[9px] font-bold text-slate-300">•</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{attempt.quiz?.category?.name || "General"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Actions & Timers */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <button 
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${
                                isAnonymous 
                                ? 'bg-slate-900 text-white shadow-md' 
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            title={isAnonymous ? "Stay Anonymous" : "Public Answer"}
                        >
                            {isAnonymous ? <ShieldCheck size={11} /> : <Users size={11} />}
                            <span className="hidden xs:inline">{isAnonymous ? "Anonymous" : "Public"}</span>
                        </button>
                        
                        {totalTimeLeft !== null && (
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-colors ${
                                totalTimeLeft < 60 
                                ? 'bg-rose-50 text-rose-600 animate-pulse border border-rose-100' 
                                : 'bg-slate-900 text-white shadow-md'
                            }`}>
                                <Clock size={14} className={totalTimeLeft < 60 ? "animate-spin-slow" : ""} />
                                <span className="font-mono text-xs sm:text-sm font-bold tracking-tight">{formatTime(totalTimeLeft)}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Slim Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                        style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-5 sm:p-8 md:p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    {/* Question Timer Bar */}
                    {questionTimeLeft !== null && (
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-50 overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ease-linear ${
                                    (questionTimeLeft / currentQuestion?.time_limit) < 0.3 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                }`}
                                style={{ width: `${(questionTimeLeft / currentQuestion?.time_limit) * 100}%` }}
                            />
                        </div>
                    )}

                    {/* Question Meta Header Row */}
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6 sm:mb-8">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                                {currentQuestionIdx + 1}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Question {currentQuestionIdx + 1} of {questions.length}
                            </span>
                        </div>
                        {questionTimeLeft !== null && (
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                questionTimeLeft < 10 
                                ? 'bg-rose-50 text-rose-600 animate-pulse border border-rose-100' 
                                : 'bg-emerald-50 text-emerald-600'
                            }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                                <span>{questionTimeLeft}s left</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                            {currentQuestion?.question_text}
                        </h2>
                        
                        {currentQuestion?.image && (
                            <div className="rounded-xl overflow-hidden border-4 border-slate-50 shadow-inner group-hover:scale-[1.01] transition-transform duration-700 max-h-[15rem] sm:max-h-[25rem] flex justify-center bg-slate-50">
                                <img src={`${STORAGE_URL}/${currentQuestion.image}`} alt="Question visual" className="w-full object-cover" />
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 sm:gap-5">
                            {currentQuestion?.question_type === 'multiple_choice' && (() => {
                                const correctCount = currentQuestion.options?.filter(o => o.is_correct).length || 0;
                                const isMultiple = currentQuestion.allow_multiple || correctCount > 1;
                                return currentQuestion.options?.map((opt, idx) => (
                                    <OptionBtn 
                                        key={opt.id}
                                        label={opt.option_text}
                                        letter={String.fromCharCode(65 + idx)}
                                        active={isMultiple 
                                            ? Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(opt.id)
                                            : answers[currentQuestion.id] === opt.id
                                        }
                                        onClick={() => handleAnswerChange(currentQuestion.id, opt.id, isMultiple)}
                                        isMultiple={isMultiple}
                                    />
                                ));
                            })()}

                            {currentQuestion?.question_type === 'true_false' && (
                                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                    {['True', 'False'].map(val => (
                                        <button 
                                            key={val}
                                            onClick={() => handleAnswerChange(currentQuestion.id, val)}
                                            className={`py-6 sm:py-12 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-4 ${
                                                answers[currentQuestion.id] === val
                                                ? 'border-blue-600 bg-blue-50/10 text-blue-700 shadow-xl shadow-blue-600/10'
                                                : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-black text-sm sm:text-xl shadow-inner ${answers[currentQuestion.id] === val ? 'bg-blue-600 text-white' : 'bg-white text-slate-200'}`}>
                                                {val.charAt(0)}
                                            </div>
                                            <span className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">{val}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion?.question_type === 'short_answer' && (
                                <div className="space-y-4">
                                    <textarea 
                                        className="w-full p-4 sm:p-8 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-blue-600 transition-all duration-500 outline-none min-h-[150px] sm:min-h-[250px] text-base sm:text-lg font-bold placeholder:text-slate-200"
                                        placeholder="Type your structured response here..."
                                        value={answers[currentQuestion.id] || ""}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                        onBlur={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                    />
                                    <div className="flex items-center gap-2 px-2">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time sync active</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="mt-6 sm:mt-10 flex justify-between items-center px-2 sm:px-6">
                    <button 
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx(p => p - 1)}
                        className="flex items-center gap-1 sm:gap-2 px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-white disabled:opacity-20 transition-all duration-300"
                    >
                        <ChevronLeft size={16} />
                        BACK
                    </button>

                    {currentQuestionIdx === questions.length - 1 ? (
                        <button 
                            onClick={() => handleSubmit()}
                            disabled={submitting}
                            className="bg-blue-600 text-white px-5 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-xs flex items-center gap-2 sm:gap-3 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all duration-300 active:scale-95 disabled:opacity-50"
                        >
                            <span>{submitting ? "UPLOADING..." : "FINALIZE QUIZ"}</span>
                            <Send size={16} />
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentQuestionIdx(p => p + 1)}
                            className="bg-slate-900 text-white px-5 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-xs flex items-center gap-2 sm:gap-3 hover:bg-blue-600 transition-all duration-500 shadow-lg active:scale-95 group"
                        >
                            <span>NEXT QUESTION</span>
                            <ChevronRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                        </button>
                    )}
                </div>
            </main>

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="Finalize Attempt?"
                message="Are you sure you want to finish and submit your quiz attempt? You won't be able to change your answers after finalizing."
                confirmText="Yes, Finalize"
                cancelText="Cancel"
                onConfirm={() => {
                    setIsConfirmModalOpen(false);
                    handleSubmit(true);
                }}
                onCancel={() => setIsConfirmModalOpen(false)}
                loading={submitting}
                type="info"
            />
        </div>
    );
}

function OptionBtn({ label, letter, active, onClick, isMultiple }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full text-left p-3.5 sm:p-5 rounded-xl border-2 transition-all duration-300 flex items-center justify-between gap-4 group ${
                active 
                ? 'border-blue-600 bg-blue-50/10 text-blue-700 shadow-sm' 
                : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50 text-slate-600'
            }`}
        >
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 border-2 flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                    isMultiple ? 'rounded-md' : 'rounded-full'
                } ${
                    active ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-600'
                }`}>
                    {letter}
                </div>
                <span className="font-bold text-sm sm:text-base tracking-tight leading-snug break-words">{label}</span>
            </div>
            <div className="flex items-center shrink-0">
                {isMultiple ? (
                    active ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-200 group-hover:text-blue-200" />
                ) : (
                    active ? <CheckCircle2 size={20} className="text-blue-600" /> : <Circle size={20} className="text-slate-200 group-hover:text-blue-200" />
                )}
            </div>
        </button>
    );
}
