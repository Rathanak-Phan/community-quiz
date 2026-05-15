import React, { useState, useEffect } from 'react';
import { X, Copy, Mail, Globe, Check, Loader2, Link as LinkIcon } from 'lucide-react';
import api from '../../../config/api';

const ShareQuizModal = ({ isOpen, onClose, quizId, quizTitle }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && quizId) {
      fetchShareUrl();
    }
  }, [isOpen, quizId]);

  const fetchShareUrl = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/quizzes/${quizId}/share`);
      // The backend returns { share_url: '...' }
      // If it returns localhost, we might want to adjust it for the frontend
      let url = res.data.share_url;
      if (url.includes('localhost:8000')) {
          url = url.replace('http://localhost:8000', window.location.origin);
      }
      setShareUrl(url);
    } catch (err) {
      console.error("Failed to fetch share URL", err);
      // Fallback
      setShareUrl(`${window.location.origin}/quizzes/${quizId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Send <span className="text-[#673ab7]">Quiz</span></h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Share "{quizTitle}" with others</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4 border-b border-slate-100 pb-2">
                <button className="text-[10px] font-black text-[#673ab7] uppercase tracking-widest border-b-2 border-[#673ab7] pb-2 px-2">Link</button>
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 px-2 hover:text-slate-600 transition">Collaborators</button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shareable Link</label>
                    {copied && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in slide-in-from-right-2">Copied to clipboard!</span>}
                </div>
                
                <div className="relative group">
                    <LinkIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#673ab7] transition-colors" />
                    <input
                        readOnly
                        type="text"
                        className="w-full pl-14 pr-32 py-5 bg-slate-50 border border-slate-100 rounded-xl outline-none transition text-[10px] font-black text-slate-600 uppercase tracking-widest truncate"
                        value={loading ? 'Generating link...' : shareUrl}
                    />
                    <button 
                        onClick={handleCopy}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-[#673ab7] px-6 py-2.5 rounded-xl border border-slate-100 shadow-sm font-black text-[10px] uppercase tracking-widest hover:bg-[#673ab7] hover:text-white transition-all active:scale-95"
                    >
                        {copied ? <Check size={14} /> : 'Copy'}
                    </button>
                </div>
            </div>

            <div className="bg-[#673ab7]/5 p-6 rounded-xl border border-[#673ab7]/10 flex items-start gap-5">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#673ab7] shadow-sm shrink-0">
                    <Globe size={24} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Public Access</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Anyone with the link can view and attempt this quiz. Results will be saved to their profile.</p>
                </div>
            </div>

            <div className="pt-4 flex gap-4">
                <button
                    onClick={onClose}
                    className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                    Done
                </button>
                <button
                    onClick={() => window.open(`mailto:?subject=Quiz Invitation: ${quizTitle}&body=I've invited you to take this quiz: ${shareUrl}`)}
                    className="flex-1 bg-[#673ab7] text-white py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5e35b1] transition-all shadow-xl shadow-[#673ab7]/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <Mail size={16} />
                    Email
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareQuizModal;
