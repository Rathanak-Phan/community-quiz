import { Users, Lock, Globe } from "lucide-react";

export default function CommunityCard({ community, onJoin, onViewMore }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "public":
        return "bg-emerald-50 text-emerald-700";
      case "private":
        return "bg-orange-50 text-orange-700";
      case "featured":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "private":
        return <Lock size={14} />;
      case "public":
        return <Globe size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header with banner */}
      <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 relative"></div>

      {/* Content */}
      <div className="px-5 pb-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mt-3 line-clamp-2">
          {community.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {community.description}
        </p>

        {/* Status Badge */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
              community.status
            )}`}
          >
            {getStatusIcon(community.status)}
            {community.status}
          </span>
        </div>

        {/* Members count */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={16} />
            <span className="text-sm font-medium">{community.members} members</span>
          </div>
        </div>

        {/* Member avatars preview */}
        <div className="mt-3 flex -space-x-2">
          {community.memberAvatars?.slice(0, 3).map((avatar, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-700 overflow-hidden"
              title={avatar.name}
            >
              {avatar.initials || avatar.name?.charAt(0)}
            </div>
          ))}
          {community.memberAvatars && community.memberAvatars.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-700">
              +{community.memberAvatars.length - 3}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          {community.isMember ? (
            <button className="flex-1 py-2 px-3 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
              View Community
            </button>
          ) : (
            <>
              <button
                onClick={() => onJoin(community)}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                Join
              </button>
              <button
                onClick={() => onViewMore(community)}
                className="flex-1 py-2 px-3 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                View More
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
