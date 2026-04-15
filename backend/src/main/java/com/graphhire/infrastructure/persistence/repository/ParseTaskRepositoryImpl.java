package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.repository.ParseTaskRepository;
import com.graphhire.domain.vo.TaskStatus;
import com.graphhire.infrastructure.persistence.mapper.ParseTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ParseTaskRepositoryImpl implements ParseTaskRepository {
    private final ParseTaskMapper parseTaskMapper;

    @Override
    public ParseTask findById(Long id) {
        return parseTaskMapper.selectById(id);
    }

    @Override
    public Optional<ParseTask> findByIdOptional(Long id) {
        return Optional.ofNullable(findById(id));
    }

    @Override
    public ParseTask save(ParseTask task) {
        if (task.getId() == null) {
            parseTaskMapper.insert(task);
        } else {
            parseTaskMapper.updateById(task);
        }
        return task;
    }

    @Override
    public List<ParseTask> findByStatus(TaskStatus status) {
        return parseTaskMapper.selectList(new LambdaQueryWrapper<ParseTask>().eq(ParseTask::getStatus, status));
    }

    @Override
    public List<ParseTask> findPendingTasks(int limit) {
        return parseTaskMapper.selectList(
            new LambdaQueryWrapper<ParseTask>()
                .eq(ParseTask::getStatus, TaskStatus.PENDING)
                .orderByAsc(ParseTask::getCreatedAt)
                .last("LIMIT " + limit));
    }

    @Override
    public List<ParseTask> findByResumeId(Long resumeId) {
        return parseTaskMapper.selectList(new LambdaQueryWrapper<ParseTask>().eq(ParseTask::getResumeId, resumeId));
    }

    @Override
    public List<ParseTask> findByJobId(Long jobId) {
        return parseTaskMapper.selectList(new LambdaQueryWrapper<ParseTask>().eq(ParseTask::getJobId, jobId));
    }

    @Override
    public void delete(Long id) {
        parseTaskMapper.deleteById(id);
    }

    @Override
    public Long countPending() {
        return parseTaskMapper.selectCount(new LambdaQueryWrapper<ParseTask>().eq(ParseTask::getStatus, TaskStatus.PENDING));
    }
}
