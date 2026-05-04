package com.graphhire.skill.infrastructure.graph;

import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.interfaces.dto.response.CompanyGraphResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SkillGraphClientTest {

    @Test
    @DisplayName("getPersonSkillGraph returns empty structure when driver unavailable")
    void getPersonSkillGraph_ReturnsEmptyStructureWhenDriverUnavailable() {
        SkillGraphClient client = new SkillGraphClient();

        Map<String, Object> graph = client.getPersonSkillGraph(1L);

        assertNotNull(graph);
        assertEquals(1L, graph.get("personId"));
        assertNotNull(graph.get("skills"));
        assertTrue(graph.containsKey("success"));
        assertEquals(false, graph.get("success"));
    }

    @Test
    @DisplayName("getMockJobGraph returns valid structure")
    void getMockJobGraph_ReturnsValidStructure() {
        SkillGraphClient client = new SkillGraphClient();

        Map<String, Object> graph = client.getJobSkillGraph(1L);

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
        SkillGraphClient client = new SkillGraphClient();

        assertDoesNotThrow(() -> client.buildPersonSkillGraph(1L, null));
    }

    @Test
    @DisplayName("buildPersonSkillGraph handles empty skills gracefully")
    void buildPersonSkillGraph_EmptySkills_HandlesGracefully() {
        SkillGraphClient client = new SkillGraphClient();

        assertDoesNotThrow(() -> client.buildPersonSkillGraph(1L, List.of()));
    }

    @Test
    @DisplayName("buildJobSkillGraph handles null required skills gracefully")
    void buildJobSkillGraph_NullRequired_HandlesGracefully() {
        SkillGraphClient client = new SkillGraphClient();

        assertDoesNotThrow(() -> client.buildJobSkillGraph(1L, null, Arrays.asList("Python")));
    }

    @Test
    @DisplayName("buildJobSkillGraph handles null preferred skills gracefully")
    void buildJobSkillGraph_NullPreferred_HandlesGracefully() {
        SkillGraphClient client = new SkillGraphClient();

        assertDoesNotThrow(() -> client.buildJobSkillGraph(1L, Arrays.asList("Java"), null));
    }

    @Test
    @DisplayName("getPersonSkillGraph handles exceptions by returning empty graph")
    void getPersonSkillGraph_Exception_ReturnsEmptyGraph() {
        SkillGraphClient client = new SkillGraphClient();

        Map<String, Object> graph = client.getPersonSkillGraph(999L);

        assertNotNull(graph);
        assertTrue(graph.containsKey("personId"));
        assertTrue(graph.containsKey("skills"));
        assertTrue(graph.containsKey("success"));
    }

    @Test
    @DisplayName("getJobSkillGraph handles exceptions gracefully")
    void getJobSkillGraph_Exception_ReturnsMockData() {
        SkillGraphClient client = new SkillGraphClient();

        Map<String, Object> graph = client.getJobSkillGraph(999L);

        assertNotNull(graph);
        assertTrue(graph.containsKey("mock"));
    }

    @Test
    @DisplayName("无驱动时企业图谱仍返回去重后的降级结构")
    void getCompanyGraph_WhenDriverUnavailable_ReturnsFallbackGraph() {
        SkillGraphClient client = new SkillGraphClient();

        Company company = new Company();
        company.setId(1L);
        company.setName("GraphHire");

        Job first = new Job();
        first.setId(10L);
        first.setCompanyId(1L);
        first.setTitle("后端工程师");
        first.setSkills(List.of("Java", "Spring Boot"));

        Job second = new Job();
        second.setId(11L);
        second.setCompanyId(1L);
        second.setTitle("平台工程师");
        second.setSkills(List.of("Java", "Docker"));

        CompanyGraphResponse response = client.getCompanyGraph(company, List.of(first, second));

        assertEquals(1L, response.getCompanyId());
        assertTrue(response.getNodes().stream().anyMatch(node -> "COMPANY".equals(node.getType())));
        assertTrue(response.getNodes().stream().anyMatch(node -> "JOB".equals(node.getType())));
        assertTrue(response.getNodes().stream().anyMatch(node -> "SKILL".equals(node.getType()) && "Java".equals(node.getLabel())));
        long javaNodeCount = response.getNodes().stream()
            .filter(node -> "SKILL".equals(node.getType()) && "Java".equals(node.getLabel()))
            .count();
        assertEquals(1L, javaNodeCount);
        assertTrue(response.getEdges().stream().anyMatch(edge -> "HAS_JOB".equals(edge.getType())));
        assertTrue(response.getEdges().stream().anyMatch(edge -> "REQUIRES_SKILL".equals(edge.getType())));
    }
}
