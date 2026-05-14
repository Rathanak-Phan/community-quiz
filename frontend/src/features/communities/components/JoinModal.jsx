import React, { useState } from 'react';
import { X, Hash, Loader2, ArrowRight } from 'lucide-react';

export default function JoinModal({ isOpen, onClose, onJoin }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    try {
      await onJoin(code.trim());
      setCode('');
      onClose();
    } catch (err) {
      // Error handled by parent toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Join Community</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Enter an invite code to join a circle</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
              <Hash size={12} />
              Invite Code
            </label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB12CD34"
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-black tracking-[0.5em] text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-200 placeholder:tracking-normal"
              autoFocus
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:bg-slate-200 disabled:shadow-none"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Confirm Join
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
