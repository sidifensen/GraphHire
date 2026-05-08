package com.graphhire.resume.domain.repository;

import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.vo.ParseStatus;
import java.util.List;
import java.util.Optional;

/**
 * 简历仓储接口
 * 定义简历的查询和持久化操作
 */
public interface ResumeRepository {
    /** 根据ID查询简历 */
    Optional<Resume> findById(Long id);
    /** 根据用户ID查询简历列表 */
    List<Resume> findByUserId(Long userId);

    /**
     * 根据简历ID集合批量查询简历。
     * 说明：用于匹配列表聚合，减少逐条查询引发的数据库往返。
     */
    List<Resume> findByIds(List<Long> ids);
    /** 根据解析状态查询简历列表 */
    List<Resume> findByParseStatus(ParseStatus parseStatus);
    /** 分页查询简历 */
    com.baomidou.mybatisplus.core.metadata.IPage<Resume> findPage(int page, int size);
    /** 按用户分页查询简历 */
    com.baomidou.mybatisplus.core.metadata.IPage<Resume> findPageByUserId(Long userId, int page, int size);
    /** 保存简历 */
    Resume save(Resume resume);
    /** 删除简历 */
    void delete(Resume resume);
}
