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
      let url = res.data.share_url;
      
      // If the URL is relative or misconfigured, ensure it uses the current origin
      if (!url.startsWith('http')) {
          url = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
      } else if (url.includes('localhost')) {
          // If backend accidentally sends localhost, correct it to current origin
          const urlObj = new URL(url);
          url = `${window.location.origin}${urlObj.pathname}${urlObj.search}`;
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

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200/60">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`} 
                        alt="Quiz QR Code" 
                        className="w-[180px] h-[180px] object-contain"
                    />
                </div>
                <div className="text-center">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Scan QR Code
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-snug">
                        Guests can scan to attempt instantly without an account
                    </p>
                </div>
                <button
                    onClick={() => {
                        const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shareUrl)}`;
                        window.open(url, '_blank');
                    }}
                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95 cursor-pointer hover:bg-slate-50"
                >
                    Open Full QR
                </button>
            </div>
            
            {/* Social Buttons */}
            <div className="space-y-3 pt-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Share directly to
                </label>
                <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={() => {
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                        }}
                        className="py-3 bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/20 hover:border-transparent rounded-xl font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                        <FacebookIcon size={16} />
                        <span>Facebook</span>
                    </button>
                    <button 
                        onClick={() => {
                            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                        }}
                        className="py-3 bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white border border-[#0A66C2]/20 hover:border-transparent rounded-xl font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                        <LinkedInIcon size={16} />
                        <span>LinkedIn</span>
                    </button>
                    <button 
                        onClick={() => {
                            let text = `Check out this awesome quiz: "${quizTitle}"!`;
                            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="py-3 bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200 hover:border-transparent rounded-xl font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                        <XIcon size={16} />
                        <span>X</span>
                    </button>
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

const FacebookIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
);

const LinkedInIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
);

const XIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

export default ShareQuizModal;
