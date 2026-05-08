import apiClient from "../config/api";

/**
 * Community Service
 * Handles CRUD and membership operations for communities.
 */

export const getCommunities = (params = {}) =>
  apiClient.get("/communities", { params });

export const getCommunityById = (id) =>
  apiClient.get(`/communities/${id}`);

export const createCommunity = (data) => {
  // Use FormData when a cover image file is present
  if (data instanceof FormData) {
    return apiClient.post("/communities", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.post("/communities", data);
};

export const updateCommunity = (id, data) => {
  if (data instanceof FormData) {
    // Laravel doesn't support PUT with multipart, use POST + _method spoofing
    data.append("_method", "PUT");
    return apiClient.post(`/communities/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.put(`/communities/${id}`, data);
};

export const deleteCommunity = (id) =>
  apiClient.delete(`/communities/${id}`);

export const joinCommunity = (id) =>
  apiClient.post(`/communities/${id}/join`);

export const leaveCommunity = (id) =>
  apiClient.post(`/communities/${id}/leave`);

export const approveMember = (memberId) =>
  apiClient.post(`/community-members/${memberId}/approve`);

export const rejectMember = (memberId) =>
  apiClient.post(`/community-members/${memberId}/reject`);

export const getMyCommunities = () =>
  apiClient.get("/my-communities");

export const getPendingMembers = (communityId) =>
  apiClient.get(`/communities/${communityId}/pending-members`);
