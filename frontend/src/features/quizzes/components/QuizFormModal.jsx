import { useState, useEffect, useRef } from "react";
import { createQuiz, updateQuiz, applyDefaultTimer } from "../../../services/quizService";
import { getCategories } from "../../../api/categoryApi";
import { getMyCommunities } from "../../../api/communityApi";
import { STORAGE_URL } from "../../../config/api";
import { Cloud, X, Loader2 } from "lucide-react";

export default function QuizFormModal({ isOpen, onClose, onSuccess, editData, preselectedCommunityId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [communityId, setCommunityId] = useState(preselectedCommunityId || "");
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [hasTimer, setHasTimer] = useState(false);
  const [defaultTimeLimit, setDefaultTimeLimit] = useState(30);
  const [status, setStatus] = useState("published");
  
  const [categories, setCategories] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(editData);

  useEffect(() => {
    if (isOpen) {
      setTitle(editData?.title || "");
      setDescription(editData?.description || "");
      setCategoryId(editData?.category_id || "");
      setCommunityId(editData?.community_id || preselectedCommunityId || "");
      setCoverImage(null);
      setCoverImagePreview(editData?.cover_image ? `${STORAGE_URL}/${editData.cover_image}` : null);
      setHasTimer(editData?.has_timer || false);
      setDefaultTimeLimit(editData?.default_time_limit || 30);
      setStatus(editData?.status || "published");
      setErrors({});
      setApiError("");
      
      fetchLists();
    }
  }, [isOpen, editData]);

  const fetchLists = async () => {
    setLoadingLists(true);
    try {
      const [catRes, commRes] = await Promise.all([
        getCategories(),
        getMyCommunities()
      ]);
      setCategories(catRes.data?.data || catRes.data || []);
      setCommunities(commRes.data?.data || commRes.data || []);
    } catch (err) {
      console.error("Failed to fetch lists:", err);
    } finally {
      setLoadingLists(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Quiz title is required.";
    if (!categoryId) newErrors.categoryId = "Category is required.";
    if (!communityId) newErrors.communityId = "Community is required.";
    return newErrors;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(p => ({ ...p, image: "Max size 2MB" }));
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category_id", categoryId);
      formData.append("community_id", communityId);
      formData.append("has_timer", hasTimer ? 1 : 0);
      formData.append("default_time_limit", defaultTimeLimit);
      formData.append("status", status);
      if (coverImage) formData.append("cover_image", coverImage);

      if (isEditMode) {
        await updateQuiz(editData.id, formData);
      } else {
        await createQuiz(formData);
      }
      onSuccess(isEditMode ? "Quiz updated successfully!" : "Quiz created successfully!");
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToAll = async () => {
    if (!isEditMode) return;
    if (!window.confirm("This will update the time limit for ALL questions in this quiz. Continue?")) return;
    
    setLoading(true);
    try {
      await applyDefaultTimer(editData.id);
      alert("Successfully updated all questions!");
    } catch (err) {
      setApiError("Failed to apply timer to all questions");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {isEditMode ? "Edit Quiz" : "Create New Quiz"}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {isEditMode ? "Update your quiz details" : "Share your knowledge with the community"}
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {apiError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
               <X size={16} />
               {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Quiz Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter a catchy title"
                  className={`w-full px-6 py-4 bg-slate-50 border ${errors.title ? 'border-rose-500' : 'border-slate-50'} rounded-xl outline-none focus:bg-white focus:border-blue-600 transition-all font-bold text-sm`}
                />
                {errors.title && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest ml-4">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className={`w-full px-6 py-4 bg-slate-50 border ${errors.categoryId ? 'border-rose-500' : 'border-slate-50'} rounded-xl outline-none focus:bg-white focus:border-blue-600 transition-all font-bold text-sm appearance-none cursor-pointer`}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest ml-4">{errors.categoryId}</p>}
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Community</label>
                <select
                  value={communityId}
                  onChange={e => setCommunityId(e.target.value)}
                  className={`w-full px-6 py-4 bg-slate-50 border ${errors.communityId ? 'border-rose-500' : 'border-slate-50'} rounded-xl outline-none focus:bg-white focus:border-blue-600 transition-all font-bold text-sm appearance-none cursor-pointer`}
                >
                  <option value="">Select Community</option>
                  {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.communityId && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest ml-4">{errors.communityId}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What is this quiz about?"
                rows={4}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-50 rounded-xl outline-none focus:bg-white focus:border-blue-600 transition-all font-bold text-sm resize-none"
              />
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Global Quiz Timer</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sets a default time for questions without manual timers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={hasTimer}
                    onChange={(e) => setHasTimer(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {hasTimer && (
                <div className="pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block mb-2">Default Time per Question (Seconds)</label>
                  <div className="flex gap-2 flex-wrap">
                    {[10, 20, 30, 60, 90, 120, 300].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setDefaultTimeLimit(sec)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          defaultTimeLimit === sec 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'
                        }`}
                      >
                        {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                     <input 
                        type="number"
                        value={defaultTimeLimit}
                        onChange={(e) => setDefaultTimeLimit(parseInt(e.target.value) || 0)}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl outline-none focus:border-blue-600 transition-all font-bold text-sm"
                        placeholder="Or enter custom seconds"
                     />
                  </div>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={handleApplyToAll}
                      className="mt-4 w-full py-3 bg-white border border-blue-100 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      Apply to all existing questions
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Publication Status</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Control if this quiz is visible to others</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStatus("published")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      status === "published" 
                        ? 'bg-slate-900 text-white' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Published
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("draft")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      status === "draft" 
                        ? 'bg-slate-900 text-white' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Draft
                  </button>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                {status === "published" 
                  ? "Visible in community and search" 
                  : "Only visible to you and community admins"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cover Image</label>
              <div 
                onClick={() => fileInputRef.current.click()}
                className="relative h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all overflow-hidden group"
              >
                {coverImagePreview ? (
                  <img src={coverImagePreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <Cloud size={40} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Click to upload</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>
            </div>

            <div className="pt-8 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-5 rounded-xl bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-slate-900 text-white px-8 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 active:scale-90 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                {isEditMode ? "Update Quiz" : "Create Quiz"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
