import apiClient from './client';
import type { LoginRequest, LoginResponse, PersonRegisterRequest, RegisterResponse } from '@/lib/types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  personRegister: async (data: PersonRegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register/person', data);
    return response.data;
  },

  companyRegister: async (data: PersonRegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register/company', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<number> => {
    const response = await apiClient.get<number>('/auth/current');
    return response.data;
  },

  validateToken: async (): Promise<boolean> => {
    const response = await apiClient.get<boolean>('/auth/validate');
    return response.data;
  },
};