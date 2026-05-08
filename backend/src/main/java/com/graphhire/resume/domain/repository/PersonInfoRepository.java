package com.graphhire.resume.domain.repository;

import com.graphhire.resume.domain.model.PersonInfo;

import java.util.List;
import java.util.Optional;

/**
 * 人员信息仓储接口
 * 定义人员信息的查询和持久化操作
 */
public interface PersonInfoRepository {
    /** 根据用户ID查询人员信息 */
    Optional<PersonInfo> findByUserId(Long userId);

    /**
     * 根据用户ID集合批量查询人员信息。
     * 说明：用于匹配结果组装时一次性预加载，避免循环内重复查库。
     */
    List<PersonInfo> findByUserIds(List<Long> userIds);
    /** 保存人员信息 */
    PersonInfo save(PersonInfo personInfo);
}
