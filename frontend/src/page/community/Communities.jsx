import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, Plus, Users } from "lucide-react";
import CommunityCard from "../../components/community/CommunityCard";
import CommunityFormModal from "../../components/community/CommunityFormModal";
import Toast from "../../components/ui/Toast";
import { getCommunities } from "../../api/communityApi";

const sampleCommunities = [
  {
    id: 1,
    name: "Global History Enthusiasts",
    description: "A space for history buffs to share quizzes on civilizations, wars, and major historical events.",
    status: "public",
    members: 1084,
    isMember: false,
    memberAvatars: [
      { name: "Alice Chen", initials: "AC" },
      { name: "Bob Smith", initials: "BS" },
      { name: "Carol Davis", initials: "CD" },
    ],
  },
  {
    id: 2,
    name: "Quantum Physics Hub",
    description: "Deep dive into the world of quantum mechanics, particles, and modern physics concepts.",
    status: "public",
    members: 4555,
    isMember: false,
    memberAvatars: [
      { name: "Dr. Sarah Khan", initials: "SK" },
      { name: "Prof. James Wilson", initials: "JW" },
      { name: "Emma Rodriguez", initials: "ER" },
    ],
  },
  {
    id: 3,
    name: "Elite AI Developers",
    description: "Exclusive community for some engineers working on AI, machine learning, and neural networks.",
    status: "private",
    members: 43,
    isMember: false,
    memberAvatars: [
      { name: "Jordan Peterson", initials: "JP" },
      { name: "Alex Wang", initials: "AW" },
    ],
  },
];

const filterOptions = ["All Communities", "My Communities", "Public", "Private"];
const sortOptions = ["Newest First", "Most Members", "A–Z"];

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All Communities");
  const [sort, setSortBy] = useState("Newest First");
  const [communities, setCommunities] = useState(sampleCommunities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    // Load communities from API
    const loadCommunities = async () => {
      try {
        // Uncomment when backend is ready
        // const response = await getCommunities();
        // setCommunities(response.data);
        // For now, use sample data
        setCommunities(sampleCommunities);
      } catch (error) {
        console.error("Failed to load communities:", error);
        setToast({ show: true, message: "Failed to load communities", type: "error" });
      }
    };
    loadCommunities();
  }, []);

  const handleSuccess = (message) => {
    setToast({ show: true, message, type: "success" });
    // Reload communities after successful create/update
    // In a real app, you would fetch the updated communities from the API
  };

  const filteredCommunities = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let filtered = communities;

    // Apply search filter
    if (normalizedQuery) {
      filtered = filtered.filter(
        (community) =>
          community.name.toLowerCase().includes(normalizedQuery) ||
          community.description.toLowerCase().includes(normalizedQuery)
      );
    }

    // Apply status filter
    if (filter === "Public") {
      filtered = filtered.filter((c) => c.status === "public");
    } else if (filter === "Private") {
      filtered = filtered.filter((c) => c.status === "private");
    }
    // "All Communities" and "My Communities" show all for now

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "Most Members") {
        return b.members - a.members;
      }
      if (sort === "A–Z") {
        return a.name.localeCompare(b.name);
      }
      // Default: Newest First
      return b.id - a.id;
    });

    return sorted;
  }, [searchQuery, filter, sort, communities]);

  const totalCommunities = communities.length;
  const totalMembers = communities.reduce((sum, c) => sum + c.members, 0);

  const handleJoin = (community) => {
    // Update local state to mark as member
    setCommunities(
      communities.map((c) =>
        c.id === community.id ? { ...c, isMember: true } : c
      )
    );
    setToast({
      show: true,
      message: `Joined ${community.name}!`,
      type: "success",
    });
  };

  const handleViewMore = (community) => {
    // Navigate to community detail page
    console.log("View community:", community.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              Communities
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Manage learning communities where users can collaborate and share quizzes.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-700"
          >
            <Plus size={16} />
            Create Community
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                <Users size={20} />
              </div>
              <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-500">
                total
              </span>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase text-slate-400">
              Total Communities
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{totalCommunities}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <Users size={20} />
              </div>
              <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-500">
                members
              </span>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase text-slate-400">
              Total Members
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{totalMembers.toLocaleString()}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {filter}
                <ChevronDown size={16} />
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      filter === option ? "bg-blue-50 text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {sort}
                <ChevronDown size={16} />
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      sort === option ? "bg-blue-50 text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        {filteredCommunities.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onJoin={handleJoin}
                onViewMore={handleViewMore}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center py-12">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Users size={40} className="text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No communities yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by creating your first learning community to gather users and share targeted knowledge modules.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Community
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <CommunityFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Toast */}
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
