import React, { useState, useEffect } from 'react';
import { Heart, Search, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../../config/api";
import Toast from '../../components/ui/Toast';
import SEO from '../../components/common/SEO';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await apiClient.get('/favorites');
      setFavorites(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load favorites', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id) => {
    try {
      await apiClient.delete(`/favorites/${id}`);
      setToast({ message: 'Removed from favorites', type: 'success' });
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (err) {
      setToast({ message: 'Failed to remove favorite', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-20 pb-32 overflow-x-hidden">
      <SEO 
        title="My Favorites" 
        description="Access and manage your saved quizzes and communities on QuizSphere."
        url="/favorites"
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8 md:pt-12">
        <div className="space-y-2 text-center md:text-left w-full md:w-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">Saved <span className="text-rose-500">Quizzes</span></h1>
          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-lg">Access your favorite learning content in one place.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-slate-100 shadow-sm"></div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 md:p-20 border border-slate-100 text-center flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-200 mb-6">
            <Heart size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase">No favorites yet</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium leading-relaxed">Explore our collection of quizzes and save the ones you love for later!</p>
          <button 
            onClick={() => navigate('/quizzes')}
            className="mt-8 px-10 py-5 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition shadow-2xl shadow-slate-900/10 active:scale-95"
          >
            Browse Library
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {favorites.map((fav) => {
            const isQuiz = fav.target_type === 'quiz';
            const isCommunity = fav.target_type === 'community';
            const details = fav.details;
            
            return (
              <div key={fav.id} className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group relative flex flex-col">
                <button 
                  onClick={() => removeFavorite(fav.id)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 size={18} />
                </button>
  
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-6 group-hover:text-white transition-colors ${
                  isQuiz ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600' : isCommunity ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600' : 'bg-violet-50 text-violet-600 group-hover:bg-violet-600'
                }`}>
                  <BookOpen size={24} />
                </div>
  
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 line-clamp-2 min-h-[56px]">
                  {details?.name || details?.title}
                </h3>
                
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                  {isQuiz ? (
                    <>Category: <span className="text-blue-600">{details?.category?.name || 'General'}</span></>
                  ) : isCommunity ? (
                    <><span className="text-emerald-600">Community</span></>
                  ) : (
                    <><span className="text-violet-600">Category Domain</span></>
                  )}
                </p>
  
                <button 
                  onClick={() => navigate(isQuiz ? `/quizzes/${fav.target_id}` : isCommunity ? `/communities` : `/communities?category=${fav.target_id}`)}
                  className="mt-auto w-full flex items-center justify-center gap-3 py-4 bg-slate-50 text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all group/btn active:scale-95"
                >
                  {isQuiz ? 'Start Quiz' : isCommunity ? 'View Community' : 'Explore Category'} 
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
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

export default FavoritesPage;
