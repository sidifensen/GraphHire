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
import com.graphhire.resume.application.service.ResumeParseLockService;
import com.graphhire.resume.infrastructure.ai.DocumentParser;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.apache.rocketmq.spring.core.RocketMQPushConsumerLifecycleListener;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "resume-parse", consumerGroup = "resume-parse-consumer")
public class ResumeParseMQConsumer implements RocketMQListener<String>, RocketMQPushConsumerLifecycleListener {

    private static final Logger log = LoggerFactory.getLogger(ResumeParseMQConsumer.class);

    private static final String TOPIC_RESUME_PARSED = "resume-parsed";
    private static final String TOPIC_RESUME_MATCH_TRIGGER = "resume-match-trigger";
    private static final int MAX_PARSE_RESULT_LOG_LENGTH = 5000;

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

    @Autowired
    private SkillGraphClient skillGraphClient;
    @Autowired
    private ResumeParseLockService resumeParseLockService;

    @Value("${app.mq.resume-parse.consume-thread-number:20}")
    private int consumeThreadNumber;

    @Value("${app.mq.resume-parse.consume-thread-max:64}")
    private int consumeThreadMax;

    @Override
    public void onMessage(String message) {
        long totalStartNanos = System.nanoTime();
        // 消息格式："resumeId,parseTaskId,refreshAllMatches"
        String[] parts = message.split(",");
        Long resumeId = Long.parseLong(parts[0]);
        Long parseTaskId = Long.parseLong(parts[1]);
        boolean refreshAllMatches = parts.length <= 2 || Boolean.parseBoolean(parts[2]);
        log.info("开始处理简历解析任务: resumeId={}, parseTaskId={}", resumeId, parseTaskId);

        // 步骤1：将parse_task状态更新为RUNNING(1)
        long initStartNanos = System.nanoTime();
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
        log.info("简历解析任务初始化完成: resumeId={}, parseTaskId={}, costMs={}",
            resumeId, parseTaskId, elapsedMs(initStartNanos));

        try {
            long extractStartNanos = System.nanoTime();
            log.info("开始提取文档文本, filePath={}", resume.getFilePath());
            // 步骤3：从RustFS读取文件并用Tika提取文本
            String text = documentParser.extractText(resume.getFilePath());
            log.info("文档文本提取完成, textLength={}, costMs={}",
                text != null ? text.length() : 0, elapsedMs(extractStartNanos));

            // 步骤3.1：空文本保护
            if (StrUtil.isBlank(text)) {
                throw new RuntimeException("文档未提取到有效文本");
            }

            // 步骤4：调用DeepSeek提取结构化信息
            long aiStartNanos = System.nanoTime();
            log.info("开始调用DeepSeek解析简历");
            Map<String, Object> parseResult = deepSeekClient.parseResume(text);
            log.info("DeepSeek解析完成, costMs={}", elapsedMs(aiStartNanos));

            // 步骤5：用解析结果更新resume
            long persistStartNanos = System.nanoTime();
            resume.setParseResult(parseResult != null ? JSON.toJSONString(parseResult) : "{}");
            logParseResult(resumeId, parseResult);
            resume.setStatus(ParseStatus.SUCCESS);
            resume.setConfidence(BigDecimal.valueOf(0.85));
            resumeRepository.save(resume);
            skillGraphClient.clearPersonPositionTypeClassification(resume.getUserId());

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

            if (Boolean.TRUE.equals(resume.getIsDefault()) && refreshAllMatches) {
                rocketMQTemplate.convertAndSend(TOPIC_RESUME_MATCH_TRIGGER, String.valueOf(resumeId));
            }

            // 步骤8：发布简历解析完成事件（仅传resumeId），触发技能图谱构建
            rocketMQTemplate.convertAndSend(TOPIC_RESUME_PARSED, String.valueOf(resumeId));
            log.info("简历解析结果落库并通知完成: resumeId={}, parseTaskId={}, costMs={}",
                resumeId, parseTaskId, elapsedMs(persistStartNanos));
            log.info("简历解析任务完成: resumeId={}, parseTaskId={}, totalCostMs={}",
                resumeId, parseTaskId, elapsedMs(totalStartNanos));

        } catch (Exception e) {
            // 步骤9：失败时：将parse_status更新为FAILED(3)，保存错误信息
            resume.setStatus(ParseStatus.FAILED);
            resume.setParseError(e.getMessage());
            resumeRepository.save(resume);

            task.setStatus(ParseTask.TaskStatus.FAILED);
            task.setErrorMessage(e.getMessage());
            task.setCompletedAt(LocalDateTime.now());
            parseTaskRepository.save(task);
            log.error("简历解析任务失败: resumeId={}, parseTaskId={}, totalCostMs={}, reason={}",
                resumeId, parseTaskId, elapsedMs(totalStartNanos), e.getMessage());
        } finally {
            resumeParseLockService.forceUnlock(resumeId);
        }
    }

    @Override
    public void prepareStart(DefaultMQPushConsumer consumer) {
        consumer.setConsumeThreadMin(consumeThreadNumber);
        consumer.setConsumeThreadMax(consumeThreadMax);
    }

    private static long elapsedMs(long startNanos) {
        return (System.nanoTime() - startNanos) / 1_000_000;
    }

    private void logParseResult(Long resumeId, Map<String, Object> parseResult) {
        if (parseResult == null) {
            log.info("简历解析结构化结果: resumeId={}, parseResult={}", resumeId, "{}");
            return;
        }
        String json = JSON.toJSONString(parseResult);
        if (json.length() <= MAX_PARSE_RESULT_LOG_LENGTH) {
            log.info("简历解析结构化结果: resumeId={}, parseResult={}", resumeId, json);
            return;
        }
        String truncated = json.substring(0, MAX_PARSE_RESULT_LOG_LENGTH);
        log.info(
            "简历解析结构化结果(已截断): resumeId={}, parseResultPrefix={}, totalLength={}",
            resumeId,
            truncated,
            json.length()
        );
    }
}
