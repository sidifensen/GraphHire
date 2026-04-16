package com.graphhire.notification.interfaces.controller.it;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.BaseControllerIT;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@TestMethodOrder(MethodOrderer.DisplayName.class)
class NotificationControllerIT extends BaseControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeAll
    static void beforeAll(@Autowired MockMvc mockMvc, @Autowired ObjectMapper objectMapper) throws Exception {
        BaseControllerIT.initTokens(mockMvc, objectMapper);
    }

    @BeforeEach
    void setUp() {
        setupHeaders();
    }

    @Test
    @DisplayName("01 - 获取用户所有通知")
    void getUserNotifications_Success() throws Exception {
        assertNotNull(personUserId);

        mockMvc.perform(get("/notifications/user/{userId}", personUserId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("02 - 获取用户未读通知")
    void getUnreadNotifications_Success() throws Exception {
        assertNotNull(personUserId);

        mockMvc.perform(get("/notifications/user/{userId}/unread", personUserId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("03 - 按类型获取通知")
    void getNotificationsByType_Success() throws Exception {
        assertNotNull(personUserId);

        mockMvc.perform(get("/notifications/user/{userId}/type/{type}", personUserId, "JOB_RECOMMEND")
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("04 - 获取未读数量")
    void getUnreadCount_Success() throws Exception {
        assertNotNull(personUserId);

        mockMvc.perform(get("/notifications/user/{userId}/unread-count", personUserId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isNumber());
    }

    @Test
    @DisplayName("05 - 标记通知为已读（无通知时）")
    void markAsRead_NoData() throws Exception {
        mockMvc.perform(put("/notifications/{id}/read", 99999)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("06 - 标记通知为未读（无通知时）")
    void markAsUnread_NoData() throws Exception {
        mockMvc.perform(put("/notifications/{id}/unread", 99999)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("07 - 标记所有通知为已读")
    void markAllAsRead_Success() throws Exception {
        assertNotNull(personUserId);

        mockMvc.perform(put("/notifications/user/{userId}/read-all", personUserId)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("08 - 删除通知（无通知时）")
    void deleteNotification_NoData() throws Exception {
        mockMvc.perform(delete("/notifications/{id}", 99999)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("09 - 获取单条通知（不存在时）")
    void getNotification_NotFound() throws Exception {
        mockMvc.perform(get("/notifications/{id}", 99999)
                .headers(personHeaders))
            .andExpect(jsonPath("$.code").value(200));
    }
}
