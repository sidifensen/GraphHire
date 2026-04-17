# GraphHire 图谱智聘 - 前端架构设计文档

**版本：** v1.0
**日期：** 2026-04-17
**状态：** 待评审

---

## 一、项目概述

### 1.1 项目背景
GraphHire 图谱智聘是一个基于 AI 技能图谱的招聘平台，需要构建完整的前端应用，包含用户端、企业端、管理端三大模块。

### 1.2 技术栈
| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | 16.x (App Router) |
| 样式 | Tailwind CSS | 4.2 |
| 状态管理 | Zustand + React Query | - |
| 图表 | Recharts | - |
| 图谱可视化 | D3.js / React Force Graph | - |
| 表单 | React Hook Form + Zod | - |
| HTTP | Axios + OpenAPI Client | - |
| 国际化 | next-intl | - |

### 1.3 设计系统
沿用原型图中的 Material Design 3 风格定制设计系统：

```css
/* 色彩系统 */
--primary: #004ac6;        /* 主色-蓝 */
--primary-container: #2563eb;
--secondary: #006c49;      /* 辅色-绿 */
--tertiary: #784b00;       /* 警告-橙 */
--error: #ba1a1a;          /* 危险-红 */
--surface: #faf8ff;        /* 背景 */
--surface-container-low: #f2f3ff;
--surface-container: #eaedff;
--surface-container-high: #e2e7ff;
--surface-container-highest: #dae2fd;
--surface-container-lowest: #ffffff;
--on-surface: #131b2e;
--on-surface-variant: #434655;
--outline: #737686;
--outline-variant: #c3c6d7;

/* 字体 */
--font-headline: 'Manrope', sans-serif;
--font-body: 'Inter', sans-serif;

/* 圆角 */
--radius-sm: 0.125rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-2xl: 1.25rem;
--radius-full: 0.75rem;
```

---

## 二、目录结构

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 认证布局组
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (user)/            # 用户端布局组
│   │   │   ├── layout.tsx     # 顶部导航 + 底部Tab（移动端）
│   │   │   ├── home/
│   │   │   │   └── page.tsx
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── skill-graph/
│   │   │   │   └── page.tsx
│   │   │   ├── resume/
│   │   │   │   ├── upload/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── manage/
│   │   │   │       └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── notifications/
│   │   │       └── page.tsx
│   │   ├── (company)/          # 企业端布局组
│   │   │   ├── layout.tsx      # 左侧导航
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── info/
│   │   │   │   └── page.tsx
│   │   │   ├── job/
│   │   │   │   ├── publish/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── jobs/
│   │   │   │   └── page.tsx
│   │   │   ├── recommendations/
│   │   │   │   └── page.tsx
│   │   │   ├── candidate/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── staff/
│   │   │   │   └── page.tsx
│   │   │   └── notifications/
│   │   │       └── page.tsx
│   │   ├── (admin)/            # 管理端布局组
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── company/
│   │   │   │   └── audit/
│   │   │   │       └── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── skills/
│   │   │   │   └── page.tsx
│   │   │   └── tasks/
│   │   │       └── page.tsx
│   │   └── api/                # API 路由（可选，用于 BFF）
│   ├── components/
│   │   ├── ui/                 # 基础 UI 组件（Button, Input, Card...）
│   │   ├── layout/             # 布局组件（NavBar, SideBar, Footer）
│   │   ├── forms/              # 表单组件
│   │   ├── charts/             # 图表组件（RadarChart, SkillGraph）
│   │   └── shared/             # 跨端共享组件
│   ├── hooks/                  # 自定义 Hooks
│   ├── lib/
│   │   ├── api/                # API 客户端配置
│   │   │   ├── client.ts       # Axios 实例
│   │   │   ├── auth.ts         # 认证 API
│   │   │   ├── user.ts         # 用户 API
│   │   │   ├── job.ts          # 职位 API
│   │   │   ├── match.ts        # 匹配 API
│   │   │   └── notification.ts  # 通知 API
│   │   ├── stores/             # Zustand Stores
│   │   └── utils/              # 工具函数
│   ├── types/                  # TypeScript 类型定义
│   └── styles/
│       └── globals.css          # 全局样式 + Tailwind 入口
├── public/
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 三、页面详细规格

