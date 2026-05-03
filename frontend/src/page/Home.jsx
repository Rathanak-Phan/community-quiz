import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ListChecks, Trophy, LayoutDashboard, Star, TrendingUp,
  UserPlus, Network, Edit3, BarChart3, ArrowRight, Play, CheckCircle2
} from 'lucide-react';
import { getCommunities } from '../services/communityService';
import { getTopUsers } from '../services/leaderboardService';

const LandingPage = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

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
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => navigate(token ? "/dashboard" : "/register")}
                className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-blue-600 transition-all duration-300 shadow-2xl shadow-slate-900/20 hover:shadow-blue-600/30 flex items-center gap-3 active:scale-95"
              >
                Get Started Free
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => navigate("/communities")}
                className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-[2rem] font-black text-lg hover:border-slate-200 transition-all duration-300 flex items-center gap-3 active:scale-95"
              >
                <Play size={20} className="text-blue-600" />
                Explore
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
            <div className="relative z-10 bg-white rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-700">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                      <Star size={24} fill="white" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight">Quiz of the Day</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantum Mechanics</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600 tracking-tighter">84% SCORE</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top 5%</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-black">1</div>
                      <span className="font-bold text-slate-700">Newtonian Physics</span>
                    </div>
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  </div>
                  <div className="p-5 rounded-2xl bg-blue-600 border border-blue-500 flex items-center justify-between shadow-lg shadow-blue-600/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black">2</div>
                      <span className="font-bold text-white">String Theory</span>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30"></div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white border border-slate-100 flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 font-black">3</div>
                      <span className="font-bold text-slate-400">Black Hole Dynamics</span>
                    </div>
                  </div>
               </div>

               <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2.4k ATTEMPTS</span>
                  </div>
                  <button className="text-xs font-black text-blue-600 hover:underline">VIEW LEADERBOARD</button>
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
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Everything you need to <br/><span className="text-blue-600">Master any subject.</span></h2>
            <p className="text-lg text-slate-500 leading-relaxed">Built for creators, students, and lifelong learners who want more than just static questions.</p>
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
          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Don't just take our <br/>word for it.</h2>
            <p className="text-lg text-slate-500 leading-relaxed">Join 100,000+ users who have already leveled up their knowledge base through collaborative learning.</p>
            <div className="pt-4">
              <button onClick={() => navigate("/register")} className="text-lg font-black text-blue-600 hover:text-indigo-600 flex items-center gap-2 group transition-all">
                Join the community
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
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
    <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const TestimonialCard = ({ name, role, text }) => (
  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
    <p className="text-slate-600 italic font-medium leading-relaxed">"{text}"</p>
    <div>
      <p className="font-black text-slate-900 text-sm tracking-tight">{name}</p>
      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{role}</p>
    </div>
  </div>
);

export default LandingPage;