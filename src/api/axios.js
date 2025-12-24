import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Không nên có dấu / ở cuối nếu route là /restaurants
});

export default api;