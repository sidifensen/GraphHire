package com.graphhire.resume.infrastructure.persistence.repository;

import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.infrastructure.persistence.mapper.ParseTaskMapper;
import com.graphhire.resume.infrastructure.persistence.po.ParseTaskPO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;

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

    @MockBean
    private JavaMailSender javaMailSender;

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

    @Nested
    @DisplayName("运行中任务查询测试")
    class RunningTaskTests {

        @Test
        @DisplayName("findRunningByResumeId 应返回运行中的简历解析任务")
        void findRunningByResumeId_ShouldReturnRunningTask() {
            ParseTaskPO running = createTaskPO(501L, 1, 2001L, ParseTask.TaskStatus.RUNNING.ordinal());
            when(parseTaskMapper.selectOne(any())).thenReturn(running);

            Optional<ParseTask> result = parseTaskRepository.findRunningByResumeId(2001L);

            assertTrue(result.isPresent());
            assertEquals(501L, result.get().getId());
            assertEquals(ParseTask.TaskStatus.RUNNING, result.get().getStatus());
        }

        @Test
        @DisplayName("existsRunningByResumeId 命中时应返回true")
        void existsRunningByResumeId_ShouldReturnTrue() {
            when(parseTaskMapper.selectCount(any())).thenReturn(1L);

            assertTrue(parseTaskRepository.existsRunningByResumeId(2001L));
        }

        @Test
        @DisplayName("existsRunningByResumeId 未命中时应返回false")
        void existsRunningByResumeId_ShouldReturnFalse() {
            when(parseTaskMapper.selectCount(any())).thenReturn(0L);

            assertFalse(parseTaskRepository.existsRunningByResumeId(2001L));
        }
    }

    @Nested
    @DisplayName("findPage 测试")
    class FindPageTests {

        @Test
        @DisplayName("分页插件失效返回全量时仍应按页切片")
        void findPage_ShouldSliceRecords_WhenMapperReturnsAllRecords() {
            ParseTaskPO task1 = createTaskPO(1L, 1, 1001L, 0);
            ParseTaskPO task2 = createTaskPO(2L, 1, 1002L, 1);
            ParseTaskPO task3 = createTaskPO(3L, 1, 1003L, 2);

            IPage<ParseTaskPO> mapperPage = new Page<>(2, 1, 3);
            mapperPage.setRecords(List.of(task1, task2, task3));
            when(parseTaskMapper.selectPage(any(), any())).thenReturn(mapperPage);

            IPage<ParseTask> result = parseTaskRepository.findPage("RESUME_PARSE", null, 2, 1);

            assertEquals(3, result.getTotal());
            assertEquals(1, result.getRecords().size());
            assertEquals(2L, result.getRecords().get(0).getId());
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
