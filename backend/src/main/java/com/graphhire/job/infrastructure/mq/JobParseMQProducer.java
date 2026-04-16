package com.graphhire.job.infrastructure.mq;

import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
public class JobParseMQProducer {

    private static final String TOPIC_JOB_PARSE = "job-parse";

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public void sendJobParseTask(Long jobId, Long parseTaskId) {
        Map<String, Object> message = new HashMap<>();
        message.put("jobId", jobId);
        message.put("parseTaskId", parseTaskId);
        rocketMQTemplate.convertAndSend(TOPIC_JOB_PARSE, message);
    }
}
