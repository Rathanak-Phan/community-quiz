import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Loader2, CheckCircle, GraduationCap, ShieldCheck, Sun, Moon } from "lucide-react";
import { getSettings } from "../admin/services/settingService";
import { useTheme } from "../../providers/ThemeContext";
import { STORAGE_URL, BASE_URL } from "../../config/api";
import SEO from "../../components/common/SEO";

function ResetPassword() {
  const { toggleTheme, isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    token: searchParams.get("token") || "",
    email: searchParams.get("email") || "",
    code: searchParams.get("code") || "",
    password: "",
    password_confirmation: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({});

  useEffect(() => {
    getSettings().then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <SEO 
        title="Reset Password"
        description="Choose a strong, secure new password for your QuizSphere account to update your credentials."
        url="/reset-password"
      />
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60 animate-float"></div>
        <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-float" style={{ animationDelay: '-1.5s' }}></div>
      </div>

      <div className="w-full max-w-[480px] relative z-10 animate-slide-up">
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight mb-2">Set New Password</h1>
          <p className="text-[#64748B] text-xs md:text-sm font-medium text-center max-w-[320px]">
            Please choose a strong password to protect your account.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 md:p-12">
          {message ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">Password Reset!</h3>
              <p className="text-slate-500 text-sm mb-8">
                Your password has been successfully updated. <br/>Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold mb-6 animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#334155] ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium placeholder:text-slate-400"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#334155] ml-1">Confirm New Password</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium placeholder:text-slate-400"
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
