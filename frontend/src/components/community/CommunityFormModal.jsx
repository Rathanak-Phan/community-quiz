import { useState, useEffect, useRef } from "react";
import { createCommunity, updateCommunity } from "../../api/communityApi";
import { STORAGE_URL } from "../../config/api";
import { Cloud } from "lucide-react";

function CommunityFormModal({ isOpen, onClose, onSuccess, editData }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
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
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Community" : "Create New Community"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update your community details."
              : "Establish a new space for experts and learners to share knowledge."}
          </p>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-900 mb-2">
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
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((p) => ({ ...p, description: "" }));
              }}
              placeholder="Describe your community"
              rows={3}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 ${
                errors.description ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  visibility === "public"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      visibility === "public"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {visibility === "public" && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <p className={`text-sm font-semibold mt-2 ${
                  visibility === "public" ? "text-gray-900" : "text-gray-700"
                }`}>
                  Public
                </p>
                <p className="text-xs text-gray-600 mt-1">Anyone can join</p>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  visibility === "private"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      visibility === "private"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {visibility === "private" && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <p className={`text-sm font-semibold mt-2 ${
                  visibility === "private" ? "text-gray-900" : "text-gray-700"
                }`}>
                  Private
                </p>
                <p className="text-xs text-gray-600 mt-1">Requires approval</p>
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
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
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition"
            >
              {coverImagePreview ? (
                <div className="space-y-3">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <p className="text-xs text-gray-500">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <Cloud className="text-gray-400" size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Click or drag to upload cover image
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG or PNG. Max size 2MB (1600x400 recommended)
                  </p>
                </div>
              )}
            </div>
            {errors.coverImage && (
              <p className="mt-1 text-xs text-red-500">{errors.coverImage}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                ? "Save Changes"
                : "Create Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommunityFormModal;
