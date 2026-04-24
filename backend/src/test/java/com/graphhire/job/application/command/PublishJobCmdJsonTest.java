package com.graphhire.job.application.command;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class PublishJobCmdJsonTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void shouldDeserializeLocationAndSalaryRangeFromJson() throws Exception {
        String json = """
                {
                  "title":"前端工程师",
                  "location":{"city":"上海","district":"浦东新区"},
                  "salaryRange":{"min":30000,"max":45000,"unit":"CNY/MONTH"}
                }
                """;

        PublishJobCmd cmd = objectMapper.readValue(json, PublishJobCmd.class);

        assertNotNull(cmd.getLocation());
        assertEquals("上海", cmd.getLocation().getCity());
        assertEquals("浦东新区", cmd.getLocation().getDistrict());
        assertNotNull(cmd.getSalaryRange());
        assertEquals(30000, cmd.getSalaryRange().getMin());
        assertEquals(45000, cmd.getSalaryRange().getMax());
        assertEquals("CNY/MONTH", cmd.getSalaryRange().getUnit());
    }
}

