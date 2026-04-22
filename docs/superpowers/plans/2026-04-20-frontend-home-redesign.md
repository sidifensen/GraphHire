# 首页重构计划

## 目标
交付可运行、可接真实 API 的首页原型。

## 范围（首轮）
- 仅首页 `/home`
- 删除旧 `frontend` 目录重建
- 技术栈：Next.js 16 + Tailwind CSS 4 + TypeScript

## 实施步骤

### Step 1：测试基础
- 安装配置 Vitest + Testing Library + @next/testing
- 写首页格式化/状态处理失败测试（当前应 RED）

### Step 2：首页 API 层
- 接真实后端接口：
  - `GET /public/jobs` → 职位列表
  - `GET /person/recommend/jobs` → 推荐职位
  - `GET /person/match/{jobId}` → 单个匹配分
- 写 mapper 层，转换成首页展示用类型

### Step 3：首页原型还原
- 路由 `/home`
- Hero 搜索区
- 左 65% 职位列表（loading/empty/error）
- 右 35% 推荐栏（loading/empty/error）
- 局部失败解耦：列表失败不拖垮推荐，推荐失败不拖垮列表

### Step 4：验证
- 浏览器打开 `http://localhost:8888/home` 截图验证
- 跑 `npm test` 全绿
