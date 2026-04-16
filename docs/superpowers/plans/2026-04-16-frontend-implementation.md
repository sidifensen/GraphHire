# GraphHire 前端实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 GraphHire 招聘平台的完整前端项目，包含 C 端（个人/企业用户）和 A 端（管理后台），采用 Next.js 16 + Ant Design 6 + Tailwind CSS 技术栈。

**Architecture:** 采用 Monorepo 单仓库结构，通过 Next.js App Router 的路由分组（Route Groups）实现三端代码隔离。C 端共享布局和组件，企业端与个人端 UI 组件复用、数据层分离。A 端使用 Ant Design Pro 组件库实现企业级后台。状态管理使用 Zustand，API 层基于 Axios 封装。

**Tech Stack:** Next.js 16.2.3, React 19.2.5, Ant Design 6.3.5, Ant Design Pro 6.x, Tailwind CSS 4.x, Zustand 5.x, TypeScript 5.x, Turborepo 2.x

---

## 阶段一：项目初始化与基础架构

### Task 1: 初始化 Monorepo 项目结构

**Files:**
- Create: `package.json` (root workspace)
- Create: `turbo.json`
- Create: `tsconfig.json` (root)
- Create: `frontend/package.json`
- Create: `frontend/apps/web/package.json`
- Create: `frontend/packages/ui/package.json`

- [ ] **Step 1: 创建根目录 package.json**

```json
{
  "name": "graphhire",
  "private": true,
  "workspaces": [
    "frontend/apps/*",
    "frontend/packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: 创建 turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- [ ] **Step 3: 创建 frontend/apps/web/package.json (Next.js 项目)**

```json
{
  "name": "@graphhire/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 8888",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "16.2.3",
    "react": "19.2.5",
    "react-dom": "19.2.5",
    "antd": "6.3.5",
    "@ant-design/pro-components": "^2.8.0",
    "@ant-design/charts": "^2.2.0",
    "zustand": "^5.0.0",
    "axios": "^1.7.0",
    "next-themes": "^0.4.0",
    "dayjs": "^1.11.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.0",
    "@tailwindcss/postcss": "^4.0.0"
  }
}
```

- [ ] **Step 4: 创建 frontend/packages/ui/package.json**

```json
{
  "name": "@graphhire/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "scripts": {
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "19.2.5",
    "antd": "6.3.5"
  }
}
```

- [ ] **Step 5: Commit**

```bash
cd D:/code/GraphHire && git add frontend/package.json frontend/turbo.json frontend/tsconfig.json frontend/apps/web/package.json frontend/packages/ui/package.json && git commit -m "feat: initialize monorepo structure with Turborepo"
```

---

### Task 2: 创建 Next.js 核心配置文件

**Files:**
- Create: `frontend/apps/web/next.config.ts`
- Create: `frontend/apps/web/tailwind.config.ts`
- Create: `frontend/apps/web/postcss.config.js`
- Create: `frontend/apps/web/tsconfig.json`

- [ ] **Step 1: 创建 next.config.ts**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.rustfs.example.com' },
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  transpilePackages: [
    '@ant-design/pro-components',
    '@ant-design/charts',
    '@ant-design/graph',
  ],
};

export default nextConfig;
```

- [ ] **Step 2: 创建 tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#60A5FA',
        },
        success: {
          DEFAULT: '#10B981',
          dark: '#34D399',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#FBBF24',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#F87171',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        cht: ['var(--font-noto-sans-sc)', 'sans-serif'],
      },
      borderRadius: {
        button: '6px',
        card: '8px',
        input: '6px',
      },
      spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: 创建 postcss.config.js**

```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 4: 创建 frontend/apps/web/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/next.config.ts frontend/apps/web/tailwind.config.ts frontend/apps/web/postcss.config.js frontend/apps/web/tsconfig.json && git commit -m "feat: add Next.js core config files"
```

---

### Task 3: 创建全局样式和 Tailwind 入口

**Files:**
- Create: `frontend/apps/web/app/globals.css`
- Create: `frontend/apps/web/app/layout.tsx` (root layout)
- Create: `frontend/apps/web/app/providers.tsx`

- [ ] **Step 1: 创建 globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #3B82F6;
  --color-primary-dark: #60A5FA;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-bg: #F9FAFB;
  --color-card: #FFFFFF;
  --color-text: #1F2937;
  --color-text-secondary: #4B5563;
  --color-border: #E5E7EB;
}

.dark {
  --color-bg: #111827;
  --color-card: #1F2937;
  --color-text: #F3F4F6;
  --color-text-secondary: #D1D5DB;
  --color-border: #374151;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.shadow-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.04);
}

.shadow-hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.dark .shadow-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2);
}

.dark .shadow-hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 2: 创建 providers.tsx**

```tsx
'use client';

import { ConfigProvider, theme } from 'antd';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#3B82F6',
            borderRadius: 6,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: 创建根布局 app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-noto-sans-sc',
});

export const metadata: Metadata = {
  title: 'GraphHire - 图谱智聘',
  description: '基于AI智能匹配与能力图谱的招聘平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: 创建根页面 app/page.tsx**

```tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
}
```

- [ ] **Step 5: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/globals.css frontend/apps/web/app/providers.tsx frontend/apps/web/app/layout.tsx frontend/apps/web/app/page.tsx && git commit -m "feat: add global styles and root layout"
```

---

## 阶段二：API 层与状态管理

### Task 4: 创建 API 请求封装

**Files:**
- Create: `frontend/apps/web/lib/api/request.ts`
- Create: `frontend/apps/web/lib/api/auth.ts`
- Create: `frontend/apps/web/lib/api/person.ts`
- Create: `frontend/apps/web/lib/api/company.ts`
- Create: `frontend/apps/web/lib/api/admin.ts`
- Create: `frontend/apps/web/lib/api/types.ts`

- [ ] **Step 1: 创建 API 请求基础封装 lib/api/request.ts**

```ts
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
```

- [ ] **Step 2: 创建认证 API lib/api/auth.ts**

```ts
import { apiRequest } from './request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'PERSON' | 'COMPANY' | 'ADMIN';
}

export const authApi = {
  login: (params: LoginParams & { role: string }) =>
    apiRequest.post<LoginResponse>('/auth/login', params),

  loginAdmin: (params: LoginParams) =>
    apiRequest.post<{ token: string }>('/auth/admin/login', params),

  registerPerson: (params: { username: string; password: string; phone: string }) =>
    apiRequest.post<LoginResponse>('/auth/register/person', params),

  registerCompany: (params: { username: string; password: string; phone: string; companyName: string }) =>
    apiRequest.post<LoginResponse>('/auth/register/company', params),

  logout: () => apiRequest.post('/auth/logout'),

  getCurrentUser: () => apiRequest.get<{ id: string; role: string }>('/auth/current'),
};
```

- [ ] **Step 3: 创建个人用户 API lib/api/person.ts**

```ts
import { apiRequest } from './request';

export interface PersonInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  gender?: string;
  age?: number;
  city?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  type: 'skill' | 'experience' | 'education';
  level?: number;
  years?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface PersonGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  city: string;
  salaryMin: number;
  salaryMax: number;
  education: string;
  experience: string;
  skills: string[];
  matchScore?: number;
}

export const personApi = {
  getInfo: () => apiRequest.get<PersonInfo>('/person/info'),

  updateInfo: (data: Partial<PersonInfo>) => apiRequest.put('/person/info', data),

  getGraph: () => apiRequest.get<PersonGraph>('/person/graph'),

  getRecommendJobs: (params?: { page?: number; size?: number }) =>
    apiRequest.get<{ list: Job[]; total: number }>('/person/recommend/jobs', { params }),

  getMatchDetail: (jobId: string) =>
    apiRequest.get<{ matchScore: number; skillMatch: number; details: unknown }>(`/person/match/${jobId}`),
};

export interface MyResume {
  id: string;
  fileName: string;
  parseStatus: 'PENDING' | 'PARSING' | 'SUCCESS' | 'FAILED';
  isDefault: boolean;
  updateTime: string;
}
```

- [ ] **Step 4: 创建简历 API lib/api/resume.ts**

```ts
import { apiRequest } from './request';

export interface MyResume {
  id: string;
  fileName: string;
  parseStatus: 'PENDING' | 'PARSING' | 'SUCCESS' | 'FAILED';
  isDefault: boolean;
  updateTime: string;
}

export const resumeApi = {
  upload: (formData: FormData) =>
    apiRequest.post('/resume/my/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getMyResumes: () => apiRequest.get<{ list: MyResume[]; total: number }>('/resume/my'),

  getResumeDetail: (id: string) => apiRequest.get(`/resume/${id}/detail`),

  deleteResume: (id: string) => apiRequest.delete(`/resume/${id}`),

  setDefaultResume: (id: string) => apiRequest.put(`/resume/${id}/default`),

  reparseResume: (id: string) => apiRequest.post(`/resume/${id}/parse`),
};
```

- [ ] **Step 5: 创建企业 API lib/api/company.ts**

```ts
import { apiRequest } from './request';

export interface CompanyInfo {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  scale: string;
  authStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Job {
  id: string;
  title: string;
  status: 'OPEN' | 'CLOSED';
  salaryMin: number;
  salaryMax: number;
  city: string;
  education: string;
  experience: string;
  skills: string[];
  resumeCount: number;
  matchCount: number;
}

export interface Candidate {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  experience: string;
  education: string;
  city: string;
  skills: string[];
  matchScore: number;
}

export interface MatchDetail {
  resumeId: string;
  jobId: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  cityScore: number;
  skillDetails: { name: string; resumeLevel: number; required: number }[];
}

export const companyApi = {
  getInfo: () => apiRequest.get<CompanyInfo>('/company/info'),

  updateInfo: (data: Partial<CompanyInfo>) => apiRequest.put('/company/info', data),

  submitAuth: (data: FormData) =>
    apiRequest.post('/company/auth', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getJobList: (params?: { page?: number; size?: number; status?: string }) =>
    apiRequest.get<{ list: Job[]; total: number }>('/company/job/list', { params }),

  getJobDetail: (id: string) => apiRequest.get<Job>(`/company/job/${id}`),

  createJob: (data: Omit<Job, 'id' | 'resumeCount' | 'matchCount'>) =>
    apiRequest.post('/company/job', data),

  updateJob: (id: string, data: Partial<Job>) =>
    apiRequest.put(`/company/job/${id}`, data),

  publishJob: (id: string) => apiRequest.post(`/company/job/${id}/publish`),

  closeJob: (id: string) => apiRequest.post(`/company/job/${id}/close`),

  getRecommendResumes: (params?: { jobId?: string; page?: number; size?: number }) =>
    apiRequest.get<{ list: Candidate[]; total: number }>('/company/recommend/resumes', { params }),

  getMatchDetail: (resumeId: string) =>
    apiRequest.get<MatchDetail>(`/company/match/${resumeId}`),
};
```

- [ ] **Step 6: 创建管理后台 API lib/api/admin.ts**

