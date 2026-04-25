package com.graphhire.resume.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class AbilityAssessmentConfig {

    private static final String RULES_PATH = "ability-assessment/rules.json";

    @Bean
    public AbilityAssessmentProperties abilityAssessmentProperties(ObjectMapper objectMapper) throws IOException {
        ClassPathResource resource = new ClassPathResource(RULES_PATH);
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, AbilityAssessmentProperties.class);
        }
    }
}
