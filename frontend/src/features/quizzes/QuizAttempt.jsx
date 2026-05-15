import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAttempt, submitAnswer, submitAttempt } from "../../services/attemptService";
import { Clock, ChevronRight, ChevronLeft, Send, Save, ShieldCheck, Users, AlertCircle, CheckCircle2, XCircle, CheckSquare, Circle, Square } from "lucide-react";
import Toast from "../../components/ui/Toast";
import { STORAGE_URL } from "../../config/api";

export default function QuizAttempt() {
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

    useEffect(() => {
        const fetchAttempt = async () => {
            if (!attemptId || attemptId === 'undefined') return;
            try {
                const res = await getAttempt(attemptId);
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
            
            await submitAnswer(attemptId, payload);
        } catch (error) {
            console.error("Cloud sync failed");
        }
    };

    const handleSubmit = async (isAuto = false) => {
        if (!isAuto && !window.confirm("Ready to finalize your attempt?")) return;
        setSubmitting(true);
        try {
            await submitAttempt(attemptId, { is_anonymous: isAnonymous });
            navigate(`/attempts/${attemptId}/review`);
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
            {/* Ultra-Modern Fixed Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 px-8 py-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <button 
                            onClick={() => navigate("/dashboard")} 
                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition shadow-inner"
                        >
                            <Save size={16} />
                        </button>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">{attempt.quiz?.title}</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Question {currentQuestionIdx + 1} / {questions.length}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{attempt.quiz?.category?.name || "General"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${isAnonymous ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {isAnonymous ? <ShieldCheck size={12} /> : <Users size={12} />}
                            {isAnonymous ? "Stay Anonymous" : "Public Answer"}
                        </button>
                        
                        {totalTimeLeft !== null && (
                            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-colors ${totalTimeLeft < 60 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'}`}>
                                <Clock size={16} className={totalTimeLeft < 60 ? "animate-spin-slow" : ""} />
                                <span className="font-mono text-lg font-bold tracking-tighter">{formatTime(totalTimeLeft)}</span>
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

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
                <div className="bg-white rounded-xl border border-slate-100 p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
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

                    <div className="absolute top-0 right-0 p-8 pt-10">
                        <div className="flex flex-col items-end gap-2">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 group-hover:text-blue-100 transition-colors">
                                <span className="font-bold text-xl tracking-tighter">{currentQuestionIdx + 1}</span>
                            </div>
                            {questionTimeLeft !== null && (
                                <span className={`text-[10px] font-black uppercase tracking-widest ${questionTimeLeft < 10 ? 'text-rose-500' : 'text-slate-400'}`}>
                                    {questionTimeLeft}s
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-10 pt-4">
                        <h2 className="text-2xl font-bold text-slate-900 leading-[1.4] max-w-2xl">{currentQuestion?.question_text}</h2>
                        
                        {currentQuestion?.image && (
                            <div className="rounded-xl overflow-hidden border-4 border-slate-50 shadow-inner group-hover:scale-[1.01] transition-transform duration-700">
                                <img src={`${STORAGE_URL}/${currentQuestion.image}`} alt="Question visual" className="w-full object-cover max-h-[25rem]" />
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5">
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
                                <div className="grid grid-cols-2 gap-6">
                                    {['True', 'False'].map(val => (
                                        <button 
                                            key={val}
                                            onClick={() => handleAnswerChange(currentQuestion.id, val)}
                                            className={`py-12 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-4 ${
                                                answers[currentQuestion.id] === val
                                                ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xl shadow-blue-600/10'
                                                : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl shadow-inner ${answers[currentQuestion.id] === val ? 'bg-blue-600 text-white' : 'bg-white text-slate-200'}`}>
                                                {val.charAt(0)}
                                            </div>
                                            <span className="font-black uppercase tracking-[0.2em] text-xs">{val}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion?.question_type === 'short_answer' && (
                                <div className="space-y-4">
                                    <textarea 
                                        className="w-full p-10 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-blue-600 transition-all duration-500 outline-none min-h-[250px] text-lg font-bold placeholder:text-slate-200"
                                        placeholder="Type your structured response here..."
                                        value={answers[currentQuestion.id] || ""}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                        onBlur={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                    />
                                    <div className="flex items-center gap-2 px-6">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time sync active</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="mt-10 flex justify-between items-center px-6">
                    <button 
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx(p => p - 1)}
                        className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-white disabled:opacity-20 transition-all duration-300"
                    >
                        <ChevronLeft size={18} />
                        BACK
                    </button>

                    {currentQuestionIdx === questions.length - 1 ? (
                        <button 
                            onClick={() => handleSubmit()}
                            disabled={submitting}
                            className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all duration-300 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? "UPLOADING..." : "FINALIZE QUIZ"}
                            <Send size={18} />
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentQuestionIdx(p => p + 1)}
                            className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-blue-600 transition-all duration-500 shadow-lg active:scale-95 group"
                        >
                            NEXT QUESTION
                            <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                        </button>
                    )}
                </div>
            </main>

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );
}

function OptionBtn({ label, letter, active, onClick, isMultiple }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 flex items-center justify-between group ${
                active 
                ? 'border-blue-600 bg-blue-50/20 text-blue-700 shadow-sm' 
                : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50 text-slate-600'
            }`}
        >
            <div className="flex items-center gap-5">
                <div className={`w-9 h-9 border-2 flex items-center justify-center font-bold text-xs transition-all ${
                    isMultiple ? 'rounded-md' : 'rounded-full'
                } ${
                    active ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-600'
                }`}>
                    {letter}
                </div>
                <span className="font-bold text-base tracking-tight">{label}</span>
            </div>
            <div className="flex items-center">
                {isMultiple ? (
                    active ? <CheckSquare size={22} className="text-blue-600" /> : <Square size={22} className="text-slate-200 group-hover:text-blue-200" />
                ) : (
                    active ? <CheckCircle2 size={22} className="text-blue-600" /> : <Circle size={22} className="text-slate-200 group-hover:text-blue-200" />
                )}
            </div>
        </button>
    );
}
