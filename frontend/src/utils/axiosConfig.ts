import axios from 'axios';
import store from '../../store/store';
import Toast from '../toast/Toast';

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
        return response;
    },
    async (error) => {
        const errorMessages = [
            "Access token expired!",
            "Invalid access token!",
            "Invalid access token",
            "Invalid refresh token!",
            "No session found",
            "Unauthorized: No token provided",
            "No refresh token provided!"
        ]
        const message = error.response?.data?.message;

        if (error.response?.status === 401 && errorMessages.includes(message)) {
            try {
                await store.logout();
            } catch(err) {
                return Promise.reject(error);
            }
            Toast.show("Your session has expired", "error");
        }
        
        return Promise.reject(error);
    }
);