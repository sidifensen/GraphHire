package com.graphhire.match.infrastructure.mq;

import cn.hutool.json.JSONUtil;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
public class MatchMQProducer {

    private static final String TOPIC_RESUME_MATCH_PLAN = "resume-match-plan";
    private static final String TOPIC_RESUME_MATCH_BATCH = "resume-match-batch";
    private static final String TOPIC_JOB_MATCH_PLAN = "job-match-plan";
    private static final String TOPIC_JOB_MATCH_BATCH = "job-match-batch";

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public void sendResumeMatchPlan(Long resumeId) {
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_MATCH_PLAN, String.valueOf(resumeId));
    }

    public void sendResumeMatchBatch(Long resumeId, List<Long> jobIds) {
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_MATCH_BATCH, JSONUtil.toJsonStr(new ResumeMatchBatchMessage(resumeId, jobIds)));
    }

    public void sendJobMatchPlan(Long jobId) {
        rocketMQTemplate.convertAndSend(TOPIC_JOB_MATCH_PLAN, String.valueOf(jobId));
    }

    public void sendJobMatchBatch(Long jobId, List<Long> resumeIds) {
        rocketMQTemplate.convertAndSend(TOPIC_JOB_MATCH_BATCH, JSONUtil.toJsonStr(new JobMatchBatchMessage(jobId, resumeIds)));
    }

    public record ResumeMatchBatchMessage(Long resumeId, List<Long> jobIds) {
    }

    public record JobMatchBatchMessage(Long jobId, List<Long> resumeIds) {
    }
}
