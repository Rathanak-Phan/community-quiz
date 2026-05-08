import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2,
  CheckCircle
} from "lucide-react";

import googleLogo from "../../assets/images/google_logo.png";
import githubLogo from "../../assets/images/github_logo.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "user", // Default: Learner
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Check your details.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center border border-slate-100">
           <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-8">
             <ShieldCheck size={40} />
           </div>
           <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">Account Created!</h2>
           <p className="text-slate-500 font-medium text-sm">Welcome to our global community.</p>
           <p className="text-slate-400 text-xs mt-6">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="w-full max-w-[540px] relative z-10 py-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-bold text-[#0F172A] tracking-tight">Quiz Community</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-12 text-center">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight mb-2">Create your account</h1>
          <p className="text-slate-500 text-sm font-medium mb-8">Join the global community of learners and educators.</p>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold mb-6 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5 text-left">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#334155] ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#334155] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#334155] ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#334155] ml-1">Confirm</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-[#334155] ml-1">Select Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'user'})}
                  className={`relative px-4 py-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                    formData.role === 'user' 
                    ? 'border-blue-600 bg-white ring-2 ring-blue-600/5' 
                    : 'border-slate-100 bg-[#F8FAFC] text-slate-400 grayscale'
                  }`}
                >
                  <div className={`transition-colors ${formData.role === 'user' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <UserPlus size={22} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${formData.role === 'user' ? 'text-blue-900' : 'text-slate-400'}`}>Learner</span>
                  {formData.role === 'user' && (
                    <div className="absolute top-1.5 right-1.5 text-blue-600">
                      <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'quiz_maker'})}
                  className={`relative px-4 py-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                    formData.role === 'quiz_maker' 
                    ? 'border-blue-600 bg-white ring-2 ring-blue-600/5' 
                    : 'border-slate-100 bg-[#F8FAFC] text-slate-400 grayscale'
                  }`}
                >
                  <div className={`transition-colors ${formData.role === 'quiz_maker' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <BookOpen size={22} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${formData.role === 'quiz_maker' ? 'text-blue-900' : 'text-slate-400'}`}>Quiz Maker</span>
                  {formData.role === 'quiz_maker' && (
                    <div className="absolute top-1.5 right-1.5 text-blue-600">
                      <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" required />
              <p className="text-[10px] font-medium text-slate-500 leading-normal">
                I agree to the <Link to="#" className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and <Link to="#" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/10 active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Creating Account...
                </div>
              ) : "Create Account"}
            </button>
          </form>

          {/* Social Register */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-400 text-[9px]">Or join with</span>
            </div>
          </div>

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

          <p className="text-center text-xs font-medium text-slate-500 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-[#2563EB] font-bold hover:underline">Sign in here</Link>
          </p>
        </div>

        {/* Features Footer */}
        <div className="mt-8 flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-[#94A3B8]" />
            <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Verified Content</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-[#94A3B8]" />
            <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Global Community</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-[#94A3B8]" />
            <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Secure Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
