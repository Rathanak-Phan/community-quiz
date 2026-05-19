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
  Mail,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import api, { STORAGE_URL } from '../../config/api';
import adminService from './services/adminService';
import Toast from '../../components/ui/Toast';
import Pagination from './components/Pagination';
import SEO from '../../components/common/SEO';
import ConfirmModal from '../../components/ui/ConfirmModal';

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
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, loading: false });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQuizzes();
  }, [page, activeCategory]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        if (page === 1) fetchQuizzes();
        else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search: searchQuery,
        category_id: activeCategory !== 'All' ? activeCategory : undefined,
        per_page: 10
      };
      const res = await api.get('/admin/quizzes', { params });
      setQuizzes(res.data.data);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
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
      const res = await api.get(`/admin/quizzes/${quiz.id}/favorites`);
      setFavorites(res.data.data || res.data);
    } catch (err) {
      setToast({ message: 'Failed to fetch fans', type: 'error' });
      setShowFansModal(false);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete({ isOpen: true, id, loading: false });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDelete.id;
    setConfirmDelete(prev => ({ ...prev, loading: true }));
    try {
      await api.delete(`/admin/quizzes/${id}`);
      setToast({ message: 'Quiz removed for moderation', type: 'success' });
      fetchQuizzes();
      setConfirmDelete({ isOpen: false, id: null, loading: false });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Moderation action failed', type: 'error' });
      setConfirmDelete(prev => ({ ...prev, loading: false }));
    }
  };

  const stats = [
    { label: 'Total Quizzes', value: quizzes.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Creators', value: new Set(quizzes.map(q => q.user_id)).size, icon: CreatorIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Categories', value: '...', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Review', value: 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-16 py-8 md:py-16 pb-32 overflow-x-hidden">
      <SEO 
        title="Quiz Oversight | Administrative Portal"
        description="Manage platform-wide content and ensure community safety standards on QuizSphere."
        url="/admin/moderation/quizzes"
      />
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-12">
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.25em]">Moderation Module</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight uppercase leading-none">Quiz <span className="text-rose-600">Oversight</span></h1>
            <p className="text-slate-500 font-bold text-sm md:text-lg max-w-2xl leading-relaxed">
               Manage platform-wide content and ensure community safety standards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
           <button 
             onClick={() => { setPage(1); fetchQuizzes(); }}
             className="w-full lg:w-auto px-10 py-5 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition shadow-xl active:scale-95 flex items-center justify-center gap-4"
           >
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Sync Registry
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="flex items-start justify-between relative z-10">
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl transition-transform group-hover:scale-110 shadow-sm`}>
                <stat.icon size={24} />
              </div>
              <BarChart3 size={18} className="text-slate-200" />
            </div>
            <div className="mt-10 relative z-10">
              <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-10">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by quiz title or creator name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-full outline-none focus:bg-white focus:border-rose-600 focus:ring-4 focus:ring-rose-500/5 transition-all text-xs font-black uppercase tracking-widest"
          />
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide -mx-2 px-2">
          <div className="flex items-center gap-2 px-5 py-4 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category:</span>
          </div>
          {['All'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 active:scale-95 ${
                activeCategory === cat 
                ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/20' 
                : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quiz Identity</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contextual Data</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Engagement Metrics</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Deployment</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && quizzes.length === 0 ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-10 py-12"><div className="h-24 bg-slate-50 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-40 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-8">
                         <FileText size={48} />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Content Found</h4>
                      <p className="text-slate-400 font-bold text-[10px] mt-3 uppercase tracking-widest leading-relaxed text-center">The current moderation query yielded no results in the database.</p>
                    </div>
                  </td>
                </tr>
              ) : quizzes.map((quiz) => (
                <tr key={quiz.id} className="group hover:bg-slate-50/40 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-rose-600 transition-all shadow-inner relative overflow-hidden">
                        {quiz.cover_image ? (
                          <img src={quiz.cover_image.startsWith('http') ? quiz.cover_image : `${STORAGE_URL}/${quiz.cover_image}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FileText size={28} />
                        )}
                        {quiz.questions_count > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-10">
                            {quiz.questions_count}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-rose-600 transition-colors uppercase">{quiz.title}</p>
                        <div className="flex items-center gap-3 mt-3">
                           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                              <CreatorIcon size={12} className="text-slate-400" />
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{quiz.creator?.name}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100/50">
                          <Layers size={14} />
                        </div>
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                          {quiz.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                          <CommunityIcon size={14} />
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
                      className="group/btn inline-flex flex-col items-center gap-2 px-6 py-4 bg-rose-50 border border-rose-100 rounded-2xl hover:bg-rose-600 transition-all shadow-sm active:scale-95"
                    >
                      <Heart size={16} className={`text-rose-500 group-hover/btn:text-white group-hover/btn:scale-110 transition-all ${quiz.favorites_count > 0 ? 'fill-rose-500 group-hover/btn:fill-white' : ''}`} />
                      <span className="text-xs font-black text-rose-600 group-hover/btn:text-white uppercase tracking-widest">
                        {quiz.favorites_count || 0} Fans
                      </span>
                    </button>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex flex-col items-center gap-1.5 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        {new Date(quiz.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-end gap-3 lg:opacity-0 group-hover:opacity-100 transition-all lg:translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleDeleteClick(quiz.id)}
                        className="flex items-center gap-2 px-7 py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 shadow-rose-600/5"
                      >
                        <Trash2 size={18} /> Purge Content
                      </button>
                      <button className="w-14 h-14 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="border-t border-slate-50 px-10 py-6">
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
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

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Moderation Action"
        message="CRITICAL MODERATION ACTION: Are you sure you want to PERMANENTLY DELETE this quiz? This action is irreversible and will remove all associated results and statistics."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null, loading: false })}
        loading={confirmDelete.loading}
        confirmText="Confirm Deletion"
        type="danger"
      />

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
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-10 pb-6 border-b border-slate-200 relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
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
                <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid gap-4">
              {favorites.map((fav) => (
                <div key={fav.id} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white border border-slate-100 rounded-xl transition-all group hover:shadow-xl hover:shadow-slate-200/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg">
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
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
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
            className="w-full py-5 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizzesPage;
