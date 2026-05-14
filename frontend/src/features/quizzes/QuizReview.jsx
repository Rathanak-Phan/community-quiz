import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReview } from "../../services/attemptService";
import { getResultShareLink } from "../../services/shareService";
import { CheckCircle2, XCircle, Clock, Trophy, Home, MessageSquare, AlertCircle, Sparkles, Copy } from "lucide-react";
import Toast from "../../components/ui/Toast";

export default function QuizReview() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [sharingType, setSharingType] = useState(null);
    const [shareMode, setShareMode] = useState('result'); // 'result' or 'quiz'

    useEffect(() => {
        const fetchReview = async () => {
            if (!attemptId || attemptId === 'undefined') return;
            try {
                const res = await getReview(attemptId);
                setReview(res.data.data || res.data);
            } catch {
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
    const percentage = review.max_score > 0 ? (review.score / review.max_score) * 100 : 0;
    const isSuccess = percentage >= 50;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 mt-6">
            {/* Header Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                {/* Subtle background glow for success/fail */}
                <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none ${
                    isGraded ? (isSuccess ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-blue-500'
                }`}></div>

                <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        isGraded 
                            ? (isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600') 
                            : 'bg-blue-50 text-blue-600'
                    }`}>
                        {isGraded ? <Trophy size={28} /> : <Clock size={28} />}
                    </div>
                    <div className="space-y-1 text-left">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {isGraded ? (isSuccess ? "Great Job!" : "Needs Review") : "Awaiting Grading"}
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            {review.quiz?.title}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8 relative z-10 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                            {review.grading_status === 'pending' ? 'Objective Score' : 'Final Score'}
                        </p>
                        <p className="text-4xl font-bold text-slate-900 tracking-tighter">
                            {review.grading_status === 'pending' ? `${percentage.toFixed(0)}%*` : `${percentage.toFixed(0)}%`}
                        </p>
                    </div>
                    <div className="w-px h-12 bg-slate-200"></div>
                    <div className="text-left md:text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                            {review.grading_status === 'pending' ? 'Objective Points' : 'Total Points'}
                        </p>
                        <p className="text-2xl font-bold text-slate-700 tracking-tight">
                            {review.score || 0} <span className="text-sm text-slate-400">/ {review.max_score || 0}</span>
                        </p>
                        {review.grading_status === 'pending' && (
                            <p className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter mt-1">*Excluding Short Answers</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions & Share Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm flex flex-col justify-center space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Next Steps</h3>
                        <p className="text-xs text-slate-500">Continue learning or check your progress.</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate("/quizzes")} 
                            className="flex-1 bg-blue-600 text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 transition-all flex justify-center items-center gap-2"
                        >
                            Try Another <Sparkles size={16} />
                        </button>
                        <button 
                            onClick={() => navigate("/dashboard")} 
                            className="flex-1 bg-slate-50 text-slate-700 border border-slate-200 px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all flex justify-center items-center gap-2"
                        >
                            <Home size={16} /> Dashboard
                        </button>
                    </div>
                </div>

                {review.submission_id && (
                    <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-6 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Share</h3>
                                <p className="text-xs text-slate-500">Spread the word with your network.</p>
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button 
                                    onClick={() => setShareMode('result')} 
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${shareMode === 'result' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Result
                                </button>
                                <button 
                                    onClick={() => setShareMode('quiz')} 
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${shareMode === 'quiz' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Quiz
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                            <ShareButton 
                                type="facebook"
                                icon={<FacebookIcon size={20} />} 
                                color="bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white border-[#1877F2]/20"
                                loading={sharingType === 'facebook'}
                                disabled={sharingType !== null}
                                onClick={async () => {
                                    setSharingType('facebook');
                                    try {
                                        const res = shareMode === 'result' 
                                            ? await getResultShareLink(review.submission_id)
                                            : await (await import('../../services/shareService')).getQuizShareLink(review.quiz_id);
                                        const url = res.data.share_url || '';
                                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                    } catch { setToast({ show: true, message: "Share failed", type: "error" }); } 
                                    finally { setSharingType(null); }
                                }}
                            />
                            <ShareButton 
                                type="linkedin"
                                icon={<LinkedInIcon size={20} />} 
                                color="bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white border-[#0A66C2]/20"
                                loading={sharingType === 'linkedin'}
                                disabled={sharingType !== null}
                                onClick={async () => {
                                    setSharingType('linkedin');
                                    try {
                                        const res = shareMode === 'result' 
                                            ? await getResultShareLink(review.submission_id)
                                            : await (await import('../../services/shareService')).getQuizShareLink(review.quiz_id);
                                        const url = res.data.share_url || '';
                                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                                    } catch { setToast({ show: true, message: "Share failed", type: "error" }); } 
                                    finally { setSharingType(null); }
                                }}
                            />
                            <ShareButton 
                                type="twitter"
                                icon={<XIcon size={20} />} 
                                color="bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white border-slate-200"
                                loading={sharingType === 'twitter'}
                                disabled={sharingType !== null}
                                onClick={async () => {
                                    setSharingType('twitter');
                                    try {
                                        const res = shareMode === 'result' 
                                            ? await getResultShareLink(review.submission_id)
                                            : await (await import('../../services/shareService')).getQuizShareLink(review.quiz_id);
                                        const url = res.data.share_url || '';
                                        let text = shareMode === 'result'
                                            ? (isGraded ? `I just scored ${percentage.toFixed(0)}% on "${review.quiz?.title}"! Can you beat my score?` : `I just completed "${review.quiz?.title}"! Try it out!`)
                                            : `Check out this awesome quiz: "${review.quiz?.title}"!`;
                                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                                    } catch { setToast({ show: true, message: "Share failed", type: "error" }); } 
                                    finally { setSharingType(null); }
                                }}
                            />
                            <div className="w-px h-8 bg-slate-200 mx-2"></div>
                            <ShareButton 
                                type="copy"
                                icon={<Copy size={20} />} 
                                color="bg-slate-50 text-slate-500 hover:bg-emerald-500 hover:text-white border-slate-200"
                                loading={sharingType === 'copy'}
                                disabled={sharingType !== null}
                                onClick={async () => {
                                    setSharingType('copy');
                                    try {
                                        const res = shareMode === 'result' 
                                            ? await getResultShareLink(review.submission_id)
                                            : await (await import('../../services/shareService')).getQuizShareLink(review.quiz_id);
                                        await navigator.clipboard.writeText(res.data.share_url || '');
                                        setToast({ show: true, message: "Link copied!", type: "success" });
                                    } catch { setToast({ show: true, message: "Copy failed", type: "error" }); } 
                                    finally { setSharingType(null); }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center gap-4 px-2">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Detailed Breakdown</h3>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <div className="space-y-4">
                    {review.answers?.map((ans, idx) => (
                        <div key={ans.id} className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 transition-all hover:shadow-md">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0">
                                {idx + 1}
                            </div>
                            
                            <div className="flex-1 space-y-6">
                                <h4 className="text-lg font-bold text-slate-900 leading-snug">{ans.question?.question_text}</h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            Your Answer
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {ans.selected_options_data && ans.selected_options_data.length > 0 
                                                ? ans.selected_options_data.map(o => o.option_text).join(', ')
                                                : (ans.answer_text || (ans.answer_boolean !== null ? (ans.answer_boolean ? 'True' : 'False') : 'No Answer'))}
                                        </p>
                                    </div>
                                    
                                    {ans.question?.question_type === 'short_answer' && ans.score === null ? (
                                        <div className="p-4 bg-orange-50 rounded-2xl space-y-1.5 border border-orange-100">
                                            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center justify-between">
                                                Status
                                                <Clock size={14} />
                                            </p>
                                            <p className="text-sm font-semibold text-orange-700">
                                                Awaiting Review
                                            </p>
                                        </div>
                                    ) : (ans.score !== null || isGraded) && (
                                        <div className={`p-4 rounded-2xl space-y-1.5 border ${ans.is_correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center justify-between ${ans.is_correct ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                Result
                                                {ans.is_correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                            </p>
                                            <p className={`text-sm font-semibold ${ans.is_correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                {ans.is_correct ? 'Correct' : 'Incorrect'} ({ans.score || 0} pts)
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {ans.feedback && ans.question?.question_type === 'short_answer' && (
                                    <div className="p-6 bg-blue-50/40 rounded-[1.5rem] border border-blue-100/50 flex flex-col gap-3 relative overflow-hidden group/feedback">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/feedback:opacity-10 transition-opacity">
                                            <MessageSquare size={48} className="text-blue-600" />
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                            <Sparkles size={12} />
                                            Quiz Maker Feedback
                                        </div>
                                        <p className="text-sm font-medium text-blue-900 leading-relaxed relative z-10 italic">
                                            "{ans.feedback}"
                                        </p>
                                    </div>
                                )}
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

function ShareButton({ icon, color, loading, disabled, onClick }) {
    return (
        <button 
            disabled={disabled}
            onClick={onClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${color} ${loading ? 'opacity-50 animate-pulse cursor-wait' : (disabled ? 'opacity-50 cursor-not-allowed' : '')}`}
        >
            {icon}
        </button>
    );
}

// Custom Icons for Social Brands
const FacebookIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
);

const LinkedInIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
);

const XIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);
