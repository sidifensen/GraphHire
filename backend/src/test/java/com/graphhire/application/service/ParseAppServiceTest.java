package com.graphhire.application.service;

import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.repository.ParseTaskRepository;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.domain.vo.TaskStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParseAppServiceTest {

    @Mock
    private ParseTaskRepository parseTaskRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private ParseAppService parseAppService;

    @Nested
    @DisplayName("获取任务状态测试")
    class GetTaskStatusTests {

        @Test
        @DisplayName("成功获取任务状态")
        void getTaskStatus_Success() {
            // Given
            Long taskId = 1L;
            ParseTask task = ParseTask.builder()
                    .id(taskId)
                    .taskType("RESUME_PARSE")
                    .status(TaskStatus.PENDING)
                    .build();

            when(parseTaskRepository.findByIdOptional(taskId)).thenReturn(Optional.of(task));

            // When
            ParseTask result = parseAppService.getTaskStatus(taskId);

            // Then
            assertNotNull(result);
            assertEquals(taskId, result.getId());
            assertEquals(TaskStatus.PENDING, result.getStatus());
        }

        @Test
        @DisplayName("任务不存在时抛出异常")
        void getTaskStatus_NotFound_ThrowsException() {
            // Given
            Long taskId = 999L;
            when(parseTaskRepository.findByIdOptional(taskId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> parseAppService.getTaskStatus(taskId));
            assertEquals("任务不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("获取待处理任务测试")
    class GetPendingTasksTests {

        @Test
        @DisplayName("成功获取待处理任务列表")
        void getPendingTasks_Success() {
            // Given
            int limit = 10;
            List<ParseTask> tasks = Arrays.asList(
                    ParseTask.builder().id(1L).taskType("RESUME_PARSE").status(TaskStatus.PENDING).build(),
                    ParseTask.builder().id(2L).taskType("JOB_PARSE").status(TaskStatus.PENDING).build()
            );

            when(parseTaskRepository.findPendingTasks(limit)).thenReturn(tasks);

            // When
            List<ParseTask> result = parseAppService.getPendingTasks(limit);

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
        }
    }

    @Nested
    @DisplayName("重试任务测试")
    class RetryTaskTests {

        @Test
        @DisplayName("成功重试任务")
        void retryTask_Success() {
            // Given
            Long taskId = 1L;
            ParseTask task = ParseTask.builder()
                    .id(taskId)
                    .status(TaskStatus.FAILED)
                    .retryCount(1)
                    .errorMessage("解析失败")
                    .build();

            when(parseTaskRepository.findByIdOptional(taskId)).thenReturn(Optional.of(task));
            when(parseTaskRepository.save(any(ParseTask.class))).thenReturn(task);

            // When
            parseAppService.retryTask(taskId);

            // Then
            ArgumentCaptor<ParseTask> taskCaptor = ArgumentCaptor.forClass(ParseTask.class);
            verify(parseTaskRepository).save(taskCaptor.capture());
            assertEquals(TaskStatus.PENDING, taskCaptor.getValue().getStatus());
            assertEquals(2, taskCaptor.getValue().getRetryCount());
            assertNull(taskCaptor.getValue().getErrorMessage());
        }

        @Test
        @DisplayName("任务不存在时重试失败")
        void retryTask_NotFound_ThrowsException() {
            // Given
            Long taskId = 999L;
            when(parseTaskRepository.findByIdOptional(taskId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> parseAppService.retryTask(taskId));
            assertEquals("任务不存在", exception.getMessage());
        }

        @Test
        @DisplayName("重试次数已达上限时失败")
        void retryTask_MaxRetriesExceeded_ThrowsException() {
            // Given
            Long taskId = 1L;
            ParseTask task = ParseTask.builder()
                    .id(taskId)
                    .status(TaskStatus.FAILED)
                    .retryCount(3)
                    .build();

            when(parseTaskRepository.findByIdOptional(taskId)).thenReturn(Optional.of(task));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> parseAppService.retryTask(taskId));
            assertEquals("重试次数已达上限", exception.getMessage());
        }
    }
}
