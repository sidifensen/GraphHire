# 管理端用户管理分页修复设计

## 背景
管理端用户管理页出现一次加载全部 28 条记录的问题，分页器虽显示 3 页，但实际表格渲染为全量数据。

## 根因
1. 后端 `AdminRepositoryImpl.findUsersPage` 在分页插件未生效场景下可能返回全量 records。
2. 后端 `AdminAppService.getUserList` 把 `list.size()` 当作 total，分页元数据语义不稳定。
3. 前端 `admin/users/page.tsx` 接收服务端 `pageSize` 并覆盖本地值，缺少兜底约束。

## 方案
1. 后端仓储增加兜底切片：若 records 数量大于请求 size，按 `(page,size)` 手动截断。
2. 后端服务返回 `total = page.getTotal()`。
3. 前端固定管理端用户列表 `pageSize=10`，并在 total 变化时自动夹紧 currentPage。

## 影响面
- 管理端用户管理页列表与分页器。
- 不影响企业审核、标签管理、任务监控等其他列表模块。
