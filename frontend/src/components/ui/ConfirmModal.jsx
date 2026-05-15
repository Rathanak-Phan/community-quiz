import React from "react";
import { X, AlertTriangle, Info, Trash2, HelpCircle } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  type = "danger", // danger, warning, info
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          iconBg: "bg-red-100",
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          title: "text-red-600",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          iconBg: "bg-amber-100",
          button: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
          title: "text-amber-600",
        };
      case "info":
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          iconBg: "bg-blue-100",
          button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          title: "text-blue-600",
        };
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-gray-600" />,
          iconBg: "bg-gray-100",
          button: "bg-gray-800 hover:bg-gray-900 focus:ring-gray-700",
          title: "text-gray-900",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl ${styles.iconBg} flex items-center justify-center mb-4`}>
              {styles.icon}
            </div>

            {/* Content */}
            <h3 className={`text-xl font-bold mb-2 ${styles.title}`}>
              {title}
            </h3>
            <p className="text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 text-sm font-semibold text-white rounded-xl shadow-lg shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 ${styles.button}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
