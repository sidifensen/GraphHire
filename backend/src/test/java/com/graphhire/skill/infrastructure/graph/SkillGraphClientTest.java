package com.graphhire.skill.infrastructure.graph;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@Nested
@DisplayName("SkillGraphClient Tests")
class SkillGraphClientTest {

    @Test
    @DisplayName("getMockPersonGraph returns valid structure")
    void getMockPersonGraph_ReturnsValidStructure() {
        // Given
        SkillGraphClient client = new SkillGraphClient();

        // When
        Map<String, Object> graph = client.getPersonSkillGraph(1L);

        // Then
        assertNotNull(graph);
        assertEquals(1L, graph.get("personId"));
        assertNotNull(graph.get("skills"));
        assertTrue(graph.containsKey("mock"));
        assertTrue((Boolean) graph.get("mock"));
    }

    @Test
    @DisplayName("getMockJobGraph returns valid structure")
    void getMockJobGraph_ReturnsValidStructure() {
        // Given
        SkillGraphClient client = new SkillGraphClient();

        // When
        Map<String, Object> graph = client.getJobSkillGraph(1L);

        // Then
        assertNotNull(graph);
        assertEquals(1L, graph.get("jobId"));
        assertNotNull(graph.get("jobTitle"));
        assertNotNull(graph.get("skills"));
        assertTrue(graph.containsKey("mock"));
        assertTrue((Boolean) graph.get("mock"));
    }

    @Test
    @DisplayName("buildPersonSkillGraph handles null skills gracefully")
    void buildPersonSkillGraph_NullSkills_HandlesGracefully() {
        // Given
        SkillGraphClient client = new SkillGraphClient();

        // When & Then - should not throw
        assertDoesNotThrow(() -> client.buildPersonSkillGraph(1L, null));
    }

    @Test
    @DisplayName("buildPersonSkillGraph handles empty skills gracefully")
    void buildPersonSkillGraph_EmptySkills_HandlesGracefully() {
        // Given
        SkillGraphClient client = new SkillGraphClient();

        // When & Then - should not throw
        assertDoesNotThrow(() -> client.buildPersonSkillGraph(1L, List.of()));
    }

    @Test
    @DisplayName("buildJobSkillGraph handles null required skills gracefully")
    void buildJobSkillGraph_NullRequired_HandlesGracefully() {
        // Given
        SkillGraphClient client = new SkillGraphClient();

        // When & Then - should not throw
        assertDoesNotThrow(() -> client.buildJobSkillGraph(1L, null, Arrays.asList("Python")));
    }

    @Test
    @DisplayName("buildJobSkillGraph handles null preferred skills gracefully")
    void buildJobSkillGraph_NullPreferred_HandlesGracefully() {
        // Given
        SkillGraphClient client = new SkillGraphClient();

        // When & Then - should not throw
        assertDoesNotThrow(() -> client.buildJobSkillGraph(1L, Arrays.asList("Java"), null));
    }

    @Test
    @DisplayName("getPersonSkillGraph handles exceptions gracefully")
    void getPersonSkillGraph_Exception_ReturnsMockData() {
        // Given
        SkillGraphClient client = new SkillGraphClient();

        // When
        Map<String, Object> graph = client.getPersonSkillGraph(999L);

        // Then - should return mock data
        assertNotNull(graph);
        assertTrue(graph.containsKey("mock"));
    }

    @Test
    @DisplayName("getJobSkillGraph handles exceptions gracefully")
    void getJobSkillGraph_Exception_ReturnsMockData() {
        // Given
        SkillGraphClient client = new SkillGraphClient();

        // When
        Map<String, Object> graph = client.getJobSkillGraph(999L);

        // Then - should return mock data
        assertNotNull(graph);
        assertTrue(graph.containsKey("mock"));
    }
}