import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

// Categories API
export const getCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

export const createCategory = async (category) => {
    const response = await api.post('/categories', category);
    return response.data;
};

export const updateCategory = async (id, category) => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};

// Monthly Values API
export const getValuesByYear = async (year) => {
    const response = await api.get(`/values/${year}`);
    return response.data;
};

export const updateValue = async (category_id, year, month, amount) => {
    const response = await api.put('/values', {
        category_id,
        year,
        month,
        amount,
    });
    return response.data;
};

export const batchUpdateValues = async (updates) => {
    const response = await api.put('/values/batch', { updates });
    return response.data;
};

// Summary API
export const getSummary = async (year) => {
    const response = await api.get(`/summary/${year}`);
    return response.data;
};

// Health check
export const checkHealth = async () => {
    const response = await api.get('/health');
    return response.data;
};

export default api;
