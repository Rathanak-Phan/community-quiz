import { Shield, Star, User } from "lucide-react";

export default function RoleBadge({ role, className = "" }) {
  const getRoleConfig = () => {
    switch (role?.toLowerCase()) {
      case "admin":
        return {
          label: "Administrator",
          icon: Shield,
          styles: "bg-rose-50 text-rose-600 border-rose-100",
          dotColor: "bg-rose-500"
        };
      case "quiz_maker":
      case "creator":
        return {
          label: "Quiz Creator",
          icon: Star,
          styles: "bg-blue-50 text-blue-600 border-blue-100",
          dotColor: "bg-blue-500"
        };
      case "sample user":
        return {
          label: "Sample User",
          icon: User,
          styles: "bg-emerald-50 text-emerald-600 border-emerald-100",
          dotColor: "bg-emerald-500"
        };
      case "user":
      case "student":
      default:
        return {
          label: "Platform Member",
          icon: User,
          styles: "bg-slate-50 text-slate-600 border-slate-100",
          dotColor: "bg-slate-500"
        };
    }
  };

  const config = getRoleConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${config.styles} ${className}`}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{config.label}</span>
      <span className={`w-1 h-1 rounded-full ${config.dotColor} animate-pulse ml-0.5`}></span>
    </div>
  );
}
