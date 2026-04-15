package com.graphhire.resume.infrastructure.mq;

import com.graphhire.resume.application.service.GraphBuildService;
import com.graphhire.resume.domain.event.ResumeParsedEvent;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * MQ Consumer for building person skill graph when resume is parsed.
 * Listens to resume-parsed topic and triggers graph building.
 */
@Component
@RocketMQMessageListener(topic = "resume-parsed", consumerGroup = "graph-consumer-resume")
public class ResumeGraphMQConsumer implements RocketMQListener<ResumeParsedEvent> {

    private static final Logger log = LoggerFactory.getLogger(ResumeGraphMQConsumer.class);

    @Autowired
    private GraphBuildService graphBuildService;

    @Override
    public void onMessage(ResumeParsedEvent event) {
        try {
            graphBuildService.buildGraphForResume(event.getResume());
            log.info("Successfully built graph for resume {}", event.getResume().getId());
        } catch (Exception e) {
            log.error("Failed to build graph for resume {}: {}", event.getResume().getId(), e.getMessage());
            // Don't rethrow - we don't want to affect the main MQ flow
        }
    }
}