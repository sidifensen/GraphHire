package com.graphhire.job.infrastructure.persistence;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class IndustrySkillProfileSchemaSqlTest {

    @Test
    void shouldContainIndustrySkillProfileTableDefinition() throws IOException {
        Path schemaPath = Path.of("src/main/resources/db/schema.sql");
        String schemaSql = Files.readString(schemaPath);

        assertTrue(schemaSql.contains("CREATE TABLE industry_skill_profile"));
        assertTrue(schemaSql.contains("uk_industry_skill_profile_industry"));
        assertTrue(schemaSql.contains("profile_json JSONB"));
    }
}
