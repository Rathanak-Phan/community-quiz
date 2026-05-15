import { useState, useEffect } from "react";
import { Info, X, Zap, Shield, Star, ChevronRight, Clock, Settings2 } from "lucide-react";

export default function RoleNavigator({ role }) {
  const [isOpen, setIsOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isAutoHideEnabled, setIsAutoHideEnabled] = useState(true);

  useEffect(() => {
    let timer;
    if (isOpen && isAutoHideEnabled && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isAutoHideEnabled) {
      setIsOpen(false);
    }

    return () => clearInterval(timer);
  }, [isOpen, isAutoHideEnabled, timeLeft]);

  // Reset timer when reopened
  const handleOpen = () => {
    setIsOpen(true);
    setTimeLeft(5);
  };

  if (!isOpen) return (
    <button 
      onClick={handleOpen}
      className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-[100]"
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
    <div className="fixed bottom-8 right-8 w-80 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-300 overflow-hidden z-[100] animate-in slide-in-from-bottom-10 duration-500">
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
        <div className="flex items-center gap-3">
          {isAutoHideEnabled && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/50 rounded-full border border-white/20">
              <Clock size={12} className="text-slate-500" />
              <span className="text-[10px] font-black text-slate-600 w-4">{timeLeft}s</span>
            </div>
          )}
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition">
            <X size={20} />
          </button>
        </div>
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
        
        <button className="w-full mt-4 flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-slate-900 transition-all duration-300">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">View Platform Guide</span>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-white" />
        </button>
      </div>
      
      <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between relative">
        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Demo Mode</p>
        <button 
          onClick={() => setIsAutoHideEnabled(!isAutoHideEnabled)}
          className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all ${isAutoHideEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}
        >
          <Settings2 size={10} />
          <span className="text-[9px] font-black uppercase tracking-widest">
            Auto-hide: {isAutoHideEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Progress Bar Line */}
        {isAutoHideEnabled && (
          <div className="absolute bottom-0 left-0 h-[2px] bg-emerald-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 5) * 100}%` }}></div>
        )}
      </div>
    </div>
  );
}
