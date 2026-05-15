import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { joinByCode } from '../../services/communityService';

export default function JoinByLink() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const code = searchParams.get('code');

  useEffect(() => {
    const performJoin = async () => {
      if (!code) {
        setError("No invite code found in the link.");
        setLoading(false);
        return;
      }

      if (!localStorage.getItem('token')) {
        // Save code to join after login? Or just redirect to login
        sessionStorage.setItem('pending_join_code', code);
        navigate('/login', { state: { from: `/communities/join?code=${code}` } });
        return;
      }

      try {
        const res = await joinByCode(code);
        setSuccess(true);
        setTimeout(() => {
          navigate(`/communities/${res.data.community_id || res.data.community?.id}`);
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to join community via link.");
      } finally {
        setLoading(false);
      }
    };

    performJoin();
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-12 text-center space-y-8 border border-slate-100">
        {loading ? (
          <>
            <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mx-auto">
              <Loader2 size={40} className="animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Joining Community</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">Please wait while we process your invite code...</p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="w-20 h-20 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mx-auto">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Access Error</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">{error}</p>
            </div>
            <button 
              onClick={() => navigate('/communities')}
              className="w-full py-5 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            >
              Back to Communities
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Welcome Aboard!</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">You've successfully joined the community. Redirecting you now...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
