import { apiRequest } from './request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  userType: 'PERSON' | 'COMPANY' | 'ADMIN';
  userId: number;
}

export const authApi = {
  login: (params: LoginParams & { role: string }) =>
    apiRequest.post<LoginResponse>('/auth/login', params),

  loginAdmin: (params: LoginParams) =>
    apiRequest.post<{ accessToken: string }>('/auth/admin/login', params),

  registerPerson: (params: { username: string; password: string; phone: string }) =>
    apiRequest.post<LoginResponse>('/auth/register/person', params),

  registerCompany: (params: { username: string; password: string; phone: string; companyName: string }) =>
    apiRequest.post<LoginResponse>('/auth/register/company', params),

  logout: () => apiRequest.post('/auth/logout'),

  getCurrentUser: () => apiRequest.get<{ id: string; role: string }>('/auth/current'),
};
