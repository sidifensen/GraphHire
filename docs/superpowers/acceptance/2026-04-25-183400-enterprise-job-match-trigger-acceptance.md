# 企业岗位一键匹配验收标准

- [x] 企业岗位详情页展示“一键匹配全部候选人”按钮。
- [x] 点击后按钮进入“匹配启动中...”并禁用。
- [x] 接口成功后页面展示“已开始匹配，正在刷新候选人推荐”。
- [x] 后端提供 `POST /company/job/{id}/match/trigger` 且校验岗位归属。
- [x] 后端接口调用 `matchAppService.triggerMatchForJob(jobId)`。
