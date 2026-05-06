package com.graphhire.skill.infrastructure.persistence.repository;

import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.infrastructure.persistence.mapper.SkillTagMapper;
import com.graphhire.skill.infrastructure.persistence.po.SkillTagPO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillTagRepositoryImplTest {

    @Mock
    private SkillTagMapper skillTagMapper;

    @InjectMocks
    private SkillTagRepositoryImpl repository;

    @Test
    @DisplayName("同义词命中多条时优先返回名称精确匹配项")
    void findBySynonym_shouldPreferExactNameMatchWhenMultipleRows() {
        SkillTagPO a = new SkillTagPO();
        a.setId(19L);
        a.setName("Spring Boot");
        a.setSynonyms("[\"Spring\"]");

        SkillTagPO b = new SkillTagPO();
        b.setId(1L);
        b.setName("Java");
        b.setSynonyms("[\"Spring\"]");

        when(skillTagMapper.selectBySynonymCaseInsensitive("Spring")).thenReturn(List.of(a, b));

        Optional<SkillTag> result = repository.findBySynonym("Spring");

        assertTrue(result.isPresent());
        assertEquals("Spring Boot", result.get().getName());
    }

    @Test
    @DisplayName("同义词命中多条且无名称精确匹配时返回最小ID项")
    void findBySynonym_shouldFallbackToLowestIdWhenNoExactName() {
        SkillTagPO a = new SkillTagPO();
        a.setId(19L);
        a.setName("Spring Boot");
        a.setSynonyms("[\"Spring\"]");

        SkillTagPO b = new SkillTagPO();
        b.setId(1L);
        b.setName("Java");
        b.setSynonyms("[\"Spring\"]");

        when(skillTagMapper.selectBySynonymCaseInsensitive("SpringX")).thenReturn(List.of(a, b));

        Optional<SkillTag> result = repository.findBySynonym("SpringX");

        assertTrue(result.isPresent());
        assertEquals("Java", result.get().getName());
    }
}

