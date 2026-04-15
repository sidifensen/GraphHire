package com.graphhire.resume.infrastructure.mq;

import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.infrastructure.ai.DocumentParser;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeParseMQConsumerTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private ParseTaskRepository parseTaskRepository;

    @Mock
    private DocumentParser documentParser;

    @Mock
    private DeepSeekClient deepSeekClient;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ResumeParseMQConsumer consumer;

    @Nested
    @DisplayName("简历解析MQ消费测试")
    class ConsumeResumeParseTests {

        @Test
        @DisplayName("成功解析简历并创建通知")
        void consumeResumeParse_Success() {
            // Given
            Long resumeId = 1L;
            Long parseTaskId = 1L;

            Resume resume = new Resume();
            resume.setId(resumeId);
            resume.setUserId(100L);
            resume.setFilePath("/path/to/resume.pdf");
            resume.setStatus(ParseStatus.PENDING);

            ParseTask task = new ParseTask();
            task.setId(parseTaskId);
            task.setResumeId(resumeId);
            task.setTaskType("resume_parse");
            task.setStatus(ParseTask.TaskStatus.PENDING);

            Map<String, Object> parseResult = Map.of(
                "name", "John Doe",
                "skills", new String[]{"Java", "Python"},
                "summary", "Experienced developer"
            );

            when(parseTaskRepository.findById(parseTaskId)).thenReturn(Optional.of(task));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(resume));
            when(documentParser.extractText(anyString())).thenReturn("This is resume content");
            when(deepSeekClient.parseResume(anyString())).thenReturn(parseResult);
            when(resumeRepository.save(any(Resume.class))).thenReturn(resume);
            when(parseTaskRepository.save(any(ParseTask.class))).thenReturn(task);
            when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
                Notification n = invocation.getArgument(0);
                n.setId(1L);
                return n;
            });

            // When
            consumer.consumeResumeParse(resumeId, parseTaskId);

            // Then
            ArgumentCaptor<ParseTask> taskCaptor = ArgumentCaptor.forClass(ParseTask.class);
            verify(parseTaskRepository, times(2)).save(taskCaptor.capture());

            ParseTask savedTask = taskCaptor.getAllValues().get(0);
            assertEquals(ParseTask.TaskStatus.RUNNING, savedTask.getStatus());

            savedTask = taskCaptor.getAllValues().get(1);
            assertEquals(ParseTask.TaskStatus.SUCCESS, savedTask.getStatus());
            assertNotNull(savedTask.getCompletedAt());

            ArgumentCaptor<Resume> resumeCaptor = ArgumentCaptor.forClass(Resume.class);
            verify(resumeRepository, times(2)).save(resumeCaptor.capture());

            Resume savedResume = resumeCaptor.getAllValues().get(0);
            assertEquals(ParseStatus.PARSING, savedResume.getStatus());

            savedResume = resumeCaptor.getAllValues().get(1);
            assertEquals(ParseStatus.SUCCESS, savedResume.getStatus());
            assertNotNull(savedResume.getParseResult());
            assertEquals(BigDecimal.valueOf(0.85), savedResume.getConfidence());

            ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(notificationCaptor.capture());

            Notification notification = notificationCaptor.getValue();
            assertEquals(100L, notification.getUserId());
            assertEquals(NotificationType.RESUME_PARSED, notification.getType());
            assertEquals("简历解析完成", notification.getTitle());
            assertEquals(resumeId, notification.getReferenceId());
        }

        @Test
        @DisplayName("解析失败时更新状态并保存错误信息")
        void consumeResumeParse_Failure() {
            // Given
            Long resumeId = 1L;
            Long parseTaskId = 1L;

            Resume resume = new Resume();
            resume.setId(resumeId);
            resume.setUserId(100L);
            resume.setFilePath("/path/to/resume.pdf");
            resume.setStatus(ParseStatus.PENDING);

            ParseTask task = new ParseTask();
            task.setId(parseTaskId);
            task.setResumeId(resumeId);
            task.setTaskType("resume_parse");
            task.setStatus(ParseTask.TaskStatus.PENDING);

            when(parseTaskRepository.findById(parseTaskId)).thenReturn(Optional.of(task));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(resume));
            when(documentParser.extractText(anyString())).thenThrow(new RuntimeException("File read error"));
            when(resumeRepository.save(any(Resume.class))).thenReturn(resume);
            when(parseTaskRepository.save(any(ParseTask.class))).thenReturn(task);

            // When
            consumer.consumeResumeParse(resumeId, parseTaskId);

            // Then
            ArgumentCaptor<Resume> resumeCaptor = ArgumentCaptor.forClass(Resume.class);
            verify(resumeRepository, times(2)).save(resumeCaptor.capture());

            Resume savedResume = resumeCaptor.getAllValues().get(1);
            assertEquals(ParseStatus.FAILED, savedResume.getStatus());
            assertEquals("File read error", savedResume.getParseError());

            ArgumentCaptor<ParseTask> taskCaptor = ArgumentCaptor.forClass(ParseTask.class);
            verify(parseTaskRepository, times(2)).save(taskCaptor.capture());

            ParseTask savedTask = taskCaptor.getAllValues().get(1);
            assertEquals(ParseTask.TaskStatus.FAILED, savedTask.getStatus());
            assertEquals("File read error", savedTask.getErrorMessage());
            assertNotNull(savedTask.getCompletedAt());

            // Verify no notification was created
            verify(notificationRepository, never()).save(any(Notification.class));
        }

        @Test
        @DisplayName("解析任务不存在时抛出异常")
        void consumeResumeParse_TaskNotFound() {
            // Given
            Long resumeId = 1L;
            Long parseTaskId = 999L;

            when(parseTaskRepository.findById(parseTaskId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> consumer.consumeResumeParse(resumeId, parseTaskId));
            assertTrue(exception.getMessage().contains("Parse task not found"));
        }

        @Test
        @DisplayName("简历不存在时抛出异常")
        void consumeResumeParse_ResumeNotFound() {
            // Given
            Long resumeId = 999L;
            Long parseTaskId = 1L;

            ParseTask task = new ParseTask();
            task.setId(parseTaskId);
            task.setResumeId(resumeId);
            task.setStatus(ParseTask.TaskStatus.PENDING);

            when(parseTaskRepository.findById(parseTaskId)).thenReturn(Optional.of(task));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                () -> consumer.consumeResumeParse(resumeId, parseTaskId));
            assertTrue(exception.getMessage().contains("Resume not found"));
        }

        @Test
        @DisplayName("DeepSeek解析返回null时使用空JSON")
        void consumeResumeParse_NullParseResult() {
            // Given
            Long resumeId = 1L;
            Long parseTaskId = 1L;

            Resume resume = new Resume();
            resume.setId(resumeId);
            resume.setUserId(100L);
            resume.setFilePath("/path/to/resume.pdf");
            resume.setStatus(ParseStatus.PENDING);

            ParseTask task = new ParseTask();
            task.setId(parseTaskId);
            task.setResumeId(resumeId);
            task.setStatus(ParseTask.TaskStatus.PENDING);

            when(parseTaskRepository.findById(parseTaskId)).thenReturn(Optional.of(task));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(resume));
            when(documentParser.extractText(anyString())).thenReturn("Resume content");
            when(deepSeekClient.parseResume(anyString())).thenReturn(null);
            when(resumeRepository.save(any(Resume.class))).thenReturn(resume);
            when(parseTaskRepository.save(any(ParseTask.class))).thenReturn(task);
            when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
                Notification n = invocation.getArgument(0);
                n.setId(1L);
                return n;
            });

            // When
            consumer.consumeResumeParse(resumeId, parseTaskId);

            // Then
            ArgumentCaptor<Resume> resumeCaptor = ArgumentCaptor.forClass(Resume.class);
            verify(resumeRepository, times(2)).save(resumeCaptor.capture());

            Resume savedResume = resumeCaptor.getAllValues().get(1);
            assertEquals(ParseStatus.SUCCESS, savedResume.getStatus());
            assertEquals("{}", savedResume.getParseResult());
        }
    }
}
