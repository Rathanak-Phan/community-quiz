import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAttempt, gradeAnswer } from "../../services/attemptService";
import { ClipboardCheck, User, Clock, ChevronLeft, Save, MessageSquare, Star, CheckCircle2, XCircle } from "lucide-react";
import Toast from "../../components/ui/Toast";

export default function ManualReviewDetail() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    useEffect(() => {
        const fetchAttempt = async () => {
            if (!attemptId || attemptId === 'undefined') return;
            try {
                const res = await getAttempt(attemptId);
                const data = res.data.data || res.data;
                setAttempt(data);
                
                // Initialize grading state for ALL answers
                const initialGrading = {};
                data.answers?.forEach(ans => {
                    initialGrading[ans.id] = {
                        score: ans.score !== null ? ans.score : 0,
                        feedback: ans.feedback || ""
                    };
                });
                setGrading(initialGrading);
            } catch (error) {
                setToast({ show: true, message: "Failed to load submission", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchAttempt();
    }, [attemptId]);

    const handleGradeChange = (answerId, field, value) => {
        setGrading(prev => ({
            ...prev,
            [answerId]: { ...prev[answerId], [field]: value }
        }));
    };

    const submitGrade = async (answerId, isCorrectOverride = null, scoreOverride = null) => {
        const answer = attempt.answers.find(a => a.id === parseInt(answerId));
        const maxPoints = answer?.question?.points || 0;
        const currentScore = scoreOverride !== null ? scoreOverride : grading[answerId]?.score;

        if (currentScore < 0) {
            setToast({ show: true, message: "Score cannot be negative", type: "error" });
            return;
        }

        if (currentScore > maxPoints) {
            setToast({ show: true, message: `Score cannot exceed max points (${maxPoints})`, type: "error" });
            return;
        }

        setSubmitting(true);
        try {
            const data = { 
                ...grading[answerId],
                ...(isCorrectOverride !== null && { is_correct: isCorrectOverride }),
                ...(scoreOverride !== null && { score: scoreOverride })
            };
            const res = await gradeAnswer(answerId, data);
            
            const updatedAnswer = res.data?.answer;
            
            // Update local attempt state (score AND individual answer data)
            setAttempt(prev => ({
                ...prev,
                score: res.data?.attempt_summary?.score ?? prev.score,
                grading_status: res.data?.attempt_summary?.grading_status ?? prev.grading_status,
                answers: prev.answers.map(ans => 
                    ans.id === parseInt(answerId) 
                        ? { 
                            ...ans, 
                            ...updatedAnswer,
                            // Preserve question object if missing in response
                            question: updatedAnswer?.question || ans.question,
                            score: updatedAnswer?.score !== undefined ? parseFloat(updatedAnswer.score) : ans.score,
                            is_correct: updatedAnswer?.is_correct !== undefined ? updatedAnswer.is_correct : ans.is_correct
                          } 
                        : ans
                )
            }));

            setToast({ show: true, message: "Feedback and grade saved successfully", type: "success" });
        } catch (error) {
            console.error("Grade submission error:", error);
            setToast({ show: true, message: "Failed to update feedback", type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!attempt) return null;

    // Filter responses that need manual grading (short answers that haven't been graded yet)
    const awaitingGrade = attempt.answers?.filter(ans => 
        ans.question?.question_type === 'short_answer' && 
        ans.score === null
    ) || [];

    // Filter responses that are already graded (automatically or manually)
    const otherResponses = attempt.answers?.filter(ans => 
        !(ans.question?.question_type === 'short_answer' && ans.score === null)
    ) || [];

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-colors"
                >
                    <ChevronLeft size={16} /> Back to list
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl">
                    <ClipboardCheck size={14} className="text-orange-600" />
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Grading Session</span>
                </div>
            </div>

            {/* Candidate Card */}
            <div className="bg-slate-900 rounded-xl p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white font-black text-2xl">
                            {attempt.user?.name?.charAt(0) || <User size={32} />}
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight">{attempt.quiz?.title}</h1>
                            <div className="flex items-center gap-4 text-white/60 text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2"><User size={12} /> {attempt.is_anonymous ? 'Anonymous User' : attempt.user?.name}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span className="flex items-center gap-2"><Clock size={12} /> Submitted {new Date(attempt.completed_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Current Score</p>
                        <p className="text-4xl font-black tracking-tighter">{attempt.score || 0} <span className="text-lg text-white/40">/ {attempt.max_score || 100}</span></p>
                    </div>
                </div>
            </div>

            {/* Answers to Grade */}
            {awaitingGrade.length > 0 && (
                <div className="space-y-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Responses Awaiting Grade ({awaitingGrade.length})</h3>
                    <div className="space-y-10">
                        {awaitingGrade.map((ans, idx) => (
                            <AnswerGradeCard 
                                key={ans.id} 
                                ans={ans} 
                                idx={idx} 
                                grading={grading} 
                                handleGradeChange={handleGradeChange} 
                                submitGrade={submitGrade} 
                                submitting={submitting} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Other Responses */}
            <div className="space-y-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Other Quiz Responses ({otherResponses.length})</h3>
                <div className="space-y-6">
                    {otherResponses.map((ans, idx) => (
                        <div key={ans.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm group hover:border-blue-200 transition-all duration-500">
                            <div className="p-8 space-y-6">
                                <div className="flex gap-6">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-300 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-300 transition-colors">
                                        {awaitingGrade.length + idx + 1}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-slate-900">{ans.question?.question_text}</h4>
                                            <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${ans.is_correct ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {ans.is_correct ? 'Correct' : 'Incorrect'} • {ans.score || 0} pts
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Response</p>
                                                <p className="text-sm font-medium text-slate-700">
                                                    {ans.selected_options_data && ans.selected_options_data.length > 0 
                                                        ? ans.selected_options_data.map(o => o.option_text).join(', ')
                                                        : (ans.answer_text || (ans.answer_boolean !== null ? (ans.answer_boolean ? 'True' : 'False') : 'No Answer'))}
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Star size={14} className="text-orange-500" />
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Score (Max {ans.question?.points})</span>
                                                </div>
                                                <input 
                                                    type="number"
                                                    max={ans.question?.points}
                                                    min={0}
                                                    step="0.1"
                                                    placeholder={`0 - ${ans.question?.points}`}
                                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-orange-500 transition-all text-sm font-black"
                                                    value={grading[ans.id]?.score}
                                                    onChange={(e) => handleGradeChange(ans.id, 'score', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare size={14} className="text-blue-500" />
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Feedback</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <textarea 
                                                        placeholder="Add feedback..."
                                                        className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-xs font-medium h-[45px] resize-none"
                                                        value={grading[ans.id]?.feedback || ""}
                                                        onChange={(e) => handleGradeChange(ans.id, 'feedback', e.target.value)}
                                                    />
                                                    <button 
                                                        onClick={() => submitGrade(ans.id)}
                                                        disabled={submitting}
                                                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                                                        title="Save Score & Feedback"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );
}

function AnswerGradeCard({ ans, idx, grading, handleGradeChange, submitGrade, submitting }) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/40 group hover:border-orange-200 transition-all duration-500">
            <div className="p-10 space-y-10">
                <div className="flex flex-col md:flex-row gap-10">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-200 shrink-0 group-hover:bg-orange-50 group-hover:text-orange-200 transition-colors">
                        {idx + 1}
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</p>
                            <h4 className="text-xl font-bold text-slate-900 leading-tight">{ans.question?.question_text}</h4>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Response</p>
                            <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 font-medium text-slate-700 italic leading-relaxed">
                                "{ans.answer_text}"
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Expected Answer</p>
                            <div className="p-8 bg-emerald-50 rounded-xl border border-emerald-100 font-bold text-emerald-900 leading-relaxed">
                                {ans.question?.short_answer?.answer_text || "No reference provided"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-slate-50 grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                            <Star size={14} className="text-orange-500" />
                            Assign Points (Max {ans.question?.points || 10})
                        </label>
                        <input 
                            type="number"
                            max={ans.question?.points || 10}
                            min={0}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-orange-500 transition-all font-black text-lg"
                            value={grading[ans.id]?.score}
                            onChange={(e) => handleGradeChange(ans.id, 'score', e.target.value)}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                            <MessageSquare size={14} className="text-blue-500" />
                            Educator Feedback
                        </label>
                        <textarea 
                            placeholder="Provide constructive feedback..."
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium h-[60px]"
                            value={grading[ans.id]?.feedback}
                            onChange={(e) => handleGradeChange(ans.id, 'feedback', e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-4">
                    <button 
                        onClick={() => {
                            handleGradeChange(ans.id, 'score', ans.question?.points || 10);
                            submitGrade(ans.id, true, ans.question?.points || 10);
                        }}
                        disabled={submitting}
                        className="px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        <CheckCircle2 size={16} /> Mark Correct
                    </button>
                    <button 
                        onClick={() => {
                            handleGradeChange(ans.id, 'score', 0);
                            submitGrade(ans.id, false, 0);
                        }}
                        disabled={submitting}
                        className="px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-rose-500 text-rose-600 hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        <XCircle size={16} /> Mark Incorrect
                    </button>
                    <button 
                        onClick={() => submitGrade(ans.id)}
                        disabled={submitting}
                        className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                        {submitting ? "Processing..." : "Save Score"}
                        <Save size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
