import axios from 'axios';

const api = axios.create({
    // Tôi đã ghép sẵn link từ ảnh của bạn + đuôi /api
    baseURL: 'https://backend-foodreview-1.onrender.com/api', 
});

export default api;