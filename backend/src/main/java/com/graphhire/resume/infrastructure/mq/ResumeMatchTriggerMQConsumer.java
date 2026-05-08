package com.graphhire.resume.infrastructure.mq;

import com.graphhire.match.application.service.MatchAppService;
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.apache.rocketmq.spring.core.RocketMQPushConsumerLifecycleListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "resume-match-trigger", consumerGroup = "resume-match-trigger-consumer")
public class ResumeMatchTriggerMQConsumer implements RocketMQListener<String>, RocketMQPushConsumerLifecycleListener {

    @Autowired
    private MatchAppService matchAppService;

    @Value("${app.mq.resume-match.consume-thread-number:8}")
    private int consumeThreadNumber;

    @Value("${app.mq.resume-match.consume-thread-max:32}")
    private int consumeThreadMax;

    @Override
    public void onMessage(String message) {
        Long resumeId = Long.parseLong(message.trim());
        matchAppService.triggerMatchForResume(resumeId);
    }

    @Override
    public void prepareStart(DefaultMQPushConsumer consumer) {
        consumer.setConsumeThreadMin(consumeThreadNumber);
        consumer.setConsumeThreadMax(consumeThreadMax);
    }
}
