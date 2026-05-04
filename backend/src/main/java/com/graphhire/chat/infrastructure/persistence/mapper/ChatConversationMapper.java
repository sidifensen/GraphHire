package com.graphhire.chat.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.chat.infrastructure.persistence.po.ChatConversationPO;
import com.graphhire.chat.infrastructure.persistence.po.ChatConversationViewPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

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
               su_cand.username AS candidateName,
               su_rec.username AS recruiterName,
               c.last_message_id AS lastMessageId,
               m.content AS lastMessageContent,
               m.create_time AS lastMessageTime,
               c.recruiter_last_read_msg_id AS recruiterLastReadMsgId,
               c.candidate_last_read_msg_id AS candidateLastReadMsgId
        FROM chat_conversation c
        LEFT JOIN job j ON j.id = c.job_id
        LEFT JOIN company cp ON cp.id = c.company_id
        LEFT JOIN sys_user su_cand ON su_cand.id = c.candidate_user_id
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
               su_cand.username AS candidateName,
               su_rec.username AS recruiterName,
               c.last_message_id AS lastMessageId,
               m.content AS lastMessageContent,
               m.create_time AS lastMessageTime,
               c.recruiter_last_read_msg_id AS recruiterLastReadMsgId,
               c.candidate_last_read_msg_id AS candidateLastReadMsgId
        FROM chat_conversation c
        LEFT JOIN job j ON j.id = c.job_id
        LEFT JOIN company cp ON cp.id = c.company_id
        LEFT JOIN sys_user su_cand ON su_cand.id = c.candidate_user_id
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
}
