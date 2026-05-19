import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReview, getReviewPublic } from "./services/attemptService";
import { getResultShareLink } from "./services/shareService";
import { CheckCircle2, XCircle, Clock, Trophy, Home, MessageSquare, AlertCircle, Sparkles, Copy, Frown, BookOpen, GraduationCap } from "lucide-react";
import Toast from "../../components/ui/Toast";
import confetti from "canvas-confetti";
import SEO from "../../components/common/SEO";
import { getSettings } from "../admin/services/settingService";
import { STORAGE_URL } from "../../config/api";

export default function QuizReview({ isPublic = false }) {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [sharingType, setSharingType] = useState(null);
    const [shareMode, setShareMode] = useState('result'); // 'result' or 'quiz'
    const [effectTriggered, setEffectTriggered] = useState(false);

    const getCleanUrl = (url) => {
        if (!url) return window.location.origin;
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) {
            targetUrl = `${window.location.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
        }
        if (targetUrl.includes('localhost')) {
            const urlObj = new URL(targetUrl);
            targetUrl = `${window.location.origin}${urlObj.pathname}${urlObj.search}`;
        }
        return targetUrl;
    };

    const exportSingleAsText = () => {
        const name = review.user?.name || review.anonymous_name || "Anonymous User";
        const quizTitle = review.quiz?.title || "Quiz";
        const score = review.score || 0;
        const maxScore = review.max_score || 0;
        const pct = Math.round((score / maxScore || 0) * 100);
        
        let content = `=====================================\n`;
        content += `          QUIZ RESULT CERTIFICATE     \n`;
        content += `=====================================\n\n`;
        content += `Platform: ${settings.site_name || "QuizSphere"}\n`;
        content += `Quiz Title: ${quizTitle}\n`;
        if (review.quiz?.creator?.name) {
            content += `Quiz Maker (Sharer): ${review.quiz.creator.name}\n`;
        }
        content += `Participant Name: ${name}\n`;
        content += `Score obtained: ${score} / ${maxScore} (${pct}%)\n`;
        content += `Grading Status: ${review.grading_status}\n`;
        content += `Completed on: ${review.completed_at ? new Date(review.completed_at).toLocaleString() : new Date().toLocaleString()}\n\n`;
        content += `=====================================\n`;
        content += `        Thank you for participating! \n`;
        content += `=====================================\n`;

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `quiz_result_${attemptId}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ show: true, message: "Result exported as Text!", type: "success" });
    };

    const exportSingleAsPDF = async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const name = review.user?.name || review.anonymous_name || "Anonymous User";
        const quizTitle = review.quiz?.title || "Quiz";
        const score = review.score || 0;
        const maxScore = review.max_score || 0;
        const pct = Math.round((score / maxScore || 0) * 100);

        // Certificate border
        doc.setDrawColor(37, 99, 235); // Blue-600
        doc.setLineWidth(1.2);
        doc.rect(10, 10, 190, 277);
        
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.setLineWidth(0.6);
        doc.rect(12, 12, 186, 273);

        // Corner Accent Gold Decorations
        doc.setDrawColor(234, 179, 8); // yellow-500 (Gold)
        doc.setLineWidth(1.6);
        // Top-Left corner accent
        doc.line(12, 22, 12, 12);
        doc.line(12, 12, 22, 12);
        // Top-Right corner accent
        doc.line(198, 22, 198, 12);
        doc.line(198, 12, 188, 12);
        // Bottom-Left corner accent
        doc.line(12, 275, 12, 285);
        doc.line(12, 285, 22, 285);
        // Bottom-Right corner accent
        doc.line(198, 275, 198, 285);
        doc.line(198, 285, 188, 285);

        // Draw Platform Logo Badge on Certificate
        doc.setFillColor(37, 99, 235); // blue-600
        doc.roundedRect(99, 20, 12, 12, 3, 3, "F");

        // Draw a stylized graduation cap inside the logo badge
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.6);
        doc.line(101, 25, 105, 23);
        doc.line(105, 23, 109, 25);
        doc.line(109, 25, 105, 27);
        doc.line(105, 27, 101, 25);
        doc.line(103, 26.5, 103, 28);
        doc.line(103, 28, 107, 28);
        doc.line(107, 28, 107, 26.5);
        doc.line(105, 25, 109.5, 27.5);

        // Platform Name on Certificate
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105); // slate-600
        doc.text(settings.site_name?.toUpperCase() || "QUIZSPHERE", 105, 38, { align: "center" });

        // Certificate Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text("QUIZ COMPLETION", 105, 54, { align: "center" });
        doc.text("REPORT", 105, 66, { align: "center" });

        // Decorative line
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(1.5);
        doc.line(75, 74, 135, 74);

        // Present text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139); // slate-505
        doc.text("This documents that", 105, 88, { align: "center" });

        // Participant Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(37, 99, 235); // blue-600
        doc.text(name, 105, 105, { align: "center" });

        // Middle text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);
        doc.text("has successfully completed the quiz", 105, 123, { align: "center" });

        // Quiz Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59);
        doc.text(`"${quizTitle}"`, 105, 139, { align: "center" });

        if (review.quiz?.creator?.name) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Quiz Maker (Sharer): ${review.quiz.creator.name}`, 105, 147, { align: "center" });
        }

        // Box for Score
        doc.setFillColor(248, 250, 252); // slate-50
        doc.roundedRect(45, 158, 120, 50, 4, 4, "FD");

        // Score Text inside Box
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);
        doc.text("SCORE OBTAINED", 105, 173, { align: "center" });
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.setTextColor(pct >= 50 ? 16 : 225, pct >= 50 ? 185 : 29, pct >= 50 ? 129 : 72);
        doc.text(`${score} / ${maxScore} (${pct}%)`, 105, 193, { align: "center" });

        // Footer Info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // slate-400
        const dateStr = review.completed_at ? new Date(review.completed_at).toLocaleString() : new Date().toLocaleString();
        doc.text(`Completed on: ${dateStr}`, 105, 235, { align: "center" });
        doc.text(`Grading Status: ${review.grading_status.toUpperCase()}`, 105, 243, { align: "center" });
        doc.text(`Attempt Verification ID: ${attemptId}`, 105, 251, { align: "center" });

        // Save PDF
        doc.save(`quiz_result_${attemptId}.pdf`);
        setToast({ show: true, message: "Result exported as PDF!", type: "success" });
    };

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    useEffect(() => {
        if (review && !effectTriggered) {
            setEffectTriggered(true);
            const percentage = review.max_score > 0 ? (review.score / review.max_score) * 100 : 0;
            if (percentage >= 50) {
                triggerConfetti();
            }
        }
    }, [review, effectTriggered]);

    useEffect(() => {
        const fetchReview = async () => {
            if (!attemptId || attemptId === 'undefined') return;
            try {
                const [res, settingsRes] = await Promise.all([
                    isPublic ? getReviewPublic(attemptId) : getReview(attemptId),
                    getSettings().catch(() => ({ data: {} }))
                ]);
                setReview(res.data.data || res.data);
                setSettings(settingsRes.data || {});
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
            <button onClick={() => navigate(isPublic ? "/quizzes" : "/dashboard")} className="mt-6 text-blue-600 font-bold hover:underline">Back to {isPublic ? "Library" : "Dashboard"}</button>
        </div>
    );

    const isGraded = review.grading_status === 'graded';
    const percentage = review.max_score > 0 ? (review.score / review.max_score) * 100 : 0;
    const isSuccess = percentage >= 50;

    return (
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-6 pb-12 px-1.5 sm:px-4 mt-2 sm:mt-4 relative">
            <SEO 
                title={`Quiz Review: ${review.quiz?.title || 'Quiz'}`}
                description={`Review detailed results and breakdown for the quiz "${review.quiz?.title || 'Quiz'}". Participant achieved ${review.score}/${review.max_score} points.`}
                url={`/public/attempts/${attemptId}/review`}
            />
            {/* Sad overlay if score < 50% */}
            {!isSuccess && <SadRainEffect />}

            {/* Header Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 p-4 sm:p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden transition-all duration-500">
                {/* Subtle background glow for success/fail */}
                <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-25 pointer-events-none transition-all duration-1000 ${
                    isGraded 
                        ? (isSuccess 
                            ? 'bg-emerald-500 animate-pulse-slow' 
                            : 'bg-rose-500 animate-pulse-slow') 
                        : 'bg-blue-500 animate-pulse-slow'
                }`}></div>

                <div className="flex items-center gap-3 sm:gap-5 relative z-10 w-full sm:w-auto">
                    <div className="relative shrink-0">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 shadow-md bg-slate-50 transition-transform duration-500 ${
                            review.grading_status === 'pending' 
                                ? 'border-amber-400'
                                : (isSuccess 
                                    ? 'border-emerald-400 animate-float' 
                                    : 'border-rose-400')
                        }`}>
                            <img 
                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(review.user?.name || review.anonymous_name || "Guest")}`} 
                                alt="Challenger Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Status Icon Badge in Corner */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-white shadow text-white ${
                            review.grading_status === 'pending' 
                                ? 'bg-amber-500'
                                : (isSuccess 
                                    ? 'bg-emerald-500' 
                                    : 'bg-rose-500')
                        }`}>
                            {review.grading_status === 'pending' ? (
                                <Clock size={10} className="sm:w-3.5 sm:h-3.5" />
                            ) : isSuccess ? (
                                <Trophy size={10} className="sm:w-3.5 sm:h-3.5 text-yellow-300" />
                            ) : (
                                <Frown size={10} className="sm:w-3.5 sm:h-3.5" />
                            )}
                        </div>
                    </div>
                    <div className="space-y-0.5 text-left min-w-0">
                        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                            {review.grading_status === 'pending' ? (
                                "Needs Review"
                            ) : isSuccess ? (
                                <>
                                    <span>Congratulations!</span>
                                    <span className="inline-block animate-bounce select-none">🎉</span>
                                </>
                            ) : (
                                <>
                                    <span>Keep Trying!</span>
                                    <span className="inline-block select-none">💪</span>
                                </>
                            )}
                        </h1>
                        <p className="text-[11px] sm:text-sm font-medium text-slate-500 leading-snug">
                            {review.grading_status === 'pending' 
                                ? "Some questions are awaiting manual grading" 
                                : (isSuccess 
                                    ? "Outstanding work! You've successfully passed the quiz." 
                                    : "You didn't reach the 50% pass mark, but practice makes perfect!")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8 relative z-10 w-full sm:w-auto justify-between sm:justify-end border-t border-slate-50 pt-3 sm:pt-0 sm:border-t-0">
                    <div className="text-left md:text-right">
                        <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">
                            {review.grading_status === 'pending' ? 'Objective Score' : 'Final Score'}
                        </p>
                        <p className={`text-2xl sm:text-4xl font-bold tracking-tighter leading-none transition-colors ${
                            review.grading_status === 'pending' 
                                ? 'text-slate-900' 
                                : (isSuccess ? 'text-emerald-600' : 'text-rose-600')
                        }`}>
                            {review.grading_status === 'pending' ? `${percentage.toFixed(0)}%*` : `${percentage.toFixed(0)}%`}
                        </p>
                    </div>
                    <div className="w-px h-8 sm:h-12 bg-slate-200"></div>
                    <div className="text-left md:text-right">
                        <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">
                            {review.grading_status === 'pending' ? 'Objective Points' : 'Total Points'}
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-slate-700 tracking-tight leading-none">
                            {review.score || 0} <span className="text-xs sm:text-sm text-slate-400">/ {review.max_score || 0}</span>
                        </p>
                        {review.grading_status === 'pending' && (
                            <p className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter mt-1 leading-none">*Excluding Short Answers</p>
                        )}
                    </div>
                    {review.rank && (
                        <>
                            <div className="w-px h-8 sm:h-12 bg-slate-200"></div>
                            <div className="text-left md:text-right">
                                <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">
                                    Leaderboard Rank
                                </p>
                                <p className="text-lg sm:text-2xl font-bold text-amber-500 tracking-tight leading-none flex items-center gap-1 md:justify-end">
                                    #{review.rank} <span className="text-xs sm:text-sm text-slate-400">/ {review.total_participants || 0}</span>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Quick Actions & Share Grid */}
            <div className={`grid grid-cols-1 ${review.submission_id ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-3 sm:gap-6`}>
                <div className="bg-white rounded-xl border border-slate-200/60 p-4 sm:p-6 shadow-sm flex flex-col justify-center space-y-3">
                    <div className="space-y-0.5">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">Next Steps</h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 hidden xs:block">Continue learning or check your progress.</p>
                    </div>
                    <div className="flex gap-2.5">
                        <button 
                            onClick={() => navigate(isPublic ? `/quizzes/${review?.quiz_id || review?.quiz?.id}` : "/quizzes")} 
                            className="flex-1 bg-blue-600 text-white px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 hover:shadow-md transition-all flex justify-center items-center gap-1.5 active:scale-95 shadow-inner cursor-pointer"
                        >
                            <span>{isPublic ? "View Quiz" : "Try Another"}</span> <Sparkles size={12} />
                        </button>
                        <button 
                            onClick={() => navigate(isPublic ? "/quizzes" : "/dashboard")} 
                            className="flex-1 bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex justify-center items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                            {isPublic ? <BookOpen size={12} /> : <Home size={12} />} <span>{isPublic ? "All Quizzes" : "Dashboard"}</span>
                        </button>
                    </div>
                </div>

                {review.submission_id && (
                    <div className="bg-white rounded-xl border border-slate-200/60 p-4 sm:p-6 shadow-sm space-y-3 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-3">
                            <div className="space-y-0.5 text-left">
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">Share</h3>
                                <p className="text-[11px] sm:text-xs text-slate-500 hidden xs:block">Spread the word with your network.</p>
                            </div>
                            <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
                                <button 
                                    onClick={() => setShareMode('result')} 
                                    className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${shareMode === 'result' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Result
                                </button>
                                <button 
                                    onClick={() => setShareMode('review')} 
                                    className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${shareMode === 'review' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Real Review
                                </button>
                                <button 
                                    onClick={() => setShareMode('quiz')} 
                                    className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${shareMode === 'quiz' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Quiz
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
                            <ShareButton 
                                type="facebook"
                                icon={<FacebookIcon size={16} className="sm:w-5 sm:h-5" />} 
                                color="bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white border-[#1877F2]/20"
                                loading={sharingType === 'facebook'}
                                disabled={sharingType !== null}
                                onClick={async () => {
                                    setSharingType('facebook');
                                    try {
                                        let url = '';
                                        if (shareMode === 'result') {
                                            const res = await getResultShareLink(review.submission_id);
                                            url = getCleanUrl(res.data.share_url || res.data.frontend_url);
                                        } else if (shareMode === 'review') {
                                            url = `${window.location.origin}/public/attempts/${attemptId}/review`;
                                        } else {
                                            const res = await (await import('./services/shareService')).getQuizShareLink(review.quiz_id);
                                            url = getCleanUrl(res.data.share_url);
                                        }
                                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                    } catch { setToast({ show: true, message: "Share failed", type: "error" }); } 
                                    finally { setSharingType(null); }
                                }}
                            />
                            <ShareButton 
                                type="linkedin"
                                icon={<LinkedInIcon size={16} className="sm:w-5 sm:h-5" />} 
                                color="bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white border-[#0A66C2]/20"
                                loading={sharingType === 'linkedin'}
                                disabled={sharingType !== null}
                                onClick={async () => {
                                    setSharingType('linkedin');
                                    try {
                                        let url = '';
                                        if (shareMode === 'result') {
                                            const res = await getResultShareLink(review.submission_id);
                                            url = getCleanUrl(res.data.share_url || res.data.frontend_url);
                                        } else if (shareMode === 'review') {
                                            url = `${window.location.origin}/public/attempts/${attemptId}/review`;
                                        } else {
                                            const res = await (await import('./services/shareService')).getQuizShareLink(review.quiz_id);
                                            url = getCleanUrl(res.data.share_url);
                                        }
                                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                                    } catch { setToast({ show: true, message: "Share failed", type: "error" }); } 
                                    finally { setSharingType(null); }
                                }}
                            />
                            <ShareButton 
                                type="twitter"
                                icon={<XIcon size={16} className="sm:w-5 sm:h-5" />} 
                                color="bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white border-slate-200"
                                loading={sharingType === 'twitter'}
                                disabled={sharingType !== null}
                                onClick={async () => {
                                    setSharingType('twitter');
                                    try {
                                        let url = '';
                                        if (shareMode === 'result') {
                                            const res = await getResultShareLink(review.submission_id);
                                            url = getCleanUrl(res.data.share_url || res.data.frontend_url);
                                        } else if (shareMode === 'review') {
                                            url = `${window.location.origin}/public/attempts/${attemptId}/review`;
                                        } else {
                                            const res = await (await import('./services/shareService')).getQuizShareLink(review.quiz_id);
                                            url = getCleanUrl(res.data.share_url);
                                        }
                                        let text = '';
                                        if (shareMode === 'result') {
                                            text = isGraded ? `I just scored ${percentage.toFixed(0)}% on "${review.quiz?.title}"! Can you beat my score?` : `I just completed "${review.quiz?.title}"! Try it out!`;
                                        } else if (shareMode === 'review') {
                                            text = `Check out my detailed breakdown and corrections for "${review.quiz?.title}"! Let's learn together.`;
                                        } else {
                                            text = `Check out this awesome quiz: "${review.quiz?.title}"!`;
                                        }
                                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                                    } catch { setToast({ show: true, message: "Share failed", type: "error" }); } 
                                    finally { setSharingType(null); }
                                }}
                            />
                            <div className="w-px h-5 bg-slate-200 mx-0.5"></div>
                            <ShareButton 
                                type="copy"
                                icon={<Copy size={16} className="sm:w-5 sm:h-5" />} 
                                color="bg-slate-50 text-slate-500 hover:bg-emerald-500 hover:text-white border-slate-200"
                                loading={sharingType === 'copy'}
                                disabled={sharingType !== null}
                                onClick={async () => {
                                    setSharingType('copy');
                                    try {
                                        let url = '';
                                        if (shareMode === 'result') {
                                            const res = await getResultShareLink(review.submission_id);
                                            url = getCleanUrl(res.data.frontend_url || res.data.share_url);
                                        } else if (shareMode === 'review') {
                                            url = `${window.location.origin}/public/attempts/${attemptId}/review`;
                                        } else {
                                            const res = await (await import('./services/shareService')).getQuizShareLink(review.quiz_id);
                                            url = getCleanUrl(res.data.share_url);
                                        }
                                        await navigator.clipboard.writeText(url);
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
            <div className="space-y-3 sm:space-y-4 pt-1">
                <div className="flex items-center gap-4 px-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">Detailed Breakdown</h3>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <div className="space-y-3">
                    {review.answers?.map((ans, idx) => (
                        <div key={ans.id} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 p-3.5 sm:p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-3.5 sm:gap-6 transition-all hover:shadow-md">
                            <div className="flex items-start gap-3 sm:gap-6">
                                <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-[10px] sm:text-base text-slate-400 shrink-0 mt-0.5">
                                    {idx + 1}
                                </div>
                                
                                <div className="flex-1 space-y-3.5 sm:space-y-6 min-w-0">
                                    <h4 className="text-sm sm:text-lg font-bold text-slate-900 leading-snug break-words">{ans.question?.question_text}</h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                                        <div className="p-2.5 sm:p-4 bg-slate-50 rounded-xl space-y-0.5 sm:space-y-1 border border-slate-100">
                                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                Your Answer
                                            </p>
                                            <p className="text-xs sm:text-sm font-semibold text-slate-700 break-words leading-tight">
                                                {ans.selected_options_data && ans.selected_options_data.length > 0 
                                                    ? ans.selected_options_data.map(o => o.option_text).join(', ')
                                                    : (ans.answer_text || (ans.answer_boolean !== null ? (ans.answer_boolean ? 'True' : 'False') : 'No Answer'))}
                                            </p>
                                        </div>
                                        
                                        {ans.question?.question_type === 'short_answer' && ans.score === null ? (
                                            <div className="p-2.5 sm:p-4 bg-orange-50 rounded-xl space-y-0.5 sm:space-y-1 border border-orange-100">
                                                <p className="text-[9px] sm:text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center justify-between">
                                                    Status
                                                    <Clock size={10} />
                                                </p>
                                                <p className="text-xs sm:text-sm font-semibold text-orange-700 leading-tight">
                                                    Awaiting Review
                                                </p>
                                            </div>
                                        ) : (ans.score !== null || isGraded) && (
                                            <div className={`p-2.5 sm:p-4 rounded-xl space-y-0.5 sm:space-y-1 border ${ans.is_correct ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                                <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center justify-between ${ans.is_correct ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    Result
                                                    {ans.is_correct ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                </p>
                                                <p className={`text-xs sm:text-sm font-semibold ${ans.is_correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                    {ans.is_correct ? 'Correct' : 'Incorrect'} ({ans.score || 0} pts)
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {ans.feedback && (
                                        <div className="p-3 sm:p-6 bg-blue-50/40 rounded-xl border border-blue-100/50 flex flex-col gap-1.5 sm:gap-3 relative overflow-hidden group/feedback">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/feedback:opacity-10 transition-opacity">
                                                <MessageSquare size={36} className="text-blue-600" />
                                            </div>
                                            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                                <Sparkles size={10} />
                                                Quiz Maker Feedback
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium text-blue-900 leading-relaxed relative z-10 italic">
                                                "{ans.feedback}"
                                            </p>
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

function SadRainEffect() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (canvas) {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            }
        };

        window.addEventListener("resize", handleResize);

        // Raindrops
        const raindrops = [];
        const maxRaindrops = 50;

        // Sad emojis and symbols floating gently
        const sadSymbols = ["😢", "💔", "💧", "🌧️"];
        const floatingElements = [];
        const maxFloating = 8;

        class Raindrop {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * -height;
                this.length = Math.random() * 12 + 8;
                this.speed = Math.random() * 5 + 3;
                this.opacity = Math.random() * 0.15 + 0.05;
            }
            update() {
                this.y += this.speed;
                if (this.y > height) {
                    this.reset();
                }
            }
            draw() {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(148, 163, 184, ${this.opacity})`; // slate-400
                ctx.lineWidth = 1;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y + this.length);
                ctx.stroke();
            }
        }

        class FloatingEmoji {
            constructor() {
                this.reset(true);
            }
            reset(init = false) {
                this.x = Math.random() * width;
                this.y = init ? Math.random() * height : height + Math.random() * 100;
                this.text = sadSymbols[Math.floor(Math.random() * sadSymbols.length)];
                this.speedY = -(Math.random() * 1.0 + 0.3); // float upwards gently
                this.speedX = Math.sin(Math.random() * Math.PI * 2) * 0.3;
                this.opacity = Math.random() * 0.3 + 0.1;
                this.fontSize = Math.random() * 14 + 12;
                this.rotation = Math.random() * 0.2 - 0.1;
                this.rotationSpeed = Math.random() * 0.01 - 0.005;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                this.rotation += this.rotationSpeed;
                if (this.y < height * 0.1) {
                    this.opacity -= 0.005;
                }
                if (this.y < 0 || this.opacity <= 0) {
                    this.reset();
                }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.font = `${this.fontSize}px sans-serif`;
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.shadowColor = "rgba(0,0,0,0.05)";
                ctx.shadowBlur = 3;
                ctx.fillText(this.text, 0, 0);
                ctx.restore();
            }
        }

        // Initialize particles
        for (let i = 0; i < maxRaindrops; i++) {
            raindrops.push(new Raindrop());
        }
        for (let i = 0; i < maxFloating; i++) {
            floatingElements.push(new FloatingEmoji());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            raindrops.forEach((drop) => {
                drop.update();
                drop.draw();
            });

            floatingElements.forEach((el) => {
                el.update();
                el.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ mixBlendMode: "screen" }}
        />
    );
}

function ShareButton({ icon, color, loading, disabled, onClick }) {
    return (
        <button 
            disabled={disabled}
            onClick={onClick}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${color} ${loading ? 'opacity-50 animate-pulse cursor-wait' : (disabled ? 'opacity-50 cursor-not-allowed' : '')}`}
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
