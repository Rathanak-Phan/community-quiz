import { useState, useEffect, useCallback } from "react";
import { Plus, Search, BookOpen, Clock, Users, ChevronRight, Edit3, Trash2, Heart, Play, Sparkles, HelpCircle, BarChart2, MoreVertical, Eye } from "lucide-react";
import { getMyQuizzes, deleteQuiz } from "./services/quizService";
import Toast from "../../components/ui/Toast";
import QuizFormModal from "./components/QuizFormModal";
import { STORAGE_URL } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import ConfirmModal from "../../components/ui/ConfirmModal";
import SEO from "../../components/common/SEO";

export default function MyQuizzes() {
    const navigate = useNavigate();
    const { user, isAdmin, isQuizMaker } = useAuth();
    
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, loading: false });

    const loadQuizzes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMyQuizzes();
            setQuizzes(res.data?.data ?? res.data ?? []);
        } catch (error) {
            console.error("Failed to load your quizzes:", error);
            setToast({ show: true, message: "Failed to load your quizzes", type: "error" });
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

    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        setConfirmDelete({ isOpen: true, id, loading: false });
    };

    const handleConfirmDelete = async () => {
        const id = confirmDelete.id;
        setConfirmDelete(prev => ({ ...prev, loading: true }));
        try {
            await deleteQuiz(id);
            setToast({ show: true, message: "Quiz deleted successfully", type: "success" });
            loadQuizzes();
            setConfirmDelete({ isOpen: false, id: null, loading: false });
        } catch (error) {
            setToast({ show: true, message: "Failed to delete quiz", type: "error" });
            setConfirmDelete(prev => ({ ...prev, loading: false }));
        }
    };

    const filteredQuizzes = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12">
            <SEO 
                title="My Created Quizzes"
                description="Manage, edit, analyze, and build interactive quizzes on the QuizSphere creator dashboard."
                url="/quizzes/my"
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My <span className="text-blue-600">Quizzes.</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg">Manage your creations, update questions, and track community engagement.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditData(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-slate-900 dark:bg-slate-800 text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95 group"
                >
                    <div className="w-6 h-6 bg-white/20 rounded-xl flex items-center justify-center transition-colors group-hover:bg-white/40">
                      <Plus size={16} />
                    </div>
                    CREATE NEW
                </button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <div className="relative group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search your quizzes..." 
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-50 dark:border-slate-700 rounded-full outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold dark:text-white dark:placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[420px] bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-100 dark:border-slate-800"></div>
                    ))}
                </div>
            ) : filteredQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredQuizzes.map(quiz => (
                        <QuizCard 
                            key={quiz.id} 
                            quiz={quiz} 
                            userId={user?.id}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onManage={() => navigate(`/quizzes/${quiz.id}/questions`)}
                            onClick={() => navigate(`/quizzes/${quiz.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-32 flex flex-col items-center text-center space-y-6">
                   <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-600">
                      <BookOpen size={40} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Quizzes Yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Start creating your first learning module</p>
                   </div>
                </div>
            )}

            <QuizFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                editData={editData}
            />
            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Delete Quiz"
                message="Are you sure you want to delete this quiz? This action is permanent and will remove all questions and student results."
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, id: null, loading: false })}
                loading={confirmDelete.loading}
                confirmText="Delete Quiz"
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

function QuizCard({ quiz, userId, onEdit, onDelete, onManage, onClick }) {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        if (!showMenu) return;
        const closeMenu = () => setShowMenu(false);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, [showMenu]);

    return (
        <div 
            onClick={onClick}
            className="group relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900 transition-all duration-500 cursor-pointer hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] transition-colors duration-300"
        >
            {/* Action Menu - Positioned at top level of card to avoid clipping */}
            <div className="absolute top-6 right-6 z-55">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className={`w-12 h-12 rounded-xl backdrop-blur-xl flex items-center justify-center transition-all duration-500 shadow-2xl ${
                        showMenu 
                        ? 'bg-blue-600 text-white rotate-90 scale-110' 
                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 border border-white/40 dark:border-slate-700'
                    }`}
                >
                    <MoreVertical size={24} strokeWidth={2.5} />
                </button>

                {showMenu && (
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-4 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white/50 dark:border-slate-700 p-3 animate-in fade-in zoom-in slide-in-from-top-4 duration-300 overflow-hidden"
                    >
                        <div className="px-5 py-3 mb-2">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Management</p>
                        </div>
                        
                        <MenuBtn 
                            icon={<Eye size={18} />} 
                            label="Preview Quiz" 
                            color="text-slate-400 dark:text-slate-500"
                            hoverColor="group-hover/btn:text-blue-600"
                            onClick={onClick} 
                        />
                        <MenuBtn 
                            icon={<BarChart2 size={18} />} 
                            label="Analytics & Attempts" 
                            color="text-slate-400 dark:text-slate-500"
                            hoverColor="group-hover/btn:text-indigo-600"
                            onClick={() => navigate(`/quizzes/${quiz.id}/attempts`)} 
                        />
                        <MenuBtn 
                            icon={<HelpCircle size={18} />} 
                            label="Edit Questions" 
                            color="text-slate-400 dark:text-slate-500"
                            hoverColor="group-hover/btn:text-amber-600"
                            onClick={onManage} 
                        />
                        <MenuBtn 
                            icon={<Edit3 size={18} />} 
                            label="Quiz Settings" 
                            color="text-slate-400 dark:text-slate-500"
                            hoverColor="group-hover/btn:text-indigo-600"
                            onClick={(e) => onEdit(e, quiz)} 
                        />
                        
                        <div className="mx-4 my-2 h-px bg-slate-100 dark:bg-slate-700" />
                        
                        <MenuBtn 
                            icon={<Trash2 size={18} />} 
                            label="Delete Forever" 
                            color="text-slate-400 dark:text-slate-500"
                            hoverColor="group-hover/btn:text-rose-600"
                            isDestructive
                            onClick={(e) => onDelete(e, quiz.id)} 
                        />
                    </div>
                )}
            </div>

            <div className="relative h-48 w-full overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-800">
                {/* Visual Polish Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {quiz.cover_image ? (
                    <img 
                        src={`${STORAGE_URL}/${quiz.cover_image}`} 
                        className="w-full h-full object-cover transition duration-1000 group-hover:scale-105" 
                        alt={quiz.title} 
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
                        <Sparkles size={64} className="text-blue-200 dark:text-blue-900 animate-pulse" />
                    </div>
                )}

                {/* Glassmorphism Badges */}
                <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                    <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-750 shadow-xl shadow-slate-900/5">
                        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{quiz.category?.name || "General"}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl backdrop-blur-xl border shadow-xl shadow-slate-900/5 ${
                        quiz.status === 'draft' 
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40' 
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-450 border-emerald-200/50 dark:border-emerald-900/40'
                    }`}>
                        <p className="text-[10px] font-black uppercase tracking-tighter">{quiz.status || 'published'}</p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-4 pt-8 pb-4">
                <div className="mb-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight mb-3">
                        {quiz.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed h-[3rem]">
                        {quiz.description || "No description provided."}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-2.5 border border-slate-100 dark:border-slate-750 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-950/20 group-hover:border-blue-100 dark:group-hover:border-blue-900 transition-colors text-slate-900 dark:text-slate-200">
                             <Clock size={16} className="text-blue-500" />
                             <span className="text-[10px] font-black uppercase tracking-tighter">{quiz.time_limit || 30}M</span>
                        </div>
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-2.5 border border-slate-100 dark:border-slate-750 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-950/20 group-hover:border-emerald-100 dark:group-hover:border-emerald-900 transition-colors text-slate-900 dark:text-slate-200">
                             <Users size={16} className="text-emerald-500" />
                             <span className="text-[10px] font-black uppercase tracking-tighter">{quiz.attempts_count || 0} ATTEMPTS</span>
                        </div>
                    </div>
                    
                    <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500 shadow-2xl shadow-slate-900/20 dark:shadow-none group-hover:shadow-blue-600/40 active:scale-90 group-hover:translate-x-1">
                        <ChevronRight size={28} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MenuBtn({ icon, label, onClick, color, hoverColor, isDestructive }) {
    return (
        <button 
            onClick={(e) => { e.stopPropagation(); onClick(e); }}
            className={`w-full px-5 py-3.5 flex items-center gap-4 rounded-xl transition-all duration-300 group/btn text-left ${isDestructive ? 'hover:bg-rose-50 dark:hover:bg-rose-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
            <div className={`${color} ${hoverColor} transition-all duration-300 group-hover/btn:scale-110`}>
                {icon}
            </div>
            <span className={`text-sm font-bold transition-colors ${isDestructive ? 'text-rose-500 group-hover/btn:text-rose-600' : 'text-slate-600 dark:text-slate-300 group-hover/btn:text-slate-900 dark:group-hover/btn:text-white'}`}>
                {label}
            </span>
        </button>
    );
}
