import api from './axios';
import type { FetchParams } from './types';

export const getIncomes = async (params: FetchParams) => {
    const response = await api.get('/incomes', { params });
    return response.data;
};
