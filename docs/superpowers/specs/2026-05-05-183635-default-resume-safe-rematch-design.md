# 默认简历安全重匹配设计

**日期**: 2026-05-05  
**范围**: `backend/src/main/java/com/graphhire/resume/**`、`backend/src/main/java/com/graphhire/match/**`、对应单测

---

## 目标

实现两类触发下的“默认简历全职位重匹配”，并保证旧匹配记录不会在新匹配失败时被误删：

1. 用户无默认简历时上传新简历：新简历自动标记为默认；在解析成功后触发全职位匹配。  
2. 用户手动将某份简历设为默认：触发全职位重匹配并生成新匹配记录。  
3. 旧默认简历的历史匹配记录在新默认简历匹配成功后再删除，避免“新失败+旧已删”的数据空洞。

## 现状问题

- `MatchAppService.triggerMatchForResume` 当前是“先 `deleteByResumeId` 再计算保存”，失败时存在旧数据丢失风险。  
- `ResumeAppService.uploadResume` 未处理“无默认简历时自动默认”。  
- 默认简历变更后虽有图谱重建，但缺少安全的全职位重匹配替换策略。

## 方案对比

### 方案 A：先删后算（现状）

- 优点：实现简单。  
- 缺点：风险最高，无法满足“失败不丢旧数据”。

### 方案 B：新增匹配批次表做双版本切换

- 优点：理论最强一致性。  
- 缺点：需改表结构与查询过滤逻辑，改动面过大。

### 方案 C（采用）：事务内先生成/更新，再清理过期记录

- 步骤：
  1. 读取该简历现有匹配记录。  
  2. 遍历所有已发布职位，逐条计算新匹配；若该职位已有旧记录则走更新（带 id），否则插入。  
  3. 全部成功后，仅删除“不在最新发布职位集合里”的旧记录。  
- 一致性：使用同一数据库事务；任一步骤异常时整事务回滚，旧记录完整保留。

## 详细设计

### 1. 上传自动默认

在 `ResumeAppService.uploadResume` 中：

- 查询当前用户现有简历列表。  
- 若“当前无默认简历”，则新建 `Resume` 时设置 `isDefault=true`；否则保持 `false`。  
- 上传后仍走原解析任务队列。

### 2. 解析成功后触发首次默认匹配

在 `ResumeParseMQConsumer` 中：

- 简历解析成功并落库后，若 `resume.isDefault=true`，调用 `matchAppService.triggerMatchForResume(resumeId)`。  
- 非默认简历不触发该流程。

### 3. 手动设默认触发安全重匹配

在 `ResumeAppService.setDefaultResume` 中：

- 保留“仅 SUCCESS 可设默认”的校验。  
- 切换默认后，调用 `matchAppService.triggerMatchForResume(newDefaultResumeId)`。  
- 若存在旧默认简历，且与新默认不同，则在新匹配成功后清理旧默认的匹配：`clearOldMatchDataForResume(oldDefaultResumeId)`。  
- 全流程保持事务一致性，确保异常回滚。

### 4. 安全重匹配算法

在 `MatchAppService.triggerMatchForResume` 中：

- 不再先执行 `deleteByResumeId`。  
- 基于当前旧记录建立 `jobId -> oldRecord` 索引。  
- 对每个发布职位：
  - 计算新匹配记录；
  - 若旧记录存在则附带旧 `id` 走更新；否则插入。  
- 全部保存成功后，删除旧记录中“职位已下架/不存在于本次发布集合”的项。

## 失败保护

- 新匹配计算或写入任一失败：事务回滚，旧匹配记录不变。  
- 旧记录删除仅发生在“新匹配全部成功之后”。

## 测试策略（TDD）

1. 先改 `MatchAppServiceTest`：断言不再先删、会更新已有记录、仅清理过期记录；并加失败场景确保不触发清理。  
2. 再改 `ResumeAppServiceTest`：断言首次上传自动默认；手动设默认触发“先新后旧”匹配处理。  
3. 改 `ResumeParseMQConsumerTest`：断言默认简历解析成功后触发全职位匹配。  
4. 生产代码最小实现使测试通过，再回归 `mvn compile` 与 `mvn test`。
