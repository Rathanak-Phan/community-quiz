import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Glassmorphism Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition duration-300">
              <BookOpen size={20} />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 uppercase">Quizly</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <NavLink to="/" active={isActive("/")}>Home</NavLink>
            <NavLink to="/leaderboard" active={isActive("/leaderboard")}>Leaderboard</NavLink>
            <NavLink to="/communities" active={isActive("/communities")}>Communities</NavLink>
            {token && <NavLink to="/dashboard" active={isActive("/dashboard")}>Dashboard</NavLink>}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {token ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-600 transition shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-sm shadow-inner">
                  {user?.name?.charAt(0) || "U"}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 flex items-center gap-2 transition"
                >
                  <LogIn size={16} />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Padding for Fixed Header */}
      <main className="pt-20">
        <Outlet />
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <BookOpen size={16} />
              </div>
              <span className="font-black text-lg tracking-tight text-slate-900 uppercase">Quizly</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Empowering communities through shared knowledge and competitive learning. Join thousands of creators worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="/quizzes" className="hover:text-blue-600 transition">Explore Quizzes</Link></li>
              <li><Link to="/communities" className="hover:text-blue-600 transition">Communities</Link></li>
              <li><Link to="/leaderboard" className="hover:text-blue-600 transition">Global Ranking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link to="#" className="hover:text-blue-600 transition">Help Center</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">API Documentation</Link></li>
              <li><Link to="#" className="hover:text-blue-600 transition">Community Guidelines</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Newsletter</h4>
            <div className="space-y-4">
              <input type="text" placeholder="your@email.com" className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition outline-none" />
              <button className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-200/50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>&copy; 2026 Quizly AI Community. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-slate-900 transition">Privacy</Link>
            <Link to="#" className="hover:text-slate-900 transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, children, active }) {
  return (
    <Link 
      to={to} 
      className={`text-sm font-bold uppercase tracking-widest transition-all duration-300 relative py-2 ${
        active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]"></span>
      )}
    </Link>
  );
}