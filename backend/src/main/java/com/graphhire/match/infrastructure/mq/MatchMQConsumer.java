package com.graphhire.match.infrastructure.mq;

import com.graphhire.job.domain.event.JobPublishedEvent;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.resume.domain.event.ResumeParsedEvent;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
public class MatchMQConsumer {

    @Autowired
    private MatchAppService matchAppService;

    @Component
    @ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
    public static class ResumeParsedListener implements RocketMQListener<ResumeParsedEvent> {
        @Autowired
        private MatchAppService matchAppService;

        @Override
        public void onMessage(ResumeParsedEvent event) {
            matchAppService.triggerMatchForResume(event.getResume().getId());
        }
    }

    @Component
    @ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
    public static class JobPublishedListener implements RocketMQListener<JobPublishedEvent> {
        @Autowired
        private MatchAppService matchAppService;

        @Override
        public void onMessage(JobPublishedEvent event) {
            matchAppService.triggerMatchForJob(event.getJob().getId());
        }
    }
}
