import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const communityApi = axios.create({
  baseURL: `${API_URL}/api/communities`,
  withCredentials: true,
});

export const getCommunities = (filters = {}) => {
  return communityApi.get("/", { params: filters });
};

export const getCommunityById = (id) => {
  return communityApi.get(`/${id}`);
};

export const createCommunity = (data) => {
  return communityApi.post("/", data);
};

export const updateCommunity = (id, data) => {
  return communityApi.put(`/${id}`, data);
};

export const deleteCommunity = (id) => {
  return communityApi.delete(`/${id}`);
};

export const joinCommunity = (id) => {
  return communityApi.post(`/${id}/join`, {});
};

export const leaveCommunity = (id) => {
  return communityApi.post(`/${id}/leave`, {});
};

export default communityApi;
