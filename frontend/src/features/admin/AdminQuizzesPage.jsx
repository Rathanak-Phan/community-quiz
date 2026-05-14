import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Trash2,
  Layers,
  Users as CommunityIcon,
  User as CreatorIcon,
  Clock,
  AlertTriangle,
  ChevronRight,
  Filter,
  BarChart3,
  Calendar,
  MoreVertical,
  Heart,
  X,
  Mail
} from 'lucide-react';
import adminService from '../../services/adminService';
import Toast from '../../components/ui/Toast';

const AdminQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [showFansModal, setShowFansModal] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await adminService.getQuizzes();
      setQuizzes(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to fetch quizzes', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async (quiz) => {
    setSelectedQuiz(quiz);
    setLoadingFavorites(true);
    setShowFansModal(true);
    try {
      const res = await adminService.getQuizFavorites(quiz.id);
      setFavorites(res.data.data || res.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch fans', type: 'error' });
      setShowFansModal(false);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('CRITICAL MODERATION ACTION: Are you sure you want to PERMANENTLY DELETE this quiz? This action is irreversible and will remove all associated questions and answers.')) return;
    try {
      await adminService.deleteQuiz(id);
      setToast({ message: 'Quiz removed for moderation', type: 'success' });
      fetchQuizzes();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Moderation action failed', type: 'error' });
    }
  };

  const categories = ['All', ...new Set(quizzes.map(q => q.category?.name || 'Uncategorized'))];

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.creator?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || (quiz.category?.name || 'Uncategorized') === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'Total Quizzes', value: quizzes.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Creators', value: new Set(quizzes.map(q => q.user_id)).size, icon: CreatorIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Categories', value: categories.length - 1, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Review', value: 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <ShieldCheck size={20} />
            </div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Moderation Module</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight uppercase">Quiz <span className="text-rose-600">Oversight</span></h2>
          <p className="text-slate-400 font-bold text-sm mt-3 flex items-center gap-2">
             Manage platform-wide content and ensure community safety standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={fetchQuizzes}
             className="px-6 py-4 bg-white border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition shadow-sm"
           >
             Refresh Data
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl transition-transform group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
              <BarChart3 size={16} className="text-slate-200" />
            </div>
            <div className="mt-6">
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-xl group">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by quiz title or creator name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-8 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-rose-600 focus:ring-4 focus:ring-rose-500/5 transition-all text-sm font-bold"
          />
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
          </div>
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                activeCategory === cat 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' 
                : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">General Info</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category & Community</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Engagement</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Creation Date</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-10 py-8"><div className="h-16 bg-slate-50 rounded-2xl"></div></td>
                  </tr>
                ))
              ) : filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                         <Search size={40} />
                      </div>
                      <p className="text-lg font-black text-slate-900 uppercase">No Quizzes Found</p>
                      <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : filteredQuizzes.map((quiz) => (
                <tr key={quiz.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-rose-600 transition-all shadow-inner relative">
                        <FileText size={24} />
                        {quiz.questions_count > 0 && (
                          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {quiz.questions_count}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-rose-600 transition-colors">{quiz.title}</p>
                        <div className="flex items-center gap-3 mt-2">
                           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                              <CreatorIcon size={12} className="text-slate-400" />
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{quiz.creator?.name}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100/50">
                          <Layers size={12} />
                        </div>
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                          {quiz.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                          <CommunityIcon size={12} />
                        </div>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          {quiz.community?.name || 'Global Community'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <button 
                      onClick={() => fetchFavorites(quiz)}
                      className="group/btn inline-flex flex-col items-center gap-1 px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl hover:bg-rose-600 transition-all shadow-sm"
                    >
                      <Heart size={14} className={`text-rose-500 group-hover/btn:text-white group-hover/btn:scale-110 transition-all ${quiz.favorites_count > 0 ? 'fill-rose-500 group-hover/btn:fill-white' : ''}`} />
                      <span className="text-xs font-black text-rose-600 group-hover/btn:text-white uppercase tracking-widest">
                        {quiz.favorites_count || 0} Fans
                      </span>
                    </button>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex flex-col items-center gap-1 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        {new Date(quiz.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleDelete(quiz.id)}
                        className="flex items-center gap-2 px-6 py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] hover:bg-rose-500 hover:text-white transition-all shadow-sm hover:shadow-rose-600/20"
                      >
                        <Trash2 size={14} /> Remove Content
                      </button>
                      <button className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 transition shadow-sm">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showFansModal && (
        <FavoritesModal 
          quiz={selectedQuiz} 
          favorites={favorites} 
          loading={loadingFavorites} 
          onClose={() => setShowFansModal(false)} 
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const FavoritesModal = ({ quiz, favorites, loading, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-10 pb-6 border-b border-slate-200 relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <Heart size={24} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Quiz Fans</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Users who favorited "{quiz?.title}"</p>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="max-h-[400px] overflow-y-auto p-10 pt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-50 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid gap-4">
              {favorites.map((fav) => (
                <div key={fav.id} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-3xl transition-all group hover:shadow-xl hover:shadow-slate-200/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg">
                      {fav.user?.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{fav.user?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail size={10} className="text-slate-400" />
                        <p className="text-[10px] font-bold text-slate-400 lowercase">{fav.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Favorited On</p>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                      {new Date(fav.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <Heart size={32} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 uppercase">No Fans Yet</p>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">This quiz hasn't been favorited by anyone</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-10 pt-0">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple ShieldCheck icon since we didn't import it at top but using it in header
const ShieldCheck = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default AdminQuizzesPage;
