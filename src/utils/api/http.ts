import { useAppDispatch } from '@/hooks/useTypedSelector';
import AuthService from '@/services/authService';
import { authSlice } from '@/store/reducers/AuthSlice';
import axios from 'axios';
// export const API_URL = 'http://localhost:3001'; // Убедитесь, что порт соответствует порту вашего сервера
// export const API_URL = 'http://172.16.50.85:4000';
// export const API_URL = 'http://192.168.74.11:8000';
// export const API_URL = 'http://192.168.74.11:5000';
// export const API_URL = 'http://82.209.232.250:4000';
export const API_URL = 'http://192.168.74.14';

// export const API_URL = 'https://planebox-api-production.up.railway.app';

export const ROLE = localStorage.getItem('role');


export const FULL_NAME = `${localStorage.getItem(
  'firstName'
)} ${localStorage.getItem('lastName')}`;
export const SING = `${localStorage.getItem('singNumber')}`;

export let COMPANY_ID: string | null = localStorage.getItem('companyID');
export let USER_ID: string | null = localStorage.getItem('userId');
export let PERMISSIONS: string | null = localStorage.getItem('permissions');

export function setCompanyId(companyId: string) {
  COMPANY_ID = companyId;
  localStorage.setItem('companyID', companyId);
}

export function setUserId(userId: string) {
  USER_ID = userId;
  localStorage.setItem('userId', userId);
}

export function setPermissions(permissions: string) {
  PERMISSIONS = permissions;
  localStorage.setItem('permissions', permissions);
}

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
          `${API_URL}/users/${USER_ID}/tokens/refresh`
        );
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return $authHost.request(originalRequest);
      } catch (e) {
        console.log('НЕ АВТОРИЗОВАН');
        // AuthService.handleAuthError(error);
      }
    }
    throw error;
  }
);

export { $host, $authHost, $authHostRefresh };

$authHost.defaults.maxBodyLength = Infinity;
$authHost.defaults.maxContentLength = Infinity;

