import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../providers/AuthContext";
import SEO from "../../components/common/SEO";
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
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { STORAGE_URL, BASE_URL } from "../../config/api";

import googleLogo from "../../assets/images/google_logo.png";
import githubLogo from "../../assets/images/github_logo.png";

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
  const [settings, setSettings] = useState({});

  useEffect(() => {
    import('../admin/services/settingService').then(m => m.getSettings()).then(res => {
      setSettings(res.data);
      if (res.data.site_name) {
        document.title = `${res.data.site_name} | Create Account`;
      }
      if (res.data.logo) {
        const link = document.querySelector("link[rel*='icon']");
        if (link) {
          link.href = `${STORAGE_URL}/${res.data.logo}`;
        }
      }
    }).catch(() => {});
  }, []);

  const isRegistrationDisabled = settings.allow_registration === "0";

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email) {
        setError("Please fill in your name and email.");
        return;
      }
      setError("");
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

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
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Check your details.");
      setLoading(false);
    }
  };

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      const response = await fetch(`${BASE_URL}/api/email/verification-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      setResendMessage(data.message || "Verification link sent!");
    } catch (err) {
      setResendMessage("Failed to resend link. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const handleCodeVerify = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const response = await fetch(`${BASE_URL}/api/email/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: formData.email, code: verifyCode })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(false); // Close modal
        navigate("/login", { state: { message: "Email verified! You can now login." } });
      } else {
        setVerifyError(data.message || "Invalid code.");
      }
    } catch (err) {
      setVerifyError("Verification failed. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 text-center border border-slate-100 animate-slide-up">
           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-6">
             <Mail size={32} />
           </div>
           <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">Verify Your Email</h2>
           <p className="text-slate-500 font-medium text-xs mb-6">
             We've sent a 6-digit code and a verification link to: <br/>
             <span className="font-bold text-blue-600">{formData.email}</span>
           </p>

           {verifyError && (
             <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-[10px] font-bold mb-4 animate-shake">
               {verifyError}
             </div>
           )}

           <form onSubmit={handleCodeVerify} className="space-y-4 mb-6">
             <input
               type="text"
               maxLength="6"
               placeholder="000000"
               className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-center text-2xl font-black tracking-[0.4em] outline-none focus:bg-white focus:border-blue-600 transition-all"
               value={verifyCode}
               onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
               required
             />
             <button
               type="submit"
               disabled={verifyLoading}
               className="w-full bg-[#2563EB] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
             >
               {verifyLoading ? "Verifying..." : "Verify Code"}
             </button>
           </form>
           
           <div className="flex flex-col gap-3">
             <button
               type="button"
               onClick={handleResendVerification}
               disabled={resendLoading}
               className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
             >
               {resendLoading ? "Sending..." : "Didn't get the email? Resend"}
             </button>
             {resendMessage && (
               <p className="text-[10px] text-emerald-600 font-bold">{resendMessage}</p>
             )}
           </div>

           <div className="mt-8 pt-6 border-t border-slate-50">
             <Link 
               to="/login" 
               className="text-slate-400 font-bold text-xs hover:text-blue-600 transition-colors"
             >
               Return to Login
             </Link>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <SEO 
        title="Register" 
        description="Join QuizSphere today! Create your account to start taking quizzes, joining communities, and sharing your knowledge."
        url="/register"
      />
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60 animate-float"></div>
        <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-float" style={{ animationDelay: '-1.5s' }}></div>
      </div>

      <div className="w-full max-w-[540px] relative z-10 py-4 md:py-8 animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6 md:mb-10 hover:scale-105 transition-transform cursor-pointer group">
          <div className="w-10 h-10 flex items-center justify-center">
            {settings.logo ? (
              <img 
                src={`${STORAGE_URL}/${settings.logo}`} 
                alt={settings.site_name || "Logo"} 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <GraduationCap size={24} />
              </div>
            )}
          </div>
          <span className="text-xl font-bold text-[#0F172A] tracking-tight">{settings.site_name || "QuizSphere"}</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 md:p-12 text-center">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((step) => (
              <div 
                key={step}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentStep >= step ? 'w-12 bg-blue-600' : 'w-6 bg-slate-100'
                }`}
              />
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight mb-2">
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Choose Your Path"}
            {currentStep === 3 && "Security First"}
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium mb-8">
            {currentStep === 1 && "Let's start with who you are."}
            {currentStep === 2 && "Select how you'll use the platform."}
            {currentStep === 3 && "Protect your account with a strong password."}
          </p>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold mb-6 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5 text-left">
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
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
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                {/* Role Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'user'})}
                    className={`relative px-4 py-6 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 active:scale-95 ${
                      formData.role === 'user' 
                      ? 'border-blue-600 bg-white ring-4 ring-blue-600/5' 
                      : 'border-slate-100 bg-[#F8FAFC] text-slate-400 grayscale hover:grayscale-0 hover:border-blue-200'
                    }`}
                  >
                    <div className={`transition-colors ${formData.role === 'user' ? 'text-blue-600' : 'text-slate-400'}`}>
                      <UserPlus size={28} />
                    </div>
                    <div className="text-center">
                      <span className={`block text-xs font-bold uppercase tracking-widest ${formData.role === 'user' ? 'text-blue-900' : 'text-slate-400'}`}>Learner</span>
                      <span className="text-[10px] text-slate-400 font-medium">Join & take quizzes</span>
                    </div>
                    {formData.role === 'user' && (
                      <div className="absolute top-2 right-2 text-blue-600 animate-fade-in">
                        <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'quiz_maker'})}
                    className={`relative px-4 py-6 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 active:scale-95 ${
                      formData.role === 'quiz_maker' 
                      ? 'border-blue-600 bg-white ring-4 ring-blue-600/5' 
                      : 'border-slate-100 bg-[#F8FAFC] text-slate-400 grayscale hover:grayscale-0 hover:border-blue-200'
                    }`}
                  >
                    <div className={`transition-colors ${formData.role === 'quiz_maker' ? 'text-blue-600' : 'text-slate-400'}`}>
                      <BookOpen size={28} />
                    </div>
                    <div className="text-center">
                      <span className={`block text-xs font-bold uppercase tracking-widest ${formData.role === 'quiz_maker' ? 'text-blue-900' : 'text-slate-400'}`}>Quiz Maker</span>
                      <span className="text-[10px] text-slate-400 font-medium">Create & manage content</span>
                    </div>
                    {formData.role === 'quiz_maker' && (
                      <div className="absolute top-2 right-2 text-blue-600 animate-fade-in">
                        <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                {/* Password Row */}
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
                  <label className="text-xs font-bold text-[#334155] ml-1">Confirm Password</label>
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

                {/* Terms */}
                <div className="flex items-start gap-3 pt-2">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" required />
                  <p className="text-[10px] font-medium text-slate-500 leading-normal">
                    I agree to the <Link to="/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-4 rounded-xl font-bold text-sm text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                >
                  Back
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-grow bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 active:scale-95"
                >
                  Continue
                </button>
              ) : (
                !isRegistrationDisabled && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-grow bg-[#2563EB] text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Creating...
                      </div>
                    ) : "Create Account"}
                  </button>
                )
              )}
            </div>
          </form>

          {/* Social Register (Only on Step 1) */}
          {currentStep === 1 && (
            <>
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
                  onClick={() => (window.location.href = `${BASE_URL}/api/auth/google/redirect?role=${formData.role}`)}
                  className="flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-xl py-3.5 hover:bg-slate-50 transition-all duration-300 font-bold text-xs text-[#334155] active:scale-[0.98]"
                >
                  <img src={googleLogo} alt="Google" className="w-5 h-5" />
                  Google
                </button>
                <button 
                  onClick={() => (window.location.href = `${BASE_URL}/api/auth/github/redirect?role=${formData.role}`)}
                  className="flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-xl py-3.5 hover:bg-slate-50 transition-all duration-300 font-bold text-xs text-[#334155] active:scale-[0.98]"
                >
                  <img src={githubLogo} alt="GitHub" className="w-5 h-5" />
                  GitHub
                </button>
              </div>
            </>
          )}

          <p className="text-center text-xs font-medium text-slate-500 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-[#2563EB] font-bold hover:underline">Sign in here</Link>
          </p>
        </div>

        {/* Features Footer */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-8 px-4">
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
