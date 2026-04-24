import { useNavigate } from "react-router-dom";
import React from 'react';
import { 
  FileQuestion, 
  BarChart2, 
  Network, 
  Award, 
  Microscope, 
  Sigma, 
  FlaskConical, 
  BookOpen, 
  UserPlus, 
  TrendingUp,
  Calculator
} from 'lucide-react';


const Dashboard = () => {

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a] mb-2">Welcome back, John!</h1>
          <p className="text-gray-500 text-lg">Ready to test your knowledge today?</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FileQuestion size={20} />
              </div>
              <span className="text-sm font-bold text-green-500 bg-green-50 px-2 py-1 rounded">+12%</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Quizzes Taken</p>
              <p className="text-3xl font-bold text-gray-900">128</p>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <BarChart2 size={20} />
              </div>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Top 5%</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">85%</p>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Network size={20} />
              </div>
              <span className="text-sm font-medium text-gray-400">Active</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Communities joined</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Award size={20} />
              </div>
              <span className="text-sm font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">#422</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Global Rank</p>
              <p className="text-3xl font-bold text-gray-900">Elite</p>
            </div>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Courses & Communities) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Continue Learning */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
                <button className="text-blue-600 text-sm font-bold hover:text-blue-700">View All</button>
              </div>
              
              <div className="space-y-4">
                {/* Course 1 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Microscope size={28} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">Advanced Cellular Biology</h3>
                      <span className="text-xs font-semibold text-gray-400">75% Complete</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Chapter 4: Metabolic pathways</p>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition ml-2">
                    Resume
                  </button>
                </div>

                {/* Course 2 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Sigma size={28} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">Linear Algebra Fundamentals</h3>
                      <span className="text-xs font-semibold text-gray-400">32% Complete</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Vector spaces & Transformations</p>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full w-1/3"></div>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition ml-2">
                    Resume
                  </button>
                </div>
              </div>
            </section>

            {/* Recommended Communities */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Communities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Community 1 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-200">
                      <FlaskConical size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Quantum Physics Club</h3>
                      <p className="text-sm text-gray-500">2.4k Members</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full hover:bg-blue-50 text-blue-600 flex items-center justify-center transition">
                    <UserPlus size={20} />
                  </button>
                </div>

                {/* Community 2 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-200">
                      <BookOpen size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Modern History Forum</h3>
                      <p className="text-sm text-gray-500">1.8k Members</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full hover:bg-blue-50 text-blue-600 flex items-center justify-center transition">
                    <UserPlus size={20} />
                  </button>
                </div>

              </div>
            </section>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Leaderboard Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Leaderboard Activity</h2>
                <TrendingUp size={16} className="text-gray-400" />
              </div>
              
              <div className="space-y-6 mb-6">
                {/* Activity Item 1 */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?img=47" alt="Sarah Chen" className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Sarah Chen</h4>
                      <p className="text-xs text-gray-500">Earned "Quick Learner" Badge</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-500">+150 pts</span>
                </div>

                {/* Activity Item 2 */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?img=11" alt="Mike Ross" className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Mike Ross</h4>
                      <p className="text-xs text-gray-500">Climbed to #15 in Biology</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-500">+2 ranks</span>
                </div>

                {/* Activity Item 3 */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?img=12" alt="Alex Rivera" className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Alex Rivera</h4>
                      <p className="text-xs text-gray-500">Completed Daily Challenge</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-500">+50 pts</span>
                </div>
              </div>

              <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
                View All Connections
              </button>
            </div>

            {/* Weekly Challenge Card */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-600/20">
              {/* Background Icon Decoration */}
              <Calculator size={120} className="absolute -bottom-6 -right-6 text-white opacity-10" />
              
              <div className="relative z-10">
                <span className="inline-block bg-white/20 px-2.5 py-1 rounded text-xs font-bold tracking-wider mb-4 border border-white/10">
                  WEEKLY CHALLENGE
                </span>
                <h3 className="text-xl font-bold mb-1">Mathematics Marathon</h3>
                <p className="text-blue-100 text-sm mb-6">50 questions • 30 mins</p>
                <button className="w-full bg-white text-blue-600 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm">
                  Join Now
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
