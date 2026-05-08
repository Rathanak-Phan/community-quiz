import React from "react";

export default function UserAvatar({ user, size = "md", className = "" }) {
  const initials = user?.name?.charAt(0) || "U";
  
  const sizeClasses = {
    xs: "w-8 h-8 text-[10px] rounded-full",
    sm: "w-10 h-10 text-xs rounded-full",
    md: "w-12 h-12 text-sm rounded-full",
    lg: "w-16 h-16 text-xl rounded-full",
    xl: "w-32 h-32 text-4xl rounded-full"
  };

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Fallback if the full URL wasn't provided by backend
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const avatarUrl = getAvatarUrl(user?.avatar);

  return (
    <div className={`
      relative shrink-0 flex items-center justify-center font-black text-white overflow-hidden
      bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/10 border-2 border-white
      ${sizeClasses[size] || sizeClasses.md}
      ${className}
    `}>
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={user?.name || "User"} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = ""; // Force fallback to initials if image fails
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
