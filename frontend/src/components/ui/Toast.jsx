import { useEffect } from "react";

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all animate-fade-in ${
        isSuccess ? "bg-green-600" : "bg-red-500"
      }`}
    >
      <span className="text-lg">{isSuccess ? "✓" : "✕"}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/70 hover:text-white leading-none"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
