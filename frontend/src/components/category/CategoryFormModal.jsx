import { useState, useEffect } from "react";
import { createCategory, updateCategory } from "../../api/categoryApi";
import {
  BookOpen,
  FlaskConical,
  Globe2,
  Palette,
  Sparkles,
  ShieldCheck,
  Layers,
  MoreHorizontal,
} from "lucide-react";

const ICON_OPTIONS = [
  { id: "BookOpen", label: "Book", icon: BookOpen },
  { id: "FlaskConical", label: "Flask", icon: FlaskConical },
  { id: "Palette", label: "Palette", icon: Palette },
  { id: "Globe2", label: "Globe", icon: Globe2 },
  { id: "ShieldCheck", label: "Shield", icon: ShieldCheck },
  { id: "Layers", label: "Layers", icon: Layers },
];

const COLOR_OPTIONS = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-pink-500",
];

function CategoryFormModal({ isOpen, onClose, onSuccess, editData }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("BookOpen");
  const [selectedColor, setSelectedColor] = useState("bg-sky-500");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const isEditMode = Boolean(editData);

  useEffect(() => {
    if (isOpen) {
      setName(editData?.name || "");
      setDescription(editData?.description || "");
      setSelectedIcon(editData?.icon || "BookOpen");
      setSelectedColor(editData?.color || "bg-sky-500");
      setErrors({});
      setApiError("");
    }
  }, [isOpen, editData]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Category name is required.";
    else if (name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters.";
    return newErrors;
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
      const categoryData = {
        name: name.trim(),
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
      };

      if (isEditMode) {
        await updateCategory(editData.id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      onSuccess(isEditMode ? "Category updated successfully!" : "Category created successfully!");
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Edit Category" : "Create New Category"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
              }}
              placeholder="e.g. Mathematics"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the topics covered..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Choose Icon */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Icon
            </label>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedIcon(option.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                      selectedIcon === option.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title={option.label}
                  >
                    <IconComponent size={20} />
                  </button>
                );
              })}
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Choose Color */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-10 w-10 rounded-lg transition ${color} ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : "hover:opacity-80"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition ${
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
                : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryFormModal;
