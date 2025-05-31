import axios from 'axios';
import store from '../../store/store';
import Toast from '../toast/Toast';
import { navigate } from '../router';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    
    failedQueue = [];
};

// Request interceptor
axios.interceptors.request.use(
    (config) => {
        // Always send cookies for refresh token
        config.withCredentials = true;
        
        // Only add Authorization header if we have an access token
        const token = store.accessToken;
        if (token && !config.url?.includes('/auth/me') && !config.url?.includes('/auth/login')) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If we're already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axios(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the token using cookies
                const response = await axios.post('/authentication/auth/jwt/refresh/session', {}, {
                    withCredentials: true,
                    headers: { 'Skip-Auth-Interceptor': 'true' }
                });
                
                const newAccessToken = response.data.accessToken;
                store.update('accessToken', newAccessToken);
                
                processQueue(null, newAccessToken);
                
                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                
                // Refresh failed, logout user
                await store.logout();
                Toast.show("Session expired, please sign in again!", "warn");
                navigate('/register');
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);