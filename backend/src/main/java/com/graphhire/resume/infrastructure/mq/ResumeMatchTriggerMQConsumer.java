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

/**
 * 简历匹配触发消费者。
 * 说明：仅负责解耦触发动作，真正匹配逻辑由 MatchAppService 执行。
 */
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
        // 消息体仅携带 resumeId，保持触发事件最小化。
        Long resumeId = Long.parseLong(message.trim());
        matchAppService.executeResumeMatchPlan(resumeId);
    }

    @Override
    public void prepareStart(DefaultMQPushConsumer consumer) {
        consumer.setConsumeThreadMin(consumeThreadNumber);
        consumer.setConsumeThreadMax(consumeThreadMax);
    }
}
