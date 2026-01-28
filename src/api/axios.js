import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    withCredentials: true // Giữ nguyên nếu backend yêu cầu Cookie, nếu không có thể bỏ
});

// 1. REQUEST INTERCEPTOR: Gắn token
api.interceptors.request.use(
    (config) => {
        // LƯU Ý: Kiểm tra kỹ xem bạn lưu là 'token', 'accessToken' hay 'access_token'?
        // Mở DevTools -> Application -> Local Storage để xem tên chính xác.
        const token = localStorage.getItem('token'); 
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: Xử lý khi Token chết (Quan trọng nhất)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        // Nếu lỗi 403 (Forbidden) hoặc 401 (Unauthorized)
        if (status === 403 || status === 401) {
            console.error("Lỗi 403/401: Token hết hạn hoặc không có quyền. Đang đăng xuất...");

            // BƯỚC QUAN TRỌNG: Xóa token cũ đi để tránh gửi lại token sai
            localStorage.removeItem('token');
            // Xóa thêm user info nếu có
            localStorage.removeItem('user'); 

            // Điều hướng người dùng về trang đăng nhập
            // Dùng window.location.href để load lại trang sạch sẽ nhất
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'; 
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;