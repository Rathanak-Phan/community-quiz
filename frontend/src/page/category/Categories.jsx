import { useMemo, useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  BookOpen,
  FlaskConical,
  Globe2,
  Palette,
  Sparkles,
  ShieldCheck,
  Layers,
} from "lucide-react";
import CategoryFormModal from "../../components/category/CategoryFormModal";
import Toast from "../../components/ui/Toast";
import { getCategories } from "../../api/categoryApi";

const iconMap = {
  BookOpen,
  FlaskConical,
  Globe2,
  Palette,
  Sparkles,
  ShieldCheck,
  Layers,
};

const colorMap = ["bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500", "bg-cyan-500", "bg-pink-500"];

const sampleCategories = [
  {
    id: 1,
    name: "Mathematics",
    description: "Algebra, Calculus, Geometry and logic puzzles for all skill levels.",
    quizzes: 32,
    icon: BookOpen,
    color: "bg-sky-500",
  },
  {
    id: 2,
    name: "Science",
    description: "Explore the wonders of biology, chemistry, physics, and space.",
    quizzes: 24,
    icon: FlaskConical,
    color: "bg-emerald-500",
  },
  {
    id: 3,
    name: "Programming",
    description: "Test your knowledge in Python, JavaScript, Java, and modern web development.",
    quizzes: 48,
    icon: Layers,
    color: "bg-violet-500",
  },
  {
    id: 4,
    name: "History",
    description: "Dive into world wars, ancient civilizations, and major historical events.",
    quizzes: 18,
    icon: ShieldCheck,
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Geography",
    description: "Capitals, flags, landmarks, and cultural trivia from every continent.",
    quizzes: 15,
    icon: Globe2,
    color: "bg-cyan-500",
  },
  {
    id: 6,
    name: "Art & Design",
    description: "Masterpieces, art movements, typography, and contemporary design ideas.",
    quizzes: 12,
    icon: Palette,
    color: "bg-pink-500",
  },
];

const sortOptions = ["Newest First", "Most Quizzes", "A–Z", "Z–A"];

export default function Categories() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(sortOptions[0]);
  const [categories, setCategories] = useState(sampleCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    // Load categories from API
    const loadCategories = async () => {
      try {
        // Uncomment when backend is ready
        // const response = await getCategories();
        // setCategories(response.data);
        // For now, use sample data
        setCategories(sampleCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setToast({ show: true, message: "Failed to load categories", type: "error" });
      }
    };
    loadCategories();
  }, []);

  const handleSuccess = (message) => {
    setToast({ show: true, message, type: "success" });
    // Reload categories after successful create/update
    // In a real app, you would fetch the updated categories from the API
    // For now, just show the success message
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery) ||
      category.description.toLowerCase().includes(normalizedQuery)
    );

    return [...filtered].sort((a, b) => {
      if (sort === "Most Quizzes") {
        return b.quizzes - a.quizzes;
      }
      if (sort === "A–Z") {
        return a.name.localeCompare(b.name);
      }
      if (sort === "Z–A") {
        return b.name.localeCompare(a.name);
      }
      return b.id - a.id;
    });
  }, [query, sort, categories]);

  const totalQuizzes = categories.reduce((sum, category) => sum + category.quizzes, 0);
  const activeCategories = categories.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              Categories
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Organize quizzes into different categories to help users find content.
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-700">
            <Plus size={16} />
            Create Category
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                <BookOpen size={20} />
              </div>
              <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-500">
                total
              </span>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase text-slate-400">
              Total Categories
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{sampleCategories.length}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <Sparkles size={20} />
              </div>
              <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-500">
                active
              </span>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase text-slate-400">
              Active Categories
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{activeCategories}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-50 text-violet-600">
                <FlaskConical size={20} />
              </div>
              <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-500">
                quizzes
              </span>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase text-slate-400">
              Total Quizzes
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{totalQuizzes}</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1.2fr_auto] items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-center gap-3 justify-between md:justify-end">
              <span className="text-sm text-slate-500">Sort by:</span>
              <div className="relative w-full md:w-auto">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
          {filteredCategories.map((category) => {
            const Icon = iconMap[category.icon] || BookOpen;
            return (
              <article
                key={category.id}
                className="group rounded-4xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className={`${category.color} flex h-14 w-14 items-center justify-center rounded-3xl text-white`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition hover:border-blue-200 hover:text-blue-600"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:text-rose-600"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <h2 className="mt-6 text-xl font-semibold text-slate-950">
                  {category.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {category.description}
                </p>

                <div className="mt-6 flex items-center justify-between gap-4 text-sm">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 font-semibold uppercase text-slate-600">
                    {category.quizzes} quizzes
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    View all
                    <ChevronRight size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />

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
