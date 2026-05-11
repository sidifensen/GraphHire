package com.graphhire.resume.infrastructure.mq;

import com.graphhire.match.application.service.MatchAppService;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "resume-match-plan", consumerGroup = "resume-match-plan-consumer")
public class ResumeMatchPlanMQConsumer implements RocketMQListener<String> {

    @Autowired
    private MatchAppService matchAppService;

    @Override
    public void onMessage(String message) {
        matchAppService.executeResumeMatchPlan(Long.parseLong(message.trim()));
    }
}
