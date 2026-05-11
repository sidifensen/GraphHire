package com.graphhire.resume.infrastructure.mq;

import cn.hutool.json.JSONUtil;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.match.infrastructure.mq.MatchMQProducer;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "resume-match-batch", consumerGroup = "resume-match-batch-consumer")
public class ResumeMatchBatchMQConsumer implements RocketMQListener<String> {

    @Autowired
    private MatchAppService matchAppService;

    @Override
    public void onMessage(String message) {
        MatchMQProducer.ResumeMatchBatchMessage payload =
            JSONUtil.toBean(message, MatchMQProducer.ResumeMatchBatchMessage.class);
        matchAppService.executeResumeMatchBatch(payload.resumeId(), payload.jobIds());
    }
}
