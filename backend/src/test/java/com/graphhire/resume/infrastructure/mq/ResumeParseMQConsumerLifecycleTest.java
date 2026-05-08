package com.graphhire.resume.infrastructure.mq;

import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ResumeParseMQConsumerLifecycleTest {

    @Test
    @DisplayName("prepareStart 应注入解析消费者并发配置")
    void prepareStart_shouldApplyThreadConfig() {
        ResumeParseMQConsumer consumer = new ResumeParseMQConsumer();
        ReflectionTestUtils.setField(consumer, "consumeThreadNumber", 13);
        ReflectionTestUtils.setField(consumer, "consumeThreadMax", 27);
        DefaultMQPushConsumer mqConsumer = new DefaultMQPushConsumer("test-group");

        consumer.prepareStart(mqConsumer);

        assertEquals(13, mqConsumer.getConsumeThreadMin());
        assertEquals(27, mqConsumer.getConsumeThreadMax());
    }
}
