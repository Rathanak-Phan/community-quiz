import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "user", // Default role
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
      // Wait a moment then redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Check your details.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-12 text-center border border-slate-100">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
             <ShieldCheck size={40} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Success!</h2>
           <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Your account has been created.</p>
           <p className="text-slate-400 text-xs mt-4">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-50"></div>
      </div>

      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl shadow-slate-200/50 p-12 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-600/20 mb-6">
            <User size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Join Quizly</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Start your learning journey today</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">I want to be a...</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'user'})}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                    formData.role === 'user' 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
               >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    formData.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 shadow-sm'
                  }`}>
                    <User size={20} />
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-black uppercase tracking-tight ${formData.role === 'user' ? 'text-blue-900' : 'text-slate-600'}`}>Quiz Taker</p>
                    <p className="text-[10px] text-slate-400 font-bold">Solve quizzes & track progress</p>
                  </div>
               </button>

               <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'quiz_maker'})}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                    formData.role === 'quiz_maker' 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
               >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    formData.role === 'quiz_maker' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 shadow-sm'
                  }`}>
                    <BookOpen size={20} />
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-black uppercase tracking-tight ${formData.role === 'quiz_maker' ? 'text-blue-900' : 'text-slate-600'}`}>Quiz Maker</p>
                    <p className="text-[10px] text-slate-400 font-bold">Create & manage own quizzes</p>
                  </div>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Create Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-3xl flex items-start gap-4">
            <input type="checkbox" className="mt-1 w-4 h-4 rounded accent-blue-600" required />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose">
              I agree to the <Link to="#" className="text-blue-600 underline">Terms of Service</Link> and <Link to="#" className="text-blue-600 underline">Privacy Policy</Link>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center text-xs font-bold text-slate-400 mt-10 uppercase tracking-widest">
          Already a member?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
