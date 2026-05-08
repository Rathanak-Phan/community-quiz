import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getQuizById } from "../../services/quizService";
import { startAttempt } from "../../services/attemptService";
import { addFavorite, removeFavorite } from "../../services/favoriteService";
import { Clock, Users, BookOpen, Play, ChevronLeft, Calendar, User, Layers, ShieldCheck, Sparkles, AlertCircle, Heart, Bookmark } from "lucide-react";
import { STORAGE_URL } from "../../config/api";
import { useAuth } from "../../providers/AuthContext";
import Toast from "../../components/ui/Toast";

export default function QuizDetail() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [mode, setMode] = useState("scored");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const fetchQuiz = async () => {
        try {
            const res = await getQuizById(quizId);
            setQuiz(res.data.data || res.data);
        } catch (error) {
            setToast({ show: true, message: "Failed to load quiz details", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const { token } = useAuth();

    const handleStart = async () => {
        if (!token) {
            navigate("/");
            return;
        }
        setStarting(true);
        try {
            const res = await startAttempt(quizId, { mode, is_anonymous: isAnonymous });
            const attemptId = res.data.data?.id || res.data.id;
            navigate(`/attempts/${attemptId}`);
        } catch (error) {
            if (error.response?.status === 409) {
                // Resume existing attempt
                const attemptData = error.response.data.attempt;
                const attemptId = attemptData?.data?.id || attemptData?.id;
                if (attemptId) {
                    navigate(`/attempts/${attemptId}`);
                    return;
                }
            }
            setToast({ show: true, message: error.response?.data?.message || "Could not start quiz", type: "error" });
        } finally {
            setStarting(false);
        }
    };

    const handleFavorite = async () => {
        if (!token) {
            navigate("/");
            return;
        }

        try {
            if (quiz.is_favorite) {
                await removeFavorite(quiz.favorite_id);
                setToast({ show: true, message: "Removed from saved quizzes", type: "success" });
            } else {
                await addFavorite({ target_type: 'quiz', target_id: quiz.id });
                setToast({ show: true, message: "Saved for later", type: "success" });
            }
            fetchQuiz();
        } catch (error) {
            setToast({ show: true, message: "Action failed", type: "error" });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!quiz) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <AlertCircle size={48} className="text-rose-500 mb-4" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Quiz Not Found</h2>
            <button onClick={() => navigate("/quizzes")} className="mt-6 text-blue-600 font-bold flex items-center gap-2 hover:underline">
                <ChevronLeft size={20} /> Back to Library
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-12 pb-20">
            {/* Breadcrumb & Action */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-colors"
                >
                    <ChevronLeft size={16} /> Back to previous
                </button>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleFavorite}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${quiz.is_favorite ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:text-slate-900'}`}
                    >
                        {quiz.is_favorite ? <Heart size={14} fill="currentColor" /> : <Bookmark size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{quiz.is_favorite ? 'Saved for later' : 'Save for later'}</span>
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                        <ShieldCheck size={14} className="text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Verified Content</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* Left Column: Visual & CTA */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden border-4 border-white shadow-xl shadow-slate-200 relative group">
                        {quiz.cover_image ? (
                            <img src={`${STORAGE_URL}/${quiz.cover_image}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={quiz.title} />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                <Sparkles size={80} className="text-white/20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-[2rem]">
                            <button 
                                onClick={() => setMode('scored')}
                                className={`flex-1 py-3 px-6 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'scored' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Scored Mode
                            </button>
                            <button 
                                onClick={() => setMode('practice')}
                                className={`flex-1 py-3 px-6 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'practice' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Try Out
                            </button>
                        </div>

                        <button 
                            onClick={handleStart}
                            disabled={starting}
                            className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
                        >
                            {starting ? "PREPARING..." : mode === 'practice' ? "START PRACTICE" : "START SCORED QUIZ"}
                            <Play size={20} fill="currentColor" />
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Progress Auto-saves
                        </p>
                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                        <button 
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isAnonymous ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {isAnonymous ? <ShieldCheck size={14} /> : <Users size={14} />}
                            {isAnonymous ? "Stay Anonymous" : "Public Answer"}
                        </button>
                    </div>
                </div>

                {/* Right Column: Info */}
                <div className="lg:col-span-7 space-y-10 pt-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                {quiz.category?.name || "General"}
                            </span>
                            {quiz.community?.name && (
                                <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    {quiz.community.name}
                                </span>
                            )}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">{quiz.title}</h1>
                    </div>

                    <p className="text-xl text-slate-500 leading-relaxed font-medium">
                        {quiz.description || "Challenge your understanding with this module. Perfect for test preparation or hobbyist learning."}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <InfoBox icon={<Clock size={18}/>} label="Duration" value={`${quiz.time_limit || 30}m`} />
                        <InfoBox icon={<BookOpen size={18}/>} label="Questions" value={quiz.questions_count || 10} />
                        <InfoBox icon={<Users size={18}/>} label="Attempts" value={quiz.attempts_count || 0} />
                        <InfoBox icon={<Calendar size={18}/>} label="Published" value={new Date(quiz.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} />
                    </div>

                    <div className="pt-10 border-t border-slate-100">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">About the Creator</h3>
                        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm border border-slate-200">
                                {quiz.creator?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 uppercase tracking-tight">{quiz.creator?.name}</p>
                                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Top Rated Educator</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );
}

function InfoBox({ icon, label, value }) {
    return (
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mb-4">
                {icon}
            </div>
            <p className="text-xs font-bold text-slate-900 tracking-tight">{value}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    );
}
