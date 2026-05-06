package com.graphhire.controllerIT;

import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ChatSchemaIT extends BaseControllerIT {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void shouldContainChatTablesAndOwnerUserIdColumn() {
        Integer ownerColumnCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='job' AND column_name='owner_user_id'",
            Integer.class
        );
        Integer conversationTableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='chat_conversation'",
            Integer.class
        );
        Integer messageTableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='chat_message'",
            Integer.class
        );
        Integer imageDetailTableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='chat_message_image'",
            Integer.class
        );
        Integer resumeDetailTableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='chat_message_resume'",
            Integer.class
        );
        Integer interviewInviteDetailTableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='chat_message_interview_invite'",
            Integer.class
        );
        assertEquals(1, ownerColumnCount);
        assertEquals(1, conversationTableCount);
        assertEquals(1, messageTableCount);
        assertEquals(0, imageDetailTableCount);
        assertEquals(0, resumeDetailTableCount);
        assertEquals(0, interviewInviteDetailTableCount);
    }

    @Test
    void shouldDropApplicationAndTalentPoolAfterMigration() {
        Integer applicationTableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='application'",
            Integer.class
        );
        Integer talentPoolTableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='talent_pool'",
            Integer.class
        );
        assertEquals(0, applicationTableCount);
        assertEquals(0, talentPoolTableCount);
    }
}
