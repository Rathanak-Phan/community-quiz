import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

import googleLogo from "../../assets/images/google_logo.png";
import githubLogo from "../../assets/images/github_logo.png";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-50"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl shadow-slate-200/50 p-12 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-600/20 mb-6">
            <BookOpen size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Welcome Back</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Log in to your Quizly account</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
              <Link to="#" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Forgot?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="flex items-center my-10">
          <div className="flex-grow h-px bg-slate-100"></div>
          <span className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Social Connect</span>
          <div className="flex-grow h-px bg-slate-100"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SocialBtn 
            icon={<img src={googleLogo} alt="Google" className="w-5 h-5" />} 
            label="Google" 
            onClick={() => (window.location.href = `${BACKEND_URL}/api/auth/google/redirect`)}
          />
          <SocialBtn 
            icon={<img src={githubLogo} alt="GitHub" className="w-5 h-5" />} 
            label="GitHub" 
            onClick={() => (window.location.href = `${BACKEND_URL}/api/auth/github/redirect`)}
          />
        </div>

        <p className="text-center text-xs font-bold text-slate-400 mt-10 uppercase tracking-widest">
          New here?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

function SocialBtn({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 border-2 border-slate-50 rounded-2xl py-4 hover:bg-slate-50 hover:border-slate-100 transition-all duration-300 active:scale-95"
    >
      {icon}
      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{label}</span>
    </button>
  );
}

export default Login;
