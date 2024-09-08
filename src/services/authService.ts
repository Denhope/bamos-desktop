import { useNavigate } from 'react-router-dom';
import { $host, $authHostRefresh, $authHost, USER_ID } from '../utils/api/http';
import { RouteNames } from '@/router';

export default class AuthService {
  static hasRefreshed = false;
  static async login(email: string, password: string) {
    const response = await $host.post('/signin', {
      email,
      password,
    });
    // const combinedPermissions = [
    //   ...response.data.permissions,
    //   ...response.data.userGroupID.permissions,
    // ];
    localStorage.setItem('firstName', response.data.firstName);
    localStorage.setItem('lastName', response.data.lastName);
    localStorage.setItem('role', response.data.role);
    localStorage.setItem('singNumber', response.data.singNumber);
    localStorage.setItem('permissions', response.data.permissions);
    localStorage.setItem(
      'name',
      response.data.name ||
        `${response.data.firstName}  ${response.data.lastName}`
    );
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshtoken', response.data.refreshToken);
    localStorage.setItem('userId', response.data.userId);
    localStorage.setItem('telegramID', response.data.telegramID);
    localStorage.setItem('companyID', response.data.companyID);
    return response;
  }

  static async registration(
    name: string | undefined,
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    singNumber?: string,
    role?: string
  ) {
    const response = await $host.post('/users', {
      name,
      email,
    });

    // console.log(response);
    localStorage.setItem('name', response.data.name);
    return response;
  }

  static async check(userId: any) {
    const response = await $authHost.get(`/users/${userId}`);
    return response;
  }

  static async getNewTokens(userId: any) {
    const response = await $authHostRefresh.get(`/users/${userId}/tokens`);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshtoken', response.data.refreshToken);
    return response;
  }

  static userLogout() {
    localStorage.removeItem('name');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshtoken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('firstName');
    localStorage.removeItem('role');
    localStorage.removeItem('singNumber');
    localStorage.removeItem('telegramID');
    localStorage.removeItem('currentPlaneID');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('selectedKey');
    localStorage.removeItem('selectedTopKeys');
    localStorage.removeItem('selectedKeys');
    localStorage.removeItem('dueSearchUrl');
    localStorage.removeItem('dueValue');
    localStorage.removeItem('dueMosType');
    localStorage.removeItem('dueOUTDate');
    localStorage.removeItem('dueINDate');
    localStorage.removeItem('taskSearchUrl');
    localStorage.removeItem('companyID');
    localStorage.removeItem('permissions');
  }
  static async handleAuthError(error: any) {
    const originalRequest = error.config;

    // Проверяем, существует ли error.response и имеет ли он статус 401
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await AuthService.refreshTokens();
        return $authHost(originalRequest);
      } catch (e) {
        console.log('User is not authorized');
        if (!AuthService.hasRefreshed) {
          AuthService.hasRefreshed = true;
          window.location.reload(); // Перезагрузка страницы
        }
      }
    }

    // Если error.response не существует, обрабатываем эту ситуацию
    if (!error.response) {
      console.error('Network error or request was not completed:', error);
      // Здесь можно добавить дополнительную логику для обработки сетевых ошибок
    }

    throw error;
  }

  static async refreshTokens() {
    const response = await $authHostRefresh.get(
      `/users/${USER_ID}/tokens/refresh`
    );
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    return response;
  }
}
