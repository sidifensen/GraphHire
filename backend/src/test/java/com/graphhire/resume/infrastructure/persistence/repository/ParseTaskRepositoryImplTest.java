package com.graphhire.resume.infrastructure.persistence.repository;

import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.ParseTaskMapper;
import com.graphhire.resume.infrastructure.persistence.po.ParseTaskPO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
class ParseTaskRepositoryImplTest {

    @MockBean
    private ParseTaskMapper parseTaskMapper;

    @Autowired
    private ParseTaskRepository parseTaskRepository;

    @Nested
    @DisplayName("findByResumeId 测试")
    class FindByResumeIdTests {

        @Test
        @DisplayName("同一简历存在多任务时应返回最新的简历解析任务")
        void findByResumeId_ReturnsLatestResumeParseTask_WhenMultipleTasksExist() {
            ParseTaskPO olderResumeTask = createTaskPO(101L, 1, 1001L, 0);
            ParseTaskPO newestJobTask = createTaskPO(103L, 2, 1001L, 2);
            ParseTaskPO newestResumeTask = createTaskPO(102L, 1, 1001L, 1);

            when(parseTaskMapper.selectList(any())).thenReturn(List.of(newestJobTask, newestResumeTask, olderResumeTask));

            Optional<ParseTask> result = parseTaskRepository.findByResumeId(1001L);

            assertTrue(result.isPresent());
            assertEquals(102L, result.get().getId());
            assertEquals("resume_parse", result.get().getTaskType());
            assertEquals(ParseTask.TaskStatus.RUNNING, result.get().getStatus());
        }

        @Test
        @DisplayName("没有匹配任务时返回空")
        void findByResumeId_ReturnsEmpty_WhenNoMatchedTask() {
            when(parseTaskMapper.selectList(any())).thenReturn(List.of());

            Optional<ParseTask> result = parseTaskRepository.findByResumeId(404L);

            assertTrue(result.isEmpty());
        }
    }

    private ParseTaskPO createTaskPO(Long id, Integer taskType, Long sourceId, Integer status) {
        ParseTaskPO po = new ParseTaskPO();
        po.setId(id);
        po.setTaskType(taskType);
        po.setSourceId(sourceId);
        po.setStatus(status);
        po.setCreateTime(LocalDateTime.now());
        return po;
    }
}
