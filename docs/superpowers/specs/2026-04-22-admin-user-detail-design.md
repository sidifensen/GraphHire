# 管理端用户详情展示设计方案

## 1. 概述

### 1.1 需求背景
管理端用户管理需要展示用户角色类型，并在用户列表右侧添加"详情"按钮，点击后展示对应用户的 `personinfo` 表信息。

### 1.2 现状分析
- **用户列表页**：`/frontend/src/app/admin/users/page.tsx`
  - 已有角色类型展示（PERSON/COMPANY/ADMIN 三种 badge）
  - 操作列有"解锁/启用/禁用"、"重置密码"按钮
  - **缺少"详情"按钮**
- **PersonInfo 实体**：包含 realName、gender、age、phone、education、city、targetCity、expectedSalary、avatarUrl 等字段
- **Admin API**：仅有 `getUserList`，缺少获取用户详情的接口

---

## 2. UI 设计方案

### 2.1 用户列表操作列改造

**改造前**：
```
[解锁] [启用] [禁用] [重置密码]
```

**改造后**：
```
[详情] [解锁] [启用] [禁用] [重置密码]
```

| 按钮 | 样式 | 图标 |
|------|------|------|
| 详情 | 幽灵按钮，主色调 | `info` |

```tsx
<button className="text-sm font-medium text-primary hover:text-primary-container transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container">
  <span className="material-symbols-outlined text-[18px] mr-1">info</span>
  详情
</button>
```

### 2.2 详情弹窗设计

#### 2.2.1 弹窗布局（Modal）

| 属性 | 值 |
|------|-----|
| 宽度 | 560px（最大） |
| 最大高度 | 80vh |
| 内边距 | 24px |
| 圆角 | 1.5rem |
| 标题栏 | 左侧用户头像+姓名，右侧关闭按钮 |

#### 2.2.2 弹窗内容结构

```
┌─────────────────────────────────────────────┐
│ [头像] 张三 / GH-00012                      │  ← 用户基本信息区
│       个人用户 · 正常                        │
├─────────────────────────────────────────────┤
│                                             │
│  个人信息                                    │  ← 基础信息卡片
│  ┌─────────────┬─────────────┬────────────┐  │
│  │ 性别：男    │ 年龄：28    │ 学历：本科 │  │
│  └─────────────┴─────────────┴────────────┘  │
│  ┌─────────────┬────────────────────────────┐ │
│  │ 手机：      │ 138****1234               │  │
│  └─────────────┴────────────────────────────┘ │
│  ┌─────────────┬────────────────────────────┐ │
│  │ 邮箱：      │ zhangsan@example.com        │  │
│  └─────────────┴────────────────────────────┘ │
│                                             │
│  求职意向                                    │  ← 求职意向卡片
│  ┌─────────────┬────────────────────────────┐ │
│  │ 目标城市：  │ 北京、上海                  │  │
│  └─────────────┴────────────────────────────┘ │
│  ┌─────────────┬────────────────────────────┐ │
│  │ 期望薪资：  │ 25K-35K / 月               │  │
│  └─────────────┴────────────────────────────┘ │
│                                             │
│  账号信息                                    │  ← 账号信息卡片
│  ┌─────────────┬────────────────────────────┐ │
│  │ 注册时间：  │ 2026-01-15                 │  │
│  └─────────────┴────────────────────────────┘ │
│  ┌─────────────┬────────────────────────────┐ │
│  │ 最后登录：  │ 2026-04-20 14:30           │  │
│  └─────────────┴────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

#### 2.2.3 字段映射关系

| PersonInfo 字段 | 展示标签 | 展示样式 |
|----------------|----------|----------|
| realName | 真实姓名 | 标题区显示 |
| avatarUrl | 头像 | 圆形头像，无则显示首字母 |
| gender | 性别 | 0=未知, 1=男, 2=女 |
| age | 年龄 | 数字+"岁" |
| phone | 手机 | 脱敏显示（138****1234） |
| email | 邮箱 | 原始显示 |
| education | 学历 | 原始显示 |
| city | 所在城市 | 原始显示 |
| targetCity | 目标城市 | 原始显示 |
| expectedSalary | 期望薪资 | 数字+"K / 月" |
| createdAt（User） | 注册时间 | yyyy-MM-dd 格式 |
| lastLoginAt（User） | 最后登录 | yyyy-MM-dd HH:mm 格式 |

#### 2.2.4 交互逻辑

| 交互 | 行为 |
|------|------|
| 点击"详情"按钮 | 调用 API 获取用户详情，展示弹窗 |
| 点击遮罩层 | 关闭弹窗 |
| 点击右上角关闭图标 | 关闭弹窗 |
| 按 ESC 键 | 关闭弹窗 |
| 加载中 | 显示 loading spinner |
| 加载失败 | 显示错误提示 |
| 无 PersonInfo 数据 | 展示"暂无个人信息" |

---

## 3. 后端 API 设计

### 3.1 新增接口

**接口路径**：`GET /admin/user/{userId}/detail`

**响应结构**：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "user": {
      "id": 12,
      "username": "zhangsan",
      "email": "zhangsan@example.com",
      "phone": "13812345678",
      "type": "PERSON",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T08:00:00Z",
      "lastLoginAt": "2026-04-20T14:30:00Z"
    },
    "personInfo": {
      "realName": "张三",
      "gender": 1,
      "age": 28,
      "phone": "13812345678",
      "email": "zhangsan@example.com",
      "education": "本科",
      "city": "北京",
      "targetCity": "北京,上海",
      "expectedSalary": 30000
    }
  }
}
```

