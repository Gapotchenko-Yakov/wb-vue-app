import api from './axios';
import type { FetchParams } from './types';

export const getStocks = async (params: FetchParams) => {
    const response = await api.get('/stocks', { params });
    return response.data;
};
