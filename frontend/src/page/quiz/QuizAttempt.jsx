import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAttempt, submitAnswer, submitAttempt } from "../../services/attemptService";
import { Clock, ChevronRight, ChevronLeft, Send, Save, EyeOff, Eye, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
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
    const [timeLeft, setTimeLeft] = useState(0);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const res = await getAttempt(attemptId);
                setAttempt(res.data);
                setIsAnonymous(res.data.is_anonymous || false);
                const initialAnswers = {};
                res.data.answers?.forEach(ans => {
                    initialAnswers[ans.question_id] = ans.answer_text;
                });
                setAnswers(initialAnswers);
                
                if (res.data.expires_at) {
                    const expiry = new Date(res.data.expires_at);
                    const now = new Date();
                    setTimeLeft(Math.max(0, Math.floor((expiry - now) / 1000)));
                }
            } catch (error) {
                setToast({ show: true, message: "Failed to load dynamic session", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchAttempt();
    }, [attemptId]);

    useEffect(() => {
        if (timeLeft <= 0 && attempt) {
             // Handle timeout automatically if needed
             return;
        };
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, attempt]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleAnswerChange = async (questionId, value, type) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        try {
            const payload = { question_id: questionId };
            if (type === 'multiple_choice') payload.selected_option_id = value;
            else if (type === 'true_false') payload.answer_boolean = value;
            else if (type === 'short_answer') payload.answer_text = value;

            await submitAnswer(attemptId, payload);
        } catch (error) {
            console.error("Cloud sync failed");
        }
    };

    const handleSubmit = async () => {
        if (!window.confirm("Ready to finalize your attempt?")) return;
        setSubmitting(true);
        try {
            await submitAttempt(attemptId);
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

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            {/* Ultra-Modern Fixed Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 px-8 py-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate("/dashboard")} 
                            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition shadow-inner"
                        >
                            <Save size={18} />
                        </button>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">{attempt.quiz?.title}</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Question {currentQuestionIdx + 1} / {questions.length}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{attempt.quiz?.category?.name || "General"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <button 
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isAnonymous ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {isAnonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                            {isAnonymous ? "Stealth Mode" : "Public Entry"}
                        </button>
                        
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl transition-colors ${timeLeft < 60 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
                            <Clock size={18} className="animate-spin-slow" />
                            <span className="font-mono text-lg font-black tracking-tighter">{formatTime(timeLeft)}</span>
                        </div>
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

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
                <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-200 group-hover:text-blue-100 transition-colors">
                           <span className="font-black text-2xl tracking-tighter">{currentQuestionIdx + 1}</span>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <h2 className="text-3xl font-black text-slate-900 leading-[1.3] max-w-2xl">{currentQuestion?.question_text}</h2>
                        
                        {currentQuestion?.image && (
                            <div className="rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-inner group-hover:scale-[1.02] transition-transform duration-700">
                                <img src={`${STORAGE_URL}/${currentQuestion.image}`} alt="Question visual" className="w-full object-cover max-h-[30rem]" />
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5">
                            {currentQuestion?.question_type === 'multiple_choice' && currentQuestion.options?.map((opt, idx) => (
                                <OptionBtn 
                                    key={opt.id}
                                    label={opt.option_text}
                                    letter={String.fromCharCode(65 + idx)}
                                    active={answers[currentQuestion.id] === opt.id}
                                    onClick={() => handleAnswerChange(currentQuestion.id, opt.id, 'multiple_choice')}
                                />
                            ))}

                            {currentQuestion?.question_type === 'true_false' && (
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { label: 'True', value: 1 },
                                        { label: 'False', value: 0 }
                                    ].map(item => (
                                        <button 
                                            key={item.label}
                                            onClick={() => handleAnswerChange(currentQuestion.id, item.value, 'true_false')}
                                            className={`py-12 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-4 ${
                                                answers[currentQuestion.id] === item.value
                                                ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xl shadow-blue-600/10'
                                                : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${answers[currentQuestion.id] === item.value ? 'bg-blue-600 text-white' : 'bg-white text-slate-200'}`}>
                                                {item.label.charAt(0)}
                                            </div>
                                            <span className="font-black uppercase tracking-[0.2em] text-xs">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion?.question_type === 'short_answer' && (
                                <div className="space-y-4">
                                    <textarea 
                                        className="w-full p-10 bg-slate-50 border-2 border-slate-50 rounded-[2.5rem] focus:bg-white focus:border-blue-600 transition-all duration-500 outline-none min-h-[200px] text-lg font-bold placeholder:text-slate-200"
                                        placeholder="Type your structured response here..."
                                        value={answers[currentQuestion.id] || ""}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                                        onBlur={(e) => handleAnswerChange(currentQuestion.id, e.target.value, 'short_answer')}
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
                <div className="mt-12 flex justify-between items-center px-6">
                    <button 
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx(p => p - 1)}
                        className="flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-white disabled:opacity-20 transition-all duration-300"
                    >
                        <ChevronLeft size={20} />
                        BACK
                    </button>

                    {currentQuestionIdx === questions.length - 1 ? (
                        <button 
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black flex items-center gap-4 hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all duration-300 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? "UPLOADING..." : "FINALIZE QUIZ"}
                            <Send size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentQuestionIdx(p => p + 1)}
                            className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black flex items-center gap-4 hover:bg-blue-600 transition-all duration-500 shadow-2xl shadow-slate-900/10 active:scale-95 group"
                        >
                            NEXT QUESTION
                            <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
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

function OptionBtn({ label, letter, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group ${
                active 
                ? 'border-blue-600 bg-blue-50/30 text-blue-700 shadow-lg shadow-blue-600/5' 
                : 'border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-600'
            }`}
        >
            <div className="flex items-center gap-6">
                <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm transition-all ${
                    active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-300 group-hover:border-blue-200 group-hover:text-blue-500'
                }`}>
                    {letter}
                </div>
                <span className="font-black text-lg tracking-tight">{label}</span>
            </div>
            {active && <CheckCircle2 size={24} className="text-blue-600" />}
        </button>
    );
}
