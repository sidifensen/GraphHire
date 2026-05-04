package com.graphhire.chat.application.service;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.chat.application.service.dto.ChatConversationSummaryDTO;
import com.graphhire.chat.application.service.dto.ChatMessageDTO;
import com.graphhire.chat.domain.model.ChatConversation;
import com.graphhire.chat.domain.model.ChatMessage;
import com.graphhire.chat.domain.model.ChatMessageType;
import com.graphhire.chat.domain.repository.ChatConversationRepository;
import com.graphhire.chat.domain.repository.ChatMessageRepository;
import com.graphhire.chat.infrastructure.mq.ChatMQProducer;
import com.graphhire.chat.infrastructure.persistence.po.ChatConversationViewPO;
import com.graphhire.chat.infrastructure.persistence.repository.ChatConversationRepositoryImpl;
import com.graphhire.common.vo.Exceptions;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import com.graphhire.resume.application.service.ResumeAppService;
import com.graphhire.resume.application.service.dto.ResumePreviewFile;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.notification.domain.vo.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ChatAppService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Autowired
    private ChatConversationRepository conversationRepository;
    @Autowired
    private ChatConversationRepositoryImpl conversationViewRepository;
    @Autowired
    private ChatMessageRepository messageRepository;
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private CompanyStaffRepository companyStaffRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ResumeRepository resumeRepository;
    @Autowired
    private NotificationAppService notificationAppService;
    @Autowired(required = false)
    private ChatMQProducer chatMQProducer;
    @Autowired
    private RustFSClient rustFSClient;
    @Autowired
    private ResumeAppService resumeService;

    @Transactional
    public Long startConversationAsPerson(Long currentUserId, Long jobId) {
        if (jobId == null) {
            throw Exceptions.BusinessException.of(400, "岗位ID不能为空");
        }
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> Exceptions.BusinessException.of(404, "岗位不存在"));
        if (job.getOwnerUserId() == null) {
            throw Exceptions.BusinessException.of(400, "岗位负责人未配置");
        }
        ChatConversation existing = conversationRepository.findByJobIdAndCandidateUserId(jobId, currentUserId).orElse(null);
        if (existing != null) {
            return existing.getId();
        }
        ChatConversation conversation = new ChatConversation();
        conversation.setJobId(jobId);
        conversation.setCompanyId(job.getCompanyId());
        conversation.setRecruiterUserId(job.getOwnerUserId());
        conversation.setCandidateUserId(currentUserId);
        conversation.setStatus(ChatConversation.STATUS_ACTIVE);
        conversation.setDeleted(0);
        conversationRepository.save(conversation);
        return conversation.getId();
    }

    public List<ChatConversationSummaryDTO> listConversations(Long currentUserId) {
        UserType userType = currentUserType(currentUserId);
        List<ChatConversationViewPO> conversations = userType == UserType.COMPANY
            ? conversationViewRepository.listViewByRecruiterUserId(currentUserId)
            : conversationViewRepository.listViewByCandidateUserId(currentUserId);
        return conversations.stream().map(conversation -> {
            long unreadCount = conversationViewRepository.countUnread(
                conversation.getConversationId(),
                currentUserId,
                userType == UserType.COMPANY ? conversation.getRecruiterLastReadMsgId() : conversation.getCandidateLastReadMsgId()
            );
            return new ChatConversationSummaryDTO(
                conversation.getConversationId(),
                conversation.getJobId(),
                conversation.getJobTitle(),
                conversation.getCompanyId(),
                conversation.getCompanyName(),
                conversation.getRecruiterUserId(),
                conversation.getCandidateUserId(),
                conversation.getCandidateName(),
                conversation.getRecruiterName(),
                conversation.getLastMessageId(),
                conversation.getLastMessageContent(),
                conversation.getLastMessageTime(),
                unreadCount
            );
        }).toList();
    }

    public List<ChatMessageDTO> listMessages(Long currentUserId, Long conversationId, Long beforeMessageId, int pageSize) {
        ChatConversation conversation = requireConversation(conversationId);
        ensureConversationMember(conversation, currentUserId);
        int safeSize = Math.max(1, Math.min(pageSize, 100));
        List<ChatMessage> messages = beforeMessageId == null
            ? messageRepository.findLatestByConversationId(conversationId, safeSize)
            : messageRepository.findByConversationIdBeforeMessageId(conversationId, beforeMessageId, safeSize);
        return messages.stream()
            .map(message -> new ChatMessageDTO(
                message.getId(),
                message.getConversationId(),
                message.getSenderUserId(),
                message.getReceiverUserId(),
                message.getMessageType() == null ? 0 : message.getMessageType().getCode(),
                message.getContent(),
                message.getExt(),
                message.getRecalled() == null ? 0 : message.getRecalled(),
                message.getCreateTime()
            ))
            .toList();
    }

    @Transactional
    public Long sendTextMessage(Long currentUserId, Long conversationId, String content) {
        if (StrUtil.isBlank(content)) {
            throw Exceptions.BusinessException.of(400, "消息内容不能为空");
        }
        ChatConversation conversation = requireConversation(conversationId);
        ensureCanSend(conversation, currentUserId);
        Long receiverUserId = resolveReceiver(conversation, currentUserId);
        ChatMessage message = new ChatMessage();
        message.setConversationId(conversationId);
        message.setSenderUserId(currentUserId);
        message.setReceiverUserId(receiverUserId);
        message.setMessageType(ChatMessageType.TEXT);
        message.setContent(StrUtil.trim(content));
        message.setExt(null);
        message.setRecalled(0);
        message.setDeleted(0);
        messageRepository.save(message);
        conversation.setLastMessageId(message.getId());
        conversationRepository.save(conversation);
        notifyMessage(receiverUserId, "收到新消息", "您有一条新的沟通消息", message.getId());
        dispatchMessageEventSafely(message.getId(), conversationId, currentUserId, receiverUserId);
        return message.getId();
    }

    @Transactional
    public Long sendResumeCardMessage(Long currentUserId, Long conversationId, Long resumeId) {
        ChatConversation conversation = requireConversation(conversationId);
        ensureCanSend(conversation, currentUserId);
        if (!currentUserId.equals(conversation.getCandidateUserId())) {
            throw new Exceptions.ForbiddenException("仅求职者可发送简历");
        }
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> Exceptions.BusinessException.of(404, "简历不存在"));
        if (!currentUserId.equals(resume.getUserId())) {
            throw new Exceptions.ForbiddenException("无权发送该简历");
        }
        Map<String, Object> ext = new HashMap<>();
        ext.put("resumeId", resume.getId());
        ext.put("fileName", resume.getFileName());
        ext.put("filePath", resume.getFilePath());
        ext.put("sendTime", LocalDateTime.now().format(DATE_TIME_FORMATTER));
        Long receiverUserId = resolveReceiver(conversation, currentUserId);
        ChatMessage message = new ChatMessage();
        message.setConversationId(conversationId);
        message.setSenderUserId(currentUserId);
        message.setReceiverUserId(receiverUserId);
        message.setMessageType(ChatMessageType.RESUME_CARD);
        message.setContent("发送了一份简历");
        message.setExt(JSONUtil.toJsonStr(ext));
        message.setRecalled(0);
        message.setDeleted(0);
        messageRepository.save(message);
        conversation.setLastMessageId(message.getId());
        conversationRepository.save(conversation);
        notifyMessage(receiverUserId, "收到简历", "求职者发送了一份简历", message.getId());
        dispatchMessageEventSafely(message.getId(), conversationId, currentUserId, receiverUserId);
        return message.getId();
    }

    @Transactional
    public Long sendImageMessage(Long currentUserId, Long conversationId, String fileName, byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            throw Exceptions.BusinessException.of(400, "图片内容不能为空");
        }
        ChatConversation conversation = requireConversation(conversationId);
        ensureCanSend(conversation, currentUserId);
        Long receiverUserId = resolveReceiver(conversation, currentUserId);
        String safeName = StrUtil.blankToDefault(fileName, "image.png");
        String storedPath = "chat/image/" + UUID.randomUUID() + "_" + safeName;
        rustFSClient.upload(bytes, storedPath);
        Map<String, Object> ext = new HashMap<>();
        ext.put("fileName", safeName);
        ext.put("filePath", "s3://resumes/" + storedPath);
        ext.put("sendTime", LocalDateTime.now().format(DATE_TIME_FORMATTER));

        ChatMessage message = new ChatMessage();
        message.setConversationId(conversationId);
        message.setSenderUserId(currentUserId);
        message.setReceiverUserId(receiverUserId);
        message.setMessageType(ChatMessageType.IMAGE);
        message.setContent("发送了一张图片");
        message.setExt(JSONUtil.toJsonStr(ext));
        message.setRecalled(0);
        message.setDeleted(0);
        messageRepository.save(message);
        conversation.setLastMessageId(message.getId());
        conversationRepository.save(conversation);
        notifyMessage(receiverUserId, "收到图片", "对方发送了一张图片", message.getId());
        dispatchMessageEventSafely(message.getId(), conversationId, currentUserId, receiverUserId);
        return message.getId();
    }

    @Transactional
    public Long sendInterviewInviteMessage(Long currentUserId, Long conversationId, String interviewTime, String location, String remark) {
        ChatConversation conversation = requireConversation(conversationId);
        ensureCanSend(conversation, currentUserId);
        if (!currentUserId.equals(conversation.getRecruiterUserId())) {
            throw new Exceptions.ForbiddenException("仅岗位负责人可发送面试通知");
        }
        LocalDateTime time = parseInterviewTime(interviewTime);
        Map<String, Object> ext = new HashMap<>();
        ext.put("interviewTime", time.format(DATE_TIME_FORMATTER));
        ext.put("location", StrUtil.blankToDefault(location, ""));
        ext.put("remark", StrUtil.blankToDefault(remark, ""));
        Long receiverUserId = resolveReceiver(conversation, currentUserId);
        ChatMessage message = new ChatMessage();
        message.setConversationId(conversationId);
        message.setSenderUserId(currentUserId);
        message.setReceiverUserId(receiverUserId);
        message.setMessageType(ChatMessageType.INTERVIEW_INVITE_CARD);
        message.setContent("发送了一条面试通知");
        message.setExt(JSONUtil.toJsonStr(ext));
        message.setRecalled(0);
        message.setDeleted(0);
        messageRepository.save(message);
        conversation.setLastMessageId(message.getId());
        conversationRepository.save(conversation);
        notifyMessage(receiverUserId, "收到面试邀请", "招聘方发送了一条面试邀请", message.getId());
        dispatchMessageEventSafely(message.getId(), conversationId, currentUserId, receiverUserId);
        return message.getId();
    }

    @Transactional
    public void markConversationRead(Long currentUserId, Long conversationId, Long readUpToMessageId) {
        if (readUpToMessageId == null) {
            throw Exceptions.BusinessException.of(400, "readUpToMessageId不能为空");
        }
        ChatConversation conversation = requireConversation(conversationId);
        ensureConversationMember(conversation, currentUserId);
        if (currentUserId.equals(conversation.getRecruiterUserId())) {
            Long current = conversation.getRecruiterLastReadMsgId();
            if (current == null || readUpToMessageId > current) {
                conversation.setRecruiterLastReadMsgId(readUpToMessageId);
            }
        } else {
            Long current = conversation.getCandidateLastReadMsgId();
            if (current == null || readUpToMessageId > current) {
                conversation.setCandidateLastReadMsgId(readUpToMessageId);
            }
        }
        conversationRepository.save(conversation);
        dispatchReadReceiptSafely(conversationId, currentUserId, readUpToMessageId);
    }

    public ResumePreviewFile downloadResumeFile(Long currentUserId, Long conversationId, Long resumeId) {
        ChatConversation conversation = requireConversation(conversationId);
        ensureConversationMember(conversation, currentUserId);
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> Exceptions.BusinessException.of(404, "简历不存在"));
        return resumeService.previewResume(resume.getId(), resume.getUserId());
    }

    private ChatConversation requireConversation(Long conversationId) {
        return conversationRepository.findById(conversationId)
            .orElseThrow(() -> Exceptions.BusinessException.of(404, "会话不存在"));
    }

    private void ensureConversationMember(ChatConversation conversation, Long currentUserId) {
        if (!currentUserId.equals(conversation.getCandidateUserId())
            && !currentUserId.equals(conversation.getRecruiterUserId())) {
            throw new Exceptions.ForbiddenException("无权访问该会话");
        }
    }

    private void ensureCanSend(ChatConversation conversation, Long currentUserId) {
        ensureConversationMember(conversation, currentUserId);
        if (conversation.getStatus() != null && conversation.getStatus() == ChatConversation.STATUS_CLOSED) {
            throw Exceptions.BusinessException.of(400, "会话已关闭");
        }
        UserType userType = currentUserType(currentUserId);
        if (userType == UserType.COMPANY) {
            if (!currentUserId.equals(conversation.getRecruiterUserId())) {
                throw new Exceptions.ForbiddenException("仅岗位负责人可操作");
            }
            CompanyStaff staff = companyStaffRepository.findByCompanyIdAndUserId(conversation.getCompanyId(), currentUserId)
                .orElseThrow(() -> new Exceptions.ForbiddenException("企业成员关系不存在"));
            if (!CompanyStaff.STATUS_ACTIVE.equalsIgnoreCase(staff.getStatus())) {
                throw new Exceptions.ForbiddenException("企业成员状态不可用");
            }
        }
    }

    private Long resolveReceiver(ChatConversation conversation, Long senderUserId) {
        if (senderUserId.equals(conversation.getCandidateUserId())) {
            return conversation.getRecruiterUserId();
        }
        return conversation.getCandidateUserId();
    }

    private UserType currentUserType(Long userId) {
        com.graphhire.auth.domain.model.User user = userRepository.findById(userId)
            .orElseThrow(() -> Exceptions.BusinessException.of(401, "登录用户不存在"));
        return user.getUserType();
    }

    private LocalDateTime parseInterviewTime(String interviewTime) {
        if (StrUtil.isBlank(interviewTime)) {
            throw Exceptions.BusinessException.of(400, "面试时间不能为空");
        }
        try {
            return LocalDateTime.parse(interviewTime);
        } catch (Exception ex) {
            throw Exceptions.BusinessException.of(400, "面试时间格式错误");
        }
    }

    private void notifyMessage(Long userId, String title, String content, Long referenceId) {
        notificationAppService.create(userId, NotificationType.INTERVIEW_INVITED, title, content, referenceId);
    }

    private void dispatchMessageEventSafely(Long messageId, Long conversationId, Long senderUserId, Long receiverUserId) {
        if (chatMQProducer == null) {
            return;
        }
        try {
            chatMQProducer.sendMessageCreated(messageId, conversationId, senderUserId, receiverUserId);
        } catch (Exception ignored) {
        }
    }

    private void dispatchReadReceiptSafely(Long conversationId, Long readerUserId, Long readUpToMessageId) {
        if (chatMQProducer == null) {
            return;
        }
        try {
            chatMQProducer.sendReadReceipt(conversationId, readerUserId, readUpToMessageId);
        } catch (Exception ignored) {
        }
    }
}
