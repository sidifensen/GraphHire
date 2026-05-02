package com.graphhire.job.infrastructure.persistence;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PositionTypeSeedSqlTest {

    @Test
    void shouldSeedPositionTypeTreeFromCapturedJson() throws IOException {
        String sql = Files.readString(Path.of("src/main/resources/db/migration/V2026_05_02_019__seed_position_type_from_boss_json.sql"));
        assertTrue(sql.contains("INSERT INTO position_type"));
        assertTrue(sql.contains("技术"));
        assertTrue(sql.contains("产品"));
        assertTrue(sql.contains("后端开发"));
        assertTrue(sql.contains("Java"));
        assertTrue(sql.contains("parent_id"));
        assertTrue(sql.contains("ON CONFLICT (code) DO UPDATE"));
    }
}
