package com.graphhire.auth.infrastructure.mail;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * 邮件服务
 * 负责发送验证码邮件，支持纯文本和 HTML 格式
 */
@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromMail;

    @Value("${app.mail.send-timeout-ms:10000}")
    private long sendTimeoutMs;

    /**
     * 发送验证码邮件（纯文本）
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param content 邮件内容
     */
    public void sendVerifyCodeMail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromMail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        sendWithTimeout(() -> mailSender.send(message));
    }

    /**
     * 发送 HTML 格式验证码邮件
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param htmlContent HTML 内容
     */
    public void sendHtmlMail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromMail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            sendWithTimeout(() -> mailSender.send(message));
        } catch (MessagingException e) {
            throw new RuntimeException("发送HTML邮件失败", e);
        }
    }

    private void sendWithTimeout(Runnable sender) {
        CompletableFuture<Void> future = CompletableFuture.runAsync(sender);
        try {
            future.get(sendTimeoutMs, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw new MailSendException("邮件发送超时", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new MailSendException("邮件发送被中断", e);
        } catch (ExecutionException e) {
            Throwable cause = e.getCause() != null ? e.getCause() : e;
            if (cause instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new MailSendException("邮件发送失败", cause);
        }
    }
}
