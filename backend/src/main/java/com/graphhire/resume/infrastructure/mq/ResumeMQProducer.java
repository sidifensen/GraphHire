package com.graphhire.resume.infrastructure.mq;

import cn.hutool.json.JSONUtil;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 简历领域 MQ 生产者。
 * 说明：统一封装“解析触发、默认简历切换、上传异步处理”三个事件发送入口。
 */
@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
public class ResumeMQProducer {

    private static final String TOPIC_RESUME_PARSE = "resume-parse"; // 简历解析任务主题。
    private static final String TOPIC_RESUME_DEFAULT_CHANGED = "resume-default-changed"; // 默认简历变更主题。
    private static final String TOPIC_RESUME_UPLOAD_ASYNC = "resume-upload-async"; // 上传异步处理主题。

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    /**
     * 发送“简历解析任务”消息。
     * 说明：采用逗号分隔的轻量协议，兼容既有消费者解析逻辑。
     *
     * @param resumeId 简历ID，对应 resume 主键。
     * @param parseTaskId 解析任务ID，对应 parse_task 主键。
     * @param refreshAllMatches 是否刷新全量匹配，控制后续匹配链路。
     */
    // 步骤1：拼装轻量消息体；步骤2：发送至解析主题。
    public void sendResumeParseMessage(Long resumeId, Long parseTaskId, boolean refreshAllMatches) {
        String message = resumeId + "," + parseTaskId + "," + refreshAllMatches; // 消息格式："resumeId,parseTaskId,refreshAllMatches"。
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_PARSE, message); // 触发解析消费者。
    }

    /**
     * 发送“默认简历变更”消息。
     *
     * @param resumeId 当前被设置为默认简历的简历ID。
     */
    public void sendResumeDefaultChangedMessage(Long resumeId) {
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_DEFAULT_CHANGED, String.valueOf(resumeId)); // 仅传 resumeId，保持消息最小化。
    }

    /**
     * 发送“上传异步处理”消息。
     *
     * @param message 上传任务消息载荷，包含文件与任务上下文。
     */
    // 步骤1：对象转 JSON；步骤2：发送给异步上传消费者。
    public void sendResumeUploadAsyncMessage(ResumeUploadAsyncMessage message) {
        rocketMQTemplate.convertAndSend(TOPIC_RESUME_UPLOAD_ASYNC, JSONUtil.toJsonStr(message));
    }

    /**
     * 上传异步处理消息体。
     * 说明：字段保持扁平结构，降低消费者反序列化复杂度与兼容风险。
     */
    public static class ResumeUploadAsyncMessage {
        private Long taskId; // 上传任务ID。
        private Long userId; // 发起上传的用户ID。
        private String fileName; // 原始文件名。
        private String contentType; // 客户端上报的 Content-Type。
        private long fileSize; // 文件字节大小。
        private String storageKey; // RustFS/对象存储键。
        private String detectedMimeType; // 服务端探测的 MIME 类型。
        private String fileBase64; // 文件内容 Base64。
        private boolean refreshAllMatches; // 解析成功后是否刷新全量匹配。

        public Long getTaskId() {
            return taskId;
        }

        public void setTaskId(Long taskId) {
            this.taskId = taskId;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getFileName() {
            return fileName;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }

        public String getContentType() {
            return contentType;
        }

        public void setContentType(String contentType) {
            this.contentType = contentType;
        }

        public long getFileSize() {
            return fileSize;
        }

        public void setFileSize(long fileSize) {
            this.fileSize = fileSize;
        }

        public String getStorageKey() {
            return storageKey;
        }

        public void setStorageKey(String storageKey) {
            this.storageKey = storageKey;
        }

        public String getDetectedMimeType() {
            return detectedMimeType;
        }

        public void setDetectedMimeType(String detectedMimeType) {
            this.detectedMimeType = detectedMimeType;
        }

        public String getFileBase64() {
            return fileBase64;
        }

        public void setFileBase64(String fileBase64) {
            this.fileBase64 = fileBase64;
        }

        public boolean isRefreshAllMatches() {
            return refreshAllMatches;
        }

        public void setRefreshAllMatches(boolean refreshAllMatches) {
            this.refreshAllMatches = refreshAllMatches;
        }
    }
}
