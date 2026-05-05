import { useState, useEffect, useCallback } from "react";
import { Plus, Search, BookOpen } from "lucide-react";
import { getQuizzes, deleteQuiz } from "../../services/quizService";
import Toast from "../../components/ui/Toast";
import QuizFormModal from "../../components/quiz/QuizFormModal";
import QuizCard from "../../components/quiz/QuizCard";
import { STORAGE_URL } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Challenge <span className="text-blue-600">Yourself.</span></h1>
                    <p className="text-slate-500 font-medium max-w-lg">Explore thousands of quizzes created by our vibrant learning community.</p>
                </div>
                {!isGuest && (isAdmin || isQuizMaker) && (
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
                        CREATE QUIZ
                    </button>
                )}
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search quizzes by title or category..." 
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-[1.5rem] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredQuizzes.map(quiz => (
                        <QuizCard 
                            key={quiz.id} 
                            quiz={quiz} 
                            isAdmin={isAdmin}
                            userId={user?.id}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
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

}

function FilterBtn({ label, active }) {
    return (
        <button className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 text-slate-400 hover:text-slate-900'
        }`}>
            {label}
        </button>
    );
}
