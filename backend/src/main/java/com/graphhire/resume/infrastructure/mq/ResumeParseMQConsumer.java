package com.graphhire.resume.infrastructure.mq;

import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSON;
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
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(ResumeParseMQConsumer.class);

    private static final String TOPIC_RESUME_PARSED = "resume-parsed";

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

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    @Override
    public void onMessage(String message) {
        // 消息格式："resumeId,parseTaskId"
        String[] parts = message.split(",");
        Long resumeId = Long.parseLong(parts[0]);
        Long parseTaskId = Long.parseLong(parts[1]);
        log.info("开始处理简历解析任务: resumeId={}, parseTaskId={}", resumeId, parseTaskId);

        // 步骤1：将parse_task状态更新为RUNNING(1)
        ParseTask task = parseTaskRepository.findById(parseTaskId)
            .orElseThrow(() -> new RuntimeException("Parse task not found: " + parseTaskId));
        task.setStatus(ParseTask.TaskStatus.RUNNING);
        task.setStartedAt(LocalDateTime.now());
        parseTaskRepository.save(task);

        // 步骤2：将resume的parse_status更新为PARSING(1)
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));
        resume.setStatus(ParseStatus.PARSING);
        resumeRepository.save(resume);

        try {
            log.info("开始提取文档文本, filePath={}", resume.getFilePath());
            // 步骤3：从RustFS读取文件并用Tika提取文本
            String text = documentParser.extractText(resume.getFilePath());
            log.info("文档文本提取完成, textLength={}", text != null ? text.length() : 0);

            // 步骤3.1：空文本保护
            if (StrUtil.isBlank(text)) {
                throw new RuntimeException("文档未提取到有效文本");
            }

            // 步骤4：调用DeepSeek提取结构化信息
            log.info("开始调用DeepSeek解析简历");
            Map<String, Object> parseResult = deepSeekClient.parseResume(text);
            log.info("DeepSeek解析完成");

            // 步骤5：用解析结果更新resume
            resume.setParseResult(parseResult != null ? JSON.toJSONString(parseResult) : "{}");
            resume.setStatus(ParseStatus.SUCCESS);
            resume.setConfidence(BigDecimal.valueOf(0.85));
            resumeRepository.save(resume);

            // 步骤6：将parse_task更新为SUCCESS(2)
            task.setStatus(ParseTask.TaskStatus.SUCCESS);
            task.setCompletedAt(LocalDateTime.now());
            parseTaskRepository.save(task);

            // 步骤7：为用户创建通知（type=1）
            Notification notification = new Notification();
            notification.setUserId(resume.getUserId());
            notification.setType(NotificationType.RESUME_PARSED);
            notification.setTitle("简历解析完成");
            notification.setContent("您的简历已解析完成，可以查看匹配结果了");
            notification.setReferenceId(resumeId);
            notificationRepository.save(notification);

            // 步骤8：发布简历解析完成事件（仅传resumeId），触发技能图谱构建
            rocketMQTemplate.convertAndSend(TOPIC_RESUME_PARSED, String.valueOf(resumeId));

        } catch (Exception e) {
            // 步骤9：失败时：将parse_status更新为FAILED(3)，保存错误信息
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