import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Grid2X2, Users, BookOpen,
  BarChart2, Heart, User, LogOut, Search, Bell, Settings, HelpCircle, Menu, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  // Admin Links
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "quiz_maker"] },
  { to: "/admin/categories", label: "Manage Categories", icon: Grid2X2, roles: ["admin"] },
  
  // Quiz Maker Links
  { to: "/quizzes/my", label: "My Quizzes", icon: BookOpen, roles: ["quiz_maker"] },
  
  // Student/User Links
  { to: "/quizzes", label: "Browse Quizzes", icon: Search, roles: ["user"] },
  { to: "/favorites", label: "Favorites", icon: Heart, roles: ["user"] },

  // Shared Links
  { to: "/communities", label: "Communities", icon: Users, roles: ["admin", "quiz_maker", "user"] },
  { to: "/leaderboard", label: "Leaderboard", icon: BarChart2, roles: ["admin", "quiz_maker", "user"] },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roleName = user?.role?.name || "user";

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(roleName)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabel = roleName === "admin" ? "Admin" : roleName === "quiz_maker" ? "Creator" : "Student";

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <BookOpen size={20} />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 uppercase">Quizly</span>
          </div>
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Main Menu</p>
          <nav className="space-y-1">
            {filteredNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} className="transition-transform group-hover:scale-110" />
                <span className="text-sm tracking-tight">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-6 py-4 mt-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Settings</p>
          <nav className="space-y-1">
            <SideLink icon={<Settings size={18}/>} label="Settings" />
            <SideLink icon={<HelpCircle size={18}/>} label="Help Center" />
          </nav>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 group font-bold"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:relative sm:block w-64 lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 transition-all font-medium text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden xs:flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 transition relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white shadow-sm"></span>
              </button>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-4 lg:pl-8 lg:border-l lg:border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 tracking-tight">{user?.name || "Anonymous"}</p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                    {roleLabel}
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xs lg:text-sm shadow-lg shadow-blue-600/20 border-2 border-white shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SideLink({ icon, label }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 group">
      <span className="transition-transform group-hover:scale-110">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}