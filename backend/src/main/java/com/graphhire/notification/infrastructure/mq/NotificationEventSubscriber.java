package com.graphhire.notification.infrastructure.mq;

import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.notification.domain.vo.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 通知事件订阅器
 *
 * 【模块说明】订阅其他领域发布的业务事件，触发通知创建。实现模块间的解耦。
 * 【事件来源】通过 Spring @EventListener 监听以下事件：
 * - ResumeParsedEvent：简历解析完成
 * - MatchCompletedEvent：匹配完成
 * - JobAppliedEvent：职位申请
 * - InterviewInvitationEvent：面试邀请
 * - ApplicationViewedEvent：申请被查看
 */
@Component
public class NotificationEventSubscriber {

    private final NotificationAppService notificationService;

    @Autowired
    public NotificationEventSubscriber(NotificationAppService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * 处理简历解析完成事件
     * 【功能说明】当用户简历解析完成后，发送通知告知用户。
     * 【业务步骤】
     * 步骤1：从事件中提取用户ID和解析结果
     * 步骤2：调用通知服务创建通知
     */
    @EventListener
    public void onResumeParsed(Object event) {
        // 实际实现中，需要转换为具体事件类型并提取数据
        // 当前为模板代码，展示模式
        try {
            Class<?> eventClass = event.getClass();
            // 示例: ResumeParsedEvent parsedEvent = (ResumeParsedEvent) event;
            // notificationService.create(parsedEvent.getUserId(),
            //     NotificationType.RESUME_PARSED,
            //     "您的简历已解析完成");
        } catch (Exception e) {
            // 记录错误但不让异常中断流程
        }
    }

    /**
     * 处理匹配完成事件
     * 【功能说明】当人岗匹配完成后，分别通知职位发布者（新候选人）和求职者（匹配结果）。
     * 【业务步骤】
     * 步骤1：从事件中提取职位发布者ID和求职者ID
     * 步骤2：通知职位发布者有新候选人
     * 步骤3：通知求职者有新的职位匹配
     */
    @EventListener
    public void onMatchCompleted(Object event) {
        try {
            Class<?> eventClass = event.getClass();
            // 示例: MatchCompletedEvent matchEvent = (MatchCompletedEvent) event;
            // 通知职位发布者有新候选人
            // notificationService.create(matchEvent.getJobPosterId(),
            //     NotificationType.NEW_CANDIDATE,
            //     "有新的候选人匹配您的职位");
            // 通知求职者有新的职位匹配
            // notificationService.create(matchEvent.getCandidateId(),
            //     NotificationType.MATCH_COMPLETED,
            //     "您有新的职位匹配");
        } catch (Exception e) {
            // 记录错误但不让异常中断流程
        }
    }

    /**
     * 处理职位申请事件
     * 【功能说明】当求职者申请职位后，通知雇主有新申请。
     * 【业务步骤】
     * 步骤1：从事件中提取雇主ID
     * 步骤2：创建申请通知
     */
    @EventListener
    public void onJobApplied(Object event) {
        try {
            // 示例: JobAppliedEvent appliedEvent = (JobAppliedEvent) event;
            // notificationService.create(appliedEvent.getEmployerId(),
            //     NotificationType.JOB_APPLIED,
            //     "有新的求职者申请了您的职位");
        } catch (Exception e) {
            // 记录错误但不让异常中断流程
        }
    }

    /**
     * 处理面试邀请事件
     * 【功能说明】当雇主向求职者发送面试邀请时，通知候选人。
     * 【业务步骤】
     * 步骤1：从事件中提取候选人ID
     * 步骤2：创建面试邀请通知
     */
    @EventListener
    public void onInterviewInvitation(Object event) {
        try {
            // 示例: InterviewInvitationEvent invitationEvent = (InterviewInvitationEvent) event;
            // notificationService.create(invitationEvent.getCandidateId(),
            //     NotificationType.INTERVIEW_INVITATION,
            //     "您收到了一个新的面试邀请");
        } catch (Exception e) {
            // 记录错误但不让异常中断流程
        }
    }

    /**
     * 处理申请被查看事件
     * 【功能说明】当雇主查看求职者的申请时，通知求职者申请已被查看。
     * 【业务步骤】
     * 步骤1：从事件中提取求职者ID
     * 步骤2：创建申请被查看通知
     */
    @EventListener
    public void onApplicationViewed(Object event) {
        try {
            // 示例: ApplicationViewedEvent viewedEvent = (ApplicationViewedEvent) event;
            // notificationService.create(viewedEvent.getCandidateId(),
            //     NotificationType.APPLICATION_VIEWED,
            //     "您的申请已被查看");
        } catch (Exception e) {
            // 记录错误但不让异常中断流程
        }
    }
}
