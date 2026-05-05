package com.graphhire.resume.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.config.UploadProperties;
import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.application.service.dto.ResumePreviewFile;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import com.graphhire.resume.infrastructure.mq.ResumeMQProducer;
import com.graphhire.match.application.service.MatchAppService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.unit.DataSize;

import java.io.InputStream;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.argThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResumeAppServiceTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private ParseTaskRepository parseTaskRepository;

    @Mock
    private RustFSClient rustFSClient;

    @Mock
    private ResumeMQProducer mqProducer;

    @Mock
    private PersonInfoRepository personInfoRepository;

    @Mock
    private GraphBuildService graphBuildService;
    @Mock
    private MatchAppService matchAppService;
    @Mock
    private UploadProperties uploadProperties;

    private ResumeAppService resumeAppService;

    @BeforeEach
    void setUp() throws Exception {
        resumeAppService = new ResumeAppService();
        setField(resumeAppService, "resumeRepository", resumeRepository);
        setField(resumeAppService, "parseTaskRepository", parseTaskRepository);
        setField(resumeAppService, "rustFSClient", rustFSClient);
        setField(resumeAppService, "mqProducer", mqProducer);
        setField(resumeAppService, "personInfoRepository", personInfoRepository);
        setField(resumeAppService, "graphBuildService", graphBuildService);
        setField(resumeAppService, "matchAppService", matchAppService);
        setField(resumeAppService, "uploadProperties", uploadProperties);

        UploadProperties.Resume resumeUpload = new UploadProperties.Resume();
        resumeUpload.setMaxFileSize(DataSize.ofMegabytes(10));
        resumeUpload.setAllowedExtensions(new java.util.LinkedHashSet<>(List.of("pdf", "doc", "docx")));
        resumeUpload.setAllowedMimeTypes(new java.util.LinkedHashSet<>(List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )));
        lenient().when(uploadProperties.getResume()).thenReturn(resumeUpload);
    }

    @Test
    @DisplayName("uploadResume 用户已有3份简历时应拒绝上传")
    void uploadResume_shouldRejectWhenUserAlreadyHasThreeResumes() throws Exception {
        when(resumeRepository.findByUserId(7L)).thenReturn(List.of(new Resume(), new Resume(), new Resume()));
        UploadResumeCmd cmd = new UploadResumeCmd(new MockMultipartFile(
            "file", "test.pdf", "application/pdf", "content".getBytes()
        ));
        cmd.setUserId(7L);

        Exceptions.BusinessException ex = assertThrows(
            Exceptions.BusinessException.class,
            () -> resumeAppService.uploadResume(cmd)
        );

        assertEquals("最多上传3份简历，请先删除旧简历", ex.getMessage());
        verifyNoInteractions(rustFSClient);
    }

    @Test
    @DisplayName("uploadResume 上传非PDF/DOC/DOCX文件时应拒绝")
    void uploadResume_shouldRejectWhenFileTypeNotAllowed() throws Exception {
        when(resumeRepository.findByUserId(8L)).thenReturn(List.of());
        UploadResumeCmd cmd = new UploadResumeCmd(new MockMultipartFile(
            "file", "test.txt", "text/plain", "content".getBytes()
        ));
        cmd.setUserId(8L);

        Exceptions.BusinessException ex = assertThrows(
            Exceptions.BusinessException.class,
            () -> resumeAppService.uploadResume(cmd)
        );

        assertEquals("仅支持上传 PDF、DOC、DOCX 格式的简历", ex.getMessage());
        verifyNoInteractions(rustFSClient);
    }

    @Test
    @DisplayName("uploadResume 文件大小超过限制时应拒绝")
    void uploadResume_shouldRejectWhenFileTooLarge() throws Exception {
        when(resumeRepository.findByUserId(8L)).thenReturn(List.of());
        byte[] large = new byte[1024];
        UploadResumeCmd cmd = new UploadResumeCmd(new MockMultipartFile(
            "file", "test.pdf", "application/pdf", large
        )) {
            @Override
            public long getFileSize() {
                return DataSize.ofMegabytes(11).toBytes();
            }
        };
        cmd.setUserId(8L);

        Exceptions.BusinessException ex = assertThrows(
            Exceptions.BusinessException.class,
            () -> resumeAppService.uploadResume(cmd)
        );

        assertEquals("简历文件超过大小限制，最大支持 10MB", ex.getMessage());
        verifyNoInteractions(rustFSClient);
    }

    @Test
    @DisplayName("uploadResume MIME 类型不合法时应拒绝")
    void uploadResume_shouldRejectWhenMimeTypeNotAllowed() throws Exception {
        when(resumeRepository.findByUserId(8L)).thenReturn(List.of());
        UploadResumeCmd cmd = new UploadResumeCmd(new MockMultipartFile(
            "file", "test.pdf", "application/zip", "content".getBytes()
        ));
        cmd.setUserId(8L);

        Exceptions.BusinessException ex = assertThrows(
            Exceptions.BusinessException.class,
            () -> resumeAppService.uploadResume(cmd)
        );

        assertEquals("简历文件类型不合法，请上传 PDF、DOC、DOCX 文件", ex.getMessage());
        verifyNoInteractions(rustFSClient);
    }

    @Test
    @DisplayName("uploadResume 成功时应以流式上传并记录文件大小")
    void uploadResume_shouldUploadWithStreamAndPersistFileSize() throws Exception {
        when(resumeRepository.findByUserId(8L)).thenReturn(List.of());
        byte[] content = "resume".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "ok.pdf", "application/pdf", content);
        UploadResumeCmd cmd = new UploadResumeCmd(file);
        cmd.setUserId(8L);

        when(rustFSClient.upload(any(InputStream.class), eq((long) content.length), eq("ok.pdf")))
            .thenReturn("s3://resumes/ok.pdf");
        when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> {
            Resume resume = invocation.getArgument(0);
            if (resume.getId() == null) {
                resume.setId(99L);
            }
            return resume;
        });

        resumeAppService.uploadResume(cmd);

        verify(rustFSClient).upload(any(InputStream.class), eq((long) content.length), eq("ok.pdf"));
        verify(resumeRepository, atLeastOnce()).save(argThat(resume -> resume.getFileSize() != null && resume.getFileSize() == content.length));
        verify(parseTaskRepository).save(any(ParseTask.class));
    }

    @Test
    @DisplayName("uploadResume 用户无默认简历时新简历应自动设为默认")
    void uploadResume_shouldAutoSetDefaultWhenNoDefaultExists() throws Exception {
        Resume exists = buildResume(88L, 8L, "old.pdf", "s3://old.pdf", "pdf");
        exists.setIsDefault(false);
        when(resumeRepository.findByUserId(8L)).thenReturn(List.of(exists));

        byte[] content = "resume".getBytes();
        UploadResumeCmd cmd = new UploadResumeCmd(new MockMultipartFile("file", "ok.pdf", "application/pdf", content));
        cmd.setUserId(8L);

        when(rustFSClient.upload(any(InputStream.class), eq((long) content.length), eq("ok.pdf")))
            .thenReturn("s3://resumes/ok.pdf");
        when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> {
            Resume resume = invocation.getArgument(0);
            if (resume.getId() == null) {
                resume.setId(99L);
            }
            return resume;
        });

        resumeAppService.uploadResume(cmd);

        verify(resumeRepository, atLeastOnce()).save(argThat(resume -> Boolean.TRUE.equals(resume.getIsDefault())));
    }

    @Test
    @DisplayName("setDefaultResume 非SUCCESS状态应拒绝")
    void setDefaultResume_shouldRejectWhenStatusNotSuccess() {
        Resume resume = buildResume(20L, 9L, "resume.pdf", "s3://r.pdf", "pdf");
        resume.setStatus(ParseStatus.FAILED);
        when(resumeRepository.findById(20L)).thenReturn(Optional.of(resume));

        Exceptions.BusinessException ex = assertThrows(
            Exceptions.BusinessException.class,
            () -> resumeAppService.setDefaultResume(20L, 9L, false)
        );

        assertEquals("请先解析成功后再设为默认", ex.getMessage());
    }

    @Test
    @DisplayName("setDefaultResume SUCCESS状态设默认后应先重建新默认匹配，再清理旧默认")
    void setDefaultResume_shouldRebuildNewDefaultBeforeClearingOldDefault() {
        Resume resume = buildResume(30L, 9L, "resume.pdf", "s3://r.pdf", "pdf");
        resume.setStatus(ParseStatus.SUCCESS);
        resume.setIsDefault(false);
        Resume oldDefault = buildResume(31L, 9L, "old.pdf", "s3://old.pdf", "pdf");
        oldDefault.setStatus(ParseStatus.SUCCESS);
        oldDefault.setIsDefault(true);
        when(resumeRepository.findById(30L)).thenReturn(Optional.of(resume));
        when(resumeRepository.findByUserId(9L)).thenReturn(List.of(oldDefault, resume));

        resumeAppService.setDefaultResume(30L, 9L, false);

        verify(graphBuildService).buildGraphForResume(resume);
        verify(mqProducer).sendResumeDefaultChangedMessage(30L);
        verifyNoInteractions(personInfoRepository);

        InOrder inOrder = org.mockito.Mockito.inOrder(matchAppService);
        inOrder.verify(matchAppService).triggerMatchForResume(30L);
        inOrder.verify(matchAppService).clearOldMatchDataForResume(31L);
    }

    @Test
    @DisplayName("setDefaultResume 勾选同步个人信息时应强制覆盖个人字段")
    void setDefaultResume_shouldSyncPersonInfoWhenEnabled() {
        Resume resume = buildResume(40L, 10L, "sync.pdf", "s3://sync.pdf", "pdf");
        resume.setStatus(ParseStatus.SUCCESS);
        resume.setIsDefault(false);
        resume.setParseResult("""
            {"name":"李雷","gender":"男","phone":"13900001111","email":"li.lei@example.com","age":"26","education":[{"school":"清华大学","degree":"本科"}]}
            """);
        when(resumeRepository.findById(40L)).thenReturn(Optional.of(resume));
        when(resumeRepository.findByUserId(10L)).thenReturn(List.of(resume));
        when(personInfoRepository.findByUserId(10L)).thenReturn(Optional.empty());

        resumeAppService.setDefaultResume(40L, 10L, true);

        org.mockito.ArgumentCaptor<PersonInfo> captor = org.mockito.ArgumentCaptor.forClass(PersonInfo.class);
        verify(personInfoRepository).save(captor.capture());
        PersonInfo saved = captor.getValue();
        assertEquals("李雷", saved.getRealName());
        assertEquals(1, saved.getGender());
        assertEquals("13900001111", saved.getPhone());
        assertEquals("li.lei@example.com", saved.getEmail());
        assertEquals(26, saved.getAge());
        assertEquals("本科", saved.getEducation());
        assertEquals("清华大学", saved.getSchool());
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
