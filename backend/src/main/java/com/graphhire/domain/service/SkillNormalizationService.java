package com.graphhire.domain.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class SkillNormalizationService {

    private static final Map<String, String> SKILL_ALIASES = new HashMap<>();
    private static final Pattern SPECIAL_CHARS = Pattern.compile("[^a-zA-Z0-9\\u4e00-\\u9fa5]");

    static {
        SKILL_ALIASES.put("java", "Java");
        SKILL_ALIASES.put("javascript", "JavaScript");
        SKILL_ALIASES.put("js", "JavaScript");
        SKILL_ALIASES.put("typescript", "TypeScript");
        SKILL_ALIASES.put("ts", "TypeScript");
        SKILL_ALIASES.put("python", "Python");
        SKILL_ALIASES.put("py", "Python");
        SKILL_ALIASES.put("golang", "Go");
        SKILL_ALIASES.put("go", "Go");
        SKILL_ALIASES.put("rust", "Rust");
        SKILL_ALIASES.put("c++", "C++");
        SKILL_ALIASES.put("cpp", "C++");
        SKILL_ALIASES.put("c#", "C#");
        SKILL_ALIASES.put("csharp", "C#");
        SKILL_ALIASES.put(".net", ".NET");
        SKILL_ALIASES.put("dotnet", ".NET");
        SKILL_ALIASES.put("react.js", "React");
        SKILL_ALIASES.put("reactjs", "React");
        SKILL_ALIASES.put("vue.js", "Vue.js");
        SKILL_ALIASES.put("vuejs", "Vue.js");
        SKILL_ALIASES.put("angular.js", "Angular");
        SKILL_ALIASES.put("angularjs", "Angular");
        SKILL_ALIASES.put("node.js", "Node.js");
        SKILL_ALIASES.put("nodejs", "Node.js");
        SKILL_ALIASES.put("springboot", "Spring Boot");
        SKILL_ALIASES.put("spring", "Spring");
        SKILL_ALIASES.put("mybatis", "MyBatis");
        SKILL_ALIASES.put("hibernate", "Hibernate");
        SKILL_ALIASES.put("docker", "Docker");
        SKILL_ALIASES.put("k8s", "Kubernetes");
        SKILL_ALIASES.put("kubernetes", "Kubernetes");
        SKILL_ALIASES.put("aws", "AWS");
        SKILL_ALIASES.put("azure", "Azure");
        SKILL_ALIASES.put("gcp", "GCP");
        SKILL_ALIASES.put("mysql", "MySQL");
        SKILL_ALIASES.put("postgresql", "PostgreSQL");
        SKILL_ALIASES.put("redis", "Redis");
        SKILL_ALIASES.put("mongodb", "MongoDB");
        SKILL_ALIASES.put("elasticsearch", "Elasticsearch");
        SKILL_ALIASES.put("kafka", "Kafka");
        SKILL_ALIASES.put("rabbitmq", "RabbitMQ");
        SKILL_ALIASES.put("mq", "Message Queue");
        SKILL_ALIASES.put("ml", "Machine Learning");
        SKILL_ALIASES.put("ai", "Artificial Intelligence");
        SKILL_ALIASES.put("deep learning", "Deep Learning");
        SKILL_ALIASES.put("nlp", "Natural Language Processing");
        SKILL_ALIASES.put("cv", "Computer Vision");
        SKILL_ALIASES.put("sql", "SQL");
        SKILL_ALIASES.put("nosql", "NoSQL");
        SKILL_ALIASES.put("linux", "Linux");
        SKILL_ALIASES.put("git", "Git");
        SKILL_ALIASES.put("microservice", "Microservices");
        SKILL_ALIASES.put("microservices", "Microservices");
        SKILL_ALIASES.put("restful", "RESTful API");
        SKILL_ALIASES.put("rest api", "RESTful API");
        SKILL_ALIASES.put("graphql", "GraphQL");
        SKILL_ALIASES.put("vue", "Vue.js");
        SKILL_ALIASES.put("react", "React");
        SKILL_ALIASES.put("angular", "Angular");
    }

    public String normalize(String skill) {
        if (skill == null || skill.trim().isEmpty()) {
            return "";
        }

        String cleaned = cleanSkillName(skill.trim());

        String lower = cleaned.toLowerCase();
        if (SKILL_ALIASES.containsKey(lower)) {
            return SKILL_ALIASES.get(lower);
        }

        StringBuilder sb = new StringBuilder();
        for (char c : cleaned.toCharArray()) {
            if (Character.isLetterOrDigit(c) || Character.isWhitespace(c)) {
                sb.append(c);
            }
        }

        String result = sb.toString().trim();

        if (result.length() <= 1) {
            return result.toUpperCase();
        }

        return Character.toUpperCase(result.charAt(0)) + result.substring(1).toLowerCase();
    }

    public List<String> normalizeAll(List<String> skills) {
        if (skills == null) {
            return List.of();
        }
        return skills.stream()
                .map(this::normalize)
                .filter(s -> !s.isEmpty())
                .distinct()
                .toList();
    }

    private String cleanSkillName(String skill) {
        String lower = skill.toLowerCase();

        for (Map.Entry<String, String> entry : SKILL_ALIASES.entrySet()) {
            if (lower.contains(entry.getKey()) || entry.getKey().contains(lower)) {
                return entry.getValue();
            }
        }

        return SPECIAL_CHARS.matcher(skill).replaceAll("");
    }
}
