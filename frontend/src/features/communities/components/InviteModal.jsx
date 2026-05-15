import React, { useState } from 'react';
import { X, Copy, Check, RefreshCw, QrCode, Link as LinkIcon, Hash } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { regenerateInviteCode } from '../../../services/communityService';
import ConfirmModal from '../../../components/ui/ConfirmModal';

export default function InviteModal({ isOpen, onClose, community, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConfirmRegenOpen, setIsConfirmRegenOpen] = useState(false);

  if (!isOpen || !community) return null;

  const inviteLink = `${window.location.origin}/communities/join?code=${community.invite_code}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmRegenerate = async () => {
    setIsConfirmRegenOpen(false);
    setLoading(true);
    try {
      const res = await regenerateInviteCode(community.id);
      onRegenerate(res.data.invite_code);
    } catch (err) {
      alert("Failed to regenerate code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Invite Members</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Share access to {community.name}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-xl border-4 border-slate-50 shadow-inner">
              <QRCodeSVG value={inviteLink} size={180} level="H" includeMargin />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <QrCode size={14} />
              Scan to join community
            </p>
          </div>

          <div className="space-y-6">
            {/* Invite Code */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <Hash size={12} />
                Invite Code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 px-6 py-4 rounded-xl font-black text-xl tracking-widest text-center text-slate-900 border border-slate-100">
                  {community.invite_code}
                </div>
                <button 
                  onClick={() => handleCopy(community.invite_code)}
                  className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
                <button 
                  onClick={() => setIsConfirmRegenOpen(true)}
                  disabled={loading}
                  className="w-14 h-14 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:text-blue-600 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Invite Link */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <LinkIcon size={12} />
                Invite Link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 px-4 py-4 rounded-xl font-bold text-xs truncate text-slate-400 border border-slate-100">
                  {inviteLink}
                </div>
                <button 
                  onClick={() => handleCopy(inviteLink)}
                  className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-wider">
              Note: Anyone with this link or code can join this private community instantly without waiting for approval.
            </p>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isConfirmRegenOpen}
        title="Regenerate Invite Code"
        message="Are you sure you want to regenerate the invite code? The current code and link will stop working immediately for new members."
        onConfirm={handleConfirmRegenerate}
        onCancel={() => setIsConfirmRegenOpen(false)}
        loading={loading}
        confirmText="Regenerate"
        type="warning"
      />
    </div>
  );
}
