import api from './axios';
import type { FetchParams } from './types';

export const getSales = async (params: FetchParams) => {
    const response = await api.get('/sales', { params });
    return response.data;
};
