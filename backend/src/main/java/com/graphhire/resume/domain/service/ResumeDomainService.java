package com.graphhire.resume.domain.service;

import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.vo.ParseStatus;
import org.springframework.stereotype.Service;

/**
 * 简历领域服务
 *
 * 【模块说明】提供简历领域相关的业务判断逻辑，包括可解析性判断、匹配触发判断等。
 *
 * 【方法概览】
 * - isParsable()：判断简历是否可被解析
 * - shouldTriggerMatch()：判断简历是否应触发匹配流程
 */
@Service
public class ResumeDomainService {

    /**
     * 是否可以解析
     * 【功能说明】判断简历是否满足解析条件。
     * 【业务规则】仅在 PENDING（待解析）或 FAILED（解析失败）状态下可重新解析。
     * @param resume 简历领域模型
     * @return true 表示可以解析，false 表示不能解析
     */
    public boolean isParsable(Resume resume) {
        return resume.getStatus() == ParseStatus.PENDING ||
               resume.getStatus() == ParseStatus.FAILED;
    }

    /**
     * 是否应触发匹配
     * 【功能说明】判断简历是否应触发匹配流程。
     * 【业务规则】仅在 SUCCESS（解析成功）状态下才进行人岗匹配。
     * @param resume 简历领域模型
     * @return true 表示应触发匹配，false 表示不触发
     */
    public boolean shouldTriggerMatch(Resume resume) {
        return resume.getStatus() == ParseStatus.SUCCESS;
    }
}
