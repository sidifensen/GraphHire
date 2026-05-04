package com.graphhire.chat.application.service;

import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.chat.domain.model.ChatConversation;
import com.graphhire.chat.domain.model.ChatMessage;
import com.graphhire.chat.domain.repository.ChatConversationRepository;
import com.graphhire.chat.domain.repository.ChatMessageRepository;
import com.graphhire.chat.infrastructure.mq.ChatMQProducer;
import com.graphhire.chat.infrastructure.persistence.repository.ChatConversationRepositoryImpl;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatAppServiceTest {

    @Mock
    private ChatConversationRepository conversationRepository;
    @Mock
    private ChatConversationRepositoryImpl conversationViewRepository;
    @Mock
    private ChatMessageRepository messageRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private CompanyStaffRepository companyStaffRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private NotificationAppService notificationAppService;
    @Mock
    private ChatMQProducer chatMQProducer;
    @Mock
    private RustFSClient rustFSClient;

    @InjectMocks
    private ChatAppService chatAppService;

    @Test
    @DisplayName("求职者可创建会话")
    void startConversationAsPerson_shouldCreateConversation() {
        Job job = new Job();
        job.setId(11L);
        job.setCompanyId(22L);
        job.setOwnerUserId(33L);

        when(jobRepository.findById(11L)).thenReturn(Optional.of(job));
        when(conversationRepository.findByJobIdAndCandidateUserId(11L, 44L)).thenReturn(Optional.empty());
        when(conversationRepository.save(any(ChatConversation.class))).thenAnswer(invocation -> {
            ChatConversation c = invocation.getArgument(0);
            c.setId(99L);
            return c;
        });

        Long conversationId = chatAppService.startConversationAsPerson(44L, 11L);

        assertEquals(99L, conversationId);
    }

    @Test
    @DisplayName("企业非岗位负责人发送消息会被拒绝")
    void sendTextMessage_shouldRejectCompanyUserWhenNotOwner() {
        ChatConversation conversation = new ChatConversation();
        conversation.setId(88L);
        conversation.setRecruiterUserId(10L);
        conversation.setCandidateUserId(20L);
        conversation.setCompanyId(1L);
        conversation.setStatus(ChatConversation.STATUS_ACTIVE);

        when(conversationRepository.findById(88L)).thenReturn(Optional.of(conversation));

        assertThrows(RuntimeException.class, () -> chatAppService.sendTextMessage(11L, 88L, "hello"));
        verify(messageRepository, never()).save(any(ChatMessage.class));
    }

    @Test
    @DisplayName("求职者发送简历消息成功")
    void sendResumeCardMessage_shouldSuccessForCandidateOwnerResume() {
        ChatConversation conversation = new ChatConversation();
        conversation.setId(88L);
        conversation.setRecruiterUserId(10L);
        conversation.setCandidateUserId(20L);
        conversation.setCompanyId(1L);
        conversation.setStatus(ChatConversation.STATUS_ACTIVE);

        User personUser = new User();
        personUser.setId(20L);
        personUser.setUserType(UserType.PERSON);

        Resume resume = new Resume();
        resume.setId(100L);
        resume.setUserId(20L);
        resume.setFileName("resume.pdf");
        resume.setFilePath("/resume/path");

        when(conversationRepository.findById(88L)).thenReturn(Optional.of(conversation));
        when(userRepository.findById(20L)).thenReturn(Optional.of(personUser));
        when(resumeRepository.findById(100L)).thenReturn(Optional.of(resume));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage message = invocation.getArgument(0);
            message.setId(101L);
            return message;
        });
        when(conversationRepository.save(any(ChatConversation.class))).thenReturn(conversation);

        Long messageId = chatAppService.sendResumeCardMessage(20L, 88L, 100L);

        assertEquals(101L, messageId);
        verify(messageRepository).save(any(ChatMessage.class));
    }

    @Test
    @DisplayName("企业负责人发送面试邀请成功")
    void sendInterviewInviteMessage_shouldSuccessForOwner() {
        ChatConversation conversation = new ChatConversation();
        conversation.setId(88L);
        conversation.setRecruiterUserId(10L);
        conversation.setCandidateUserId(20L);
        conversation.setCompanyId(1L);
        conversation.setStatus(ChatConversation.STATUS_ACTIVE);

        User companyUser = new User();
        companyUser.setId(10L);
        companyUser.setUserType(UserType.COMPANY);

        CompanyStaff staff = new CompanyStaff();
        staff.setCompanyId(1L);
        staff.setUserId(10L);
        staff.setStatus(CompanyStaff.STATUS_ACTIVE);

        when(conversationRepository.findById(88L)).thenReturn(Optional.of(conversation));
        when(userRepository.findById(10L)).thenReturn(Optional.of(companyUser));
        when(companyStaffRepository.findByCompanyIdAndUserId(1L, 10L)).thenReturn(Optional.of(staff));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage message = invocation.getArgument(0);
            message.setId(201L);
            return message;
        });
        when(conversationRepository.save(any(ChatConversation.class))).thenReturn(conversation);

        Long messageId = chatAppService.sendInterviewInviteMessage(
            10L,
            88L,
            "2026-05-05T10:00:00",
            "线上会议",
            "请提前准备项目介绍"
        );

        assertEquals(201L, messageId);
    }

    @Test
    @DisplayName("标记已读更新游标")
    void markConversationRead_shouldUpdateCursor() {
        ChatConversation conversation = new ChatConversation();
        conversation.setId(88L);
        conversation.setRecruiterUserId(10L);
        conversation.setCandidateUserId(20L);
        conversation.setCandidateLastReadMsgId(3L);
        conversation.setStatus(ChatConversation.STATUS_ACTIVE);

        when(conversationRepository.findById(88L)).thenReturn(Optional.of(conversation));
        when(conversationRepository.save(any(ChatConversation.class))).thenReturn(conversation);

        chatAppService.markConversationRead(20L, 88L, 9L);
        assertEquals(9L, conversation.getCandidateLastReadMsgId());
    }
}
