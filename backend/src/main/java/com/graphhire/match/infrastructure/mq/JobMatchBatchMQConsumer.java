package com.graphhire.match.infrastructure.mq;

import cn.hutool.json.JSONUtil;
import com.graphhire.match.application.service.MatchAppService;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "job-match-batch", consumerGroup = "job-match-batch-consumer")
public class JobMatchBatchMQConsumer implements RocketMQListener<String> {

    @Autowired
    private MatchAppService matchAppService;

    @Override
    public void onMessage(String message) {
        MatchMQProducer.JobMatchBatchMessage payload =
            JSONUtil.toBean(message, MatchMQProducer.JobMatchBatchMessage.class);
        matchAppService.executeJobMatchBatch(payload.jobId(), payload.resumeIds());
    }
}
