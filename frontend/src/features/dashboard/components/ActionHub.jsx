import { 
  Plus, 
  Settings, 
  Users, 
  Search, 
  Zap, 
  BarChart, 
  ShieldCheck,
  PlayCircle,
  Trophy
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ActionHub({ role }) {
  const navigate = useNavigate();

  const getActions = () => {
    switch (role) {
      case "admin":
        return [
          { label: "Manage Users", icon: Users, path: "/admin/users", color: "bg-rose-500" },
          { label: "System Settings", icon: Settings, path: "/admin/settings", color: "bg-slate-900" },
          { label: "Moderation Queue", icon: ShieldCheck, path: "/admin/moderation/quizzes", color: "bg-amber-500" },
        ];
      case "quiz_maker":
        return [
          { label: "Create Quiz", icon: Plus, path: "/quizzes/create", color: "bg-blue-600", primary: true },
          { label: "View Insights", icon: BarChart, path: "/dashboard", color: "bg-indigo-600" },
          { label: "My Communities", icon: Users, path: "/communities/my", color: "bg-violet-600" },
        ];
      default:
        return [
          { label: "Browse Trends", icon: Zap, path: "/quizzes", color: "bg-emerald-600", primary: true },
          { label: "Continue Learning", icon: PlayCircle, path: "/quizzes/my-activity", color: "bg-teal-600" },
          { label: "Leaderboards", icon: Trophy, path: "/leaderboard", color: "bg-cyan-600" },
        ];
    }
  };

  const actions = getActions();

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 ${
              action.primary 
                ? `${action.color} text-white` 
                : "bg-white text-slate-600 border border-slate-100 hover:border-transparent"
            }`}
          >
            <div className={`p-2 rounded-xl ${action.primary ? "bg-white/20" : `${action.color} text-white`}`}>
              <Icon size={16} />
            </div>
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
