import axios from 'axios';

// Tạo instance axios với Base URL trỏ về Backend
const instance = axios.create({
    // Lưu ý: Nếu Backend bạn không có prefix /api thì xóa chữ /api đi
    baseURL: 'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động gắn Token vào mỗi request (nếu có)
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;