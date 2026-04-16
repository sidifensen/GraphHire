package com.graphhire.job.infrastructure.mq;

import com.graphhire.job.domain.event.JobPublishedEvent;
import com.graphhire.job.domain.model.Job;
import com.graphhire.resume.application.service.GraphBuildService;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * MQ Consumer for building job skill graph when job is published.
 * Listens to job-published topic and triggers graph building.
 */
@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "job-published", consumerGroup = "graph-consumer-job")
public class JobGraphMQConsumer implements RocketMQListener<JobPublishedEvent> {

    private static final Logger log = LoggerFactory.getLogger(JobGraphMQConsumer.class);

    @Autowired
    private GraphBuildService graphBuildService;

    @Override
    public void onMessage(JobPublishedEvent event) {
        try {
            graphBuildService.buildGraphForJob(event.getJob());
            log.info("Successfully built graph for job {}", event.getJob().getId());
        } catch (Exception e) {
            log.error("Failed to build graph for job {}: {}", event.getJob().getId(), e.getMessage());
            // Don't rethrow - we don't want to affect the main MQ flow
        }
    }
}