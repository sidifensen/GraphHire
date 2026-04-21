export type UserType = 'PERSON' | 'COMPANY' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  type: UserType;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  userType: UserType;
  userId: number;
}

export interface PersonRegisterRequest {
  username: string;
  password: string;
  verifyCode: string;
}

export interface CompanyRegisterRequest {
  username: string;
  password: string;
  verifyCode: string;
  companyName?: string;
  unifiedSocialCreditCode?: string;
}

export interface RegisterResponse {
  userId: number;
  message: string;
}

export interface SendVerifyCodeRequest {
  email: string;
  type: 'register' | 'reset';
}

export interface ForgotPasswordRequest {
  email: string;
  verifyCode: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  verifyCode: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface SendResetCodeRequest {
  email: string;
}

// API Result wrapper (for type extraction)
export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}