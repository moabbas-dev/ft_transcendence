import axios from 'axios';
import store from '../../store/store';

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
