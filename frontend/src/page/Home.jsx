import React from 'react';
import { 
  Users, ListChecks, Trophy, LayoutDashboard, Star, TrendingUp, 
  UserPlus, Network, Edit3, BarChart3, ArrowRight 
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
            Create, Share, and <br/>
            <span className="text-blue-600">Compete</span> with <br/>
            Community Quizzes
          </h1>
          <p className="text-lg text-gray-600 max-w-md leading-relaxed">
            Empower your learning journey with our community-driven quiz platform. Create custom quizzes, join dedicated study groups, and track your progress against peers worldwide.
          </p>
          <div className="flex space-x-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
              Get Started
            </button>
            <button className="bg-white text-gray-900 border border-gray-200 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition shadow-sm">
              Explore Communities
            </button>
          </div>
        </div>
        <div className="relative">
          {/* Decorative Hero Illustration Placeholder */}
          <div className="bg-gradient-to-tr from-teal-400 to-teal-200 rounded-2xl p-8 shadow-2xl relative rotate-2 hover:rotate-0 transition duration-500">
            <div className="bg-white rounded-xl h-80 w-full md:w-3/4 mx-auto flex flex-col items-center justify-center shadow-lg relative z-10 overflow-hidden">
               <div className="w-16 h-2 bg-gray-200 rounded-full mb-8"></div>
               <h2 className="text-3xl font-bold text-gray-800 tracking-widest mb-12">QUZ</h2>
               <div className="flex space-x-4 mt-auto mb-6">
                 <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400"><Star size={16} /></div>
                 <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400"><Edit3 size={16} /></div>
                 <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400"><TrendingUp size={16} /></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">Platform Features</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to manage and grow your educational community and track student progress effectively.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users size={20} className="text-blue-600"/>} 
              title="Community-Based Learning" 
              desc="Join specialized groups to learn collaboratively with peers who share your interests and goals." 
            />
            <FeatureCard 
              icon={<ListChecks size={20} className="text-blue-600"/>} 
              title="Multiple Question Types" 
              desc="Comprehensive support for Multiple Choice, True/False, and Short Answer formats to test knowledge accurately." 
            />
            <FeatureCard 
              icon={<Trophy size={20} className="text-blue-600"/>} 
              title="Leaderboard Competition" 
              desc="Compete for the top spot, earn community recognition, and unlock achievements as you improve." 
            />
            <FeatureCard 
              icon={<LayoutDashboard size={20} className="text-blue-600"/>} 
              title="Quiz Creator Dashboard" 
              desc="Powerful tools for educators and creators to build, edit, and analyze quiz performance with ease." 
            />
            <FeatureCard 
              icon={<Star size={20} className="text-blue-600"/>} 
              title="Favorites" 
              desc="Save your most challenging quizzes or favorite subjects to practice later and refine your skills." 
            />
            <FeatureCard 
              icon={<TrendingUp size={20} className="text-blue-600"/>} 
              title="Detailed Analytics" 
              desc="Get deep insights into your performance trends and identify areas that need more focus." 
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="text-gray-500">Get started on your learning path in four simple steps.</p>
        </div>
        
        <div className="relative">
          {/* Dashed line connecting steps (hidden on mobile) */}
          <div className="hidden md:block absolute top-8 left-12 right-12 h-0.5 border-t-2 border-dashed border-blue-200 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            <StepCard icon={<UserPlus size={24}/>} title="Register an account" desc="Sign up in seconds and verify your profile." />
            <StepCard icon={<Network size={24}/>} title="Join or create" desc="Find your niche or build your own study group." />
            <StepCard icon={<Edit3 size={24}/>} title="Create or attempt" desc="Engage with community content or make your own." />
            <StepCard icon={<BarChart3 size={24}/>} title="View results" desc="Track your growth and climb the leaderboard." />
          </div>
        </div>
      </section>

      {/* Explore Communities Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore Communities</h2>
              <p className="text-gray-500">Discover groups tailored to your academic or professional needs.</p>
            </div>
            <button className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700 transition">
              View All Communities <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Community Card 1 */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-40 bg-gradient-to-br from-green-200 to-green-100 relative">
                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Public</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Mathematics</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">A community for calculus lovers, linear algebra enthusiasts, and high-level problem solvers.</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 font-medium">1.2k Members</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Join Community</button>
                </div>
              </div>
            </div>

            {/* Community Card 2 */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-40 bg-slate-800 flex items-center justify-center relative">
                <span className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Private</span>
                <div className="text-center text-white">
                  <div className="bg-white text-slate-800 w-12 h-10 mx-auto rounded mb-2 flex items-center justify-center">
                    <LayoutDashboard size={20} />
                  </div>
                  <span className="font-bold tracking-widest text-sm">WEB DEVELOPMENT GROUP</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Web Dev Mastery</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">Full-stack challenges focusing on React, Tailwind, and Node.js backend development.</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 font-medium">856 Members</span>
                  <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Request Access</button>
                </div>
              </div>
            </div>

            {/* Community Card 3 */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-40 bg-orange-50 relative flex items-start p-4">
                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Public</span>
                {/* Decorative element placeholder */}
                <div className="w-16 h-16 bg-orange-100 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Literature & Arts</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">Quizzes on classic novels, poetry movements, and contemporary art history from around the world.</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 font-medium">3.4k Members</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Join Community</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Quiz Performers */}
      <section className="max-w-4xl mx-auto px-8 py-24">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Top Quiz Performers</h2>
          <p className="text-gray-500">Celebrating our community's top learners this week.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <LeaderboardRow rank="1st" name="Alex Johnson" score="12,450" color="text-yellow-500" avatarBg="bg-yellow-100" />
              <LeaderboardRow rank="2nd" name="Sarah Chen" score="11,820" color="text-gray-400" avatarBg="bg-gray-100" />
              <LeaderboardRow rank="3rd" name="Michael Ross" score="10,950" color="text-amber-600" avatarBg="bg-amber-100" />
              <LeaderboardRow rank="4th" name="Elena Rodriguez" score="9,200" color="text-gray-400" avatarBg="bg-green-100" />
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 pb-24">
        <div className="bg-blue-600 rounded-3xl p-12 text-center text-white space-y-8 shadow-xl">
          <h2 className="text-4xl font-bold tracking-tight">Start building your quiz community today</h2>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Join over 10,000+ students and educators who are already using Quiz Community to enhance their learning experience.
          </p>
          <div className="flex justify-center space-x-4 pt-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition shadow-sm">
              Create Account
            </button>
            <button className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition shadow-sm">
              Explore Quizzes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

/* --- Helper Components --- */

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const StepCard = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-16 h-16 bg-white rounded-full border-4 border-blue-50 shadow-sm flex items-center justify-center text-blue-600 mb-6 relative z-10">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{desc}</p>
  </div>
);

const LeaderboardRow = ({ rank, name, score, color, avatarBg }) => (
  <tr className="hover:bg-gray-50 transition">
    <td className={`px-6 py-4 whitespace-nowrap font-bold ${color}`}>{rank}</td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full ${avatarBg} mr-3 flex items-center justify-center`}>
          <UserPlus size={14} className="text-gray-600 opacity-50" />
        </div>
        <span className="font-semibold text-gray-900">{name}</span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-blue-600">{score}</td>
  </tr>
);

export default LandingPage;