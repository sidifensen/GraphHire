package com.graphhire.job.infrastructure.mq;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.model.JobSkill;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.repository.JobSkillRepository;
import com.graphhire.job.domain.vo.ParseStatus;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.infrastructure.ai.DocumentParser;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobParseMQConsumerTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private JobSkillRepository jobSkillRepository;

    @Mock
    private ParseTaskRepository parseTaskRepository;

    @Mock
    private DocumentParser documentParser;

    @Mock
    private DeepSeekClient deepSeekClient;

    @Mock
    private SkillTagRepository skillTagRepository;

    @InjectMocks
    private JobParseMQConsumer consumer;

    private Job testJob;
    private ParseTask testTask;

    @BeforeEach
    void setUp() {
        testJob = new Job();
        testJob.setId(1L);
        testJob.setCompanyId(1L);
        testJob.setTitle("Java Engineer");
        testJob.setFilePath("/uploads/job_desc.pdf");
        testJob.setParseStatus(ParseStatus.PENDING);

        testTask = new ParseTask();
        testTask.setId(1L);
        testTask.setJobId(1L);
        testTask.setTaskType("JOB_PARSE");
        testTask.setStatus(ParseTask.TaskStatus.PENDING);
    }

    @Test
    @DisplayName("Should successfully parse job with file and extract skills")
    void consumeJobParse_WithFile_Success() {
        when(parseTaskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));
        when(documentParser.extractText("/uploads/job_desc.pdf")).thenReturn("Java developer with Spring Boot experience");
        when(deepSeekClient.parseJob(anyString(), eq("Java Engineer")))
                .thenReturn(Map.of("skills", List.of("Java", "Spring Boot", "MySQL")));
        when(skillTagRepository.findByName("Java")).thenReturn(Optional.empty());
        when(skillTagRepository.findByName("Spring Boot")).thenReturn(Optional.empty());
        when(skillTagRepository.findByName("MySQL")).thenReturn(Optional.empty());

        SkillTag javaTag = new SkillTag();
        javaTag.setId(1L);
        javaTag.setName("Java");
        when(skillTagRepository.save(any(SkillTag.class))).thenAnswer(invocation -> {
            SkillTag tag = invocation.getArgument(0);
            tag.setId(1L);
            return tag;
        });

        consumer.consumeJobParse(1L, 1L);

        ArgumentCaptor<Job> jobCaptor = ArgumentCaptor.forClass(Job.class);
        verify(jobRepository, atLeast(1)).save(jobCaptor.capture());
        Job savedJob = jobCaptor.getValue();
        assertEquals(ParseStatus.SUCCESS, savedJob.getParseStatus());
        assertNotNull(savedJob.getParseResult());

        ArgumentCaptor<ParseTask> taskCaptor = ArgumentCaptor.forClass(ParseTask.class);
        verify(parseTaskRepository, atLeast(1)).save(taskCaptor.capture());
        ParseTask savedTask = taskCaptor.getValue();
        assertEquals(ParseTask.TaskStatus.SUCCESS, savedTask.getStatus());

        verify(jobSkillRepository, times(3)).save(any(JobSkill.class));
    }

    @Test
    @DisplayName("Should handle job without file path")
    void consumeJobParse_NoFile_Success() {
        testJob.setFilePath(null);
        when(parseTaskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));
        when(deepSeekClient.parseJob("", "Java Engineer"))
                .thenReturn(Map.of("skills", List.of("Java", "Spring Boot")));
        when(skillTagRepository.findByName(anyString())).thenReturn(Optional.empty());

        SkillTag javaTag = new SkillTag();
        javaTag.setId(1L);
        javaTag.setName("Java");
        when(skillTagRepository.save(any(SkillTag.class))).thenAnswer(invocation -> {
            SkillTag tag = invocation.getArgument(0);
            tag.setId(1L);
            return tag;
        });

        consumer.consumeJobParse(1L, 1L);

        verify(documentParser, never()).extractText(anyString());
        verify(jobRepository, atLeast(1)).save(any(Job.class));
    }

    @Test
    @DisplayName("Should handle parse failure gracefully")
    void consumeJobParse_ParsingFails() {
        when(parseTaskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));
        when(documentParser.extractText(anyString())).thenThrow(new RuntimeException("Document parsing failed"));

        consumer.consumeJobParse(1L, 1L);

        ArgumentCaptor<Job> jobCaptor = ArgumentCaptor.forClass(Job.class);
        verify(jobRepository, atLeast(1)).save(jobCaptor.capture());
        Job savedJob = jobCaptor.getValue();
        assertEquals(ParseStatus.FAILED, savedJob.getParseStatus());
        assertEquals("Document parsing failed", savedJob.getParseError());

        ArgumentCaptor<ParseTask> taskCaptor = ArgumentCaptor.forClass(ParseTask.class);
        verify(parseTaskRepository, atLeast(1)).save(taskCaptor.capture());
        ParseTask savedTask = taskCaptor.getValue();
        assertEquals(ParseTask.TaskStatus.FAILED, savedTask.getStatus());
        assertEquals("Document parsing failed", savedTask.getErrorMessage());
    }

    @Test
    @DisplayName("Should use existing skill tags when available")
    void consumeJobParse_ExistingSkillTags() {
        when(parseTaskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));
        when(documentParser.extractText(anyString())).thenReturn("Java developer");
        when(deepSeekClient.parseJob(anyString(), anyString()))
                .thenReturn(Map.of("skills", List.of("Java", "Spring Boot")));

        SkillTag existingJavaTag = new SkillTag();
        existingJavaTag.setId(1L);
        existingJavaTag.setName("Java");

        SkillTag newSpringTag = new SkillTag();
        newSpringTag.setId(2L);
        newSpringTag.setName("Spring Boot");

        when(skillTagRepository.findByName("Java")).thenReturn(Optional.of(existingJavaTag));
        when(skillTagRepository.findByName("Spring Boot")).thenReturn(Optional.empty());
        when(skillTagRepository.save(any(SkillTag.class))).thenAnswer(invocation -> {
            SkillTag tag = invocation.getArgument(0);
            if (tag.getId() == null) {
                tag.setId(2L);
            }
            return tag;
        });

        consumer.consumeJobParse(1L, 1L);

        verify(skillTagRepository, times(1)).save(any(SkillTag.class));
        verify(jobSkillRepository, times(2)).save(any(JobSkill.class));
    }

    @Test
    @DisplayName("Should throw exception when parse task not found")
    void consumeJobParse_TaskNotFound() {
        when(parseTaskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> consumer.consumeJobParse(1L, 999L));
    }

    @Test
    @DisplayName("Should throw exception when job not found")
    void consumeJobParse_JobNotFound() {
        when(parseTaskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(jobRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> consumer.consumeJobParse(999L, 1L));
    }

    @Test
    @DisplayName("Should handle empty skills list in parse result")
    void consumeJobParse_NoSkillsInResult() {
        when(parseTaskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(testJob));
        when(documentParser.extractText(anyString())).thenReturn("Job description");
        when(deepSeekClient.parseJob(anyString(), anyString()))
                .thenReturn(Map.of("skills", List.of()));

        consumer.consumeJobParse(1L, 1L);

        verify(jobSkillRepository, never()).save(any(JobSkill.class));
        ArgumentCaptor<Job> jobCaptor = ArgumentCaptor.forClass(Job.class);
        verify(jobRepository, atLeast(1)).save(jobCaptor.capture());
        assertEquals(ParseStatus.SUCCESS, jobCaptor.getValue().getParseStatus());
    }
}
