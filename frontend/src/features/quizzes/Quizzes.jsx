import { useState, useEffect, useCallback } from "react";
import { Plus, Search, BookOpen, Clock, Users, ChevronRight, Edit3, Trash2, Heart, Play, Sparkles, HelpCircle } from "lucide-react";
import { getQuizzes, deleteQuiz } from "../../services/quizService";
import { addFavorite, removeFavorite } from "../../services/favoriteService";
import Toast from "../../components/ui/Toast";
import QuizFormModal from "./components/QuizFormModal";
import { STORAGE_URL } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";

export default function Quizzes() {
    const navigate = useNavigate();
    const { user, isAdmin, isQuizMaker } = useAuth();
    const isGuest = !localStorage.getItem("token");
    
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const loadQuizzes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getQuizzes();
            setQuizzes(res.data?.data ?? res.data ?? []);
        } catch (error) {
            console.error("Failed to load quizzes:", error);
            setToast({ show: true, message: "Failed to load quizzes", type: "error" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadQuizzes();
    }, [loadQuizzes]);

    const handleSuccess = (message) => {
        setToast({ show: true, message, type: "success" });
        loadQuizzes();
    };

    const handleEdit = (e, quiz) => {
        e.stopPropagation();
        setEditData(quiz);
        setIsModalOpen(true);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await deleteQuiz(id);
            setToast({ show: true, message: "Quiz deleted successfully", type: "success" });
            loadQuizzes();
        } catch (error) {
            setToast({ show: true, message: "Failed to delete quiz", type: "error" });
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFavorite = async (e, quiz) => {
        e.stopPropagation();
        if (isGuest) {
            navigate("/");
            return;
        }

        try {
            if (quiz.is_favorite) {
                // Find the favorite ID from the quiz object (needs backend to provide it)
                // or use a toggle endpoint if available.
                // Assuming backend provides favorite_id if favorited.
                await removeFavorite(quiz.favorite_id);
                setToast({ show: true, message: "Removed from favorites", type: "success" });
            } else {
                await addFavorite({ target_type: 'quiz', target_id: quiz.id });
                setToast({ show: true, message: "Added to favorites", type: "success" });
            }
            loadQuizzes();
        } catch (error) {
            setToast({ show: true, message: "Action failed", type: "error" });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6 md:space-y-12 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 pt-6 md:pt-0">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">Challenge <span className="text-blue-600">Yourself.</span></h1>
                <p className="text-sm md:text-base text-slate-500 font-medium max-w-lg">Explore thousands of quizzes created by our vibrant learning community.</p>
            </div>
            {!isGuest && (isAdmin || isQuizMaker) && (
                <button 
                    onClick={() => {
                        setEditData(null);
                        setIsModalOpen(true);
                    }}
                    className="w-full md:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-slate-900/10 active:scale-95 group"
                >
                    <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center transition-colors group-hover:bg-white/40">
                      <Plus size={14} />
                    </div>
                    CREATE QUIZ
                </button>
            )}
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4 md:gap-5 sticky top-24 z-20">
            <div className="relative flex-1 group w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search quizzes by title or category..." 
                    className="w-full pl-14 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-600/30 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
               <FilterBtn label="Trending" active />
               <FilterBtn label="Newest" />
               <FilterBtn label="Most Played" />
            </div>
        </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[420px] bg-white rounded-[3rem] animate-pulse border border-slate-100"></div>
                    ))}
                </div>
            ) : filteredQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {filteredQuizzes.map(quiz => (
                        <QuizCard 
                            key={quiz.id} 
                            quiz={quiz} 
                            isAdmin={isAdmin}
                            userId={user?.id}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onFavorite={handleFavorite}
                            onClick={() => navigate(`/quizzes/${quiz.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-32 flex flex-col items-center text-center space-y-6">
                   <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                      <Search size={40} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900 uppercase">No Quizzes Found</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Try adjusting your search criteria</p>
                   </div>
                </div>
            )}

            <QuizFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                editData={editData}
            />

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

function QuizCard({ quiz, isAdmin, userId, onEdit, onDelete, onFavorite, onClick }) {
    const navigate = useNavigate();
    const isGuest = !localStorage.getItem("token");
    
    const handleAction = (e) => {
        if (isGuest) {
            e.stopPropagation();
            window.location.href = '/';
            return;
        }
        onClick();
    };

    return (
        <div 
            onClick={handleAction}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group cursor-pointer relative flex flex-col"
        >
            <div className="h-48 relative bg-slate-50 overflow-hidden">
                {quiz.cover_image ? (
                    <img src={`${STORAGE_URL}/${quiz.cover_image}`} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt={quiz.title} />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                        <Sparkles size={48} className="text-blue-200" />
                    </div>
                )}
                
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="px-4 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-lg border border-white/50">
                        {quiz.category?.name || "General"}
                    </span>
                    {quiz.community?.name && (
                      <span className="px-4 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest shadow-lg border border-white/10">
                          {quiz.community.name}
                      </span>
                    )}
                </div>

                <div className="absolute top-6 right-6 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                        onClick={(e) => onFavorite(e, quiz)}
                        className={`w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center transition shadow-lg ${quiz.is_favorite ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                    >
                        <Heart size={16} fill={quiz.is_favorite ? "currentColor" : "none"} />
                    </button>
                    {(isAdmin || quiz.created_by === userId) && (
                        <>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/quizzes/${quiz.id}/questions`);
                                }}
                                title="Manage Questions"
                                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-white transition shadow-lg"
                            >
                                <HelpCircle size={16} />
                            </button>
                            <button 
                                onClick={(e) => onEdit(e, quiz)}
                                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-lg"
                            >
                                <Edit3 size={16} />
                            </button>
                            <button 
                                onClick={(e) => onDelete(e, quiz.id)}
                                className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-lg"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="p-7 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                    {quiz.title}
                </h3>
                <p className="text-slate-500 text-xs font-medium line-clamp-2 min-h-[32px] leading-relaxed mb-6">
                    {quiz.description || "Challenge your knowledge with this community-contributed module."}
                </p>
                
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Clock size={12} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{quiz.time_limit || 30}M</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Users size={12} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{quiz.attempts_count || 0} ATTEMPTS</span>
                        </div>
                    </div>
                    
                    <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300 shadow-sm active:scale-90">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function FilterBtn({ label, active }) {
    return (
        <button className={`px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${
            active ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-50 text-slate-400 hover:text-slate-900'
        }`}>
            {label}
        </button>
    );
}
