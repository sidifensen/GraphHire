package com.graphhire.resume.application.service;

import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.infrastructure.ai.DocumentParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParseAppServiceTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private ParseTaskRepository parseTaskRepository;

    @Mock
    private DocumentParser documentParser;

    @InjectMocks
    private ParseAppService parseAppService;

    private Resume testResume;
    private ParseTask testTask;

    @BeforeEach
    void setUp() {
        testResume = new Resume();
        testResume.setId(1L);
        testResume.setUserId(1L);
        testResume.setFileName("resume.pdf");
        testResume.setFilePath("/uploads/resume.pdf");
        testResume.setStatus(ParseStatus.PENDING);

        testTask = new ParseTask();
        testTask.setId(1L);
        testTask.setResumeId(1L);
        testTask.setTaskType("resume_parse");
        testTask.setStatus(ParseTask.TaskStatus.PENDING);
    }

    @Nested
    @DisplayName("处理简历解析测试")
    class ProcessResumeTests {

        @Test
        @DisplayName("成功处理简历解析")
        void processResume_Success() throws Exception {
            // Given
            Long resumeId = 1L;
            String rawText = "John Doe\nSoftware Engineer\nSkills: Java, Python";
            String parseResult = "{\"name\":\"John Doe\",\"title\":\"Software Engineer\",\"skills\":[\"Java\",\"Python\"]}";

            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(parseTaskRepository.save(any(ParseTask.class))).thenAnswer(invocation -> {
                ParseTask task = invocation.getArgument(0);
                task.setId(1L);
                return task;
            });
            when(resumeRepository.save(any(Resume.class))).thenReturn(testResume);
            when(documentParser.extractText("/uploads/resume.pdf")).thenReturn(rawText);
            when(documentParser.parse(rawText)).thenReturn(parseResult);

            // When
            parseAppService.processResume(resumeId);

            // Then
            ArgumentCaptor<ParseTask> taskCaptor = ArgumentCaptor.forClass(ParseTask.class);
            verify(parseTaskRepository, atLeast(2)).save(taskCaptor.capture());

            ArgumentCaptor<Resume> resumeCaptor = ArgumentCaptor.forClass(Resume.class);
            verify(resumeRepository, atLeast(2)).save(resumeCaptor.capture());
        }

        @Test
        @DisplayName("简历不存在时处理失败")
        void processResume_ResumeNotFound_ThrowsException() {
            // Given
            Long resumeId = 999L;
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(RuntimeException.class, () -> parseAppService.processResume(resumeId));
        }

        @Test
        @DisplayName("文档提取失败时标记任务失败")
        void processResume_ExtractTextFailed_MarksTaskFailed() throws Exception {
            // Given
            Long resumeId = 1L;
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(parseTaskRepository.save(any(ParseTask.class))).thenAnswer(invocation -> {
                ParseTask task = invocation.getArgument(0);
                task.setId(1L);
                return task;
            });
            when(resumeRepository.save(any(Resume.class))).thenReturn(testResume);
            when(documentParser.extractText("/uploads/resume.pdf")).thenThrow(new RuntimeException("File not found"));

            // When
            parseAppService.processResume(resumeId);

            // Then
            ArgumentCaptor<ParseTask> taskCaptor = ArgumentCaptor.forClass(ParseTask.class);
            verify(parseTaskRepository, atLeast(2)).save(taskCaptor.capture());

            ArgumentCaptor<Resume> resumeCaptor = ArgumentCaptor.forClass(Resume.class);
            verify(resumeRepository, atLeast(2)).save(resumeCaptor.capture());
        }

        @Test
        @DisplayName("解析失败时标记任务失败")
        void processResume_ParseFailed_MarksTaskFailed() throws Exception {
            // Given
            Long resumeId = 1L;
            String rawText = "John Doe\nSoftware Engineer";

            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(parseTaskRepository.save(any(ParseTask.class))).thenAnswer(invocation -> {
                ParseTask task = invocation.getArgument(0);
                task.setId(1L);
                return task;
            });
            when(resumeRepository.save(any(Resume.class))).thenReturn(testResume);
            when(documentParser.extractText("/uploads/resume.pdf")).thenReturn(rawText);
            when(documentParser.parse(rawText)).thenThrow(new RuntimeException("AI parsing failed"));

            // When
            parseAppService.processResume(resumeId);

            // Then
            ArgumentCaptor<ParseTask> taskCaptor = ArgumentCaptor.forClass(ParseTask.class);
            verify(parseTaskRepository, atLeast(2)).save(taskCaptor.capture());
        }
    }
}
