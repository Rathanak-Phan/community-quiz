import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Grid2X2, Users, BookOpen,
  BarChart2, Heart, User, LogOut, Search, Bell, Settings, HelpCircle, Menu, X,
  Shield, AlertTriangle, ShieldCheck, Home, ClipboardCheck, GraduationCap, Award, Activity, Sun, Moon
} from "lucide-react";
import { useAuth } from "../../providers/AuthContext";
import { useTheme } from "../../providers/ThemeContext";
import UserAvatar from "../ui/UserAvatar";
import RoleBadge from "../ui/RoleBadge";
import RoleNavigator from "../ui/RoleNavigator";
import adminService from "../../features/admin/services/adminService";
import { getSettings } from "../../features/admin/services/settingService";
import { STORAGE_URL } from "../../config/api";

const navItems = [
  // Shared Top Links
  { to: "/", label: "Home", icon: Home, roles: ["admin", "quiz_maker", "user"] },

  // Dashboard for both
  { to: "/dashboard", label: "Dashboard Overview", icon: LayoutDashboard, roles: ["admin", "quiz_maker"] },
  
  // Admin Specific
  { to: "/admin/users", label: "Manage Users", icon: Shield, roles: ["admin"] },
  { to: "/admin/moderation/quizzes", label: "Moderate Quizzes", icon: AlertTriangle, roles: ["admin"] },
  { to: "/admin/moderation/communities", label: "Moderate Communities", icon: Users, roles: ["admin"] },
  { to: "/admin/maker-requests", label: "Maker Requests", icon: ShieldCheck, roles: ["admin"] },
  { to: "/admin/activity-logs", label: "Activity Logs", icon: Activity, roles: ["admin"] },
  { to: "/admin/settings", label: "Site Settings", icon: Settings, roles: ["admin"] },
  
  // Workspace / Quiz Maker Specific
  { to: "/quizzes/my", label: "My Quizzes", icon: BookOpen, roles: ["quiz_maker"] },
  { to: "/quizzes/my-activity", label: "My Activity", icon: ClipboardCheck, roles: ["user"] },
  { to: "/communities/my", label: "My Communities", icon: Users, roles: ["quiz_maker", "user"] },
  { to: "/become-creator", label: "Become a Creator", icon: Award, roles: ["user"] },
  { to: "/reviews/pending", label: "Pending Reviews", icon: ClipboardCheck, roles: ["quiz_maker", "admin"] },
  { to: "/categories", label: "Categories", icon: Grid2X2, roles: ["admin", "quiz_maker"] },

  // User Settings/Profile
  { to: "/favorites", label: "Favorites", icon: Heart, roles: ["user", "quiz_maker", "admin"] },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme: appTheme, toggleTheme, isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [settings, setSettings] = useState({});

  // Check if it's the active quiz attempt page
  const isQuizAttemptPage = location.pathname.match(/^\/attempts\/[^/]+$/);

  useEffect(() => {
    getSettings().then(res => {
      setSettings(res.data);
      if (res.data.site_name) {
        document.title = `${res.data.site_name} | Dashboard`;
      }
      if (res.data.logo) {
        const link = document.querySelector("link[rel*='icon']");
        if (link) {
          link.href = `${STORAGE_URL}/${res.data.logo}`;
        }
      }
    }).catch(() => {});
  }, []);

  const isAdmin = user?.role?.name === "admin" || Number(user?.role_id) === 1;
  const isQuizMaker = user?.role?.name === "quiz_maker" || Number(user?.role_id) === 2;
  const roleName = isAdmin ? "admin" : isQuizMaker ? "quiz_maker" : "user";

  const getTheme = () => {
    switch (roleName) {
      case "admin":
        return {
          primary: "blue-600",
          accent: "rose-500",
          bg: "bg-slate-50/50",
          sidebar: "bg-white",
          text: "text-slate-900",
          gradient: "from-indigo-50/50 via-white to-rose-50/20"
        };
      case "quiz_maker":
        return {
          primary: "indigo-600",
          accent: "violet-500",
          bg: "bg-blue-50/30",
          sidebar: "bg-white",
          text: "text-slate-900",
          gradient: "from-blue-50/50 via-white to-violet-50/20"
        };
      default:
        return {
          primary: "emerald-600",
          accent: "teal-500",
          bg: "bg-emerald-50/20",
          sidebar: "bg-white",
          text: "text-slate-900",
          gradient: "from-emerald-50/50 via-white to-teal-50/20"
        };
    }
  };

  const theme = getTheme();

  useEffect(() => {
    if (isAdmin) {
      const fetchCount = async () => {
        try {
          const res = await adminService.getMakerRequestsCount();
          setPendingRequestsCount(res.data.count || 0);
        } catch (err) {
          console.error("Failed to fetch pending requests count", err);
        }
      };
      fetchCount();
      const interval = setInterval(fetchCount, 60000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(roleName)
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`flex min-h-screen ${theme.bg} dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40 selection:text-blue-700 dark:selection:text-blue-300 transition-colors duration-700`}>
      {/* Background decoration */}
      <div className={`fixed inset-0 bg-gradient-to-br ${theme.gradient} dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 pointer-events-none z-0`}></div>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && !isQuizAttemptPage && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      {!isQuizAttemptPage && (
        <aside className={`
          fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-md border-slate-100 dark:border-slate-800/80 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
        <div className="h-20 px-8 flex items-center justify-between shadow-md border-slate-100 dark:border-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
               {settings.logo ? (
                 <img 
                   src={`${STORAGE_URL}/${settings.logo}`} 
                   alt={settings.site_name || "Logo"} 
                   className="w-full h-full object-contain drop-shadow-md"
                 />
               ) : (
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                   <GraduationCap size={24} />
                 </div>
               )}
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white uppercase">{settings.site_name || "Quizly"}</span>
          </div>
          <button 
            className="lg:hidden p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* User Profile in Sidebar (especially for mobile) */}
        <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 lg:hidden">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="md" className="border-2 border-white dark:border-slate-850 shadow-sm" />
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">{user?.name || "Guest"}</p>
              <RoleBadge role={roleName} className="mt-1" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Main Menu</p>
          <nav className="space-y-1">
            {filteredNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={18} className="transition-transform group-hover:scale-110" />
                <span className="text-sm tracking-tight flex-1">{label}</span>
                {label === "Maker Requests" && pendingRequestsCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-xl shadow-lg shadow-rose-500/20 animate-pulse">
                    {pendingRequestsCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-6 py-4 mt-auto">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Support</p>
          <nav className="space-y-1">
            <SideLink to="/profile" icon={<Settings size={18}/>} label="Settings" onClick={() => setIsMobileMenuOpen(false)} dark={isDark} />
            <SideLink 
              to={settings.help_center_type === 'external' ? settings.help_center_url : "/help"} 
              icon={<HelpCircle size={18}/>} 
              label="Help Center" 
              onClick={() => setIsMobileMenuOpen(false)} 
              isExternal={settings.help_center_type === 'external'}
              dark={isDark}
            />
          </nav>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 group font-bold"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Top Header */}
        {!isQuizAttemptPage && (
          <header className="h-20 premium-header backdrop-blur-md shadow-md border-slate-100 dark:border-slate-800/50 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div className="hidden sm:relative sm:block w-64 lg:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search everything..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-full outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-200 dark:focus:border-blue-800 transition-all font-medium text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-8">
              <div className="hidden xs:flex items-center gap-2">
                {/* Beautiful Premium Theme Toggle Button in Dashboard Header */}
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent dark:border-slate-800/40 transition relative cursor-pointer group"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <Sun size={20} className="rotate-0 transition-transform duration-500 group-hover:rotate-45" />
                  ) : (
                    <Moon size={20} className="rotate-0 transition-transform duration-500 group-hover:-rotate-12" />
                  )}
                </button>

                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition relative">
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></span>
                </button>
              </div>
              
              <div className="flex items-center gap-3 lg:gap-4 lg:pl-8 lg:border-l lg:border-slate-100 dark:border-slate-800">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{user?.name || "Anonymous"}</p>
                  <RoleBadge role={roleName} />
                </div>
                <UserAvatar user={user} size="md" className="lg:w-12 lg:h-12 border-2 border-white dark:border-slate-800" />
              </div>
            </div>
          </header>
        )}

        {/* Content */}
        <main className={`flex-1 overflow-y-auto ${isQuizAttemptPage ? 'p-0' : 'p-3 sm:p-6 lg:p-10'} bg-slate-50/50 dark:bg-slate-950/40`}>
          <div className={isQuizAttemptPage ? '' : 'max-w-6xl mx-auto'}>
            <Outlet />
          </div>
        </main>
        
        {/* Role Navigator for Demo Context */}
        {!isQuizAttemptPage && <RoleNavigator role={roleName} />}
      </div>
    </div>
  );
}

function SideLink({ icon, label, to, onClick, isExternal, dark }) {
  const content = (
    <>
      <span className="transition-transform group-hover:scale-110">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </>
  );

  const className = (isActive) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
    }`;

  if (isExternal) {
    return (
      <a 
        href={to} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={onClick}
        className={className(false)}
      >
        {content}
      </a>
    );
  }

  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => className(isActive)}
    >
      {content}
    </NavLink>
  );
}