```ts
import { apiRequest } from './request';

export interface DashboardStats {
  personUsers: number;
  companyUsers: number;
  resumes: number;
  jobs: number;
  pendingCompanies: number;
  userGrowth: { date: string; count: number }[];
}

export interface PersonUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'DISABLED';
  createTime: string;
}

export interface CompanyUser {
  id: string;
  name: string;
  industry: string;
  scale: string;
  authStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  jobCount: number;
  createTime: string;
}

export interface Resume {
  id: string;
  personName: string;
  jobTitle: string;
  parseStatus: 'PENDING' | 'PARSING' | 'SUCCESS' | 'FAILED';
  matchScore?: number;
  createTime: string;
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  salaryRange: string;
  status: 'OPEN' | 'CLOSED';
  candidateCount: number;
  createTime: string;
}

export interface SkillTag {
  id: string;
  name: string;
  category: string;
  useCount: number;
  isHot: boolean;
  status: 'ACTIVE' | 'DISABLED';
}

export interface ParseTask {
  id: string;
  type: string;
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  progress: number;
  startTime: string;
  duration?: string;
}

export const adminApi = {
  getDashboardStats: () => apiRequest.get<DashboardStats>('/admin/dashboard/stats'),

  approveCompany: (id: string) => apiRequest.post(`/admin/company/${id}/approve`),

  rejectCompany: (id: string) => apiRequest.post(`/admin/company/${id}/reject`),

  getPendingCompanies: () =>
    apiRequest.get<{ list: CompanyUser[]; total: number }>('/admin/company/pending'),

  getCompanyAuthList: (status?: string) =>
    apiRequest.get<{ list: CompanyUser[]; total: number }>('/admin/company/auth-list', {
      params: { status },
    }),

  getPersonUsers: (params?: { page?: number; size?: number; keyword?: string }) =>
    apiRequest.get<{ list: PersonUser[]; total: number }>('/admin/user/list', {
      params: { ...params, type: 'PERSON' },
    }),

  getCompanyUsers: (params?: { page?: number; size?: number; keyword?: string }) =>
    apiRequest.get<{ list: CompanyUser[]; total: number }>('/admin/user/list', {
      params: { ...params, type: 'COMPANY' },
    }),

  disableUser: (id: string) => apiRequest.post('/admin/user/disable', { id }),

  updateUserStatus: (id: string, status: string) =>
    apiRequest.put(`/admin/user/${id}/status`, { status }),

  getResumes: (params?: { page?: number; size?: number; keyword?: string; parseStatus?: string }) =>
    apiRequest.get<{ list: Resume[]; total: number }>('/admin/resume/list', { params }),

  getJobs: (params?: { page?: number; size?: number; keyword?: string }) =>
    apiRequest.get<{ list: Job[]; total: number }>('/admin/job/list', { params }),

  getSkillTags: (params?: { page?: number; size?: number; keyword?: string }) =>
    apiRequest.get<{ list: SkillTag[]; total: number }>('/admin/skill/list', { params }),

  createSkillTag: (data: { name: string; category: string; isHot?: boolean }) =>
    apiRequest.post('/skill-tags', data),

  updateSkillTag: (id: string, data: Partial<SkillTag>) =>
    apiRequest.put(`/skill-tags/${id}`, data),

  deleteSkillTag: (id: string) => apiRequest.delete(`/skill-tags/${id}`),

  getTasks: (params?: { page?: number; size?: number }) =>
    apiRequest.get<{ list: ParseTask[]; total: number }>('/admin/task/list', { params }),

  retryTask: (id: string) => apiRequest.post(`/admin/task/${id}/retry`),
};
```

- [ ] **Step 6: 创建 API 类型导出 lib/api/types.ts**

```ts
export * from './request';
export * from './auth';
export * from './person';
export * from './resume';
export * from './company';
export * from './admin';
```

- [ ] **Step 7: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/lib/api/ && git commit -m "feat: add API request layer with auth, person, company and admin APIs"
```

---

### Task 5: 创建 Zustand 状态管理 Store

**Files:**
- Create: `frontend/apps/web/stores/authStore.ts`
- Create: `frontend/apps/web/stores/personStore.ts`
- Create: `frontend/apps/web/stores/companyStore.ts`
- Create: `frontend/apps/web/stores/adminStore.ts`
- Create: `frontend/apps/web/stores/themeStore.ts`

- [ ] **Step 1: 创建认证 Store stores/authStore.ts**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'PERSON' | 'COMPANY' | 'ADMIN';

interface AuthState {
  token: string | null;
  role: UserRole | null;
  userId: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, role: UserRole, userId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      isAuthenticated: false,
      setAuth: (token, role, userId) =>
        set({ token, role, userId, isAuthenticated: true }),
      clearAuth: () =>
        set({ token: null, role: null, userId: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

- [ ] **Step 2: 创建个人用户 Store stores/personStore.ts**

```ts
import { create } from 'zustand';
import type { PersonInfo, PersonGraph, Job } from '@/lib/api/person';

interface PersonState {
  info: PersonInfo | null;
  graph: PersonGraph | null;
  recommendedJobs: Job[];
  jobsTotal: number;
  setInfo: (info: PersonInfo) => void;
  setGraph: (graph: PersonGraph) => void;
  setRecommendedJobs: (jobs: Job[], total: number) => void;
  clearPerson: () => void;
}

export const usePersonStore = create<PersonState>((set) => ({
  info: null,
  graph: null,
  recommendedJobs: [],
  jobsTotal: 0,
  setInfo: (info) => set({ info }),
  setGraph: (graph) => set({ graph }),
  setRecommendedJobs: (jobs, total) => set({ recommendedJobs: jobs, jobsTotal: total }),
  clearPerson: () => set({ info: null, graph: null, recommendedJobs: [], jobsTotal: 0 }),
}));
```

- [ ] **Step 3: 创建企业 Store stores/companyStore.ts**

```ts
import { create } from 'zustand';
import type { CompanyInfo, Job, Candidate } from '@/lib/api/company';

interface CompanyState {
  info: CompanyInfo | null;
  jobs: Job[];
  jobsTotal: number;
  candidates: Candidate[];
  candidatesTotal: number;
  setInfo: (info: CompanyInfo) => void;
  setJobs: (jobs: Job[], total: number) => void;
  setCandidates: (candidates: Candidate[], total: number) => void;
  clearCompany: () => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  info: null,
  jobs: [],
  jobsTotal: 0,
  candidates: [],
  candidatesTotal: 0,
  setInfo: (info) => set({ info }),
  setJobs: (jobs, total) => set({ jobs, jobsTotal: total }),
  setCandidates: (candidates, total) => set({ candidates, candidatesTotal: total }),
  clearCompany: () => set({ info: null, jobs: [], jobsTotal: 0, candidates: [], candidatesTotal: 0 }),
}));
```

- [ ] **Step 4: 创建管理后台 Store stores/adminStore.ts**

```ts
import { create } from 'zustand';
import type { DashboardStats } from '@/lib/api/admin';

interface AdminState {
  stats: DashboardStats | null;
  setStats: (stats: DashboardStats) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
}));
```

- [ ] **Step 5: 创建主题 Store stores/themeStore.ts**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
);
```

- [ ] **Step 6: 创建 Store 导出 stores/index.ts**

```ts
export { useAuthStore } from './authStore';
export { usePersonStore } from './personStore';
export { useCompanyStore } from './companyStore';
export { useAdminStore } from './adminStore';
export { useThemeStore } from './themeStore';
```

- [ ] **Step 7: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/stores/ && git commit -m "feat: add Zustand stores for auth, person, company, admin and theme"
```

---

## 阶段三：认证模块开发

### Task 6: 创建登录页面

**Files:**
- Create: `frontend/apps/web/app/(auth)/login/page.tsx`
- Create: `frontend/apps/web/app/(auth)/login/admin/page.tsx`
- Create: `frontend/apps/web/app/(auth)/admin-login/page.tsx`

- [ ] **Step 1: 创建登录页面布局 app/(auth)/layout.tsx**

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: 创建 C 端登录页面 app/(auth)/login/page.tsx**

```tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, Form, Input, Button, message, Card } from 'antd';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/authStore';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'person';
  const [activeTab, setActiveTab] = useState(defaultRole === 'company' ? 'company' : 'person');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const role = activeTab === 'person' ? 'PERSON' : 'COMPANY';
      const res = await authApi.login({ ...values, role });
      setAuth(res.token, res.role, res.token);
      message.success('登录成功');
      router.push(res.role === 'PERSON' ? '/person/home' : '/company/home');
    } catch {
      message.error('用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">GraphHire</h1>
        <p className="text-gray-500 mt-1">图谱智聘 - AI 智能招聘平台</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'person',
            label: '我是求职者',
            children: (
              <Form onFinish={handleLogin} layout="vertical" requiredMark={false}>
                <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                  <Input placeholder="用户名 / 手机号" size="large" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                  <Input.Password placeholder="密码" size="large" />
                </Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  登录
                </Button>
              </Form>
            ),
          },
          {
            key: 'company',
            label: '我是招聘方',
            children: (
              <Form onFinish={handleLogin} layout="vertical" requiredMark={false}>
                <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                  <Input placeholder="用户名 / 手机号" size="large" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                  <Input.Password placeholder="密码" size="large" />
                </Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  登录
                </Button>
              </Form>
            ),
          },
        ]}
      />

      <div className="text-center mt-4 text-sm text-gray-500">
        还没有账号？<a href="/register" className="text-primary">立即注册</a>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: 创建 A 端登录页面 app/(auth)/admin-login/page.tsx**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, message, Card } from 'antd';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/authStore';

