import axios from 'axios';

// Use relative '/api' by default so Vite's proxy seamlessly handles both
// localhost (laptop) and LAN IP / HTTPS (mobile phone scanner) with zero CORS issues.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('uok_bvms_token') ||
    sessionStorage.getItem('uok_bvms_mobile_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { API_BASE_URL };
export default api;
