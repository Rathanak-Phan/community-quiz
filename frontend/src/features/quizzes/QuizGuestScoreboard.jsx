import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getPublicGuestAttempts, getQuizById, resetGuestAttempts } from "./services/quizService";
import { getSettings } from "../admin/services/settingService";
import { STORAGE_URL } from "../../config/api";
import { 
    Trophy, 
    Award, 
    Crown, 
    ArrowLeft, 
    Search, 
    Sparkles, 
    Share2,
    CheckCircle,
    RotateCcw,
    GraduationCap
} from "lucide-react";
import Toast from "../../components/ui/Toast";
import SEO from "../../components/common/SEO";

export default function QuizGuestScoreboard() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const challengeToken = searchParams.get("challenge");
    
    const [quiz, setQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [allChallengeTokens, setAllChallengeTokens] = useState([]);

    const formatDuration = (started, completed) => {
        if (!started || !completed) return null;
        const diff = Math.max(0, Math.floor((new Date(completed) - new Date(started)) / 1000));
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!quizId || quizId === 'undefined') return;
            try {
                const [quizRes, attemptsRes, settingsRes] = await Promise.all([
                    getQuizById(quizId, challengeToken),
                    getPublicGuestAttempts(quizId),
                    getSettings().catch(() => ({ data: {} }))
                ]);
                setQuiz(quizRes.data.data || quizRes.data);
                setSettings(settingsRes.data || {});
                
                // Get ONLY anonymous/guest attempts matching this specific challenge
                const allAttempts = attemptsRes.data.data || attemptsRes.data;
                
                // Extract unique challenge tokens from all attempts
                const tokens = [...new Set(allAttempts.map(att => att.challenge_token).filter(Boolean))];
                setAllChallengeTokens(tokens);

                // Auto-select latest challenge session if none is selected in URL
                let activeToken = challengeToken;
                if (!activeToken && tokens.length > 0) {
                    const latestWithToken = allAttempts
                        .filter(att => att.is_anonymous && att.challenge_token)
                        .sort((a, b) => new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at))[0];
                    
                    if (latestWithToken) {
                        activeToken = latestWithToken.challenge_token;
                        navigate(`/quizzes/${quizId}/scoreboard?challenge=${activeToken}`, { replace: true });
                        return;
                    }
                }

                const guestAttempts = allAttempts
                    .filter(att => att.is_anonymous && att.challenge_token === activeToken)
                    // Ensure the rank is correctly calculated on the guest pool
                    .sort((a, b) => {
                        // First tie-breaker: Score descending
                        if ((b.score || 0) !== (a.score || 0)) {
                            return (b.score || 0) - (a.score || 0);
                        }
                        // Second tie-breaker: Time taken duration ascending
                        const durationA = a.started_at && a.completed_at ? (new Date(a.completed_at) - new Date(a.started_at)) : Infinity;
                        const durationB = b.started_at && b.completed_at ? (new Date(b.completed_at) - new Date(b.started_at)) : Infinity;
                        if (durationA !== durationB) {
                            return durationA - durationB;
                        }
                        // Third fallback: completed_at ascending
                        return new Date(a.completed_at) - new Date(b.completed_at);
                    });
                
                setAttempts(guestAttempts);
            } catch (error) {
                console.error("Failed to load guest scoreboard:", error);
                setToast({ show: true, message: "Failed to load scoreboard data", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [quizId, challengeToken]);

    // Handle search query
    const filteredAttempts = attempts.filter(att => {
        const name = att.anonymous_name || "Anonymous Guest";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Extract Top 3 for Kahoot Podium
    const top3 = filteredAttempts.slice(0, 3);
    const runnerUps = filteredAttempts.slice(3);

    // Place podium candidates: [2nd, 1st, 3rd]
    const podiumData = [];
    if (top3[1]) podiumData.push({ ...top3[1], place: 2, color: 'from-slate-300 to-slate-400 border-slate-200 shadow-slate-300/30', height: 'h-48 md:h-56' });
    if (top3[0]) podiumData.push({ ...top3[0], place: 1, color: 'from-amber-400 to-yellow-500 border-amber-300 shadow-yellow-500/20', height: 'h-60 md:h-72' });
    if (top3[2]) podiumData.push({ ...top3[2], place: 3, color: 'from-amber-600 to-orange-700 border-amber-500 shadow-orange-600/30', height: 'h-40 md:h-44' });

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const isOwner = currentUser && quiz && (currentUser.id === quiz.created_by);
    const isAdmin = currentUser && currentUser.role && (currentUser.role.name === 'admin');
    const canReset = isOwner || isAdmin;

    const [confirmReset, setConfirmReset] = useState(false);
    const [resetting, setResetting] = useState(false);

    const handleReset = async () => {
        if (!confirmReset) {
            setConfirmReset(true);
            setTimeout(() => setConfirmReset(false), 5000);
            return;
        }

        setResetting(true);
        try {
            await resetGuestAttempts(quizId, challengeToken);
            setAttempts([]);
            setToast({ show: true, message: "Challenge scoreboard reset successfully!", type: "success" });
            setConfirmReset(false);
        } catch (error) {
            console.error("Failed to reset guest attempts:", error);
            setToast({ show: true, message: "Failed to reset scoreboard", type: "error" });
        } finally {
            setResetting(false);
        }
    };

    const exportAsText = () => {
        let content = `=== QUIZ CHALLENGE SCOREBOARD ===\n`;
        content += `Platform: ${settings.site_name || "QuizSphere"}\n`;
        content += `Quiz Title: ${quiz?.title || "Unknown Quiz"}\n`;
        if (quiz?.creator?.name) {
            content += `Quiz Maker (Sharer): ${quiz.creator.name}\n`;
        }
        if (challengeToken) {
            content += `Challenge Token: ${challengeToken}\n`;
        }
        content += `Export Date: ${new Date().toLocaleString()}\n`;
        content += `Total Challengers: ${attempts.length}\n`;
        content += `=====================================\n\n`;
        content += `Rank | Participant | Score | Max Score | Date\n`;
        content += `-------------------------------------------------\n`;
        attempts.forEach((attempt, index) => {
            const name = attempt.anonymous_name || "Anonymous Guest";
            const score = attempt.score || 0;
            const maxScore = attempt.max_score || 0;
            const rank = index + 1;
            const date = new Date(attempt.completed_at || attempt.created_at).toLocaleDateString();
            content += `#${rank} | ${name} | ${score} | ${maxScore} | ${date}\n`;
        });
        
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const filename = challengeToken 
            ? `quiz_${quizId}_challenge_${challengeToken}.txt`
            : `quiz_${quizId}_scoreboard.txt`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ show: true, message: "Scoreboard exported as Text!", type: "success" });
    };

    const exportAsPDF = async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        
        // 1. Draw Platform Logo Badge
        doc.setFillColor(37, 99, 235); // blue-600
        doc.roundedRect(14, 12, 12, 12, 3, 3, "F");

        // Draw a stylized graduation cap inside the logo badge
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.6);
        doc.line(16, 17, 20, 15);
        doc.line(20, 15, 24, 17);
        doc.line(24, 17, 20, 19);
        doc.line(20, 19, 16, 17);
        doc.line(18, 18.5, 18, 20);
        doc.line(18, 20, 22, 20);
        doc.line(22, 20, 22, 18.5);
        doc.line(20, 17, 24.5, 19.5);

        // Platform Name next to badge
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(settings.site_name || "QuizSphere", 29, 21);

        // Subtle header separator line
        doc.setDrawColor(241, 245, 249); // slate-100
        doc.setLineWidth(0.5);
        doc.line(14, 28, 196, 28);

        // Add Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("Quiz Challenge Scoreboard", 14, 40);
        
        // --- 2. Beautiful Metadata Card ---
        doc.setFillColor(248, 250, 252); // slate-50
        doc.roundedRect(14, 47, 182, 28, 3, 3, "F");
        doc.setFillColor(37, 99, 235); // Left accent stripe (blue)
        doc.rect(14, 47, 2, 28, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("QUIZ DETAILS", 20, 53);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105); // slate-600
        doc.text(`Quiz Title: ${quiz?.title || "Unknown Quiz"}`, 20, 59);
        if (quiz?.creator?.name) {
            doc.text(`Quiz Maker (Sharer): ${quiz.creator.name}`, 20, 64);
        }
        if (challengeToken) {
            doc.text(`Challenge Session: ${challengeToken}`, 20, 69);
        } else {
            doc.text(`Challenge Session: Global Arena`, 20, 69);
        }

        // Export Date right-aligned inside Metadata card
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Exported: ${new Date().toLocaleString()}`, 190, 53, { align: "right" });

        // --- 3. Dashboard Stat KPI Widgets (Three side-by-side cards) ---
        const startY = 82;
        const cardW = 57;
        const cardH = 20;

        // Stat Card 1: Total Participants
        doc.setFillColor(241, 245, 249); // slate-100
        doc.roundedRect(14, startY, cardW, cardH, 2.5, 2.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("TOTAL CHALLENGERS", 18, startY + 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(`${attempts.length}`, 18, startY + 14);

        // Stat Card 2: Average Accuracy
        const avgAccuracy = attempts.length > 0 
            ? Math.round(attempts.reduce((acc, curr) => acc + (curr.score / curr.max_score || 0), 0) / attempts.length * 100)
            : 0;
        doc.setFillColor(239, 246, 255); // blue-50
        doc.roundedRect(14 + cardW + 5, startY, cardW, cardH, 2.5, 2.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(37, 99, 235); // blue-600
        doc.text("AVERAGE ACCURACY", 14 + cardW + 9, startY + 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(29, 78, 216); // blue-700
        doc.text(`${avgAccuracy}%`, 14 + cardW + 9, startY + 14);

        // Stat Card 3: Top Performance
        const topScoreText = attempts.length > 0 
            ? `${attempts[0].score} / ${attempts[0].max_score}`
            : "0 / 0";
        doc.setFillColor(254, 252, 232); // yellow-50
        doc.roundedRect(14 + (cardW * 2) + 10, startY, cardW, cardH, 2.5, 2.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(161, 98, 7); // yellow-700
        doc.text("TOP SCORE RECORD", 14 + (cardW * 2) + 14, startY + 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(133, 77, 14); // yellow-800
        doc.text(topScoreText, 14 + (cardW * 2) + 14, startY + 14);

        // --- 4. Premium Modern Leaderboard Table ---
        let y = 110;
        
        // Table Header
        doc.setFillColor(30, 41, 59); // slate-800 (slate-900 like)
        doc.rect(14, y, 182, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("RANK", 18, y + 6.5);
        doc.text("CHALLENGER NAME", 40, y + 6.5);
        doc.text("SCORE", 120, y + 6.5);
        doc.text("ACCURACY", 150, y + 6.5);
        doc.text("DATE", 175, y + 6.5);
        
        y += 10;
        doc.setFont("helvetica", "normal");
        
        attempts.forEach((attempt, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
                
                // Redraw table headers on new page
                doc.setFillColor(30, 41, 59);
                doc.rect(14, y, 182, 10, "F");
                doc.setTextColor(255, 255, 255);
                doc.setFont("helvetica", "bold");
                doc.text("RANK", 18, y + 6.5);
                doc.text("CHALLENGER NAME", 40, y + 6.5);
                doc.text("SCORE", 120, y + 6.5);
                doc.text("ACCURACY", 150, y + 6.5);
                doc.text("DATE", 175, y + 6.5);
                y += 10;
            }
            
            const name = attempt.anonymous_name || "Anonymous Guest";
            const score = attempt.score || 0;
            const maxScore = attempt.max_score || 0;
            const pct = Math.round((score / maxScore || 0) * 100);
            const rank = index + 1;
            const date = new Date(attempt.completed_at || attempt.created_at).toLocaleDateString();
            
            // Alternating striped row backgrounds
            if (rank % 2 === 1) {
                doc.setFillColor(248, 250, 252); // slate-50
            } else {
                doc.setFillColor(255, 255, 255);
            }
            doc.rect(14, y, 182, 10, "F");

            // Subtle bottom line for each row
            doc.setDrawColor(241, 245, 249);
            doc.setLineWidth(0.4);
            doc.line(14, y + 10, 196, y + 10);

            // Draw Rank badge for top 3, normal text for rest
            if (rank === 1) {
                doc.setFillColor(254, 240, 138); // Yellow-200 (Gold)
                doc.roundedRect(17, y + 2, 10, 6, 1.5, 1.5, "F");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(133, 77, 14); // Gold text
                doc.text(`#${rank}`, 22, y + 6.2, { align: "center" });
            } else if (rank === 2) {
                doc.setFillColor(241, 245, 249); // Slate-100 (Silver)
                doc.roundedRect(17, y + 2, 10, 6, 1.5, 1.5, "F");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(71, 85, 105); // Silver text
                doc.text(`#${rank}`, 22, y + 6.2, { align: "center" });
            } else if (rank === 3) {
                doc.setFillColor(255, 237, 213); // Orange-100 (Bronze)
                doc.roundedRect(17, y + 2, 10, 6, 1.5, 1.5, "F");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(194, 65, 12); // Bronze text
                doc.text(`#${rank}`, 22, y + 6.2, { align: "center" });
            } else {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setTextColor(100, 116, 139);
                doc.text(`#${rank}`, 22, y + 6.5, { align: "center" });
            }

            // Draw text columns
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(15, 23, 42); // slate-900
            doc.text(name, 40, y + 6.5);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105);
            doc.text(`${score} / ${maxScore}`, 120, y + 6.5);
            
            // Draw Accuracy pill badge
            if (pct >= 80) {
                doc.setFillColor(220, 252, 231); // green-100
                doc.setTextColor(21, 128, 61); // green-700
            } else if (pct >= 50) {
                doc.setFillColor(254, 243, 199); // amber-100
                doc.setTextColor(180, 83, 9); // amber-700
            } else {
                doc.setFillColor(254, 226, 226); // red-100
                doc.setTextColor(185, 28, 28); // red-700
            }
            doc.roundedRect(149, y + 2, 14, 6, 1.5, 1.5, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.text(`${pct}%`, 156, y + 6.2, { align: "center" });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(100, 116, 139);
            doc.text(date, 175, y + 6.5);
            
            y += 10;
        });
        
        const filename = challengeToken 
            ? `quiz_${quizId}_challenge_${challengeToken}.pdf`
            : `quiz_${quizId}_scoreboard.pdf`;
        doc.save(filename);
        setToast({ show: true, message: "Scoreboard exported as PDF!", type: "success" });
    };

    const handleShare = () => {
        const shareUrl = window.location.href;
        navigator.clipboard.writeText(shareUrl);
        setToast({ show: true, message: "Scoreboard link copied to clipboard!", type: "success" });
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10 pb-20 text-slate-800">
            <SEO 
                title={`Guest Leaderboard: ${quiz?.title || 'Quiz'}`}
                description={`Live guest scoreboard and podium results for the quiz "${quiz?.title || 'Quiz'}" on QuizSphere. Challenge session: ${challengeToken || 'Global'}.`}
                url={`/quizzes/${quizId}/scoreboard${challengeToken ? `?challenge=${challengeToken}` : ''}`}
            />
            {/* Header */}
            <div className="max-w-6xl mx-auto px-6 pt-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="space-y-3">
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-500 font-black hover:text-blue-600 transition-colors group text-xs tracking-widest"
                        >
                            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                            BACK TO QUIZ DETAILS
                        </button>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 flex flex-wrap items-center gap-3">
                            Guest <span className="text-blue-600">Scoreboard.</span>
                            {challengeToken && (
                                <span className="text-xs px-3 py-1.5 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-xl font-black uppercase tracking-wider">
                                    Challenge: {challengeToken}
                                </span>
                            )}
                            <Sparkles className="text-yellow-500 animate-pulse" size={28} />
                        </h1>
                        <div className="flex flex-col gap-3 mt-2">
                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                                <span>Live results for:</span>
                                <span className="text-slate-900 font-extrabold bg-slate-100 px-3 py-1 rounded-lg">{quiz?.title}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
                                    <div className="w-4 h-4 rounded-md overflow-hidden flex items-center justify-center shrink-0 bg-blue-600 text-white">
                                        {settings.logo ? (
                                            <img src={`${STORAGE_URL}/${settings.logo}`} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <GraduationCap size={10} className="text-white" />
                                        )}
                                    </div>
                                    <span>{settings.site_name || "QuizSphere"}</span>
                                </div>

                                {quiz?.creator?.name && (
                                    <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider">
                                        <span className="text-slate-400">Maker:</span>
                                        <span className="text-slate-900 font-extrabold">{quiz.creator.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {canReset && (
                            <button 
                                onClick={handleReset}
                                disabled={resetting}
                                className={`flex-1 md:flex-none px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                                    confirmReset 
                                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-950/20" 
                                        : "bg-red-600 hover:bg-red-700 text-white shadow-red-950/20"
                                }`}
                            >
                                <RotateCcw size={16} className={resetting ? "animate-spin" : ""} />
                                {resetting ? "Resetting..." : confirmReset ? "Confirm Reset?" : "Reset Session"}
                            </button>
                        )}
                        <button 
                            onClick={exportAsText}
                            className="flex-1 md:flex-none px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer"
                        >
                            Export Text
                        </button>
                        <button 
                            onClick={exportAsPDF}
                            className="flex-1 md:flex-none px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 cursor-pointer"
                        >
                            Export PDF
                        </button>
                        <button 
                            onClick={handleShare}
                            className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                        >
                            <Share2 size={16} /> Share Leaderboard
                        </button>
                    </div>
                </div>

                {/* Kahoot-Style Podium Section */}
                {podiumData.length > 0 ? (
                    <div className="mb-20">
                        <div className="flex flex-col items-center justify-center">
                            <div className="flex items-end justify-center w-full max-w-3xl gap-4 md:gap-8 pt-10 px-4">
                                {podiumData.map((candidate, idx) => (
                                    <div 
                                        key={candidate.id} 
                                        className={`flex flex-col items-center flex-1 transition-all duration-1000 transform hover:-translate-y-2`}
                                        style={{ order: candidate.place === 2 ? 1 : candidate.place === 1 ? 2 : 3 }}
                                    >
                                        {/* Place Medal / Avatar */}
                                        <div className="flex flex-col items-center mb-4 relative">
                                            {candidate.place === 1 && (
                                                <Crown className="text-yellow-400 animate-bounce absolute -top-8 w-10 h-10 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                            )}
                                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 relative shadow-lg overflow-hidden bg-slate-50 ${
                                                candidate.place === 1 ? 'border-yellow-400' :
                                                candidate.place === 2 ? 'border-slate-300' :
                                                'border-amber-600'
                                            }`}>
                                                <img 
                                                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(candidate.anonymous_name || "Guest")}`} 
                                                    alt="Challenger Avatar" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className={`absolute -bottom-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                                                candidate.place === 1 ? 'bg-yellow-400 text-slate-950' :
                                                candidate.place === 2 ? 'bg-slate-300 text-slate-950' :
                                                'bg-amber-600 text-white'
                                            }`}>
                                                {candidate.place === 1 ? '1ST' : candidate.place === 2 ? '2ND' : '3RD'}
                                            </div>
                                        </div>

                                        {/* Podium Block */}
                                        <div className={`w-full bg-gradient-to-b ${candidate.color} border rounded-t-3xl flex flex-col justify-between p-4 md:p-6 shadow-2xl ${candidate.height}`}>
                                            <div className="text-center">
                                                <p className="font-black text-xs md:text-sm text-slate-950 truncate max-w-full drop-shadow-sm mb-1 uppercase tracking-wider">
                                                    {candidate.anonymous_name}
                                                </p>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <p className="font-extrabold text-sm md:text-lg text-slate-950/85">
                                                        {candidate.score} <span className="text-xs">/ {candidate.max_score}</span>
                                                    </p>
                                                    {candidate.started_at && candidate.completed_at && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 text-slate-950/70 border border-white/10 shadow-sm mt-0.5">
                                                            ⏱️ {formatDuration(candidate.started_at, candidate.completed_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-center items-center">
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-slate-950 text-lg md:text-2xl shadow-inner">
                                                    {candidate.place}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200/60 max-w-3xl mx-auto mb-10">
                        <Trophy size={48} className="text-slate-400 mx-auto mb-4" />
                        <h3 className="font-bold text-lg text-slate-900 uppercase tracking-wider mb-1">Scoreboard Empty</h3>
                        <p className="text-slate-500 text-sm">Guest results will appear here as soon as they complete the quiz!</p>
                    </div>
                )}

                {/* Scoreboard List search & leaderboard */}
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search guest participant..." 
                                className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 transition-all text-sm font-semibold text-slate-900 shadow-inner"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        {allChallengeTokens.length > 0 && (
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3.5 rounded-2xl border border-slate-200/60 shadow-inner w-full sm:w-auto">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Session:</span>
                                <select
                                    value={challengeToken || ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val) {
                                            navigate(`/quizzes/${quizId}/scoreboard?challenge=${val}`);
                                        } else {
                                            navigate(`/quizzes/${quizId}/scoreboard`);
                                        }
                                    }}
                                    className="text-xs font-black text-slate-700 bg-transparent border-none outline-none cursor-pointer uppercase tracking-wider w-full sm:w-auto"
                                >
                                    <option value="">Global Arena (No Challenge)</option>
                                    {allChallengeTokens.map(token => (
                                        <option key={token} value={token}>{token}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Runner ups scroll view */}
                    <div className="space-y-3">
                        {runnerUps.length > 0 ? runnerUps.map((attempt, index) => {
                            const name = attempt.anonymous_name || "Anonymous Guest";
                            const score = attempt.score || 0;
                            const maxScore = attempt.max_score || 0;
                            const pct = Math.round((score / maxScore || 0) * 100);
                            const rank = index + 4; // Start from 4 since Top 3 are on podium
                            const date = new Date(attempt.completed_at).toLocaleDateString();

                            return (
                                <div 
                                    key={attempt.id} 
                                    className="flex items-center justify-between p-4 bg-white border border-slate-200/60 hover:border-slate-300 rounded-2xl transition-all shadow-sm group"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:text-blue-600 transition-colors border border-slate-100 shrink-0">
                                            #{rank}
                                        </div>
                                        {/* Dynamic Avatar */}
                                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                                            <img 
                                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`} 
                                                alt="Challenger Avatar" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-wider">
                                                {name}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                Completed on {date}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-black text-sm text-slate-900">
                                                {score} <span className="text-xs text-slate-400">/ {maxScore}</span>
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5 justify-end">
                                                <span>{pct}% Accuracy</span>
                                                {attempt.started_at && attempt.completed_at && (
                                                    <>
                                                        <span className="text-slate-200">•</span>
                                                        <span className="inline-flex items-center gap-0.5">⏱️ {formatDuration(attempt.started_at, attempt.completed_at)}</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        
                                        {/* Complete Check icon */}
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                                            <CheckCircle size={16} />
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            filteredAttempts.length <= 3 && filteredAttempts.length > 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200/60">
                                    <Award size={32} className="text-slate-400 mx-auto mb-2" />
                                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">All Guest Candidates are on the Podium!</p>
                                </div>
                            ) : null
                        )}
                    </div>
                </div>
            </div>

            {toast.show && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ ...toast, show: false })} 
                />
            )}
        </div>
    );
}