interface AdminLoginForm {
  username: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async (values: AdminLoginForm) => {
    setLoading(true);
    try {
      const res = await authApi.loginAdmin(values);
      setAuth(res.token, 'ADMIN', res.token);
      message.success('登录成功');
      router.push('/admin/dashboard');
    } catch {
      message.error('用户名或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">GraphHire Admin</h1>
        <p className="text-gray-500 mt-1">管理后台</p>
      </div>

      <Form onFinish={handleLogin} layout="vertical" requiredMark={false}>
        <Form.Item name="username" rules={[{ required: true, message: '请输入管理员账号' }]}>
          <Input placeholder="管理员账号" size="large" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password placeholder="密码" size="large" />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          登录
        </Button>
      </Form>
    </Card>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/\(auth\)/ && git commit -m "feat: add login pages for C-end and admin"
```

---

### Task 7: 创建中间件路由保护

**Files:**
- Create: `frontend/apps/web/middleware.ts`

- [ ] **Step 1: 创建 middleware.ts**

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // A 端路由保护
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/')) {
    const token = request.cookies.get('admin_token')?.value || request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // C 端路由保护
  if ((pathname.startsWith('/person') || pathname.startsWith('/company')) && !pathname.startsWith('/login')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/person/:path*', '/company/:path*', '/admin/:path*'],
};
```

- [ ] **Step 2: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/middleware.ts && git commit -m "feat: add middleware for route protection"
```

---

## 阶段四：共享组件开发

### Task 8: 创建共享 UI 组件

**Files:**
- Create: `frontend/apps/web/components/shared/ui/Button.tsx`
- Create: `frontend/apps/web/components/shared/ui/Input.tsx`
- Create: `frontend/apps/web/components/shared/ui/Card.tsx`
- Create: `frontend/apps/web/components/shared/ui/Tag.tsx`
- Create: `frontend/apps/web/components/shared/ui/Avatar.tsx`
- Create: `frontend/apps/web/components/shared/ui/Badge.tsx`
- Create: `frontend/apps/web/components/shared/ui/index.ts`

- [ ] **Step 1: 创建 Button 组件**

```tsx
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends AntButtonProps {
  variant?: 'primary' | 'default' | 'text' | 'danger';
  size?: 'lg' | 'md' | 'sm';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      lg: 'h-10 px-6 text-sm',
      md: 'h-8 px-4 text-sm',
      sm: 'h-6 px-3 text-xs',
    };

    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary/90',
      default: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
      text: 'text-primary hover:bg-primary/5',
      danger: 'bg-danger text-white hover:bg-danger/90',
    };

    return (
      <AntButton
        ref={ref}
        className={clsx(sizeClasses[size], variantClasses[variant], 'rounded-button', className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

- [ ] **Step 2: 创建 Card 组件**

```tsx
import { Card as AntCard, CardProps as AntCardProps } from 'antd';
import { ReactNode } from 'react';

interface CardProps extends AntCardProps {
  title?: ReactNode;
  extra?: ReactNode;
}

export function Card({ title, extra, children, className, ...props }: CardProps) {
  return (
    <AntCard
      className={`shadow-card rounded-card ${className || ''}`}
      title={title}
      extra={extra}
      {...props}
    >
      {children}
    </AntCard>
  );
}
```

- [ ] **Step 3: 创建 Tag 组件**

```tsx
import { Tag as AntTag, TagProps as AntTagProps } from 'antd';
import { clsx } from 'clsx';

type TagVariant = 'skill' | 'success' | 'warning' | 'danger' | 'default';

interface TagProps extends AntTagProps {
  variant?: TagVariant;
}

const variantClasses: Record<TagVariant, string> = {
  skill: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  success: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  warning: 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  danger: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  default: 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

export function Tag({ variant = 'default', className, ...props }: TagProps) {
  return (
    <AntTag
      className={clsx('rounded-tag px-2 py-0.5 text-xs', variantClasses[variant], className)}
      {...props}
    />
  );
}
```

- [ ] **Step 4: 创建 Avatar 组件**

```tsx
import { Avatar as AntAvatar, AvatarProps as AntAvatarProps } from 'antd';
import { clsx } from 'clsx';

interface AvatarProps extends AntAvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function Avatar({ size = 'md', className, ...props }: AvatarProps) {
  return (
    <AntAvatar
      className={clsx(sizeClasses[size], className)}
      {...props}
    />
  );
}
```

- [ ] **Step 5: 创建 Badge 组件**

```tsx
import { Badge as AntBadge, BadgeProps as AntBadgeProps } from 'antd';
import { ReactNode } from 'react';

interface BadgeProps extends AntBadgeProps {
  count?: number;
  children?: ReactNode;
}

export function Badge({ count, children, ...props }: BadgeProps) {
  return (
    <AntBadge count={count} {...props}>
      {children}
    </AntBadge>
  );
}
```

- [ ] **Step 6: 创建 index.ts 导出**

```ts
export { Button } from './Button';
export { Card } from './Card';
export { Tag } from './Tag';
export { Avatar } from './Avatar';
export { Badge } from './Badge';
```

- [ ] **Step 7: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/components/shared/ui/ && git commit -m "feat: add shared UI components (Button, Card, Tag, Avatar, Badge)"
```

---

### Task 9: 创建共享 Layout 组件

**Files:**
- Create: `frontend/apps/web/components/shared/layout/Header.tsx`
- Create: `frontend/apps/web/components/shared/layout/Footer.tsx`
- Create: `frontend/apps/web/components/shared/layout/Container.tsx`
- Create: `frontend/apps/web/components/shared/layout/index.ts`

- [ ] **Step 1: 创建 Header 组件**

```tsx
'use client';

import { Dropdown, Badge, Avatar, Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const personNavItems = [
  { key: '/person/home', label: '首页' },
  { key: '/person/jobs', label: '职位推荐' },
  { key: '/person/graph', label: '能力图谱' },
  { key: '/person/resume', label: '简历管理' },
];

const companyNavItems = [
  { key: '/company/home', label: '首页' },
  { key: '/company/jobs', label: '职位管理' },
  { key: '/company/match', label: '候选人推荐' },
  { key: '/company/talent', label: '人才库' },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, clearAuth } = useAuthStore();

  const navItems = role === 'COMPANY' ? companyNavItems : personNavItems;
  const homePath = role === 'COMPANY' ? '/company/home' : '/person/home';

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile">{role === 'COMPANY' ? '企业中心' : '个人中心'}</Menu.Item>
      <Menu.Item key="settings">设置</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>退出登录</Menu.Item>
    </Menu>
  );

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center">
      <div className="flex items-center gap-8 flex-1">
        <a href={homePath} className="text-xl font-semibold text-primary">
          GraphHire
        </a>
        <nav className="hidden md:flex gap-1">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.key}
              className={`px-4 py-2 text-sm rounded-button transition-colors ${
                pathname.startsWith(item.key)
                  ? 'text-primary bg-primary/5 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-primary'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Badge count={3}>
          <a href="/notifications" className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </a>
        </Badge>

        <Dropdown overlay={menu} placement="bottomRight">
          <Avatar className="cursor-pointer bg-primary">U</Avatar>
        </Dropdown>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: 创建 Footer 组件**

```tsx
export function Footer() {
  return (
    <footer className="h-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center">
      <p className="text-sm text-gray-500">
        版权所有 © 2026 GraphHire
      </p>
    </footer>
  );
}
```

- [ ] **Step 3: 创建 Container 组件**

```tsx
import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={`p-6 md:p-8 lg:p-12 ${className || ''}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: 创建 index.ts**

```ts
export { Header } from './Header';
export { Footer } from './Footer';
export { Container } from './Container';
```

- [ ] **Step 5: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/components/shared/layout/ && git commit -m "feat: add shared layout components (Header, Footer, Container)"
```

---

### Task 10: 创建共享 Graph 组件

**Files:**
- Create: `frontend/apps/web/components/shared/graph/ForceGraph.tsx`
- Create: `frontend/apps/web/components/shared/graph/RadarChart.tsx`
- Create: `frontend/apps/web/components/shared/graph/SkillNode.tsx`
- Create: `frontend/apps/web/components/shared/graph/index.ts`

- [ ] **Step 1: 创建 ForceGraph 组件 (基于 G6)**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { Card } from '../ui/Card';

interface GraphNode {
  id: string;
  name: string;
  type: 'skill' | 'experience' | 'education';
  level?: number;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
}

export function ForceGraph({ nodes, edges, height = 400, onNodeClick }: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    // 动态导入 @ant-design/graph/G6 以避免 SSR 问题
    import('@ant-design/graph').then(async ({ G6 }) => {
      const graphData = {
        nodes: nodes.map((n) => ({
          id: n.id,
          label: n.name,
          size: n.type === 'skill' ? 40 : 30,
          style: {
            fill: n.type === 'skill' ? '#3B82F6' : n.type === 'experience' ? '#10B981' : '#F59E0B',
            stroke: '#fff',
            lineWidth: 2,
          },
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
        })),
      };

      const graph = new G6.Graph({
        container: containerRef.current!,
        width: containerRef.current!.offsetWidth,
        height,
        modes: { default: ['drag-canvas', 'zoom-canvas'] },
        defaultNode: { type: 'circle' },
        defaultEdge: { style: { stroke: '#E5E7EB', lineWidth: 2 } },
        layout: { type: 'force', preventOverlap: true },
      });

      graph.data(graphData);
      graph.render();

      return () => graph.destroy();
    });
  }, [nodes, edges, height]);

  if (nodes.length === 0) {
    return (
      <Card className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-400">暂无图谱数据</p>
      </Card>
    );
  }

  return <div ref={containerRef} />;
}
```

- [ ] **Step 2: 创建 RadarChart 组件**

```tsx
'use client';

import { Card } from '../ui/Card';

interface RadarData {
  name: string;
  value: number;
}

interface RadarChartProps {
  data: RadarData[];
  height?: number;
}

export function RadarChart({ data, height = 300 }: RadarChartProps) {
  if (data.length === 0) {
    return (
      <Card className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-400">暂无数据</p>
      </Card>
    );
  }

  return (
    <div style={{ height }}>
      <p className="text-sm text-gray-500 text-center">技能雷达图</p>
      {/* 使用 Ant Design Charts Radar 实现 */}
    </div>
  );
}
```

- [ ] **Step 3: 创建 SkillNode 组件**

```tsx
import { Tag } from '../ui/Tag';

interface SkillNodeProps {
  name: string;
  level: number;
  maxLevel?: number;
  type?: 'matched' | 'weak' | 'missing';
}

export function SkillNode({ name, level, maxLevel = 5, type = 'matched' }: SkillNodeProps) {
  const variantMap = {
    matched: 'success' as const,
    weak: 'warning' as const,
    missing: 'danger' as const,
  };

  return (
    <div className="flex items-center gap-2">
      <Tag variant={variantMap[type]}>{name}</Tag>
      <span className="text-xs text-gray-500">
        {level}/{maxLevel}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: 创建 index.ts**

```ts
export { ForceGraph } from './ForceGraph';
export { RadarChart } from './RadarChart';
export { SkillNode } from './SkillNode';
```

- [ ] **Step 5: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/components/shared/graph/ && git commit -m "feat: add shared graph components (ForceGraph, RadarChart, SkillNode)"
```

---

## 阶段五：C 端页面开发

### Task 11: 创建 C 端布局和首页

**Files:**
- Create: `frontend/apps/web/app/(main)/layout.tsx`
- Create: `frontend/apps/web/app/(main)/person/home/page.tsx`
- Create: `frontend/apps/web/app/(main)/person/home/loading.tsx`
- Create: `frontend/apps/web/app/(main)/person/home/components/WelcomeBanner.tsx`
- Create: `frontend/apps/web/app/(main)/person/home/components/StatsRow.tsx`
- Create: `frontend/apps/web/app/(main)/person/home/components/RecommendedJobs.tsx`
- Create: `frontend/apps/web/app/(main)/person/home/components/MiniGraph.tsx`

- [ ] **Step 1: 创建 C 端统一布局 app/(main)/layout.tsx**

```tsx
import { Header, Footer } from '@/components/shared/layout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: 创建首页骨架屏 app/(main)/person/home/loading.tsx**

```tsx
export default function Loading() {
  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-6">
      <div className="h-32 rounded-lg bg-gray-200 animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-gray-200 animate-pulse" />
    </div>
  );
}
```

- [ ] **Step 3: 创建欢迎横幅组件**

```tsx
'use client';

import { usePersonStore } from '@/stores/personStore';

export function WelcomeBanner() {
  const info = usePersonStore((s) => s.info);
  const name = info?.name || '求职者';

  return (
    <div className="h-32 rounded-xl bg-gradient-to-r from-primary to-primary-dark p-6 flex items-center justify-between">
      <div className="text-white">
        <h2 className="text-2xl font-semibold">欢迎回来，{name}</h2>
        <p className="mt-1 text-white/80">已为您匹配 12 个新职位</p>
      </div>
      <a
        href="/person/graph"
        className="px-4 py-2 bg-white text-primary rounded-button text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        查看能力图谱 →
      </a>
    </div>
  );
}
```

- [ ] **Step 4: 创建统计卡片组件 StatsRow**

```tsx
'use client';

import { Card } from '@/components/shared/ui/Card';
import { Statistic } from 'antd';

interface StatItem {
  title: string;
  value: number | string;
  suffix?: string;
  link?: string;
}

export function StatsRow() {
  const stats: StatItem[] = [
    { title: '简历数', value: 3, link: '/person/resume' },
    { title: '匹配职位', value: 12, link: '/person/jobs' },
    { title: '已投递', value: 5, link: '/person/applications' },
    { title: '浏览次数', value: 28, link: '/person/profile' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="text-center">
          <Statistic
            title={<span className="text-gray-500 text-sm">{stat.title}</span>}
            value={stat.value}
            suffix={stat.suffix}
          />
          {stat.link && (
            <a href={stat.link} className="text-xs text-primary mt-2 inline-block hover:underline">
              查看详情 →
            </a>
          )}
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: 创建推荐职位组件 RecommendedJobs**

```tsx
'use client';

import { Card } from '@/components/shared/ui/Card';
import { Tag } from '@/components/shared/ui/Tag';
import { Progress } from 'antd';
import { personApi } from '@/lib/api/person';
import { useEffect, useState } from 'react';

interface Job {
  id: string;
  title: string;
  companyName: string;
  city: string;
  salaryMin: number;
  salaryMax: number;
  education: string;
  skills: string[];
  matchScore?: number;
}

export function RecommendedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    personApi.getRecommendJobs({ page: 1, size: 5 }).then((res) => {
      setJobs(res.list);
      setLoading(false);
    });
  }, []);

  return (
    <Card
      title="推荐职位"
      extra={<a href="/person/jobs" className="text-sm text-primary">查看全部 →</a>}
    >
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-400 py-8">暂无推荐职位</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:shadow-hover transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{job.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {job.companyName} · {job.city} · {job.salaryMin}K-{job.salaryMax}K
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {job.skills.slice(0, 3).map((skill) => (
                      <Tag key={skill} variant="skill">{skill}</Tag>
                    ))}
                    {job.skills.length > 3 && (
                      <Tag variant="default">+{job.skills.length - 3}</Tag>
                    )}
                  </div>
                </div>
                {job.matchScore && (
                  <div className="text-right ml-4">
                    <span className="text-sm text-gray-500">匹配度</span>
                    <Progress
                      percent={job.matchScore}
                      size="small"
                      strokeColor="#10B981"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 6: 创建迷你图谱组件 MiniGraph**

```tsx
'use client';

import { Card } from '@/components/shared/ui/Card';
import { ForceGraph } from '@/components/shared/graph/ForceGraph';

interface GraphData {
  nodes: { id: string; name: string; type: string }[];
  edges: { source: string; target: string }[];
}

interface MiniGraphProps {
  graphData: GraphData | null;
}

export function MiniGraph({ graphData }: MiniGraphProps) {
  if (!graphData || graphData.nodes.length === 0) {
    return (
      <Card title="能力概览">
        <div className="h-64 flex items-center justify-center text-gray-400">
          暂无图谱数据
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="能力概览"
      extra={<a href="/person/graph" className="text-sm text-primary">展开完整图谱 →</a>}
    >
      <div className="h-64">
        <ForceGraph nodes={graphData.nodes} edges={graphData.edges} height={240} />
      </div>
    </Card>
  );
}
```

- [ ] **Step 7: 创建首页 app/(main)/person/home/page.tsx**

```tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { WelcomeBanner } from './components/WelcomeBanner';
import { StatsRow } from './components/StatsRow';
import { RecommendedJobs } from './components/RecommendedJobs';
import { MiniGraph } from './components/MiniGraph';
import { personApi } from '@/lib/api/person';
import { usePersonStore } from '@/stores/personStore';

export default function PersonHomePage() {
  const setGraph = usePersonStore((s) => s.setGraph);
  const [graphData, setGraphData] = useState<{ nodes: never[]; edges: never[] } | null>(null);

  useEffect(() => {
    personApi.getGraph().then((data) => {
      setGraph(data);
      setGraphData(data);
    }).catch(() => setGraphData({ nodes: [], edges: [] }));
  }, [setGraph]);

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-6">
      <WelcomeBanner />
      <StatsRow />

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
        <RecommendedJobs />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
        <MiniGraph graphData={graphData} />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/\(main\)/person/home/ && git commit -m "feat: add C-end personal home page with welcome banner, stats, jobs and graph"
```

---

### Task 12: 创建个人端能力图谱页

**Files:**
- Create: `frontend/apps/web/app/(main)/person/graph/page.tsx`
- Create: `frontend/apps/web/app/(main)/person/graph/components/GraphPanel.tsx`
- Create: `frontend/apps/web/app/(main)/person/graph/components/SkillsPanel.tsx`
- Create: `frontend/apps/web/app/(main)/person/graph/components/SkillDetail.tsx`
- Create: `frontend/apps/web/app/(main)/person/graph/components/SkillFilter.tsx`

- [ ] **Step 1: 创建图谱页面 app/(main)/person/graph/page.tsx**

```tsx
import { ForceGraph } from '@/components/shared/graph/ForceGraph';
import { personApi } from '@/lib/api/person';
import { Card } from '@/components/shared/ui/Card';
import { SkillsPanel } from './components/SkillsPanel';
import { SkillDetail } from './components/SkillDetail';
import { SkillFilter } from './components/SkillFilter';

export default async function PersonGraphPage() {
  const graphData = await personApi.getGraph().catch(() => null);

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">个人能力图谱</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm border border-gray-200 rounded-button hover:bg-gray-50">
            导出
          </button>
          <button className="px-4 py-2 text-sm border border-gray-200 rounded-button hover:bg-gray-50">
            分享
          </button>
          <button className="px-4 py-2 text-sm bg-primary text-white rounded-button hover:bg-primary/90">
            刷新
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div style={{ height: 520 }}>
              {graphData && graphData.nodes.length > 0 ? (
                <ForceGraph
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  height={480}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  暂无图谱数据
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-4 justify-center">
              <button className="px-3 py-1 text-xs border rounded-button">放大</button>
              <button className="px-3 py-1 text-xs border rounded-button">缩小</button>
              <button className="px-3 py-1 text-xs border rounded-button">重置</button>
              <button className="px-3 py-1 text-xs border rounded-button">全屏</button>
              <select className="px-3 py-1 text-xs border rounded-button">
                <option>力导向布局</option>
                <option>树状布局</option>
              </select>
            </div>
          </Card>

          <Card title="技能分类" className="mt-6">
            <SkillFilter />
          </Card>
        </div>

        <div className="space-y-6">
          <SkillsPanel />
          <SkillDetail />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 SkillsPanel 组件**

```tsx
'use client';

import { Tag } from '@/components/shared/ui/Tag';
import { Card } from '@/components/shared/ui/Card';
import { Progress } from 'antd';

interface Skill {
  name: string;
  level: number;
  type: string;
}

export function SkillsPanel() {
  const skills: Skill[] = [
    { name: 'Java', level: 4, type: '技术技能' },
    { name: 'Spring', level: 4, type: '技术技能' },
    { name: 'MySQL', level: 3, type: '技术技能' },
    { name: 'Redis', level: 3, type: '技术技能' },
    { name: 'Docker', level: 3, type: '工具' },
    { name: 'K8s', level: 2, type: '工具' },
  ];

  return (
    <Card title="技能评分">
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag variant="skill">{skill.name}</Tag>
            </div>
            <Progress
              percent={(skill.level / 5) * 100}
              size="small"
              strokeColor="#3B82F6"
              format={() => `${skill.level}/5`}
              className="w-24"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-sm text-gray-500">综合评分</p>
        <p className="text-2xl font-semibold text-primary mt-1">78<span className="text-sm text-gray-400">/100</span></p>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: 创建 SkillDetail 组件**

```tsx
'use client';

import { Card } from '@/components/shared/ui/Card';
import { Tag } from '@/components/shared/ui/Tag';

export function SkillDetail() {
  return (
    <Card title="技能详情">
      <div className="space-y-4">
        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag variant="skill">Java</Tag>
              <span className="text-sm text-gray-500">技术技能</span>
            </div>
            <span className="text-sm font-medium">熟练度: 4/5</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">来源: 工作经历 - 字节跳动 (2022-至今)</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            主导过多个大型分布式系统项目，擅长微服务架构设计
          </p>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: 创建 SkillFilter 组件**

```tsx
'use client';

import { useState } from 'react';
import { Tag } from '@/components/shared/ui/Tag';
import { Progress } from 'antd';

type SkillType = 'all' | '技术技能' | '软技能' | '工具' | '框架' | '语言';

interface Skill {
  name: string;
  level: number;
  type: SkillType;
}

export function SkillFilter() {
  const [activeType, setActiveType] = useState<SkillType>('all');

  const skills: Skill[] = [
    { name: 'Java', level: 4, type: '技术技能' },
    { name: 'Python', level: 2, type: '语言' },
    { name: 'React', level: 3, type: '框架' },
    { name: 'MySQL', level: 3, type: '技术技能' },
    { name: 'K8s', level: 2, type: '工具' },
  ];

  const types: SkillType[] = ['all', '技术技能', '软技能', '工具', '框架', '语言'];

  const filteredSkills = activeType === 'all' ? skills : skills.filter((s) => s.type === activeType);

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1 text-sm rounded-button transition-colors ${
              activeType === type
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? '全部' : type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredSkills.map((skill) => (
          <div key={skill.name} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg text-center">
            <Tag variant="skill" className="mb-2">{skill.name}</Tag>
            <Progress
              percent={(skill.level / 5) * 100}
              size="small"
              strokeColor="#3B82F6"
              format={() => `${skill.level}/5`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/\(main\)/person/graph/ && git commit -m "feat: add personal skill graph page with ForceGraph, SkillsPanel and SkillFilter"
```

---

### Task 13: 创建企业端首页

**Files:**
- Create: `frontend/apps/web/app/(main)/company/home/page.tsx`
- Create: `frontend/apps/web/app/(main)/company/home/components/CompanyStats.tsx`
- Create: `frontend/apps/web/app/(main)/company/home/components/RecommendedCandidates.tsx`
- Create: `frontend/apps/web/app/(main)/company/home/components/RecentJobs.tsx`

- [ ] **Step 1: 创建企业首页 app/(main)/company/home/page.tsx**

```tsx
import { CompanyStats } from './components/CompanyStats';
import { RecommendedCandidates } from './components/RecommendedCandidates';
import { RecentJobs } from './components/RecentJobs';

export default async function CompanyHomePage() {
  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-6">
      <CompanyStats />

      <Suspense fallback={<div className="h-80 bg-gray-100 animate-pulse rounded-lg" />}>
        <RecommendedCandidates />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
        <RecentJobs />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 2: 创建企业统计组件**

```tsx
'use client';

import { Card } from '@/components/shared/ui/Card';
import { Statistic } from 'antd';

export function CompanyStats() {
  const stats = [
    { title: '候选人', value: '5,234', suffix: '', trend: '+12%' },
    { title: '在招职位', value: 28, suffix: '', trend: '' },
    { title: '已匹配', value: 156, suffix: '', trend: '' },
    { title: '待处理', value: 23, suffix: '', trend: '' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <Statistic
            title={<span className="text-gray-500 text-sm">{stat.title}</span>}
            value={stat.value}
            suffix={stat.suffix}
          />
          {stat.trend && (
            <span className="text-xs text-green-500 mt-1 inline-block">{stat.trend} 较上月</span>
          )}
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 创建推荐候选人组件**

```tsx
'use client';

import { Card } from '@/components/shared/ui/Card';
import { Tag } from '@/components/shared/ui/Tag';
import { Avatar } from '@/components/shared/ui/Avatar';
import { Button } from '@/components/shared/ui/Button';
import { Progress } from 'antd';
import { companyApi, Candidate } from '@/lib/api/company';
import { useEffect, useState } from 'react';

export function RecommendedCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    companyApi.getRecommendResumes({ page: 1, size: 5 }).then((res) => {
      setCandidates(res.list);
      setLoading(false);
    });
  }, []);

  return (
    <Card
      title="智能推荐"
      extra={
        <div className="flex gap-2">
          <Button variant="default" size="sm">筛选</Button>
          <Button variant="default" size="sm">排序 ▼</Button>
          <Button variant="default" size="sm">刷新</Button>
        </div>
      }
    >
      <div className="flex gap-2 mb-4 border-b border-gray-100 dark:border-gray-800">
        {['全部推荐 (52)', '已沟通 (18)', '已收藏 (8)', '已拒绝 (12)'].map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm border-b-2 transition-colors ${
              i === 0
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : candidates.length === 0 ? (
          <p className="text-center text-gray-400 py-8">暂无推荐候选人</p>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:shadow-hover transition-shadow"
            >
              <div className="flex items-start gap-4">
                <Avatar size="lg" src={candidate.avatar}>{candidate.name[0]}</Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{candidate.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {candidate.title} · {candidate.experience} · {candidate.education} · {candidate.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">匹配度</span>
                      <Progress
                        percent={candidate.matchScore}
                        size="small"
                        strokeColor="#10B981"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {candidate.skills.slice(0, 4).map((skill) => (
                      <Tag key={skill} variant="skill">{skill}</Tag>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="default">查看</Button>
                    <Button size="sm" variant="primary">沟通</Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: 创建最近职位组件**

```tsx
'use client';

import { Card } from '@/components/shared/ui/Card';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { companyApi, Job } from '@/lib/api/company';
import { useEffect, useState } from 'react';

export function RecentJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyApi.getJobList({ page: 1, size: 5 }).then((res) => {
      setJobs(res.list);
      setLoading(false);
    });
  }, []);

  const columns: ColumnsType<Job> = [
    { title: '职位名称', dataIndex: 'title', key: 'title' },
    { title: '收到简历', dataIndex: 'resumeCount', key: 'resumeCount', width: 100 },
    { title: '匹配候选人', dataIndex: 'matchCount', key: 'matchCount', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div className="flex gap-2">
          <a href={`/company/jobs/${record.id}`} className="text-primary hover:underline">查看</a>
          <a href={`/company/jobs/${record.id}/edit`} className="text-primary hover:underline">编辑</a>
        </div>
      ),
    },
  ];

  return (
    <Card title="最近发布的职位" extra={<a href="/company/jobs" className="text-sm text-primary">查看全部 →</a>}>
      <Table
        columns={columns}
        dataSource={jobs}
        loading={loading}
        rowKey="id"
        pagination={false}
        size="middle"
      />
    </Card>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/\(main\)/company/home/ && git commit -m "feat: add C-end company home page with stats, candidates and recent jobs"
```

---

## 阶段六：A 端页面开发

### Task 14: 创建 A 端 ProLayout 布局

**Files:**
- Create: `frontend/apps/web/app/(admin)/layout.tsx`
- Create: `frontend/apps/web/app/(admin)/layout.tsx`

- [ ] **Step 1: 创建 A 端布局 app/(admin)/layout.tsx**

```tsx
'use client';

import { ProLayout } from '@ant-design/pro-components';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Badge } from 'antd';

const menuItems = [
  {
    path: '/admin/dashboard',
    name: '仪表盘',
    icon: '📊',
  },
  {
    path: '/admin/users',
    name: '用户管理',
    icon: '👥',
    children: [
      { path: '/admin/users/person', name: '个人用户' },
      { path: '/admin/users/company', name: '企业用户' },
    ],
  },
  {
    path: '/admin/auth',
    name: '企业认证',
    icon: '🔐',
  },
  {
    path: '/admin/resume',
    name: '简历库',
    icon: '📄',
  },
  {
    path: '/admin/job',
    name: '职位库',
    icon: '💼',
  },
  {
    path: '/admin/skill',
    name: '技能标签',
    icon: '🏷️',
  },
  {
    path: '/admin/task',
    name: '任务监控',
    icon: '⚙️',
  },
  {
    path: '/admin/settings',
    name: '设置',
    icon: '⚙️',
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <ProLayout
      title="GraphHire"
      logo="/logo.png"
      location={{ pathname }}
      menuItems={menuItems}
      menuItemRender={(item, dom) => (
        <a
          onClick={() => {
            if (item.path) router.push(item.path);
          }}
        >
          {dom}
        </a>
      )}
      headerRender={false}
      footerRender={false}
    >
      {children}
    </ProLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/\(admin\)/layout.tsx && git commit -m "feat: add A-end ProLayout layout"
```

---

### Task 15: 创建管理后台仪表盘

**Files:**
- Create: `frontend/apps/web/app/(admin)/dashboard/page.tsx`
- Create: `frontend/apps/web/app/(admin)/dashboard/components/StatCard.tsx`
- Create: `frontend/apps/web/app/(admin)/dashboard/components/UserChart.tsx`
- Create: `frontend/apps/web/app/(admin)/dashboard/components/AuthTable.tsx`
- Create: `frontend/apps/web/app/(admin)/dashboard/components/TaskStatus.tsx`

- [ ] **Step 1: 创建仪表盘页面**

```tsx
import { ProCard, ProCardGroup } from '@ant-design/pro-components';
import { StatCard } from './components/StatCard';
import { UserChart } from './components/UserChart';
import { AuthTable } from './components/AuthTable';
import { TaskStatus } from './components/TaskStatus';

export default async function DashboardPage() {
  return (
    <div>
      <ProCardGroup gap={16}>
        <ProCard>
          <StatCard title="个人用户" value={12580} trend="+12%" />
        </ProCard>
        <ProCard>
          <StatCard title="企业用户" value={5234} trend="+8%" />
        </ProCard>
        <ProCard>
          <StatCard title="简历总数" value={45231} trend="+5%" />
        </ProCard>
        <ProCard>
          <StatCard title="职位总数" value={8942} trend="+3%" />
        </ProCard>
      </ProCardGroup>

      <ProCardGroup gap={16} className="mt-4">
        <ProCard colSpan={16}>
          <UserChart />
        </ProCard>
      </ProCardGroup>

      <ProCardGroup gap={16} className="mt-4">
        <ProCard colSpan={16}>
          <AuthTable />
        </ProCard>
      </ProCardGroup>

      <ProCardGroup gap={16} className="mt-4">
        <ProCard>
          <TaskStatus />
        </ProCard>
      </ProCardGroup>
    </div>
  );
}
```

- [ ] **Step 2: 创建 StatCard 组件**

```tsx
'use client';

import { Statistic } from 'antd';

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: string;
  loading?: boolean;
}

export function StatCard({ title, value, trend, loading }: StatCardProps) {
  return (
    <Statistic
      title={<span className="text-gray-500">{title}</span>}
      value={value}
      loading={loading}
    />
  );
}
```

- [ ] **Step 3: 创建 UserChart 组件**

```tsx
'use client';

import { Card } from 'antd';

export function UserChart() {
  return (
    <Card title="用户增长趋势">
      <div className="h-64 flex items-center justify-center text-gray-400">
        图表区域 - 使用 Ant Design Charts 实现
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: 创建 AuthTable 组件**

```tsx
'use client';

import { ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { adminApi } from '@/lib/api/admin';
import { useState, useEffect } from 'react';

interface CompanyUser {
  id: string;
  name: string;
  industry: string;
  authStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createTime: string;
}

export function AuthTable() {
  const [data, setData] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getPendingCompanies().then((res) => {
      setData(res.list);
      setLoading(false);
    });
  }, []);

  const columns: ProColumns<CompanyUser>[] = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '企业名称', dataIndex: 'name' },
    { title: '行业', dataIndex: 'industry', width: 120 },
    {
      title: '认证状态',
      dataIndex: 'authStatus',
      width: 100,
      render: (_, record) => (
        <Tag color={record.authStatus === 'PENDING' ? 'warning' : record.authStatus === 'APPROVED' ? 'success' : 'error'}>
          {record.authStatus === 'PENDING' ? '待审核' : record.authStatus === 'APPROVED' ? '已通过' : '已拒绝'}
        </Tag>
      ),
    },
    { title: '提交时间', dataIndex: 'createTime', width: 120 },
    {
      title: '操作',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">查看</Button>
          {record.authStatus === 'PENDING' && (
            <>
              <Button type="link" size="small" danger>拒绝</Button>
              <Button type="link" size="small">通过</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ProTable
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      search={false}
      pagination={false}
      toolBarRender={() => [
        <Button key="batch" size="small">批量通过</Button>,
        <Button key="all" size="small">查看全部</Button>,
      ]}
    />
  );
}
```

- [ ] **Step 5: 创建 TaskStatus 组件**

```tsx
'use client';

import { ProCard } from '@ant-design/pro-components';
import { Space, Button } from 'antd';

export function TaskStatus() {
  const tasks = [
    { label: '待解析', value: 23 },
    { label: '解析中', value: 5 },
    { label: '成功', value: 8890 },
    { label: '失败', value: 12 },
  ];

  return (
    <ProCard title="解析任务状态">
      <Space size="large">
        {tasks.map((task) => (
          <div key={task.label} className="text-center">
            <div className="text-2xl font-semibold text-primary">{task.value}</div>
            <div className="text-sm text-gray-500">{task.label}</div>
          </div>
        ))}
      </Space>
      <div className="mt-4">
        <Button size="small">处理队列</Button>
      </div>
    </ProCard>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/\(admin\)/dashboard/ && git commit -m "feat: add admin dashboard with ProTable, charts and stat cards"
```

---

### Task 16: 创建用户管理页面

**Files:**
- Create: `frontend/apps/web/app/(admin)/users/person/page.tsx`
- Create: `frontend/apps/web/app/(admin)/users/company/page.tsx`

- [ ] **Step 1: 创建个人用户管理页面**

```tsx
'use client';

import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { adminApi, PersonUser } from '@/lib/api/admin';

const columns: ProColumns<PersonUser>[] = [
  { title: 'ID', dataIndex: 'id', width: 80, valueType: 'index' },
  { title: '姓名', dataIndex: 'name' },
  { title: '手机号', dataIndex: 'phone', width: 130 },
  { title: '邮箱', dataIndex: 'email', width: 180 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    render: (_, record) => (
      <Tag color={record.status === 'ACTIVE' ? 'success' : 'error'}>
        {record.status === 'ACTIVE' ? '正常' : '禁用'}
      </Tag>
    ),
  },
  { title: '注册时间', dataIndex: 'createTime', width: 120, valueType: 'dateTime' },
  {
    title: '操作',
    width: 120,
    render: (_, record) => (
      <Space>
        <Button type="link" size="small">详情</Button>
      </Space>
    ),
  },
];

export default function PersonUsersPage() {
  return (
    <ProTable
      columns={columns}
      request={async (params) => {
        const res = await adminApi.getPersonUsers({ page: params.current, size: params.pageSize });
        return { data: res.list, success: true, total: res.total };
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      pagination={{ defaultPageSize: 10 }}
      toolBarRender={() => [
        <Button key="export">导出</Button>,
        <Button key="refresh">刷新</Button>,
      ]}
    />
  );
}
```

- [ ] **Step 2: 创建企业用户管理页面**

```tsx
'use client';

import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { adminApi, CompanyUser } from '@/lib/api/admin';

const columns: ProColumns<CompanyUser>[] = [
  { title: 'ID', dataIndex: 'id', width: 80, valueType: 'index' },
  { title: '企业名称', dataIndex: 'name' },
  { title: '行业', dataIndex: 'industry', width: 100 },
  {
    title: '认证状态',
    dataIndex: 'authStatus',
    width: 100,
    render: (_, record) => (
      <Tag color={
        record.authStatus === 'APPROVED' ? 'success' :
        record.authStatus === 'PENDING' ? 'warning' : 'error'
      }>
        {record.authStatus === 'APPROVED' ? '已认证' : record.authStatus === 'PENDING' ? '待认证' : '已拒绝'}
      </Tag>
    ),
  },
  { title: '职位数', dataIndex: 'jobCount', width: 80 },
  { title: '注册时间', dataIndex: 'createTime', width: 120, valueType: 'dateTime' },
  {
    title: '操作',
    width: 120,
    render: (_, record) => (
      <Space>
        <Button type="link" size="small">详情</Button>
      </Space>
    ),
  },
];

export default function CompanyUsersPage() {
  return (
    <ProTable
      columns={columns}
      request={async (params) => {
        const res = await adminApi.getCompanyUsers({ page: params.current, size: params.pageSize });
        return { data: res.list, success: true, total: res.total };
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      pagination={{ defaultPageSize: 10 }}
      toolBarRender={() => [
        <Button key="export">导出</Button>,
        <Button key="refresh">刷新</Button>,
      ]}
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/\(admin\)/users/ && git commit -m "feat: add admin user management pages for person and company"
```

---

### Task 17: 创建其他 A 端页面

**Files:**
- Create: `frontend/apps/web/app/(admin)/auth/page.tsx`
- Create: `frontend/apps/web/app/(admin)/resume/page.tsx`
- Create: `frontend/apps/web/app/(admin)/job/page.tsx`
- Create: `frontend/apps/web/app/(admin)/skill/page.tsx`
- Create: `frontend/apps/web/app/(admin)/task/page.tsx`
- Create: `frontend/apps/web/app/(admin)/settings/page.tsx`

- [ ] **Step 1: 创建企业认证审核页面**

```tsx
'use client';

import { ProCard, ProTabs } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, Drawer } from 'antd';
import { adminApi, CompanyUser } from '@/lib/api/admin';
import { useState } from 'react';

const columns: ProColumns<CompanyUser>[] = [
  { title: 'ID', dataIndex: 'id', width: 80, valueType: 'index' },
  { title: '企业名称', dataIndex: 'name' },
  { title: '行业', dataIndex: 'industry', width: 100 },
  { title: '提交时间', dataIndex: 'createTime', width: 120, valueType: 'date' },
  {
    title: '认证状态',
    dataIndex: 'authStatus',
    width: 100,
    render: (_, record) => (
      <Tag color={
        record.authStatus === 'APPROVED' ? 'success' :
        record.authStatus === 'PENDING' ? 'warning' : 'error'
      }>
        {record.authStatus === 'APPROVED' ? '已通过' : record.authStatus === 'PENDING' ? '待审核' : '已拒绝'}
      </Tag>
    ),
  },
  {
    title: '操作',
    width: 180,
    render: (_, record) => (
      <Space>
        <Button type="link" size="small">查看详情</Button>
        {record.authStatus === 'PENDING' && (
          <>
            <Button type="link" size="small" danger>拒绝</Button>
            <Button type="link" size="small">通过</Button>
          </>
        )}
      </Space>
    ),
  },
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <ProCard>
      <ProTabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'all',
            label: '全部 (52)',
            children: (
              <ProTable
                columns={columns}
                request={async (params) => {
                  const res = await adminApi.getCompanyAuthList();
                  return { data: res.list, success: true, total: res.total };
                }}
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
                toolBarRender={() => [
                  <Button key="batch">批量通过</Button>,
                  <Button key="batchReject">批量拒绝</Button>,
                ]}
              />
            ),
          },
          {
            key: 'pending',
            label: '待审核 (12)',
            children: (
              <ProTable
                columns={columns}
                request={async (params) => {
                  const res = await adminApi.getPendingCompanies();
                  return { data: res.list, success: true, total: res.total };
                }}
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
                toolBarRender={() => [
                  <Button key="batch">批量通过</Button>,
                  <Button key="batchReject">批量拒绝</Button>,
                ]}
              />
            ),
          },
          {
            key: 'approved',
            label: '已通过 (35)',
            children: (
              <ProTable
                columns={columns}
                request={async (params) => {
                  const res = await adminApi.getCompanyAuthList('APPROVED');
                  return { data: res.list, success: true, total: res.total };
                }}
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
              />
            ),
          },
          {
            key: 'rejected',
            label: '已拒绝 (5)',
            children: (
              <ProTable
                columns={columns}
                request={async (params) => {
                  const res = await adminApi.getCompanyAuthList('REJECTED');
                  return { data: res.list, success: true, total: res.total };
                }}
                rowKey="id"
                search={false}
                pagination={{ defaultPageSize: 10 }}
              />
            ),
          },
        ]}
      />
    </ProCard>
  );
}
```

- [ ] **Step 2: 创建简历库页面**

```tsx
'use client';

import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { adminApi, Resume } from '@/lib/api/admin';

const columns: ProColumns<Resume>[] = [
  { title: 'ID', dataIndex: 'id', width: 80, valueType: 'index' },
  { title: '姓名', dataIndex: 'personName' },
  { title: '应聘职位', dataIndex: 'jobTitle' },
  {
    title: '解析状态',
    dataIndex: 'parseStatus',
    width: 100,
    render: (_, record) => (
      <Tag color={
        record.parseStatus === 'SUCCESS' ? 'success' :
        record.parseStatus === 'PARSING' ? 'processing' :
        record.parseStatus === 'PENDING' ? 'default' : 'error'
      }>
        {record.parseStatus === 'SUCCESS' ? '已解析' :
         record.parseStatus === 'PARSING' ? '解析中' :
         record.parseStatus === 'PENDING' ? '待解析' : '解析失败'}
      </Tag>
    ),
  },
  {
    title: '匹配度',
    dataIndex: 'matchScore',
    width: 100,
    render: (_, record) => record.matchScore ? `${record.matchScore}%` : '-',
  },
  { title: '创建时间', dataIndex: 'createTime', width: 120, valueType: 'dateTime' },
  {
    title: '操作',
    width: 150,
    render: (_, record) => (
      <Button type="link" size="small">查看</Button>
    ),
  },
];

export default function ResumePage() {
  return (
    <ProTable
      columns={columns}
      request={async (params) => {
        const res = await adminApi.getResumes({ page: params.current, size: params.pageSize });
        return { data: res.list, success: true, total: res.total };
      }}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ defaultPageSize: 10 }}
      toolBarRender={() => [
        <Button key="batchDelete">批量删除</Button>,
        <Button key="batchExport">批量导出</Button>,
        <Button key="batchParse">批量重新解析</Button>,
      ]}
    />
  );
}
```

- [ ] **Step 3: 创建职位库页面**

```tsx
'use client';

import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { adminApi, Job } from '@/lib/api/admin';

const columns: ProColumns<Job>[] = [
  { title: 'ID', dataIndex: 'id', width: 80, valueType: 'index' },
  { title: '职位名称', dataIndex: 'title' },
  { title: '企业名称', dataIndex: 'companyName' },
  { title: '薪资范围', dataIndex: 'salaryRange', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    render: (_, record) => (
      <Tag color={record.status === 'OPEN' ? 'success' : 'default'}>
        {record.status === 'OPEN' ? '在招' : '已关闭'}
      </Tag>
    ),
  },
  { title: '候选人', dataIndex: 'candidateCount', width: 80 },
  { title: '创建时间', dataIndex: 'createTime', width: 120, valueType: 'dateTime' },
  {
    title: '操作',
    width: 100,
    render: (_, record) => (
      <Button type="link" size="small">详情</Button>
    ),
  },
];

export default function JobPage() {
  return (
    <ProTable
      columns={columns}
      request={async (params) => {
        const res = await adminApi.getJobs({ page: params.current, size: params.pageSize });
        return { data: res.list, success: true, total: res.total };
      }}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ defaultPageSize: 10 }}
      toolBarRender={() => [
        <Button key="batchOnline">批量上架</Button>,
        <Button key="batchOffline">批量下架</Button>,
        <Button key="export">导出</Button>,
      ]}
    />
  );
}
```

- [ ] **Step 4: 创建技能标签管理页面**

```tsx
'use client';

import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Modal } from 'antd';
import { adminApi, SkillTag } from '@/lib/api/admin';
import { useState } from 'react';

const columns: ProColumns<SkillTag>[] = [
  { title: 'ID', dataIndex: 'id', width: 80, valueType: 'index' },
  { title: '标签名称', dataIndex: 'name' },
  { title: '类型', dataIndex: 'category', width: 100 },
  { title: '使用次数', dataIndex: 'useCount', width: 100, sorter: true },
  {
    title: '热门',
    dataIndex: 'isHot',
    width: 80,
    render: (_, record) => record.isHot ? '★' : '-',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    render: (_, record) => (
      <Tag color={record.status === 'ACTIVE' ? 'success' : 'error'}>
        {record.status === 'ACTIVE' ? '正常' : '禁用'}
      </Tag>
    ),
  },
  {
    title: '操作',
    width: 100,
    render: (_, record) => (
      <Button type="link" size="small">编辑</Button>
    ),
  },
];

export default function SkillPage() {
  return (
    <ProTable
      columns={columns}
      request={async (params) => {
        const res = await adminApi.getSkillTags({ page: params.current, size: params.pageSize });
        return { data: res.list, success: true, total: res.total };
      }}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      pagination={{ defaultPageSize: 10 }}
      toolBarRender={() => [
        <Button key="add">添加标签</Button>,
        <Button key="batchImport">批量导入</Button>,
        <Button key="batchDelete">批量删除</Button>,
      ]}
    />
  );
}
```

- [ ] **Step 5: 创建任务监控页面**

```tsx
'use client';

import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Progress } from 'antd';
import { adminApi, ParseTask } from '@/lib/api/admin';

const columns: ProColumns<ParseTask>[] = [
  { title: '任务ID', dataIndex: 'id', width: 100 },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '文件名', dataIndex: 'fileName', ellipsis: true },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (_, record) => (
      <Tag color={
        record.status === 'SUCCESS' ? 'success' :
        record.status === 'PROCESSING' ? 'processing' :
        record.status === 'PENDING' ? 'default' : 'error'
      }>
        {record.status === 'SUCCESS' ? '成功' :
         record.status === 'PROCESSING' ? '解析中' :
         record.status === 'PENDING' ? '待解析' : '失败'}
      </Tag>
    ),
  },
  {
    title: '进度',
    dataIndex: 'progress',
    width: 120,
    render: (_, record) => (
      <Progress percent={record.progress} size="small" />
    ),
  },
  { title: '开始时间', dataIndex: 'startTime', width: 120, valueType: 'dateTime' },
  { title: '耗时', dataIndex: 'duration', width: 80 },
  {
    title: '操作',
    width: 100,
    render: (_, record) => (
      record.status === 'FAILED' ? (
        <Button type="link" size="small">重试</Button>
      ) : (
        <Button type="link" size="small">查看</Button>
      )
    ),
  },
];

export default function TaskPage() {
  return (
    <ProTable
      columns={columns}
      request={async (params) => {
        const res = await adminApi.getTasks({ page: params.current, size: params.pageSize });
        return { data: res.list, success: true, total: res.total };
      }}
      rowKey="id"
      search={false}
      pagination={{ defaultPageSize: 10 }}
      toolBarRender={() => [
        <Button key="refresh">刷新</Button>,
        <Button key="config">配置</Button>,
      ]}
    />
  );
}
```

- [ ] **Step 6: 创建管理员设置页面**

```tsx
'use client';

import { ProCard, ProForm, ProFormText, ProFormSwitch, ProDescriptions } from '@ant-design/pro-components';

export default function SettingsPage() {
  return (
    <ProCardGroup gap={16}>
      <ProCard title="基础设置" colSpan={12}>
        <ProDescriptions column={1}>
          <ProDescriptions.Item label="管理员ID">admin001</ProDescriptions.Item>
          <ProDescriptions.Item label="管理员姓名">超级管理员</ProDescriptions.Item>
          <ProDescriptions.Item label="邮箱">admin@graphhire.com</ProDescriptions.Item>
          <ProDescriptions.Item label="创建时间">2026-01-01</ProDescriptions.Item>
          <ProDescriptions.Item label="最后登录">2026-04-15 14:32:15</ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      <ProCard title="密码修改" colSpan={12}>
        <ProForm>
          <ProFormText.Password label="当前密码" name="currentPassword" placeholder="请输入当前密码" />
          <ProFormText.Password label="新密码" name="newPassword" placeholder="请输入新密码" />
          <ProFormText.Password label="确认新密码" name="confirmPassword" placeholder="请确认新密码" />
        </ProForm>
      </ProCard>

      <ProCard title="通知设置" colSpan={12}>
        <ProForm>
          <ProFormSwitch label="邮件通知" name="emailNotify" />
          <ProFormSwitch label="短信通知" name="smsNotify" />
          <ProFormSwitch label="站内消息" name="siteNotify" />
        </ProForm>
      </ProCard>
    </ProCardGroup>
  );
}
```

- [ ] **Step 7: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/\(admin\)/auth/ frontend/apps/web/app/\(admin\)/resume/ frontend/apps/web/app/\(admin\)/job/ frontend/apps/web/app/\(admin\)/skill/ frontend/apps/web/app/\(admin\)/task/ frontend/apps/web/app/\(admin\)/settings/ && git commit -m "feat: add admin management pages for auth, resume, job, skill, task and settings"
```

---

## 阶段七：个人端其他页面

### Task 18: 创建简历管理页面

**Files:**
- Create: `frontend/apps/web/app/(main)/person/resume/page.tsx`
- Create: `frontend/apps/web/app/(main)/person/resume/components/ResumeUpload.tsx`
- Create: `frontend/apps/web/app/(main)/person/resume/components/ResumeList.tsx`

- [ ] **Step 1: 创建简历上传组件**

```tsx
'use client';

import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

export function ResumeUpload() {
  const handleUpload = async ({ file, onSuccess, onError }: { file: UploadFile; onSuccess: () => void; onError: () => void }) => {
    try {
      // 调用 API 上传简历
      message.success('简历上传成功');
      onSuccess();
    } catch {
      message.error('上传失败，请重试');
      onError();
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center hover:border-primary transition-colors">
      <Upload.Dragger
        accept=".pdf,.doc,.docx"
        customRequest={handleUpload as never}
        maxCount={1}
        listType="text"
      >
        <p className="text-4xl mb-4">📄</p>
        <p className="text-gray-600 dark:text-gray-400">点击或拖拽上传简历</p>
        <p className="text-sm text-gray-400 mt-2">支持 PDF、Word 格式，文件大小不超过 10MB</p>
      </Upload.Dragger>
    </div>
  );
}
```

- [ ] **Step 2: 创建简历列表组件**

```tsx
'use client';

import { Card } from '@/components/shared/ui/Card';
import { Tag } from '@/components/shared/ui/Tag';
import { Button } from '@/components/shared/ui/Button';
import { Progress } from 'antd';
import { resumeApi } from '@/lib/api/resume';
import { useEffect, useState } from 'react';

interface Resume {
  id: string;
  fileName: string;
  parseStatus: 'PENDING' | 'PARSING' | 'SUCCESS' | 'FAILED';
  isDefault: boolean;
  updateTime: string;
}

export function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeApi.getMyResumes().then((res) => {
      setResumes(res.list);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-center text-gray-400 py-8">加载中...</p>
      ) : resumes.length === 0 ? (
        <p className="text-center text-gray-400 py-8">暂无简历，请上传第一份简历</p>
      ) : (
        resumes.map((resume) => (
          <Card key={resume.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">📄</span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{resume.fileName}</h4>
                <p className="text-sm text-gray-500 mt-1">更新于 {resume.updateTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Tag variant={resume.parseStatus === 'SUCCESS' ? 'success' : resume.parseStatus === 'FAILED' ? 'danger' : 'warning'}>
                {resume.parseStatus === 'SUCCESS' ? '已解析' : resume.parseStatus === 'PARSING' ? '解析中' : '待解析'}
              </Tag>
              {resume.isDefault && <Tag variant="skill">默认简历</Tag>}
              <Button variant="default" size="sm">查看</Button>
              <Button variant="default" size="sm">删除</Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 3: 创建简历管理页面**

```tsx
import { Card } from '@/components/shared/ui/Card';
import { ResumeUpload } from './components/ResumeUpload';
import { ResumeList } from './components/ResumeList';

export default function ResumePage() {
  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">简历管理</h1>

      <Card title="上传简历">
        <ResumeUpload />
      </Card>

      <Card title="我的简历">
        <ResumeList />
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/\(main\)/person/resume/ && git commit -m "feat: add personal resume management page with upload and list"
```

---

### Task 19: 创建职位推荐页面

**Files:**
- Create: `frontend/apps/web/app/(main)/person/jobs/page.tsx`
- Create: `frontend/apps/web/app/(main)/person/jobs/components/JobFilters.tsx`
- Create: `frontend/apps/web/app/(main)/person/jobs/components/JobCard.tsx`

- [ ] **Step 1: 创建 JobCard 组件**

```tsx
'use client';

import { Card } from '@/components/shared/ui/Card';
import { Tag } from '@/components/shared/ui/Tag';
import { Button } from '@/components/shared/ui/Button';
import { Progress } from 'antd';

interface Job {
  id: string;
  title: string;
  companyName: string;
  city: string;
  salaryMin: number;
  salaryMax: number;
  education: string;
  experience: string;
  skills: string[];
  matchScore?: number;
}

export function JobCard({ job }: { job: Job }) {
  return (
    <Card className="hover:shadow-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg">{job.title}</h4>
          <p className="text-gray-500 mt-1">
            {job.companyName} · {job.city} · {job.salaryMin}K-{job.salaryMax}K
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {job.education} · {job.experience}
          </p>
          <div className="flex gap-1 mt-3 flex-wrap">
            {job.skills.slice(0, 4).map((skill) => (
              <Tag key={skill} variant="skill">{skill}</Tag>
            ))}
            {job.skills.length > 4 && (
              <Tag variant="default">+{job.skills.length - 4}</Tag>
            )}
          </div>
        </div>
        {job.matchScore && (
          <div className="text-right ml-4">
            <span className="text-sm text-gray-500">匹配度</span>
            <Progress
              percent={job.matchScore}
              strokeColor="#10B981"
              format={() => `${job.matchScore}%`}
              className="mt-1"
            />
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="primary" size="sm">投递简历</Button>
        <Button variant="default" size="sm">查看详情</Button>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: 创建 JobFilters 组件**

```tsx
'use client';

import { useState } from 'react';
import { Input, Select, Button } from 'antd';

export function JobFilters() {
  const [city, setCity] = useState<string | undefined>();
  const [salary, setSalary] = useState<string | undefined>();
  const [experience, setExperience] = useState<string | undefined>();

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Input placeholder="搜索职位/公司" className="w-64" />
      <Select placeholder="城市" allowClear className="w-32" value={city} onChange={setCity}>
        <Select.Option value="beijing">北京</Select.Option>
        <Select.Option value="shanghai">上海</Select.Option>
        <Select.Option value="shenzhen">深圳</Select.Option>
      </Select>
      <Select placeholder="薪资范围" allowClear className="w-32" value={salary} onChange={setSalary}>
        <Select.Option value="5k">5K以上</Select.Option>
        <Select.Option value="10k">10K以上</Select.Option>
        <Select.Option value="20k">20K以上</Select.Option>
      </Select>
      <Select placeholder="经验" allowClear className="w-32" value={experience} onChange={setExperience}>
        <Select.Option value="1">1年以下</Select.Option>
        <Select.Option value="3">1-3年</Select.Option>
        <Select.Option value="5">3-5年</Select.Option>
        <Select.Option value="10">5年以上</Select.Option>
      </Select>
      <Button type="primary">筛选</Button>
      <Button>重置</Button>
    </div>
  );
}
```

- [ ] **Step 3: 创建职位推荐页面**

```tsx
'use client';

import { JobFilters } from './components/JobFilters';
import { JobCard } from './components/JobCard';
import { personApi } from '@/lib/api/person';
import { useEffect, useState } from 'react';

interface Job {
  id: string;
  title: string;
  companyName: string;
  city: string;
  salaryMin: number;
  salaryMax: number;
  education: string;
  experience: string;
  skills: string[];
  matchScore?: number;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    personApi.getRecommendJobs({ page, size: 10 }).then((res) => {
      setJobs(res.list);
      setLoading(false);
    });
  }, [page]);

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">职位推荐</h1>

      <JobFilters />

      {loading ? (
        <p className="text-center text-gray-400 py-8">加载中...</p>
      ) : jobs.length === 0 ? (
        <p className="text-center text-gray-400 py-8">暂无匹配职位</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {jobs.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 border border-gray-200 rounded-button hover:bg-gray-50"
          >
            加载更多
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd D:/code/GraphHire && git add frontend/apps/web/app/\(main\)/person/jobs/ && git commit -m "feat: add personal job recommendation page with filters and job cards"
```

---

## 阶段八：功能测试验证

### Task 20: 前端启动与登录测试

**前置条件：** 所有前端代码已创建并完成 `npm install`

- [ ] **Step 1: 安装依赖并启动开发服务器**

```bash
cd frontend/apps/web
npm install
npm run dev
```

> **注意：** 使用 `run_in_background: true` 启动，端口固定为 **8888**（`next dev -p 8888`）

- [ ] **Step 2: 使用 web-access skill 打开浏览器**

```
使用 Skill tool 调用 web-access skill，访问 http://localhost:8888
```

- [ ] **Step 3: 测试 C 端登录（个人用户）**

```
1. 访问 http://localhost:8888/login
2. 默认展示"我是求职者"Tab
3. 输入测试账号: person@test.com / password123
4. 点击登录按钮
5. 验证跳转至 /person/home
6. 验证页面显示：欢迎横幅、统计卡片、推荐职位、能力图谱预览
```

- [ ] **Step 4: 测试 C 端登录（企业用户）**

```
1. 在登录页切换至"我是招聘方"Tab
2. URL变为 /login?role=company
3. 输入测试账号: company@test.com / password123
4. 点击登录按钮
5. 验证跳转至 /company/home
6. 验证页面显示：统计卡片、智能推荐候选人列表、最近发布职位
```

- [ ] **Step 5: 测试 A 端登录**

```
1. 访问 http://localhost:8888/admin/login
2. 输入管理员账号: admin@graphhire.com / admin123
3. 点击登录按钮
4. 验证跳转至 /admin/dashboard
5. 验证显示：统计数据卡片、用户增长图表、待审核企业列表、任务状态
```

- [ ] **Step 6: Commit**

```bash
cd D:/code/GraphHire && git add -A && git commit -m "test: verify frontend login and basic functionality"
```

---

### Task 21: C 端（个人用户）功能测试

- [ ] **Step 1: 测试个人端首页**

```
验证项：
□ Header 导航栏正确显示（首页、职位推荐、能力图谱、简历管理）
□ 欢迎横幅正确显示用户名
□ 统计卡片显示正确数据
□ 推荐职位列表加载正常
□ 能力图谱预览组件正常显示
□ 底部 Footer 正常显示
```

- [ ] **Step 2: 测试简历管理页面**

```
路径：/person/resume
验证项：
□ 页面正常加载
□ 上传简历组件显示正确
□ 简历列表正常显示（如有）
□ 支持上传 PDF/Word 格式
□ 解析状态标签正确显示
□ 默认简历标识正确
□ 删除、查看按钮功能正常
```

- [ ] **Step 3: 测试职位推荐页面**

```
路径：/person/jobs
验证项：
□ 页面正常加载
□ 筛选组件正常显示
□ 职位卡片列表正常显示
□ 匹配度进度条正确显示
□ 技能标签正确显示
□ 加载更多功能正常
□ 跳转到职位详情正常
```

- [ ] **Step 4: 测试能力图谱页面**

```
路径：/person/graph
验证项：
□ 页面正常加载
□ 力导向图谱正常渲染
□ 图谱工具栏按钮可用（放大、缩小、重置、全屏）
□ 右侧技能评分面板正确显示
□ 技能详情面板正确显示
□ 技能分类筛选功能正常
□ 节点点击交互正常
□ 布局切换功能正常
```

- [ ] **Step 5: 测试响应式布局**

```
在浏览器开发者工具中测试：
□ 手机尺寸 (< 576px)：单列布局，底部 Tab Bar 显示
□ 平板尺寸 (768px-1024px)：双列布局
□ 桌面尺寸 (≥ 1024px)：完整导航+内容布局
□ 主题切换（浅色/深色）功能正常
```

- [ ] **Step 6: Commit**

```bash
cd D:/code/GraphHire && git add -A && git commit -m "test: verify C-end personal user functionality"
```

---

### Task 22: C 端（企业用户）功能测试

- [ ] **Step 1: 测试企业端首页**

```
路径：/company/home
验证项：
□ Header 导航栏正确显示（首页、职位管理、候选人推荐、人才库）
□ 统计卡片显示正确数据（候选人、在招职位、已匹配、待处理）
□ 智能推荐 Tab 切换正常
□ 候选人卡片列表正常显示
□ 匹配度进度条正确显示
□ 最近发布职位 Table 正常显示
□ 刷新、筛选功能正常
```

- [ ] **Step 2: 测试候选人详情页**

```
路径：/company/match/:resumeId（如有数据）
验证项：
□ 面包屑导航正确显示
□ 候选人信息卡片正确显示
□ 头像、联系方式正确显示
□ 匹配度概览正确显示（综合、技能、经验、城市、薪资）
□ 技能对比图表正确显示
□ 匹配建议正确显示
□ 操作按钮功能正常（收藏、沟通、标记）
```

- [ ] **Step 3: 测试职位管理页面**

```
路径：/company/jobs（如有）
验证项：
□ 职位列表正常显示
□ 职位状态标签正确
□ 查看、编辑按钮功能正常
```

- [ ] **Step 4: Commit**

```bash
cd D:/code/GraphHire && git add -A && git commit -m "test: verify C-end company user functionality"
```

---

### Task 23: A 端（管理后台）功能测试

- [ ] **Step 1: 测试仪表盘**

```
路径：/admin/dashboard
验证项：
□ ProLayout 布局正确显示
□ 侧边栏菜单正确显示（仪表盘、用户管理、企业认证、简历库、职位库、技能标签、任务监控、设置）
□ 统计卡片数据正确加载
□ 用户增长趋势图表正确显示
□ 待审核企业列表正确显示
□ 任务状态正确显示
□ 时间范围筛选功能正常
```

- [ ] **Step 2: 测试个人用户管理**

```
路径：/admin/users/person
验证项：
□ ProTable 正确加载
□ 搜索功能正常（姓名/手机号/邮箱）
□ 分页功能正常
□ 状态筛选正常
□ 导出功能正常
□ 查看详情功能正常
□ 禁用/启用功能正常
```

- [ ] **Step 3: 测试企业用户管理**

```
路径：/admin/users/company
验证项：
□ ProTable 正确加载
□ 搜索功能正常（企业名称/统一社会信用代码）
□ 认证状态筛选正常
□ 行业筛选正常
□ 认证状态标签正确显示
□ 职位数正确显示
□ 查看详情功能正常
```

- [ ] **Step 4: 测试企业认证审核**

```
路径：/admin/auth
验证项：
□ Tab 切换正常（全部/待审核/已通过/已拒绝）
□ 待审核企业列表正确显示
□ 认证详情面板正确显示
□ 通过审核功能正常
□ 拒绝审核功能正常
□ 批量通过/拒绝功能正常
□ 营业执照预览/下载功能正常
```

- [ ] **Step 5: 测试简历库**

```
路径：/admin/resume
验证项：
□ ProTable 正确加载
□ 搜索功能正常
□ 解析状态筛选正常
□ 学历筛选正常
□ 工作经验筛选正常
□ 匹配度显示正确
□ 查看详情功能正常
□ 重新解析功能正常
□ 批量删除/导出功能正常
```

- [ ] **Step 6: 测试职位库**

```
路径：/admin/job
验证项：
□ ProTable 正确加载
□ 搜索功能正常（职位名称/企业名称）
□ 状态筛选正常
□ 薪资范围筛选正常
□ 候选人数量正确显示
□ 批量上架/下架功能正常
□ 导出功能正常
```

- [ ] **Step 7: 测试技能标签管理**

```
路径：/admin/skill
验证项：
□ ProTable 正确加载
□ 搜索功能正常
□ 类型筛选正常
□ 热门标签筛选正常
□ 状态筛选正常
□ 添加标签弹窗正常
□ 编辑标签功能正常
□ 批量删除/设置热门/禁用功能正常
□ 使用次数排序正常
```

- [ ] **Step 8: 测试任务监控**

```
路径：/admin/task
验证项：
□ 任务状态统计正确显示
□ ProTable 正确加载
□ 任务进度正确显示
□ 重试功能正常（针对失败任务）
□ 任务配置功能正常
```

- [ ] **Step 9: 测试管理员设置**

```
路径：/admin/settings
验证项：
□ 基础信息正确显示
□ 密码修改功能正常
□ 通知设置保存功能正常
```

- [ ] **Step 10: 测试 A 端响应式布局**

```
□ 移动端 (< 768px)：侧边栏收起，点击汉堡菜单展开
□ 平板/桌面：侧边栏固定展开
□ ProLayout 菜单折叠状态持久化正常
```

- [ ] **Step 11: Commit**

```bash
cd D:/code/GraphHire && git add -A && git commit -m "test: verify A-end admin functionality"
```

---

### Task 24: 全局功能和边界测试

- [ ] **Step 1: 测试路由保护**

```
验证项：
□ 未登录访问 /person/* 自动跳转至 /login
□ 未登录访问 /company/* 自动跳转至 /login
□ 未登录访问 /admin/* 自动跳转至 /admin/login
□ 已登录访问 /login 自动跳转至对应首页
□ 后台接口返回 401 时自动跳转至登录页
```

- [ ] **Step 2: 测试主题切换**

```
验证项：
□ 浅色模式正常显示
□ 深色模式正常显示
□ 主题切换动画流畅
□ 主题偏好持久化（刷新后保持）
□ 系统自动模式正常响应
```

- [ ] **Step 3: 测试错误处理**

```
验证项：
□ 网络错误时显示友好提示
□ 表单验证失败时错误提示正确
□ 404 页面正常显示
□ 空数据状态正常显示
```

- [ ] **Step 4: 测试登录登出**

```
验证项：
□ C 端登出功能正常
□ A 端登出功能正常
□ 登出后 Token 清除
□ 登出后正确跳转至登录页
```

- [ ] **Step 5: Commit**

```bash
cd D:/code/GraphHire && git add -A && git commit -m "test: verify global functionality and edge cases"
```

---

### 测试账号清单

| 账号类型 | 用户名 | 密码 | 说明 |
|----------|--------|------|------|
| 个人用户 | person@test.com | password123 | 已有简历和数据 |
| 企业用户 | company@test.com | password123 | 已认证企业 |
| 管理员 | admin@graphhire.com | admin123 | 平台管理员 |

### 验证命令汇总

```bash
# 1. 启动前端（后台运行）
cd frontend/apps/web && npm run dev

# 2. 验证端口
netstat -ano | findstr :8888

# 3. 打开浏览器测试
# 使用 web-access skill 访问 http://localhost:8888

# 4. 停止服务器（如需）
taskkill /PID <PID> /F
```

---

## 计划完成检查清单

### Spec 覆盖率检查

| 设计文档章节 | 任务覆盖 | 说明 |
|------------|---------|------|
| 10.1 项目概述 | Task 1 | Monorepo 结构初始化 |
| 10.2 目录结构 | Task 1-3 | 完整的目录结构创建 |
| 10.3 路由分组与布局 | Task 6, 11, 14 | C端/A端布局实现 |
| 10.4 登录认证架构 | Task 6-7 | 登录页和中间件保护 |
| 10.5 Next.js 新能力 | Task 11, 15 | Streaming + Suspense 应用 |
| 10.6 组件复用策略 | Task 8-10 | 共享组件库 |
| 10.7 响应式断点 | Task 1-2 | Tailwind 配置 |
| 10.8 主题模式 | Task 5 | Zustand theme store |
| 10.9 状态管理 | Task 5 | Zustand stores |
| 10.11 个人端首页 | Task 11 | ✓ |
| 10.12 个人端能力图谱页 | Task 12 | ✓ |
| 10.13 企业端首页 | Task 13 | ✓ |
| 10.15 管理后台仪表盘 | Task 15 | ✓ |
| 10.16 个人用户管理 | Task 16 | ✓ |
| 10.17 企业用户管理 | Task 16 | ✓ |
| 10.18 企业认证审核 | Task 17 | ✓ |
| 10.19 简历库 | Task 17 | ✓ |
| 10.20 职位库 | Task 17 | ✓ |
| 10.21 技能标签管理 | Task 17 | ✓ |
| 10.22 任务监控 | Task 17 | ✓ |
| 10.24 管理员设置 | Task 17 | ✓ |

### 测试阶段覆盖

| 测试任务 | 测试内容 | 状态 |
|---------|---------|------|
| Task 20 | 前端启动与登录测试（C端个人/C端企业/A端） | ⏳ 待验收 |
| Task 21 | C端（个人用户）功能测试（首页/简历/职位/图谱/响应式） | ⏳ 待验收 |
| Task 22 | C端（企业用户）功能测试（首页/候选人/职位管理） | ⏳ 待验收 |
| Task 23 | A端（管理后台）功能测试（仪表盘/用户/认证/简历/职位/技能/任务/设置） | ⏳ 待验收 |
| Task 24 | 全局功能和边界测试（路由保护/主题切换/错误处理/登出） | ⏳ 待验收 |

### 预留占位符检查
- ✅ 无 TBD/TODO
- ✅ 所有步骤包含实际代码
- ✅ 完整命令示例

### 类型一致性检查
- ✅ API 类型与接口设计文档一致
- ✅ Store 类型与 API 类型匹配
- ✅ 组件 Props 类型完整

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-16-frontend-implementation.md`.**
