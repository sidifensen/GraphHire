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
 * 职位技能图谱构建MQ消费者
 * 【模块说明】监听job-published主题，在职位发布时触发图谱构建
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
            log.info("职位{}图谱构建成功", event.getJob().getId());
        } catch (Exception e) {
            log.error("职位{}图谱构建失败: {}", event.getJob().getId(), e.getMessage());
            // 不重新抛出异常，以免影响主MQ流程
        }
    }
}