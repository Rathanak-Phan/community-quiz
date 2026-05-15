import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Trophy, 
  Target, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  BadgeCheck, 
  Globe, 
  MapPin,
  Link as LinkIcon,
  ChevronRight,
  AlertCircle,
  Calendar,
  Sparkles,
  Lock
} from 'lucide-react';
import { getUserPublicProfile } from '../../services/userService';
import { STORAGE_URL } from '../../config/api';

const GithubIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const TwitterIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const LinkedinIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('quizzes');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserPublicProfile(id);
        setProfile(response.data);
        if (response.data.user.role !== 'quiz_maker') {
            setActiveTab('communities');
        } else if (response.data.quiz_maker_data?.quizzes?.length === 0) {
            setActiveTab('communities');
        }
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError(err.response?.status === 404 ? "User not found" : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
     return (
       <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
         <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl border-4 border-blue-600/20 border-t-blue-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Profile</p>
         </div>
       </div>
     );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl shadow-slate-200 p-12 text-center border border-slate-100">
           <div className="w-24 h-24 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
              <AlertCircle size={48} className="text-rose-500" />
           </div>
           <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">{error}</h2>
           <p className="text-slate-500 mb-10 font-medium leading-relaxed">The profile you are looking for might be restricted or does not exist.</p>
           <button onClick={() => navigate(-1)} className="w-full py-5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all">
             Go Back
           </button>
        </div>
      </div>
    );
  }

  const { user, stats, quiz_maker_data, communities } = profile;

  // Safe Stats Handling - Ensuring no NaN values ever reach the UI
  const safeStats = {
    total_quizzes: Number(quiz_maker_data?.quizzes?.length) || 0,
    total_communities: Number(communities?.length) || 0,
    avg_score: (stats?.average_score !== undefined && stats?.average_score !== null && !isNaN(Number(stats.average_score))) 
      ? `${Number(stats.average_score)}%` 
      : "0%",
    highest_score: (stats?.highest_score !== undefined && stats?.highest_score !== null && !isNaN(Number(stats.highest_score))) 
      ? `${Number(stats.highest_score)}%` 
      : "0%",
    total_attempts: Number(stats?.total_attempts) || 0,
    joined_year: (user?.created_at && !isNaN(new Date(user.created_at).getTime())) 
      ? new Date(user.created_at).getFullYear() 
      : "-"
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 overflow-x-hidden">
      {/* SaaS Style Header */}
      <div className="h-[240px] sm:h-[280px] md:h-[350px] relative overflow-hidden bg-slate-900">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-indigo-600/30 to-violet-600/30"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all border border-white/10 active:scale-90">
              <ChevronRight className="rotate-180" size={20} />
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. Profile Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 text-center relative overflow-hidden">
              <div className="relative mb-6 flex justify-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-slate-50 border-4 border-white shadow-lg relative z-10">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                      <User size={60} />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 right-[25%] sm:right-[30%] w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white border-4 border-white shadow-lg z-20">
                  {user.role === 'quiz_maker' ? <BadgeCheck size={20} /> : <User size={20} />}
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">{user.name || user.email}</h1>
                <div className="flex flex-col items-center gap-2">
                   <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                     user.role === 'quiz_maker' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                   }`}>
                     {user.role === 'quiz_maker' ? 'Verified Maker' : 'Learner'}
                   </span>
                   <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><BookOpen size={12} /> {safeStats.total_quizzes} Quizzes</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {safeStats.total_communities} Communities</span>
                   </div>
                </div>
                {user.bio && <p className="text-slate-500 text-xs font-medium leading-relaxed px-4">{user.bio}</p>}
              </div>

              <div className="flex justify-center gap-3 pt-6 border-t border-slate-50">
                {user.github_handle && <SocialBtn href={`https://github.com/${user.github_handle}`} icon={<GithubIcon size={18} />} />}
                {user.twitter_handle && <SocialBtn href={`https://twitter.com/${user.twitter_handle}`} icon={<TwitterIcon size={18} />} />}
                {user.linkedin_handle && <SocialBtn href={`https://linkedin.com/in/${user.linkedin_handle}`} icon={<LinkedinIcon size={18} />} />}
              </div>
            </div>

            {/* 4. Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
               <StatBox icon={<Target className="text-blue-500" />} label="Attempts" value={safeStats.total_attempts} />
               <StatBox icon={<BookOpen className="text-emerald-500" />} label="Avg Score" value={safeStats.avg_score} />
               <StatBox icon={<Trophy className="text-yellow-500" />} label="Highest" value={safeStats.highest_score} />
               <StatBox icon={<Calendar className="text-purple-500" />} label="Joined" value={safeStats.joined_year} />
            </div>
          </div>

          {/* 2. Tabs & Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-1">
              <TabBtn 
                label="Published Quizzes" 
                active={activeTab === 'quizzes'} 
                onClick={() => setActiveTab('quizzes')} 
                count={safeStats.total_quizzes}
              />
              <TabBtn 
                label="Joined Communities" 
                active={activeTab === 'communities'} 
                onClick={() => setActiveTab('communities')} 
                count={safeStats.total_communities}
              />
            </div>

            <div className="min-h-[500px]">
              {activeTab === 'quizzes' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quiz_maker_data?.quizzes?.length > 0 ? (
                    quiz_maker_data.quizzes.map((quiz) => (
                      <QuizCard key={quiz.id} quiz={quiz} onClick={() => navigate(`/quizzes/${quiz.id}`)} />
                    ))
                  ) : (
                    <EmptyState icon={<BookOpen size={40} />} message="No quizzes available" />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {communities?.length > 0 ? (
                    communities.map((community) => (
                      <CommunityCard key={community.id} community={community} onClick={() => navigate(`/communities/${community.id}`)} />
                    ))
                  ) : (
                    <EmptyState icon={<Users size={40} />} message="No joined communities" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const QuizCard = ({ quiz, onClick }) => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="aspect-video relative overflow-hidden bg-slate-50">
      {quiz.cover_image ? (
        <img src={`${STORAGE_URL}/${quiz.cover_image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={quiz.title} />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300">
          <BookOpen size={48} />
        </div>
      )}
      <div className="absolute top-4 left-4">
         <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[9px] font-black text-blue-600 uppercase tracking-widest border border-blue-50">
            {quiz.category?.name || 'General'}
         </span>
      </div>
    </div>
    <div className="p-6 space-y-4">
       <div className="space-y-1">
         <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-1">{quiz.title}</h3>
         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={12} className="text-yellow-500" /> {Number(quiz.questions_count) || 0} Questions
         </p>
       </div>
       <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2.5rem]">{quiz.description || "Challenge yourself with this quiz and compete for the top spot on the leaderboard."}</p>
       <button onClick={onClick} className="w-full py-3.5 bg-slate-50 group-hover:bg-blue-600 text-slate-600 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
         Play Quiz
       </button>
    </div>
  </div>
);

const CommunityCard = ({ community, onClick }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group flex items-center gap-5">
    <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
       <Users size={24} />
    </div>
    <div className="flex-1 space-y-1">
       <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{community.name}</h3>
       <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Users size={10} /> {Number(community.members_count) || 0} Members</span>
          {community.visibility === 'private' && <span className="text-orange-500 flex items-center gap-1"><Lock size={10} /> Private</span>}
       </div>
       <button onClick={onClick} className="text-[9px] font-black text-blue-600 uppercase tracking-widest pt-2 hover:underline">View Community</button>
    </div>
  </div>
);

const TabBtn = ({ label, active, onClick, count }) => (
  <button onClick={onClick} className={`flex-1 py-4 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
    active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
  }`}>
    {label}
    <span className={`px-2 py-0.5 rounded-md text-[8px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
      {count}
    </span>
  </button>
);

const StatBox = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
      {icon}
    </div>
    <p className="text-xl font-black text-slate-900 tracking-tight">{String(value)}</p>
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

const SocialBtn = ({ href, icon }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
    {icon}
  </a>
);

const EmptyState = ({ icon, message }) => (
  <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center gap-4">
    <div className="text-slate-200">{icon}</div>
    <div className="space-y-1">
       <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{message}</p>
       <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">No records found in this section</p>
    </div>
  </div>
);

export default PublicProfile;
