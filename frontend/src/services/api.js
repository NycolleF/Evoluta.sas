import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
    baseURL: apiBaseUrl
});

export function buildApiUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (/^https?:\/\//i.test(apiBaseUrl)) {
        return `${apiBaseUrl}${normalizedPath}`;
    }

    return `${window.location.origin}${apiBaseUrl}${normalizedPath}`;
}
