package com.graphhire.resume.infrastructure.mq;

import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.event.ResumeUploadedEvent;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ResumeMQProducer {

    private static final String TOPIC_RESUME_UPLOADED = "resume-uploaded";

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public void sendResumeUploadedEvent(Resume resume) {
        ResumeUploadedEvent event = new ResumeUploadedEvent(resume);
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_UPLOADED, event);
    }
}
