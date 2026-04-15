package com.graphhire.match.infrastructure.mq;

import com.graphhire.job.domain.event.JobPublishedEvent;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.resume.domain.event.ResumeParsedEvent;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class MatchMQConsumer {

    @Autowired
    private MatchAppService matchAppService;

    @RocketMQMessageListener(topic = "resume-parsed", consumerGroup = "match-consumer")
    public void onResumeParsed(ResumeParsedEvent event) {
        matchAppService.triggerMatchForResume(event.getResume().getId());
    }

    @RocketMQMessageListener(topic = "job-published", consumerGroup = "match-consumer")
    public void onJobPublished(JobPublishedEvent event) {
        matchAppService.triggerMatchForJob(event.getJob().getId());
    }
}
