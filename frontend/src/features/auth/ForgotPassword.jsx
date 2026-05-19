import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle, GraduationCap } from "lucide-react";
import { getSettings } from "../admin/services/settingService";
import { useEffect } from "react";
import { STORAGE_URL, BASE_URL } from "../../config/api";
import SEO from "../../components/common/SEO";
import RecaptchaWidget from "../../components/common/RecaptchaWidget";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({});
  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    getSettings().then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setMessage("");

    if (settings.recaptcha_site_key && !recaptchaToken) {
      setError("Please verify that you are not a robot.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, recaptcha_token: recaptchaToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setResendTimer(60); // Start 60s countdown
      } else {
        setError(data.message || "Failed to send reset link.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setCodeLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/api/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/reset-password?email=${email}&code=${code}`);
      } else {
        setError(data.message || "Invalid or expired code.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setCodeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <SEO 
        title="Forgot Password"
        description="Recover system access. Receive verification instructions to reset your account password securely."
        url="/forgot-password"
      />
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight mb-2">Password Recovery</h1>
          <p className="text-[#64748B] text-xs md:text-sm font-medium text-center max-w-[320px]">
            {message ? "Enter the 6-digit code sent to your email." : "We'll send you instructions to reset your password."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 md:p-12">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold mb-6 animate-shake">
              {error}
            </div>
          )}

          {message ? (
            <div className="animate-fade-in space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                <p className="text-blue-700 text-xs font-bold text-center">
                  Code sent to: {email}
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#334155] ml-1 uppercase tracking-widest">6-Digit Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-4 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-center text-2xl font-black tracking-[0.5em] placeholder:text-slate-300"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={codeLoading}
                  className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {codeLoading ? <Loader2 className="animate-spin" size={18} /> : "Verify Code"}
                </button>
              </form>

              <div className="text-center pt-4">
                <button 
                  onClick={handleSubmit} 
                  disabled={loading || resendTimer > 0}
                  className="transition-colors flex items-center justify-center gap-1.5 mx-auto"
                >
                  {loading ? (
                    <span className="text-slate-400 font-medium text-xs">Sending...</span>
                  ) : resendTimer > 0 ? (
                    <span className="flex items-center gap-2 text-slate-400 font-medium text-xs bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
                      Didn't get the code? Resend in 
                      <span className="text-[#2563EB] font-black bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                        {resendTimer}s
                      </span>
                    </span>
                  ) : (
                    <div className="flex flex-col items-center">
                      <p className="text-xs text-slate-500 mb-2">Didn't get the code?</p>
                      <span className="text-blue-600 font-bold text-xs hover:text-blue-800 underline cursor-pointer">
                        Resend Email
                      </span>
                    </div>
                  )}
                </button>
              </div>

              <div className="pt-6 border-t border-slate-50 text-center">
                 <Link to="/login" className="text-slate-400 font-bold text-xs hover:text-blue-600 transition-colors">
                   Back to Login
                 </Link>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* reCAPTCHA Widget */}
                {settings.recaptcha_site_key && (
                  <RecaptchaWidget
                    siteKey={settings.recaptcha_site_key}
                    onVerify={setRecaptchaToken}
                    onExpire={() => setRecaptchaToken("")}
                  />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Send Instructions"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-[#64748B] font-bold text-xs hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
