package com.graphhire.job.application.service;

import com.graphhire.job.application.command.PublishJobCmd;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.job.infrastructure.mq.JobMQProducer;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobAppServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private JobMQProducer jobMQProducer;

    @Mock
    private SkillTagRepository skillTagRepository;

    @InjectMocks
    private JobAppService jobAppService;

    @Test
    @DisplayName("发布职位时写入发布时间并发送 MQ 事件")
    void publishJob_ShouldSetPublishedAtAndSendMessage() {
        Job job = new Job();
        job.setId(10L);
        job.setCompanyId(1L);
        job.setTitle("后端工程师");
        job.setStatus(JobStatus.DRAFT);
        job.setSkills(List.of("Java"));

        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobRepository.save(job)).thenReturn(job);

        Job published = jobAppService.publishJob(10L, null);

        assertEquals(JobStatus.PUBLISHED, published.getStatus());
        assertNotNull(published.getPublishedAt());
        verify(jobRepository).save(job);
        verify(jobMQProducer).sendJobPublishedEvent(job);
    }

    @Test
    @DisplayName("创建职位时拒绝不存在于技能标签库的技能")
    void createJob_ShouldRejectUnknownSkills() {
        SkillTag java = new SkillTag("Java");
        when(skillTagRepository.findByNames(List.of("Java", "Unknown Skill"))).thenReturn(List.of(java));

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> jobAppService.createJob(
                1L,
                "后端工程师",
                "平台研发",
                2,
                Location.of("北京", "海淀", "上地"),
                SalaryRange.of(20000, 40000, "MONTH"),
                List.of("Java", "Unknown Skill"),
                "职位描述"
            )
        );

        assertEquals("存在未在技能标签库中的技能: Unknown Skill", exception.getMessage());
    }

    @Test
    @DisplayName("更新职位时会使用归一化后的技能列表")
    void updateJobInfo_ShouldNormalizeSkillsBeforeSave() {
        Job job = new Job();
        job.setId(20L);
        job.setCompanyId(2L);
        job.setStatus(JobStatus.DRAFT);
        job.setSkills(List.of("Java"));

        SkillTag java = new SkillTag("Java");
        SkillTag spring = new SkillTag("Spring Boot");

        PublishJobCmd cmd = new PublishJobCmd(
            "高级后端工程师",
            "研发",
            3,
            Location.of("上海", "浦东", "张江"),
            SalaryRange.of(25000, 45000, "MONTH"),
            List.of("Java", " Java ", "Spring Boot"),
            "新的职位描述"
        );

        when(jobRepository.findById(20L)).thenReturn(Optional.of(job));
        when(skillTagRepository.findByNames(List.of("Java", "Spring Boot"))).thenReturn(List.of(java, spring));
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Job updated = jobAppService.updateJobInfo(20L, cmd);

        assertEquals(List.of("Java", "Spring Boot"), updated.getSkills());
        verify(jobRepository).save(job);
    }
}
