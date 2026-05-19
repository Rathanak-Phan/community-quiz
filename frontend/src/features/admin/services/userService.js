import apiClient from "../../../config/api";

/**
 * User Service
 * Handles fetching public user profiles and other user-related data.
 */

export const getUserPublicProfile = (id) =>
  apiClient.get(`/users/${id}/profile`);
