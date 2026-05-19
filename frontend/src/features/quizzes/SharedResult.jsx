import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Trophy, CheckCircle2, Home, Sparkles, Loader2, Share2, GraduationCap } from "lucide-react";
import apiClient from "../../config/api";
import Toast from "../../components/ui/Toast";
import SEO from "../../components/common/SEO";
import { getSettings } from "../admin/services/settingService";
import { STORAGE_URL } from "../../config/api";

export default function SharedResult() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    useEffect(() => {
        const fetchResult = async () => {
            if (!submissionId || submissionId === 'undefined') return;
            try {
                // The share link endpoint acts as our public endpoint for submission info
                const [res, settingsRes] = await Promise.all([
                    apiClient.get(`/submissions/${submissionId}/share`),
                    getSettings().catch(() => ({ data: {} }))
                ]);
                setResult(res.data);
                setSettings(settingsRes.data || {});
            } catch (err) {
                console.error("Failed to load result", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [submissionId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
    );

    if (error || !result) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-6">
            <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center">
                <Trophy size={48} className="opacity-50" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Result Not Found</h2>
            <p className="text-slate-500 font-bold max-w-sm">This quiz result might have been deleted or the link is invalid.</p>
            <button 
                onClick={() => navigate("/")} 
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:-translate-y-1 hover:shadow-xl transition-all"
            >
                Back to Home
            </button>
        </div>
    );

    const percentage = result.max_score > 0 ? (result.score / result.max_score) * 100 : 0;
    const isSuccess = percentage >= 50;

    const exportSingleAsText = () => {
        const name = result.user_name || "Anonymous User";
        const quizTitle = result.quiz_title || "Quiz";
        const score = result.score || 0;
        const maxScore = result.max_score || 0;
        const pct = Math.round((score / maxScore || 0) * 100);
        
        let content = `=====================================\n`;
        content += `          QUIZ RESULT CERTIFICATE     \n`;
        content += `=====================================\n\n`;
        content += `Platform: ${settings.site_name || "QuizSphere"}\n`;
        content += `Quiz Title: ${quizTitle}\n`;
        if (result.quiz_creator_name) {
            content += `Quiz Maker (Sharer): ${result.quiz_creator_name}\n`;
        }
        content += `Participant Name: ${name}\n`;
        content += `Score obtained: ${score} / ${maxScore} (${pct}%)\n`;
        content += `Grading Status: ${result.grading_status || 'completed'}\n`;
        content += `Completed on: ${result.completed_at ? new Date(result.completed_at).toLocaleString() : new Date().toLocaleString()}\n\n`;
        content += `=====================================\n`;
        content += `        Thank you for participating! \n`;
        content += `=====================================\n`;

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `quiz_result_${submissionId}.txt`);
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

        const name = result.user_name || "Anonymous User";
        const quizTitle = result.quiz_title || "Quiz";
        const score = result.score || 0;
        const maxScore = result.max_score || 0;
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

        if (result.quiz_creator_name) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Quiz Maker (Sharer): ${result.quiz_creator_name}`, 105, 147, { align: "center" });
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
        const dateStr = result.completed_at ? new Date(result.completed_at).toLocaleString() : new Date().toLocaleString();
        doc.text(`Completed on: ${dateStr}`, 105, 235, { align: "center" });
        doc.text(`Grading Status: ${(result.grading_status || 'completed').toUpperCase()}`, 105, 243, { align: "center" });
        doc.text(`Attempt Verification ID: ${submissionId}`, 105, 251, { align: "center" });

        // Save PDF
        doc.save(`quiz_result_${submissionId}.pdf`);
        setToast({ show: true, message: "Result exported as PDF!", type: "success" });
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-12 px-6 flex items-center justify-center relative overflow-hidden selection:bg-blue-100">
            <SEO 
                title={`${result?.user_name || 'Someone'}'s Scorecard`}
                description={`${result?.user_name || 'Someone'} scored ${result?.score} out of ${result?.max_score} points on the quiz "${result?.quiz_title || 'Quiz'}"! Check out the full breakdown and see if you can beat them.`}
                url={`/result/${submissionId}`}
            />
            {/* Background glowing gradients */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-xl w-full space-y-8 relative z-10">
                {/* Result Card */}
                <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.03)] bg-white border border-slate-100">
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
                        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[80%] bg-blue-500 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[80%] bg-emerald-500 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 space-y-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl border bg-yellow-50/50 border-yellow-200/60 text-yellow-500 mb-2 shadow-inner">
                                <Trophy size={48} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
                                Quiz Result
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900">
                                {result.grading_status === 'pending' ? '--' : `${percentage.toFixed(0)}%`}
                            </h1>
                            <p className={`font-black text-lg ${result.grading_status === 'pending' ? 'text-amber-500' : (isSuccess ? 'text-emerald-500' : 'text-rose-500')}`}>
                                {result.grading_status === 'pending' ? 'Grading in Progress' : (isSuccess ? 'Outstanding Performance!' : 'Good Effort!')}
                            </p>
                            {result.rank && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-full text-xs font-black uppercase tracking-wider mx-auto animate-pulse mt-2">
                                    <Trophy size={14} className="text-yellow-500 animate-bounce" />
                                    <span>Leaderboard Rank: #{result.rank} of {result.total_participants}</span>
                                </div>
                            )}
                        </div>

                        <div className="p-8 rounded-2xl flex flex-col gap-3 bg-slate-50 border border-slate-100">
                            {/* Platform badge */}
                            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider self-center mb-1">
                                <div className="w-4 h-4 rounded-md overflow-hidden flex items-center justify-center shrink-0 bg-blue-600 text-white">
                                    {settings.logo ? (
                                        <img src={`${STORAGE_URL}/${settings.logo}`} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <GraduationCap size={10} className="text-white" />
                                    )}
                                </div>
                                <span>{settings.site_name || "QuizSphere"}</span>
                            </div>

                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {result.user_id && result.user_role !== 'admin' && !result.is_anonymous ? (
                                    <Link to={`/profile/${result.user_id}`} className="hover:text-yellow-600 transition-colors underline decoration-dotted underline-offset-4 font-black">
                                        {result.user_name}
                                    </Link>
                                ) : (
                                    <span className="font-black text-slate-600">{result.user_name}</span>
                                )}{" "}
                                scored
                            </div>
                            <p className="text-xl font-extrabold text-slate-900">
                                {result.score} out of {result.max_score} objective points
                                {result.grading_status === 'pending' && (
                                    <span className="block text-[10px] text-amber-500 mt-1 uppercase tracking-wider">+ Short Answers Pending Review</span>
                                )}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-slate-400">
                                On Quiz:
                            </p>
                            <p className="text-lg font-black uppercase tracking-tight text-blue-600">
                                {result.quiz_title}
                            </p>

                            {result.quiz_creator_name && (
                                <div className="flex items-center gap-1.5 bg-white text-slate-600 border border-slate-200/60 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider self-center mt-2">
                                    <span className="text-slate-400">Maker:</span>
                                    <span className="text-slate-800 font-extrabold">{result.quiz_creator_name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Save & Export Result Option */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-center space-y-3">
                    <div className="space-y-0.5 text-left">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Save Result</h3>
                        <p className="text-xs text-slate-500">Download a physical copy of this scorecard.</p>
                    </div>
                    <div className="flex gap-2.5">
                        <button 
                            onClick={exportSingleAsText} 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 active:scale-95 shadow-md shadow-emerald-500/10 cursor-pointer"
                        >
                            <span>Export Text</span>
                        </button>
                        <button 
                            onClick={exportSingleAsPDF} 
                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 active:scale-95 shadow-md shadow-rose-500/10 cursor-pointer"
                        >
                            <span>Export PDF</span>
                        </button>
                    </div>
                </div>

                {/* Social Share Option */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-center space-y-4">
                    <div className="space-y-0.5 text-left">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Share Result</h3>
                        <p className="text-xs text-slate-500">Brag about your scorecard on social media.</p>
                    </div>
                    <div className="flex gap-3 items-center flex-wrap">
                        <button 
                            onClick={() => {
                                const rawUrl = result.share_url || result.frontend_url;
                                const url = getCleanUrl(rawUrl);
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                            }}
                            className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white border-[#1877F2]/20 hover:border-transparent active:scale-95 cursor-pointer"
                            title="Share to Facebook"
                        >
                            <FacebookIcon size={18} />
                        </button>
                        <button 
                            onClick={() => {
                                const rawUrl = result.share_url || result.frontend_url;
                                const url = getCleanUrl(rawUrl);
                                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                            }}
                            className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white border-[#0A66C2]/20 hover:border-transparent active:scale-95 cursor-pointer"
                            title="Share to LinkedIn"
                        >
                            <LinkedInIcon size={18} />
                        </button>
                        <button 
                            onClick={() => {
                                const rawUrl = result.share_url || result.frontend_url;
                                const url = getCleanUrl(rawUrl);
                                const text = `I just scored ${percentage.toFixed(0)}% on "${result.quiz_title}"! Can you beat my score?`;
                                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 bg-slate-50 text-slate-700 hover:bg-slate-950 hover:text-white border-slate-200/60 hover:border-transparent active:scale-95 cursor-pointer"
                            title="Share to X"
                        >
                            <XIcon size={18} />
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                        <button 
                            onClick={async () => {
                                try {
                                    const url = getCleanUrl(result.frontend_url);
                                    await navigator.clipboard.writeText(url);
                                    setToast({ show: true, message: "Link copied to clipboard!", type: "success" });
                                } catch {
                                    setToast({ show: true, message: "Copy failed", type: "error" });
                                }
                            }}
                            className="flex-1 py-3 bg-slate-50 border border-slate-200/60 hover:border-transparent hover:bg-emerald-600 text-slate-700 hover:text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Share2 size={14} /> Copy Direct Link
                        </button>
                    </div>
                </div>

                {/* Call to Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                        onClick={() => navigate("/quizzes")}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-3xl font-black uppercase tracking-widest text-xs transition-all group shadow-[0_10px_30px_rgba(0,0,0,0.01)]"
                    >
                        <div className="w-12 h-12 bg-slate-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-100">
                            <Sparkles size={20} />
                        </div>
                        Take a Quiz
                    </button>
                    
                    <button 
                        onClick={() => navigate("/")}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-3xl font-black uppercase tracking-widest text-xs transition-all group shadow-[0_10px_30px_rgba(0,0,0,0.01)]"
                    >
                        <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-100">
                            <Home size={20} />
                        </div>
                        Home Page
                    </button>
                </div>
            </div>

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );

    // Helpers
    function getCleanUrl(url) {
        if (!url) return window.location.href;
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) {
            targetUrl = `${window.location.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
        }
        if (targetUrl.includes('localhost')) {
            const urlObj = new URL(targetUrl);
            targetUrl = `${window.location.origin}${urlObj.pathname}${urlObj.search}`;
        }
        return targetUrl;
    }
}

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
