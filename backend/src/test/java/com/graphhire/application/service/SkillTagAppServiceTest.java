package com.graphhire.application.service;

import com.graphhire.application.command.SkillTagCreateCmd;
import com.graphhire.application.command.SkillTagUpdateCmd;
import com.graphhire.domain.model.JobSkill;
import com.graphhire.domain.model.SkillTag;
import com.graphhire.domain.repository.JobSkillRepository;
import com.graphhire.domain.repository.SkillTagRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SkillTagAppServiceTest {

    @Mock
    private SkillTagRepository skillTagRepository;

    @Mock
    private JobSkillRepository jobSkillRepository;

    @InjectMocks
    private SkillTagAppService skillTagAppService;

    @Nested
    @DisplayName("获取技能标签列表测试")
    class ListAllTests {

        @Test
        @DisplayName("成功获取所有技能标签")
        void listAll_Success() {
            // Given
            List<SkillTag> tags = Arrays.asList(
                    SkillTag.builder().id(1L).tagName("Java").category("编程语言").build(),
                    SkillTag.builder().id(2L).tagName("Python").category("编程语言").build()
            );

            when(skillTagRepository.findAll()).thenReturn(tags);

            // When
            List<SkillTag> result = skillTagAppService.listAll();

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
        }
    }

    @Nested
    @DisplayName("按分类获取技能标签测试")
    class ListByCategoryTests {

        @Test
        @DisplayName("成功按分类获取技能标签")
        void listByCategory_Success() {
            // Given
            String category = "编程语言";
            List<SkillTag> tags = Arrays.asList(
                    SkillTag.builder().id(1L).tagName("Java").category(category).build()
            );

            when(skillTagRepository.findByCategory(category)).thenReturn(tags);

            // When
            List<SkillTag> result = skillTagAppService.listByCategory(category);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Java", result.get(0).getTagName());
        }
    }

    @Nested
    @DisplayName("创建技能标签测试")
    class CreateTests {

        @Test
        @DisplayName("成功创建技能标签")
        void create_Success() {
            // Given
            SkillTagCreateCmd cmd = new SkillTagCreateCmd();
            cmd.setTagName("Spring Boot");
            cmd.setCategory("框架");

            when(skillTagRepository.save(any(SkillTag.class))).thenAnswer(invocation -> {
                SkillTag tag = invocation.getArgument(0);
                tag.setId(1L);
                return tag;
            });

            // When
            SkillTag result = skillTagAppService.create(cmd);

            // Then
            assertNotNull(result);
            assertEquals(1L, result.getId());
            assertEquals("Spring Boot", result.getTagName());
            assertEquals("框架", result.getCategory());

            ArgumentCaptor<SkillTag> tagCaptor = ArgumentCaptor.forClass(SkillTag.class);
            verify(skillTagRepository).save(tagCaptor.capture());
            assertEquals("Spring Boot", tagCaptor.getValue().getTagName());
        }
    }

    @Nested
    @DisplayName("更新技能标签测试")
    class UpdateTests {

        @Test
        @DisplayName("成功更新技能标签")
        void update_Success() {
            // Given
            Long id = 1L;
            SkillTagUpdateCmd cmd = new SkillTagUpdateCmd();
            cmd.setTagName("Java SE");
            cmd.setCategory("编程语言");

            SkillTag existingTag = SkillTag.builder()
                    .id(id)
                    .tagName("Java")
                    .category("Language")
                    .build();

            when(skillTagRepository.findByIdOptional(id)).thenReturn(Optional.of(existingTag));
            when(skillTagRepository.save(any(SkillTag.class))).thenReturn(existingTag);

            // When
            skillTagAppService.update(id, cmd);

            // Then
            ArgumentCaptor<SkillTag> tagCaptor = ArgumentCaptor.forClass(SkillTag.class);
            verify(skillTagRepository).save(tagCaptor.capture());
            assertEquals("Java SE", tagCaptor.getValue().getTagName());
            assertEquals("编程语言", tagCaptor.getValue().getCategory());
        }

        @Test
        @DisplayName("技能标签不存在时更新失败")
        void update_NotFound_ThrowsException() {
            // Given
            Long id = 999L;
            SkillTagUpdateCmd cmd = new SkillTagUpdateCmd();
            cmd.setTagName("New Name");

            when(skillTagRepository.findByIdOptional(id)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> skillTagAppService.update(id, cmd));
            assertEquals("技能标签不存在", exception.getMessage());
        }

        @Test
        @DisplayName("部分字段更新成功")
        void update_PartialUpdate_Success() {
            // Given
            Long id = 1L;
            SkillTagUpdateCmd cmd = new SkillTagUpdateCmd();
            cmd.setTagName("New Name");
            // category is null, should not update

            SkillTag existingTag = SkillTag.builder()
                    .id(id)
                    .tagName("Old Name")
                    .category("Old Category")
                    .build();

            when(skillTagRepository.findByIdOptional(id)).thenReturn(Optional.of(existingTag));
            when(skillTagRepository.save(any(SkillTag.class))).thenReturn(existingTag);

            // When
            skillTagAppService.update(id, cmd);

            // Then
            ArgumentCaptor<SkillTag> tagCaptor = ArgumentCaptor.forClass(SkillTag.class);
            verify(skillTagRepository).save(tagCaptor.capture());
            assertEquals("New Name", tagCaptor.getValue().getTagName());
            assertEquals("Old Category", tagCaptor.getValue().getCategory()); // Unchanged
        }
    }

    @Nested
    @DisplayName("删除技能标签测试")
    class DeleteTests {

        @Test
        @DisplayName("成功删除技能标签")
        void delete_Success() {
            // Given
            Long id = 1L;
            when(jobSkillRepository.findBySkillTagId(id)).thenReturn(Collections.emptyList());
            doNothing().when(skillTagRepository).delete(id);

            // When
            skillTagAppService.delete(id);

            // Then
            verify(skillTagRepository).delete(id);
        }

        @Test
        @DisplayName("技能标签正在使用中时删除失败")
        void delete_TagInUse_ThrowsException() {
            // Given
            Long id = 1L;
            List<JobSkill> jobSkills = Arrays.asList(
                    JobSkill.builder().id(1L).skillTagId(id).build()
            );

            when(jobSkillRepository.findBySkillTagId(id)).thenReturn(jobSkills);

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> skillTagAppService.delete(id));
            assertEquals("该技能标签正在使用中，无法删除", exception.getMessage());
            verify(skillTagRepository, never()).delete(anyLong());
        }
    }
}
