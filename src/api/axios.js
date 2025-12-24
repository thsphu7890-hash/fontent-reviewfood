// File: src/api/api.js (hoặc nơi bạn lưu file này)
import axios from 'axios';

// Cách sửa chuyên nghiệp:
const api = axios.create({
    // Nếu có biến môi trường REACT_APP_API_URL thì dùng, nếu không thì dùng localhost
    // Lưu ý: Nếu dùng Vite thì là import.meta.env.VITE_API_URL
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080', 
});

export default api;