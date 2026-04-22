package com.graphhire.job.infrastructure.persistence.repository;

import com.graphhire.job.domain.model.JobSkill;
import com.graphhire.job.infrastructure.persistence.mapper.JobSkillMapper;
import com.graphhire.job.infrastructure.persistence.po.JobSkillPO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobSkillRepositoryImplTest {

    @Mock
    private JobSkillMapper jobSkillMapper;

    @InjectMocks
    private JobSkillRepositoryImpl jobSkillRepository;

    @Nested
    @DisplayName("findByJobId tests")
    class FindByJobIdTests {

        @Test
        @DisplayName("Should return list of JobSkills when found")
        void findByJobId_WhenExists_ReturnsJobSkills() {
            // Given
            Long jobId = 1L;
            List<JobSkillPO> pos = Arrays.asList(
                createJobSkillPO(1L, jobId, 10L, true, new BigDecimal("0.9")),
                createJobSkillPO(2L, jobId, 20L, false, new BigDecimal("0.5"))
            );
            when(jobSkillMapper.selectList(any())).thenReturn(pos);

            // When
            List<JobSkill> result = jobSkillRepository.findByJobId(jobId);

            // Then
            assertEquals(2, result.size());
            assertEquals(jobId, result.get(0).getJobId());
            assertEquals(10L, result.get(0).getSkillTagId());
            assertTrue(result.get(0).getIsRequired());
        }

        @Test
        @DisplayName("Should return empty list when no JobSkills found")
        void findByJobId_WhenNotExists_ReturnsEmptyList() {
            // Given
            Long jobId = 999L;
            when(jobSkillMapper.selectList(any())).thenReturn(Collections.emptyList());

            // When
            List<JobSkill> result = jobSkillRepository.findByJobId(jobId);

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("findBySkillTagId tests")
    class FindBySkillTagIdTests {

        @Test
        @DisplayName("Should return list of JobSkills when found")
        void findBySkillTagId_WhenExists_ReturnsJobSkills() {
            // Given
            Long skillTagId = 10L;
            List<JobSkillPO> pos = Arrays.asList(
                createJobSkillPO(1L, 1L, skillTagId, true, new BigDecimal("0.9")),
                createJobSkillPO(2L, 2L, skillTagId, false, new BigDecimal("0.7"))
            );
            when(jobSkillMapper.selectList(any())).thenReturn(pos);

            // When
            List<JobSkill> result = jobSkillRepository.findBySkillTagId(skillTagId);

            // Then
            assertEquals(2, result.size());
            assertEquals(skillTagId, result.get(0).getSkillTagId());
        }
    }

    @Nested
    @DisplayName("save tests")
    class SaveTests {

        @Test
        @DisplayName("Should insert new JobSkill when id is null")
        void save_WhenNew_InsertsAndSetsId() {
            // Given
            JobSkill jobSkill = new JobSkill();
            jobSkill.setJobId(1L);
            jobSkill.setSkillTagId(10L);
            jobSkill.setIsRequired(true);
            jobSkill.setWeight(new BigDecimal("0.8"));

            // 模拟 MyBatis-Plus AUTO strategy 的 ID 回填行为
            doAnswer(invocation -> {
                JobSkillPO po = invocation.getArgument(0);
                po.setId(1L);
                return 1;
            }).when(jobSkillMapper).insert(any(JobSkillPO.class));

            // When
            JobSkill result = jobSkillRepository.save(jobSkill);

            // Then
            assertNotNull(result.getId());
            assertEquals(1L, result.getId());
            verify(jobSkillMapper).insert(any(JobSkillPO.class));
        }

        @Test
        @DisplayName("Should update existing JobSkill when id is not null")
        void save_WhenExisting_Updates() {
            // Given
            JobSkill jobSkill = new JobSkill();
            jobSkill.setId(1L);
            jobSkill.setJobId(1L);
            jobSkill.setSkillTagId(10L);
            jobSkill.setIsRequired(true);
            jobSkill.setWeight(new BigDecimal("0.9"));

            // When
            JobSkill result = jobSkillRepository.save(jobSkill);

            // Then
            assertEquals(1L, result.getId());
            verify(jobSkillMapper).updateById(any(JobSkillPO.class));
        }
    }

    @Nested
    @DisplayName("deleteByJobId tests")
    class DeleteByJobIdTests {

        @Test
        @DisplayName("Should delete all JobSkills for job")
        void deleteByJobId_DeletesAllMatching() {
            // Given
            Long jobId = 1L;

            // When
            jobSkillRepository.deleteByJobId(jobId);

            // Then
            verify(jobSkillMapper).delete(any());
        }
    }

    private JobSkillPO createJobSkillPO(Long id, Long jobId, Long skillTagId, Boolean isRequired, BigDecimal weight) {
        JobSkillPO po = new JobSkillPO();
        po.setId(id);
        po.setJobId(jobId);
        po.setSkillTagId(skillTagId);
        po.setIsRequired(isRequired);
        po.setWeight(weight);
        return po;
    }
}