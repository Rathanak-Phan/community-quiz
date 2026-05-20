import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Tag, 
  LogOut, 
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Activity,
  Sun,
  Moon
} from 'lucide-react';

import { useAuth } from '../../../providers/AuthContext';
import { useTheme } from '../../../providers/ThemeContext';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin/dashboard' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <Tag size={20} />, label: 'Categories', path: '/admin/categories' },
    { icon: <AlertTriangle size={20} />, label: 'Moderate Quizzes', path: '/admin/moderation/quizzes' },
    { icon: <Users size={20} />, label: 'Moderate Communities', path: '/admin/moderation/communities' },
    { icon: <Activity size={20} />, label: 'Activity Logs', path: '/admin/activity-logs' },
  ];

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-colors duration-300">
      <div className="p-8 pb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 animate-pulse-slow">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Admin <span className="text-blue-600">Panel</span></h1>
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Management Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-between px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 group
              ${isActive 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2' 
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white hover:translate-x-1'
              }
            `}
          >
            <div className="flex items-center gap-4">
              {item.icon}
              {item.label}
            </div>
            <ChevronRight size={14} className={`transition-transform duration-300 ${item.path ? 'group-hover:translate-x-1' : ''}`} />
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-50 dark:border-slate-800/50 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition duration-300 active:scale-95 cursor-pointer"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          onClick={() => {
            logout();
          }}
          className="flex-1 flex items-center gap-4 px-6 py-4 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-300 font-black uppercase text-[10px] tracking-widest"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
