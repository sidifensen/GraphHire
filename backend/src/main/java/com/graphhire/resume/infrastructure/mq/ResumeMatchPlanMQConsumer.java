package com.graphhire.resume.infrastructure.mq;

import com.graphhire.match.application.service.MatchAppService;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 简历匹配计划消费者。
 * 说明：消费 `resume-match-plan` 主题后，调用匹配应用服务执行分页拆批匹配流程。
 */
@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "resume-match-plan", consumerGroup = "resume-match-plan-consumer")
public class ResumeMatchPlanMQConsumer implements RocketMQListener<String> {

    @Autowired
    private MatchAppService matchAppService;

    /**
     * 消费匹配计划消息。
     *
     * @param message MQ 消息体，仅包含 resumeId 字符串。
     */
    // 步骤1：解析 resumeId；步骤2：调用应用服务执行匹配计划。
    @Override
    public void onMessage(String message) {
        matchAppService.executeResumeMatchPlan(Long.parseLong(message.trim()));
    }
}
