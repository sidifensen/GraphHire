package com.graphhire.resume.infrastructure.mq;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.core.codec.Base64;
import cn.hutool.json.JSONUtil;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.model.UploadTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.repository.UploadTaskRepository;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import org.redisson.api.RPermitExpirableSemaphore;
import org.redisson.api.RedissonClient;
import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.apache.rocketmq.spring.core.RocketMQPushConsumerLifecycleListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.concurrent.TimeUnit;

/**
 * 异步上传消费者。
 * 说明：消费“resume-upload-async”消息，串联文件入库、简历创建、解析任务入队。
 */
@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "resume-upload-async", consumerGroup = "resume-upload-async-consumer")
public class ResumeUploadAsyncMQConsumer implements RocketMQListener<String>, RocketMQPushConsumerLifecycleListener {

    private static final Logger log = LoggerFactory.getLogger(ResumeUploadAsyncMQConsumer.class);

    @Autowired
    private UploadTaskRepository uploadTaskRepository;
    @Autowired
    private ResumeRepository resumeRepository;
    @Autowired
    private ParseTaskRepository parseTaskRepository;
    @Autowired
    private RustFSClient rustFSClient;
    @Autowired
    private ResumeMQProducer resumeMQProducer;
    @Autowired
    private RedissonClient redissonClient;

    @Value("${app.mq.resume-upload.consume-thread-number:8}")
    private int consumeThreadNumber;

    @Value("${app.mq.resume-upload.consume-thread-max:32}")
    private int consumeThreadMax;

    @Value("${app.concurrent.resume-upload.semaphore-name:resume:upload:permits}")
    private String semaphoreName;

    @Value("${app.concurrent.resume-upload.max-permits:8}")
    private int semaphoreMaxPermits;

    @Value("${app.concurrent.resume-upload.acquire-wait-seconds:0}")
    private long acquireWaitSeconds;

    @Value("${app.concurrent.resume-upload.lease-seconds:180}")
    private long leaseSeconds;

