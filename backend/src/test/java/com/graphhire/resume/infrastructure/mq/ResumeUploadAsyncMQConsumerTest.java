package com.graphhire.resume.infrastructure.mq;

import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.model.UploadTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.repository.UploadTaskRepository;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeUploadAsyncMQConsumerTest {

    @Mock
    private UploadTaskRepository uploadTaskRepository;
    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private ParseTaskRepository parseTaskRepository;
    @Mock
    private RustFSClient rustFSClient;
    @Mock
    private ResumeMQProducer resumeMQProducer;

    @InjectMocks
    private ResumeUploadAsyncMQConsumer consumer;

    @Test
    @DisplayName("异步上传任务成功时应落简历和解析任务并推进状态")
    void onMessage_shouldProcessSuccessFlow() {
        UploadTask task = new UploadTask();
        task.setId(1L);
        task.setUserId(10L);
        task.setStatus(UploadTask.TaskStatus.PENDING);
        task.setRefreshAllMatches(true);
        when(uploadTaskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(rustFSClient.upload(any(byte[].class), anyString())).thenReturn("s3://resumes/ok.pdf");
        when(resumeRepository.findByUserId(10L)).thenReturn(java.util.List.of());
        when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> {
            Resume resume = invocation.getArgument(0);
            resume.setId(99L);
            return resume;
        });
        when(parseTaskRepository.save(any(ParseTask.class))).thenAnswer(invocation -> {
            ParseTask parseTask = invocation.getArgument(0);
            parseTask.setId(199L);
            return parseTask;
        });
        when(uploadTaskRepository.save(any(UploadTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String payload = """
            {"taskId":1,"userId":10,"fileName":"resume.pdf","contentType":"application/pdf","fileSize":123,"fileBase64":"aGVsbG8=","refreshAllMatches":true}
            """;
        consumer.onMessage(payload);

        verify(rustFSClient).upload(any(byte[].class), eq("resume.pdf"));
        verify(parseTaskRepository).save(any(ParseTask.class));
        verify(resumeMQProducer).sendResumeParseMessage(99L, 199L, true);

        ArgumentCaptor<UploadTask> taskCaptor = ArgumentCaptor.forClass(UploadTask.class);
        verify(uploadTaskRepository, atLeast(3)).save(taskCaptor.capture());
        UploadTask last = taskCaptor.getValue();
        assertEquals(UploadTask.TaskStatus.PARSE_PENDING, last.getStatus());
        assertEquals(99L, last.getResumeId());
    }

    @Test
    @DisplayName("异步上传任务失败时应标记FAILED并保存错误信息")
    void onMessage_shouldMarkFailedWhenException() {
        UploadTask task = new UploadTask();
        task.setId(2L);
        task.setUserId(11L);
        task.setStatus(UploadTask.TaskStatus.PENDING);
        when(uploadTaskRepository.findById(2L)).thenReturn(Optional.of(task));
        when(rustFSClient.upload(any(byte[].class), anyString())).thenThrow(new RuntimeException("mock upload error"));
        when(uploadTaskRepository.save(any(UploadTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String payload = """
            {"taskId":2,"userId":11,"fileName":"resume.pdf","contentType":"application/pdf","fileSize":123,"fileBase64":"aGVsbG8=","refreshAllMatches":false}
            """;
        consumer.onMessage(payload);

        ArgumentCaptor<UploadTask> taskCaptor = ArgumentCaptor.forClass(UploadTask.class);
        verify(uploadTaskRepository, atLeast(2)).save(taskCaptor.capture());
        UploadTask last = taskCaptor.getValue();
        assertEquals(UploadTask.TaskStatus.FAILED, last.getStatus());
    }

    @Test
    @DisplayName("找不到上传任务时应抛出异常")
    void onMessage_shouldThrowWhenTaskNotFound() {
        when(uploadTaskRepository.findById(3L)).thenReturn(Optional.empty());

        String payload = """
            {"taskId":3,"userId":11,"fileName":"resume.pdf","contentType":"application/pdf","fileSize":123,"fileBase64":"aGVsbG8=","refreshAllMatches":false}
            """;
        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> consumer.onMessage(payload));
        org.junit.jupiter.api.Assertions.assertTrue(ex.getMessage().contains("Upload task not found"));
    }
}
