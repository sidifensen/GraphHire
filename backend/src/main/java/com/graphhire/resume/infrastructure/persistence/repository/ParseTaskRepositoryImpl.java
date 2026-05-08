package com.graphhire.resume.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.ParseTaskMapper;
import com.graphhire.resume.infrastructure.persistence.po.ParseTaskPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 解析任务仓储实现
 */
@Repository
public class ParseTaskRepositoryImpl implements ParseTaskRepository {

    @Autowired
    private ParseTaskMapper parseTaskMapper;

    @Override
    public Optional<ParseTask> findById(Long id) {
        ParseTaskPO po = parseTaskMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public Optional<ParseTask> findByResumeId(Long resumeId) {
        LambdaQueryWrapper<ParseTaskPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ParseTaskPO::getSourceId, resumeId)
                .eq(ParseTaskPO::getTaskType, 1)
                .orderByDesc(ParseTaskPO::getId);
        List<ParseTaskPO> pos = parseTaskMapper.selectList(wrapper);
        ParseTaskPO po = pos.stream()
                .filter(task -> task != null && Integer.valueOf(1).equals(task.getTaskType()))
                .findFirst()
                .orElse(null);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public Optional<ParseTask> findRunningByResumeId(Long resumeId) {
        LambdaQueryWrapper<ParseTaskPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ParseTaskPO::getSourceId, resumeId)
            .eq(ParseTaskPO::getTaskType, 1)
            .eq(ParseTaskPO::getStatus, ParseTask.TaskStatus.RUNNING.ordinal())
            .orderByDesc(ParseTaskPO::getId)
            .last("LIMIT 1");
        ParseTaskPO po = parseTaskMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public boolean existsRunningByResumeId(Long resumeId) {
        LambdaQueryWrapper<ParseTaskPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ParseTaskPO::getSourceId, resumeId)
            .eq(ParseTaskPO::getTaskType, 1)
            .eq(ParseTaskPO::getStatus, ParseTask.TaskStatus.RUNNING.ordinal())
            .last("LIMIT 1");
        return parseTaskMapper.selectCount(wrapper) > 0;
    }

    @Override
    public List<ParseTask> findAll() {
        return parseTaskMapper.selectList(null).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public IPage<ParseTask> findPage(String type, String status, int page, int pageSize) {
        int safePage = Math.max(page, 1);
        int safePageSize = Math.max(pageSize, 1);
        Page<ParseTaskPO> pageParam = new Page<>(safePage, safePageSize);
        LambdaQueryWrapper<ParseTaskPO> wrapper = new LambdaQueryWrapper<>();

        applyTypeFilter(wrapper, type);
        applyStatusFilter(wrapper, status);
        wrapper.orderByDesc(ParseTaskPO::getCreateTime);

        IPage<ParseTaskPO> poPage = parseTaskMapper.selectPage(pageParam, wrapper);
        List<ParseTaskPO> records = poPage.getRecords() == null ? List.of() : poPage.getRecords();

        // 分页结果依赖 MyBatis-Plus 分页拦截器，统一在基础配置中注册。
        Page<ParseTask> domainPage = new Page<>(safePage, safePageSize, poPage.getTotal());
        domainPage.setRecords(records.stream().map(this::toDomain).toList());
        return domainPage;
    }

    @Override
    public long countByStatus(ParseTask.TaskStatus status) {
        if (status == null) {
            return 0L;
        }
        LambdaQueryWrapper<ParseTaskPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ParseTaskPO::getStatus, status.ordinal());
        return parseTaskMapper.selectCount(wrapper);
    }

    @Override
    public ParseTask save(ParseTask parseTask) {
        ParseTaskPO po = toPO(parseTask);
        if (parseTask.getId() == null) {
            parseTaskMapper.insert(po);
            parseTask.setId(po.getId());
        } else {
            parseTaskMapper.updateById(po);
        }
        return parseTask;
    }

    @Override
    public void delete(ParseTask parseTask) {
        parseTaskMapper.deleteById(parseTask.getId());
    }

    /** PO 转 Domain */
    private ParseTask toDomain(ParseTaskPO po) {
        if (po == null) return null;
        ParseTask task = new ParseTask();
        BeanUtil.copyProperties(po, task, "taskType"); // taskType 需要手动转换
        if (po.getTaskType() != null) {
            task.setTaskType(po.getTaskType() == 1 ? "resume_parse" : "unknown");
        }
        if (po.getStatus() != null) {
            task.setStatus(ParseTask.TaskStatus.values()[po.getStatus()]);
        }
        task.setSourceId(po.getSourceId());
        task.setCreatedAt(po.getCreateTime());
        task.setStartedAt(null);
        task.setCompletedAt(po.getFinishTime());
        task.setUpdatedAt(po.getUpdateTime());
        return task;
    }

    /** Domain 转 PO */
    private ParseTaskPO toPO(ParseTask task) {
        ParseTaskPO po = new ParseTaskPO();
        // 先设置所有字段，再统一复制避免冲突
        Integer taskTypeVal = null;
        if (task.getTaskType() != null) {
            if ("resume_parse".equalsIgnoreCase(task.getTaskType())) {
                taskTypeVal = 1;
            }
        }
        if (taskTypeVal == null) {
            taskTypeVal = 1;
        }
        Long sourceIdVal = task.getSourceId() != null ? task.getSourceId() : task.getResumeId();
        Integer statusVal = task.getStatus() != null ? task.getStatus().ordinal() : 0;
        // 手动设置所有字段，避免 BeanUtil 类型转换问题
        po.setId(task.getId());
        po.setTaskType(taskTypeVal);
        po.setSourceId(sourceIdVal);
        po.setStatus(statusVal);
        po.setRetryCount(task.getRetryCount());
        po.setErrorMessage(task.getErrorMessage());
        po.setCreateTime(task.getCreatedAt());
        po.setFinishTime(task.getCompletedAt());
        po.setUpdateTime(task.getUpdatedAt());
        return po;
    }

    private void applyStatusFilter(LambdaQueryWrapper<ParseTaskPO> wrapper, String status) {
        if (status == null || status.isBlank()) {
            return;
        }
        Integer mapped = switch (status.toUpperCase()) {
            case "QUEUED" -> ParseTask.TaskStatus.PENDING.ordinal();
            case "PROCESSING" -> ParseTask.TaskStatus.RUNNING.ordinal();
            case "COMPLETED" -> ParseTask.TaskStatus.SUCCESS.ordinal();
            case "FAILED" -> ParseTask.TaskStatus.FAILED.ordinal();
            default -> null;
        };
        if (mapped != null) {
            wrapper.eq(ParseTaskPO::getStatus, mapped);
        }
    }

    private void applyTypeFilter(LambdaQueryWrapper<ParseTaskPO> wrapper, String type) {
        if (type == null || type.isBlank()) {
            return;
        }
        switch (type.toUpperCase()) {
            case "RESUME_PARSE" -> wrapper.eq(ParseTaskPO::getTaskType, 1);
            case "JOB_MATCH", "IMPORT" -> wrapper.eq(ParseTaskPO::getTaskType, -1);
            default -> {
            }
        }
    }
}
