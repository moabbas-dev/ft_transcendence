import axios from 'axios';
import store from '../../store/store';
import Toast from '../toast/Toast';
import { navigate } from '../router';
import connectionManager from './ConnectionManager';

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

const isConnectionError = (error: any): boolean => {
    // Network errors (no internet, server unreachable)
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        return true;
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return true;
    }

    // No response received (server down)
    if (!error.response) {
        return true;
    }

    // Server errors (5xx) - you might want to treat these as connection issues
    if (error.response.status >= 500) {
        return true;
    }

    return false;
};

axios.interceptors.request.use(
    (config) => {
        config.withCredentials = true;
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

axios.interceptors.response.use(
    (response) => {
        connectionManager.setOnline();
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (isConnectionError(error)) {
            connectionManager.setOffline(getConnectionErrorMessage(error));
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
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
                const response = await axios.post('/authentication/auth/jwt/refresh/session', {}, {
                    withCredentials: true,
                    headers: { 'Skip-Auth-Interceptor': 'true' }
                });

                const newAccessToken = response.data.accessToken;
                store.update('accessToken', newAccessToken);

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (refreshError: any) {
                processQueue(refreshError, null);

                if (isConnectionError(refreshError)) {
                    connectionManager.setOffline('Unable to refresh session - connection lost');
                } else {
                    await store.logout();
                    Toast.show("Session expired, please sign in again!", "warn");
                    navigate('/register');
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

function getConnectionErrorMessage(error: any): string {
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        return 'Network connection failed';
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return 'Request timeout - server not responding';
    }

    if (!error.response) {
        return 'Server unreachable';
    }

    if (error.response.status >= 500) {
        return `Server error (${error.response.status})`;
    }

    return 'Connection error';
}

axios.defaults.timeout = 10000;
