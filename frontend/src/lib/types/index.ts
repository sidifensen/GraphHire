export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'JOB_SEEKER' | 'RECRUITER';
  phone?: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}
