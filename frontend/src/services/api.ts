import axios from 'axios'; export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'https://redesigned-umbrella-1.onrender.com/api', withCredentials: true });
