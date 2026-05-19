import { useState, useEffect, useRef } from "react";
import { createCommunity, updateCommunity } from "../../../api/communityApi";
import { STORAGE_URL } from "../../../config/api";
import { Cloud } from "lucide-react";

function CommunityFormModal({ isOpen, onClose, onSuccess, editData }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [status, setStatus] = useState("published");
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(editData);

  useEffect(() => {
    if (isOpen) {
      setName(editData?.name || "");
      setDescription(editData?.description || "");
      setVisibility(editData?.visibility || "public");
      setStatus(editData?.status || "published");
      setCoverImage(null);
      setCoverImagePreview(editData?.cover_image ? `${STORAGE_URL}/${editData.cover_image}` : null);
      setErrors({});
      setApiError("");
    }
  }, [isOpen, editData]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Community name is required.";
    else if (name.trim().length < 3)
      newErrors.name = "Name must be at least 3 characters.";
    if (!description.trim()) newErrors.description = "Description is required.";
    else if (description.trim().length < 10)
      newErrors.description = "Description must be at least 10 characters.";
    return newErrors;
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((p) => ({ ...p, coverImage: "File size must be less than 2MB" }));
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setErrors((p) => ({ ...p, coverImage: "Only JPG or PNG files are allowed" }));
        return;
      }
      setCoverImage(file);
      setErrors((p) => ({ ...p, coverImage: "" }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer?.files;
    if (files?.[0]) {
      const fakeEvent = {
        target: { files },
      };
      handleCoverImageChange(fakeEvent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("visibility", visibility);
      formData.append("status", status);
      
      if (coverImage) {
        formData.append("cover_image", coverImage);
      }

      if (isEditMode) {
        await updateCommunity(editData.id, formData);
      } else {
        await createCommunity(formData);
      }
      onSuccess(isEditMode ? "Community updated successfully!" : "Community created successfully!");
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Wrapper */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header (Fixed) */}
        <div className="p-5 sm:p-6 border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                {isEditMode ? "Edit Community" : "Create New Community"}
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed">
                {isEditMode
                  ? "Update your community details and publication preferences."
                  : "Establish a new space for experts and learners to share knowledge."}
              </p>
            </div>
            <button 
              onClick={onClose} 
              type="button"
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body (Flex-1) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* API Error */}
          {apiError && (
            <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold uppercase tracking-wider">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} id="community-form" noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Community Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                }}
                placeholder="Enter community name"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 font-medium ${
                  errors.name ? "border-red-400" : "border-slate-200"
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs font-bold text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((p) => ({ ...p, description: "" }));
                }}
                placeholder="Describe your community circle"
                rows={3}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 font-medium ${
                  errors.description ? "border-red-400" : "border-slate-200"
                }`}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs font-bold text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                Visibility
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`p-4 rounded-xl border-2 transition text-left flex items-start gap-3.5 ${
                    visibility === "public"
                      ? "border-blue-600 bg-blue-50/30"
                      : "border-slate-200 bg-white hover:border-slate-350"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                      visibility === "public"
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {visibility === "public" && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Public
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-snug">Anyone can search, discover, and join this community.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`p-4 rounded-xl border-2 transition text-left flex items-start gap-3.5 ${
                    visibility === "private"
                      ? "border-blue-600 bg-blue-50/30"
                      : "border-slate-200 bg-white hover:border-slate-350"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                      visibility === "private"
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {visibility === "private" && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Private
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-snug">Membership requires applicant approval from you.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                Publication Status
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={status === "published"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-slate-350 focus:ring-blue-500"
                  />
                  <span className={`text-xs font-black uppercase tracking-widest ${status === "published" ? "text-blue-600" : "text-slate-500 group-hover:text-slate-900"}`}>
                    Published
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === "draft"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-slate-350 focus:ring-blue-500"
                  />
                  <span className={`text-xs font-black uppercase tracking-widest ${status === "draft" ? "text-blue-600" : "text-slate-500 group-hover:text-slate-900"}`}>
                    Draft
                  </span>
                </label>
              </div>
              <p className="mt-2 text-[10px] font-medium text-slate-400 leading-snug">
                {status === "published" 
                  ? "Circle is immediately visible in explore directory." 
                  : "Private staging. Invisible to standard members until published."}
              </p>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                Cover Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleCoverImageChange}
                className="hidden"
              />
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/10 transition"
              >
                {coverImagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="w-full h-28 object-cover rounded-lg border border-slate-100"
                    />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Click to change cover</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <Cloud className="text-slate-400" size={28} />
                    </div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                      Upload Banner
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      JPG/PNG up to 2MB (1600x400 recommended)
                    </p>
                  </div>
                )}
              </div>
              {errors.coverImage && (
                <p className="mt-1.5 text-xs font-bold text-red-500">{errors.coverImage}</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer (Fixed) */}
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border-2 border-slate-200 bg-white hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="community-form"
            disabled={loading}
            className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition active:scale-95 ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-slate-900 hover:bg-blue-600 shadow-md hover:shadow-blue-600/15"
            }`}
          >
            {loading
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
              ? "Save Changes"
              : "Create Circle"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityFormModal;
