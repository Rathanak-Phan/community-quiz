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
          icon: <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />,
          iconBg: "bg-red-100 dark:bg-red-950/40",
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800",
          title: "text-red-600 dark:text-red-400",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          iconBg: "bg-amber-100 dark:bg-amber-950/40",
          button: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 dark:bg-amber-700 dark:hover:bg-amber-800",
          title: "text-amber-600 dark:text-amber-400",
        };
      case "info":
        return {
          icon: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
          iconBg: "bg-blue-100 dark:bg-blue-950/40",
          button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800",
          title: "text-blue-600 dark:text-blue-400",
        };
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-gray-600 dark:text-slate-400" />,
          iconBg: "bg-gray-100 dark:bg-slate-800",
          button: "bg-gray-800 hover:bg-gray-900 focus:ring-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600",
          title: "text-gray-900 dark:text-white",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all overflow-hidden transition-colors duration-300">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
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
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-sm">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 text-sm font-semibold text-white rounded-xl shadow-lg shadow-gray-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 ${styles.button}`}
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
