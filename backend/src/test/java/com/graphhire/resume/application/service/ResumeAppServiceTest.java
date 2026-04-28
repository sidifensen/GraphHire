package com.graphhire.resume.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.application.service.dto.ResumePreviewFile;
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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
    @DisplayName("setDefaultResume SUCCESS状态设默认后应发送默认变更消息并更新图谱")
    void setDefaultResume_shouldSendDefaultChangedMessageWhenSuccess() {
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
        verify(matchAppService).clearOldMatchDataForResume(31L);
        verify(matchAppService).clearOldMatchDataForResume(30L);
        verify(mqProducer).sendResumeDefaultChangedMessage(30L);
        verifyNoInteractions(personInfoRepository);
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
