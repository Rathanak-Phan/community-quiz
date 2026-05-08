import React, { useState, useEffect } from 'react';
import { Cloud, Save, Loader2, Image as ImageIcon, Globe } from 'lucide-react';
import { getSettings, updateSettings } from '../../services/settingService';
import { STORAGE_URL } from '../../config/api';
import Toast from '../../components/ui/Toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [heroBg, setHeroBg] = useState(null);
  const [heroBgPreview, setHeroBgPreview] = useState(null);
  const [siteName, setSiteName] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSettings();
      const data = res.data;
      setSettings(data);
      setSiteName(data.site_name || "QuizSphere");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      if (logo) formData.append('logo', logo);
      if (heroBg) formData.append('hero_background', heroBg);
      formData.append('site_name', siteName);

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

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Site <span className="text-blue-600">Settings.</span></h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Manage your platform's visual identity and global configurations.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Globe size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase">General Branding</h2>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Site Name</label>
            <input 
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-600/20 transition-all font-bold text-sm"
              placeholder="e.g. Quizly"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Platform Logo</label>
              <div 
                className="relative h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden group"
                onClick={() => document.getElementById('logo-upload').click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} className="w-full h-full object-contain p-8" alt="Logo Preview" />
                ) : (
                  <>
                    <ImageIcon size={40} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Upload Logo</p>
                  </>
                )}
                <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Hero Background</label>
              <div 
                className="relative h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden group"
                onClick={() => document.getElementById('bg-upload').click()}
              >
                {heroBgPreview ? (
                  <img src={heroBgPreview} className="w-full h-full object-cover" alt="Background Preview" />
                ) : (
                  <>
                    <Cloud size={40} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Upload Background</p>
                  </>
                )}
                <input id="bg-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'hero_bg')} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl active:scale-95 flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Settings
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
