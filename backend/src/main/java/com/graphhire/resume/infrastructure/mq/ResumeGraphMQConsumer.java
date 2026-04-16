package com.graphhire.resume.infrastructure.mq;

import com.graphhire.resume.application.service.GraphBuildService;
import com.graphhire.resume.domain.event.ResumeParsedEvent;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 简历技能图谱构建MQ消费者
 * 【模块说明】监听resume-parsed主题，在简历解析完成时触发图谱构建
 */
@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
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
            // 不重新抛出异常，以免影响主MQ流程
        }
    }
}