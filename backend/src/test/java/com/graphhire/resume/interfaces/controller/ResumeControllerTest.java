package com.graphhire.resume.interfaces.controller;

import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.resume.application.service.ResumeAppService;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.interfaces.dto.ResumeVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeControllerTest {

    @Mock
    private ResumeAppService resumeService;

    @InjectMocks
    private ResumeController resumeController;

    @Nested
    @DisplayName("getDetail 测试")
    class GetDetailTests {

        @Test
        @DisplayName("成功获取简历详情")
        void getDetail_Success() {
            // Given
            Long resumeId = 1L;
            ResumeVO mockVo = createResumeVO(resumeId);
            when(resumeService.getDetail(resumeId)).thenReturn(mockVo);

            // When
            Result<ResumeVO> result = resumeController.getDetail(resumeId);

            // Then
            assertEquals(HttpStatus.OK.value(), result.getCode());
            assertNotNull(result.getData());
            assertEquals(resumeId, result.getData().getId());
            assertEquals("resume.pdf", result.getData().getFileName());
            verify(resumeService, times(1)).getDetail(resumeId);
        }

        @Test
        @DisplayName("简历不存在时抛出异常")
        void getDetail_NotFound_ThrowsException() {
            // Given
            Long resumeId = 999L;
            when(resumeService.getDetail(resumeId)).thenThrow(new RuntimeException("简历不存在"));

            // When & Then
            assertThrows(RuntimeException.class, () -> resumeController.getDetail(resumeId));
            verify(resumeService, times(1)).getDetail(resumeId);
        }
    }

    @Nested
    @DisplayName("getList 测试")
    class GetListTests {

        @Test
        @DisplayName("分页查询简历列表成功")
        void getList_Success() {
            // Given
            int page = 1;
            int size = 10;
            ResumeVO vo1 = createResumeVO(1L);
            ResumeVO vo2 = createResumeVO(2L);
            PageResult<ResumeVO> mockPageResult = new PageResult<>(
                Arrays.asList(vo1, vo2), 2L, page, size
            );
            when(resumeService.getList(page, size)).thenReturn(mockPageResult);

            // When
            Result<PageResult<ResumeVO>> result = resumeController.getList(page, size);

            // Then
            assertEquals(HttpStatus.OK.value(), result.getCode());
            assertNotNull(result.getData());
            assertEquals(2, result.getData().getRecords().size());
            assertEquals(2L, result.getData().getTotal());
            verify(resumeService, times(1)).getList(page, size);
        }

        @Test
        @DisplayName("分页参数使用默认值")
        void getList_DefaultPagination() {
            // Given
            int defaultPage = 1;
            int defaultSize = 10;
            PageResult<ResumeVO> mockPageResult = new PageResult<>(
                Arrays.asList(), 0L, defaultPage, defaultSize
            );
            when(resumeService.getList(defaultPage, defaultSize)).thenReturn(mockPageResult);

            // When
            Result<PageResult<ResumeVO>> result = resumeController.getList(defaultPage, defaultSize);

            // Then
            assertEquals(HttpStatus.OK.value(), result.getCode());
            verify(resumeService, times(1)).getList(defaultPage, defaultSize);
        }
    }

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
