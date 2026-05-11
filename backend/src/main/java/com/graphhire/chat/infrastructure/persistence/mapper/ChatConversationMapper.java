package com.graphhire.chat.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.chat.infrastructure.persistence.po.ChatConversationPO;
import com.graphhire.chat.infrastructure.persistence.po.ChatConversationViewPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface ChatConversationMapper extends BaseMapper<ChatConversationPO> {
    @Select("""
        SELECT c.id AS conversationId,
               c.job_id AS jobId,
               j.title AS jobTitle,
               c.company_id AS companyId,
               cp.name AS companyName,
               c.recruiter_user_id AS recruiterUserId,
               c.candidate_user_id AS candidateUserId,
               COALESCE(NULLIF(pi.real_name, ''), su_cand.username) AS candidateName,
               COALESCE(NULLIF(su_cand.username, ''), pi.email) AS candidateEmail,
               pi.age AS candidateAge,
               pi.gender AS candidateGender,
               pi.education AS candidateEducation,
               su_rec.username AS recruiterName,
               c.last_message_id AS lastMessageId,
               m.content AS lastMessageContent,
               m.create_time AS lastMessageTime,
               c.recruiter_last_read_msg_id AS recruiterLastReadMsgId,
               c.candidate_last_read_msg_id AS candidateLastReadMsgId,
               (
                   SELECT COUNT(1)
                   FROM chat_message unread
                   WHERE unread.conversation_id = c.id
                     AND unread.receiver_user_id = #{recruiterUserId}
                     AND unread.deleted = 0
                     AND unread.id > COALESCE(c.recruiter_last_read_msg_id, 0)
               ) AS unreadCount
        FROM chat_conversation c
        LEFT JOIN job j ON j.id = c.job_id
        LEFT JOIN company cp ON cp.id = c.company_id
        LEFT JOIN sys_user su_cand ON su_cand.id = c.candidate_user_id
        LEFT JOIN person_info pi ON pi.user_id = c.candidate_user_id AND pi.deleted = 0
        LEFT JOIN sys_user su_rec ON su_rec.id = c.recruiter_user_id
        LEFT JOIN chat_message m ON m.id = c.last_message_id
        WHERE c.recruiter_user_id = #{recruiterUserId}
          AND c.deleted = 0
        ORDER BY c.update_time DESC, c.id DESC
        """)
    List<ChatConversationViewPO> listByRecruiterUserId(@Param("recruiterUserId") Long recruiterUserId);

    @Select("""
        SELECT c.id AS conversationId,
               c.job_id AS jobId,
               j.title AS jobTitle,
               c.company_id AS companyId,
               cp.name AS companyName,
               c.recruiter_user_id AS recruiterUserId,
               c.candidate_user_id AS candidateUserId,
               COALESCE(NULLIF(pi.real_name, ''), su_cand.username) AS candidateName,
               COALESCE(NULLIF(su_cand.username, ''), pi.email) AS candidateEmail,
               pi.age AS candidateAge,
               pi.gender AS candidateGender,
               pi.education AS candidateEducation,
               su_rec.username AS recruiterName,
               c.last_message_id AS lastMessageId,
               m.content AS lastMessageContent,
               m.create_time AS lastMessageTime,
               c.recruiter_last_read_msg_id AS recruiterLastReadMsgId,
               c.candidate_last_read_msg_id AS candidateLastReadMsgId,
               (
                   SELECT COUNT(1)
                   FROM chat_message unread
                   WHERE unread.conversation_id = c.id
                     AND unread.receiver_user_id = #{candidateUserId}
                     AND unread.deleted = 0
                     AND unread.id > COALESCE(c.candidate_last_read_msg_id, 0)
               ) AS unreadCount
        FROM chat_conversation c
        LEFT JOIN job j ON j.id = c.job_id
        LEFT JOIN company cp ON cp.id = c.company_id
        LEFT JOIN sys_user su_cand ON su_cand.id = c.candidate_user_id
        LEFT JOIN person_info pi ON pi.user_id = c.candidate_user_id AND pi.deleted = 0
        LEFT JOIN sys_user su_rec ON su_rec.id = c.recruiter_user_id
        LEFT JOIN chat_message m ON m.id = c.last_message_id
        WHERE c.candidate_user_id = #{candidateUserId}
          AND c.deleted = 0
        ORDER BY c.update_time DESC, c.id DESC
        """)
    List<ChatConversationViewPO> listByCandidateUserId(@Param("candidateUserId") Long candidateUserId);

    @Select("""
        SELECT COUNT(1)
        FROM chat_message m
        WHERE m.conversation_id = #{conversationId}
          AND m.receiver_user_id = #{currentUserId}
          AND m.deleted = 0
          AND m.id > COALESCE(#{lastReadId,jdbcType=BIGINT}, 0)
        """)
    long countUnread(@Param("conversationId") Long conversationId,
                     @Param("currentUserId") Long currentUserId,
                     @Param("lastReadId") Long lastReadId);

    /**
     * 按招聘者和岗位集合聚合会话数量。
     * 说明：用于企业看板与岗位列表批量统计，避免逐岗位查询。
     */
    @Select("""
        <script>
        SELECT job_id AS jobId, COUNT(1) AS conversationCount
        FROM chat_conversation
        WHERE recruiter_user_id = #{recruiterUserId}
          AND deleted = 0
          AND job_id IN
          <foreach collection="jobIds" item="jobId" open="(" separator="," close=")">
            #{jobId}
          </foreach>
        GROUP BY job_id
        </script>
        """)
    List<Map<String, Object>> countByRecruiterAndJobIds(@Param("recruiterUserId") Long recruiterUserId,
                                                        @Param("jobIds") List<Long> jobIds);
}
