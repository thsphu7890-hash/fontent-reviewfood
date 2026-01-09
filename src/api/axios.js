import axios from 'axios';

// Tạo instance axios với Base URL trỏ về Backend
const instance = axios.create({
    // SỬA Ở ĐÂY: Dùng biến môi trường, nếu không tìm thấy thì mới dùng localhost làm dự phòng
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Phần dưới giữ nguyên không đổi ---
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