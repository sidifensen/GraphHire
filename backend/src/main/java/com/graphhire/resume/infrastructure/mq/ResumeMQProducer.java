package com.graphhire.resume.infrastructure.mq;

import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.event.ResumeUploadedEvent;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
public class ResumeMQProducer {

    private static final String TOPIC_RESUME_UPLOADED = "resume-uploaded";
    private static final String TOPIC_RESUME_PARSE = "resume-parse";

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public void sendResumeUploadedEvent(Resume resume) {
        ResumeUploadedEvent event = new ResumeUploadedEvent(resume);
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_UPLOADED, event);
    }

    public void sendResumeParseMessage(Long resumeId, Long parseTaskId) {
        ResumeParseMessage message = new ResumeParseMessage(resumeId, parseTaskId);
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_PARSE, message);
    }

    public static class ResumeParseMessage {
        private Long resumeId;
        private Long parseTaskId;

        public ResumeParseMessage() {
        }

        public ResumeParseMessage(Long resumeId, Long parseTaskId) {
            this.resumeId = resumeId;
            this.parseTaskId = parseTaskId;
        }

        public Long getResumeId() {
            return resumeId;
        }

        public void setResumeId(Long resumeId) {
            this.resumeId = resumeId;
        }

        public Long getParseTaskId() {
            return parseTaskId;
        }

        public void setParseTaskId(Long parseTaskId) {
            this.parseTaskId = parseTaskId;
        }
    }
}
