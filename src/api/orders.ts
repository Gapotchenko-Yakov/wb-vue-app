import api from './axios';
import type { FetchParams } from './types';

export const getOrders = async (params: FetchParams) => {
    const response = await api.get('/orders', { params });
    return response.data;
};
