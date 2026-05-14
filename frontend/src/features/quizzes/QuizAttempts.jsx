import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizAttempts, getQuizById } from "../../services/quizService";
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
    User
} from "lucide-react";
import Toast from "../../components/ui/Toast";

export default function QuizAttempts() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all"); // all, public, anonymous
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    useEffect(() => {
        const fetchData = async () => {
            if (!quizId || quizId === 'undefined') return;
            try {
                const [quizRes, attemptsRes] = await Promise.all([
                    getQuizById(quizId),
                    getQuizAttempts(quizId)
                ]);
                setQuiz(quizRes.data.data || quizRes.data);
                setAttempts(attemptsRes.data.data || attemptsRes.data);
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
        const matchesSearch = (attempt.user?.name || "Anonymous User").toLowerCase().includes(searchQuery.toLowerCase());
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

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="px-6 py-3 border-r border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-xl font-black text-slate-900">{attempts.length}</p>
                    </div>
                    <div className="px-6 py-3 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Score</p>
                        <p className="text-xl font-black text-blue-600">
                            {attempts.length > 0 
                                ? Math.round(attempts.reduce((acc, curr) => acc + (curr.score / curr.max_score || 0), 0) / attempts.length * 100)
                                : 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by participant name..." 
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl shrink-0">
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
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
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
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-sm border ${
                                                attempt.is_anonymous 
                                                ? 'bg-slate-100 text-slate-400 border-slate-200' 
                                                : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                                {attempt.is_anonymous ? <ShieldOff size={20} /> : <User size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 leading-tight">
                                                    {attempt.user?.name || "Anonymous User"}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {attempt.is_anonymous ? "Private Submission" : "Public Submission"}
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
                                        <button 
                                            onClick={() => navigate(`/reviews/${attempt.id}`)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20"
                                        >
                                            <Eye size={14} /> Review & Grade
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
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
