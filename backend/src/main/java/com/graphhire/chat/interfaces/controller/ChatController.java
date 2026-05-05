package com.graphhire.chat.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.chat.application.service.ChatAppService;
import com.graphhire.chat.application.service.dto.ChatConversationSummaryDTO;
import com.graphhire.chat.application.service.dto.ChatMarkReadRequest;
import com.graphhire.chat.application.service.dto.ChatMessageDTO;
import com.graphhire.chat.application.service.dto.ChatSendInterviewInviteRequest;
import com.graphhire.chat.application.service.dto.ChatSendResumeMessageRequest;
import com.graphhire.chat.application.service.dto.ChatSendTextMessageRequest;
import com.graphhire.chat.application.service.dto.ChatStartConversationRequest;
import com.graphhire.common.vo.Result;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.resume.application.service.dto.ResumePreviewFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatAppService chatAppService;
    @Autowired
    private NotificationAppService notificationAppService;

    @GetMapping("/conversations")
    public Result<List<ChatConversationSummaryDTO>> listConversations() {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        return Result.success(chatAppService.listConversations(currentUserId));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public Result<List<ChatMessageDTO>> listMessages(@PathVariable Long conversationId,
                                                     @RequestParam(required = false) Long beforeMessageId,
                                                     @RequestParam(defaultValue = "30") Integer pageSize) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        return Result.success(chatAppService.listMessages(currentUserId, conversationId, beforeMessageId, pageSize));
    }

    @PostMapping("/conversations/start")
    public Result<Map<String, Long>> startConversation(@RequestBody ChatStartConversationRequest request) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        Long conversationId = chatAppService.startConversationAsPerson(currentUserId, request.getJobId());
        return Result.success(Map.of("conversationId", conversationId));
    }

    @PostMapping("/messages/text")
    public Result<Map<String, Long>> sendTextMessage(@RequestBody ChatSendTextMessageRequest request) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        Long messageId = chatAppService.sendTextMessage(currentUserId, request.getConversationId(), request.getContent());
        return Result.success(Map.of("messageId", messageId));
    }

    @PostMapping("/messages/resume")
    public Result<Map<String, Long>> sendResumeCard(@RequestBody ChatSendResumeMessageRequest request) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        Long messageId = chatAppService.sendResumeCardMessage(currentUserId, request.getConversationId(), request.getResumeId());
        return Result.success(Map.of("messageId", messageId));
    }

    @PostMapping("/messages/interview-invite")
    public Result<Map<String, Long>> sendInterviewInvite(@RequestBody ChatSendInterviewInviteRequest request) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        Long messageId = chatAppService.sendInterviewInviteMessage(
            currentUserId,
            request.getConversationId(),
            request.getInterviewTime(),
            request.getLocation(),
            request.getRemark()
        );
        return Result.success(Map.of("messageId", messageId));
    }

    @PostMapping(value = "/messages/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Map<String, Long>> sendImageMessage(@RequestPart("file") MultipartFile file,
                                                      @RequestParam("conversationId") Long conversationId) throws Exception {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        Long messageId = chatAppService.sendImageMessage(currentUserId, conversationId, file.getOriginalFilename(), file.getBytes());
        return Result.success(Map.of("messageId", messageId));
    }

    @PostMapping("/messages/read")
    public Result<Void> markRead(@RequestBody ChatMarkReadRequest request) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        chatAppService.markConversationRead(currentUserId, request.getConversationId(), request.getReadUpToMessageId());
        notificationAppService.markAllAsRead(currentUserId);
        return Result.success();
    }

    @GetMapping("/conversations/{conversationId}/resume/{resumeId}/download")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long conversationId, @PathVariable Long resumeId) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        ResumePreviewFile file = chatAppService.downloadResumeFile(currentUserId, conversationId, resumeId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));
        headers.setContentDisposition(ContentDisposition.attachment()
            .filename(file.getFileName(), StandardCharsets.UTF_8)
            .build());
        headers.setCacheControl(CacheControl.noCache().getHeaderValue());

        return ResponseEntity.ok()
            .headers(headers)
            .body(file.getContent());
    }

    @GetMapping("/conversations/{conversationId}/images/{messageId}/preview")
    public ResponseEntity<byte[]> previewImage(@PathVariable Long conversationId, @PathVariable Long messageId) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        ResumePreviewFile file = chatAppService.previewImageFile(currentUserId, conversationId, messageId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));
        headers.setCacheControl(CacheControl.noCache().getHeaderValue());

        return ResponseEntity.ok()
            .headers(headers)
            .body(file.getContent());
    }
}
