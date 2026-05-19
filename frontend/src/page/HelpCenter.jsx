import React, { useState, useEffect } from 'react';
import SEO from '../components/common/SEO';
import { 
  Search, 
  Book, 
  MessageCircle, 
  LifeBuoy, 
  Shield, 
  Zap, 
  ChevronRight, 
  Mail, 
  Phone,
  FileText,
  ExternalLink
} from 'lucide-react';

const categories = [
  {
    title: "Getting Started",
    icon: <Zap className="text-amber-500" />,
    articles: ["Creating your first quiz", "Joining a community", "Setting up your profile"],
    color: "bg-amber-50"
  },
  {
    title: "Community Management",
    icon: <LifeBuoy className="text-blue-500" />,
    articles: ["Managing members", "Reviewing quiz submissions", "Community privacy settings"],
    color: "bg-blue-50"
  },
  {
    title: "Quiz Creation",
    icon: <Book className="text-emerald-500" />,
    articles: ["Types of questions", "Adding media to quizzes", "Scoring and time limits"],
    color: "bg-emerald-50"
  },
  {
    title: "Privacy & Security",
    icon: <Shield className="text-rose-500" />,
    articles: ["Protecting your data", "Report inappropriate content", "Account security"],
    color: "bg-rose-50"
  }
];

const faqs = [
  {
    question: "How do I become a Quiz Maker?",
    answer: "You can apply to become a Quiz Maker through your profile settings. Once approved by an admin, you'll be able to create and manage your own quizzes."
  },
  {
    question: "Can I make my community private?",
    answer: "Yes, when creating or editing a community, you can set the visibility to private. Only members you approve will be able to see and participate in the community."
  },
  {
    question: "How are leaderboard points calculated?",
    answer: "Points are based on accuracy and speed. Correct answers give you a base score, with bonus points for how quickly you respond."
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState({});

  useEffect(() => {
    import('../services/settingService').then(service => {
        service.getSettings().then(res => setSettings(res.data));
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <SEO 
        title="Help Center"
        description="Search our knowledge base, browse articles and guides, or get in touch with live support at the QuizSphere Help Center."
        url="/help"
      />
      {/* External Help Center Notice */}
      {settings.help_center_type === 'external' && (
        <div className="bg-blue-600 p-8 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-600/20 animate-in slide-in-from-top-4 duration-700">
            <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-black tracking-tight">Our Help Center has moved!</h3>
                <p className="text-blue-100 font-medium">We've upgraded our documentation system. Access the latest guides on our new portal.</p>
            </div>
            <a 
                href={settings.help_center_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shrink-0"
            >
                Visit New Portal
                <ExternalLink size={18} />
            </a>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-12 md:p-20 text-center space-y-8">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            How can we <span className="text-blue-400 italic">help?</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium text-lg">
            Search our knowledge base or browse categories below to find answers to your questions.
          </p>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Search for articles, guides..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white/10 backdrop-blur-md border border-white/10 rounded-full outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white/20 transition-all font-bold text-white placeholder:text-slate-500 text-lg shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500 hover:-translate-y-2">
            <div className={`w-14 h-14 ${cat.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {cat.icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-4">{cat.title}</h3>
            <ul className="space-y-3">
              {cat.articles.map((art, aIdx) => (
                <li key={aIdx}>
                  <a href="#" className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2 group/link">
                    <ChevronRight size={14} className="text-slate-300 group-hover/link:translate-x-1 transition-transform" />
                    {art}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12 pt-12">
        {/* FAQs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <MessageCircle size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                  <span className="font-bold text-slate-900">{faq.question}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-open:rotate-180 transition-transform">
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </summary>
                <div className="p-6 pt-0 text-slate-500 font-medium leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Sidebar */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-2xl p-8 text-white space-y-6 shadow-2xl shadow-blue-600/30">
            <h3 className="text-2xl font-black tracking-tight">Still need help?</h3>
            <p className="text-blue-100 font-medium">Our team is available 24/7 to help you with any issues you might be facing.</p>
            
            <div className="space-y-3">
              <a 
                href={`mailto:${settings.support_email || 'support@quizo.com'}`}
                className="w-full bg-white text-blue-600 p-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              >
                <Mail size={18} />
                Email Support
              </a>
              {settings.support_chat_url && (
                <a 
                  href={settings.support_chat_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-700/50 text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle size={18} />
                  Live Chat
                </a>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 text-white space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Resources</h4>
            <div className="space-y-4">
              <a href="#" className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-400" size={20} />
                  <span className="font-bold text-sm">Documentation</span>
                </div>
                <ExternalLink size={14} className="text-slate-600 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <LifeBuoy className="text-emerald-400" size={20} />
                  <span className="font-bold text-sm">Community Forum</span>
                </div>
                <ExternalLink size={14} className="text-slate-600 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
