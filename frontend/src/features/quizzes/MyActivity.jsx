import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ClipboardCheck, Clock, BookOpen, ChevronRight, 
  Play, Award, Search, Layout, Filter, Calendar
} from "lucide-react";
import api from "../../config/api";
import Toast from "../../components/ui/Toast";

export default function MyActivity() {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("completed"); // "completed" or "in_progress"
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const loadActivity = useCallback(async () => {
        setLoading(true);
        try {
            const [attemptsRes, submissionsRes] = await Promise.all([
                api.get("/my-attempts"),
                api.get("/my-submissions")
            ]);
            setAttempts(attemptsRes.data?.data || []);
            setSubmissions(submissionsRes.data?.data || []);
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

    const currentList = activeTab === "completed" ? submissions : attempts;

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <ClipboardCheck size={14} />
                        Personal Journey
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        My <span className="text-emerald-500">Activity.</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-lg">Track your progress, resume unfinished sessions, and review your performance history.</p>
                </div>
                
                <div className="flex bg-white p-1.5 rounded-[1.5rem] shadow-xl shadow-slate-200/40 border border-slate-50">
                    <TabButton active={activeTab === "completed"} onClick={() => setActiveTab("completed")} label="Completed" count={submissions.length} />
                    <TabButton active={activeTab === "in_progress"} onClick={() => setActiveTab("in_progress")} label="Paused" count={attempts.length} />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white rounded-[2rem] animate-pulse border border-slate-100"></div>
                    ))}
                </div>
            ) : currentList.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {currentList.map(item => (
                        <ActivityItem 
                            key={item.id} 
                            item={item} 
                            isCompleted={activeTab === "completed"}
                            onClick={() => navigate(activeTab === "completed" ? `/attempts/${item.quiz_attempt_id || item.id}/review` : `/attempts/${item.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                      {activeTab === "completed" ? <Award size={48} /> : <Clock size={48} />}
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900 uppercase">
                        {activeTab === "completed" ? "No history yet" : "Everything finished!"}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
                        {activeTab === "completed" ? "Start a quiz to build your trophy wall" : "No active sessions found at the moment"}
                      </p>
                   </div>
                   <button 
                     onClick={() => navigate("/quizzes")}
                     className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-2 transition-transform"
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

function TabButton({ active, onClick, label, count }) {
    return (
        <button 
            onClick={onClick}
            className={`px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${
                active ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
            }`}
        >
            {label}
            <span className={`px-2 py-0.5 rounded-lg text-[8px] ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {count}
            </span>
        </button>
    );
}

function ActivityItem({ item, isCompleted, onClick }) {
    const quiz = item.quiz || {};
    const date = new Date(isCompleted ? item.submitted_at : item.started_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div 
            onClick={onClick}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-8 group hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden"
        >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                {isCompleted ? <Award size={32} /> : <Play size={32} />}
            </div>

            <div className="flex-1 space-y-1 text-center md:text-left">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{quiz.title}</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-300" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</span>
                    </div>
                    {isCompleted && (
                        <div className="flex items-center gap-1.5">
                            <Layout size={14} className="text-slate-300" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Score: {Math.round((item.score / item.max_score) * 100)}%</span>
                        </div>
                    )}
                    {!isCompleted && (
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-300" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">In Progress</span>
                        </div>
                    )}
                </div>
            </div>

            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 whitespace-nowrap">
                {isCompleted ? "Review Results" : "Resume Session"}
            </button>
        </div>
    );
}
