package com.graphhire.resume.infrastructure.mq;

import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.resume.infrastructure.ai.DocumentParser;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "resume-parse", consumerGroup = "resume-parse-consumer")
public class ResumeParseMQConsumer implements RocketMQListener<String> {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ParseTaskRepository parseTaskRepository;

    @Autowired
    private DocumentParser documentParser;

    @Autowired
    private DeepSeekClient deepSeekClient;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void onMessage(String message) {
        // message format: "resumeId,parseTaskId"
        String[] parts = message.split(",");
        Long resumeId = Long.parseLong(parts[0]);
        Long parseTaskId = Long.parseLong(parts[1]);
        // 1. Update parse_task status to RUNNING (1)
        ParseTask task = parseTaskRepository.findById(parseTaskId)
            .orElseThrow(() -> new RuntimeException("Parse task not found: " + parseTaskId));
        task.setStatus(ParseTask.TaskStatus.RUNNING);
        task.setStartedAt(LocalDateTime.now());
        parseTaskRepository.save(task);

        // 2. Update resume parse_status to PARSING (1)
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));
        resume.setStatus(ParseStatus.PARSING);
        resumeRepository.save(resume);

        try {
            // 3. Read file from RustFS and extract text using Tika
            String text = documentParser.extractText(resume.getFilePath());

            // 4. Call DeepSeek to extract structured info
            Map<String, Object> parseResult = deepSeekClient.parseResume(text);

            // 5. Update resume with parse result
            resume.setParseResult(parseResult != null ? parseResult.toString() : "{}");
            resume.setStatus(ParseStatus.SUCCESS);
            resume.setConfidence(BigDecimal.valueOf(0.85));
            resumeRepository.save(resume);

            // 6. Update parse_task to SUCCESS (2)
            task.setStatus(ParseTask.TaskStatus.SUCCESS);
            task.setCompletedAt(LocalDateTime.now());
            parseTaskRepository.save(task);

            // 7. Create notification (type=1) for user
            Notification notification = new Notification();
            notification.setUserId(resume.getUserId());
            notification.setType(NotificationType.RESUME_PARSED);
            notification.setTitle("简历解析完成");
            notification.setContent("您的简历已解析完成，可以查看匹配结果了");
            notification.setReferenceId(resumeId);
            notificationRepository.save(notification);

        } catch (Exception e) {
            // 8. On failure: update parse_status to FAILED (3), save error
            resume.setStatus(ParseStatus.FAILED);
            resume.setParseError(e.getMessage());
            resumeRepository.save(resume);

            task.setStatus(ParseTask.TaskStatus.FAILED);
            task.setErrorMessage(e.getMessage());
            task.setCompletedAt(LocalDateTime.now());
            parseTaskRepository.save(task);
        }
    }
}