    /**
     * 消费异步上传消息并推进上传任务状态机。
     * 说明：方法先通过分布式并发闸门限流，再执行“上传文件 -> 创建简历 -> 创建解析任务”的核心链路。
     *
     * @param message MQ 消息体，JSON 格式，包含 taskId/userId/fileBase64 等字段。
     */
    @Override
    @Transactional
    public void onMessage(String message) {
        // 步骤1：初始化并发闸门上下文。
        String permitId = null; // 分布式 permit ID，释放时必须携带，避免误释放他人许可。
        RPermitExpirableSemaphore semaphore = redissonClient.getPermitExpirableSemaphore(semaphoreName); // 上传链路 semaphore。
        semaphore.trySetPermits(semaphoreMaxPermits); // 首次初始化总许可数，后续重复调用幂等无副作用。

        // 步骤2：反序列化消息体。
        ResumeMQProducer.ResumeUploadAsyncMessage payload =
            JSONUtil.toBean(message, ResumeMQProducer.ResumeUploadAsyncMessage.class); // 将 JSON 消息转换为领域消息对象。

        // 步骤3：获取并发许可，保护对象存储与数据库下游。
        try {
            // 并发闸门：限制上传消费并发，避免对象存储与数据库在高峰时被同时打满。
            permitId = semaphore.tryAcquire(acquireWaitSeconds, leaseSeconds, TimeUnit.SECONDS); // lease 到期可自动回收，防止进程崩溃导致泄露。
            if (permitId == null) {
                throw new RuntimeException("异步上传并发许可不足，请稍后重试"); // fail-fast，让 MQ 按重试策略回放。
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt(); // 恢复中断标记，遵循线程中断语义。
            throw new RuntimeException("异步上传并发许可获取被中断", ex); // 交由上层重试机制处理。
        }

        // 步骤4：执行上传业务主流程。
        try {
            UploadTask task = uploadTaskRepository.findById(payload.getTaskId())
                .orElseThrow(() -> new RuntimeException("Upload task not found: " + payload.getTaskId())); // 强制依赖任务存在，避免孤儿消息。

            if (task.getStatus() == UploadTask.TaskStatus.SUCCESS) {
                return; // 幂等保护：已完成任务重复消费直接返回。
            }

            try {
                // 步骤4.1：状态推进到“上传中”。
                task.markUploading(); // 任务进入上传阶段。
                uploadTaskRepository.save(task); // 持久化状态，便于前端轮询观察。

                // 步骤4.2：准备文件名与文件字节。
                String fileName = payload.getFileName(); // 原始文件名。
                if (StrUtil.isBlank(fileName)) {
                    fileName = "resume_" + payload.getTaskId() + ".pdf"; // 兜底文件名，避免空名写入对象存储失败。
                }

                byte[] fileBytes = Base64.decode(payload.getFileBase64()); // 从 Base64 消息体恢复二进制文件。
                if (fileBytes == null || fileBytes.length == 0) {
                    throw new RuntimeException("上传文件内容为空"); // 输入边界保护，避免空文件继续流转。
                }

                // 步骤4.3：上传对象存储并推进“上传完成”。
                String filePath = rustFSClient.upload(fileBytes, fileName); // 上传到 RustFS，并返回对象路径。
                task.markUploaded(); // 状态推进到“已上传”。
                uploadTaskRepository.save(task); // 保存上传完成状态。

                // 步骤4.4：创建简历实体并落库。
                Resume resume = new Resume();
                resume.setUserId(payload.getUserId()); // 归属用户。
                resume.setIsDefault(!resumeRepository.findByUserId(payload.getUserId()).stream()
                    .anyMatch(r -> Boolean.TRUE.equals(r.getIsDefault()))); // 若用户无默认简历，则当前简历自动设为默认。
                String fileExt = StrUtil.blankToDefault(FileUtil.extName(fileName), "").toLowerCase(Locale.ROOT); // 标准化扩展名。
                resume.setFileType(StrUtil.isBlank(fileExt) ? "unknown" : fileExt); // 文件类型兜底为 unknown。
                resume.setFileSize(payload.getFileSize()); // 文件大小（字节）。
                resume.upload(filePath, fileName); // 写入上传后的文件路径与文件名。
                Resume savedResume = resumeRepository.save(resume); // 持久化简历。

                // 步骤4.5：创建解析任务并投递解析消息。
                ParseTask parseTask = new ParseTask();
                parseTask.setResumeId(savedResume.getId()); // 关联简历ID。
                parseTask.setTaskType("resume_parse"); // 任务类型：简历解析。
                parseTask.setStatus(ParseTask.TaskStatus.PENDING); // 初始状态：待处理。
                parseTaskRepository.save(parseTask); // 保存解析任务。
                resumeMQProducer.sendResumeParseMessage(savedResume.getId(), parseTask.getId(), payload.isRefreshAllMatches()); // 发消息触发下游解析。

                // 步骤4.6：回填 upload_task 并推进“解析排队中”。
                task.setResumeId(savedResume.getId()); // 建立 upload_task 与 resume 的关联。
                task.markParsePending(); // 上传任务进入“解析排队中”。
                uploadTaskRepository.save(task); // 持久化最终可观测状态。
            } catch (Exception ex) {
                // 步骤4.7：失败兜底，确保状态可观测。
                log.error("异步上传任务处理失败: taskId={}, reason={}", payload.getTaskId(), ex.getMessage(), ex); // 记录失败原因便于排障。
                task.markFailed(ex.getMessage()); // 状态显式置为 FAILED。
                uploadTaskRepository.save(task); // 保存失败状态，前端可轮询到失败结果。
            }
        } finally {
            // 步骤5：兜底释放 permit，避免消费者异常路径泄露并发额度。
            if (permitId != null) {
                semaphore.release(permitId); // 使用 permitId 精确释放，避免误释放其他并发任务许可。
            }
        }
    }

    /**
     * RocketMQ 消费端并发线程配置注入。
     *
     * @param consumer RocketMQ PushConsumer 实例。
     */
    @Override
    public void prepareStart(DefaultMQPushConsumer consumer) {
        consumer.setConsumeThreadMin(consumeThreadNumber); // 消费最小线程数。
        consumer.setConsumeThreadMax(consumeThreadMax); // 消费最大线程数。
    }
}
