package com.graphhire.job.infrastructure.persistence;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class IndustrySkillProfileSchemaSqlTest {

    @Test
    void shouldContainPositionTypeSkillProfileTableDefinition() throws IOException {
        Path schemaPath = Path.of("src/main/resources/db/schema.sql");
        String schemaSql = Files.readString(schemaPath);

        assertTrue(schemaSql.contains("CREATE TABLE position_type_skill_profile"));
        assertTrue(schemaSql.contains("position_type_id BIGINT"));
        assertTrue(schemaSql.contains("profile_json     JSONB"));
        assertTrue(schemaSql.contains("fk_position_type_skill_profile_position_type"));
        assertTrue(schemaSql.contains("CREATE INDEX idx_position_type_skill_profile_position_type_id ON position_type_skill_profile (position_type_id);"));
    }
}
