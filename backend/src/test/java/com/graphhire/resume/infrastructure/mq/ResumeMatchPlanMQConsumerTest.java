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
class ResumeMatchPlanMQConsumerTest {

    @Mock
    private MatchAppService matchAppService;

    @InjectMocks
    private ResumeMatchPlanMQConsumer consumer;

    @Test
    @DisplayName("消费简历匹配计划消息后应执行分页拆批")
    void onMessage_shouldExecuteResumePlan() {
        consumer.onMessage("123");
        verify(matchAppService).executeResumeMatchPlan(123L);
    }
}
