import { useState, useEffect, useCallback } from "react";
import { Plus, Search, BookOpen, Clock, Users, ChevronRight, Edit3, Trash2, Heart, Play, Sparkles, HelpCircle } from "lucide-react";
import { getMyQuizzes, deleteQuiz } from "../../services/quizService";
import Toast from "../../components/ui/Toast";
import QuizFormModal from "../../components/quiz/QuizFormModal";
import { STORAGE_URL } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function MyQuizzes() {
    const navigate = useNavigate();
    const { user, isAdmin, isQuizMaker } = useAuth();
    
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

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

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">My <span className="text-blue-600">Quizzes.</span></h1>
                    <p className="text-slate-500 font-medium max-w-lg">Manage your creations, update questions, and track community engagement.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditData(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-3 hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95 group"
                >
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center transition-colors group-hover:bg-white/40">
                      <Plus size={16} />
                    </div>
                    CREATE NEW
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100">
                <div className="relative group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search your quizzes..." 
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-[1.5rem] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[420px] bg-white rounded-[3rem] animate-pulse border border-slate-100"></div>
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
                            onDelete={handleDelete}
                            onManage={() => navigate(`/quizzes/${quiz.id}/questions`)}
                            onClick={() => navigate(`/quizzes/${quiz.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-32 flex flex-col items-center text-center space-y-6">
                   <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                      <BookOpen size={40} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900 uppercase">No Quizzes Yet</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Start creating your first learning module</p>
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

function QuizCard({ quiz, userId, onEdit, onDelete, onManage, onClick }) {
    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 group cursor-pointer relative flex flex-col"
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
                </div>

                <div className="absolute top-6 right-6 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onManage();
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
                </div>
            </div>

            <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-3">
                    {quiz.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium line-clamp-2 min-h-[40px] leading-relaxed mb-8">
                    {quiz.description || "No description provided."}
                </p>
                
                <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Clock size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz.time_limit || 30}M</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Users size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz.attempts_count || 0} ATTEMPTS</span>
                        </div>
                    </div>
                    
                    <button className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-slate-900/10 group-hover:shadow-blue-600/20 active:scale-90">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
