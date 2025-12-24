import axios from 'axios';

const api = axios.create({
    // Thêm lại /api vào cuối, nhưng NHỚ ĐỪNG để dấu / ở cuối cùng
    baseURL: 'http://localhost:8080/api', 
});

export default api;