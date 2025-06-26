import axios from "axios";


export const apiClient = axios.create({
    baseURL: process.env.BASE_API_URL || 'https://192.168.1.177:8443/api',
    timeout: 5000,
});
