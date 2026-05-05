import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Plus, Users, Globe, Lock, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import CommunityCard from "../../components/community/CommunityCard";
import CommunityFormModal from "../../components/community/CommunityFormModal";
import Toast from "../../components/ui/Toast";
import { getCommunities, joinCommunity, deleteCommunity } from "../../api/communityApi";

const filterOptions = ["All Communities", "My Communities", "Public", "Private"];
const sortOptions = ["Newest First", "Most Members", "A–Z"];

export default function Communities() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All Communities");
  const [sort, setSortBy] = useState("Newest First");
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role || "guest";
  const isGuest = !localStorage.getItem("token");

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
      setToast({ show: true, message: "Failed to load groups", type: "error" });
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
    try {
      const res = await joinCommunity(community.id);
      const isPublic = community.status === "public";
      
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === community.id
            ? {
                ...c,
                isMember: isPublic,
                join_status: isPublic ? null : "pending",
                members: isPublic ? c.members + 1 : c.members,
              }
            : c
        )
      );
      setToast({ show: true, message: res.data?.message || `Join request sent!`, type: "success" });
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.message || `Join request failed`, type: "error" });
    }
  };

  const handleEdit = (community) => {
    setEditData(community);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCommunity(id);
      setCommunities(prev => prev.filter(c => c.id !== id));
      setToast({ show: true, message: "Community deleted successfully", type: "success" });
    } catch (err) {
      setToast({ show: true, message: "Failed to delete community", type: "error" });
    }
  };

  const handleApproveMembers = (community) => {
    navigate(`/communities/${community.id}/requests`);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Global <span className="text-blue-600">Communities.</span></h1>
            <p className="text-slate-500 font-medium max-w-lg">Find your niche and learn together with specialized interest groups.</p>
        </div>
        {!isGuest && role !== "user" && (
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
                CREATE COMMUNITY
            </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <StatItem icon={<Users size={20} className="text-blue-600"/>} label="Total Groups" value={communities.length} />
         <StatItem icon={<TrendingUp size={20} className="text-emerald-600"/>} label="Global Members" value={communities.reduce((sum, c) => sum + c.members, 0).toLocaleString()} />
         <StatItem icon={<Sparkles size={20} className="text-orange-500"/>} label="Daily Growth" value="+12%" />
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search by name, topic or description..." 
                className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-[1.5rem] outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <Dropdown label={filter} options={filterOptions} onSelect={setFilter} />
           <Dropdown label={sort} options={sortOptions} onSelect={setSortBy} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[400px] bg-white rounded-[3rem] animate-pulse border border-slate-100"></div>
            ))}
        </div>
      ) : filteredCommunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCommunities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onJoin={handleJoin}
              onViewMore={() => navigate(`/communities/${community.id}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onApprove={handleApproveMembers}
            />
          ))}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center text-center space-y-6">
           <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
              <Users size={40} />
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase">No Groups Found</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Try exploring other categories</p>
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

function StatItem({ icon, label, value }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-shadow duration-500">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
}

function Dropdown({ label, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full md:w-auto" onMouseLeave={() => setOpen(false)}>
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 bg-white border border-slate-200 px-6 py-4 rounded-[1.5rem] text-[10px] font-black text-slate-700 uppercase tracking-widest hover:border-blue-600 transition-all"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2">
          {options.map(opt => (
            <button 
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className="w-full text-left px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
