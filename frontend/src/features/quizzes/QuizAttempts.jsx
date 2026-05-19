import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizAttempts, getQuizById } from "./services/quizService";
import { getSettings } from "../admin/services/settingService";
import { STORAGE_URL } from "../../config/api";
import { 
    Users, 
    ChevronRight, 
    Clock, 
    Trophy, 
    Search, 
    ArrowLeft, 
    Filter,
    Calendar,
    Eye,
    ShieldOff,
    User,
    GraduationCap
} from "lucide-react";
import Toast from "../../components/ui/Toast";
import SEO from "../../components/common/SEO";
import UserAvatar from "../../components/ui/UserAvatar";

export default function QuizAttempts() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all"); // all, public, anonymous
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const exportAsText = () => {
        let content = `=== QUIZ ATTEMPTS REPORT ===\n`;
        content += `Platform: ${settings.site_name || "QuizSphere"}\n`;
        content += `Quiz Title: ${quiz?.title || "Unknown Quiz"}\n`;
        if (quiz?.creator?.name) {
            content += `Quiz Maker (Sharer): ${quiz.creator.name}\n`;
        }
        content += `Export Date: ${new Date().toLocaleString()}\n`;
        content += `Filter Applied: ${filter.toUpperCase()}\n`;
        content += `Total Attempts: ${filteredAttempts.length}\n`;
        content += `Average Score: ${filteredAttempts.length > 0 
            ? Math.round(filteredAttempts.reduce((acc, curr) => acc + (curr.score / curr.max_score || 0), 0) / filteredAttempts.length * 100)
            : 0}%\n`;
        content += `=====================================\n\n`;
        content += `Participant | Score | Max Score | Status | Date\n`;
        content += `-------------------------------------------------\n`;
        filteredAttempts.forEach(attempt => {
            const name = attempt.user?.name || attempt.anonymous_name || "Anonymous User";
            const score = attempt.score || 0;
            const maxScore = attempt.max_score;
            const status = attempt.grading_status;
            const date = new Date(attempt.completed_at).toLocaleDateString();
            content += `${name} | ${score} | ${maxScore} | ${status} | ${date}\n`;
        });
        
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `quiz_attempts_${quizId}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ show: true, message: "Exported as Text successfully!", type: "success" });
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
        doc.text("Quiz Attempts Report", 14, 40);
        
        // --- 2. Beautiful Metadata Card ---
        doc.setFillColor(248, 250, 252); // slate-50
        doc.roundedRect(14, 47, 182, 28, 3, 3, "F");
        doc.setFillColor(37, 99, 235); // Left accent stripe (blue)
        doc.rect(14, 47, 2, 28, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("REPORT DETAILS", 20, 53);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105); // slate-600
        doc.text(`Quiz Title: ${quiz?.title || "Unknown Quiz"}`, 20, 59);
        if (quiz?.creator?.name) {
            doc.text(`Quiz Maker (Sharer): ${quiz.creator.name}`, 20, 64);
        }
        doc.text(`Filter Applied: ${filter.toUpperCase()}`, 20, 69);

        // Export Date right-aligned inside Metadata card
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Exported: ${new Date().toLocaleString()}`, 190, 53, { align: "right" });

        // --- 3. Dashboard Stat KPI Widgets (Three side-by-side cards) ---
        const startY = 82;
        const cardW = 57;
        const cardH = 20;

        // Stat Card 1: Total Attempts
        doc.setFillColor(241, 245, 249); // slate-100
        doc.roundedRect(14, startY, cardW, cardH, 2.5, 2.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("TOTAL ATTEMPTS", 18, startY + 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(`${filteredAttempts.length}`, 18, startY + 14);

        // Stat Card 2: Average Score percentage
        const avgScore = filteredAttempts.length > 0 
            ? Math.round(filteredAttempts.reduce((acc, curr) => acc + (curr.score / curr.max_score || 0), 0) / filteredAttempts.length * 100)
            : 0;
        doc.setFillColor(239, 246, 255); // blue-50
        doc.roundedRect(14 + cardW + 5, startY, cardW, cardH, 2.5, 2.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(37, 99, 235); // blue-600
        doc.text("AVERAGE SCORE", 14 + cardW + 9, startY + 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(29, 78, 216); // blue-700
        doc.text(`${avgScore}%`, 14 + cardW + 9, startY + 14);

        // Stat Card 3: Top score record obtained
        const highestScore = filteredAttempts.length > 0
            ? Math.max(...filteredAttempts.map(att => att.score || 0))
            : 0;
        const maxScoreValue = filteredAttempts[0]?.max_score || 0;
        doc.setFillColor(254, 252, 232); // yellow-50
        doc.roundedRect(14 + (cardW * 2) + 10, startY, cardW, cardH, 2.5, 2.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(161, 98, 7); // yellow-700
        doc.text("HIGHEST SCORE OBTAINED", 14 + (cardW * 2) + 14, startY + 6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(133, 77, 14); // yellow-800
        doc.text(`${highestScore} / ${maxScoreValue}`, 14 + (cardW * 2) + 14, startY + 14);

        // --- 4. Premium Modern List Table ---
        let y = 110;
        
        // Table Header
        doc.setFillColor(30, 41, 59); // slate-800
        doc.rect(14, y, 182, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        
        const headers = ["PARTICIPANT", "SCORE", "MAX", "ACCURACY", "STATUS", "DATE"];
        const colPositions = [18, 64, 84, 109, 134, 164];
        
        headers.forEach((header, index) => {
             doc.text(header, colPositions[index], y + 6.5);
        });
        
        y += 10;
        doc.setFont("helvetica", "normal");
        
        filteredAttempts.forEach((attempt, index) => {
             // Handle pagination
             if (y > 270) {
                 doc.addPage();
                 y = 20;
                 
                 // Headers again
                 doc.setFillColor(30, 41, 59);
                 doc.rect(14, y, 182, 10, "F");
                 doc.setTextColor(255, 255, 255);
                 doc.setFont("helvetica", "bold");
                 headers.forEach((header, idx) => {
                     doc.text(header, colPositions[idx], y + 6.5);
                 });
                 y += 10;
                 doc.setFont("helvetica", "normal");
             }
             
             const name = attempt.user?.name || attempt.anonymous_name || "Anonymous User";
             const score = String(attempt.score || 0);
             const maxScore = String(attempt.max_score);
             const pctNum = Math.round((attempt.score / attempt.max_score || 0) * 100);
             const pct = `${pctNum}%`;
             const status = attempt.grading_status;
             const date = new Date(attempt.completed_at).toLocaleDateString();
             
             // Striped rows
             if ((index + 1) % 2 === 1) {
                 doc.setFillColor(248, 250, 252);
             } else {
                 doc.setFillColor(255, 255, 255);
             }
             doc.rect(14, y, 182, 10, "F");

             // Subtle line
             doc.setDrawColor(241, 245, 249);
             doc.setLineWidth(0.4);
             doc.line(14, y + 10, 196, y + 10);

             doc.setFont("helvetica", "bold");
             doc.setFontSize(9.5);
             doc.setTextColor(15, 23, 42); // slate-900
             doc.text(name, colPositions[0], y + 6.5);
             
             doc.setFont("helvetica", "normal");
             doc.setFontSize(9);
             doc.setTextColor(71, 85, 105);
             doc.text(score, colPositions[1], y + 6.5);
             doc.text(maxScore, colPositions[2], y + 6.5);
             
             // Draw Accuracy pill badge
             if (pctNum >= 80) {
                 doc.setFillColor(220, 252, 231); // green-100
                 doc.setTextColor(21, 128, 61); // green-700
             } else if (pctNum >= 50) {
                 doc.setFillColor(254, 243, 199); // amber-100
                 doc.setTextColor(180, 83, 9); // amber-700
             } else {
                 doc.setFillColor(254, 226, 226); // red-100
                 doc.setTextColor(185, 28, 28); // red-700
             }
             doc.roundedRect(colPositions[3] - 1, y + 2, 13, 6, 1.5, 1.5, "F");
             doc.setFont("helvetica", "bold");
             doc.setFontSize(7.5);
             doc.text(pct, colPositions[3] + 5.5, y + 6.2, { align: "center" });

             // Draw Status Badge
             doc.setFont("helvetica", "bold");
             doc.setFontSize(8);
             if (status === "graded") {
                 doc.setFillColor(220, 252, 231); // green-100
                 doc.setTextColor(21, 128, 61); // green-700
                 doc.roundedRect(colPositions[4] - 1, y + 2, 16, 6, 1.5, 1.5, "F");
                 doc.text("GRADED", colPositions[4] + 7, y + 6.2, { align: "center" });
             } else {
                 doc.setFillColor(254, 243, 199); // amber-100
                 doc.setTextColor(180, 83, 9); // amber-700
                 doc.roundedRect(colPositions[4] - 1, y + 2, 16, 6, 1.5, 1.5, "F");
                 doc.text("PENDING", colPositions[4] + 7, y + 6.2, { align: "center" });
             }
             
             doc.setFont("helvetica", "normal");
             doc.setFontSize(8.5);
             doc.setTextColor(100, 116, 139);
             doc.text(date, colPositions[5], y + 6.5);
             
             y += 10;
        });
        
        doc.save(`quiz_attempts_${quizId}.pdf`);
        setToast({ show: true, message: "Exported as PDF successfully!", type: "success" });
    };

    const exportSingleGuestAsText = (attempt) => {
        const name = attempt.anonymous_name || "Guest User";
        const score = attempt.score || 0;
        const maxScore = attempt.max_score || 0;
        const pct = Math.round((score / maxScore || 0) * 100);
        const rank = attempt.rank || 1;
        const total = attempt.total_participants || 1;
        const date = new Date(attempt.completed_at).toLocaleDateString();

        let content = `=== QUIZ COMPLETION CERTIFICATE ===\n\n`;
        content += `Platform: ${settings.site_name || "QuizSphere"}\n`;
        if (quiz?.creator?.name) {
            content += `Quiz Maker (Sharer): ${quiz.creator.name}\n`;
        }
        content += `------------------------------------\n`;
        content += `This certifies that\n`;
        content += `      ${name.toUpperCase()}\n\n`;
        content += `has successfully completed the quiz:\n`;
        content += `      "${quiz?.title || "Unknown Quiz"}"\n\n`;
        content += `------------------------------------\n`;
        content += `Score: ${score} / ${maxScore} (${pct}%)\n`;
        content += `Leaderboard Rank: #${rank} of ${total} Guests\n`;
        content += `Completion Date: ${date}\n`;
        content += `Grading Status: ${attempt.grading_status.toUpperCase()}\n`;
        content += `------------------------------------\n`;
        content += `Verified on: ${new Date().toLocaleString()}\n`;

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `quiz_result_${name.replace(/\s+/g, "_")}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ show: true, message: `Exported ${name}'s result as Text successfully!`, type: "success" });
    };

    const exportSingleGuestAsPDF = async (attempt) => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        const name = attempt.anonymous_name || "Guest User";
        const score = attempt.score || 0;
        const maxScore = attempt.max_score || 0;
        const pct = Math.round((score / maxScore || 0) * 100);
        const rank = attempt.rank || 1;
        const total = attempt.total_participants || 1;
        const date = new Date(attempt.completed_at).toLocaleDateString();

        // 1. Draw border frame
        doc.setLineWidth(1.2);
        doc.setDrawColor(30, 41, 59); // slate-800
        doc.rect(10, 10, 190, 277);
        
        doc.setLineWidth(0.6);
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.rect(13, 13, 184, 271);

        // Corner Accent Gold Decorations
        doc.setDrawColor(234, 179, 8); // yellow-500 (Gold)
        doc.setLineWidth(1.6);
        // Top-Left corner accent
        doc.line(13, 23, 13, 13);
        doc.line(13, 13, 23, 13);
        // Top-Right corner accent
        doc.line(197, 23, 197, 13);
        doc.line(197, 13, 187, 13);
        // Bottom-Left corner accent
        doc.line(13, 274, 13, 284);
        doc.line(13, 284, 23, 284);
        // Bottom-Right corner accent
        doc.line(197, 274, 197, 284);
        doc.line(197, 284, 187, 284);

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

        // 2. Header Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.setTextColor(37, 99, 235); // blue-600
        doc.text("CERTIFICATE OF COMPLETION", 105, 54, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139); // slate-505
        doc.text("This is proudly presented to", 105, 75, { align: "center" });

        // 3. Candidate Name
        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(name, 105, 95, { align: "center" });

        // Underline Name
        doc.setLineWidth(1);
        doc.setDrawColor(37, 99, 235);
        doc.line(45, 102, 165, 102);

        // 4. Achievement Description
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);
        doc.text("for outstanding achievement in completing the quiz", 105, 118, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text(`"${quiz?.title || "Unknown Quiz"}"`, 105, 131, { align: "center" });

        if (quiz?.creator?.name) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Quiz Maker (Sharer): ${quiz.creator.name}`, 105, 139, { align: "center" });
        }

        // 5. Performance Card
        doc.setFillColor(248, 250, 252); // slate-50
        doc.roundedRect(40, 148, 130, 60, 5, 5, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(71, 85, 105); // slate-600
        doc.text("SCORE DETAILS", 105, 161, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.text(`Score Obtained: ${score} / ${maxScore} (${pct}%)`, 50, 178);
        doc.text(`Leaderboard Rank: #${rank} of ${total} Guest attempts`, 50, 188);
        doc.text(`Grading Status: ${attempt.grading_status.toUpperCase()}`, 50, 198);

        // 6. Signature / Footer
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Date Completed: ${date}`, 50, 245);
        doc.text(`Verification ID: SUB-${attempt.id}`, 50, 252);

        doc.setLineWidth(0.5);
        doc.setDrawColor(203, 213, 225);
        doc.line(130, 243, 175, 243);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text("QUIZ ADMINISTRATOR", 152, 250, { align: "center" });

        doc.save(`quiz_certificate_${name.replace(/\s+/g, "_")}.pdf`);
        setToast({ show: true, message: `Exported ${name}'s Certificate as PDF successfully!`, type: "success" });
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!quizId || quizId === 'undefined') return;
            try {
                const [quizRes, attemptsRes, settingsRes] = await Promise.all([
                    getQuizById(quizId),
                    getQuizAttempts(quizId),
                    getSettings().catch(() => ({ data: {} }))
                ]);
                setQuiz(quizRes.data.data || quizRes.data);
                setAttempts(attemptsRes.data.data || attemptsRes.data);
                setSettings(settingsRes.data || {});
            } catch (error) {
                console.error("Failed to load attempts:", error);
                setToast({ show: true, message: "Failed to load attempts data", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [quizId]);

    const filteredAttempts = attempts.filter(attempt => {
        const name = attempt.user?.name || attempt.anonymous_name || "Anonymous User";
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === "all" || 
                            (filter === "public" && !attempt.is_anonymous) || 
                            (filter === "anonymous" && attempt.is_anonymous);
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            <SEO 
                title={`Attempts Dashboard: ${quiz?.title || 'Quiz'}`}
                description={`Track and analyze participant score performance, grading reviews, certificates, and leaderboard attempts for the quiz "${quiz?.title || 'Quiz'}" on QuizSphere.`}
                url={`/quizzes/${quizId}/attempts`}
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors mb-4 group"
                    >
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        BACK TO QUIZZES
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Quiz <span className="text-blue-600">Attempts.</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-lg">
                        Viewing results for: <span className="text-slate-900 font-bold">{quiz?.title}</span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => navigate(`/quizzes/${quizId}/scoreboard`)}
                            className="flex-1 px-5 py-3.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-yellow-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <Trophy size={14} /> Guest Podium
                        </button>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm shrink-0">
                        <div className="px-6 py-3 border-r border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-xl font-black text-slate-900">{filteredAttempts.length}</p>
                        </div>
                        <div className="px-6 py-3 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Score</p>
                            <p className="text-xl font-black text-blue-600">
                                {filteredAttempts.length > 0 
                                    ? Math.round(filteredAttempts.reduce((acc, curr) => acc + (curr.score / curr.max_score || 0), 0) / filteredAttempts.length * 100)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by participant name..." 
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-full outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 p-1.5 bg-slate-50 rounded-xl shrink-0">
                    {['all', 'public', 'anonymous'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === f 
                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Attempts Table/List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Participant</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Score</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Completed At</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAttempts.length > 0 ? filteredAttempts.map((attempt) => (
                                <tr key={attempt.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            {!attempt.is_anonymous ? (
                                                <UserAvatar 
                                                    user={attempt.user} 
                                                    size="md" 
                                                    className="rounded-xl border border-blue-100 shadow-sm" 
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
                                                    <img 
                                                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(attempt.anonymous_name || "Guest")}`} 
                                                        alt="Challenger Avatar" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-slate-900 leading-tight">
                                                        {attempt.user?.name || attempt.anonymous_name || "Anonymous User"}
                                                    </p>
                                                    {attempt.rank && (
                                                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border ${
                                                            attempt.is_anonymous 
                                                            ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                                        }`}>
                                                            #{attempt.rank}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {attempt.is_anonymous ? "Shared Quiz Attempt (No Account)" : "Registered User Attempt"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black text-slate-900">{attempt.score || 0}</span>
                                                <span className="text-slate-300 font-bold">/</span>
                                                <span className="text-sm font-bold text-slate-400">{attempt.max_score}</span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${
                                                        (attempt.score / attempt.max_score) >= 0.5 ? 'bg-emerald-500' : 'bg-rose-500'
                                                    }`}
                                                    style={{ width: `${(attempt.score / attempt.max_score) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                            attempt.grading_status === 'graded' 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {attempt.grading_status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                                            <Calendar size={14} className="text-slate-300" />
                                            {new Date(attempt.completed_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {attempt.is_anonymous ? (
                                            <div className="flex items-center justify-end">
                                                <button 
                                                    onClick={() => navigate(`/reviews/${attempt.id}`)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-md shadow-slate-900/10 hover:shadow-blue-600/20 cursor-pointer"
                                                >
                                                    <Eye size={12} /> Review
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => navigate(`/reviews/${attempt.id}`)}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 cursor-pointer"
                                            >
                                                <Eye size={14} /> Review & Grade
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200">
                                                <Users size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-900 uppercase">No attempts found</p>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Share your quiz to get results</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
