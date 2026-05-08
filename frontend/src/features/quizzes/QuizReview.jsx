import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReview, getShareResult } from "../../services/attemptService";
import { CheckCircle2, XCircle, Clock, Trophy, ArrowRight, Home, LayoutDashboard, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import Toast from "../../components/ui/Toast";

export default function QuizReview() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await getReview(attemptId);
                setReview(res.data.data || res.data);
            } catch (error) {
                setToast({ show: true, message: "Failed to load review data", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchReview();
    }, [attemptId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!review) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <AlertCircle size={48} className="text-rose-500 mb-4" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Review Unavailable</h2>
            <button onClick={() => navigate("/dashboard")} className="mt-6 text-blue-600 font-bold hover:underline">Back to Dashboard</button>
        </div>
    );

    const isGraded = review.grading_status === 'graded';
    const percentage = isGraded ? (review.score / review.total_possible_score) * 100 : 0;
    const isSuccess = percentage >= 50;

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Success Hero */}
            <div className={`rounded-[3rem] p-12 text-center relative overflow-hidden transition-all duration-700 ${
                isGraded ? (isSuccess ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white') : 'bg-blue-600 text-white'
            }`}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[80%] bg-white rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[80%] bg-indigo-500 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 space-y-8">
                    {isGraded ? (
                        <>
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 mb-4">
                                <Trophy size={48} className={isSuccess ? "text-amber-400" : "text-white/60"} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-6xl font-black tracking-tighter">
                                    {percentage.toFixed(0)}% <span className="text-white/40">SCORE</span>
                                </h1>
                                <p className="text-white/60 font-black uppercase tracking-[0.3em] text-xs">
                                    {isSuccess ? "Outstanding Performance!" : "Keep Practicing!"}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 mb-4 animate-pulse">
                                <Clock size={48} />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">Awaiting Grading</h1>
                            <p className="text-white/60 font-black uppercase tracking-[0.3em] text-xs">Manual review in progress by creator</p>
                        </>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
                        <StatItem icon={<LayoutDashboard size={14}/>} label="Quiz" value={review.quiz?.title} />
                        <StatItem icon={<CheckCircle2 size={14}/>} label="Earned" value={`${review.score || 0} Pts`} />
                        <StatItem icon={<ArrowRight size={14}/>} label="Possible" value={`${review.total_possible_score || 0} Pts`} />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center justify-center gap-3 p-8 bg-white border border-slate-100 rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors"
                >
                    <Home size={18} /> My Dashboard
                </button>
                <button 
                    onClick={() => navigate("/quizzes")}
                    className="flex items-center justify-center gap-3 p-8 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                >
                    Try Another Quiz <Sparkles size={18} />
                </button>
            </div>

            {/* Social Sharing */}
            {isGraded && review.submission_id && (
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Share Your Victory</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Celebrate your score with your professional network</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={async () => {
                                try {
                                    const res = await getShareResult(review.submission_id);
                                    window.open(res.data.facebook_url, '_blank');
                                } catch (e) {
                                    setToast({ show: true, message: "Share failed", type: "error" });
                                }
                            }}
                            className="bg-[#1877F2] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            Facebook
                        </button>
                        <button 
                            onClick={async () => {
                                try {
                                    const res = await getShareResult(review.submission_id);
                                    window.open(res.data.linkedin_url, '_blank');
                                } catch (e) {
                                    setToast({ show: true, message: "Share failed", type: "error" });
                                }
                            }}
                            className="bg-[#0A66C2] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            LinkedIn
                        </button>
                    </div>
                </div>
            )}

            {/* Breakdown */}
            <div className="space-y-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Detailed Breakdown</h3>
                <div className="space-y-6">
                    {review.answers?.map((ans, idx) => (
                        <div key={ans.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-10 flex flex-col md:flex-row gap-10">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-200 shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 space-y-8">
                                    <h4 className="text-xl font-black text-slate-900 leading-tight">{ans.question?.question_text}</h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-6 bg-slate-50 rounded-3xl space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Your Answer</p>
                                            <p className="font-bold text-slate-700">{ans.answer_text}</p>
                                        </div>
                                        {isGraded && (
                                            <div className={`p-6 rounded-3xl space-y-1 ${ans.is_correct ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-[8px] font-black uppercase tracking-widest ${ans.is_correct ? 'text-emerald-600' : 'text-rose-600'}`}>Result</p>
                                                    {ans.is_correct ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-rose-500" />}
                                                </div>
                                                <p className={`font-black uppercase tracking-tight ${ans.is_correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {ans.is_correct ? 'Mastery' : 'Incorrect'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {ans.feedback && (
                                        <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4">
                                            <MessageSquare size={18} className="text-blue-500 shrink-0" />
                                            <p className="text-sm font-medium text-blue-700 italic">"{ans.feedback}"</p>
                                        </div>
                                    )}
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

function StatItem({ icon, label, value }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-white/40 uppercase font-black text-[8px] tracking-[0.2em]">
                {icon} {label}
            </div>
            <p className="font-black tracking-tight text-sm uppercase">{value}</p>
        </div>
    );
}
