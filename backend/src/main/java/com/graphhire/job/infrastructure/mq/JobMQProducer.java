package com.graphhire.job.infrastructure.mq;

import com.graphhire.job.domain.event.JobPublishedEvent;
import com.graphhire.job.domain.model.Job;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
public class JobMQProducer {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    private static final String TOPIC_JOB_PUBLISHED = "job-published";

    public void sendJobPublishedEvent(Job job) {
        JobPublishedEvent event = new JobPublishedEvent(job);
        rocketMQTemplate.convertAndSend(TOPIC_JOB_PUBLISHED, event);
    }
}
