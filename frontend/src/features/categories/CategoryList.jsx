import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Search, Grid2X2, Settings, Trash2, 
  Layout, Calendar, User, ChevronRight, Hash, Heart
} from "lucide-react";
import { getCategories, deleteCategory } from "../../api/categoryApi";
import { addFavorite, removeFavorite } from "../../services/favoriteService";
import api from "../../config/api";
import CategoryFormModal from "./components/CategoryFormModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Pagination from "../admin/components/Pagination";
import Toast from "../../components/ui/Toast";

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role?.name === "admin" || user?.role_id === 1;

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await api.get('/categories', {
        params: {
          page,
          search: searchQuery,
          per_page: 15
        }
      });
      setCategories(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditData(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditData(category);
    setFormModalOpen(true);
  };

  const handleFormSuccess = (message) => {
    showToast(message);
    fetchCategories();
  };

  const handleDeleteClick = (category) => {
    setDeleteModal({ open: true, id: category.id, name: category.name });
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteCategory(deleteModal.id);
      setDeleteModal({ open: false, id: null, name: "" });
      showToast("Category archived successfully!");
      fetchCategories();
    } catch (err) {
      setDeleteModal({ open: false, id: null, name: "" });
      showToast(err.response?.data?.message || "Failed to delete category.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleFavorite = async (cat) => {
    try {
      if (cat.is_favorite) {
        await removeFavorite(cat.favorite_id);
        showToast("Removed from favorites");
      } else {
        await addFavorite({ target_type: 'category', target_id: cat.id });
        showToast("Added to favorites");
      }
      fetchCategories();
    } catch (err) {
      showToast("Action failed", "error");
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest border border-violet-100">
              <Grid2X2 size={14} />
              {isAdmin ? "Global Taxonomy Management" : "Taxonomy Manager"}
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
             System <span className="text-violet-600">Categories.</span>
           </h1>
           <p className="text-slate-500 font-medium max-w-lg">
             Managing global classification system for all quizzes and communities across the platform.
           </p>
        </div>
        
        <button 
          onClick={handleOpenCreate}
          className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-violet-600 transition-all shadow-xl active:scale-95 group"
        >
          <div className="w-6 h-6 bg-white/10 rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform">
            <Plus size={16} />
          </div>
          New Category
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <StatItem icon={<Hash size={24} />} label="Total Classes" value={categories.length} color="violet" />
         <StatItem icon={<Layout size={24} />} label="Active Filters" value={categories.length} color="blue" />
         <StatItem icon={<User size={24} />} label="Permissions" value={isAdmin ? "Full Access" : "Maker"} color="emerald" />
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="relative flex-1 max-w-md group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search categories..." 
                className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-full outline-none focus:bg-white focus:border-violet-200 transition-all text-xs font-black uppercase tracking-widest"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] border-b border-slate-50">
                <th className="px-10 py-6">Domain</th>
                <th className="px-10 py-6">Description</th>
                <th className="px-10 py-6">Creator</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse"><td colSpan="4" className="px-10 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td></tr>
                ))
              ) : categories.length > 0 ? (
                categories.map((cat) => {
                  const canManage = cat.user_id === user?.id || isAdmin;
                  const isGlobal = cat.user?.role?.name === "admin" || !cat.user;
                  const isMine = cat.user_id === user?.id;
                  
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/30 transition-all group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${cat.color || 'bg-violet-600 shadow-violet-600/20'} flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:rotate-6 transition-transform`}>
                             {cat.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{cat.name}</p>
                              {isMine && (
                                <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase tracking-tighter">Own</span>
                              )}
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                               <Calendar size={10} /> {new Date(cat.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 max-w-xs">
                         <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                            {cat.description || "No description provided for this category domain."}
                         </p>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                               <div className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                  <User size={12} />
                                </div>
                                {isMine ? "You" : (cat.user?.name || "System Admin")}
                            </div>
                            {isGlobal && (
                               <span className="w-fit text-[7px] font-black bg-blue-50 text-blue-500 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest">Global Taxonomy</span>
                            )}
                         </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <button 
                               onClick={() => handleFavorite(cat)}
                               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-inner ${cat.is_favorite ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-300 hover:text-rose-500'}`}
                             >
                               <Heart size={18} fill={cat.is_favorite ? "currentColor" : "none"} />
                             </button>
                             
                           {canManage ? (
                             <>
                               <button 
                                 onClick={() => handleOpenEdit(cat)}
                                 className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-all shadow-inner"
                               >
                                 <Settings size={18} />
                               </button>
                               <button 
                                 onClick={() => handleDeleteClick(cat)}
                                 className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-all shadow-inner"
                               >
                                 <Trash2 size={18} />
                               </button>
                             </>
                           ) : (
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">Protected</span>
                           )}
                           <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all">
                              <ChevronRight size={18} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="4" className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No categories discovered</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryFormModal isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} onSuccess={handleFormSuccess} editData={editData} />
      <ConfirmModal 
        isOpen={deleteModal.open} 
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteModal.name}"? This action will archive the category and might affect quizzes assigned to it.`}
        onConfirm={handleDeleteConfirm} 
        onCancel={() => setDeleteModal({ open: false, id: null, name: "" })} 
        loading={deleteLoading} 
        confirmText="Archive Category"
      />
      
      <div className="mt-8">
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value, color }) {
  const colors = {
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all duration-500">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors group-hover:bg-slate-900 group-hover:text-white ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

export default CategoryList;