### 3.1 用户端页面（优先构建）

#### U01 - 首页 `/home`

**布局结构：**
- 顶部导航栏（固定）：Logo + 导航菜单 + 用户头像
- 主体区域：Hero 搜索区 + 推荐职位 + 热门企业
- 底部 Tab（仅移动端）：首页/职位/消息/我的

**核心组件：**
| 组件 | 说明 |
|------|------|
| TopNavBar | 顶部导航，含 Logo、菜单、通知图标、用户头像 |
| SearchBar | 搜索框 + 热门标签 |
| JobCard | 职位卡片，含公司、薪资、匹配度标签 |
| CompanyGrid | 热门企业网格 |

**API 契约：**
```typescript
// GET /api/jobs/recommended
Request: { userId?: string, limit?: number }
Response: {
  jobs: Job[];
  total: number;
}

// GET /api/companies/popular
Response: {
  companies: Company[];
}
```

---

#### U02 - 登录页 `/login`

**布局结构：**
- 左右分栏（PC）：左侧品牌展示 + 右侧登录表单
- 单栏（移动端）：Logo + 表单

**核心组件：**
| 组件 | 说明 |
|------|------|
| LoginForm | 登录表单（手机号/邮箱 + 密码） |
| SocialLogin | 第三方登录（可选） |
| RememberCheckbox | 记住我复选框 |

**API 契约：**
```typescript
// POST /api/auth/login
Request: { identifier: string; password: string }
Response: {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

---

#### U03 - 注册页 `/register`

**布局结构：** 同登录页，左右分栏

**核心组件：**
| 组件 | 说明 |
|------|------|
| RegisterForm | 注册表单 |
| RoleSelector | 角色选择（求职者/招聘者） |

**API 契约：**
```typescript
// POST /api/auth/register
Request: {
  email: string;
  password: string;
  role: 'JOB_SEEKER' | 'RECRUITER';
  phone?: string;
}
Response: {
  userId: string;
  message: string;
}
```

---

#### U04 - 简历上传 `/resume/upload`

**布局结构：**
- 拖拽上传区
- 上传进度 + 解析状态
- 解析结果预览

**核心组件：**
| 组件 | 说明 |
|------|------|
| DropZone | 拖拽上传区域 |
| UploadProgress | 上传进度条 |
| ParseStatus | AI 解析状态（排队/解析中/完成） |
| ResumePreview | 简历预览卡片 |

**API 契约：**
```typescript
// POST /api/resume/upload
Request: FormData { file: File; userId: string }
Response: {
  resumeId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  parseResult?: ResumeParseResult;
}

// GET /api/resume/{id}/status
Response: {
  status: string;
  parseResult?: ResumeParseResult;
}
```

---

#### U05 - 简历管理 `/resume/manage`

**布局结构：**
- 简历列表（多简历支持）
- 默认简历设置
- 操作（上传新简历、删除、预览）

**核心组件：**
| 组件 | 说明 |
|------|------|
| ResumeList | 简历列表 |
| ResumeCard | 简历卡片（名称、更新时间、默认标签） |
| DefaultBadge | 默认简历标识 |

**API 契约：**
```typescript
// GET /api/resume/user/{userId}
Response: {
  resumes: Resume[];
}

// PUT /api/resume/{id}/default
Request: { isDefault: boolean }

// DELETE /api/resume/{id}
```

---

#### U06 - 个人信息 `/profile`

**布局结构：**
- Tab 切换：基本信息 / 教育经历 / 工作经历 / 求职意向
- 表单编辑模式

**核心组件：**
| 组件 | 说明 |
|------|------|
| ProfileTabs | Tab 切换 |
| BasicInfoForm | 基本信息表单 |
| EducationForm | 教育经历表单 |
| WorkExperienceForm | 工作经历表单 |
| JobIntentionForm | 求职意向表单 |

**API 契约：**
```typescript
// GET /api/user/{id}/profile
Response: {
  user: UserProfile;
}

