import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  PersonRegisterRequest,
  CompanyRegisterRequest,
  RegisterResponse,
  SendVerifyCodeRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  SendResetCodeRequest,
} from '@/lib/types';

export interface AuthContextResponse {
  userId: number;
  userType: 'PERSON' | 'COMPANY' | 'ADMIN';
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  personRegister: async (data: PersonRegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register/person', data);
    return response.data;
  },

  companyRegister: async (data: CompanyRegisterRequest): Promise<LoginResponse> => {
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

  getContext: async (): Promise<AuthContextResponse> => {
    const response = await apiClient.get<AuthContextResponse>('/auth/context');
    return response.data;
  },

  adminLogin: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/admin/login', data);
    return response.data;
  },

  sendVerifyCode: async (email: string, type: string = 'register'): Promise<void> => {
    await apiClient.post('/auth/send-verify-code', null, {
      params: { email, type },
    });
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh-token', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },

  sendResetCode: async (data: SendResetCodeRequest): Promise<void> => {
    await apiClient.post('/auth/send-reset-code', data);
  },
};
