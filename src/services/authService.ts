import { $host, $authHostRefresh, $authHost } from '../utils/api/http';

export default class AuthService {
  static async login(email: string, password: string) {
    const response = await $host.post('/signin', {
      email,
      password,
    });
    localStorage.setItem('firstName', response.data.firstName);
    localStorage.setItem('lastName', response.data.lastName);
    localStorage.setItem('role', response.data.role);
    localStorage.setItem('singNumber', response.data.singNumber);
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
  }
}
