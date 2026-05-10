import { useState, useEffect } from "react";
import { 
  User, Mail, MapPin, Globe, 
  Camera, Save, AlertCircle, CheckCircle2, Briefcase 
} from "lucide-react";
import { useAuth } from "../../providers/AuthContext";
import api, { STORAGE_URL } from "../../config/api";
import Toast from "../../components/ui/Toast";
import UserAvatar from "../../components/ui/UserAvatar";
import RoleBadge from "../../components/ui/RoleBadge";

export default function ProfilePage() {
  const { user, refreshProfile, role } = useAuth();
  
  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };
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
        name: user.name || "",
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
      setToast({ message: "Profile updated successfully!", type: "success" });
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
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your <span className="text-blue-600">Profile</span></h1>
        <p className="text-slate-500 mt-2">Manage your public information and social presence.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Section */}
                <div className="relative group">
                  <UserAvatar user={{...user, avatar: formData.avatar, name: formData.name}} size="xl" className="shadow-2xl shadow-blue-600/20" />
                  {formData.avatar && (
                    <button 
                      type="button"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await api.put("/profile", { ...formData, avatar: null });
                          setFormData(prev => ({ ...prev, avatar: "" }));
                          await refreshProfile();
                        } catch (e) { console.error(e); }
                        finally { setLoading(false); }
                      }}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-black rounded-full z-10"
                    >
                      REMOVE IMAGE
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => document.getElementById('avatar-input').click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all z-20 active:scale-95"
                  >
                    <Camera size={20} />
                  </button>
                  <input 
                    id="avatar-input"
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-6 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
                    <p className="text-slate-500 text-sm">{user?.email}</p>
                  </div>
                  <RoleBadge role={role} className="self-start md:self-center" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600/30 outline-none transition-all font-bold text-slate-700"
                        placeholder="Your Name"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="email" 
                        value={user?.email || ""}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none font-bold text-slate-400 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Headline</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      name="headline"
                      value={formData.headline}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600/30 outline-none transition-all font-bold text-slate-700"
                      placeholder="e.g. Senior Software Engineer or Physics Enthusiast"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600/30 outline-none transition-all font-medium text-slate-700 resize-none"
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Social */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-left">Location & Web</h3>
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600/30 outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="San Francisco, CA"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="url" 
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600/30 outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest text-left">Social Channels</h3>
            <div className="space-y-4 text-left">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 bg-slate-100 rounded-md"></div>
                <input 
                  type="text" 
                  name="github_handle"
                  value={formData.github_handle}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600/30 outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="GitHub Username"
                />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 bg-slate-100 rounded-md"></div>
                <input 
                  type="text" 
                  name="twitter_handle"
                  value={formData.twitter_handle}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600/30 outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="Twitter Username"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 text-left">
           <p className="text-xs font-medium text-slate-400 max-w-xs">
             Your profile information is visible to other members of the communities you join.
           </p>
           <button 
             type="submit"
             disabled={loading}
             className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 flex items-center gap-3"
           >
             {loading ? "Saving..." : "Save Changes"}
             {!loading && <Save size={18} />}
           </button>
        </div>
      </form>
    </div>
  );
}
