import axios from 'axios';

const api = axios.create({
    baseURL: 'http://109.73.206.144:6969/api',
    params: {
        key: 'E6kUTYrYwZq2tN4QEtyzsbEBk3ie',
    }
});

export default api;
