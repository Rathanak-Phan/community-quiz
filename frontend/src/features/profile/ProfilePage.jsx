import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  User, Mail, MapPin, Globe, 
  Camera, Save, AlertCircle, CheckCircle2, Briefcase, Sparkles, Users 
} from "lucide-react";
import { useAuth } from "../../providers/AuthContext";
import api, { STORAGE_URL } from "../../config/api";
import Toast from "../../components/ui/Toast";
import UserAvatar from "../../components/ui/UserAvatar";
import RoleBadge from "../../components/ui/RoleBadge";

const GithubIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const TwitterIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const LinkedinIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function ProfilePage() {
  const { user, refreshProfile, role } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    bio: "",
    location: "",
    website: "",
    github_handle: "",
    twitter_handle: "",
    linkedin_handle: "",
    avatar: ""
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.email || "",
        headline: user.headline || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        github_handle: user.github_handle || "",
        twitter_handle: user.twitter_handle || "",
        linkedin_handle: user.linkedin_handle || "",
        avatar: user.avatar || ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/profile", formData);
      await refreshProfile();
      setToast({ message: "Profile synchronized successfully!", type: "success" });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setToast({ message: error.response?.data?.message || "Failed to update profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setLoading(true);
    try {
      const res = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData(prev => ({ ...prev, avatar: res.data.avatar }));
      await refreshProfile();
      setToast({ message: "Avatar updated successfully!", type: "success" });
    } catch (error) {
      console.error("Avatar upload failed:", error);
      setToast({ message: "Failed to upload avatar", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 pt-12">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Settings</h1>
            </div>
            <p className="text-slate-500 font-medium ml-5">Customize your appearance and professional presence on the platform.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
             <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loading ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}>
                {loading ? 'Synchronizing...' : 'All changes saved'}
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Avatar & Quick Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100 p-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                  <User size={120} />
               </div>
               
               <div className="flex flex-col items-center text-center relative z-10">
                  <div className="relative mb-10">
                    <div className="w-40 h-40 rounded-2xl overflow-hidden bg-slate-50 border-8 border-white shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-105">
                      <UserAvatar user={{...user, avatar: formData.avatar, name: formData.name}} size="full" className="w-full h-full object-cover" />
                    </div>
                    <button 
                      type="button"
                      onClick={() => document.getElementById('avatar-input').click()}
                      className="absolute -bottom-2 -right-2 w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center border-4 border-white shadow-xl z-20 hover:bg-blue-600 transition-colors active:scale-90"
                    >
                      <Camera size={24} />
                    </button>
                    <input id="avatar-input" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </div>

                  <div className="space-y-4 w-full">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{formData.name || user?.email}</h2>
                      <p className="text-slate-400 font-bold text-xs lowercase tracking-widest">{user?.email}</p>
                    </div>
                    <div className="flex justify-center pt-2">
                       <RoleBadge role={role} className="scale-110" />
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-50 my-10"></div>

                  <div className="w-full space-y-4">
                     <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public View</span>
                        <Link 
                          to={`/profile/${user?.id}`}
                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          Preview Profile <Globe size={12} />
                        </Link>
                     </div>
                  </div>
               </div>
            </div>

            {/* Danger Zone or Account Info Card */}
            <div className="bg-rose-50/50 rounded-[2rem] border border-rose-100 p-8 space-y-4">
               <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} /> Security Notice
               </h3>
               <p className="text-xs font-medium text-rose-900/60 leading-relaxed">
                  To update your email or password, please visit our secure authentication center.
               </p>
            </div>
          </div>

          {/* Right Column: Form Fields Bento */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section: Professional Identity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 space-y-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                     <Briefcase size={24} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Professional Identity</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">How people see you on the platform</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField 
                    label="Public Display Name" 
                    icon={<User size={18} />} 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder={user?.email || "Enter your name"}
                    required
                  />
                  <InputField 
                    label="Professional Headline" 
                    icon={<Sparkles size={18} />} 
                    name="headline" 
                    value={formData.headline} 
                    onChange={handleChange} 
                    placeholder="e.g. Senior Educator"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Short Biography</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600/10 outline-none transition-all font-medium text-slate-700 resize-none shadow-inner"
                    placeholder="Share your experience and interests with the community..."
                  ></textarea>
               </div>
            </div>

            {/* Section: Reach & Socials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Location & Web */}
               <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Globe size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Reach</h3>
                  </div>
                  <div className="space-y-6">
                     <InputField 
                       label="Location" 
                       icon={<MapPin size={18} />} 
                       name="location" 
                       value={formData.location} 
                       onChange={handleChange} 
                       placeholder="e.g. London, UK"
                     />
                     <InputField 
                       label="Personal Website" 
                       icon={<Globe size={18} />} 
                       name="website" 
                       value={formData.website} 
                       onChange={handleChange} 
                       placeholder="https://..."
                     />
                  </div>
               </div>

               {/* Social Channels */}
               <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Users size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Socials</h3>
                  </div>
                  <div className="space-y-6">
                     <InputField 
                       label="GitHub Username" 
                       icon={<GithubIcon size={18} />} 
                       name="github_handle" 
                       value={formData.github_handle} 
                       onChange={handleChange} 
                       placeholder="@username"
                     />
                     <InputField 
                       label="Twitter / X" 
                       icon={<TwitterIcon size={18} />} 
                       name="twitter_handle" 
                       value={formData.twitter_handle} 
                       onChange={handleChange} 
                       placeholder="@username"
                     />
                     <InputField 
                       label="LinkedIn ID" 
                       icon={<LinkedinIcon size={18} />} 
                       name="linkedin_handle" 
                       value={formData.linkedin_handle} 
                       onChange={handleChange} 
                       placeholder="username"
                     />
                  </div>
               </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 space-y-1 text-center sm:text-left">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-400">Ready to go?</p>
                  <p className="text-sm font-medium text-slate-400">Synchronize your profile across the platform.</p>
               </div>
               <button 
                 type="submit"
                 disabled={loading}
                 className="relative z-10 px-12 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3 shrink-0"
               >
                 {loading ? "Processing..." : "Save Settings"}
                 {!loading && <CheckCircle2 size={18} />}
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const InputField = ({ label, icon, ...props }) => (
  <div className="space-y-2 group/field">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within/field:text-blue-600 transition-colors">{label}</label>
    <div className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-blue-600 transition-colors">
        {icon}
      </div>
      <input 
        {...props}
        className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-600/10 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
      />
    </div>
  </div>
);
