import { useState } from "react";
import { Info, X, Zap, Shield, Star, ChevronRight } from "lucide-react";

export default function RoleNavigator({ role }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-[100]"
    >
      <Info size={24} />
    </button>
  );

  const getRoleInfo = () => {
    switch (role) {
      case "admin":
        return {
          title: "System Administrator",
          icon: Shield,
          color: "text-rose-500",
          bg: "bg-rose-50",
          capabilities: [
            "Manage all platform users",
            "Moderate community content",
            "Configure site-wide settings",
            "Review Creator applications"
          ]
        };
      case "quiz_maker":
        return {
          title: "Quiz Creator",
          icon: Star,
          color: "text-blue-500",
          bg: "bg-blue-50",
          capabilities: [
            "Create & publish complex quizzes",
            "Manage private communities",
            "Analyze student performance",
            "Earn badges & reputation"
          ]
        };
      default:
        return {
          title: "Platform Student",
          icon: Zap,
          color: "text-emerald-500",
          bg: "bg-emerald-50",
          capabilities: [
            "Solve quizzes across categories",
            "Join learning communities",
            "Track personal growth stats",
            "Compete on global leaderboards"
          ]
        };
    }
  };

  const info = getRoleInfo();
  const Icon = info.icon;

  return (
    <div className="fixed bottom-8 right-8 w-80 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className={`p-6 ${info.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${info.color} shadow-sm`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Role</p>
            <h4 className="font-black text-slate-900 text-sm uppercase">{info.title}</h4>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-6 space-y-4">
        <p className="text-xs font-bold text-slate-500 leading-relaxed">
          You are currently experiencing the platform as a <span className={info.color}>{info.title}</span>. 
          Here's what you can do:
        </p>
        
        <ul className="space-y-3">
          {info.capabilities.map((cap, i) => (
            <li key={i} className="flex items-start gap-3 group">
              <div className={`mt-1 w-1.5 h-1.5 rounded-full ${info.color.replace('text', 'bg')} shrink-0`}></div>
              <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{cap}</span>
            </li>
          ))}
        </ul>
        
        <button className="w-full mt-4 flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-900 transition-all duration-300">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">View Platform Guide</span>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-white" />
        </button>
      </div>
      
      <div className="px-6 py-4 bg-slate-900 text-center">
        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Demo Experience Mode</p>
      </div>
    </div>
  );
}
