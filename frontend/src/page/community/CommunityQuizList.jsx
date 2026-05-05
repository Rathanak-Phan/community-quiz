import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Clock, Play, ArrowLeft, 
  Globe, Lock, Sparkles, AlertCircle, TrendingUp, Search
} from 'lucide-react';
import apiClient from '../../config/api';
import QuizCard from '../../components/quiz/QuizCard';
import Toast from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';

const CommunityQuizList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [commRes, quizRes] = await Promise.all([
        apiClient.get(`/communities/${id}`),
        apiClient.get(`/communities/${id}/quizzes`)
      ]);
      setCommunity(commRes.data);
      setQuizzes(quizRes.data?.data || []);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("This community is private. You must be an approved member to view its quizzes.");
      } else {
        setError(err.response?.data?.message || "Failed to load quizzes");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto py-32 px-6 text-center space-y-8">
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 mx-auto shadow-xl shadow-rose-500/5">
            <AlertCircle size={48} />
        </div>
        <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Access Restricted</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-loose">{error}</p>
        </div>
        <button 
          onClick={() => navigate("/communities")}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition shadow-xl shadow-slate-900/10 active:scale-95 flex items-center gap-2 mx-auto"
        >
            <ArrowLeft size={16} />
            Back to Communities
        </button>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-blue-600 transition"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                {community?.name} <span className="text-blue-600">Quizzes</span>
            </h1>
            <div className="flex items-center gap-4">
                <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
                    community?.visibility === 'public' ? 'text-emerald-500' : 'text-orange-500'
                }`}>
                    {community?.visibility === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                    {community?.visibility}
                </span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {quizzes.length} Quizzes Available
                </span>
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search within community..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all font-bold text-xs"
          />
        </div>
      </div>

      {/* Grid Section */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredQuizzes.map((quiz) => (
            <QuizCard 
                key={quiz.id}
                quiz={quiz}
                isAdmin={isAdmin}
                userId={user?.id}
                onClick={() => navigate(`/quizzes/${quiz.id}`)}
                onEdit={() => {}} // Handle if needed, though usually done in main quiz page
                onDelete={() => {}} 
            />
          ))}
        </div>
      ) : (
        <div className="py-32 bg-white rounded-[3rem] border border-slate-50 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
           <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
              <Sparkles size={40} />
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase">No Quizzes Found</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  {searchQuery ? "Try adjusting your search criteria" : "No quizzes have been shared in this community yet."}
              </p>
           </div>
        </div>
      )}

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
};

export default CommunityQuizList;
