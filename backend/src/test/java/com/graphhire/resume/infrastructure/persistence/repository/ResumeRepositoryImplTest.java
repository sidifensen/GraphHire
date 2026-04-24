package com.graphhire.resume.infrastructure.persistence.repository;

import cn.hutool.json.JSONUtil;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.infrastructure.persistence.mapper.ResumeMapper;
import com.graphhire.resume.infrastructure.persistence.po.ResumePO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
class ResumeRepositoryImplTest {

    @MockBean
    private ResumeMapper resumeMapper;

    @MockBean
    private JavaMailSender javaMailSender;

    @Autowired
    private ResumeRepository resumeRepository;

    @Nested
    @DisplayName("findById 测试")
    class FindByIdTests {

        @Test
        @DisplayName("根据ID查找返回正确的简历信息")
        void findById_ReturnsCorrectResume() {
            Long id = 1L;
            ResumePO po = createResumePO(id);
            when(resumeMapper.selectById(id)).thenReturn(po);

            Optional<Resume> result = resumeRepository.findById(id);

            assertTrue(result.isPresent());
            assertEquals(id, result.get().getId());
            assertEquals(123L, result.get().getUserId());
            assertEquals("resume.pdf", result.get().getFileName());
            assertEquals("/path/to/resume.pdf", result.get().getFilePath());
            assertEquals("pdf", result.get().getFileType());
            assertEquals(1024L, result.get().getFileSize());
            assertEquals(ParseStatus.SUCCESS, result.get().getStatus());
            assertEquals("{\"name\":\"张三\"}", result.get().getParseResult());
            assertEquals("No error", result.get().getParseError());
            assertEquals(new BigDecimal("0.95"), result.get().getConfidence());
            assertEquals(true, result.get().getIsDefault());
            assertEquals(LocalDateTime.of(2026, 4, 22, 11, 35, 36), result.get().getCreateTime());
            assertEquals(LocalDateTime.of(2026, 4, 22, 11, 36, 0), result.get().getUpdateTime());
        }

        @Test
        @DisplayName("根据不存在的ID查找返回空")
        void findById_ReturnsEmpty_WhenNotFound() {
            Long id = 999L;
            when(resumeMapper.selectById(id)).thenReturn(null);

            Optional<Resume> result = resumeRepository.findById(id);

            assertFalse(result.isPresent());
        }
    }

    @Nested
    @DisplayName("save 测试")
    class SaveTests {

        @Test
        @DisplayName("保存新的简历")
        void save_NewResume_InsertsSuccessfully() {
            Resume resume = createResume(null);
            doAnswer(invocation -> {
                ResumePO arg = invocation.getArgument(0);
                arg.setId(1L);
                return 1;
            }).when(resumeMapper).insert(any(ResumePO.class));

            Resume result = resumeRepository.save(resume);

            assertNotNull(result);
            assertEquals(1L, result.getId());
            verify(resumeMapper, times(1)).insert(any(ResumePO.class));
        }

        @Test
        @DisplayName("更新已有的简历")
        void save_ExistingResume_UpdatesSuccessfully() {
            Resume resume = createResume(1L);
            when(resumeMapper.updateById(any(ResumePO.class))).thenReturn(1);

            Resume result = resumeRepository.save(resume);

            assertNotNull(result);
            verify(resumeMapper, times(1)).updateById(any(ResumePO.class));
        }
    }

    @Nested
    @DisplayName("delete 测试")
    class DeleteTests {

        @Test
        @DisplayName("删除简历")
        void delete_Resume_DeletesSuccessfully() {
            Resume resume = createResume(1L);
            when(resumeMapper.deleteById(1L)).thenReturn(1);

            resumeRepository.delete(resume);

            verify(resumeMapper, times(1)).deleteById(1L);
        }
    }

    private Resume createResume(Long id) {
        Resume resume = new Resume();
        resume.setId(id);
        resume.setUserId(123L);
        resume.setFileName("resume.pdf");
        resume.setFilePath("/path/to/resume.pdf");
        resume.setFileType("pdf");
        resume.setFileSize(1024L);
        resume.setStatus(ParseStatus.SUCCESS);
        resume.setParseResult("{\"name\":\"张三\"}");
        resume.setParseError("No error");
        resume.setConfidence(new BigDecimal("0.95"));
        resume.setIsDefault(true);
        return resume;
    }

    private ResumePO createResumePO(Long id) {
        ResumePO po = new ResumePO();
        po.setId(id);
        po.setUserId(123L);
        po.setFileName("resume.pdf");
        po.setFilePath("/path/to/resume.pdf");
        po.setFileType("pdf");
        po.setFileSize(1024L);
        po.setParseStatus(2); // SUCCESS
        po.setParseResult(JSONUtil.parseObj("{\"name\":\"张三\"}"));
        po.setParseError("No error");
        po.setConfidence(0.95);
        po.setIsDefault(1);
        po.setCreateTime(LocalDateTime.of(2026, 4, 22, 11, 35, 36));
        po.setUpdateTime(LocalDateTime.of(2026, 4, 22, 11, 36, 0));
        return po;
    }
}
