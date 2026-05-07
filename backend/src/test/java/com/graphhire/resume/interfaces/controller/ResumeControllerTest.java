package com.graphhire.resume.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.resume.application.command.UploadResumeCmd;
import com.graphhire.resume.application.service.ResumeAppService;
import com.graphhire.resume.application.service.dto.ResumePreviewFile;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.interfaces.dto.ResumeVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * ResumeController 单元测试
 * 测试简历管理接口：上传、查询、删除、设置默认、解析等操作
 */
@ExtendWith(MockitoExtension.class)
class ResumeControllerTest {

    @Mock
    private ResumeAppService resumeAppService;

    @InjectMocks
    private ResumeController resumeController;

    private MockMvcSetup mockMvcSetup;

    @BeforeEach
    void setUp() {
        mockMvcSetup = new MockMvcSetup();
    }

    /**
     * 辅助类：管理 Sa-Token Mock 状态
     */
    class MockMvcSetup implements AutoCloseable {
        private MockedStatic<StpUtil> stpUtilMock;

        void mockStpUtilLogin(Long userId) {
            stpUtilMock = mockStatic(StpUtil.class);
            stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
        }

        @Override
        public void close() {
            if (stpUtilMock != null) {
                stpUtilMock.close();
            }
        }
    }

    @Nested
    @DisplayName("上传简历测试")
    class UploadResumeTests {

        @Test
        @DisplayName("成功上传简历")
        void uploadResume_Success() throws Exception {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                MockMultipartFile file = new MockMultipartFile(
                    "file", "resume.pdf", "application/pdf", "content".getBytes()
                );

                Resume savedResume = createResume(1L, userId);
                when(resumeAppService.uploadResume(any(UploadResumeCmd.class), eq(true))).thenReturn(savedResume);

                // When
                Result<Resume> result = resumeController.uploadResume(file, true);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertNotNull(result.getData());
                assertEquals(1L, result.getData().getId());
                verify(resumeAppService).uploadResume(any(UploadResumeCmd.class), eq(true));
            }
        }

