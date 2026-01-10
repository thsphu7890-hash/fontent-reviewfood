import axios from 'axios';

const api = axios.create({
    // Đổi link này thành link Render của bạn
    baseURL: 'https://backend-foodreview.onrender.com', 
});

// Tự động đính kèm Token vào Header cho mọi yêu cầu
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;