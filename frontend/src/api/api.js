import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('API Base URL:', api.defaults.baseURL);

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// User Profile API calls
export const updateProfile = (userData) => api.put('/users/me', userData);
export const updatePassword = (passwords) => api.put('/users/me/password', passwords);
export const addAddress = (address) => api.post('/users/me/addresses', address);
export const removeAddress = (addressId) => api.delete(`/users/me/addresses/${addressId}`);
export const setDefaultAddress = (addressId) => api.put(`/users/me/addresses/${addressId}/default`);
export const getCurrentUser = () => api.get('/users/me');

export default api;
