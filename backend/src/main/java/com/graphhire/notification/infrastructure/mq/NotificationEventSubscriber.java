package com.graphhire.notification.infrastructure.mq;

import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.notification.domain.vo.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Subscribes to domain events from other modules and creates notifications.
 * Uses Spring's @EventListener for in-process event handling.
 */
@Component
public class NotificationEventSubscriber {

    private final NotificationAppService notificationService;

    @Autowired
    public NotificationEventSubscriber(NotificationAppService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Handle ResumeParsedEvent - notify user that their resume has been parsed.
     */
    @EventListener
    public void onResumeParsed(Object event) {
        // In real implementation, cast to specific event type and extract data
        // For now, this is a template showing the pattern
        try {
            Class<?> eventClass = event.getClass();
            // Example: ResumeParsedEvent parsedEvent = (ResumeParsedEvent) event;
            // notificationService.create(parsedEvent.getUserId(),
            //     NotificationType.RESUME_PARSED,
            //     "您的简历已解析完成");
        } catch (Exception e) {
            // Log error but don't fail
        }
    }

    /**
     * Handle MatchCompletedEvent - notify relevant users about the match.
     */
    @EventListener
    public void onMatchCompleted(Object event) {
        try {
            Class<?> eventClass = event.getClass();
            // Example: MatchCompletedEvent matchEvent = (MatchCompletedEvent) event;
            // For job poster: notify about new candidate
            // notificationService.create(matchEvent.getJobPosterId(),
            //     NotificationType.NEW_CANDIDATE,
            //     "有新的候选人匹配您的职位");
            // For candidate: notify about match
            // notificationService.create(matchEvent.getCandidateId(),
            //     NotificationType.MATCH_COMPLETED,
            //     "您有新的职位匹配");
        } catch (Exception e) {
            // Log error but don't fail
        }
    }

    /**
     * Handle JobAppliedEvent - notify employer about new application.
     */
    @EventListener
    public void onJobApplied(Object event) {
        try {
            // Example: JobAppliedEvent appliedEvent = (JobAppliedEvent) event;
            // notificationService.create(appliedEvent.getEmployerId(),
            //     NotificationType.JOB_APPLIED,
            //     "有新的求职者申请了您的职位");
        } catch (Exception e) {
            // Log error but don't fail
        }
    }

    /**
     * Handle InterviewInvitationEvent - notify candidate about interview.
     */
    @EventListener
    public void onInterviewInvitation(Object event) {
        try {
            // Example: InterviewInvitationEvent invitationEvent = (InterviewInvitationEvent) event;
            // notificationService.create(invitationEvent.getCandidateId(),
            //     NotificationType.INTERVIEW_INVITATION,
            //     "您收到了一个新的面试邀请");
        } catch (Exception e) {
            // Log error but don't fail
        }
    }

    /**
     * Handle ApplicationViewedEvent - notify candidate that their application was viewed.
     */
    @EventListener
    public void onApplicationViewed(Object event) {
        try {
            // Example: ApplicationViewedEvent viewedEvent = (ApplicationViewedEvent) event;
            // notificationService.create(viewedEvent.getCandidateId(),
            //     NotificationType.APPLICATION_VIEWED,
            //     "您的申请已被查看");
        } catch (Exception e) {
            // Log error but don't fail
        }
    }
}
