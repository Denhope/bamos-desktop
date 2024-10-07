import { useAppDispatch } from '@/hooks/useTypedSelector';
import AuthService from '@/services/authService';
import { authSlice } from '@/store/reducers/AuthSlice';
import axios from 'axios';
import { getApiUrl, setApiUrl } from './config';

export const API_URL = getApiUrl();

export const ROLE = localStorage.getItem('role');

export const FULL_NAME = `${localStorage.getItem('firstName')} ${localStorage.getItem('lastName')}`;
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

const createAxiosInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

export const $host = createAxiosInstance(API_URL);
export const $authHost = createAxiosInstance(API_URL);
export const $authHostRefresh = createAxiosInstance(API_URL);

const authInterceptor = (config: any) => {
  config.headers.authorization = `Bearer ${localStorage.getItem('token')}`;
  return config;
};

const authRefInterceptor = (config: any) => {
  config.headers.authorization = `Bearer ${localStorage.getItem('refreshtoken')}`;
  return config;
};

$authHost.interceptors.request.use(authInterceptor);
$authHostRefresh.interceptors.request.use(authRefInterceptor);

$authHost.interceptors.response.use(
  (config) => config,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status == 401 && error.config && !error.config._isRetry) {
      originalRequest._isRetry = true;
      try {
        const response = await $authHostRefresh.get(`${API_URL}/users/${USER_ID}/tokens/refresh`);
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

$authHost.defaults.maxBodyLength = Infinity;
$authHost.defaults.maxContentLength = Infinity;

// Функция для обновления baseURL всех экземпляров axios
export const updateApiUrl = (newUrl: string) => {
  setApiUrl(newUrl);
  const updatedUrl = getApiUrl();
  $host.defaults.baseURL = updatedUrl;
  $authHost.defaults.baseURL = updatedUrl;
  $authHostRefresh.defaults.baseURL = updatedUrl;
};

export const checkApiConnection = async () => {
  try {
    await $host.get(`${API_URL}/api/health-check`, { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
};