package com.graphhire.resume.infrastructure.mq;

import com.graphhire.resume.application.service.GraphBuildService;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "resume-default-changed", consumerGroup = "resume-default-changed-consumer")
public class ResumeDefaultChangedMQConsumer implements RocketMQListener<String> {

    private static final Logger log = LoggerFactory.getLogger(ResumeDefaultChangedMQConsumer.class);

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private GraphBuildService graphBuildService;

    @Override
    public void onMessage(String message) {
        try {
            Long resumeId = Long.parseLong(message.trim());
            Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));
            graphBuildService.buildGraphForResume(resume);
            log.info("默认简历变更后图谱重建成功: resumeId={}", resumeId);
        } catch (Exception e) {
            log.error("处理默认简历变更消息{}失败: {}", message, e.getMessage(), e);
        }
    }
}
