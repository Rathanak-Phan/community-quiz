import React, { useState, useEffect } from 'react';
import { Heart, Search, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';
import Toast from '../components/ui/Toast';

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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Saved <span className="text-rose-500">Quizzes</span></h1>
          <p className="text-slate-500 font-medium mt-2">Access your favorite learning content in one place.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 border border-slate-100 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-200 mb-6">
            <Heart size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase">No favorites yet</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">Explore our collection of quizzes and save the ones you love for later!</p>
          <button 
            onClick={() => navigate('/quizzes')}
            className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20"
          >
            Browse Quizzes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative">
              <button 
                onClick={() => removeFavorite(fav.id)}
                className="absolute top-6 right-6 w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
              >
                <Trash2 size={18} />
              </button>

              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen size={24} />
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 line-clamp-1">{fav.quiz?.title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                Category: <span className="text-blue-600">{fav.quiz?.category?.name || 'General'}</span>
              </p>

              <button 
                onClick={() => navigate(`/quizzes/${fav.quiz_id}`)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all group/btn"
              >
                Start Quiz <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
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
