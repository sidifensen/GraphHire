package com.graphhire.admin.infrastructure.persistence.repository;

import com.graphhire.admin.domain.repository.AdminRepository;
import com.graphhire.admin.infrastructure.persistence.mapper.AdminMapper;
import com.graphhire.admin.infrastructure.persistence.po.AdminPO;
import com.graphhire.job.infrastructure.persistence.mapper.JobMapper;
import com.graphhire.job.infrastructure.persistence.po.JobPO;
import com.graphhire.match.infrastructure.persistence.mapper.MatchRecordMapper;
import com.graphhire.match.infrastructure.persistence.po.MatchRecordPO;
import com.graphhire.resume.infrastructure.persistence.mapper.ResumeMapper;
import com.graphhire.resume.infrastructure.persistence.po.ResumePO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
class AdminRepositoryImplTest {

    @MockBean
    private AdminMapper adminMapper;

    @MockBean
    private ResumeMapper resumeMapper;

    @MockBean
    private JobMapper jobMapper;

    @MockBean
    private MatchRecordMapper matchRecordMapper;

    @Autowired
    private AdminRepository adminRepository;

    @Nested
    @DisplayName("统计用户测试")
    class CountUsersTests {

        @Test
        @DisplayName("统计个人用户数量")
        void countPersons_ReturnsCorrectCount() {
            when(adminMapper.selectCount(any())).thenReturn(10L);
            long count = adminRepository.countPersons();
            assertEquals(10L, count);
        }

        @Test
        @DisplayName("统计企业用户数量")
        void countCompanies_ReturnsCorrectCount() {
            when(adminMapper.selectCount(any())).thenReturn(5L);
            long count = adminRepository.countCompanies();
            assertEquals(5L, count);
        }
    }

    @Nested
    @DisplayName("统计业务数据测试")
    class CountBusinessDataTests {

        @Test
        @DisplayName("统计简历数量")
        void countResumes_ReturnsCorrectCount() {
            when(resumeMapper.selectCount(null)).thenReturn(20L);
            long count = adminRepository.countResumes();
            assertEquals(20L, count);
        }

        @Test
        @DisplayName("统计已发布职位数量")
        void countPublishedJobs_ReturnsCorrectCount() {
            when(jobMapper.selectCount(any())).thenReturn(15L);
            long count = adminRepository.countPublishedJobs();
            assertEquals(15L, count);
        }

        @Test
        @DisplayName("统计匹配记录数量")
        void countMatchRecords_ReturnsCorrectCount() {
            when(matchRecordMapper.selectCount(null)).thenReturn(100L);
            long count = adminRepository.countMatchRecords();
            assertEquals(100L, count);
        }
    }

    @Nested
    @DisplayName("查找用户测试")
    class FindUserTests {

        @Test
        @DisplayName("根据ID查找用户返回正确的用户ID")
        void findUserIdById_ReturnsCorrectId() {
            Long userId = 123L;
            assertTrue(adminRepository.findUserIdById(userId).isPresent());
            assertEquals(userId, adminRepository.findUserIdById(userId).get());
        }
    }
}