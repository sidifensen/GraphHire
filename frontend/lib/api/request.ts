import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7777';

export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface PageResponse<T = unknown> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

class ApiRequest {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.instance.interceptors.request.use(
      (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const apiRequest = new ApiRequest();
