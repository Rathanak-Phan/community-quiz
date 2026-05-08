import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Plus, Users, Globe, TrendingUp, Sparkles } from "lucide-react";
import CommunityCard from "../../components/community/CommunityCard";
import CommunityFormModal from "../../components/community/CommunityFormModal";
import Toast from "../../components/ui/Toast";
import { getCommunities, joinCommunity, leaveCommunity, deleteCommunity } from "../../api/communityApi";
import { useAuth } from "../../context/AuthContext";

const filterOptions = ["All Communities", "My Communities", "Public", "Private"];
const sortOptions = ["Newest First", "Most Members", "A–Z"];

export default function Communities() {
  const navigate = useNavigate();
  const { token, isAdmin, isQuizMaker } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All Communities");
  const [sort, setSortBy] = useState("Newest First");
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const canCreate = isAdmin || isQuizMaker;

  const loadCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCommunities();
      const list = res.data?.data ?? res.data ?? [];
      setCommunities(
        list.map((c) => ({
          ...c,
          members: c.members_count ?? c.members ?? 0,
          status: c.status ?? "public",
          isMember: c.is_member ?? false,
          memberAvatars: c.recent_members ?? [],
        }))
      );
    } catch (error) {
      console.error("Failed to load communities:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  const handleSuccess = (message) => {
    setToast({ show: true, message, type: "success" });
    loadCommunities();
  };

  const filteredCommunities = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let filtered = communities;

    if (normalizedQuery) {
      filtered = filtered.filter(
        (community) =>
          community.name.toLowerCase().includes(normalizedQuery) ||
          community.description.toLowerCase().includes(normalizedQuery)
      );
    }

    if (filter === "Public") {
      filtered = filtered.filter((c) => c.status === "public");
    } else if (filter === "Private") {
      filtered = filtered.filter((c) => c.status === "private");
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "Most Members") return b.members - a.members;
      if (sort === "A–Z") return a.name.localeCompare(b.name);
      return b.id - a.id;
    });

    return sorted;
  }, [searchQuery, filter, sort, communities]);

  const handleJoin = async (community) => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const res = await joinCommunity(community.id);
      setToast({ show: true, message: res.data?.message || "Join request processed", type: "success" });
      loadCommunities();
    } catch (err) {
      setToast({ show: true, message: "Action failed", type: "error" });
    }
  };

  const handleLeave = async (community) => {
    try {
      const res = await leaveCommunity(community.id);
      setToast({ show: true, message: res.data?.message || "Left community successfully", type: "success" });
      loadCommunities();
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || "Action failed", type: "error" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-20 pb-32">
      {/* Hero Section */}
      <div className="relative pt-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -z-10"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
               <Globe size={14} />
               Global Discovery
            </div>
            <div className="space-y-4">
                <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hubs.</span></h1>
                <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">Join elite knowledge circles, collaborate with global peers, and access exclusive community-driven quizzes.</p>
            </div>
          </div>
          {canCreate && (
              <button 
                onClick={() => {
                  setEditData(null);
                  setIsModalOpen(true);
                }}
                className="bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-widest flex items-center gap-4 hover:bg-blue-600 transition-all duration-500 shadow-2xl shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95 group"
              >
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center transition-all group-hover:rotate-90 group-hover:bg-white/20">
                    <Plus size={20} />
                  </div>
                  Launch Group
              </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <StatItem icon={<Users size={24} />} label="Total Communities" value={communities.length} color="blue" />
         <StatItem icon={<TrendingUp size={24} />} label="Global Members" value={communities.reduce((sum, c) => sum + c.members, 0).toLocaleString()} color="emerald" />
         <StatItem icon={<Sparkles size={24} />} label="Monthly Growth" value="+12.5%" color="orange" />
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-white/50 flex flex-col lg:flex-row items-center gap-8 sticky top-24 z-20">
        <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
            <input 
                type="text" 
                placeholder="Find your tribe (e.g. Science, Coding, Art)..." 
                className="w-full pl-16 pr-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.75rem] outline-none focus:bg-white focus:border-blue-600/20 focus:ring-8 focus:ring-blue-600/5 transition-all text-sm font-black text-slate-900 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
           <Dropdown label={filter} options={filterOptions} onSelect={setFilter} />
           <Dropdown label={sort} options={sortOptions} onSelect={setSortBy} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[450px] bg-white rounded-[3rem] animate-pulse border border-slate-100 shadow-sm"></div>
            ))}
        </div>
      ) : filteredCommunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredCommunities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onViewMore={() => navigate(`/communities/${community.id}`)}
              onEdit={(c) => { setEditData(c); setIsModalOpen(true); }}
              onDelete={async (id) => { await deleteCommunity(id); loadCommunities(); }}
              onApprove={(c) => navigate(`/communities/${c.id}/requests`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-40 flex flex-col items-center text-center space-y-8">
           <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center text-slate-200">
              <Users size={64} />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 uppercase">No Groups Found</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Try adjusting your search or filters</p>
           </div>
        </div>
      )}

      {/* Modals & Toasts */}
      <CommunityFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
        editData={editData}
      />

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}
    </div>
  );
}

function StatItem({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.03)] flex items-center gap-8 group hover:shadow-2xl transition-all duration-500">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-slate-900 group-hover:text-white ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function Dropdown({ label, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full lg:w-auto" onMouseLeave={() => setOpen(false)}>
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-6 bg-white border border-slate-200 px-8 py-5 rounded-[1.5rem] text-[10px] font-black text-slate-700 uppercase tracking-widest hover:border-blue-600 transition-all shadow-sm"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden py-3">
          {options.map(opt => (
            <button 
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className="w-full text-left px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
