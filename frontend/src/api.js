import axios from 'axios';

const normalizeContactFields = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeContactFields);
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, fieldValue]) => [
      key,
      typeof fieldValue === 'string' && /(correo|e-?mail|direcci[oó]n|address)/i.test(key)
        ? fieldValue.toLowerCase()
        : normalizeContactFields(fieldValue),
    ]),
  );
};

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  if (config.data) {
    config.data = normalizeContactFields(config.data);
  }

  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;