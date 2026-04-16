package com.graphhire.resume.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.ParseTaskMapper;
import com.graphhire.resume.infrastructure.persistence.po.ParseTaskPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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
        wrapper.eq(ParseTaskPO::getResumeId, resumeId);
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

    private ParseTask toDomain(ParseTaskPO po) {
        ParseTask task = new ParseTask();
        task.setId(po.getId());
        task.setResumeId(po.getResumeId());
        task.setJobId(po.getJobId());
        task.setTaskType(po.getTaskType());
        if (po.getStatus() != null) {
            task.setStatus(ParseTask.TaskStatus.values()[po.getStatus()]);
        }
        task.setRetryCount(po.getRetryCount());
        task.setErrorMessage(po.getErrorMessage());
        task.setCreatedAt(po.getCreatedAt());
        task.setStartedAt(po.getStartedAt());
        task.setCompletedAt(po.getCompletedAt());
        return task;
    }

    private ParseTaskPO toPO(ParseTask task) {
        ParseTaskPO po = new ParseTaskPO();
        po.setId(task.getId());
        po.setResumeId(task.getResumeId());
        po.setJobId(task.getJobId());
        po.setTaskType(task.getTaskType());
        if (task.getStatus() != null) {
            po.setStatus(task.getStatus().ordinal());
        }
        po.setRetryCount(task.getRetryCount());
        po.setErrorMessage(task.getErrorMessage());
        po.setCreatedAt(task.getCreatedAt());
        po.setStartedAt(task.getStartedAt());
        po.setCompletedAt(task.getCompletedAt());
        return po;
    }
}
