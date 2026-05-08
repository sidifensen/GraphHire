package com.graphhire.resume.infrastructure.mq;

import com.graphhire.match.application.service.MatchAppService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ResumeMatchTriggerMQConsumerTest {

    @Mock
    private MatchAppService matchAppService;

    @InjectMocks
    private ResumeMatchTriggerMQConsumer consumer;

    @Test
    @DisplayName("消费匹配触发消息后应调用全职位匹配")
    void onMessage_shouldTriggerMatch() {
        consumer.onMessage("123");
        verify(matchAppService).triggerMatchForResume(123L);
    }
}
