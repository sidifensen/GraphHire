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
import org.redisson.api.RPermitExpirableSemaphore;
import org.redisson.api.RedissonClient;
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
import java.util.concurrent.TimeUnit;

/**
 * 简历解析消费者。
 * 说明：消费解析任务并负责全链路状态推进、失败回滚与后续事件发布。
 */
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
    @Autowired
    private RedissonClient redissonClient;

    @Value("${app.mq.resume-parse.consume-thread-number:20}")
    private int consumeThreadNumber;

    @Value("${app.mq.resume-parse.consume-thread-max:64}")
    private int consumeThreadMax;

    @Value("${app.concurrent.resume-parse.semaphore-name:resume:parse:permits}")
    private String semaphoreName;

    @Value("${app.concurrent.resume-parse.max-permits:16}")
    private int semaphoreMaxPermits;

    @Value("${app.concurrent.resume-parse.acquire-wait-seconds:0}")
    private long acquireWaitSeconds;

    @Value("${app.concurrent.resume-parse.lease-seconds:600}")
    private long leaseSeconds;

    /**
     * 消费简历解析消息并推进解析任务状态机。
     * 说明：方法先通过分布式并发闸门限流，再执行“任务置运行 -> 文本提取 -> AI解析 -> 落库通知”的主链路。
     *
     * @param message MQ 消息体，格式为 `resumeId,parseTaskId,refreshAllMatches`。
     */
    @Override
    public void onMessage(String message) {
        // 步骤1：初始化计时与并发闸门上下文。
        long totalStartNanos = System.nanoTime(); // 整体耗时统计起点。
        String permitId = null; // 分布式 permit ID，后续释放必须依赖该标识。
        RPermitExpirableSemaphore semaphore = redissonClient.getPermitExpirableSemaphore(semaphoreName); // 解析链路 semaphore。
        semaphore.trySetPermits(semaphoreMaxPermits); // 首次设置总并发许可，后续调用幂等。

        // 步骤2：解析消息体。
        String[] parts = message.split(","); // 消息格式："resumeId,parseTaskId,refreshAllMatches"。
        Long resumeId = Long.parseLong(parts[0]); // 简历ID。
        Long parseTaskId = Long.parseLong(parts[1]); // 解析任务ID。
        // 默认开启 refreshAllMatches，兼容老消息格式（未携带第三段）。
        boolean refreshAllMatches = parts.length <= 2 || Boolean.parseBoolean(parts[2]); // 是否刷新全量匹配。
        log.info("开始处理简历解析任务: resumeId={}, parseTaskId={}", resumeId, parseTaskId);

        // 步骤3：获取并发许可，控制 OCR/AI 下游并发压力。
        try {
            // 并发闸门：约束同时执行的解析任务数，保护 OCR/AI/数据库下游稳定性。
            permitId = semaphore.tryAcquire(acquireWaitSeconds, leaseSeconds, TimeUnit.SECONDS); // lease 到期自动回收许可，避免进程异常泄露。
            if (permitId == null) {
                throw new RuntimeException("简历解析并发许可不足，请稍后重试"); // fail-fast，让 MQ 重试机制接管削峰。
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt(); // 恢复中断标记。
            throw new RuntimeException("简历解析并发许可获取被中断", ex); // 上抛触发消息重试。
        }

        // 步骤4：执行解析业务主流程。
        try {
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
                // 步骤3：提取文档文本。
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

                // 步骤4：调用 AI 解析结构化信息。
                // 步骤4：调用DeepSeek提取结构化信息
                long aiStartNanos = System.nanoTime();
                log.info("开始调用DeepSeek解析简历");
                Map<String, Object> parseResult = deepSeekClient.parseResume(text);
                log.info("DeepSeek解析完成, costMs={}", elapsedMs(aiStartNanos));

                // 步骤5：落库解析结果并推进状态。
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

                // 步骤7：发送通知并触发下游事件。
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
                // 步骤10：释放同一简历互斥锁，避免异常路径导致后续无法再次触发解析。
                resumeParseLockService.forceUnlock(resumeId); // 与分布式 permit 不同，该锁是按 resumeId 维度互斥。
            }
        } finally {
            // 步骤11：释放分布式并发许可，确保并发额度不泄露。
            if (permitId != null) {
                semaphore.release(permitId); // 使用 permitId 精确释放许可。
            }
        }
    }

    /**
     * RocketMQ 消费线程参数注入。
     *
     * @param consumer RocketMQ PushConsumer 实例。
     */
    @Override
    public void prepareStart(DefaultMQPushConsumer consumer) {
        consumer.setConsumeThreadMin(consumeThreadNumber); // 消费最小线程数。
        consumer.setConsumeThreadMax(consumeThreadMax); // 消费最大线程数。
    }

    /**
     * 计算耗时毫秒数。
     *
     * @param startNanos 起始纳秒时间戳。
     * @return 当前时间与起始时间的毫秒差。
     */
    private static long elapsedMs(long startNanos) {
        return (System.nanoTime() - startNanos) / 1_000_000;
    }

    /**
     * 记录解析结果日志，超长结果自动截断。
     * 说明：避免单条日志过大影响日志吞吐与检索体验。
     *
     * @param resumeId 简历ID。
     * @param parseResult 结构化解析结果。
     */
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
