import axios from 'axios';

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
export const API_BASE_URL = rawUrl.replace(/\/+$/, '');
export const BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const tenantId = localStorage.getItem('tenantId');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (tenantId) {
            config.headers['x-tenant-id'] = tenantId;
        }
    }
    return config;
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                // Redirect to login if not already there
                if (!window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export const uploadImage = async (file: File, type: 'profile-image' | 'visit-attachment' | 'logo' = 'profile-image'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/uploads/${type}`, formData, {
        headers: {
            'Content-Type': undefined,
        },
    });
    return response.data.url;
};

export default api;