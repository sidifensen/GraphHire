package com.graphhire.match.infrastructure.mq;

import com.graphhire.match.application.service.MatchAppService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class JobMatchPlanMQConsumerTest {

    @Mock
    private MatchAppService matchAppService;

    @InjectMocks
    private JobMatchPlanMQConsumer consumer;

    @Test
    @DisplayName("消费岗位匹配计划消息后应执行分页拆批")
    void onMessage_shouldExecuteJobPlan() {
        consumer.onMessage("456");
        verify(matchAppService).executeJobMatchPlan(456L);
    }
}
