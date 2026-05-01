package com.graphhire.job.infrastructure.persistence;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class CompanyScaleSchemaSqlTest {

    @Test
    void shouldUseCompanyScaleCodeComment() throws IOException {
        Path schemaPath = Path.of("src/main/resources/db/schema.sql");
        String schemaSql = Files.readString(schemaPath);

        assertTrue(
                schemaSql.contains("COMMENT ON COLUMN company.scale IS '企业规模编码：1-0-20人 2-20-99人 3-100-499人 4-500-999人 5-1000-9999人 6-10000人以上';"),
                "company.scale 注释必须描述1到6编码映射"
        );
    }
}
