import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
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
import { getSettings } from "../../services/settingService";
import { STORAGE_URL } from "../../config/api";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  const [settings, setSettings] = useState({});

  useEffect(() => {
    getSettings().then(res => {
      setSettings(res.data);
      if (res.data.site_name) {
        document.title = `${res.data.site_name} | Login`;
      }
      if (res.data.logo) {
        const link = document.querySelector("link[rel*='icon']");
        if (link) {
          link.href = `${STORAGE_URL}/${res.data.logo}`;
        }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (token && !authLoading) {
      const from = location.state?.from || redirectPath;
      if (from) {
        navigate(from);
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

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setResendMessage("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      const from = location.state?.from || redirectPath;
      
      if (from) {
        navigate(from);
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
      const data = err.response?.data;
      setError(data?.message || "Invalid email or password");
      
      if (data?.requires_verification) {
        setUnverifiedEmail(data.email || email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/email/verification-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: unverifiedEmail })
      });
      const data = await response.json();
      setResendMessage(data.message || "Verification link sent!");
    } catch (err) {
      setResendMessage("Failed to resend link. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      {/* Background blobs for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60 animate-float"></div>
        <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-float" style={{ animationDelay: '-1.5s' }}></div>
      </div>

      <div className="w-full max-w-[480px] relative z-10 animate-slide-up">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8 md:mb-10 group cursor-pointer">
          <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500">
            {settings.logo ? (
              <img 
                src={`${STORAGE_URL}/${settings.logo}`} 
                alt={settings.site_name || "Logo"} 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            ) : (
              <div className="w-full h-full bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <GraduationCap size={28} className="md:w-8 md:h-8" />
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight mb-2">{settings.site_name || "QuizSphere"}</h1>
          <p className="text-[#64748B] text-xs md:text-sm font-medium text-center max-w-[320px]">
            Manage and share knowledge with your community
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 md:p-12">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold mb-6 animate-shake flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-blue-600 hover:text-blue-800 underline disabled:opacity-50 transition-colors"
                  >
                    {resendLoading ? "Sending..." : "Resend Link"}
                  </button>
                )}
              </div>
              {resendMessage && (
                <div className="text-emerald-600 mt-1 font-bold">
                  {resendMessage}
                </div>
              )}
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
                <Link to="/forgot-password" size={18} className="text-[11px] font-bold text-[#2563EB] hover:underline">Forgot password?</Link>
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
              className="flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-xl py-3.5 hover:bg-slate-50 transition-all duration-300 font-bold text-xs text-[#334155] active:scale-[0.98]"
            >
              <img src={googleLogo} alt="Google" className="w-5 h-5" />
              Google
            </button>
            <button 
              onClick={() => (window.location.href = `${BACKEND_URL}/api/auth/github/redirect`)}
              className="flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-xl py-3.5 hover:bg-slate-50 transition-all duration-300 font-bold text-xs text-[#334155] active:scale-[0.98]"
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
        <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 px-6">
          <Link to="#" className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest hover:text-slate-600">Documentation</Link>
          <Link to="#" className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest hover:text-slate-600">Privacy</Link>
          <Link to="#" className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest hover:text-slate-600">Terms</Link>
        </div>
        <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest text-center mt-6">
          © {new Date().getFullYear()} {settings.site_name || "QuizSphere"}. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
