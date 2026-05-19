import apiClient from '../../../config/api';

export const getSettings = async () => {
  return await apiClient.get('/settings');
};

export const updateSettings = async (formData) => {
  return await apiClient.post('/admin/settings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
