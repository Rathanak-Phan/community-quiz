import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, Clock, Shield, Star, 
  ArrowRight, Award, Zap, Users, BarChart3, Edit3
} from 'lucide-react';
import api from '../../config/api';
import { useAuth } from '../../providers/AuthContext';
import Toast from '../../components/ui/Toast';
import SEO from '../../components/common/SEO';

const BecomeCreatorPage = () => {
  const navigate = useNavigate();
  const { user, token, refreshProfile, isQuizMaker, isAdmin } = useAuth();
  const [status, setStatus] = useState(user?.maker_status || 'none');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      setStatus(user.maker_status || 'none');
    }
  }, [user]);

  // If already a maker or admin, redirect to dashboard
  useEffect(() => {
    if (isQuizMaker || isAdmin) {
      navigate('/dashboard');
    }
  }, [isQuizMaker, isAdmin, navigate]);

  const handleApply = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/maker-request');
      const freshUser = await refreshProfile();
      setStatus(freshUser?.maker_status || 'pending');
      setToast({ message: 'Application submitted successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Failed to submit application', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <SEO 
        title="Become a Creator" 
        description="Join our inner circle of educators. Create, share, and earn recognition across the platform by becoming a QuizSphere creator."
        url="/become-creator"
      />
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#0f172a] rounded-[2.5rem] p-12 md:p-24 text-white mb-16 shadow-2xl shadow-slate-900/40">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-blue-600 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
           <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[80%] bg-indigo-600 rounded-full blur-[100px] opacity-20 animate-pulse-slow"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center lg:text-left lg:mx-0">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 mb-10 backdrop-blur-md">
            <Sparkles size={16} className="animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Join the Elite Registry</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.05] tracking-tighter uppercase">
            Turn your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Passion into Impact.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-2xl">
            The world's most advanced platform for community-driven education. 
            Create, manage, and scale your knowledge hubs today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {status === 'pending' ? (
              <div className="flex items-center gap-5 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-full sm:w-auto">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Clock className="animate-spin-slow" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-amber-500 uppercase tracking-widest text-[10px]">Verification In Progress</p>
                  <p className="text-slate-300 text-sm font-medium">Expected completion: Within 24 hours.</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleApply}
                disabled={loading}
                className="group relative w-full sm:w-auto flex items-center justify-center gap-4 px-12 py-6 bg-blue-600 text-white rounded-2xl font-black text-xl transition-all shadow-2xl shadow-blue-600/30 active:scale-95 disabled:opacity-50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10">{loading ? "Processing..." : status === 'rejected' ? "Re-apply Now" : "Apply to Join"}</span>
                <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
              </button>
            )}
            
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i + 20}`} className="w-12 h-12 rounded-full border-4 border-[#0f172a] shadow-xl" alt="Creator" />
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-[#0f172a] bg-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-xl">
                +12k
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Alert */}
      {status === 'rejected' && (
        <div className="mb-12 p-8 bg-rose-50 border-2 border-rose-100 rounded-3xl flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm shrink-0">
            <Shield size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Previous Request Declined</h3>
            <p className="text-slate-500 font-medium mt-1">
              Your previous application was not approved. You can update your profile and try again. 
              Make sure you have a complete profile with a bio and avatar.
            </p>
          </div>
          <button 
             onClick={handleApply}
             disabled={loading}
             className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <BenefitCard 
          icon={<Edit3 className="text-blue-500" />}
          title="Advanced Editor"
          description="Create rich media quizzes with markdown, images, and multiple question types."
        />
        <BenefitCard 
          icon={<BarChart3 className="text-indigo-500" />}
          title="Deep Analytics"
          description="Track every attempt, see difficulty heatmaps, and analyze student growth."
        />
        <BenefitCard 
          icon={<Users className="text-purple-500" />}
          title="Community Management"
          description="Host private communities, manage members, and organize live tournaments."
        />
        <BenefitCard 
          icon={<Zap className="text-amber-500" />}
          title="Instant Feedback"
          description="Provide real-time explanations for answers to help students learn faster."
        />
        <BenefitCard 
          icon={<CheckCircle2 className="text-emerald-500" />}
          title="Verified Badge"
          description="Get a blue checkmark on your profile to build trust with your audience."
        />
        <BenefitCard 
          icon={<Star className="text-rose-500" />}
          title="Reputation System"
          description="Earn points and climb the global creator rankings based on quiz popularity."
        />
      </div>

      {/* FAQ / Trust Section */}
      <div className="mt-20 p-12 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
        <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">How long does approval take?</h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Our moderation team reviews applications within 24 hours. We look for complete profiles and high-quality interaction history.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Is it free to become a creator?</h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Yes, the creator program is currently free for all users. We want to encourage high-quality knowledge sharing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BenefitCard = ({ icon, title, description }) => (
  <div className="p-8 bg-white border border-slate-100 rounded-3xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm font-medium leading-relaxed">{description}</p>
  </div>
);

export default BecomeCreatorPage;
