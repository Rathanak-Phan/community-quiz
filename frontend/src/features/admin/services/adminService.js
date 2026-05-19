import api from '../../../config/api';

const adminService = {
    // User Management
    getUsers: () => api.get('/admin/users'),
    updateUserRole: (id, roleId) => api.put(`/admin/users/${id}/role`, { role_id: roleId }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Category Management
    getCategories: () => api.get('/categories'),
    createCategory: (data) => api.post('/categories', data),
    updateCategory: (id, data) => api.put(`/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}`),

    // Quiz Moderation
    getQuizzes: () => api.get('/admin/quizzes'),
    deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),
    getQuizFavorites: (id) => api.get(`/admin/quizzes/${id}/favorites`),

    // Community Moderation
    getCommunities: () => api.get('/admin/communities'),
    deleteCommunity: (id) => api.delete(`/admin/communities/${id}`),

    // Maker Requests
    getMakerRequests: () => api.get('/admin/maker-requests'),
    getMakerRequestsCount: () => api.get('/admin/maker-requests/count'),
    approveMakerRequest: (id) => api.post(`/admin/maker-requests/${id}/approve`),
    rejectMakerRequest: (id) => api.post(`/admin/maker-requests/${id}/reject`),
};

export default adminService;
