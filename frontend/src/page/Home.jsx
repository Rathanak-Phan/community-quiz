import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ListChecks, Trophy, LayoutDashboard, Star, TrendingUp,
  UserPlus, Network, Edit3, BarChart3, ArrowRight, Play, CheckCircle2
} from 'lucide-react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { getCommunities } from '../services/communityService';
import { getTopUsers } from '../services/leaderboardService';
import Toast from '../components/ui/Toast';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, token: authToken, refreshProfile } = useAuth();
  const [makerStatus, setMakerStatus] = useState(user?.maker_status || 'none');
  const [applying, setApplying] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync local status when global user changes
  useEffect(() => {
    if (user) {
      setMakerStatus(user.maker_status || 'none');
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commRes, topRes] = await Promise.all([
          getCommunities(),
          getTopUsers(4)
        ]);

        const rawComms = commRes.data?.data ?? commRes.data ?? [];
        setCommunities(rawComms.slice(0, 3));

        const rawTop = topRes.data?.data ?? topRes.data ?? [];
        setTopPerformers(rawTop.slice(0, 4));

      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dynamic content");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/maker-request');
      await refreshProfile();
      setToast({ message: 'Application submitted successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Failed to submit application', type: 'error' });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              New: Real-time multiplayer mode
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tighter text-slate-900">
              Learning is <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Better Together.</span>
            </h1>
            
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
              Join the world's most interactive community-driven quiz platform. Create, share, and compete with friends in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                <button 
                    onClick={() => {
                      if (!authToken) navigate("/register");
                      else if (user?.role?.name === 'admin') navigate("/admin/dashboard");
                      else if (user?.role?.name === 'quiz_maker') navigate("/dashboard");
                      else navigate("/"); 
                    }}
                    className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-slate-900/10 active:scale-95"
                >
                    Browse Quizzes
                </button>
                <button 
                    onClick={() => navigate("/communities")}
                    className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold text-base hover:bg-slate-50 transition-all duration-300 active:scale-95"
                >
                    Join Community
                </button>
            </div>

            <div className="flex items-center gap-6 pt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-12 h-12 rounded-2xl border-4 border-white shadow-sm" alt="User" />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                <span className="text-slate-900">10k+</span> students joined this week
              </p>
            </div>
          </div>

          <div className="relative lg:block hidden">
            <div className="relative z-10 bg-white rounded-3xl p-8 shadow-xl border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-700">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <Star size={20} fill="white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 uppercase tracking-tight text-sm">Quiz of the Day</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Quantum Mechanics</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-blue-600 tracking-tighter">84% SCORE</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Top 5%</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">1</div>
                      <span className="font-bold text-slate-700 text-sm">Newtonian Physics</span>
                    </div>
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <div className="p-4 rounded-xl bg-blue-600 border border-blue-500 flex items-center justify-between shadow-lg shadow-blue-600/20">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xs">2</div>
                      <span className="font-bold text-white text-sm">String Theory</span>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30"></div>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-100 flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 font-bold text-xs">3</div>
                      <span className="font-bold text-slate-400 text-sm">Black Hole Dynamics</span>
                    </div>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">2.4k ATTEMPTS</span>
                  </div>
                  <button className="text-[10px] font-bold text-blue-600 hover:underline">VIEW LEADERBOARD</button>
               </div>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between gap-12">
          <StatBox label="Active Users" value="100k+" />
          <StatBox label="Quizzes Created" value="500k+" />
          <StatBox label="Communities" value="12k+" />
          <StatBox label="Countries" value="80+" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight text-left">Everything you need to <br/><span className="text-blue-600">Master any subject.</span></h2>
            <p className="text-lg text-slate-500 leading-relaxed text-left">Built for creators, students, and lifelong learners who want more than just static questions.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users size={24}/>} 
              title="Global Communities" 
              desc="Join niche groups focused on specific topics from STEM to Art History." 
            />
            <FeatureCard 
              icon={<Edit3 size={24}/>} 
              title="Rich Quiz Editor" 
              desc="Create complex quizzes with images, multiple choice, and open-ended questions." 
            />
            <FeatureCard 
              icon={<Trophy size={24}/>} 
              title="Competitive Play" 
              desc="Climb rankings and earn exclusive badges for your learning achievements." 
            />
            <FeatureCard 
              icon={<LayoutDashboard size={24}/>} 
              title="Creator Analytics" 
              desc="See exactly how your community is learning and where they struggle." 
            />
            <FeatureCard 
              icon={<Star size={24}/>} 
              title="Smart Bookmarks" 
              desc="Save challenging questions to practice later with our spaced-repetition algorithm." 
            />
            <FeatureCard 
              icon={<TrendingUp size={24}/>} 
              title="Progress Insights" 
              desc="Visualize your learning curve with detailed personal performance dashboards." 
            />
          </div>
        </div>
      </section>

      {/* Become a Creator Section (Only for Regular Users) */}
      {authToken && user?.role?.name === 'user' && (
        <section className="py-32 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600 skew-x-12 translate-x-24 -z-0 opacity-20"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                  <UserPlus size={32} />
                </div>
                <h2 className="text-5xl font-black text-white leading-tight text-left">Ready to share <br/><span className="text-blue-500">Your Knowledge?</span></h2>
                <p className="text-xl text-slate-400 leading-relaxed max-w-md text-left">
                  Join our elite group of Quiz Makers. Create engaging content, build your own communities, and track learner progress with professional analytics.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] space-y-8">
                <div className="space-y-6">
                  <BenefitItem text="Create unlimited public & private quizzes" />
                  <BenefitItem text="Build and manage your own learning communities" />
                  <BenefitItem text="Detailed performance analytics for your students" />
                </div>
                
                {makerStatus === 'pending' ? (
                  <div className="w-full py-6 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-3xl font-black text-center uppercase tracking-widest flex items-center justify-center gap-3">
                    <TrendingUp size={20} className="animate-pulse" /> Application Pending Review
                  </div>
                ) : makerStatus === 'approved' ? (
                  <button 
                    onClick={() => navigate("/dashboard")}
                    className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                  >
                    Go to Creator Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-lg hover:bg-white hover:text-blue-600 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                  >
                    {applying ? "Submitting Application..." : "Apply to be a Creator"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Social Proof Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="grid grid-cols-2 gap-6 order-2 lg:order-1">
            <div className="space-y-6 pt-12">
              <TestimonialCard name="Alex Rivera" role="Medical Student" text="Quizly changed how I study for anatomy. The community feedback is gold." />
              <TestimonialCard name="Sarah Chen" role="UI Designer" text="Cleanest interface I've used for learning. Makes studying feel like playing." />
            </div>
            <div className="space-y-6">
              <TestimonialCard name="Dr. James Wilson" role="Professor" text="The analytics help me identify exactly which concepts my students are missing." />
              <TestimonialCard name="Maya Patel" role="Developer" text="Creating technical quizzes is so fast. The MCQ builder is top-notch." />
            </div>
          </div>
          <div className="space-y-8 order-1 lg:order-2 text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Don't just take our <br/>word for it.</h2>
            <p className="text-lg text-slate-500 leading-relaxed">Join 100,000+ users who have already leveled up their knowledge base through collaborative learning.</p>
            <div className="pt-4 flex">
              <button onClick={() => navigate("/register")} className="text-lg font-black text-blue-600 hover:text-indigo-600 flex items-center gap-2 group transition-all">
                Join the community
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

/* --- UI Components --- */

const StatBox = ({ label, value }) => (
  <div className="text-center md:text-left">
    <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500 group">
    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight text-left">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm text-left">{desc}</p>
  </div>
);

const TestimonialCard = ({ name, role, text }) => (
  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
    <p className="text-slate-600 italic font-medium leading-relaxed text-left">"{text}"</p>
    <div className="text-left">
      <p className="font-black text-slate-900 text-sm tracking-tight">{name}</p>
      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{role}</p>
    </div>
  </div>
);

const BenefitItem = ({ text }) => (
  <div className="flex items-center gap-4 text-left">
    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
      <CheckCircle2 size={14} />
    </div>
    <span className="text-white font-medium">{text}</span>
  </div>
);

export default LandingPage;