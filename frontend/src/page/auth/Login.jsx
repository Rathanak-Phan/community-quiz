import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Loader2 
} from "lucide-react";

import googleLogo from "../../assets/images/google_logo.png";
import githubLogo from "../../assets/images/github_logo.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get("redirect");

  const { login, token, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && !authLoading) {
      if (redirectPath) {
        navigate(redirectPath);
        return;
      }
      const userDataStr = localStorage.getItem("user");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const isAdmin = userData.role?.name === "admin" || Number(userData.role_id) === 1;
        const isMaker = userData.role?.name === "quiz_maker" || Number(userData.role_id) === 2;
        
        if (isAdmin) {
            navigate("/admin/dashboard");
        } else if (isMaker) {
            navigate("/dashboard");
        } else {
            navigate("/"); // Regular user goes home
        }
      }
    }
  }, [token, authLoading, navigate, redirectPath]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (redirectPath) {
        navigate(redirectPath);
        return;
      }
      const userData = res.data.user;
      const isAdmin = (userData.role?.name === "admin" || Number(userData.role_id) === 1);
      
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
      {/* Background blobs for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="w-full max-w-[480px] relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-[#2563EB] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 mb-6">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight mb-2">Quiz Community</h1>
          <p className="text-[#64748B] text-sm font-medium text-center max-w-[320px]">
            Manage and share knowledge with your community
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10 md:p-12">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold mb-6 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#334155] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-[#334155]">Password</label>
                <Link to="#" className="text-[11px] font-bold text-[#2563EB] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-12 pr-12 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3 px-1">
              <input 
                type="checkbox" 
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs font-medium text-[#64748B] cursor-pointer">Remember me for 30 days</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Sign in <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center my-8">
            <div className="flex-grow h-px bg-slate-100"></div>
            <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow h-px bg-slate-100"></div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => (window.location.href = `${BACKEND_URL}/api/auth/google/redirect`)}
              className="flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-xl py-3.5 hover:bg-slate-50 transition-all duration-300 font-bold text-xs text-[#334155]"
            >
              <img src={googleLogo} alt="Google" className="w-5 h-5" />
              Google
            </button>
            <button 
              onClick={() => (window.location.href = `${BACKEND_URL}/api/auth/github/redirect`)}
              className="flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-xl py-3.5 hover:bg-slate-50 transition-all duration-300 font-bold text-xs text-[#334155]"
            >
              <img src={githubLogo} alt="GitHub" className="w-5 h-5" />
              GitHub
            </button>
          </div>

          <p className="text-center text-xs font-medium text-slate-500 mt-10">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#2563EB] font-bold hover:underline">Register now</Link>
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-12 flex justify-center gap-6">
          <Link to="#" className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest hover:text-slate-600">Documentation</Link>
          <Link to="#" className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest hover:text-slate-600">Privacy</Link>
          <Link to="#" className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest hover:text-slate-600">Terms</Link>
        </div>
        <p className="text-[10px] text-[#CBD5E1] font-medium text-center mt-4">
          © 2024 Quiz Community. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
