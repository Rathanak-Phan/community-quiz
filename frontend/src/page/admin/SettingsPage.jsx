import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Globe, 
  ToggleRight, 
  Share2, 
  Layout,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getSettings, updateSettings } from '../../services/settingService';
import { STORAGE_URL } from '../../config/api';
import Toast from '../../components/ui/Toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // State for form fields
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [heroBg, setHeroBg] = useState(null);
  const [heroBgPreview, setHeroBgPreview] = useState(null);
  const [siteName, setSiteName] = useState("");
  
  // Feature toggles
  const [features, setFeatures] = useState({
    maintenance_mode: false,
    allow_registration: true,
    public_communities: true,
    enable_leaderboard: true,
    realtime_notifications: true
  });

  // Social links
  const [socials, setSocials] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSettings();
      const data = res.data;
      setSettings(data);
      setSiteName(data.site_name || "QuizSphere");
      
      // Parse toggles
      setFeatures({
        maintenance_mode: data.maintenance_mode === "1",
        allow_registration: data.allow_registration !== "0",
        public_communities: data.public_communities !== "0",
        enable_leaderboard: data.enable_leaderboard !== "0",
        realtime_notifications: data.realtime_notifications !== "0",
      });

      // Parse socials
      setSocials({
        facebook: data.facebook || "",
        twitter: data.twitter || "",
        instagram: data.instagram || "",
        linkedin: data.linkedin || "",
      });

      if (data.logo) setLogoPreview(`${STORAGE_URL}/${data.logo}`);
      if (data.hero_background) setHeroBgPreview(`${STORAGE_URL}/${data.hero_background}`);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'logo') {
          setLogo(file);
          setLogoPreview(e.target.result);
        } else {
          setHeroBg(file);
          setHeroBgPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFeature = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSocials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      if (logo) formData.append('logo', logo);
      if (heroBg) formData.append('hero_background', heroBg);
      formData.append('site_name', siteName);
      
      // Add features
      Object.entries(features).forEach(([key, val]) => {
        formData.append(key, val ? "1" : "0");
      });

      // Add socials
      Object.entries(socials).forEach(([key, val]) => {
        formData.append(key, val);
      });

      await updateSettings(formData);
      setToast({ message: "Settings updated successfully!", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to update settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
        activeTab === id 
        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Site <span className="text-blue-600">Settings.</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Manage your platform's global configurations and features.</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm">
          <TabButton id="general" icon={Globe} label="General" />
          <TabButton id="features" icon={ToggleRight} label="Features" />
          <TabButton id="social" icon={Share2} label="Social" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {activeTab === 'general' && (
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Site Name</label>
              <input 
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-600/20 transition-all font-bold text-lg"
                placeholder="e.g. QuizSphere"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Platform Logo</label>
                <div 
                  className="relative h-56 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden group"
                  onClick={() => document.getElementById('logo-upload').click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} className="w-full h-full object-contain p-10" alt="Logo Preview" />
                  ) : (
                    <>
                      <ImageIcon size={48} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Upload Logo</p>
                    </>
                  )}
                  <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Hero Background</label>
                <div 
                  className="relative h-56 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden group"
                  onClick={() => document.getElementById('bg-upload').click()}
                >
                  {heroBgPreview ? (
                    <img src={heroBgPreview} className="w-full h-full object-cover" alt="Background Preview" />
                  ) : (
                    <>
                      <Cloud size={48} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Upload Background</p>
                    </>
                  )}
                  <input id="bg-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'hero_bg')} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {[
              { id: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Take the site offline for updates', danger: true },
              { id: 'allow_registration', label: 'Allow Registrations', desc: 'Allow new users to create accounts' },
              { id: 'public_communities', label: 'Public Communities', desc: 'Allow anyone to discover and join communities' },
              { id: 'enable_leaderboard', label: 'Global Leaderboard', desc: 'Show ranking of top performing students' },
              { id: 'realtime_notifications', label: 'Real-time Notifications', desc: 'Enable push alerts for quiz activity' },
            ].map((feat) => (
              <div 
                key={feat.id}
                className="flex items-center justify-between p-6 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => toggleFeature(feat.id)}
              >
                <div className="space-y-1">
                  <h3 className={`font-black text-sm uppercase tracking-tight ${feat.danger && features[feat.id] ? 'text-rose-600' : 'text-slate-900'}`}>
                    {feat.label}
                  </h3>
                  <p className="text-xs font-bold text-slate-400">{feat.desc}</p>
                </div>
                <div className={`w-14 h-8 rounded-full transition-all relative ${features[feat.id] ? (feat.danger ? 'bg-rose-500' : 'bg-blue-600') : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${features[feat.id] ? 'left-7' : 'left-1'}`}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'social' && (
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {Object.keys(socials).map((platform) => (
              <div key={platform} className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 capitalize">{platform} URL</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                    <Share2 size={18} />
                  </div>
                  <input 
                    type="url"
                    name={platform}
                    value={socials[platform]}
                    onChange={handleSocialChange}
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-600/20 transition-all font-bold text-sm"
                    placeholder={`https://${platform}.com/yourpage`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-slate-900 text-white px-12 py-6 rounded-xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save Site Configuration
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
