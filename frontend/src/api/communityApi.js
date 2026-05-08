/**
 * communityApi.js – thin re-export of communityService using the shared axios instance.
 * Kept for backward-compatibility with components that import from here.
 */
export {
  getCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  approveMember,
  rejectMember,
  getPendingMembers,
  getMyCommunities,
} from "../services/communityService";
