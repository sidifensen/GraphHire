package com.graphhire.resume.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
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
        wrapper.eq(ParseTaskPO::getSourceId, resumeId);
        ParseTaskPO po = parseTaskMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<ParseTask> findAll() {
        return parseTaskMapper.selectList(null).stream()
                .map(this::toDomain)
                .toList();
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
            task.setTaskType(po.getTaskType() == 1 ? "resume_parse" : "job_parse");
        }
        if (po.getStatus() != null) {
            task.setStatus(ParseTask.TaskStatus.values()[po.getStatus()]);
        }
        task.setCreatedAt(po.getCreateTime());
        task.setStartedAt(null);
        task.setCompletedAt(po.getFinishTime());
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
            } else if ("job_parse".equalsIgnoreCase(task.getTaskType())) {
                taskTypeVal = 2;
            }
        }
        Long sourceIdVal = task.getResumeId() != null ? task.getResumeId() : task.getJobId();
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
        return po;
    }
}
