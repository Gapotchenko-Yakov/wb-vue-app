import api from './axios';

export const getIncomes = async (params) => {
    const response = await api.get('/incomes', { params });
    return response.data;
};
