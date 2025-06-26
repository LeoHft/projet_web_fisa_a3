import axios from "axios";


export const apiClient = axios.create({
    baseURL: process.env.BASE_API_URL || 'https://breezy.hofstetterlab.ovh/api',
    timeout: 5000,
});
