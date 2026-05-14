import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Grid2X2, BookOpen, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { getCategories } from "../../api/categoryApi";
import CategoryFormModal from "./components/CategoryFormModal";
import Toast from "../../components/ui/Toast";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "user";

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data?.data ?? res.data ?? []);
    } catch (error) {
      setToast({ show: true, message: "Failed to load categories", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Quiz <span className="text-blue-600">Categories.</span></h1>
            <p className="text-slate-500 font-medium max-w-lg">Browse subjects and topics to find the perfect challenge for your learning path.</p>
        </div>
        {role === "admin" && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95 group"
            >
                <Plus size={18} />
                NEW CATEGORY
            </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-6">
        <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search subjects (e.g. Science, Tech, History)..." 
                className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-50"></div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-2xl hover:shadow-blue-600/5 hover:border-blue-100 transition-all duration-500 group cursor-pointer relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                 <Grid2X2 size={24} className="group-hover:rotate-12 transition-transform" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{cat.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.quizzes_count || 0} Modules</p>
              
              <div className="absolute top-8 right-8 w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                 <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CategoryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => loadCategories()} />
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
    </div>
  );
}
