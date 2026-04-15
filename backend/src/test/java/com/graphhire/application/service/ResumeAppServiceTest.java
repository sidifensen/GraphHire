package com.graphhire.application.service;

import com.graphhire.application.command.ResumeUploadCmd;
import com.graphhire.application.dto.PageResult;
import com.graphhire.application.dto.ResumeDetailResponse;
import com.graphhire.application.dto.ResumeUploadResponse;
import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.model.Resume;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.NotificationRepository;
import com.graphhire.domain.repository.ParseTaskRepository;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.ParseStatus;
import com.graphhire.domain.vo.TaskStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeAppServiceTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private ParseTaskRepository parseTaskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ResumeAppService resumeAppService;

    @Nested
    @DisplayName("简历上传测试")
    class UploadTests {

        @Test
        @DisplayName("成功上传简历")
        void upload_Success() {
            // Given
            Long userId = 1L;
            ResumeUploadCmd cmd = new ResumeUploadCmd();
            cmd.setFileName("resume.pdf");
            cmd.setFilePath("/uploads/resume.pdf");
            cmd.setFileType("pdf");
            cmd.setFileSize(1024000L);

            User user = User.builder()
                    .id(userId)
                    .username("testuser")
                    .build();

            when(userRepository.findByIdOptional(userId)).thenReturn(Optional.of(user));
            when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> {
                Resume resume = invocation.getArgument(0);
                resume.setId(1L);
                return resume;
            });
            when(resumeRepository.countByUserId(userId)).thenReturn(0);
            when(parseTaskRepository.save(any(ParseTask.class))).thenAnswer(invocation -> {
                ParseTask task = invocation.getArgument(0);
                task.setId(1L);
                return task;
            });

            // When
            ResumeUploadResponse response = resumeAppService.upload(userId, cmd);

            // Then
            assertNotNull(response);
            assertEquals(1L, response.getResumeId());
            assertEquals(1L, response.getParseTaskId());
            assertEquals("简历上传成功，解析任务已创建", response.getMessage());
        }

        @Test
        @DisplayName("第一份简历自动设为默认")
        void upload_FirstResume_SetAsDefault() {
            // Given
            Long userId = 1L;
            ResumeUploadCmd cmd = new ResumeUploadCmd();
            cmd.setFileName("resume.pdf");
            cmd.setFilePath("/uploads/resume.pdf");
            cmd.setFileType("pdf");
            cmd.setFileSize(1024000L);

            User user = User.builder().id(userId).build();

            when(userRepository.findByIdOptional(userId)).thenReturn(Optional.of(user));
            when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> {
                Resume resume = invocation.getArgument(0);
                resume.setId(1L);
                return resume;
            });
            when(resumeRepository.countByUserId(userId)).thenReturn(1); // First resume
            when(parseTaskRepository.save(any(ParseTask.class))).thenAnswer(invocation -> {
                ParseTask task = invocation.getArgument(0);
                task.setId(1L);
                return task;
            });

            // When
            resumeAppService.upload(userId, cmd);

            // Then
            ArgumentCaptor<Resume> resumeCaptor = ArgumentCaptor.forClass(Resume.class);
            verify(resumeRepository, times(2)).save(resumeCaptor.capture());
            List<Resume> savedResumes = resumeCaptor.getAllValues();
            assertTrue(savedResumes.get(1).getIsDefault()); // Second save sets isDefault
        }

        @Test
        @DisplayName("用户不存在时上传失败")
        void upload_UserNotFound_ThrowsException() {
            // Given
            Long userId = 999L;
            ResumeUploadCmd cmd = new ResumeUploadCmd();

            when(userRepository.findByIdOptional(userId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> resumeAppService.upload(userId, cmd));
            assertEquals("用户不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("简历详情测试")
    class GetDetailTests {

        @Test
        @DisplayName("成功获取简历详情")
        void getDetail_Success() {
            // Given
            Long resumeId = 1L;
            Long userId = 1L;
            Resume resume = Resume.builder()
                    .id(resumeId)
                    .userId(userId)
                    .fileName("resume.pdf")
                    .fileType("pdf")
                    .parseStatus(ParseStatus.SUCCESS)
                    .parseResult("{}")
                    .confidence(BigDecimal.valueOf(0.95))
                    .isDefault(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            when(resumeRepository.findByIdOptional(resumeId)).thenReturn(Optional.of(resume));

            // When
            ResumeDetailResponse response = resumeAppService.getDetail(resumeId, userId);

            // Then
            assertNotNull(response);
            assertEquals(resumeId, response.getId());
        }

        @Test
        @DisplayName("无权限查看简历时抛出异常")
        void getDetail_NoPermission_ThrowsException() {
            // Given
            Long resumeId = 1L;
            Long userId = 999L; // Different user
            Resume resume = Resume.builder()
                    .id(resumeId)
                    .userId(1L)
                    .build();

            when(resumeRepository.findByIdOptional(resumeId)).thenReturn(Optional.of(resume));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> resumeAppService.getDetail(resumeId, userId));
            assertEquals("无权限查看此简历", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("设置默认简历测试")
    class SetDefaultTests {

        @Test
        @DisplayName("成功设置默认简历")
        void setDefault_Success() {
            // Given
            Long resumeId = 1L;
            Long userId = 1L;
            Resume targetResume = Resume.builder()
                    .id(resumeId)
                    .userId(userId)
                    .isDefault(false)
                    .build();
            Resume otherResume = Resume.builder()
                    .id(2L)
                    .userId(userId)
                    .isDefault(true)
                    .build();

            when(resumeRepository.findByIdOptional(resumeId)).thenReturn(Optional.of(targetResume));
            when(resumeRepository.findByUserId(userId)).thenReturn(Arrays.asList(targetResume, otherResume));
            when(resumeRepository.save(any(Resume.class))).thenReturn(null);

            // When
            resumeAppService.setDefault(resumeId, userId);

            // Then
            verify(resumeRepository, times(2)).save(any(Resume.class));
        }

        @Test
        @DisplayName("无权限操作简历时抛出异常")
        void setDefault_NoPermission_ThrowsException() {
            // Given
            Long resumeId = 1L;
            Long userId = 999L;
            Resume resume = Resume.builder()
                    .id(resumeId)
                    .userId(1L)
                    .build();

            when(resumeRepository.findByIdOptional(resumeId)).thenReturn(Optional.of(resume));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> resumeAppService.setDefault(resumeId, userId));
            assertEquals("无权限操作此简历", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("删除简历测试")
    class DeleteTests {

        @Test
        @DisplayName("成功删除简历")
        void delete_Success() {
            // Given
            Long resumeId = 1L;
            Long userId = 1L;
            Resume resume = Resume.builder()
                    .id(resumeId)
                    .userId(userId)
                    .build();
            List<ParseTask> tasks = Arrays.asList(
                    ParseTask.builder().id(1L).resumeId(resumeId).build()
            );

            when(resumeRepository.findByIdOptional(resumeId)).thenReturn(Optional.of(resume));
            when(parseTaskRepository.findByResumeId(resumeId)).thenReturn(tasks);
            doNothing().when(parseTaskRepository).delete(anyLong());
            doNothing().when(resumeRepository).delete(resumeId);

            // When
            resumeAppService.delete(resumeId, userId);

            // Then
            verify(parseTaskRepository).delete(1L);
            verify(resumeRepository).delete(resumeId);
        }

        @Test
        @DisplayName("无权限删除简历时抛出异常")
        void delete_NoPermission_ThrowsException() {
            // Given
            Long resumeId = 1L;
            Long userId = 999L;
            Resume resume = Resume.builder()
                    .id(resumeId)
                    .userId(1L)
                    .build();

            when(resumeRepository.findByIdOptional(resumeId)).thenReturn(Optional.of(resume));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> resumeAppService.delete(resumeId, userId));
            assertEquals("无权限删除此简历", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("简历列表测试")
    class ListTests {

        @Test
        @DisplayName("分页查询简历列表成功")
        void list_Success() {
            // Given
            Long userId = 1L;
            Integer page = 1;
            Integer pageSize = 10;
            List<Resume> resumes = Arrays.asList(
                    Resume.builder().id(1L).fileName("resume1.pdf").build()
            );

            when(resumeRepository.findByUserId(userId, page, pageSize)).thenReturn(resumes);
            when(resumeRepository.countByUserId(userId)).thenReturn(1);

            // When
            PageResult<Resume> result = resumeAppService.list(userId, page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(1, result.getRecords().size());
            assertEquals(1L, result.getTotal());
        }
    }
}
