import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getQuizById } from "./services/quizService";
import { startAttempt } from "./services/attemptService";
import { addFavorite, removeFavorite } from "../favorites/services/favoriteService";
import { Clock, Users, BookOpen, Play, ChevronLeft, Calendar, User, Layers, ShieldCheck, Sparkles, AlertCircle, Heart, Bookmark, Settings, Share2, Trophy } from "lucide-react";
import { STORAGE_URL } from "../../config/api";
import { useAuth } from "../../providers/AuthContext";
import Toast from "../../components/ui/Toast";
import SEO from "../../components/common/SEO";

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
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [showShareModal, setShowShareModal] = useState(false);
    const [challengeToken, setChallengeToken] = useState(null);
    
    const getQuizShareURL = () => {
        if (challengeToken) {
            return `${window.location.origin}/quiz/${quizId}?challenge=${challengeToken}`;
        }
        return `${window.location.origin}/quiz/${quizId}`;
    };

    const handleCopyQuizLink = async () => {
        try {
            await navigator.clipboard.writeText(getQuizShareURL());
            setToast({ show: true, message: "Quiz link copied to clipboard!", type: "success" });
        } catch {
            setToast({ show: true, message: "Failed to copy link", type: "error" });
        }
    };

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
        if (quizId && quizId !== 'undefined') {
            fetchQuiz();
        }
    }, [quizId]);

    const { token, user, isAdmin } = useAuth();

    const handleStart = async () => {
        if (!token) {
            setShowGuestModal(true);
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

    const handleStartGuest = async (e) => {
        e.preventDefault();
        if (!guestName.trim()) {
            setToast({ show: true, message: "Please enter your name", type: "error" });
            return;
        }
        setStarting(true);
        try {
            const { startAttemptPublic } = await import("./services/attemptService");
            const searchParams = new URLSearchParams(location.search);
            const challengeToken = searchParams.get("challenge");
            
            const res = await startAttemptPublic(quizId, { 
                mode, 
                anonymous_name: guestName.trim(),
                challenge_token: challengeToken || null
            });
            const attemptId = res.data.data?.id || res.data.id;
            setShowGuestModal(false);
            
            // Forward challenge query parameter to attempt view if present
            const nextPath = challengeToken 
                ? `/public/attempts/${attemptId}?challenge=${challengeToken}`
                : `/public/attempts/${attemptId}`;
            navigate(nextPath);
        } catch (error) {
            setToast({ show: true, message: error.response?.data?.message || "Could not start guest attempt", type: "error" });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12 pb-20 overflow-x-hidden">
            <SEO 
                title={quiz.title} 
                description={quiz.description || `Take the ${quiz.title} quiz on QuizSphere. Challenge yourself with community-driven learning!`}
                image={quiz.cover_image ? `${STORAGE_URL}/${quiz.cover_image}` : null}
                url={`/quizzes/${quizId}`}
            />
            {/* Breadcrumb & Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest transition-colors self-start sm:self-auto"
                >
                    <ChevronLeft size={16} /> Back to previous
                </button>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                    <button 
                        onClick={handleFavorite}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all ${quiz.is_favorite ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:text-slate-900'}`}
                    >
                        {quiz.is_favorite ? <Heart size={14} fill="currentColor" /> : <Bookmark size={14} />}
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{quiz.is_favorite ? 'Saved' : 'Save for later'}</span>
                    </button>
                    
                    <button 
                        onClick={() => setShowShareModal(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 rounded-xl transition-all cursor-pointer"
                    >
                        <Share2 size={14} />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Share</span>
                    </button>

                    <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-blue-50 rounded-xl border border-blue-100/50">
                        <ShieldCheck size={14} className="text-blue-600" />
                        <span className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest whitespace-nowrap">Verified Content</span>
                    </div>
                    {(isAdmin || user?.id === quiz.created_by) && (
                        <button 
                            onClick={() => navigate(`/quizzes/${quizId}/questions`)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                        >
                            <Settings size={14} />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Manage Questions</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
                {/* Left Column: Visual & CTA */}
                <div className="lg:col-span-5 space-y-6 md:space-y-8">
                    <div className="aspect-video md:aspect-[4/5] rounded-xl overflow-hidden border-4 border-white shadow-xl shadow-slate-200 relative group">
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
                        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-xl">
                            <button 
                                onClick={() => setMode('scored')}
                                className={`flex-1 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'scored' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Scored Mode
                            </button>
                            <button 
                                onClick={() => setMode('practice')}
                                className={`flex-1 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === 'practice' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Try Out
                            </button>
                        </div>

                        <button 
                            onClick={handleStart}
                            disabled={starting}
                            className="w-full py-4.5 bg-slate-900 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
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
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight uppercase">{quiz.title}</h1>
                    </div>

                    <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
                        {quiz.description || "Challenge your understanding with this module. Perfect for test preparation or hobbyist learning."}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                        <InfoBox 
                            icon={<Clock size={18}/>} 
                            label="Duration" 
                            value={quiz.total_time > 0 ? (
                                quiz.total_time < 60 ? `${quiz.total_time}s` : `${Math.floor(quiz.total_time / 60)}m ${quiz.total_time % 60 > 0 ? (quiz.total_time % 60) + 's' : ''}`
                            ) : "No Limit"} 
                        />
                        <InfoBox icon={<BookOpen size={18}/>} label="Questions" value={quiz.questions_count || 10} />
                        <InfoBox icon={<Users size={18}/>} label="Attempts" value={quiz.attempts_count || 0} />
                        <InfoBox icon={<Calendar size={18}/>} label="Published" value={new Date(quiz.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} />
                    </div>

                    <div className="pt-10 border-t border-slate-100">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">About the Creator</h3>
                        <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm border border-slate-200">
                                {quiz.creator?.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                {quiz.creator?.role !== 'admin' ? (
                                    <Link to={`/profile/${quiz.creator?.id}`}>
                                        <p className="font-bold text-slate-900 uppercase tracking-tight hover:text-blue-600 transition-colors cursor-pointer">{quiz.creator?.name}</p>
                                    </Link>
                                ) : (
                                    <p className="font-bold text-slate-900 uppercase tracking-tight">{quiz.creator?.name}</p>
                                )}
                                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Top Rated Educator</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showGuestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-scale-up">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <User size={24} />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight text-center">
                                Take Quiz as <span className="text-blue-600">Guest</span>
                            </h3>
                            <p className="text-sm font-medium text-slate-500 text-center leading-relaxed">
                                Enter your name below to attempt this quiz. No account registration is required, and your results will be listed in the scoreboard.
                            </p>
                            
                            <form onSubmit={handleStartGuest} className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Your Name
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. John Doe" 
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold text-slate-900"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-2 pt-2">
                                    <button 
                                        type="submit"
                                        disabled={starting}
                                        className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-50 cursor-pointer animate-pulse-slow"
                                    >
                                        {starting ? "PREPARING..." : "START QUIZ NOW"}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setShowGuestModal(false)}
                                        className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all duration-300 active:scale-95 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                            
                            <div className="text-center pt-2 border-t border-slate-100">
                                <p className="text-xs font-semibold text-slate-400">
                                    Have an account?{" "}
                                    <Link to="/login" className="text-blue-600 hover:underline font-bold">
                                        Log In
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}

            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-scale-up">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                    Share Quiz
                                </h3>
                                <button 
                                    onClick={() => setShowShareModal(false)}
                                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <p className="text-sm font-semibold text-slate-500 leading-relaxed text-left">
                                Share <span className="font-extrabold text-slate-900">"{quiz?.title}"</span> with your friends, classmates, or community!
                            </p>

                            {/* Challenge Mode Toggle */}
                            {user?.id === quiz?.created_by && (
                                <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl flex flex-col gap-3 text-left">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                                <Trophy size={14} className="text-yellow-600 animate-pulse" /> Challenge Mode
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-bold mt-0.5 leading-snug">
                                                Create a separate scoreboard and rank pool for this session!
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (challengeToken) {
                                                    setChallengeToken(null);
                                                } else {
                                                    const randToken = `CH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                                                    setChallengeToken(randToken);
                                                }
                                            }}
                                            className={`px-3 py-2 rounded-xl font-black text-[9px] uppercase tracking-wider shrink-0 transition-all active:scale-95 cursor-pointer ${
                                                challengeToken 
                                                    ? 'bg-slate-900 text-white' 
                                                    : 'bg-yellow-500 hover:bg-yellow-600 text-slate-950 shadow-md shadow-yellow-500/10'
                                            }`}
                                        >
                                            {challengeToken ? 'Disable' : 'New Challenge'}
                                        </button>
                                    </div>
                                    {challengeToken && (
                                        <div className="flex items-center justify-between bg-white border border-yellow-200/40 rounded-xl px-4 py-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active Token:</p>
                                            <p className="text-xs font-black text-yellow-600">{challengeToken}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Copy Link Input group */}
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Quiz Share Link
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        readOnly
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-500 select-all"
                                        value={getQuizShareURL()}
                                    />
                                    <button 
                                        onClick={handleCopyQuizLink}
                                        className="px-4 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 active:scale-95"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {/* QR Code Container */}
                            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-3">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200/60">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getQuizShareURL())}`} 
                                        alt="Quiz QR Code" 
                                        className="w-[180px] h-[180px] object-contain"
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                        Scan QR Code
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-snug">
                                        Guests can scan to attempt instantly without an account
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(getQuizShareURL())}`;
                                        window.open(url, '_blank');
                                    }}
                                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95 cursor-pointer"
                                >
                                    Open Full QR
                                </button>
                            </div>
                            
                            {/* Social Buttons */}
                            <div className="space-y-3 pt-2 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                    Share directly to
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => {
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getQuizShareURL())}`, '_blank');
                                        }}
                                        className="py-3 bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/20 hover:border-transparent rounded-xl font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                                    >
                                        <FacebookIcon size={16} />
                                        <span>Facebook</span>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getQuizShareURL())}`, '_blank');
                                        }}
                                        className="py-3 bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white border border-[#0A66C2]/20 hover:border-transparent rounded-xl font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                                    >
                                        <LinkedInIcon size={16} />
                                        <span>LinkedIn</span>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            let text = `Check out this awesome quiz: "${quiz?.title}"!`;
                                            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getQuizShareURL())}&text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="py-3 bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200 hover:border-transparent rounded-xl font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                                    >
                                        <XIcon size={16} />
                                        <span>X</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoBox({ icon, label, value }) {
    return (
        <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-4">
                {icon}
            </div>
            <p className="text-xs font-bold text-slate-900 tracking-tight">{value}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    );
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
