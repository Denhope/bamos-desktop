import axios from 'axios';
// export const API_URL = 'http://localhost:4000';
// export const API_URL = 'http://172.16.50.85:4000';
// export const API_URL = 'http://192.168.74.11:4000';
// export const API_URL = 'http://82.209.232.250:4000';

export const API_URL = 'https://planebox-api-production.up.railway.app';
export const USER_ID = localStorage.getItem('userId');
export const COMPANY_ID = localStorage.getItem('companyID') || '';

const $host = axios.create({
  baseURL: API_URL,
});

const $authHost = axios.create({
  baseURL: API_URL,

  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const $authHostRefresh = axios.create({
  baseURL: API_URL,

  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const authInterceptor = (config: any) => {
  config.headers.authorization = `Bearer ${localStorage.getItem('token')}`;

  return config;
};
const authRefInterceptor = (config: any) => {
  config.headers.authorization = `Bearer ${localStorage.getItem(
    'refreshtoken'
  )}`;
  return config;
};

$authHost.interceptors.request.use(authInterceptor);
$authHostRefresh.interceptors.request.use(authRefInterceptor);

$authHost.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response.status == 401 &&
      error.config &&
      !error.config._isRetry
    ) {
      originalRequest._isRetry = true;
      try {
        const response = await $authHostRefresh.get(
          `${API_URL}/users/${USER_ID}/tokens`
        );
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return $authHost.request(originalRequest);
      } catch (e) {
        console.log('НЕ АВТОРИЗОВАН');
      }
    }
    throw error;
  }
);

export { $host, $authHost, $authHostRefresh };