// PUT /api/user/{id}/profile
Request: UserProfile

// GET /api/user/{id}/education
// POST /api/user/{id}/education
// PUT /api/education/{id}
// DELETE /api/education/{id}

// GET /api/user/{id}/experience
// POST /api/user/{id}/experience
// PUT /api/experience/{id}
// DELETE /api/experience/{id}
```

---

#### U07 - 能力图谱 `/skill-graph` ⭐核心页面

**布局结构：**
- 顶部：页面标题 + 匹配职位按钮
- 左侧（70%）：技能图谱可视化
- 右侧（30%）：技能详情面板

**可视化规格：**
- 中心节点：用户头像
- 一级节点：技能分类（前端、后端、工具等）
- 二级节点：具体技能（React、Java 等）
- 连线：不同颜色表示掌握程度
- 交互：支持拖拽、缩放、点击查看详情

**核心组件：**
| 组件 | 说明 |
|------|------|
| SkillGraphCanvas | 图谱画布（Force Graph） |
| SkillNode | 技能节点 |
| SkillConnection | 节点连线 |
| SkillDetailPanel | 技能详情面板 |
| ProficiencyBar | 精通程度进度条 |

**API 契约：**
```typescript
// GET /api/skill-graph/{userId}
Response: {
  userId: string;
  skills: SkillNode[];
  connections: SkillConnection[];
  categories: SkillCategory[];
}

// GET /api/skill/{skillId}
Response: {
  skill: Skill;
  proficiency: number;
  relatedJobs: number;
  projects: number;
}

