import api from './axios';

export const getOrders = async (params) => {
    const response = await api.get('/orders', { params });
    return response.data;
};
