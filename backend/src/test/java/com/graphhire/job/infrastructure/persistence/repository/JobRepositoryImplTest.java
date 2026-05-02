package com.graphhire.job.infrastructure.persistence.repository;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.infrastructure.persistence.mapper.JobMapper;
import com.graphhire.job.infrastructure.persistence.po.JobPO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobRepositoryImplTest {

    @Mock
    private JobMapper jobMapper;

    private JobRepositoryImpl repository;

    @BeforeEach
    void setUp() throws Exception {
        repository = new JobRepositoryImpl();
        Field field = JobRepositoryImpl.class.getDeclaredField("jobMapper");
        field.setAccessible(true);
        field.set(repository, jobMapper);
    }

    @Test
    @DisplayName("save should persist description into job column")
    void save_ShouldPersistDescription() {
        Job job = new Job();
        job.setCompanyId(1L);
        job.setTitle("Java开发");
        job.setStatus(JobStatus.DRAFT);
        job.setDescription("负责后端系统开发与维护");

        doAnswer(invocation -> {
            JobPO po = invocation.getArgument(0);
            po.setId(100L);
            assertEquals("负责后端系统开发与维护", po.getDescription());
            return 1;
        }).when(jobMapper).insert(any(JobPO.class));

        Job saved = repository.save(job);

        assertEquals(100L, saved.getId());
        verify(jobMapper).insert(any(JobPO.class));
    }

    @Test
    @DisplayName("save should persist education code and positionTypeId")
    void save_ShouldPersistEducationAndPositionTypeId() {
        Job job = new Job();
        job.setCompanyId(1L);
        job.setTitle("Java开发");
        job.setStatus(JobStatus.DRAFT);
        job.setEducation(3);
        job.setPositionTypeId(100101L);

        doAnswer(invocation -> {
            JobPO po = invocation.getArgument(0);
            po.setId(101L);
            assertEquals(3, po.getEducation());
            assertEquals(100101L, po.getPositionTypeId());
            return 1;
        }).when(jobMapper).insert(any(JobPO.class));

        Job saved = repository.save(job);
        assertEquals(101L, saved.getId());
    }

    @Test
    @DisplayName("findById should map description from job column")
    void findById_ShouldMapDescription() {
        JobPO po = new JobPO();
        po.setId(200L);
        po.setCompanyId(1L);
        po.setTitle("测试工程师");
        po.setStatus(JobStatus.PUBLISHED.toCode());
        po.setDescription("负责测试用例设计和自动化测试");

        when(jobMapper.selectById(200L)).thenReturn(po);

        Optional<Job> result = repository.findById(200L);

        assertTrue(result.isPresent());
        assertEquals("负责测试用例设计和自动化测试", result.get().getDescription());
    }
}
