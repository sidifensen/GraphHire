package com.graphhire.resume.application.service;

import com.graphhire.resume.application.service.dto.ResumePreviewFile;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResumeAppServiceTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private ParseTaskRepository parseTaskRepository;

    @Mock
    private RustFSClient rustFSClient;

    private ResumeAppService resumeAppService;

    @BeforeEach
    void setUp() throws Exception {
        resumeAppService = new ResumeAppService();
        setField(resumeAppService, "resumeRepository", resumeRepository);
        setField(resumeAppService, "parseTaskRepository", parseTaskRepository);
        setField(resumeAppService, "rustFSClient", rustFSClient);
    }

    @Test
    @DisplayName("previewResume 当前记录对象不存在时，应回退到同名可用对象")
    void previewResume_shouldFallbackToAvailableFileWhenCurrentMissing() {
        Resume current = buildResume(10L, 4L, "25年简历测试.pdf", "s3://resumes/missing.pdf", "pdf");
        Resume fallback = buildResume(11L, 4L, "25年简历测试.pdf", "s3://resumes/available.pdf", "pdf");
        byte[] expected = "fallback-pdf".getBytes();

        when(resumeRepository.findById(10L)).thenReturn(Optional.of(current));
        when(rustFSClient.download("s3://resumes/missing.pdf"))
                .thenThrow(new RuntimeException("Failed to download file from RustFS: The specified key does not exist."));
        when(resumeRepository.findByUserId(4L)).thenReturn(List.of(current, fallback));
        when(rustFSClient.exists("s3://resumes/available.pdf")).thenReturn(true);
        when(rustFSClient.download("s3://resumes/available.pdf")).thenReturn(expected);

        ResumePreviewFile previewFile = resumeAppService.previewResume(10L, 4L);

        assertArrayEquals(expected, previewFile.getContent());
        assertEquals("25年简历测试.pdf", previewFile.getFileName());
        assertEquals("application/pdf", previewFile.getContentType());
    }

    @Test
    @DisplayName("previewResume 无可用回退对象时，应抛出原始下载异常")
    void previewResume_shouldThrowWhenNoFallbackAvailable() {
        Resume current = buildResume(10L, 4L, "25年简历测试.pdf", "s3://resumes/missing.pdf", "pdf");
        RuntimeException expectedException =
                new RuntimeException("Failed to download file from RustFS: The specified key does not exist.");

        when(resumeRepository.findById(10L)).thenReturn(Optional.of(current));
        when(rustFSClient.download("s3://resumes/missing.pdf")).thenThrow(expectedException);
        when(resumeRepository.findByUserId(4L)).thenReturn(List.of(current));

        RuntimeException actualException =
                assertThrows(RuntimeException.class, () -> resumeAppService.previewResume(10L, 4L));

        assertEquals(expectedException.getMessage(), actualException.getMessage());
        verify(rustFSClient).download("s3://resumes/missing.pdf");
    }

    private Resume buildResume(Long id, Long userId, String fileName, String filePath, String fileType) {
        Resume resume = new Resume();
        resume.setId(id);
        resume.setUserId(userId);
        resume.setFileName(fileName);
        resume.setFilePath(filePath);
        resume.setFileType(fileType);
        return resume;
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(target, value);
    }
}