### 3.2 实现位置

| 文件 | 说明 |
|------|------|
| `AdminUserController.java` | 新增 `/admin/user/{userId}/detail` 端点 |
| `AdminUserDetailResponse.java` | 新建 DTO，包含 UserItem 和 PersonInfoResponse |

### 3.3 注意事项

- `expectedSalary` 在 `PersonInfoPO` 中标记为 `exist = false`，需确认数据库是否存在该字段
- 若不存在，需要调整 PO 或返回前端时设为 null

---

## 4. 前端数据结构设计

### 4.1 新增 TypeScript 类型

```typescript
// admin.ts 新增

// 用户详情响应
export interface UserDetailResponse {
  user: UserItem;
  personInfo: PersonInfoDetail | null;
}

// PersonInfo 详情（与后端 PersonInfoResponse 对应）
export interface PersonInfoDetail {
  realName: string;
  gender: number;        // 0=未知, 1=男, 2=女
  age: number;
  phone: string;
  email: string;
  education: string;
  city: string;
  targetCity: string;
  expectedSalary: number | null;
}

// adminApi 新增方法
export interface AdminApi {
  // ... 现有方法
  getUserDetail: (userId: number) => Promise<UserDetailResponse>;
}
```

### 4.2 组件改造

| 文件 | 改动点 |
|------|--------|
| `admin/users/page.tsx` | 新增详情弹窗 state、详情按钮、详情弹窗组件 |
| `admin/api.ts` | 新增 `getUserDetail` 方法 |

### 4.3 辅助函数

```typescript
// 性别转换
const getGenderLabel = (gender: number) => {
  if (gender === 1) return '男';
  if (gender === 2) return '女';
  return '未知';
};

// 手机号脱敏
const maskPhone = (phone: string) => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 薪资格式化
const formatSalary = (salary: number | null) => {
  if (!salary) return '-';
  return `${(salary / 1000).toFixed(0)}K-${((salary + 10000) / 1000).toFixed(0)}K / 月`;
};
```

---

## 5. 实现步骤

### Step 1: 后端 API 实现
1. 创建 `AdminUserDetailResponse.java` DTO
2. 在 `AdminUserController` 新增 `GET /admin/user/{userId}/detail` 端点
3. 验证接口返回正确数据

### Step 2: 前端 API 对接
1. 在 `admin.ts` 新增 `getUserDetail` 方法和类型定义
2. 在用户列表页引入方法

### Step 3: 详情按钮开发
1. 在用户列表操作列新增"详情"按钮
2. 实现弹窗组件（复用 Material Symbols 图标）

### Step 4: 联调测试
1. 前后端联调验证数据展示
2. 边界情况处理（无 PersonInfo 数据）
3. UI 样式微调

---

## 6. 风险与注意事项

| 风险 | 应对措施 |
|------|----------|
| `expectedSalary` 字段不存在 | 后端返回 null，前端展示"-" |
| 部分用户无 PersonInfo 数据 | 展示"暂无个人信息"提示 |
| 用户类型为 COMPANY/ADMIN | 详情弹窗仍展示，但求职意向区可为空 |
| 长文本溢出 | 字段内容超出宽度时 ellipsis 处理 |
