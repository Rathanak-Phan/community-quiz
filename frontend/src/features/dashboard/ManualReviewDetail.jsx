import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAttempt, gradeAnswer } from "../../services/attemptService";
import { ClipboardCheck, User, Clock, ChevronLeft, Save, MessageSquare, Star, CheckCircle2 } from "lucide-react";
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
            try {
                const res = await getAttempt(attemptId);
                const data = res.data.data || res.data;
                setAttempt(data);
                
                // Initialize grading state
                const initialGrading = {};
                data.answers?.forEach(ans => {
                    if (ans.question?.question_type === 'short_answer') {
                        initialGrading[ans.id] = {
                            score: ans.score || 0,
                            feedback: ans.feedback || ""
                        };
                    }
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

    const submitGrade = async (answerId) => {
        setSubmitting(true);
        try {
            const data = grading[answerId];
            await gradeAnswer(answerId, data);
            setToast({ show: true, message: "Grade updated successfully", type: "success" });
        } catch (error) {
            setToast({ show: true, message: "Failed to update grade", type: "error" });
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

    const shortAnswers = attempt.answers?.filter(ans => ans.question?.question_type === 'short_answer') || [];

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
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white font-black text-2xl">
                            {attempt.user?.name?.charAt(0)}
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight">{attempt.quiz?.title}</h1>
                            <div className="flex items-center gap-4 text-white/60 text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2"><User size={12} /> {attempt.user?.name}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span className="flex items-center gap-2"><Clock size={12} /> Submitted {new Date(attempt.completed_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Current Score</p>
                        <p className="text-4xl font-black tracking-tighter">{attempt.score || 0} <span className="text-lg text-white/40">/ {attempt.max_score || 100}</span></p>
                    </div>
                </div>
            </div>

            {/* Answers to Grade */}
            <div className="space-y-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Responses Awaiting Grade ({shortAnswers.length})</h3>
                <div className="space-y-10">
                    {shortAnswers.map((ans, idx) => (
                        <div key={ans.id} className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/40 group hover:border-orange-200 transition-all duration-500">
                            <div className="p-10 space-y-10">
                                <div className="flex flex-col md:flex-row gap-10">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-200 shrink-0 group-hover:bg-orange-50 group-hover:text-orange-200 transition-colors">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</p>
                                            <h4 className="text-xl font-bold text-slate-900 leading-tight">{ans.question?.question_text}</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Response</p>
                                            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 font-medium text-slate-700 italic leading-relaxed">
                                                "{ans.answer_text}"
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
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-black text-lg"
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
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium h-[60px]"
                                            value={grading[ans.id]?.feedback}
                                            onChange={(e) => handleGradeChange(ans.id, 'feedback', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => submitGrade(ans.id)}
                                        disabled={submitting}
                                        className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95 flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? "Processing..." : "Submit Score"}
                                        <CheckCircle2 size={18} />
                                    </button>
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