        @Test
        @DisplayName("上传简历时获取用户ID失败")
        void uploadResume_GetUserIdFailed() throws Exception {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                stpUtilMock.when(StpUtil::getLoginIdAsLong)
                    .thenThrow(new RuntimeException("User not logged in"));

                MockMultipartFile file = new MockMultipartFile(
                    "file", "resume.pdf", "application/pdf", "content".getBytes()
                );

                // When & Then
                assertThrows(RuntimeException.class, () -> resumeController.uploadResume(file, true));
            }
        }
    }

    @Nested
    @DisplayName("获取当前用户简历列表测试")
    class GetMyResumesTests {

        @Test
        @DisplayName("成功获取简历列表")
        void getMyResumes_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                Resume resume1 = createResume(1L, userId);
                Resume resume2 = createResume(2L, userId);
                when(resumeAppService.getResumesByUserId(userId)).thenReturn(Arrays.asList(resume1, resume2));

                // When
                Result<List<Resume>> result = resumeController.getMyResumes();

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertEquals(2, result.getData().size());
                verify(resumeAppService).getResumesByUserId(userId);
            }
        }

        @Test
        @DisplayName("用户无简历时返回空列表")
        void getMyResumes_EmptyList() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(resumeAppService.getResumesByUserId(userId)).thenReturn(Arrays.asList());

                // When
                Result<List<Resume>> result = resumeController.getMyResumes();

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertTrue(result.getData().isEmpty());
            }
        }
    }

    @Nested
    @DisplayName("获取简历详情测试")
    class GetDetailTests {

        @Test
        @DisplayName("成功获取简历详情")
        void getDetail_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long resumeId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                Resume resume = createResume(resumeId, userId);
                when(resumeAppService.getResumeDetail(resumeId, userId)).thenReturn(resume);

                // When
                Result<Resume> result = resumeController.getDetail(resumeId);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertEquals(resumeId, result.getData().getId());
            }
        }

        @Test
        @DisplayName("无权查看他人简历时抛出异常")
        void getDetail_NoPermission_ThrowsException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long resumeId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                when(resumeAppService.getResumeDetail(resumeId, userId))
                    .thenThrow(new RuntimeException("无权查看此简历"));

                // When & Then
                assertThrows(RuntimeException.class, () -> resumeController.getDetail(resumeId));
            }
        }
    }

    @Nested
    @DisplayName("删除简历测试")
    class DeleteResumeTests {

        @Test
        @DisplayName("成功删除简历")
        void deleteResume_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long resumeId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                doNothing().when(resumeAppService).deleteResume(resumeId, userId);

                // When
                Result<Void> result = resumeController.deleteResume(resumeId);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(resumeAppService).deleteResume(resumeId, userId);
            }
        }

        @Test
        @DisplayName("删除他人简历时抛出异常")
        void deleteResume_NoPermission_ThrowsException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long resumeId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                doThrow(new RuntimeException("无权删除此简历"))
                    .when(resumeAppService).deleteResume(resumeId, userId);

                // When & Then
                assertThrows(RuntimeException.class, () -> resumeController.deleteResume(resumeId));
            }
        }
    }

    @Nested
    @DisplayName("设置默认简历测试")
    class SetDefaultResumeTests {

        @Test
        @DisplayName("成功设置默认简历")
        void setDefaultResume_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long resumeId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                doNothing().when(resumeAppService).setDefaultResume(resumeId, userId, false, true);

                // When
                Result<Void> result = resumeController.setDefaultResume(resumeId, false, true);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(resumeAppService).setDefaultResume(resumeId, userId, false, true);
            }
        }

        @Test
        @DisplayName("设置他人简历为默认时抛出异常")
        void setDefaultResume_NoPermission_ThrowsException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long resumeId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                doThrow(new RuntimeException("无权设置此简历"))
                    .when(resumeAppService).setDefaultResume(resumeId, userId, true, false);

                // When & Then
                assertThrows(RuntimeException.class, () -> resumeController.setDefaultResume(resumeId, true, false));
            }
        }
    }

    @Nested
    @DisplayName("预览简历测试")
    class PreviewResumeTests {

        @Test
        @DisplayName("成功预览简历文件")
        void previewResume_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                Long userId = 1L;
                Long resumeId = 10L;
                byte[] content = "PDF-CONTENT".getBytes();
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                ResumePreviewFile previewFile = new ResumePreviewFile(content, "resume.pdf", "application/pdf");
                when(resumeAppService.previewResume(resumeId, userId)).thenReturn(previewFile);

                ResponseEntity<byte[]> response = resumeController.previewResume(resumeId);

                assertNotNull(response);
                assertEquals(200, response.getStatusCode().value());
                assertArrayEquals(content, response.getBody());
                assertNotNull(response.getHeaders().getContentType());
                assertEquals("application/pdf", response.getHeaders().getContentType().toString());
                assertNotNull(response.getHeaders().getContentDisposition());
                assertEquals("inline", response.getHeaders().getContentDisposition().getType());
                verify(resumeAppService).previewResume(resumeId, userId);
            }
        }
    }

    @Nested
    @DisplayName("重新解析简历测试")
    class ParseResumeTests {

        @Test
        @DisplayName("成功触发简历解析")
        void parseResume_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long resumeId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                doNothing().when(resumeAppService).triggerResumeParse(resumeId, userId, true);

                // When
                Result<Void> result = resumeController.parseResume(resumeId, true);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(resumeAppService).triggerResumeParse(resumeId, userId, true);
            }
        }

        @Test
        @DisplayName("解析他人简历时抛出异常")
        void parseResume_NoPermission_ThrowsException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long resumeId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                doThrow(new RuntimeException("无权解析此简历"))
                    .when(resumeAppService).triggerResumeParse(resumeId, userId, false);

                // When & Then
                assertThrows(RuntimeException.class, () -> resumeController.parseResume(resumeId, false));
            }
        }
    }

    @Nested
    @DisplayName("获取简历列表测试（管理员）")
    class GetListTests {

        @Test
        @DisplayName("分页查询简历列表成功")
        void getList_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                int page = 1;
                int size = 10;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                ResumeVO vo1 = createResumeVO(1L);
                ResumeVO vo2 = createResumeVO(2L);
                PageResult<ResumeVO> mockPageResult = new PageResult<>(
                    Arrays.asList(vo1, vo2), 2L, page, size
                );
                when(resumeAppService.getList(userId, page, size)).thenReturn(mockPageResult);

                // When
                Result<PageResult<ResumeVO>> result = resumeController.getList(page, size);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertNotNull(result.getData());
                assertEquals(2, result.getData().getRecords().size());
                assertEquals(2L, result.getData().getTotal());
                verify(resumeAppService).getList(userId, page, size);
            }
        }

        @Test
        @DisplayName("分页参数使用默认值")
        void getList_DefaultPagination() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                int defaultPage = 1;
                int defaultSize = 10;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                PageResult<ResumeVO> mockPageResult = new PageResult<>(
                    Arrays.asList(), 0L, defaultPage, defaultSize
                );
                when(resumeAppService.getList(userId, defaultPage, defaultSize)).thenReturn(mockPageResult);

                // When
                Result<PageResult<ResumeVO>> result = resumeController.getList(defaultPage, defaultSize);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(resumeAppService).getList(userId, defaultPage, defaultSize);
            }
        }
    }

    /**
     * 创建测试用 Resume 对象
     */
    private Resume createResume(Long id, Long userId) {
        Resume resume = new Resume();
        resume.setId(id);
        resume.setUserId(userId);
        resume.setFileName("resume.pdf");
        resume.setFilePath("/uploads/" + id + "/resume.pdf");
        resume.setFileType("application/pdf");
        resume.setFileSize(1024L);
        resume.setStatus(ParseStatus.SUCCESS);
        resume.setParseResult("{\"name\":\"张三\"}");
        resume.setConfidence(new BigDecimal("0.95"));
        resume.setIsDefault(true);
        return resume;
    }

    /**
     * 创建测试用 ResumeVO 对象
     */
    private ResumeVO createResumeVO(Long id) {
        ResumeVO vo = new ResumeVO();
        vo.setId(id);
        vo.setUserId(1L);
        vo.setFileName("resume.pdf");
        vo.setFileType("pdf");
        vo.setFileSize(1024L);
        vo.setParseStatus(2); // SUCCESS
        vo.setParseResult("{\"name\":\"张三\"}");
        vo.setConfidence(new BigDecimal("0.95"));
        vo.setIsDefault(true);
        return vo;
    }
}
