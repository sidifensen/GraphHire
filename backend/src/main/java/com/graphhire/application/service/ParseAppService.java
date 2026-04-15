package com.graphhire.application.service;

import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.repository.ParseTaskRepository;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.domain.vo.TaskStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ParseAppService {
    private final ParseTaskRepository parseTaskRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;

    public ParseTask getTaskStatus(Long taskId) {
        log.info("Getting task status: taskId={}", taskId);
        return parseTaskRepository.findByIdOptional(taskId)
                .orElseThrow(() -> new RuntimeException("任务不存在"));
    }

    public List<ParseTask> getPendingTasks(int limit) {
        log.info("Getting pending tasks: limit={}", limit);
        return parseTaskRepository.findPendingTasks(limit);
    }

    @Transactional
    public void retryTask(Long taskId) {
        log.info("Retrying task: taskId={}", taskId);

        ParseTask task = parseTaskRepository.findByIdOptional(taskId)
                .orElseThrow(() -> new RuntimeException("任务不存在"));

        if (task.getRetryCount() >= 3) {
            throw new RuntimeException("重试次数已达上限");
        }

        task.setStatus(TaskStatus.PENDING);
        task.setRetryCount(task.getRetryCount() + 1);
        task.setErrorMessage(null);
        parseTaskRepository.save(task);

        log.info("Task retry scheduled: taskId={}, retryCount={}", taskId, task.getRetryCount());
    }
}
