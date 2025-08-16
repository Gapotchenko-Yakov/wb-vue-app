import api from './axios';

export const getSales = async () => {
    const response = await api.get('/sales', { params });
    return response.data;
};
