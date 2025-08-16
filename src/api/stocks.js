import api from './axios';

export const getStocks = async () => {
    const response = await api.get('/stocks', { params });
    return response.data;
};
