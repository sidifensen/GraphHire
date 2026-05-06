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
    private static final String TOPIC_RESUME_DEFAULT_CHANGED = "resume-default-changed";

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public void sendResumeUploadedEvent(Resume resume) {
        ResumeUploadedEvent event = new ResumeUploadedEvent(resume);
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_UPLOADED, event);
    }

    public void sendResumeParseMessage(Long resumeId, Long parseTaskId, boolean refreshAllMatches) {
        // 消息格式："resumeId,parseTaskId,refreshAllMatches"（逗号分隔）
        String message = resumeId + "," + parseTaskId + "," + refreshAllMatches;
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_PARSE, message);
    }

    public void sendResumeDefaultChangedMessage(Long resumeId) {
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_DEFAULT_CHANGED, String.valueOf(resumeId));
    }

    public static class ResumeParseMessage {
        private Long resumeId;
        private Long parseTaskId;
        private boolean refreshAllMatches;

        public ResumeParseMessage() {
        }

        public ResumeParseMessage(Long resumeId, Long parseTaskId, boolean refreshAllMatches) {
            this.resumeId = resumeId;
            this.parseTaskId = parseTaskId;
            this.refreshAllMatches = refreshAllMatches;
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

        public boolean isRefreshAllMatches() {
            return refreshAllMatches;
        }

        public void setRefreshAllMatches(boolean refreshAllMatches) {
            this.refreshAllMatches = refreshAllMatches;
        }
    }
}
