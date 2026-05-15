import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ClipboardCheck, Clock, BookOpen, ChevronRight, 
  Play, Award, Search, Layout, Filter, Calendar,
  TrendingUp, Star, Zap, Trash2
} from "lucide-react";
import api from "../../config/api";
import Toast from "../../components/ui/Toast";

export default function MyActivity() {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [rankData, setRankData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("completed"); // "completed" or "in_progress"
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const loadActivity = useCallback(async () => {
        setLoading(true);
        try {
            const [attemptsRes, submissionsRes, rankRes] = await Promise.all([
                api.get("/my-attempts"),
                api.get("/my-submissions"),
                api.get("/leaderboard/my-rank")
            ]);
            setAttempts(attemptsRes.data?.data || []);
            setSubmissions(submissionsRes.data?.data || []);
            setRankData(rankRes.data?.data || null);
        } catch (error) {
            console.error("Failed to load activity", error);
            setToast({ show: true, message: "Failed to load activity", type: "error" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadActivity();
    }, [loadActivity]);

    const stats = useMemo(() => {
        if (!submissions.length) return { avgScore: 0, total: 0, bestScore: 0 };
        const total = submissions.length;
        const sum = submissions.reduce((acc, curr) => acc + (curr.score / curr.max_score), 0);
        const best = Math.max(...submissions.map(s => (s.score / s.max_score)));
        return {
            avgScore: Math.round((sum / total) * 100),
            total,
            bestScore: Math.round(best * 100)
        };
    }, [submissions]);

    const filteredList = useMemo(() => {
        const list = activeTab === "completed" ? submissions : attempts;
        if (!searchQuery) return list;
        return list.filter(item => 
            item.quiz?.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activeTab, submissions, attempts, searchQuery]);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header & Stats Section */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            <TrendingUp size={14} />
                            Performance Tracking
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            My <span className="text-blue-600">Activity.</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-lg">Monitor your progress, analyze performance, and continue your learning journey.</p>
                    </div>

                    <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
                        <TabButton 
                            active={activeTab === "completed"} 
                            onClick={() => setActiveTab("completed")} 
                            label="Completed" 
                            count={submissions.length} 
                        />
                        <TabButton 
                            active={activeTab === "in_progress"} 
                            onClick={() => setActiveTab("in_progress")} 
                            label="In Progress" 
                            count={attempts.length} 
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        icon={<Award className="text-emerald-500" />} 
                        label="Global Rank" 
                        value={rankData ? `#${rankData.rank}` : "---"} 
                        sublabel="Based on total score"
                        color="emerald"
                    />
                    <StatCard 
                        icon={<Zap className="text-blue-500" />} 
                        label="Avg. Accuracy" 
                        value={`${stats.avgScore}%`} 
                        sublabel="Performance mean"
                        color="blue"
                    />
                    <StatCard 
                        icon={<Star className="text-orange-500" />} 
                        label="Best Score" 
                        value={`${stats.bestScore}%`} 
                        sublabel="Your record high"
                        color="orange"
                    />
                    <StatCard 
                        icon={<ClipboardCheck className="text-purple-500" />} 
                        label="Total Quizzes" 
                        value={stats.total} 
                        sublabel="Completed sessions"
                        color="purple"
                    />
                </div>
            </div>

            {/* List Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search your activity..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-full text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                </div>
                
                <div className="flex items-center gap-2 text-slate-400">
                    <Filter size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Showing {filteredList.length} items</span>
                </div>
            </div>

            {/* List Content */}
            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-slate-100"></div>
                    ))}
                </div>
            ) : filteredList.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {filteredList.map((item, index) => (
                        <ActivityItem 
                            key={item.id} 
                            item={item} 
                            index={index}
                            isCompleted={activeTab === "completed"}
                            onClick={() => navigate(activeTab === "completed" ? `/attempts/${item.quiz_attempt_id || item.id}/review` : `/attempts/${item.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                        {activeTab === "completed" ? <Award size={48} /> : <Clock size={48} />}
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                            {searchQuery ? "No matches found" : activeTab === "completed" ? "No history yet" : "Everything finished!"}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] max-w-xs mx-auto">
                            {searchQuery ? "Try adjusting your search terms" : activeTab === "completed" ? "Start a quiz to build your trophy wall and see your stats grow" : "No active sessions found. Why not start something new?"}
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate("/quizzes")}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95"
                    >
                        Explore Library <ChevronRight size={14} />
                    </button>
                </div>
            )}

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );
}

function StatCard({ icon, label, value, sublabel, color }) {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100"
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]} border`}>
                    {icon}
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
                    <p className="text-[10px] font-bold text-slate-400">{sublabel}</p>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, count }) {
    return (
        <button 
            onClick={onClick}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${
                active 
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                : "text-slate-400 hover:text-slate-600"
            }`}
        >
            {label}
            <span className={`px-2.5 py-0.5 rounded-lg text-[8px] ${active ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"}`}>
                {count}
            </span>
        </button>
    );
}

function ActivityItem({ item, index, isCompleted, onClick }) {
    const quiz = item.quiz || {};
    const date = new Date(isCompleted ? item.submitted_at : item.started_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const scorePercent = isCompleted ? Math.round((item.score / item.max_score) * 100) : 0;
    
    // Determine color based on score
    const getScoreColor = (percent) => {
        if (percent >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-100";
        if (percent >= 50) return "text-blue-500 bg-blue-50 border-blue-100";
        return "text-orange-500 bg-orange-50 border-orange-100";
    };

    return (
        <div 
            onClick={onClick}
            style={{ animationDelay: `${index * 50}ms` }}
            className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col lg:flex-row items-center gap-8 group hover:shadow-2xl hover:shadow-slate-200/50 hover:border-blue-200 transition-all duration-500 cursor-pointer relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        >
            {/* Visual Indicator */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 ${isCompleted ? 'bg-slate-50 text-slate-900' : 'bg-blue-50 text-blue-600'}`}>
                {isCompleted ? (
                    scorePercent >= 80 ? <Award size={32} className="text-emerald-500" /> : <ClipboardCheck size={32} className="text-blue-500" />
                ) : (
                    <Play size={32} className="animate-pulse" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3 text-center lg:text-left">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{quiz.category?.name || "Quiz"}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <div className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</span>
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                        {quiz.title}
                    </h3>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    {isCompleted ? (
                        <>
                            {item.grading_status === 'pending' ? (
                                <div className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 flex items-center gap-1.5">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Pending Review</span>
                                </div>
                            ) : (
                                <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${getScoreColor(scorePercent)}`}>
                                    <div className="flex -space-x-1">
                                        {[1, 2, 3].map(i => (
                                            <Star key={i} size={10} fill={scorePercent >= (i * 30) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Score: {scorePercent}%</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center gap-1.5">
                            <Clock size={12} className="animate-spin-slow" />
                            <span className="text-[10px] font-black uppercase tracking-widest">In Progress</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-4 w-full lg:w-auto">
                <button className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 whitespace-nowrap group-hover:translate-x-1 transition-transform">
                    {isCompleted ? "Review Results" : "Resume Session"}
                </button>
            </div>
        </div>
    );
}