// POST /api/skill-graph/analyze
Request: { resumeId: string }
Response: {
  skillGraph: SkillGraph;
}
```

---

#### U08 - 职位列表 `/jobs`

**布局结构：**
- 顶部：筛选条件栏
- 主体：职位卡片网格
- 右侧：筛选面板（PC）

**核心组件：**
| 组件 | 说明 |
|------|------|
| FilterBar | 筛选栏（城市、薪资、经验） |
| JobCardList | 职位卡片列表 |
| JobCard | 职位卡片 |
| Pagination | 分页器 |

**API 契约：**
```typescript
// GET /api/jobs
Query: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  skills?: string[];
}
Response: {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

#### U09 - 匹配详情 `/match/[id]` ⭐核心页面

**布局结构：**
- 顶部：候选人 vs 职位对比栏
- 中部左侧：五维雷达图
- 中部右侧：AI 匹配说明
- 底部：技能对比表 + 操作按钮

**五维雷达图：**
1. 技能匹配度
2. 经验匹配度
3. 薪资匹配度
4. 地点匹配度
5. 学历匹配度

**核心组件：**
| 组件 | 说明 |
|------|------|
| MatchHeader | 对比栏（候选人信息 vs 职位信息） |
| RadarChart | 五维雷达图 |
| MatchReason | AI 匹配原因文字 |
| SkillComparisonTable | 技能对比表格 |
| ActionButtons | 操作按钮（投递/收藏/对比） |

**API 契约：**
```typescript
// GET /api/match/{jobId}/{resumeId}
Response: {
  job: Job;
  resume: Resume;
  matchScore: {
    overall: number;
    skill: number;
    experience: number;
    salary: number;
    location: number;
    education: number;
  };
  matchReasons: string[];
  skillComparison: {
    skill: string;
    required: string;
    actual: string;
    match: boolean;
  }[];
}

// POST /api/match/apply
Request: { jobId: string; resumeId: string }
Response: { applicationId: string; status: string }
```

---

#### U10 - 通知中心 `/notifications`

**布局结构：**
- Tab 分类：全部/职位/系统
- 通知列表
- 批量操作

**核心组件：**
| 组件 | 说明 |
|------|------|
| NotificationTabs | Tab 切换 |
| NotificationList | 通知列表 |
| NotificationItem | 通知项 |
| BatchActions | 批量操作（标记已读/删除） |

**API 契约：**
```typescript
// GET /api/notifications
Query: { userId: string; type?: string; page?: number }
Response: {
  notifications: Notification[];
  unreadCount: number;
}

// PUT /api/notifications/{id}/read
// PUT /api/notifications/read-all
// DELETE /api/notifications/{id}
```

---

## 四、组件库设计

### 4.1 基础 UI 组件

| 组件 | 变体 | 说明 |
|------|------|------|
| Button | primary/secondary/outline/ghost, sm/md/lg | 按钮 |
| Input | default/error/disabled | 输入框 |
| Select | default/open/disabled | 下拉选择 |
| Checkbox | default/checked/disabled | 复选框 |
| Card | elevated/flat/outlined | 卡片 |
| Badge | primary/success/warning/error | 徽章 |
| Avatar | sm/md/lg, circle/square | 头像 |
| ProgressBar | linear/circular | 进度条 |
| Skeleton | text/circle/rect | 骨架屏 |
| Modal | default/confirm/fullscreen | 模态框 |
| Toast | success/error/warning/info | 提示 |
| Tabs | underline/pill | 标签页 |
| Dropdown | default/icon | 下拉菜单 |
| Pagination | default/complete | 分页器 |

### 4.2 业务组件

| 组件 | 端 | 说明 |
|------|------|------|
| TopNavBar | 用户 | 顶部导航 |
| BottomTabBar | 用户（移动） | 底部 Tab |
| SideNavBar | 企业/管理 | 侧边导航 |
| JobCard | 通用 | 职位卡片 |
| ResumeCard | 用户 | 简历卡片 |
| CandidateCard | 企业 | 候选人卡片 |
| RadarChart | 通用 | 五维雷达图 |
| SkillGraph | 用户 | 技能图谱 |
| StatCard | 企业/管理 | 统计卡片 |
| DataTable | 企业/管理 | 数据表格 |
| FilterPanel | 通用 | 筛选面板 |
| SearchBar | 通用 | 搜索栏 |

---

## 五、状态管理

### 5.1 Zustand Stores

```typescript
// authStore - 认证状态
{
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login(credentials): Promise<void>;
  logout(): void;
}

// userStore - 用户状态
{
  profile: UserProfile | null;
  resumes: Resume[];
  skillGraph: SkillGraph | null;
  fetchProfile(): Promise<void>;
  updateProfile(data): Promise<void>;
}

// jobStore - 职位状态
{
  jobs: Job[];
  filters: JobFilters;
  pagination: Pagination;
  fetchJobs(filters): Promise<void>;
  setFilters(filters): void;
}

// notificationStore - 通知状态
{
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications(): Promise<void>;
  markAsRead(id): Promise<void>;
}
```

### 5.2 React Query 配置

```typescript
// API 缓存策略
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 分钟
      gcTime: 30 * 60 * 1000,       // 30 分钟
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// 典型查询配置
{
  '/api/jobs': { staleTime: 2 * 60 * 1000 },
  '/api/user/profile': { staleTime: 10 * 60 * 1000 },
  '/api/notifications': { staleTime: 30 * 1000, refetchInterval: 30 * 1000 },
}
```

---

## 六、API 客户端配置

### 6.1 Axios 实例

```typescript
// src/lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7777',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：添加 Token
apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理 Token 刷新
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 尝试刷新 Token
      const refreshed = await refreshToken();
      if (refreshed) {
        // 重试原请求
        return apiClient.request(error.config);
      }
      // 刷新失败，登出
      authStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

### 6.2 API 契约定义示例

```typescript
// src/types/api.ts

// 通用
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 认证
interface LoginRequest {
  identifier: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// 职位
interface Job {
  id: string;
  title: string;
  company: Company;
  salaryMin: number;
  salaryMax: number;
  city: string;
  skills: string[];
  matchScore?: number;
}

// 技能图谱
interface SkillNode {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  x?: number;
  y?: number;
}

interface SkillConnection {
  source: string;
  target: string;
  strength: number;
}

// 匹配
interface MatchResult {
  job: Job;
  resume: Resume;
  matchScore: {
    overall: number;
    skill: number;
    experience: number;
    salary: number;
    location: number;
    education: number;
  };
  matchReasons: string[];
  skillComparison: SkillComparison[];
}
```

---

## 七、路由与权限

### 7.1 路由守卫

```typescript
// 中间件配置
const publicRoutes = ['/login', '/register', '/home'];
const companyRoutes = ['/company/dashboard', '/company/jobs', ...];
const adminRoutes = ['/admin/dashboard', '/admin/users', ...];

// 路由守卫逻辑
1. 未登录 → 重定向到 /login
2. 已登录访问公开路由 → 重定向到 /home
3. 企业端路由 → 检查用户角色是否为 RECRUITER
4. 管理端路由 → 检查用户角色是否为 ADMIN
```

### 7.2 布局组策略

```
(app)
├── (auth)        # 不需要导航栏的页面（登录/注册）
├── (user)        # 用户端布局（顶部导航）
├── (company)     # 企业端布局（侧边导航）
└── (admin)      # 管理端布局（侧边导航）
```

---

## 八、实施计划

### Phase 1：基础框架 + 首页 + 认证
- [ ] 项目初始化（Next.js 16 + Tailwind 4.2 + TypeScript）
- [ ] 设计系统配置（主题变量、组件基类）
- [ ] 布局组件（NavBar、SideBar）
- [ ] 首页 `/home`
- [ ] 登录页 `/login`
- [ ] 注册页 `/register`
- [ ] 认证 API 集成

### Phase 2：简历模块 + 能力图谱
- [ ] 简历上传页 `/resume/upload`
- [ ] 简历管理页 `/resume/manage`
- [ ] 能力图谱页 `/skill-graph`（含 D3 图谱可视化）
- [ ] 个人信息页 `/profile`
- [ ] 简历相关 API 集成

### Phase 3：职位模块 + 匹配详情
- [ ] 职位列表页 `/jobs`
- [ ] 匹配详情页 `/match/[id]`（含雷达图）
- [ ] 职位相关 API 集成

### Phase 4：通知中心 + 企业端
- [ ] 通知中心 `/notifications`
- [ ] 企业端控制台 `/company/dashboard`
- [ ] 企业信息页 `/company/info`
- [ ] 职位发布页 `/company/job/publish`
- [ ] 职位管理页 `/company/jobs`
- [ ] 推荐简历页 `/company/recommendations`
- [ ] 候选人详情页 `/company/candidate/[id]`
- [ ] 员工管理页 `/company/staff`

### Phase 5：管理端
- [ ] 管理端仪表盘 `/admin/dashboard`
- [ ] 企业审核页 `/admin/company/audit`
- [ ] 用户管理页 `/admin/users`
- [ ] 技能标签页 `/admin/skills`
- [ ] 任务监控页 `/admin/tasks`

---

## 九、关键实现细节

### 9.1 能力图谱可视化

使用 `react-force-graph` 或自研 D3 实现：

```tsx
// SkillGraph 核心逻辑
const handleNodeClick = (node: SkillNode) => {
  setSelectedSkill(node);
};

const handleZoom = (transform: ZoomTransform) => {
  setGraphTransform(transform);
};

// 节点拖拽
const handleDrag = (node: SkillNode, x: number, y: number) => {
  node.x = x;
  node.y = y;
  updateLinks();
};
```

### 9.2 五维雷达图

使用 Recharts `RadarChart`：

```tsx
<RadarChart data={radarData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="dimension" />
  <Radar name="匹配度" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.5} />
</RadarChart>
```

### 9.3 文件上传（简历）

使用 `react-dropzone` + Axios 上传：

```tsx
const handleDrop = async (files: File[]) => {
  const formData = new FormData();
  formData.append('file', files[0]);
  formData.append('userId', userId);

  const response = await apiClient.post('/api/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
    },
  });
};
```

---

## 十、待确认事项

1. **API Base URL**：开发环境 `http://localhost:7777`，生产环境 URL？
2. **JWT 刷新策略**：Token 过期时间？刷新 Token 有效期？
3. **WebSocket**：通知是否需要 WebSocket 实时推送？
4. **图谱库选型**：D3.js vs react-force-graph vs 其他？
5. **Mock 数据**：API 完成前是否需要 Mock 数据进行开发？
