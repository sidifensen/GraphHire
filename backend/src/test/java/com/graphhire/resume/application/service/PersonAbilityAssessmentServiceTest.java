package com.graphhire.resume.application.service;

import com.graphhire.resume.interfaces.dto.AbilityAssessmentResponse;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PersonAbilityAssessmentServiceTest {

    @Mock
    private SkillGraphClient skillGraphClient;

    @InjectMocks
    private PersonAbilityAssessmentService personAbilityAssessmentService;

    @Test
    @DisplayName("无技能时返回全零低等级")
    void assess_ReturnsZeroWhenNoSkills() {
        when(skillGraphClient.getPersonSkillGraph(1L)).thenReturn(Map.of("skills", List.of()));

        AbilityAssessmentResponse result = personAbilityAssessmentService.assess(1L);

        assertEquals(0, result.getTotalScore());
        assertEquals("LOW", result.getLevel());
        assertEquals(0, result.getDimensions().getBreadth());
        assertEquals(0, result.getDimensions().getDepth());
        assertEquals(0, result.getDimensions().getStructure());
        assertEquals(0, result.getDimensions().getFreshness());
        assertEquals(0, result.getDimensions().getRarity());
    }

    @Test
    @DisplayName("多技能时按权重聚合总分")
    void assess_CalculatesWeightedTotal() {
        when(skillGraphClient.getPersonSkillGraph(2L)).thenReturn(Map.of(
            "skills", List.of("Java", "Spring Boot", "Redis", "MySQL", "Docker", "Kubernetes", "React")
        ));

        AbilityAssessmentResponse result = personAbilityAssessmentService.assess(2L);

        int breadth = result.getDimensions().getBreadth();
        int depth = result.getDimensions().getDepth();
        int structure = result.getDimensions().getStructure();
        int freshness = result.getDimensions().getFreshness();
        int rarity = result.getDimensions().getRarity();

        int expected = (int) Math.round(
            breadth * 0.25 + depth * 0.25 + structure * 0.20 + freshness * 0.15 + rarity * 0.15
        );

        assertEquals(expected, result.getTotalScore());
        assertTrue(result.getTotalScore() >= 0 && result.getTotalScore() <= 100);
        assertTrue(result.getSkillCount() >= 1);
    }
}
