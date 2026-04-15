package com.graphhire.resume.application.service;

import com.graphhire.job.domain.model.Job;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GraphBuildServiceTest {

    @Mock
    private SkillGraphClient skillGraphClient;

    @InjectMocks
    private GraphBuildService graphBuildService;

    @Nested
    @DisplayName("Build Graph for Resume Tests")
    class BuildGraphForResumeTests {

        @Test
        @DisplayName("Successfully build graph for resume with skills")
        void buildGraphForResume_WithSkills_Success() {
            // Given
            Resume resume = new Resume();
            resume.setId(1L);
            resume.setUserId(100L);
            resume.setStatus(ParseStatus.SUCCESS);
            resume.setParseResult("{\"skills\": [\"Java\", \"Python\", \"Spring\"]}");

            // When
            graphBuildService.buildGraphForResume(resume);

            // Then
            verify(skillGraphClient).buildPersonSkillGraph(eq(100L), eq(Arrays.asList("Java", "Python", "Spring")));
        }

        @Test
        @DisplayName("Handle nested parse_result structure")
        void buildGraphForResume_NestedStructure_Success() {
            // Given
            Resume resume = new Resume();
            resume.setId(1L);
            resume.setUserId(100L);
            resume.setStatus(ParseStatus.SUCCESS);
            resume.setParseResult("{\"parse_result\": {\"skills\": [\"Java\", \"Python\"]}}");

            // When
            graphBuildService.buildGraphForResume(resume);

            // Then
            verify(skillGraphClient).buildPersonSkillGraph(eq(100L), eq(Arrays.asList("Java", "Python")));
        }

        @Test
        @DisplayName("Skip graph build when resume is null")
        void buildGraphForResume_NullResume_Skipped() {
            // When
            graphBuildService.buildGraphForResume(null);

            // Then
            verify(skillGraphClient, never()).buildPersonSkillGraph(any(), any());
        }

        @Test
        @DisplayName("Skip graph build when parseResult is null")
        void buildGraphForResume_NullParseResult_Skipped() {
            // Given
            Resume resume = new Resume();
            resume.setId(1L);
            resume.setUserId(100L);
            resume.setStatus(ParseStatus.SUCCESS);
            resume.setParseResult(null);

            // When
            graphBuildService.buildGraphForResume(resume);

            // Then
            verify(skillGraphClient, never()).buildPersonSkillGraph(any(), any());
        }

        @Test
        @DisplayName("Skip graph build when parseResult is empty")
        void buildGraphForResume_EmptyParseResult_Skipped() {
            // Given
            Resume resume = new Resume();
            resume.setId(1L);
            resume.setUserId(100L);
            resume.setStatus(ParseStatus.SUCCESS);
            resume.setParseResult("");

            // When
            graphBuildService.buildGraphForResume(resume);

            // Then
            verify(skillGraphClient, never()).buildPersonSkillGraph(any(), any());
        }

        @Test
        @DisplayName("Skip graph build when no skills found")
        void buildGraphForResume_NoSkills_Skipped() {
            // Given
            Resume resume = new Resume();
            resume.setId(1L);
            resume.setUserId(100L);
            resume.setStatus(ParseStatus.SUCCESS);
            resume.setParseResult("{\"other_field\": \"value\"}");

            // When
            graphBuildService.buildGraphForResume(resume);

            // Then
            verify(skillGraphClient, never()).buildPersonSkillGraph(any(), any());
        }

        @Test
        @DisplayName("Skip graph build when skills array is empty")
        void buildGraphForResume_EmptySkills_Skipped() {
            // Given
            Resume resume = new Resume();
            resume.setId(1L);
            resume.setUserId(100L);
            resume.setStatus(ParseStatus.SUCCESS);
            resume.setParseResult("{\"skills\": []}");

            // When
            graphBuildService.buildGraphForResume(resume);

            // Then
            verify(skillGraphClient, never()).buildPersonSkillGraph(any(), any());
        }

        @Test
        @DisplayName("Continue gracefully when SkillGraphClient throws exception")
        void buildGraphForResume_ClientException_Continues() {
            // Given
            Resume resume = new Resume();
            resume.setId(1L);
            resume.setUserId(100L);
            resume.setStatus(ParseStatus.SUCCESS);
            resume.setParseResult("{\"skills\": [\"Java\"]}");

            doThrow(new RuntimeException("Memgraph unavailable"))
                .when(skillGraphClient).buildPersonSkillGraph(any(), any());

            // When - should not throw
            graphBuildService.buildGraphForResume(resume);

            // Then
            verify(skillGraphClient).buildPersonSkillGraph(eq(100L), any());
        }
    }

    @Nested
    @DisplayName("Build Graph for Job Tests")
    class BuildGraphForJobTests {

        @Test
        @DisplayName("Successfully build graph for job with required and preferred skills")
        void buildGraphForJob_WithSkills_Success() {
            // Given
            Job job = new Job();
            job.setId(1L);
            job.setCompanyId(100L);
            job.setRequiredSkills(Arrays.asList("Java", "Spring"));
            job.setPreferredSkills(Arrays.asList("Kubernetes", "Docker"));

            // When
            graphBuildService.buildGraphForJob(job);

            // Then
            verify(skillGraphClient).buildJobSkillGraph(
                eq(1L),
                eq(Arrays.asList("Java", "Spring")),
                eq(Arrays.asList("Kubernetes", "Docker"))
            );
        }

        @Test
        @DisplayName("Build graph with only required skills")
        void buildGraphForJob_OnlyRequiredSkills_Success() {
            // Given
            Job job = new Job();
            job.setId(1L);
            job.setCompanyId(100L);
            job.setRequiredSkills(Arrays.asList("Java", "Python"));
            job.setPreferredSkills(null);

            // When
            graphBuildService.buildGraphForJob(job);

            // Then
            verify(skillGraphClient).buildJobSkillGraph(
                eq(1L),
                eq(Arrays.asList("Java", "Python")),
                isNull()
            );
        }

        @Test
        @DisplayName("Build graph with only preferred skills")
        void buildGraphForJob_OnlyPreferredSkills_Success() {
            // Given
            Job job = new Job();
            job.setId(1L);
            job.setCompanyId(100L);
            job.setRequiredSkills(null);
            job.setPreferredSkills(Arrays.asList("React", "Vue"));

            // When
            graphBuildService.buildGraphForJob(job);

            // Then
            verify(skillGraphClient).buildJobSkillGraph(
                eq(1L),
                isNull(),
                eq(Arrays.asList("React", "Vue"))
            );
        }

        @Test
        @DisplayName("Skip graph build when job is null")
        void buildGraphForJob_NullJob_Skipped() {
            // When
            graphBuildService.buildGraphForJob(null);

            // Then
            verify(skillGraphClient, never()).buildJobSkillGraph(any(), any(), any());
        }

        @Test
        @DisplayName("Skip graph build when job has no skills")
        void buildGraphForJob_NoSkills_Skipped() {
            // Given
            Job job = new Job();
            job.setId(1L);
            job.setCompanyId(100L);
            job.setRequiredSkills(null);
            job.setPreferredSkills(null);

            // When
            graphBuildService.buildGraphForJob(job);

            // Then
            verify(skillGraphClient, never()).buildJobSkillGraph(any(), any(), any());
        }

        @Test
        @DisplayName("Skip graph build when job has empty skills lists")
        void buildGraphForJob_EmptySkills_Skipped() {
            // Given
            Job job = new Job();
            job.setId(1L);
            job.setCompanyId(100L);
            job.setRequiredSkills(Collections.emptyList());
            job.setPreferredSkills(Collections.emptyList());

            // When
            graphBuildService.buildGraphForJob(job);

            // Then
            verify(skillGraphClient, never()).buildJobSkillGraph(any(), any(), any());
        }

        @Test
        @DisplayName("Continue gracefully when SkillGraphClient throws exception")
        void buildGraphForJob_ClientException_Continues() {
            // Given
            Job job = new Job();
            job.setId(1L);
            job.setCompanyId(100L);
            job.setRequiredSkills(Arrays.asList("Java"));
            job.setPreferredSkills(null);

            doThrow(new RuntimeException("Memgraph unavailable"))
                .when(skillGraphClient).buildJobSkillGraph(any(), any(), any());

            // When - should not throw
            graphBuildService.buildGraphForJob(job);

            // Then
            verify(skillGraphClient).buildJobSkillGraph(eq(1L), any(), isNull());
        }
    }
}