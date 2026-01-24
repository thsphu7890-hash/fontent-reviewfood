// File: src/api/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    withCredentials: true // Để nhận cookie nếu cần
});

// 👇 THÊM ĐOẠN NÀY: Tự động kẹp Token vào mỗi request 👇
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ bộ nhớ
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Gắn vào Header
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;