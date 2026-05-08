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

    @Override
    @Transactional
    public void onMessage(String message) {
        String permitId = null;
        RPermitExpirableSemaphore semaphore = redissonClient.getPermitExpirableSemaphore(semaphoreName);
        semaphore.trySetPermits(semaphoreMaxPermits);
        ResumeMQProducer.ResumeUploadAsyncMessage payload =
            JSONUtil.toBean(message, ResumeMQProducer.ResumeUploadAsyncMessage.class);
        try {
            // 并发闸门：限制上传消费并发，避免对象存储与数据库在高峰时被同时打满。
            permitId = semaphore.tryAcquire(acquireWaitSeconds, leaseSeconds, TimeUnit.SECONDS);
            if (permitId == null) {
                throw new RuntimeException("异步上传并发许可不足，请稍后重试");
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("异步上传并发许可获取被中断", ex);
        }

        try {
            UploadTask task = uploadTaskRepository.findById(payload.getTaskId())
                .orElseThrow(() -> new RuntimeException("Upload task not found: " + payload.getTaskId()));

            if (task.getStatus() == UploadTask.TaskStatus.SUCCESS) {
                return;
            }

            try {
                // 状态推进：进入上传中。
                task.markUploading();
                uploadTaskRepository.save(task);

                String fileName = payload.getFileName();
                if (StrUtil.isBlank(fileName)) {
                    fileName = "resume_" + payload.getTaskId() + ".pdf";
                }

                byte[] fileBytes = Base64.decode(payload.getFileBase64());
                if (fileBytes == null || fileBytes.length == 0) {
                    throw new RuntimeException("上传文件内容为空");
                }
                String filePath = rustFSClient.upload(fileBytes, fileName);
                // 状态推进：对象存储上传完成。
                task.markUploaded();
                uploadTaskRepository.save(task);

                Resume resume = new Resume();
                resume.setUserId(payload.getUserId());
                resume.setIsDefault(!resumeRepository.findByUserId(payload.getUserId()).stream()
                    .anyMatch(r -> Boolean.TRUE.equals(r.getIsDefault())));
                String fileExt = StrUtil.blankToDefault(FileUtil.extName(fileName), "").toLowerCase(Locale.ROOT);
                resume.setFileType(StrUtil.isBlank(fileExt) ? "unknown" : fileExt);
                resume.setFileSize(payload.getFileSize());
                resume.upload(filePath, fileName);
                Resume savedResume = resumeRepository.save(resume);

                ParseTask parseTask = new ParseTask();
                parseTask.setResumeId(savedResume.getId());
                parseTask.setTaskType("resume_parse");
                parseTask.setStatus(ParseTask.TaskStatus.PENDING);
                parseTaskRepository.save(parseTask);
                resumeMQProducer.sendResumeParseMessage(savedResume.getId(), parseTask.getId(), payload.isRefreshAllMatches());

                task.setResumeId(savedResume.getId());
                // 状态推进：解析任务已排队，后续由解析消费者继续推进。
                task.markParsePending();
                uploadTaskRepository.save(task);
            } catch (Exception ex) {
                log.error("异步上传任务处理失败: taskId={}, reason={}", payload.getTaskId(), ex.getMessage(), ex);
                // 失败兜底：任务可观测状态显式落为 FAILED，便于前端轮询展示。
                task.markFailed(ex.getMessage());
                uploadTaskRepository.save(task);
            }
        } finally {
            // 兜底释放 permit，避免消费者异常路径泄露并发额度。
            if (permitId != null) {
                semaphore.release(permitId);
            }
        }
    }

    @Override
    public void prepareStart(DefaultMQPushConsumer consumer) {
        consumer.setConsumeThreadMin(consumeThreadNumber);
        consumer.setConsumeThreadMax(consumeThreadMax);
    }
}
